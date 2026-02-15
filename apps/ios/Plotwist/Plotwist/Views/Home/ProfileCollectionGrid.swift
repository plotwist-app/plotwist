//
//  ProfileCollectionGrid.swift
//  Plotwist
//

import SwiftUI
import UniformTypeIdentifiers

// MARK: - Profile Collection Grid
struct ProfileCollectionGrid: View {
  @Binding var userItems: [UserItemSummary]
  @Binding var draggingItem: UserItemSummary?
  let isLoadingItems: Bool
  let removingItemIds: Set<String>
  let selectedStatusTab: ProfileStatusTab
  let strings: Strings
  var onChangeStatus: (UserItemSummary, UserItemStatus) async -> Void
  var onRemoveItem: (UserItemSummary) async -> Void
  var onReorder: () -> Void
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
          .contentShape(
            .dragPreview,
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          )
          .onTapGesture {
            onTapItem(item)
          }
          .onDrag {
            withAnimation(.easeInOut(duration: 0.2)) {
              draggingItem = item
            }
            return NSItemProvider(object: item.id as NSString)
          }
          .opacity(removingItemIds.contains(item.id) ? 0 : 1)
          .scaleEffect(removingItemIds.contains(item.id) ? 0.75 : 1)
          .onDrop(of: [.text], delegate: CollectionReorderDelegate(
            item: item,
            items: $userItems,
            draggingItem: $draggingItem,
            onReorder: onReorder
          ))
          .contextMenu {
            contextMenuContent(for: item)
          } preview: {
            CachedPosterPreview(tmdbId: item.tmdbId, mediaType: item.mediaType, width: 200)
          }
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
    .onDrop(of: [.text], delegate: GridFallbackDropDelegate(
      draggingItem: $draggingItem,
      onReorder: onReorder
    ))
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

// MARK: - Collection Reorder Delegate
struct CollectionReorderDelegate: DropDelegate {
  let item: UserItemSummary
  @Binding var items: [UserItemSummary]
  @Binding var draggingItem: UserItemSummary?
  var onReorder: () -> Void

  func dropEntered(info: DropInfo) {
    guard let draggingItem,
          draggingItem.id != item.id,
          let from = items.firstIndex(where: { $0.id == draggingItem.id }),
          let to = items.firstIndex(where: { $0.id == item.id })
    else { return }

    withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
      items.move(fromOffsets: IndexSet(integer: from),
                 toOffset: to > from ? to + 1 : to)
    }
  }

  func performDrop(info: DropInfo) -> Bool {
    withAnimation(.easeInOut(duration: 0.2)) {
      draggingItem = nil
    }
    onReorder()
    return true
  }

  func dropUpdated(info: DropInfo) -> DropProposal? {
    DropProposal(operation: .move)
  }
}

// MARK: - Grid Fallback Drop Delegate
/// Catches drops that land between grid items (in the grid area but not on a specific item)
struct GridFallbackDropDelegate: DropDelegate {
  @Binding var draggingItem: UserItemSummary?
  var onReorder: () -> Void

  func performDrop(info: DropInfo) -> Bool {
    withAnimation(.easeInOut(duration: 0.2)) {
      draggingItem = nil
    }
    onReorder()
    return true
  }

  func dropUpdated(info: DropInfo) -> DropProposal? {
    DropProposal(operation: .move)
  }
}
