//
//  HomeHeaderView.swift
//  Plotwist
//

import SwiftUI

struct HomeHeaderView: View {
  let greeting: String
  let username: String?
  let avatarURL: URL?
  let isLoading: Bool
  var isGuestMode: Bool = false
  var hasDisplayName: Bool = false
  var onAvatarTapped: (() -> Void)?
  var onAvatarLongPressed: (() -> Void)?

  var body: some View {
    HStack(spacing: 16) {
      if isLoading {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 24)
      } else if let username {
        if isGuestMode || hasDisplayName {
          // Show name without @ prefix, same color
          (Text("\(greeting), ")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            + Text("\(username)!")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive))
        } else {
          // Fallback to @username with muted color
          (Text("\(greeting), ")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            + Text("@\(username)!")
            .font(.title2.bold())
            .foregroundColor(.appMutedForegroundAdaptive))
        }
      } else {
        Text(greeting)
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)
      }

      Spacer()

      if isLoading {
        Circle()
          .fill(Color.appBorderAdaptive)
          .frame(width: 44, height: 44)
      } else {
        ProfileAvatar(avatarURL: avatarURL, username: username ?? "", size: 44)
          .onTapGesture {
            onAvatarTapped?()
          }
          .onLongPressGesture(minimumDuration: 3) {
            // Secret debug gesture: long press 3s to reset onboarding
            onAvatarLongPressed?()
          }
      }
    }
  }
}
