//
//  UnderlineTabBar.swift
//  Plotwist
//

import SwiftUI

// MARK: - Underline Tab Bar
struct UnderlineTabBar<Tab: SegmentedTab>: View where Tab.AllCases: RandomAccessCollection {
  @Binding var selectedTab: Tab
  var onTabChange: (() -> Void)?
  @Namespace private var namespace

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 0) {
        ForEach(Array(Tab.allCases.enumerated()), id: \.element) { index, tab in
          UnderlineTabItem(
            title: tab.title,
            isSelected: selectedTab == tab,
            isDisabled: tab.isDisabled,
            isFirst: index == 0,
            namespace: namespace
          ) {
            if !tab.isDisabled {
              withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                selectedTab = tab
              }
              onTabChange?()
            }
          }
        }
      }
      .padding(.leading, 24)
      .padding(.trailing, 24)
    }
    .scrollClipDisabled()
    .background(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

// MARK: - Underline Tab Item
struct UnderlineTabItem: View {
  let title: String
  let isSelected: Bool
  let isDisabled: Bool
  let isFirst: Bool
  let namespace: Namespace.ID
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      VStack(spacing: 0) {
        Text(title)
          .font(.subheadline.weight(.medium))
          .foregroundColor(foregroundColor)
          .padding(.leading, isFirst ? 0 : 16)
          .padding(.trailing, 16)
          .padding(.vertical, 12)

        // Indicator matching text width, attached to bottom border
        // Only rounded at top
        UnevenRoundedRectangle(
          topLeadingRadius: 4,
          bottomLeadingRadius: 0,
          bottomTrailingRadius: 0,
          topTrailingRadius: 4
        )
        .fill(isSelected ? Color.appForegroundAdaptive : Color.clear)
        .frame(height: 4)
        .padding(.leading, isFirst ? 0 : 16)
        .padding(.trailing, 16)
        .matchedGeometryEffect(id: "underline", in: namespace, isSource: isSelected)
      }
    }
    .disabled(isDisabled)
  }

  private var foregroundColor: Color {
    if isDisabled {
      return Color.appMutedForegroundAdaptive.opacity(0.5)
    }
    return isSelected ? .appForegroundAdaptive : .appMutedForegroundAdaptive
  }
}
