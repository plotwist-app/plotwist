//
//  HomePrefetchService.swift
//  Plotwist
//
//  Prefetches home screen data in the background so it's ready when the user arrives.
//

import Foundation

final class HomePrefetchService {
  static let shared = HomePrefetchService()
  private init() {}

  private var prefetchTask: Task<Void, Never>?

  /// Start prefetching home data in the background.
  /// Call this when the onboarding celebration screen appears,
  /// so data is cached before the user taps "Go to Home".
  func prefetchHomeData() {
    // Avoid duplicate prefetch
    guard prefetchTask == nil else { return }

    prefetchTask = Task {
      let cache = HomeDataCache.shared
      let language = Language.current.rawValue
      let onboarding = OnboardingService.shared
      let contentTypes = onboarding.contentTypes

      let showMovies = contentTypes.contains(.movies) || contentTypes.isEmpty
      let showSeries = contentTypes.contains(.series) || contentTypes.isEmpty
      let showAnime = contentTypes.contains(.anime)
      let showDorama = contentTypes.contains(.dorama)

      await withTaskGroup(of: Void.self) { group in
        // Featured item (hero card)
        group.addTask {
          do {
            let items = try await self.loadContentForPreferences(
              language: language, contentTypes: contentTypes
            )
            let withBackdrop = items.filter { $0.backdropPath != nil }
            if let best = withBackdrop.first {
              cache.setFeaturedItem(best)

              // Prefetch hero backdrop image
              if let url = best.hdBackdropURL ?? best.backdropURL {
                ImageCache.shared.prefetch(urls: [url], priority: .high)
              }

              // Cache trending (excluding featured)
              let trending = Array(items.filter { $0.id != best.id }.prefix(10))
              cache.setTrendingItems(trending)
            }
          } catch {}
        }

        // Popular movies
        if showMovies {
          group.addTask {
            do {
              let result = try await TMDBService.shared.getPopularMovies(language: language)
              cache.setPopularMovies(result.results)
            } catch {}
          }
        }

        // Popular TV series
        if showSeries {
          group.addTask {
            do {
              let result = try await TMDBService.shared.getPopularTVSeries(language: language)
              cache.setPopularTVSeries(result.results)
            } catch {}
          }
        }

        // Now playing movies
        if showMovies {
          group.addTask {
            do {
              let result = try await TMDBService.shared.getNowPlayingMovies(language: language)
              cache.setNowPlayingItems(result.results)
            } catch {}
          }
        }

        // Airing today TV series
        if showSeries {
          group.addTask {
            do {
              let result = try await TMDBService.shared.getAiringTodayTVSeries(language: language)
              cache.setAiringTodayItems(result.results)
            } catch {}
          }
        }

        // Anime
        if showAnime {
          group.addTask {
            do {
              let result = try await TMDBService.shared.getPopularAnimes(language: language)
              cache.setAnimeItems(result.results)
            } catch {}
          }
        }

        // Dorama
        if showDorama {
          group.addTask {
            do {
              let result = try await TMDBService.shared.getPopularDoramas(language: language)
              cache.setDoramaItems(result.results)
            } catch {}
          }
        }

        // Top rated
        group.addTask {
          do {
            let result: PaginatedResult
            if showAnime && !showMovies && !showSeries {
              result = try await TMDBService.shared.getTopRatedAnimes(language: language)
            } else if showDorama && !showMovies && !showSeries {
              result = try await TMDBService.shared.getTopRatedDoramas(language: language)
            } else if showMovies {
              result = try await TMDBService.shared.getTopRatedMovies(language: language)
            } else {
              result = try await TMDBService.shared.getTopRatedTVSeries(language: language)
            }
            cache.setTopRatedItems(result.results)
          } catch {}
        }
      }

      prefetchTask = nil
    }
  }

  /// Loads trending content based on user's content type preferences.
  private func loadContentForPreferences(
    language: String,
    contentTypes: Set<ContentTypePreference>
  ) async throws -> [SearchResult] {
    guard !contentTypes.isEmpty else {
      return try await TMDBService.shared.getTrending(
        mediaType: "all", timeWindow: "week", language: language
      )
    }

    var allItems: [SearchResult] = []

    try await withThrowingTaskGroup(of: [SearchResult].self) { group in
      if contentTypes.contains(.movies) {
        group.addTask {
          try await TMDBService.shared.getTrending(
            mediaType: "movie", timeWindow: "week", language: language
          )
        }
      }

      if contentTypes.contains(.series) {
        group.addTask {
          try await TMDBService.shared.getTrending(
            mediaType: "tv", timeWindow: "week", language: language
          )
        }
      }

      if contentTypes.contains(.anime) {
        group.addTask {
          let result = try await TMDBService.shared.getPopularAnimes(language: language)
          return result.results
        }
      }

      if contentTypes.contains(.dorama) {
        group.addTask {
          let result = try await TMDBService.shared.getPopularDoramas(language: language)
          return result.results
        }
      }

      for try await items in group {
        allItems.append(contentsOf: items)
      }
    }

    allItems.shuffle()
    return allItems
  }
}
