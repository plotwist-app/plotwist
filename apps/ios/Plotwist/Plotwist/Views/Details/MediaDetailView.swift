//
//  MediaDetailView.swift
//  Plotwist
//

import SwiftUI

struct MediaDetailView: View {
  let mediaId: Int
  let mediaType: String

  @Environment(\.dismiss) private var dismiss
  @State private var details: MovieDetails?
  @State private var isLoading = true
  @State private var userReview: Review?
  @State private var showReviewSheet = false
  @ObservedObject private var themeManager = ThemeManager.shared

  // Layout constants
  private let posterOverlapOffset: CGFloat = -70
  private let contentOffset: CGFloat = -54

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading {
        ProgressView()
      } else if let details {
        ScrollView(showsIndicators: false) {
          VStack(alignment: .leading, spacing: 0) {
            // Backdrop
            ZStack(alignment: .topLeading) {
              AsyncImage(url: details.backdropURL) { phase in
                switch phase {
                case .success(let image):
                  image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                default:
                  Rectangle()
                    .fill(Color.appBorderAdaptive)
                }
              }
              .frame(height: 240)
              .frame(maxWidth: .infinity)
              .clipped()

              // Back button
              Button {
                dismiss()
              } label: {
                Image(systemName: "chevron.left")
                  .font(.system(size: 18, weight: .semibold))
                  .foregroundColor(.white)
                  .frame(width: 40, height: 40)
                  .background(.ultraThinMaterial)
                  .clipShape(Circle())
              }
              .padding(.top, 60)
              .padding(.leading, 24)
            }
            .overlay(
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1),
              alignment: .bottom
            )

            // Content with poster overlap
            HStack(alignment: .bottom, spacing: 16) {
              // Poster
              AsyncImage(url: details.posterURL) { phase in
                switch phase {
                case .success(let image):
                  image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                default:
                  RoundedRectangle(cornerRadius: 16)
                    .fill(Color.appBorderAdaptive)
                }
              }
              .frame(width: 140, height: 210)
              .clipShape(RoundedRectangle(cornerRadius: 16))
              .shadow(color: Color.black.opacity(0.15), radius: 4, x: 0, y: 2)

              // Info
              VStack(alignment: .leading, spacing: 4) {
                if let releaseDate = details.formattedReleaseDate(locale: Language.current.rawValue)
                {
                  Text(releaseDate)
                    .font(.caption)
                    .foregroundColor(.appMutedForegroundAdaptive)
                }

                Text(details.displayTitle)
                  .font(.headline)
                  .foregroundColor(.appForegroundAdaptive)
              }

              Spacer()
            }
            .padding(.horizontal, 24)
            .offset(y: posterOverlapOffset)

            // Content Section
            VStack(alignment: .leading, spacing: 20) {
              // Review Button
              if AuthService.shared.isAuthenticated {
                HStack {
                  ReviewButton(hasReview: userReview != nil) {
                    showReviewSheet = true
                  }

                  Spacer()
                }
              }

              // Overview
              if let overview = details.overview, !overview.isEmpty {
                Text(overview)
                  .font(.subheadline)
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .lineSpacing(4)
              }

              // Rating and Genres Badges
              ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                  if let rating = details.voteAverage, rating > 0 {
                    RatingBadge(rating: rating)
                  }

                  if let genres = details.genres {
                    ForEach(genres) { genre in
                      BadgeView(text: genre.name)
                    }
                  }
                }
              }
            }
            .padding(.horizontal, 24)
            .offset(y: contentOffset)

            // Tabs
            MediaTabsView(
              mediaId: mediaId,
              mediaType: mediaType
            )
            .padding(.top, 20)
            .offset(y: contentOffset)
          }
          .padding(.bottom, 80)
        }
        .ignoresSafeArea(edges: .top)
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(mediaId: mediaId, mediaType: mediaType, existingReview: userReview)
    }
    .task {
      await loadDetails()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
      }
    }
    .onChange(of: showReviewSheet) { _, isPresented in
      if !isPresented && AuthService.shared.isAuthenticated {
        Task {
          await loadUserReview()
        }
      }
    }
  }

  private func loadDetails() async {
    isLoading = true
    defer { isLoading = false }

    do {
      if mediaType == "movie" {
        details = try await TMDBService.shared.getMovieDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      } else {
        details = try await TMDBService.shared.getTVSeriesDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      }
    } catch {
      details = nil
    }
  }

  private func loadUserReview() async {
    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: mediaId,
        mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      )
    } catch {
      userReview = nil
    }
  }
}

// MARK: - Tabs View
struct MediaTabsView: View {
  let mediaId: Int
  let mediaType: String

  @State private var selectedTab: Tab = .reviews

  enum Tab: String, CaseIterable {
    case reviews
    case whereToWatch
    case credits
    case recommendations
    case similar
    case images
    case videos

    var title: String {
      let strings = L10n.current
      switch self {
      case .reviews: return strings.tabReviews
      case .whereToWatch: return strings.tabWhereToWatch
      case .credits: return strings.tabCredits
      case .recommendations: return strings.tabRecommendations
      case .similar: return strings.tabSimilar
      case .images: return strings.tabImages
      case .videos: return strings.tabVideos
      }
    }

    var isEnabled: Bool {
      true
    }
  }

  var body: some View {
    VStack(spacing: 0) {
      // Tab Bar
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 4) {
          ForEach(Tab.allCases, id: \.self) { tab in
            Button(action: {
              if tab.isEnabled {
                selectedTab = tab
              }
            }) {
              Text(tab.title)
                .font(.subheadline.weight(.medium))
                .foregroundColor(
                  selectedTab == tab
                    ? .appForegroundAdaptive
                    : .appMutedForegroundAdaptive
                )
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(
                  selectedTab == tab
                    ? Color.appBackgroundAdaptive
                    : Color.clear
                )
                .cornerRadius(6)
                .shadow(
                  color: selectedTab == tab ? Color.black.opacity(0.08) : Color.clear,
                  radius: 2,
                  x: 0,
                  y: 1
                )
            }
            .disabled(!tab.isEnabled)
          }
        }
        .padding(4)
        .background(Color.appInputFilled)
        .cornerRadius(10)
        .padding(.horizontal, 24)
      }

      // Tab Content
      VStack(spacing: 0) {
        switch selectedTab {
        case .reviews:
          ReviewListView(mediaId: mediaId, mediaType: mediaType)
        case .whereToWatch:
          Text("Where to Watch")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.top, 32)
        case .credits:
          Text("Credits")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.top, 32)
        case .recommendations:
          Text("Recommendations")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.top, 32)
        case .similar:
          Text("Similar")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.top, 32)
        case .images:
          Text("Images")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.top, 32)
        case .videos:
          Text("Videos")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.top, 32)
        }
      }
      .padding(.top, 16)
    }
  }
}

// MARK: - Badge View
struct BadgeView: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.caption)
      .foregroundColor(.appForegroundAdaptive)
      .padding(.horizontal, 10)
      .padding(.vertical, 6)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}

// MARK: - Rating Badge
struct RatingBadge: View {
  let rating: Double

  var body: some View {
    HStack(spacing: 4) {
      Image(systemName: "star.fill")
        .font(.caption)
        .foregroundColor(.yellow)

      Text(String(format: "%.1f", rating))
        .font(.caption.bold())
        .foregroundColor(.appBackgroundAdaptive)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.appForegroundAdaptive)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}
