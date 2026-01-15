//
//  ReviewSheet.swift
//  Plotwist
//

import SwiftUI

struct ReviewSheet: View {
  let mediaId: Int
  let mediaType: String
  let existingReview: Review?
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared

  @State private var rating: Double = 0
  @State private var reviewText: String = ""
  @State private var hasSpoilers: Bool = false
  @State private var isLoading: Bool = false
  @State private var errorMessage: String?

  init(mediaId: Int, mediaType: String, existingReview: Review? = nil) {
    self.mediaId = mediaId
    self.mediaType = mediaType
    self.existingReview = existingReview

    if let existingReview = existingReview {
      _rating = State(initialValue: existingReview.rating)
      _reviewText = State(initialValue: existingReview.review)
      _hasSpoilers = State(initialValue: existingReview.hasSpoilers)
    }
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
          .padding(.bottom, 8)

        ScrollView {
          VStack(spacing: 20) {
            // Title
            Text(L10n.current.whatDidYouThink)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)
              .frame(maxWidth: .infinity, alignment: .center)
              .padding(.top, 8)

            // Rating
            VStack(spacing: 12) {
              StarRatingView(rating: $rating, size: 36)
                .frame(maxWidth: .infinity)
            }

            // Review Text
            VStack(alignment: .leading, spacing: 8) {
              ZStack(alignment: .topLeading) {
                if reviewText.isEmpty {
                  Text(L10n.current.shareYourOpinion)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                }

                TextEditor(text: $reviewText)
                  .frame(minHeight: 120)
                  .padding(.horizontal, 12)
                  .padding(.vertical, 8)
                  .background(Color.appInputFilled)
                  .cornerRadius(12)
                  .foregroundColor(.appForegroundAdaptive)
                  .scrollContentBackground(.hidden)
              }
            }

            // Spoilers Checkbox
            HStack(spacing: 12) {
              Button(action: { hasSpoilers.toggle() }) {
                HStack(spacing: 8) {
                  Image(systemName: hasSpoilers ? "checkmark.square.fill" : "square")
                    .font(.system(size: 20))
                    .foregroundColor(hasSpoilers ? .accentColor : .gray)
                  
                  Text(L10n.current.containSpoilers)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                }
              }
              .frame(maxWidth: .infinity)
            }
            .padding(.vertical, 4)

            // Error Message
            if let errorMessage = errorMessage {
              Text(errorMessage)
                .font(.caption)
                .foregroundColor(.red)
                .frame(maxWidth: .infinity, alignment: .center)
            }

            // Submit Button
            Button(action: submitReview) {
              Group {
                if isLoading {
                  ProgressView()
                    .tint(.appBackgroundAdaptive)
                } else {
                  Text(existingReview != nil ? L10n.current.editReview : L10n.current.submitReview)
                    .fontWeight(.semibold)
                }
              }
              .frame(maxWidth: .infinity)
              .frame(height: 48)
              .background(Color.appForegroundAdaptive)
              .foregroundColor(.appBackgroundAdaptive)
              .cornerRadius(12)
            }
            .disabled(!isFormValid || isLoading)
            .opacity(!isFormValid || isLoading ? 0.5 : 1)
          }
          .padding(.horizontal, 24)
          .padding(.bottom, 24)
        }
      }
    }
    .standardSheetStyle()
    .preferredColorScheme(themeManager.current.colorScheme)
  }

  private var isFormValid: Bool {
    rating > 0 && !reviewText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  private func submitReview() {
    guard isFormValid else {
      errorMessage = L10n.current.reviewRequired
      return
    }

    isLoading = true
    errorMessage = nil

    Task {
      do {
        let reviewData = ReviewData(
          tmdbId: mediaId,
          mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW",
          review: reviewText,
          rating: rating,
          hasSpoilers: hasSpoilers,
          seasonNumber: nil,
          episodeNumber: nil,
          language: Language.current.rawValue
        )

        if let existingReview = existingReview {
          try await ReviewService.shared.updateReview(id: existingReview.id, reviewData)
        } else {
          try await ReviewService.shared.createReview(reviewData)
        }

        await MainActor.run {
          isLoading = false
          dismiss()
        }
      } catch {
        await MainActor.run {
          isLoading = false
          errorMessage = error.localizedDescription
        }
      }
    }
  }
}

// MARK: - Preview
#Preview {
  ReviewSheet(mediaId: 550, mediaType: "movie")
}
