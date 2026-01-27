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

  private let scrollThreshold: CGFloat = 20

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      ScrollView(showsIndicators: false) {
        VStack(alignment: .leading, spacing: 0) {
          // Header with poster and info
          SeasonHeaderView(
            season: season,
            scrollOffset: $scrollOffset,
            initialScrollOffset: $initialScrollOffset
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

          // Episodes Section
          if let details = seasonDetails, !details.episodes.isEmpty {
            sectionDivider
            EpisodesSectionView(episodes: details.episodes)
          }

          Spacer()
            .frame(height: 80)
        }
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
        existingReview: userReview
      )
    }
    .task {
      if AuthService.shared.isAuthenticated {
        isLoadingUserReview = true
      }
      await loadSeasonDetails()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
      }
    }
    .onChange(of: showReviewSheet) { _, isPresented in
      if !isPresented && AuthService.shared.isAuthenticated {
        Task {
          await loadUserReview()
        }
        reviewsRefreshId = UUID()
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
}

// MARK: - Season Header View
struct SeasonHeaderView: View {
  let season: Season
  @Binding var scrollOffset: CGFloat
  @Binding var initialScrollOffset: CGFloat?

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
    .padding(.top, 80)
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
