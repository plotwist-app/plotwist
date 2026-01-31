//
//  SeasonDetailView.swift
//  Plotwist
//

import SwiftUI

struct SeasonDetailView: View {
  let seriesId: Int
  let seriesName: String
  let season: Season

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var seasonDetails: SeasonDetails?
  @State private var isLoading = true
  @State private var userReview: Review?
  @State private var isLoadingUserReview = false
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var hasReviews = false
  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil

  // Episodes watched state (shared with header)
  @State private var watchedEpisodes: [UserEpisode] = []
  @State private var loadingEpisodeIds: Set<Int> = []


  private let scrollThreshold: CGFloat = 20
  private let navigationHeaderHeight: CGFloat = 64

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  private var episodes: [Episode] {
    seasonDetails?.episodes ?? []
  }

  private var watchedCount: Int {
    episodes.filter { episode in
      watchedEpisodes.contains { $0.episodeNumber == episode.episodeNumber && $0.seasonNumber == season.seasonNumber }
    }.count
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        LazyVStack(alignment: .leading, spacing: 0, pinnedViews: [.sectionHeaders]) {
          // Main content section (not pinned)
          Section {
            // Header with poster and info (adjusted for safeAreaInset)
            SeasonHeaderView(
              season: season,
              scrollOffset: $scrollOffset,
              initialScrollOffset: $initialScrollOffset,
              topPadding: 24 // Reduced since safeAreaInset handles nav header
            )

            // Review Button
            if AuthService.shared.isAuthenticated {
              ReviewButton(
                hasReview: userReview != nil,
                isLoading: isLoadingUserReview,
                action: { showReviewSheet = true }
              )
              .padding(.horizontal, 24)
              .padding(.top, 24)
            }

            // Overview
            if let overview = seasonDetails?.overview ?? season.overview, !overview.isEmpty {
              Text(overview)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
                .lineSpacing(6)
                .padding(.horizontal, 24)
                .padding(.top, 20)
            }

            // Divider before reviews
            if hasReviews {
              sectionDivider
            }

            // Reviews Section
            SeasonReviewSectionView(
              seriesId: seriesId,
              seasonNumber: season.seasonNumber,
              refreshId: reviewsRefreshId,
              onEmptyStateTapped: {
                if AuthService.shared.isAuthenticated {
                  showReviewSheet = true
                }
              },
              onContentLoaded: { hasContent in
                hasReviews = hasContent
              }
            )

            // Divider before episodes (reduced bottom spacing)
            if !episodes.isEmpty {
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(height: 1)
                .padding(.horizontal, 24)
                .padding(.top, 24)
                .padding(.bottom, 8)
            }
          }

          // Episodes Section with pinned header
          if !episodes.isEmpty {
            Section {
            EpisodesListView(
              seriesId: seriesId,
              seasonNumber: season.seasonNumber,
              seasonName: season.name,
              seasonPosterPath: season.posterPath,
              episodes: episodes,
              watchedEpisodes: $watchedEpisodes,
              loadingEpisodeIds: $loadingEpisodeIds
            )

              Spacer()
                .frame(height: 80)
            } header: {
              EpisodesHeaderView(
                episodesCount: episodes.count,
                watchedCount: watchedCount
              )
            }
            .onChange(of: watchedCount) { oldValue, newValue in
              // Haptic feedback when all episodes are watched
              if newValue == episodes.count && oldValue < episodes.count && episodes.count > 0 {
                let generator = UINotificationFeedbackGenerator()
                generator.notificationOccurred(.success)
              }
            }
          } else {
            Spacer()
              .frame(height: 80)
          }
        }
      }
      .coordinateSpace(name: "episodesScroll")
      .safeAreaInset(edge: .top, spacing: 0) {
        // Reserve space for navigation header so pinned headers appear below it
        Color.clear
          .frame(height: navigationHeaderHeight)
      }

      // Navigation Header
      navigationHeader
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(
        mediaId: seriesId,
        mediaType: "tv",
        seasonNumber: season.seasonNumber,
        existingReview: userReview,
        onSaved: {
          Task {
            await loadUserReview()
          }
          reviewsRefreshId = UUID()
        },
        onDeleted: {
          userReview = nil
          reviewsRefreshId = UUID()
        }
      )
    }
    .task {
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
      }
      await loadSeasonDetails()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
        await loadWatchedEpisodes()
      }
    }
  }

  // MARK: - Section Divider
  private var sectionDivider: some View {
    Rectangle()
      .fill(Color.appBorderAdaptive.opacity(0.5))
      .frame(height: 1)
      .padding(.horizontal, 24)
      .padding(.vertical, 24)
  }

  // MARK: - Navigation Header
  private var navigationHeader: some View {
    VStack {
      HStack {
        Button {
          dismiss()
        } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 40, height: 40)
        }

        Spacer()

        Text(seriesName)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(1)

        Spacer()

        Color.clear
          .frame(width: 40, height: 40)
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 12)
      .background(Color.appBackgroundAdaptive)
      .overlay(
        Rectangle()
          .fill(Color.appBorderAdaptive)
          .frame(height: 1)
          .opacity(isScrolled ? 1 : 0),
        alignment: .bottom
      )
      .animation(.easeInOut(duration: 0.2), value: isScrolled)

      Spacer()
    }
  }

  // MARK: - Load Season Details
  private func loadSeasonDetails() async {
    isLoading = true
    defer { isLoading = false }

    do {
      seasonDetails = try await TMDBService.shared.getSeasonDetails(
        seriesId: seriesId,
        seasonNumber: season.seasonNumber,
        language: Language.current.rawValue
      )
    } catch {
      seasonDetails = nil
    }
  }

  // MARK: - Load User Review
  private func loadUserReview() async {
    isLoadingUserReview = true
    defer { isLoadingUserReview = false }

    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: seriesId,
        mediaType: "TV_SHOW",
        seasonNumber: season.seasonNumber
      )
    } catch {
      userReview = nil
    }
  }

  // MARK: - Load Watched Episodes
  private func loadWatchedEpisodes() async {
    do {
      watchedEpisodes = try await UserEpisodeService.shared.getWatchedEpisodes(tmdbId: seriesId)
    } catch {
      watchedEpisodes = []
    }
  }
}

// MARK: - Episodes Header View (Sticky)
struct EpisodesHeaderView: View {
  let episodesCount: Int
  let watchedCount: Int

  @State private var isPinned = false
  
  // Approximate pinned position: safe area (~50) + nav header (64) + small buffer
  private let pinnedPositionThreshold: CGFloat = 130

  var body: some View {
    VStack(spacing: 0) {
      VStack(spacing: 12) {
        HStack {
          Text(L10n.current.episodes)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          if AuthService.shared.isAuthenticated {
            Text(L10n.current.episodesWatchedCount
              .replacingOccurrences(of: "%d", with: "\(watchedCount)")
              .replacingOccurrences(of: "%total", with: "\(episodesCount)")
            )
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
          }
        }

        if AuthService.shared.isAuthenticated && episodesCount > 0 {
          SegmentedProgressBar(
            totalSegments: episodesCount,
            filledSegments: watchedCount
          )
        }
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 12)

      // Bottom border - only when pinned
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1)
        .opacity(isPinned ? 1 : 0)
    }
    .background(Color.appBackgroundAdaptive)
    .background(
      GeometryReader { geo -> Color in
        DispatchQueue.main.async {
          let minY = geo.frame(in: .global).minY
          // Header is pinned when it's at the expected pinned position (top of scroll area)
          let newPinned = minY <= pinnedPositionThreshold
          if newPinned != isPinned {
            isPinned = newPinned
          }
        }
        return Color.clear
      }
    )
    .animation(.easeInOut(duration: 0.15), value: isPinned)
  }
}

// MARK: - Segmented Progress Bar
struct SegmentedProgressBar: View {
  let totalSegments: Int
  let filledSegments: Int
  
  private let segmentHeight: CGFloat = 6
  private let segmentSpacing: CGFloat = 2
  
  var body: some View {
    GeometryReader { geometry in
      let availableWidth = geometry.size.width - (CGFloat(totalSegments - 1) * segmentSpacing)
      let segmentWidth = availableWidth / CGFloat(totalSegments)
      
      HStack(spacing: segmentSpacing) {
        ForEach(0..<totalSegments, id: \.self) { index in
          RoundedRectangle(cornerRadius: 2)
            .fill(index < filledSegments ? Color.green : Color.appBorderAdaptive)
            .frame(width: segmentWidth, height: segmentHeight)
            .animation(.easeInOut(duration: 0.2), value: filledSegments)
        }
      }
    }
    .frame(height: segmentHeight)
  }
}

// MARK: - Episodes List View
struct EpisodesListView: View {
  let seriesId: Int
  let seasonNumber: Int
  let seasonName: String
  let seasonPosterPath: String?
  let episodes: [Episode]
  @Binding var watchedEpisodes: [UserEpisode]
  @Binding var loadingEpisodeIds: Set<Int>

  private func isEpisodeWatched(_ episode: Episode) -> Bool {
    watchedEpisodes.contains { $0.episodeNumber == episode.episodeNumber && $0.seasonNumber == seasonNumber }
  }

  private func watchedEpisodeId(for episode: Episode) -> String? {
    watchedEpisodes.first { $0.episodeNumber == episode.episodeNumber && $0.seasonNumber == seasonNumber }?.id
  }

  var body: some View {
    VStack(spacing: 16) {
      ForEach(episodes) { episode in
        NavigationLink(destination: EpisodeDetailView(
          seriesId: seriesId,
          seasonName: seasonName,
          seasonPosterPath: seasonPosterPath,
          episode: episode
        )) {
          EpisodeRowView(
            episode: episode,
            isWatched: isEpisodeWatched(episode),
            isLoading: loadingEpisodeIds.contains(episode.episodeNumber),
            onToggleWatched: {
              Task {
                await toggleWatched(episode)
              }
            }
          )
        }
        .buttonStyle(.plain)
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  private func toggleWatched(_ episode: Episode) async {
    loadingEpisodeIds.insert(episode.episodeNumber)
    defer { loadingEpisodeIds.remove(episode.episodeNumber) }

    if let watchedId = watchedEpisodeId(for: episode) {
      do {
        try await UserEpisodeService.shared.unmarkAsWatched(id: watchedId, tmdbId: seriesId)
        watchedEpisodes.removeAll { $0.id == watchedId }
      } catch {
        print("Error unmarking episode: \(error)")
      }
    } else {
      do {
        let userEpisode = try await UserEpisodeService.shared.markAsWatched(
          tmdbId: seriesId,
          seasonNumber: seasonNumber,
          episodeNumber: episode.episodeNumber,
          runtime: episode.runtime
        )
        watchedEpisodes.append(userEpisode)
      } catch {
        print("Error marking episode: \(error)")
      }
    }
  }
}

// MARK: - Season Header View
struct SeasonHeaderView: View {
  let season: Season
  @Binding var scrollOffset: CGFloat
  @Binding var initialScrollOffset: CGFloat?
  var topPadding: CGFloat = 80

  private var formattedAirDate: String? {
    guard let airDate = season.airDate else { return nil }
    let inputFormatter = DateFormatter()
    inputFormatter.dateFormat = "yyyy-MM-dd"
    guard let date = inputFormatter.date(from: airDate) else { return nil }
    
    let outputFormatter = DateFormatter()
    outputFormatter.dateFormat = "d 'de' MMMM 'de' yyyy"
    outputFormatter.locale = Locale(identifier: Language.current.rawValue)
    return outputFormatter.string(from: date)
  }

  var body: some View {
    HStack(alignment: .bottom, spacing: 16) {
      // Poster
      CachedAsyncImage(url: season.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
          .overlay(
            ProgressView()
              .scaleEffect(0.8)
          )
      }
      .frame(width: 120, height: 180)
      .clipShape(RoundedRectangle(cornerRadius: 12))
      .posterBorder(cornerRadius: 12)
      .posterShadow()

      // Info
      VStack(alignment: .leading, spacing: 4) {
        if let airDate = formattedAirDate {
          Text(airDate)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        Text(season.name)
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.bottom, 8)

      Spacer()
    }
    .padding(.horizontal, 24)
    .padding(.top, topPadding)
    .background(
      GeometryReader { geo -> Color in
        DispatchQueue.main.async {
          let offset = geo.frame(in: .global).minY
          if initialScrollOffset == nil {
            initialScrollOffset = offset
          }
          scrollOffset = offset
        }
        return Color.clear
      }
    )
  }
}
