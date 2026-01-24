//
//  HomeTabView.swift
//  Plotwist
//

import SwiftUI

struct HomeTabView: View {
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var user: User?
  @State private var watchingItems: [SearchResult] = []
  @State private var watchlistItems: [SearchResult] = []
  @State private var isLoadingUser = true
  @State private var isLoadingWatching = true
  @State private var isLoadingWatchlist = true
  @State private var needsRefresh = false

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var greeting: String {
    let hour = Calendar.current.component(.hour, from: Date())
    if hour >= 5 && hour < 12 {
      return strings.goodMorning
    } else if hour >= 12 && hour < 18 {
      return strings.goodAfternoon
    } else {
      return strings.goodEvening
    }
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        ScrollView(showsIndicators: false) {
          VStack(alignment: .leading, spacing: 24) {
            // Header with greeting
            HomeHeaderView(
              greeting: greeting,
              username: user?.username,
              avatarURL: user?.avatarImageURL,
              isLoading: isLoadingUser,
              onAvatarTapped: {
                NotificationCenter.default.post(name: .navigateToProfile, object: nil)
              }
            )
            .padding(.horizontal, 24)
            .padding(.top, 16)

            // Continue Watching Section
            if !watchingItems.isEmpty {
              ContinueWatchingSection(
                items: watchingItems,
                title: strings.continueWatching
              )
            } else if isLoadingWatching {
              HomeSectionSkeleton()
            }

            // Watchlist Section
            if !watchlistItems.isEmpty {
              WatchlistSection(
                items: watchlistItems,
                title: strings.upNext
              )
            } else if isLoadingWatchlist {
              HomeSectionSkeleton()
            }

            Spacer(minLength: 100)
          }
        }
      }
      .navigationBarHidden(true)
      .preferredColorScheme(effectiveColorScheme)
      .onAppear {
        // Refresh when returning to view if needed
        if needsRefresh {
          needsRefresh = false
          Task {
            await loadWatchingItems()
            await loadWatchlistItems()
          }
        }
      }
    }
    .task {
      await loadData()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task { await loadUser() }
    }
    .onReceive(NotificationCenter.default.publisher(for: .collectionCacheInvalidated)) { _ in
      // Mark for refresh instead of immediately reloading
      // This prevents navigation issues when the list changes while navigated
      needsRefresh = true
    }
  }

  private func loadData() async {
    await withTaskGroup(of: Void.self) { group in
      group.addTask { await loadUser() }
      group.addTask { await loadWatchingItems() }
      group.addTask { await loadWatchlistItems() }
    }
  }

  @MainActor
  private func loadUser() async {
    isLoadingUser = true
    defer { isLoadingUser = false }

    guard AuthService.shared.isAuthenticated else { return }

    do {
      user = try await AuthService.shared.getCurrentUser()
    } catch {
      print("Error loading user: \(error)")
    }
  }

  @MainActor
  private func loadWatchingItems() async {
    isLoadingWatching = true
    defer { isLoadingWatching = false }

    guard AuthService.shared.isAuthenticated else { return }

    let fetchedUser = try? await AuthService.shared.getCurrentUser()
    guard let currentUser = user ?? fetchedUser else { return }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: currentUser.id,
        status: UserItemStatus.watching.rawValue
      )

      // Fetch details for each item from TMDB
      var results: [SearchResult] = []
      for item in items.prefix(10) {
        do {
          if item.mediaType == "MOVIE" {
            let details = try await TMDBService.shared.getMovieDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "movie",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil
              ))
          } else {
            let details = try await TMDBService.shared.getTVSeriesDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "tv",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil
              ))
          }
        } catch {
          print("Error fetching details for \(item.tmdbId): \(error)")
        }
      }

      watchingItems = results
    } catch {
      print("Error loading watching items: \(error)")
    }
  }

  @MainActor
  private func loadWatchlistItems() async {
    isLoadingWatchlist = true
    defer { isLoadingWatchlist = false }

    guard AuthService.shared.isAuthenticated else { return }

    let fetchedUser = try? await AuthService.shared.getCurrentUser()
    guard let currentUser = user ?? fetchedUser else { return }

    do {
      let items = try await UserItemService.shared.getAllUserItems(
        userId: currentUser.id,
        status: UserItemStatus.watchlist.rawValue
      )

      // Fetch details for each item from TMDB
      var results: [SearchResult] = []
      for item in items.prefix(10) {
        do {
          if item.mediaType == "MOVIE" {
            let details = try await TMDBService.shared.getMovieDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "movie",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil
              ))
          } else {
            let details = try await TMDBService.shared.getTVSeriesDetails(
              id: item.tmdbId,
              language: Language.current.rawValue
            )
            results.append(
              SearchResult(
                id: details.id,
                mediaType: "tv",
                title: details.title,
                name: details.name,
                posterPath: details.posterPath,
                profilePath: nil,
                releaseDate: details.releaseDate,
                firstAirDate: details.firstAirDate,
                overview: details.overview,
                voteAverage: details.voteAverage,
                knownForDepartment: nil
              ))
          }
        } catch {
          print("Error fetching details for \(item.tmdbId): \(error)")
        }
      }

      watchlistItems = results
    } catch {
      print("Error loading watchlist items: \(error)")
    }
  }
}

// MARK: - Home Header View
struct HomeHeaderView: View {
  let greeting: String
  let username: String?
  let avatarURL: URL?
  let isLoading: Bool
  var onAvatarTapped: (() -> Void)?

  var body: some View {
    HStack(spacing: 16) {
      if isLoading {
        HStack(spacing: 0) {
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appSkeletonAdaptive)
            .frame(width: 180, height: 24)
        }
      } else if let username {
        Text("\(greeting), ")
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)
          + Text("@\(username)")
          .font(.title2.bold())
          .foregroundColor(.appMutedForegroundAdaptive)
      } else {
        Text(greeting)
          .font(.title2.bold())
          .foregroundColor(.appForegroundAdaptive)
      }

      Spacer()

      if isLoading {
        Circle()
          .fill(Color.appSkeletonAdaptive)
          .frame(width: 44, height: 44)
      } else {
        Button {
          onAvatarTapped?()
        } label: {
          ProfileAvatar(avatarURL: avatarURL, username: username ?? "", size: 44)
        }
        .buttonStyle(.plain)
      }
    }
  }
}

// MARK: - Home Section Card
struct HomeSectionCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: 12)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .posterBorder(cornerRadius: 12)
    .posterShadow()
  }
}

// MARK: - Continue Watching Section
struct ContinueWatchingSection: View {
  let items: [SearchResult]
  let title: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: item.mediaType ?? "movie"
              )
            } label: {
              HomeSectionCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Watchlist Section
struct WatchlistSection: View {
  let items: [SearchResult]
  let title: String

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: item.mediaType ?? "movie"
              )
            } label: {
              HomeSectionCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Home Category Type
enum HomeCategoryType {
  case movies
  case tvSeries
  case animes
  case doramas
}

// MARK: - Home Section View
struct HomeSectionView: View {
  let title: String
  let items: [SearchResult]
  let mediaType: String
  let categoryType: HomeCategoryType
  var initialMovieSubcategory: MovieSubcategory?
  var initialTVSeriesSubcategory: TVSeriesSubcategory?

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      NavigationLink {
        CategoryListView(
          categoryType: categoryType,
          initialMovieSubcategory: initialMovieSubcategory,
          initialTVSeriesSubcategory: initialTVSeriesSubcategory
        )
      } label: {
        HStack(spacing: 6) {
          Text(title)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)
      }

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items.prefix(10)) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: mediaType
              )
            } label: {
              HomePosterCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Home Poster Card
struct HomePosterCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: 16)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .posterBorder(cornerRadius: 16)
    .posterShadow()
  }
}

// MARK: - Home Section Skeleton
struct HomeSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appSkeletonAdaptive)
        .frame(width: 140, height: 20)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 16)
              .fill(Color.appSkeletonAdaptive)
              .frame(width: 120, height: 180)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
      }
      .scrollClipDisabled()
    }
  }
}
