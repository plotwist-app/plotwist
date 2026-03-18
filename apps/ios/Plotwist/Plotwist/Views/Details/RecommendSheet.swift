//
//  RecommendSheet.swift
//  Plotwist
//

import SwiftUI

struct RecommendSheet: View {
  let mediaId: Int
  let mediaType: String
  let mediaTitle: String
  let mediaPosterPath: String?
  let mediaOverview: String?

  @Environment(\.dismiss) private var dismiss
  @State private var friends: [FollowerItem] = []
  @State private var isLoading = true
  @State private var selectedIds: Set<String> = []
  @State private var isSending = false
  @State private var didSend = false
  @State private var message = ""
  @State private var strings = L10n.current
  @FocusState private var isMessageFocused: Bool

  private let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 3)

  var body: some View {
    VStack(spacing: 0) {
      RoundedRectangle(cornerRadius: 2.5)
        .fill(Color.gray.opacity(0.4))
        .frame(width: 36, height: 5)
        .padding(.top, 12)
        .padding(.bottom, 20)

      if isLoading {
        Spacer()
        ProgressView()
        Spacer()
      } else if friends.isEmpty {
        emptyView
      } else {
        // Scrollable grid
        ScrollView(showsIndicators: false) {
          LazyVGrid(columns: columns, spacing: 16) {
            ForEach(friends) { friend in
              friendCell(friend)
            }
          }
          .padding(.horizontal, 24)
          .padding(.bottom, 16)
        }

        VStack(spacing: 12) {
          TextField(strings.addAMessage, text: $message, axis: .vertical)
            .font(.subheadline)
            .lineLimit(2...3)
            .padding(12)
            .background(Color.appInputFilled)
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.input))
            .focused($isMessageFocused)

          Button {
            sendRecommendations()
          } label: {
            if didSend {
              HStack(spacing: 6) {
                Image(systemName: "checkmark")
                  .font(.system(size: 14, weight: .semibold))
                Text(strings.sent)
                  .fontWeight(.semibold)
              }
              .frame(maxWidth: .infinity)
              .frame(height: 48)
              .background(Color.appInputFilled)
              .foregroundColor(.appMutedForegroundAdaptive)
              .clipShape(Capsule())
            } else {
              Text(strings.recommend)
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(selectedIds.isEmpty ? Color.appInputFilled : Color.appForegroundAdaptive)
                .foregroundColor(selectedIds.isEmpty ? .appMutedForegroundAdaptive : .appBackgroundAdaptive)
                .clipShape(Capsule())
            }
          }
          .disabled(selectedIds.isEmpty || isSending || didSend)
          .animation(.easeInOut(duration: 0.2), value: selectedIds.isEmpty)
          .animation(.easeInOut(duration: 0.2), value: didSend)
        }
        .padding(.horizontal, 24)
        .padding(.top, 12)
        .padding(.bottom, 8)
        .overlay(alignment: .top) {
          Rectangle()
            .fill(Color.appBorderAdaptive)
            .frame(height: 1)
        }
      }
    }
    .task {
      await loadFriends()
    }
  }

  private var emptyView: some View {
    VStack(spacing: 12) {
      Spacer()
      Image(systemName: "person.2")
        .font(.system(size: 36))
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.5))
      Text(strings.noFollowing)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      Spacer()
    }
  }

  private func friendCell(_ friend: FollowerItem) -> some View {
    let targetId = friend.followedId
    let isSelected = selectedIds.contains(targetId)

    return Button {
      withAnimation(.easeInOut(duration: 0.15)) {
        if isSelected {
          selectedIds.remove(targetId)
        } else {
          selectedIds.insert(targetId)
        }
      }
      Haptics.selection()
    } label: {
      VStack(spacing: 8) {
        ZStack(alignment: .bottomTrailing) {
          ProfileAvatar(
            avatarURL: friend.avatarImageURL,
            username: friend.username,
            size: 72
          )

          if isSelected {
            Image(systemName: "checkmark.circle.fill")
              .font(.system(size: 22))
              .foregroundStyle(Color.appForegroundAdaptive, Color.appBackgroundAdaptive)
              .offset(x: 2, y: 2)
          }
        }

        Text(friend.username)
          .font(.caption)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(1)
      }
    }
    .buttonStyle(.plain)
  }

  private func sendRecommendations() {
    isSending = true

    for friend in friends where selectedIds.contains(friend.followedId) {
      RecommendationStore.shared.send(
        toUserId: friend.followedId,
        mediaId: mediaId,
        mediaType: mediaType,
        mediaTitle: mediaTitle,
        mediaPosterPath: mediaPosterPath,
        mediaOverview: mediaOverview,
        message: message
      )
    }

    Haptics.notification(.success)
    withAnimation(.easeInOut(duration: 0.2)) {
      didSend = true
      isSending = false
    }

    DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
      dismiss()
    }
  }

  private func loadFriends() async {
    defer { isLoading = false }
    guard let userId = CollectionCache.shared.user?.id else { return }

    do {
      let response = try await FollowService.shared.getFollowers(
        followerId: userId,
        pageSize: 50
      )
      friends = response.followers
    } catch {
      friends = []
    }
  }
}
