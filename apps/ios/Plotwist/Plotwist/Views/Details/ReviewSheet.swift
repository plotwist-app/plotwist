//
//  ReviewSheet.swift
//  Plotwist
//

import SwiftUI

struct ReviewSheet: View {
  let mediaId: Int
  let mediaType: String
  let existingReview: Review?
  let onDeleted: (() -> Void)?
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared

  @State private var rating: Double = 0
  @State private var reviewText: String = ""
  @State private var hasSpoilers: Bool = false
  @State private var isLoading: Bool = false
  @State private var isDeleting: Bool = false
  @State private var showErrorAlert: Bool = false
  @State private var showDeleteConfirmation: Bool = false
  @State private var errorMessage: String = ""

  init(mediaId: Int, mediaType: String, existingReview: Review? = nil, onDeleted: (() -> Void)? = nil) {
    self.mediaId = mediaId
    self.mediaType = mediaType
    self.existingReview = existingReview
    self.onDeleted = onDeleted

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
          VStack(spacing: 16) {
            // Title
            Text(L10n.current.whatDidYouThink)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)
              .frame(maxWidth: .infinity, alignment: .center)
              .padding(.top, 4)

            // Rating
            StarRatingView(rating: $rating, size: 36)
              .frame(maxWidth: .infinity)

            // Review Text with Spoilers Toggle
            ZStack(alignment: .bottomTrailing) {
              ZStack(alignment: .topLeading) {
                TextEditor(text: $reviewText)
                  .frame(height: 120)
                  .padding(.horizontal, 12)
                  .padding(.top, 8)
                  .padding(.bottom, 36)
                  .background(Color.appInputFilled)
                  .cornerRadius(12)
                  .foregroundColor(.appForegroundAdaptive)
                  .scrollContentBackground(.hidden)

                if reviewText.isEmpty {
                  Text(L10n.current.shareYourOpinion)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 12)
                    .allowsHitTesting(false)
                }
              }
              
              // Spoilers Toggle inside the text field
              Button(action: { hasSpoilers.toggle() }) {
                HStack(spacing: 6) {
                  Image(systemName: hasSpoilers ? "checkmark.square.fill" : "square")
                    .font(.system(size: 16))
                    .foregroundColor(hasSpoilers ? .appForegroundAdaptive : .gray)

                  Text(L10n.current.containSpoilers)
                    .font(.caption)
                    .foregroundColor(.appMutedForegroundAdaptive)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
              }
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
            .disabled(!isFormValid || isLoading || isDeleting)
            .opacity(!isFormValid || isLoading || isDeleting ? 0.5 : 1)
            
            // Delete Button (only when editing)
            if existingReview != nil {
              Button(action: { showDeleteConfirmation = true }) {
                Group {
                  if isDeleting {
                    ProgressView()
                      .tint(.red)
                  } else {
                    HStack(spacing: 8) {
                      Image(systemName: "trash")
                      Text(L10n.current.deleteReview)
                        .fontWeight(.semibold)
                    }
                  }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .foregroundColor(.red)
              }
              .disabled(isLoading || isDeleting)
              .opacity(isLoading || isDeleting ? 0.5 : 1)
            }
          }
          .padding(.horizontal, 24)
          .padding(.bottom, 16)
        }
      }
    }
    .presentationDetents([.height(existingReview != nil ? 440 : 380)])
    .presentationCornerRadius(24)
    .presentationDragIndicator(.hidden)
    .preferredColorScheme(themeManager.current.colorScheme)
    .alert("Error", isPresented: $showErrorAlert) {
      Button("OK", role: .cancel) {}
    } message: {
      Text(errorMessage)
    }
    .alert(L10n.current.deleteReview, isPresented: $showDeleteConfirmation) {
      Button(L10n.current.cancel, role: .cancel) {}
      Button(L10n.current.delete, role: .destructive) {
        deleteReview()
      }
    } message: {
      Text(L10n.current.deleteReviewConfirmation)
    }
  }

  private var isFormValid: Bool {
    rating > 0 && !reviewText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }

  private func submitReview() {
    guard isFormValid else {
      errorMessage = L10n.current.reviewRequired
      showErrorAlert = true
      return
    }

    isLoading = true

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
          showErrorAlert = true
        }
      }
    }
  }
  
  private func deleteReview() {
    guard let existingReview = existingReview else { return }
    
    isDeleting = true
    
    Task {
      do {
        try await ReviewService.shared.deleteReview(id: existingReview.id)
        
        await MainActor.run {
          isDeleting = false
          onDeleted?()
          dismiss()
        }
      } catch {
        await MainActor.run {
          isDeleting = false
          errorMessage = error.localizedDescription
          showErrorAlert = true
        }
      }
    }
  }
}

// MARK: - Preview
#Preview {
  ReviewSheet(mediaId: 550, mediaType: "movie")
}
