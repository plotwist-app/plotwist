//
//  ProfileTabView+DataLoading.swift
//  Plotwist
//

import SwiftUI

extension ProfileTabView {
  // MARK: - Cache Restore
  func restoreFromCache() {
    if let cachedUser = cache.user {
      user = cachedUser
    }
    if let cachedCounts = cache.getStatusCounts() {
      statusCounts = cachedCounts
    }
    if let cachedReviewsCount = cache.getReviewsCount() {
      totalReviewsCount = cachedReviewsCount
    }
    if let cached = cache.getQuickStats() {
      moviesCount = cached.moviesCount
      seriesCount = cached.seriesCount
      isLoadingQuickStats = false
    }
    if let userId = user?.id ?? cache.user?.id,
       let cachedItems = cache.getItems(userId: userId, status: selectedStatusTab.rawValue) {
      userItems = cachedItems
    }
  }

  // MARK: - Load All Data
  func loadData() async {
    if cache.isDataAvailable {
      isInitialLoad = false
    }

    await loadUser()

    if let userId = user?.id {
      ProfilePrefetchService.shared.prefetchReviewsAndStats(userId: userId)
    }

    await loadUserItems()
    await loadStatusCounts()
    await loadQuickStats()
    await loadTotalReviewsCount()

    isInitialLoad = false
  }

  // MARK: - Load User
  func loadUser(forceRefresh: Bool = false) async {
    if !forceRefresh, let cachedUser = cache.user {
      user = cachedUser
      return
    }

    do {
      let fetchedUser = try await AuthService.shared.getCurrentUser()
      user = fetchedUser
      cache.setUser(fetchedUser)
      AnalyticsService.shared.track(.profileViewed(userId: fetchedUser.id, isOwnProfile: true))
    } catch {
      print("Error loading user: \(error)")
      user = nil
    }
  }

  // MARK: - Load User Items
  func loadUserItems(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh,
       let cachedItems = cache.getItems(userId: userId, status: selectedStatusTab.rawValue) {
      userItems = cachedItems
      return
    }

    isLoadingItems = true
    defer { isLoadingItems = false }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: userId,
        status: selectedStatusTab.rawValue
      )
      userItems = items
      cache.setItems(items, userId: userId, status: selectedStatusTab.rawValue)
    } catch {
      print("Error loading user items: \(error)")
      userItems = []
    }
  }

  // MARK: - Load Status Counts
  func loadStatusCounts(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cachedCounts = cache.getStatusCounts() {
      statusCounts = cachedCounts
      return
    }

    do {
      let stats = try await UserStatsService.shared.getItemsStatus(userId: userId)
      var counts: [String: Int] = [:]
      for stat in stats {
        counts[stat.status] = stat.count
      }
      statusCounts = counts
      cache.setStatusCounts(counts)
    } catch {
      print("Error loading status counts: \(error)")
      statusCounts = [:]
    }
  }

  // MARK: - Load Quick Stats
  func loadQuickStats(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cached = cache.getQuickStats() {
      if moviesCount != cached.moviesCount || seriesCount != cached.seriesCount {
        withAnimation(.snappy) {
          moviesCount = cached.moviesCount
          seriesCount = cached.seriesCount
        }
      }
      isLoadingQuickStats = false
      return
    }

    do {
      let stats = try await UserStatsService.shared.getUserStats(userId: userId)
      withAnimation(.snappy) {
        moviesCount = stats.watchedMoviesCount
        seriesCount = stats.watchedSeriesCount
      }
      cache.setQuickStats(moviesCount: stats.watchedMoviesCount, seriesCount: stats.watchedSeriesCount)
    } catch {
      print("Error loading quick stats: \(error)")
    }
    isLoadingQuickStats = false
  }

  // MARK: - Load Reviews Count
  func loadTotalReviewsCount(forceRefresh: Bool = false) async {
    guard let userId = user?.id else { return }

    if !forceRefresh, let cachedCount = cache.getReviewsCount() {
      totalReviewsCount = cachedCount
      return
    }

    do {
      let count = try await ReviewService.shared.getUserReviewsCount(userId: userId)
      totalReviewsCount = count
      cache.setReviewsCount(count)
    } catch {
      print("Error loading reviews count: \(error)")
      totalReviewsCount = 0
    }
  }

  // MARK: - Change Item Status
  func changeItemStatus(item: UserItemSummary, to newStatus: UserItemStatus) async {
    guard newStatus.rawValue != selectedStatusTab.rawValue else { return }

    do {
      _ = try await UserItemService.shared.upsertUserItem(
        tmdbId: item.tmdbId,
        mediaType: item.mediaType,
        status: newStatus
      )

      AnalyticsService.shared.track(.mediaStatusChanged(
        tmdbId: item.tmdbId,
        mediaType: item.mediaType == "MOVIE" ? "movie" : "tv",
        status: newStatus.rawValue,
        source: "collection_context_menu"
      ))

      // Optimistic quick stats update
      let isMovie = item.mediaType == "MOVIE"
      let wasWatched = selectedStatusTab == .watched
      let willBeWatched = newStatus == .watched

      if wasWatched || willBeWatched {
        withAnimation(.snappy) {
          if wasWatched && !willBeWatched {
            if isMovie { moviesCount = max(0, moviesCount - 1) }
            else { seriesCount = max(0, seriesCount - 1) }
          } else if !wasWatched && willBeWatched {
            if isMovie { moviesCount += 1 }
            else { seriesCount += 1 }
          }
        }
        cache.setQuickStats(moviesCount: moviesCount, seriesCount: seriesCount)
      }

      await animateItemRemoval(item: item)

      cache.clearCache()
      if let userId = user?.id {
        cache.setItems(userItems, userId: userId, status: selectedStatusTab.rawValue)
      }
      await loadStatusCounts(forceRefresh: true)
    } catch {
      print("Error changing item status: \(error)")
    }
  }

  // MARK: - Remove Item
  func removeItem(item: UserItemSummary) async {
    do {
      try await UserItemService.shared.deleteUserItem(
        id: item.id,
        tmdbId: item.tmdbId,
        mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
      )

      AnalyticsService.shared.track(.mediaStatusRemoved(
        tmdbId: item.tmdbId,
        mediaType: item.mediaType == "MOVIE" ? "movie" : "tv"
      ))

      // Optimistic quick stats update
      if selectedStatusTab == .watched {
        withAnimation(.snappy) {
          if item.mediaType == "MOVIE" { moviesCount = max(0, moviesCount - 1) }
          else { seriesCount = max(0, seriesCount - 1) }
        }
        cache.setQuickStats(moviesCount: moviesCount, seriesCount: seriesCount)
      }

      await animateItemRemoval(item: item)

      cache.clearCache()
      if let userId = user?.id {
        cache.setItems(userItems, userId: userId, status: selectedStatusTab.rawValue)
      }
      await loadStatusCounts(forceRefresh: true)
    } catch {
      print("Error removing item: \(error)")
    }
  }

  // MARK: - Animate Item Removal
  func animateItemRemoval(item: UserItemSummary) async {
    withAnimation(.easeOut(duration: 0.2)) {
      removingItemIds.insert(item.id)
    }

    try? await Task.sleep(nanoseconds: 250_000_000)

    withAnimation(.spring(response: 0.45, dampingFraction: 0.86)) {
      userItems.removeAll { $0.id == item.id }
      removingItemIds.remove(item.id)
    }
  }

  // MARK: - Save Collection Order
  func saveCollectionOrder() {
    guard let userId = user?.id else { return }
    let orderedIds = userItems.map(\.id)
    cache.setItems(userItems, userId: userId, status: selectedStatusTab.rawValue)
    Task {
      do {
        try await UserItemService.shared.reorderUserItems(
          status: selectedStatusTab.rawValue,
          orderedIds: orderedIds
        )
      } catch {
        print("Error saving collection order: \(error)")
      }
    }
  }
}
