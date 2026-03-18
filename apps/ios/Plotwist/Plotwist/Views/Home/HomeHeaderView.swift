//
//  HomeHeaderView.swift
//  Plotwist
//

import SwiftUI

struct HomeHeaderView: View {
  let greeting: String
  let username: String?
  let isLoading: Bool
  var isGuestMode: Bool = false
  var hasDisplayName: Bool = false
  var onNotificationsTapped: (() -> Void)?

  @ObservedObject private var recommendationStore = RecommendationStore.shared

  var body: some View {
    HStack(spacing: 16) {
      if isLoading {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 24)
      } else if let username {
        if isGuestMode || hasDisplayName {
          (Text("\(greeting), ")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            + Text("\(username)!")
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive))
        } else {
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
          .frame(width: 32, height: 32)
      } else {
        Button {
          onNotificationsTapped?()
        } label: {
          ZStack(alignment: .topTrailing) {
            Image(systemName: "bell")
              .font(.system(size: 20))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 32, height: 32)

            if recommendationStore.unreadCount > 0 {
              Circle()
                .fill(Color.appDestructive)
                .frame(width: 8, height: 8)
                .offset(x: 2, y: -1)
            }
          }
        }
      }
    }
  }
}
