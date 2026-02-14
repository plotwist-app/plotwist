//
//  ReviewListView.swift
//  Plotwist
//

import SwiftUI

struct ReviewListView: View {
  let mediaId: Int
  let mediaType: String
  
  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var error: String?
  @State private var currentUserId: String?
  @State private var selectedReview: ReviewListItem?
  @State private var showEditSheet = false
  
  var body: some View {
    VStack(spacing: 0) {
      if isLoading {
        // Loading state
        VStack(spacing: 16) {
          ForEach(0..<3, id: \.self) { _ in
            ReviewItemSkeleton()
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
      } else if let error = error {
        // Error state
        VStack(spacing: 8) {
          Image(systemName: "exclamationmark.triangle")
            .font(.title)
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(error)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.top, 32)
      } else if reviews.isEmpty {
        // Empty state
        VStack(spacing: 8) {
          Text(L10n.current.beFirstToReview)
            .font(.subheadline)
            .foregroundColor(.appForegroundAdaptive)
          Text(L10n.current.shareYourOpinion)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .overlay(
          RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
            .stroke(style: StrokeStyle(lineWidth: 1, dash: [5]))
            .foregroundColor(.appBorderAdaptive)
        )
        .padding(.horizontal, 24)
        .padding(.top, 16)
      } else {
        // Reviews list
        LazyVStack(spacing: 0) {
          ForEach(Array(reviews.filter { !$0.review.isEmpty }.enumerated()), id: \.element.id) { index, review in
            VStack(spacing: 0) {
              // Make tappable only if it's the current user's review
              if review.userId == currentUserId {
                ReviewItemView(review: review)
                  .padding(.vertical, 16)
                  .contentShape(Rectangle())
                  .onTapGesture {
                    selectedReview = review
                    showEditSheet = true
                  }
              } else {
                ReviewItemView(review: review)
                  .padding(.vertical, 16)
              }
              
              // Divider (except for last item)
              if index < reviews.filter({ !$0.review.isEmpty }).count - 1 {
                Divider()
                  .background(Color.appBorderAdaptive.opacity(0.5))
              }
            }
          }
        }
        .padding(.horizontal, 24)
      }
    }
    .task {
      await loadCurrentUser()
      await loadReviews()
    }
    .sheet(isPresented: $showEditSheet) {
      if let review = selectedReview {
        ReviewSheet(
          mediaId: mediaId,
          mediaType: mediaType,
          existingReview: review.toReview(),
          onSaved: {
            Task {
              await loadReviews()
            }
          },
          onDeleted: {
            Task {
              await loadReviews()
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
  
  private func loadReviews() async {
    isLoading = true
    error = nil
    
    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      reviews = try await ReviewService.shared.getReviews(
        tmdbId: mediaId,
        mediaType: apiMediaType
      )
      isLoading = false
    } catch {
      self.error = error.localizedDescription
      isLoading = false
    }
  }
}

// MARK: - ReviewListItem Extension
extension ReviewListItem {
  func toReview() -> Review {
    Review(
      id: id,
      userId: userId,
      tmdbId: tmdbId,
      mediaType: mediaType,
      review: review,
      rating: rating,
      hasSpoilers: hasSpoilers,
      seasonNumber: seasonNumber,
      episodeNumber: episodeNumber,
      language: language,
      createdAt: createdAt
    )
  }
}

// MARK: - Skeleton
struct ReviewItemSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      // Row 1: Avatar + Username
      HStack(spacing: 10) {
        Circle()
          .fill(Color.appBorderAdaptive)
          .frame(width: 44, height: 44)

        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 100, height: 14)

        Spacer()
      }

      // Row 2: Stars + dot + date
      HStack(spacing: 8) {
        HStack(spacing: 2) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appBorderAdaptive)
              .frame(width: 12, height: 12)
          }
        }

        Circle()
          .fill(Color.appBorderAdaptive)
          .frame(width: 3, height: 3)

        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 40, height: 12)
      }
      .padding(.top, 10)

      // Row 3: Review text
      VStack(alignment: .leading, spacing: 6) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(height: 16)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(height: 16)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 16)
      }
      .padding(.top, 14)
    }
  }
}

#Preview {
  ReviewListView(mediaId: 123, mediaType: "movie")
}
