//
//  ReviewSectionView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Review Section
struct ReviewSectionView: View {
  let mediaId: Int
  let mediaType: String
  let refreshId: UUID
  var onEmptyStateTapped: (() -> Void)?
  var onContentLoaded: ((Bool) -> Void)?

  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var error: String?
  @State private var currentUserId: String?
  @State private var selectedReview: ReviewListItem?
  @State private var showEditSheet = false
  @State private var hasLoaded = false

  private var averageRating: Double {
    guard !reviews.isEmpty else { return 0 }
    let total = reviews.reduce(0) { $0 + $1.rating }
    return total / Double(reviews.count)
  }

  private var reviewsWithText: [ReviewListItem] {
    reviews.filter { !$0.review.isEmpty }
  }

  // Show featured rating (with film strips) only for highly rated content with many reviews
  private var isFeaturedRating: Bool {
    reviews.count >= 10 && averageRating >= 4.5
  }

  var body: some View {
    Group {
      if isLoading {
        // Loading skeleton
        VStack(spacing: 16) {
          HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.appBorderAdaptive)
              .frame(width: 16, height: 16)
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.appBorderAdaptive)
              .frame(width: 30, height: 18)
            Circle()
              .fill(Color.appBorderAdaptive)
              .frame(width: 4, height: 4)
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.appBorderAdaptive)
              .frame(width: 80, height: 14)
          }
          .frame(maxWidth: .infinity, alignment: .leading)
          .padding(.horizontal, 24)
        }
      } else if reviews.isEmpty {
        // No reviews - show nothing
        EmptyView()
      } else {
        // Has reviews - show content
        VStack(spacing: 16) {
          // Rating Header
          if isFeaturedRating {
            // Featured rating display with film strips (10+ reviews AND rating >= 4.5)
            HStack(spacing: 8) {
              // Left film strip
              Image("FilmStrip")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 140)
                .shadow(color: Color.black.opacity(0.1), radius: 3, x: 0, y: 3)
                .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 6)

              // Rating content
              VStack(spacing: 4) {
                // Large rating number
                Text(String(format: "%.1f", averageRating))
                  .font(.system(size: 56, weight: .semibold, design: .rounded))
                  .foregroundColor(.appForegroundAdaptive)

                // Stars
                HStack(spacing: 4) {
                  ForEach(1...5, id: \.self) { index in
                    Image(systemName: starIcon(for: index))
                      .font(.system(size: 14))
                      .foregroundColor(starColor(for: index))
                  }
                }

                // Reviews count
                Text(
                  "\(reviews.count) \(reviews.count == 1 ? L10n.current.reviewSingular.lowercased() : L10n.current.tabReviews.lowercased())"
                )
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.top, 4)
              }

              // Right film strip (mirrored)
              Image("FilmStrip")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 140)
                .scaleEffect(x: -1, y: 1)
                .shadow(color: Color.black.opacity(0.1), radius: 3, x: 0, y: 3)
                .shadow(color: Color.black.opacity(0.06), radius: 6, x: 0, y: 6)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
          } else {
            // Simple rating display (star + rating + dot + reviews count)
            HStack(spacing: 6) {
              Image(systemName: "star.fill")
                .font(.system(size: 16))
                .foregroundColor(.appStarYellow)

              Text(String(format: "%.1f", averageRating))
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)

              Circle()
                .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
                .frame(width: 4, height: 4)

              Text(
                "\(reviews.count) \(reviews.count == 1 ? L10n.current.reviewSingular.lowercased() : L10n.current.tabReviews.lowercased())"
              )
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)
          }

          // Horizontal scrolling reviews
          if !reviewsWithText.isEmpty {
            ScrollView(.horizontal, showsIndicators: false) {
              HStack(alignment: .top, spacing: 0) {
                ForEach(Array(reviewsWithText.enumerated()), id: \.element.id) { index, review in
                  HStack(alignment: .top, spacing: 0) {
                    Group {
                      if review.userId == currentUserId {
                        ReviewCardView(review: review)
                          .contentShape(Rectangle())
                          .onTapGesture {
                            selectedReview = review
                            showEditSheet = true
                          }
                      } else {
                        ReviewCardView(review: review)
                      }
                    }
                    .frame(width: min(UIScreen.main.bounds.width * 0.75, 300))
                    .padding(.leading, index == 0 ? 24 : 0)
                    .padding(.trailing, 24)

                    // Vertical divider (except for last item)
                    if index < reviewsWithText.count - 1 {
                      Rectangle()
                        .fill(Color.appBorderAdaptive.opacity(0.5))
                        .frame(width: 1)
                        .frame(height: 140)
                        .padding(.trailing, 24)
                    }
                  }
                }
              }
            }
          }

          // See all button (show if 3+ reviews)
          if reviews.count >= 3 {
            Button(action: {
              // TODO: Navigate to all reviews
            }) {
              Text(L10n.current.seeAll)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appMutedForegroundAdaptive)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.appInputFilled)
                .cornerRadius(12)
            }
            .disabled(true)
            .opacity(0.5)
            .padding(.horizontal, 24)
          }
        }
      }
    }
    .task {
      await loadCurrentUser()
      await loadReviews()
    }
    .onChange(of: refreshId) { _, _ in
      Task {
        await loadReviews(forceReload: true)
      }
    }
    .sheet(isPresented: $showEditSheet) {
      if let review = selectedReview {
        ReviewSheet(
          mediaId: mediaId,
          mediaType: mediaType,
          existingReview: review.toReview(),
          onSaved: {
            Task {
              await loadReviews(forceReload: true)
            }
          },
          onDeleted: {
            Task {
              await loadReviews(forceReload: true)
            }
          }
        )
      }
    }
  }

  private func loadCurrentUser() async {
    do {
      let user = try await AuthService.shared.getCurrentUser()
      currentUserId = user.id
    } catch {
      currentUserId = nil
    }
  }

  private func loadReviews(forceReload: Bool = false) async {
    // Skip if already loaded (unless force reload)
    guard !hasLoaded || forceReload else {
      isLoading = false
      onContentLoaded?(!reviews.isEmpty)
      return
    }

    isLoading = true
    error = nil

    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      reviews = try await ReviewService.shared.getReviews(
        tmdbId: mediaId,
        mediaType: apiMediaType
      )
      isLoading = false
      hasLoaded = true
      onContentLoaded?(!reviews.isEmpty)
    } catch {
      self.error = error.localizedDescription
      isLoading = false
      hasLoaded = true
      onContentLoaded?(false)
    }
  }

  private func starIcon(for index: Int) -> String {
    if Double(index) <= averageRating {
      return "star.fill"
    } else if Double(index) - 0.5 <= averageRating {
      return "star.leadinghalf.filled"
    } else {
      return "star"
    }
  }

  private func starColor(for index: Int) -> Color {
    if Double(index) <= averageRating || Double(index) - 0.5 <= averageRating {
      return .appStarYellow
    } else {
      return .gray.opacity(0.3)
    }
  }
}

// MARK: - Review Card
struct ReviewCardView: View {
  let review: ReviewListItem

  private var usernameInitial: String {
    review.user.username.first?.uppercased() ?? "?"
  }

  private var timeAgo: String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated

    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    if let date = dateFormatter.date(from: review.createdAt) {
      return formatter.localizedString(for: date, relativeTo: Date())
    }
    return ""
  }

  private var userRank: String {
    let ranks = ["Cinéfilo", "Crítico", "Entusiasta", "Maratonista", "Expert"]
    let index = abs(review.user.id.hashValue) % ranks.count
    return ranks[index]
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Header: Avatar + Username + Rank
      HStack(spacing: 12) {
        // Avatar
        if let avatarUrl = review.user.avatarUrl,
          let url = URL(string: avatarUrl)
        {
          CachedAsyncImage(url: url) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            avatarFallback
          }
          .frame(width: 40, height: 40)
          .clipShape(Circle())
        } else {
          avatarFallback
        }

        VStack(alignment: .leading, spacing: 2) {
          Text(review.user.username)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          Text(userRank)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }

      // Stars + Time
      HStack(spacing: 8) {
        HStack(spacing: 2) {
          ForEach(1...5, id: \.self) { index in
            Image(systemName: ratingIcon(for: index))
              .font(.system(size: 14))
              .foregroundColor(ratingColor(for: index))
          }
        }

        Text(timeAgo)
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      // Review text
      if !review.review.isEmpty {
        Text(review.review)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .lineLimit(3)
          .frame(maxWidth: .infinity, alignment: .leading)
          .blur(radius: review.hasSpoilers ? 6 : 0)
          .overlay(
            review.hasSpoilers
              ? Text(L10n.current.containSpoilers)
                .font(.caption.weight(.medium))
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.appInputFilled)
                .cornerRadius(6)
              : nil
          )
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  private var avatarFallback: some View {
    Circle()
      .fill(Color.appInputFilled)
      .frame(width: 40, height: 40)
      .overlay(
        Text(usernameInitial)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      )
  }

  private func ratingIcon(for index: Int) -> String {
    let rating = review.rating
    if Double(index) <= rating {
      return "star.fill"
    } else if Double(index) - 0.5 <= rating {
      return "star.leadinghalf.filled"
    } else {
      return "star"
    }
  }

  private func ratingColor(for index: Int) -> Color {
    let rating = review.rating
    if Double(index) <= rating || Double(index) - 0.5 <= rating {
      return .appStarYellow
    } else {
      return .appMutedForegroundAdaptive.opacity(0.3)
    }
  }
}
