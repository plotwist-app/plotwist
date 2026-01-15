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
            .offset(y: -70)

            // Overview
            if let overview = details.overview, !overview.isEmpty {
              Text(overview)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
                .lineSpacing(4)
                .padding(.horizontal, 24)
                .padding(.top, -54)
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
              .padding(.horizontal, 24)
            }
            .padding(.top, 16)

            // Review Button
            if AuthService.shared.isAuthenticated {
              Button(action: { showReviewSheet = true }) {
                HStack(spacing: 8) {
                  Image(systemName: userReview != nil ? "star.fill" : "star")
                    .font(.system(size: 14))
                    .foregroundColor(userReview != nil ? .yellow : .appForegroundAdaptive)

                  Text(userReview != nil ? L10n.current.reviewed : L10n.current.review)
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(.appForegroundAdaptive)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color.appInputFilled)
                .cornerRadius(8)
              }
              .padding(.horizontal, 24)
              .padding(.top, 16)
            }
          }
          .padding(.bottom, 100)
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
        .foregroundColor(.appForegroundAdaptive)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}
