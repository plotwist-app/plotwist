//
//  ReviewSheet.swift
//  Plotwist
//

import SwiftUI

struct ReviewSheet: View {
  let mediaId: Int
  let mediaType: String
  let seasonNumber: Int?
  let episodeNumber: Int?
  let existingReview: Review?
  let mediaTitle: String?
  let mediaPosterPath: String?
  let mediaYear: String?
  let onSaved: (() -> Void)?
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
  @State private var selectedDetent: PresentationDetent = .medium
  @State private var showSuccessState: Bool = false
  @State private var showShareSheet: Bool = false
  @State private var currentUser: User?
  @FocusState private var isTextEditorFocused: Bool

  init(mediaId: Int, mediaType: String, seasonNumber: Int? = nil, episodeNumber: Int? = nil, existingReview: Review? = nil, mediaTitle: String? = nil, mediaPosterPath: String? = nil, mediaYear: String? = nil, onSaved: (() -> Void)? = nil, onDeleted: (() -> Void)? = nil) {
    self.mediaId = mediaId
    self.mediaType = mediaType
    self.seasonNumber = seasonNumber
    self.episodeNumber = episodeNumber
    self.existingReview = existingReview
    self.mediaTitle = mediaTitle
    self.mediaPosterPath = mediaPosterPath
    self.mediaYear = mediaYear
    self.onSaved = onSaved
    self.onDeleted = onDeleted

    if let existingReview = existingReview {
      _rating = State(initialValue: existingReview.rating)
      _reviewText = State(initialValue: existingReview.review)
      _hasSpoilers = State(initialValue: existingReview.hasSpoilers)
    }
  }

  var body: some View {
    FloatingSheetContainer {
      if showSuccessState {
        successView
      } else {
        formView
      }
    }
    .presentationDetents(showSuccessState ? [.height(340)] : [.medium, .large], selection: $selectedDetent)
    .presentationBackground { Color.appSheetBackgroundAdaptive.ignoresSafeArea() }
    .presentationDragIndicator(.hidden)
    .presentationContentInteraction(.scrolls)
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
    .onChange(of: isTextEditorFocused) { _, focused in
      if focused {
        withAnimation { selectedDetent = .large }
      }
    }
    .task {
      if existingReview == nil {
        AnalyticsService.shared.track(.reviewStarted(tmdbId: mediaId, mediaType: mediaType))
      }
      if mediaTitle != nil {
        currentUser = try? await AuthService.shared.getCurrentUser()
      }
    }
    .sheet(isPresented: $showShareSheet) {
      if let title = mediaTitle {
        ShareReviewSheet(
          review: buildReviewListItem(),
          mediaTitle: title,
          mediaPosterPath: mediaPosterPath,
          mediaYear: mediaYear
        )
      }
    }
  }

  private var formView: some View {
    VStack(spacing: 16) {
      RoundedRectangle(cornerRadius: 2.5)
        .fill(Color.gray.opacity(0.4))
        .frame(width: 36, height: 5)
        .padding(.top, 8)

      Text(L10n.current.whatDidYouThink)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)
        .frame(maxWidth: .infinity, alignment: .center)

      StarRatingView(rating: $rating, size: 36)
        .frame(maxWidth: .infinity)

      ZStack(alignment: .bottomTrailing) {
        ZStack(alignment: .topLeading) {
          TextEditor(text: $reviewText)
            .frame(minHeight: 120)
            .padding(.horizontal, 12)
            .padding(.top, 8)
            .padding(.bottom, 36)
            .background(Color.appInputFilled)
            .cornerRadius(12)
            .foregroundColor(.appForegroundAdaptive)
            .scrollContentBackground(.hidden)
            .focused($isTextEditorFocused)

          if reviewText.isEmpty {
            Text(L10n.current.shareYourOpinion)
              .foregroundColor(.appMutedForegroundAdaptive)
              .padding(.horizontal, 16)
              .padding(.vertical, 12)
              .allowsHitTesting(false)
          }
        }

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
        .clipShape(Capsule())
      }
      .disabled(!isFormValid || isLoading || isDeleting)
      .opacity(!isFormValid || isLoading || isDeleting ? 0.5 : 1)

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

  private var successView: some View {
    VStack(spacing: 20) {
      RoundedRectangle(cornerRadius: 2.5)
        .fill(Color.gray.opacity(0.4))
        .frame(width: 36, height: 5)
        .padding(.top, 8)

      Image(systemName: "checkmark.circle.fill")
        .font(.system(size: 48))
        .foregroundColor(.green)
        .padding(.top, 8)

      Text(L10n.current.reviewPublished)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)

      Text(L10n.current.reviewSharePrompt)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .multilineTextAlignment(.center)

      Button {
        showShareSheet = true
      } label: {
        HStack(spacing: 8) {
          Image(systemName: "square.and.arrow.up")
          Text(L10n.current.shareReview)
        }
        .fontWeight(.semibold)
        .frame(maxWidth: .infinity)
        .frame(height: 48)
        .background(Color.appForegroundAdaptive)
        .foregroundColor(.appBackgroundAdaptive)
        .clipShape(Capsule())
      }

      Button {
        dismiss()
      } label: {
        Text(L10n.current.maybeLater)
          .fontWeight(.medium)
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 44)
      }
    }
    .padding(.horizontal, 24)
    .padding(.bottom, 16)
    .transition(.opacity.combined(with: .scale(scale: 0.95)))
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
          seasonNumber: seasonNumber,
          episodeNumber: episodeNumber,
          language: Language.current.rawValue
        )

        if let existingReview = existingReview {
          try await ReviewService.shared.updateReview(id: existingReview.id, reviewData)
        } else {
          try await ReviewService.shared.createReview(reviewData)
        }
        
        // Track review submitted
        AnalyticsService.shared.track(.reviewSubmitted(
          tmdbId: mediaId,
          mediaType: mediaType,
          rating: rating,
          hasText: !reviewText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        ))

        await MainActor.run {
          isLoading = false
          Haptics.notification(.success)
          onSaved?()

          if existingReview == nil && mediaTitle != nil {
            withAnimation(.easeOut(duration: 0.3)) {
              showSuccessState = true
              selectedDetent = .height(340)
            }
          } else {
            dismiss()
          }
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
  
  private func buildReviewListItem() -> ReviewListItem {
    let userId = currentUser?.id ?? ""
    let username = currentUser?.username ?? ""
    let avatarUrl = currentUser?.avatarUrl

    return ReviewListItem(
      id: UUID().uuidString,
      userId: userId,
      tmdbId: mediaId,
      mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW",
      review: reviewText,
      rating: rating,
      hasSpoilers: hasSpoilers,
      seasonNumber: seasonNumber,
      episodeNumber: episodeNumber,
      language: Language.current.rawValue,
      createdAt: ISO8601DateFormatter().string(from: Date()),
      user: ReviewUser(id: userId, username: username, avatarUrl: avatarUrl),
      likeCount: 0,
      replyCount: 0,
      userLike: nil
    )
  }

  private func deleteReview() {
    guard let existingReview = existingReview else { return }
    
    isDeleting = true
    
    Task {
      do {
        try await ReviewService.shared.deleteReview(
          id: existingReview.id,
          tmdbId: mediaId,
          mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW",
          seasonNumber: existingReview.seasonNumber,
          episodeNumber: existingReview.episodeNumber
        )
        
        // Track review deleted
        AnalyticsService.shared.track(.reviewDeleted(tmdbId: mediaId, mediaType: mediaType))
        
        await MainActor.run {
          isDeleting = false
          Haptics.notification(.success)
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
  ReviewSheet(mediaId: 550, mediaType: "movie", mediaTitle: "Fight Club", mediaPosterPath: nil, mediaYear: "1999")
}
