//
//  FollowersListView.swift
//  Plotwist
//

import SwiftUI

enum FollowListVariant: String, CaseIterable {
  case followers
  case following
}

struct FollowerUser: Identifiable, Hashable {
  let id: String
  let username: String
  let avatarUrl: String?
}

struct FollowersListView: View {
  let userId: String
  let variant: FollowListVariant
  let count: Int
  var onUserSelected: ((FollowerUser) -> Void)? = nil

  @Environment(\.dismiss) private var dismiss
  @State private var items: [FollowerItem] = []
  @State private var isLoading = true
  @State private var nextCursor: String?
  @State private var isLoadingMore = false

  private var title: String {
    switch variant {
    case .followers: return L10n.current.followersLabel
    case .following: return L10n.current.followingLabel
    }
  }

  var body: some View {
    VStack(spacing: 0) {
      RoundedRectangle(cornerRadius: 2.5)
        .fill(Color.gray.opacity(0.4))
        .frame(width: 36, height: 5)
        .padding(.top, 12)
        .padding(.bottom, 16)

      Text(title)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 24)
        .padding(.bottom, 16)

      if isLoading {
        Spacer()
        ProgressView()
        Spacer()
      } else if items.isEmpty {
        emptyView
      } else {
        listContent
      }
    }
    .task {
      await loadInitial()
    }
  }

  private var emptyView: some View {
    VStack(spacing: 12) {
      Spacer()
      Image(systemName: "person.2")
        .font(.system(size: 36))
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.5))
      Text(variant == .followers ? L10n.current.noFollowers : L10n.current.noFollowing)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      Spacer()
    }
  }

  private var listContent: some View {
    ScrollView(showsIndicators: false) {
      LazyVStack(spacing: 0) {
        ForEach(items) { item in
          Button {
            let targetUserId = variant == .followers ? item.followerId : item.followedId
            let user = FollowerUser(id: targetUserId, username: item.username, avatarUrl: item.avatarUrl)
            dismiss()
            onUserSelected?(user)
          } label: {
            followerRow(item)
          }
          .buttonStyle(.plain)
        }

        if nextCursor != nil {
          ProgressView()
            .padding(.vertical, 16)
            .onAppear {
              Task { await loadMore() }
            }
        }
      }
    }
  }

  private func followerRow(_ item: FollowerItem) -> some View {
    HStack(spacing: 12) {
      ProfileAvatar(
        avatarURL: item.avatarImageURL,
        username: item.username,
        size: 44
      )

      HStack(spacing: 6) {
        Text(item.username)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)

        if item.isPro {
          ProBadge(size: .small)
        }
      }

      Spacer()

      Image(systemName: "chevron.right")
        .font(.system(size: 12, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 10)
  }

  private func loadInitial() async {
    defer { isLoading = false }
    do {
      let response: FollowersResponse
      switch variant {
      case .followers:
        response = try await FollowService.shared.getFollowers(followedId: userId, pageSize: 20)
      case .following:
        response = try await FollowService.shared.getFollowers(followerId: userId, pageSize: 20)
      }
      items = response.followers
      nextCursor = response.nextCursor
    } catch {
      print("Error loading \(variant.rawValue): \(error)")
    }
  }

  private func loadMore() async {
    guard !isLoadingMore, let cursor = nextCursor else { return }
    isLoadingMore = true
    defer { isLoadingMore = false }

    do {
      let response: FollowersResponse
      switch variant {
      case .followers:
        response = try await FollowService.shared.getFollowers(followedId: userId, pageSize: 20, cursor: cursor)
      case .following:
        response = try await FollowService.shared.getFollowers(followerId: userId, pageSize: 20, cursor: cursor)
      }
      items.append(contentsOf: response.followers)
      nextCursor = response.nextCursor
    } catch {
      print("Error loading more \(variant.rawValue): \(error)")
    }
  }
}
