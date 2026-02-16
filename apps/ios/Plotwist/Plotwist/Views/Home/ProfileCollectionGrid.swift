//
//  ProfileCollectionGrid.swift
//  Plotwist
//

import SwiftUI

// MARK: - Profile Collection Grid
struct ProfileCollectionGrid: View {
  @Binding var userItems: [UserItemSummary]
  let isLoadingItems: Bool
  let removingItemIds: Set<String>
  let selectedStatusTab: ProfileStatusTab
  let strings: Strings
  var onChangeStatus: (UserItemSummary, UserItemStatus) async -> Void
  var onRemoveItem: (UserItemSummary) async -> Void
  var onTapItem: (UserItemSummary) -> Void

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    if isLoadingItems {
      skeletonGrid
    } else if userItems.isEmpty {
      emptyGrid
    } else {
      itemsGrid
    }
  }

  // MARK: - Skeleton Loading
  private var skeletonGrid: some View {
    LazyVGrid(columns: columns, spacing: 16) {
      ForEach(0..<6, id: \.self) { _ in
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
          .aspectRatio(2 / 3, contentMode: .fit)
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  // MARK: - Empty State
  private var emptyGrid: some View {
    LazyVGrid(columns: columns, spacing: 16) {
      Button {
        NotificationCenter.default.post(name: .navigateToSearch, object: nil)
      } label: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8, 4]))
          .foregroundColor(.appBorderAdaptive)
          .aspectRatio(2 / 3, contentMode: .fit)
          .background(
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.clear)
          )
          .contentShape(Rectangle())
          .overlay(
            Image(systemName: "plus")
              .font(.system(size: 24, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      }
      .buttonStyle(.plain)
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  // MARK: - Items Grid
  private var itemsGrid: some View {
    LazyVGrid(columns: columns, spacing: 16) {
      ForEach(userItems) { item in
        ProfileItemCard(tmdbId: item.tmdbId, mediaType: item.mediaType)
          .onTapGesture {
            onTapItem(item)
          }
          .opacity(removingItemIds.contains(item.id) ? 0 : 1)
          .scaleEffect(removingItemIds.contains(item.id) ? 0.75 : 1)
          .contextMenu {
            contextMenuContent(for: item)
          } preview: {
            CachedPosterPreview(tmdbId: item.tmdbId, mediaType: item.mediaType, width: 200)
          }
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  // MARK: - Context Menu
  @ViewBuilder
  private func contextMenuContent(for item: UserItemSummary) -> some View {
    let currentStatus = UserItemStatus(rawValue: selectedStatusTab.rawValue)

    ForEach(UserItemStatus.allCases, id: \.rawValue) { status in
      Button {
        if status != currentStatus {
          Task { await onChangeStatus(item, status) }
        }
      } label: {
        Label {
          Text(status.displayName(strings: strings))
        } icon: {
          Image(systemName: status == currentStatus ? "checkmark" : status.icon)
        }
      }
      .disabled(status == currentStatus)
    }

    Divider()

    Button(role: .destructive) {
      Task { await onRemoveItem(item) }
    } label: {
      Label(strings.delete, systemImage: "trash")
    }
  }
}

