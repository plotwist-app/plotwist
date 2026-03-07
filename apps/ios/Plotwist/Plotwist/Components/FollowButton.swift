//
//  FollowButton.swift
//  Plotwist
//

import SwiftUI

struct FollowButton: View {
  let userId: String
  @Binding var followersCount: Int
  var onFollowChanged: ((Bool) -> Void)? = nil

  @State private var isFollowing = false
  @State private var theyFollowMe = false
  @State private var isLoading = true
  @State private var isProcessing = false

  private var buttonLabel: String {
    if isFollowing {
      return L10n.current.unfollowAction
    } else if theyFollowMe {
      return L10n.current.followBackAction
    } else {
      return L10n.current.followAction
    }
  }

  var body: some View {
    Button {
      Task { await toggleFollow() }
    } label: {
      HStack(spacing: 6) {
        if isLoading || isProcessing {
          ProgressView()
            .progressViewStyle(CircularProgressViewStyle())
            .scaleEffect(0.7)
            .frame(width: 13, height: 13)
        } else {
          Image(systemName: isFollowing ? "person.fill.checkmark" : "person.badge.plus")
            .font(.system(size: 13))
            .foregroundColor(.appForegroundAdaptive)
        }

        Text(buttonLabel)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.horizontal, 14)
      .padding(.vertical, 10)
      .background(Color.appInputFilled)
      .cornerRadius(10)
      .opacity(isLoading ? 0.5 : 1)
    }
    .disabled(isLoading || isProcessing)
    .task { await checkFollowStatus() }
  }

  private func checkFollowStatus() async {
    defer { isLoading = false }

    async let followCheck = FollowService.shared.getFollow(userId: userId)
    async let reverseCheck = FollowService.shared.doesUserFollowMe(userId: userId)

    do {
      let follow = try await followCheck
      isFollowing = follow != nil
    } catch {
      isFollowing = false
    }

    do {
      theyFollowMe = try await reverseCheck
    } catch {
      theyFollowMe = false
    }
  }

  private func toggleFollow() async {
    isProcessing = true
    defer { isProcessing = false }

    let wasFollowing = isFollowing

    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
      isFollowing.toggle()
      followersCount += isFollowing ? 1 : -1
    }
    Haptics.impact(isFollowing ? .medium : .light)

    do {
      if wasFollowing {
        try await FollowService.shared.unfollowUser(userId: userId)
      } else {
        try await FollowService.shared.followUser(userId: userId)
      }
      onFollowChanged?(isFollowing)
    } catch {
      withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
        isFollowing = wasFollowing
        followersCount += wasFollowing ? 1 : -1
      }
    }
  }
}
