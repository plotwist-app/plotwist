//
//  ReorderCollectionView.swift
//  Plotwist
//

import SwiftUI
import UniformTypeIdentifiers

// MARK: - Reorder Collection View
struct ReorderCollectionView: View {
  let userId: String
  let selectedStatusTab: ProfileStatusTab
  let strings: Strings
  let statusCounts: [String: Int]
  let cache: CollectionCache

  @Environment(\.dismiss) private var dismiss
  @State private var currentTab: ProfileStatusTab
  @State private var items: [UserItemSummary] = []
  @State private var isLoading = true
  @State private var draggingItem: UserItemSummary?
  @State private var hasChanges = false
  @State private var isSaving = false
  @State private var changedTabs: Set<String> = []
  @State private var editedItemsByTab: [String: [UserItemSummary]] = [:]
  @State private var isWiggling = false

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  init(
    userId: String,
    selectedStatusTab: ProfileStatusTab,
    strings: Strings,
    statusCounts: [String: Int],
    cache: CollectionCache
  ) {
    self.userId = userId
    self.selectedStatusTab = selectedStatusTab
    self.strings = strings
    self.statusCounts = statusCounts
    self.cache = cache
    _currentTab = State(initialValue: selectedStatusTab)
  }

  var body: some View {
    NavigationStack {
      ZStack(alignment: .top) {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        contentView

        headerView
      }
      .navigationBarHidden(true)
    }
    .task {
      await loadItems()
      withAnimation { isWiggling = true }
    }
  }

  // MARK: - Header
  private var headerView: some View {
    ZStack {
      Text(strings.reorderCollection)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)

      HStack {
        Button {
          dismiss()
        } label: {
          Image(systemName: "xmark")
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 36, height: 36)
            .background(Color.appInputFilled)
            .clipShape(Circle())
        }

        Spacer()

        Button {
          Task { await saveAllChanges() }
        } label: {
          Text(strings.save)
            .font(.system(size: 15, weight: .semibold))
            .foregroundColor(
              hasChanges
                ? .appBackgroundAdaptive
                : .appMutedForegroundAdaptive
            )
            .padding(.horizontal, 16)
            .frame(height: 36)
            .background(
              hasChanges
                ? Color.appForegroundAdaptive
                : Color.appInputFilled
            )
            .clipShape(Capsule())
        }
        .disabled(!hasChanges || isSaving)
        .opacity(isSaving ? 0.6 : 1)
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 12)
    .background(Color.appBackgroundAdaptive)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }

  private let headerHeight: CGFloat = 60

  // MARK: - Content
  private var contentView: some View {
    Group {
      if isLoading {
        skeletonGrid
      } else if items.isEmpty {
        emptyState
      } else {
        reorderGrid
      }
    }
  }

  // MARK: - Skeleton
  private var skeletonGrid: some View {
    ScrollView {
      VStack(spacing: 0) {
        statusTabs

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
      .padding(.top, headerHeight)
    }
  }

  // MARK: - Empty State
  private var emptyState: some View {
    ScrollView {
      VStack(spacing: 0) {
        statusTabs

        VStack(spacing: 12) {
          Image(systemName: "rectangle.stack")
            .font(.system(size: 40))
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(strings.noResults)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 80)
      }
      .padding(.top, headerHeight)
    }
  }

  // MARK: - Status Tabs
  private var statusTabs: some View {
    ProfileStatusTabs(
      selectedTab: $currentTab,
      strings: strings,
      statusCounts: statusCounts
    )
    .padding(.top, 8)
    .padding(.bottom, 8)
    .onChange(of: currentTab) { oldTab, _ in
      editedItemsByTab[oldTab.rawValue] = items
      isWiggling = false
      Task {
        await loadItems()
        withAnimation { isWiggling = true }
      }
    }
  }

  // MARK: - Reorder Grid
  private var reorderGrid: some View {
    ScrollView {
      VStack(spacing: 0) {
        statusTabs

        LazyVGrid(columns: columns, spacing: 16) {
          ForEach(items) { item in
            reorderItemCard(item: item)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 8)
        .padding(.bottom, 100)
      }
      .padding(.top, headerHeight)
    }
  }

  private func reorderItemCard(item: UserItemSummary) -> some View {
    var rng = SeededGenerator(seed: item.id.hashValue)
    let duration = Double.random(in: 0.14...0.22, using: &rng)
    let angle: Double = isWiggling ? 0.6 : -0.6

    return ProfileItemCard(tmdbId: item.tmdbId, mediaType: item.mediaType)
      .contentShape(
        .dragPreview,
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
      )
      .rotationEffect(.degrees(angle), anchor: .center)
      .animation(
        .easeInOut(duration: duration)
          .repeatForever(autoreverses: true),
        value: isWiggling
      )
      .onDrag {
        draggingItem = item
        return NSItemProvider(object: item.id as NSString)
      }
      .onDrop(of: [.text], delegate: ReorderDropDelegate(
        item: item,
        items: $items,
        draggingItem: $draggingItem,
        hasChanges: $hasChanges,
        currentTab: currentTab,
        changedTabs: $changedTabs
      ))
  }

  // MARK: - Load Items
  private func loadItems() async {
    if let edited = editedItemsByTab[currentTab.rawValue] {
      items = edited
      isLoading = false
      return
    }

    isLoading = true
    defer { isLoading = false }

    if let cachedItems = cache.getItems(userId: userId, status: currentTab.rawValue) {
      items = cachedItems
      return
    }

    do {
      let fetchedItems = try await UserItemService.shared.getAllUserItems(
        userId: userId,
        status: currentTab.rawValue
      )
      items = fetchedItems
    } catch {
      print("Error loading items for reorder: \(error)")
      items = []
    }
  }

  // MARK: - Save
  private func saveAllChanges() async {
    isSaving = true
    defer { isSaving = false }

    editedItemsByTab[currentTab.rawValue] = items

    do {
      for tab in changedTabs {
        if let tabItems = editedItemsByTab[tab] {
          cache.setItems(tabItems, userId: userId, status: tab)
          try await UserItemService.shared.reorderUserItems(
            status: tab,
            orderedIds: tabItems.map(\.id)
          )
        }
      }
    } catch {
      print("Error saving collection order: \(error)")
    }

    hasChanges = false
    changedTabs = []
    editedItemsByTab = [:]
    cache.invalidateCache()
    dismiss()
  }
}

// MARK: - Reorder Drop Delegate
struct ReorderDropDelegate: DropDelegate {
  let item: UserItemSummary
  @Binding var items: [UserItemSummary]
  @Binding var draggingItem: UserItemSummary?
  @Binding var hasChanges: Bool
  let currentTab: ProfileStatusTab
  @Binding var changedTabs: Set<String>

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

    hasChanges = true
    changedTabs.insert(currentTab.rawValue)
  }

  func performDrop(info: DropInfo) -> Bool {
    draggingItem = nil
    return true
  }

  func dropUpdated(info: DropInfo) -> DropProposal? {
    DropProposal(operation: .move)
  }
}

// MARK: - Seeded Random Generator
private struct SeededGenerator: RandomNumberGenerator {
  var state: UInt64

  init(seed: Int) {
    state = UInt64(bitPattern: Int64(seed))
  }

  mutating func next() -> UInt64 {
    state &+= 0x9E3779B97F4A7C15
    var z = state
    z = (z ^ (z >> 30)) &* 0xBF58476D1CE4E5B9
    z = (z ^ (z >> 27)) &* 0x94D049BB133111EB
    return z ^ (z >> 31)
  }
}
