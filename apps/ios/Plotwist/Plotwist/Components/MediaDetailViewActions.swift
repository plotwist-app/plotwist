//
//  MediaDetailViewActions.swift
//  Plotwist
//

import SwiftUI

struct MediaDetailViewActions: View {
  let mediaId: Int
  let mediaType: String
  let userReview: Review?
  let userItem: UserItem?
  let isLoadingReview: Bool
  let isLoadingStatus: Bool
  let onReviewTapped: () -> Void
  let onStatusChanged: (UserItem?) -> Void

  @State private var showStatusSheet = false

  var body: some View {
    HStack(spacing: 12) {
      // Review Button
      ReviewButton(hasReview: userReview != nil, isLoading: isLoadingReview, action: onReviewTapped)

      // Status Button
      StatusButton(
        currentStatus: userItem?.statusEnum,
        rewatchCount: userItem?.watchEntries?.count ?? 0,
        isLoading: isLoadingStatus,
        action: { showStatusSheet = true }
      )

      Spacer()
    }
    .sheet(isPresented: $showStatusSheet) {
      StatusSheet(
        mediaId: mediaId,
        mediaType: mediaType,
        currentStatus: userItem?.statusEnum,
        currentItemId: userItem?.id,
        watchEntries: userItem?.watchEntries ?? [],
        onStatusChanged: { newStatus, _ in
          if newStatus != nil {
            // Reload user item to get the updated data
            Task {
              await reloadUserItem()
            }
          } else {
            onStatusChanged(nil)
          }
        }
      )
    }
  }

  private func reloadUserItem() async {
    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      let item = try await UserItemService.shared.getUserItem(
        tmdbId: mediaId,
        mediaType: apiMediaType
      )
      await MainActor.run {
        onStatusChanged(item)
      }
    } catch {
      // Ignore errors
    }
  }
}

// MARK: - Status Button
struct StatusButton: View {
  let currentStatus: UserItemStatus?
  let rewatchCount: Int
  let isLoading: Bool
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      HStack(spacing: 6) {
        if isLoading {
          ProgressView()
            .progressViewStyle(CircularProgressViewStyle())
            .scaleEffect(0.7)
            .frame(width: 13, height: 13)
        } else {
          Image(systemName: currentStatus?.icon ?? "pencil")
            .font(.system(size: 13))
            .foregroundColor(statusIconColor ?? .appForegroundAdaptive)
        }

        Text(currentStatus?.displayName(strings: L10n.current) ?? L10n.current.updateStatus)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)

        // Rewatch count badge
        if currentStatus == .watched && rewatchCount > 1 {
          Text("\(rewatchCount)x")
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(.white)
            .padding(.horizontal, 5)
            .padding(.vertical, 2)
            .background(Color.green)
            .clipShape(Capsule())
        }
      }
      .padding(.horizontal, 14)
      .padding(.vertical, 10)
      .background(Color.appInputFilled)
      .cornerRadius(10)
      .opacity(isLoading ? 0.5 : 1)
    }
    .disabled(isLoading)
  }

  private var statusIconColor: Color? {
    guard let status = currentStatus else { return nil }
    switch status {
    case .watched: return .green
    case .watching: return .blue
    case .watchlist: return .orange
    case .dropped: return .red
    }
  }
}

// MARK: - Preview
#Preview {
  VStack(spacing: 16) {
    MediaDetailViewActions(
      mediaId: 550,
      mediaType: "movie",
      userReview: nil,
      userItem: nil,
      isLoadingReview: true,
      isLoadingStatus: true,
      onReviewTapped: {},
      onStatusChanged: { _ in }
    )
    .padding(.horizontal, 24)

    MediaDetailViewActions(
      mediaId: 550,
      mediaType: "movie",
      userReview: nil,
      userItem: nil,
      isLoadingReview: false,
      isLoadingStatus: false,
      onReviewTapped: {},
      onStatusChanged: { _ in }
    )
    .padding(.horizontal, 24)

    MediaDetailViewActions(
      mediaId: 550,
      mediaType: "movie",
      userReview: Review(
        id: "1",
        userId: "user1",
        tmdbId: 550,
        mediaType: "MOVIE",
        review: "Great movie!",
        rating: 4.5,
        hasSpoilers: false,
        seasonNumber: nil,
        episodeNumber: nil,
        language: "en-US",
        createdAt: "2025-01-10T12:00:00.000Z"
      ),
      userItem: UserItem(
        id: "1",
        userId: "user1",
        tmdbId: 550,
        mediaType: "MOVIE",
        status: "WATCHED",
        addedAt: "2025-01-10T12:00:00.000Z",
        updatedAt: "2025-01-10T12:00:00.000Z",
        watchEntries: [WatchEntry(id: "1", watchedAt: "2025-01-10T12:00:00.000Z")]
      ),
      isLoadingReview: false,
      isLoadingStatus: false,
      onReviewTapped: {},
      onStatusChanged: { _ in }
    )
    .padding(.horizontal, 24)
  }
}
