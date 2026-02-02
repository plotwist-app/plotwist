//
//  SegmentedTabBar.swift
//  Plotwist
//

import SwiftUI

// MARK: - Segmented Tab Protocol
protocol SegmentedTab: Hashable, CaseIterable {
  var title: String { get }
  var isDisabled: Bool { get }
}

// Default implementation for isDisabled
extension SegmentedTab {
  var isDisabled: Bool { false }
}

// MARK: - Segmented Tab Bar
struct SegmentedTabBar<Tab: SegmentedTab>: View where Tab.AllCases: RandomAccessCollection {
  @Binding var selectedTab: Tab
  var onTabChange: (() -> Void)?

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 4) {
        ForEach(Array(Tab.allCases), id: \.self) { tab in
          SegmentedTabItem(
            title: tab.title,
            isSelected: selectedTab == tab,
            isDisabled: tab.isDisabled
          ) {
            if !tab.isDisabled {
              selectedTab = tab
              onTabChange?()
            }
          }
        }
      }
      .padding(4)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 14))
    }
    .scrollClipDisabled()
  }
}

// MARK: - Segmented Tab Item
struct SegmentedTabItem: View {
  let title: String
  let isSelected: Bool
  let isDisabled: Bool
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Text(title)
        .font(.subheadline.weight(.medium))
        .foregroundColor(foregroundColor)
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(backgroundColor)
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .shadow(
          color: isSelected && !isDisabled
            ? Color.black.opacity(0.08)
            : Color.clear,
          radius: 2,
          x: 0,
          y: 1
        )
    }
    .disabled(isDisabled)
  }

  private var foregroundColor: Color {
    if isDisabled {
      return Color.appMutedForegroundAdaptive.opacity(0.5)
    }
    return isSelected ? .appForegroundAdaptive : .appMutedForegroundAdaptive
  }

  private var backgroundColor: Color {
    if isSelected && !isDisabled {
      return Color.appBackgroundAdaptive
    }
    return Color.clear
  }
}
