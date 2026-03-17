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
  var onLoginRequired: (() -> Void)?

  @State private var showStatusSheet = false
  @State private var isFavorite = false
  @State private var isTogglingFavorite = false
  @State private var heartScale: CGFloat = 1.0

  private var apiMediaType: String {
    mediaType == "movie" ? "MOVIE" : "TV_SHOW"
  }

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 10) {
        ReviewButton(hasReview: userReview != nil, isLoading: isLoadingReview, action: onReviewTapped)

        StatusButton(
          currentStatus: userItem?.statusEnum,
          rewatchCount: userItem?.watchEntries?.count ?? 0,
          isLoading: isLoadingStatus,
          action: {
            if AuthService.shared.isAuthenticated {
              showStatusSheet = true
            } else {
              onLoginRequired?()
            }
          }
        )

        Button {
          if AuthService.shared.isAuthenticated {
            Task { await toggleFavorite() }
          } else {
            onLoginRequired?()
          }
        } label: {
          HStack(spacing: 6) {
            Image(systemName: isFavorite ? "heart.fill" : "heart")
              .font(.system(size: 13))
              .foregroundColor(isFavorite ? .red : .appForegroundAdaptive)
              .scaleEffect(heartScale)
              .contentTransition(.symbolEffect(.replace))

            Text(isFavorite ? L10n.current.favorited : L10n.current.favorite)
              .font(.footnote.weight(.medium))
              .foregroundColor(.appForegroundAdaptive)
          }
          .padding(.horizontal, 14)
          .padding(.vertical, 10)
          .background(Color.appInputFilled)
          .cornerRadius(10)
          .animation(.easeInOut(duration: 0.2), value: isFavorite)
        }
        .disabled(isTogglingFavorite)
      }
      .padding(.horizontal, 24)
    }
    .scrollClipDisabled()
    .task {
      guard AuthService.shared.isAuthenticated else { return }
      do {
        isFavorite = try await FavoritesService.shared.checkFavorite(
          tmdbId: mediaId, mediaType: apiMediaType
        )
      } catch {}
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

  private func toggleFavorite() async {
    isTogglingFavorite = true
    defer { isTogglingFavorite = false }

    let previous = isFavorite
    let willBeAdded = !previous

    withAnimation(.easeInOut(duration: 0.2)) {
      isFavorite = willBeAdded
    }
    willBeAdded ? Haptics.notification(.success) : Haptics.impact(.light)

    if willBeAdded {
      withAnimation(.spring(response: 0.3, dampingFraction: 0.4)) {
        heartScale = 1.3
      }
      try? await Task.sleep(nanoseconds: 200_000_000)
      withAnimation(.spring(response: 0.25, dampingFraction: 0.6)) {
        heartScale = 1.0
      }
    }

    do {
      let result = try await FavoritesService.shared.toggleFavorite(
        tmdbId: mediaId, mediaType: apiMediaType
      )
      let added = result.action == "added"
      if added != willBeAdded {
        withAnimation(.easeInOut(duration: 0.2)) {
          isFavorite = added
        }
      }
    } catch {
      withAnimation(.easeInOut(duration: 0.2)) {
        isFavorite = previous
      }
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
  }
}
