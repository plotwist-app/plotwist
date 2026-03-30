//
//  ProStatsCardShell.swift
//  Plotwist
//

import SwiftUI

enum ProStatsCardShell {
  static func skeletonTitle() -> some View {
    RoundedRectangle(cornerRadius: 4)
      .fill(Color.appBorderAdaptive.opacity(0.4))
      .frame(width: 100, height: 12)
      .modifier(ShimmerEffect())
  }

  static func shell<Content: View>(
    trailing: Bool = false,
    @ViewBuilder content: () -> Content
  ) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        skeletonTitle()
        Spacer()
        if trailing {
          Circle()
            .fill(Color.appBorderAdaptive.opacity(0.3))
            .frame(width: 20, height: 20)
            .modifier(ShimmerEffect())
        }
      }
      .padding(.bottom, 16)
      content()
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }

  @ViewBuilder
  static func card<Content: View>(
    title: String,
    icon: String? = nil,
    @ViewBuilder content: () -> Content
  ) -> some View {
    card(title: title, icon: icon, trailing: { EmptyView() }, content: content)
  }

  @ViewBuilder
  static func card<Content: View, Trailing: View>(
    title: String,
    icon: String? = nil,
    @ViewBuilder trailing: () -> Trailing,
    @ViewBuilder content: () -> Content
  ) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        HStack(spacing: 4) {
          if let icon {
            Image(systemName: icon)
              .font(.system(size: 11, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          Text(title)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        Spacer()
        trailing()
      }
      .padding(.bottom, 16)
      content()
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }
}
