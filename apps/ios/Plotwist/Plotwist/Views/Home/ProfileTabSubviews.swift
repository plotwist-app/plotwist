//
//  ProfileTabSubviews.swift
//  Plotwist
//

import SwiftUI

// MARK: - Profile Main Tabs
struct ProfileMainTabs: View {
  @Binding var selectedTab: ProfileMainTab
  @Binding var slideFromTrailing: Bool
  let strings: Strings
  var reviewsCount: Int = 0
  @Namespace private var tabNamespace

  private func badgeCount(for tab: ProfileMainTab) -> Int {
    switch tab {
    case .collection: return 0
    case .reviews: return reviewsCount
    case .stats: return 0
    }
  }

  var body: some View {
    HStack(spacing: 0) {
      ForEach(ProfileMainTab.allCases, id: \.self) { tab in
        Button {
          guard selectedTab != tab else { return }
          slideFromTrailing = tab.index > selectedTab.index
          withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
            selectedTab = tab
          }
        } label: {
          VStack(spacing: 8) {
            HStack(spacing: 6) {
              Text(tab.displayName(strings: strings))
                .font(.subheadline.weight(.medium))
                .foregroundColor(selectedTab == tab ? .appForegroundAdaptive : .appMutedForegroundAdaptive)

              if badgeCount(for: tab) > 0 && selectedTab == tab {
                CollectionCountBadge(count: badgeCount(for: tab))
                  .transition(.scale.combined(with: .opacity))
              }
            }

            ZStack {
              Rectangle()
                .fill(Color.clear)
                .frame(height: 3)

              if selectedTab == tab {
                Rectangle()
                  .fill(Color.appForegroundAdaptive)
                  .frame(height: 3)
                  .matchedGeometryEffect(id: "tabIndicator", in: tabNamespace)
              }
            }
          }
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
      }
    }
    .padding(.horizontal, 24)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

// MARK: - Profile Status Tabs
struct ProfileStatusTabs: View {
  @Binding var selectedTab: ProfileStatusTab
  let strings: Strings
  var statusCounts: [String: Int] = [:]
  var onReorder: (() -> Void)? = nil

  private func count(for tab: ProfileStatusTab) -> Int {
    statusCounts[tab.rawValue] ?? 0
  }

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      HStack(spacing: 8) {
        if let onReorder {
          Button {
            onReorder()
          } label: {
            Image(systemName: "arrow.up.arrow.down")
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
              .frame(width: 34, height: 34)
              .background(Color.appInputFilled)
              .clipShape(Capsule())
          }
          .buttonStyle(.plain)
        }

        ForEach(ProfileStatusTab.allCases, id: \.self) { tab in
          let isSelected = selectedTab == tab

          Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
              selectedTab = tab
            }
          } label: {
            HStack(spacing: 6) {
              Image(systemName: tab.icon)
                .font(.system(size: 12))
                .foregroundColor(isSelected ? tab.color : .appMutedForegroundAdaptive)
                .contentTransition(.interpolate)

              Text(tab.displayName(strings: strings))
                .font(.footnote.weight(.medium))
                .foregroundColor(isSelected ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
                .contentTransition(.interpolate)

              if count(for: tab) > 0 && isSelected {
                CollectionCountBadge(count: count(for: tab))
                  .transition(.scale.combined(with: .opacity))
              }
            }
            .padding(.horizontal, 12)
            .frame(height: 34)
            .background(Color.appInputFilled)
            .clipShape(Capsule())
          }
          .buttonStyle(.plain)
        }
      }
      .padding(.horizontal, 24)
    }
  }
}

// MARK: - Profile Quick Stats
struct ProfileQuickStats: View {
  let moviesCount: Int
  let seriesCount: Int
  let isLoading: Bool
  let strings: Strings

  var body: some View {
    HStack(spacing: 0) {
      // Movies
      HStack(spacing: 6) {
        Text("\(moviesCount)")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .contentTransition(.numericText())

        Text(strings.movies)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      .redacted(reason: isLoading ? .placeholder : [])

      // Divider
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(width: 1, height: 14)
        .padding(.horizontal, 12)

      // Series
      HStack(spacing: 6) {
        Text("\(seriesCount)")
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .contentTransition(.numericText())

        Text(strings.series)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      .redacted(reason: isLoading ? .placeholder : [])

      Spacer()
    }
  }
}
