//
//  ProfilePrefetchService.swift
//  Plotwist
//
//  Prefetches profile data in the background so it's ready when the user arrives.
//

import Foundation

final class ProfilePrefetchService {
  static let shared = ProfilePrefetchService()
  private init() {}

  private var collectionPrefetchTask: Task<Void, Never>?
  private var reviewsStatsPrefetchTask: Task<Void, Never>?

  // MARK: - Prefetch Collection

  /// Prefetch collection data before the user opens the profile tab.
  /// Call this from HomeTabView after home data finishes loading.
  func prefetchCollection() {
    guard collectionPrefetchTask == nil else { return }
    guard AuthService.shared.isAuthenticated else { return }

    let collectionCache = CollectionCache.shared

    // Skip if cache already has data
    guard !collectionCache.isDataAvailable else {
      return
    }

    collectionPrefetchTask = Task {
      do {
        let user = try await AuthService.shared.getCurrentUser()
        collectionCache.setUser(user)

        await withTaskGroup(of: Void.self) { group in
          // Prefetch WATCHED items (default status tab)
          group.addTask {
            do {
              let items = try await UserItemService.shared.getAllUserItems(
                userId: user.id,
                status: ProfileStatusTab.watched.rawValue
              )
              collectionCache.setItems(items, userId: user.id, status: ProfileStatusTab.watched.rawValue)
            } catch {}
          }

          // Prefetch status counts
          group.addTask {
            do {
              let stats = try await UserStatsService.shared.getItemsStatus(userId: user.id)
              var counts: [String: Int] = [:]
              for stat in stats {
                counts[stat.status] = stat.count
              }
              collectionCache.setStatusCounts(counts)
            } catch {}
          }

          // Prefetch reviews count
          group.addTask {
            do {
              let count = try await ReviewService.shared.getUserReviewsCount(userId: user.id)
              collectionCache.setReviewsCount(count)
            } catch {}
          }

          // Prefetch quick stats (movies/series counts)
          group.addTask {
            do {
              let userStats = try await UserStatsService.shared.getUserStats(userId: user.id)
              collectionCache.setQuickStats(
                moviesCount: userStats.watchedMoviesCount,
                seriesCount: userStats.watchedSeriesCount
              )
            } catch {}
          }
        }
      } catch {}

      collectionPrefetchTask = nil
    }
  }

  // MARK: - Prefetch Reviews & Stats

  /// Prefetch reviews and stats data when the user opens the profile tab.
  /// Call this from ProfileTabView once we have the userId, so data is
  /// cached before the user switches to the Reviews or Stats tabs.
  func prefetchReviewsAndStats(userId: String) {
    guard reviewsStatsPrefetchTask == nil else { return }

    reviewsStatsPrefetchTask = Task {
      await withTaskGroup(of: Void.self) { group in
        // Prefetch detailed reviews (first page)
        group.addTask {
          let reviewsCache = ProfileReviewsCache.shared
          guard reviewsCache.get(userId: userId) == nil else { return }
          do {
            let response = try await ReviewService.shared.getUserDetailedReviews(
              userId: userId,
              page: 1,
              limit: 20
            )
            reviewsCache.set(
              userId: userId,
              reviews: response.reviews,
              hasMore: response.pagination.hasMore,
              currentPage: 1
            )
          } catch {}
        }

        // Prefetch stats for current month (timeline default view)
        group.addTask {
          let statsCache = ProfileStatsCache.shared
          let currentMonth = MonthSection.currentYearMonth()
          guard statsCache.get(userId: userId, period: currentMonth) == nil else { return }
          let language = Language.current.rawValue
          do {
            async let hoursTask = UserStatsService.shared.getTotalHours(userId: userId, period: currentMonth)
            async let genresTask = UserStatsService.shared.getWatchedGenres(
              userId: userId,
              language: language,
              period: currentMonth
            )
            async let reviewsTask = UserStatsService.shared.getBestReviews(
              userId: userId,
              language: language,
              period: currentMonth
            )
            let (hoursResponse, genres, reviews) = try await (
              hoursTask, genresTask, reviewsTask
            )

            statsCache.set(
              userId: userId,
              period: currentMonth,
              totalHours: hoursResponse.totalHours,
              watchedGenres: genres,
              bestReviews: reviews
            )
          } catch {}
        }
      }

      reviewsStatsPrefetchTask = nil
    }
  }
}
