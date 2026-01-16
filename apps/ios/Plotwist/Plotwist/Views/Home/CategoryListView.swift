//
//  CategoryListView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Movie Subcategory
enum MovieSubcategory: CaseIterable, SegmentedTab {
  case nowPlaying
  case popular
  case topRated
  case upcoming
  case discover

  var title: String {
    let strings = L10n.current
    switch self {
    case .nowPlaying: return strings.nowPlaying
    case .popular: return strings.popular
    case .topRated: return strings.topRated
    case .upcoming: return strings.upcoming
    case .discover: return strings.discover
    }
  }

  var isDisabled: Bool {
    self == .discover
  }
}

struct CategoryListView: View {
  let categoryType: HomeCategoryType

  @Environment(\.dismiss) private var dismiss
  @State private var items: [SearchResult] = []
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var currentPage = 1
  @State private var totalPages = 1
  @State private var strings = L10n.current
  @State private var selectedMovieSubcategory: MovieSubcategory = .nowPlaying
  @ObservedObject private var themeManager = ThemeManager.shared

  private var title: String {
    switch categoryType {
    case .movies: return strings.movies
    case .tvSeries: return strings.tvSeries
    case .animes: return strings.animes
    case .doramas: return strings.doramas
    }
  }

  private var mediaType: String {
    switch categoryType {
    case .movies: return "movie"
    case .tvSeries, .animes, .doramas: return "tv"
    }
  }

  private var hasMorePages: Bool {
    currentPage < totalPages
  }

  private func stickyTabBar(scrollProxy: ScrollViewProxy) -> some View {
    SegmentedTabBar(selectedTab: $selectedMovieSubcategory) {
      withAnimation {
        scrollProxy.scrollTo("content-top", anchor: .top)
      }
      Task {
        await loadItems()
      }
    }
    .id("content-top")
    .padding(.vertical, 12)
    .padding(.horizontal, 24)
  }

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        HStack {
          Button {
            dismiss()
          } label: {
            Image(systemName: "chevron.left")
              .font(.system(size: 18, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 40, height: 40)
              .background(Color.appInputFilled)
              .clipShape(Circle())
          }

          Spacer()

          Text(title)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          Color.clear
            .frame(width: 40, height: 40)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)

        Rectangle()
          .fill(Color.appBorderAdaptive)
          .frame(height: 1)

        // Content
        if isLoading && items.isEmpty {
          ScrollViewReader { proxy in
            ScrollView {
              LazyVStack(spacing: 0, pinnedViews: categoryType == .movies ? [.sectionHeaders] : [])
              {
                Section {
                  LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(0..<12, id: \.self) { _ in
                      RoundedRectangle(cornerRadius: 16)
                        .fill(Color.appBorderAdaptive)
                        .aspectRatio(2 / 3, contentMode: .fit)
                        .shimmer()
                    }
                  }
                  .padding(.horizontal, 24)
                  .padding(.top, 16)
                  .padding(.bottom, 24)
                } header: {
                  if categoryType == .movies {
                    stickyTabBar(scrollProxy: proxy)
                  }
                }
              }
            }
          }
        } else {
          ScrollViewReader { proxy in
            ScrollView {
              LazyVStack(spacing: 0, pinnedViews: categoryType == .movies ? [.sectionHeaders] : [])
              {
                Section {
                  LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(items) { item in
                      NavigationLink {
                        MediaDetailView(mediaId: item.id, mediaType: mediaType)
                      } label: {
                        CategoryPosterCard(item: item)
                      }
                      .buttonStyle(.plain)
                      .onAppear {
                        if item.id == items.suffix(6).first?.id && hasMorePages && !isLoadingMore {
                          Task {
                            await loadMoreItems()
                          }
                        }
                      }
                    }

                    if isLoadingMore {
                      ForEach(0..<3, id: \.self) { _ in
                        RoundedRectangle(cornerRadius: 16)
                          .fill(Color.appBorderAdaptive)
                          .aspectRatio(2 / 3, contentMode: .fit)
                          .shimmer()
                      }
                    }
                  }
                  .padding(.horizontal, 24)
                  .padding(.top, 16)
                  .padding(.bottom, 24)
                } header: {
                  if categoryType == .movies {
                    stickyTabBar(scrollProxy: proxy)
                  }
                }
              }
            }
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task {
      await loadItems()
    }
  }

  private func loadItems() async {
    isLoading = true
    currentPage = 1

    let language = Language.current.rawValue

    do {
      let result: PaginatedResult
      switch categoryType {
      case .movies:
        result = try await loadMoviesForSubcategory(language: language, page: 1)
      case .tvSeries:
        result = try await TMDBService.shared.getPopularTVSeries(language: language, page: 1)
      case .animes:
        result = try await TMDBService.shared.getPopularAnimes(language: language, page: 1)
      case .doramas:
        result = try await TMDBService.shared.getPopularDoramas(language: language, page: 1)
      }
      items = result.results
      currentPage = result.page
      totalPages = result.totalPages
    } catch {
      items = []
    }

    isLoading = false
  }

  private func loadMoviesForSubcategory(language: String, page: Int) async throws -> PaginatedResult
  {
    switch selectedMovieSubcategory {
    case .nowPlaying:
      return try await TMDBService.shared.getNowPlayingMovies(language: language, page: page)
    case .popular:
      return try await TMDBService.shared.getPopularMovies(language: language, page: page)
    case .topRated:
      return try await TMDBService.shared.getTopRatedMovies(language: language, page: page)
    case .upcoming:
      return try await TMDBService.shared.getUpcomingMovies(language: language, page: page)
    case .discover:
      // Discover is disabled, fallback to popular
      return try await TMDBService.shared.getPopularMovies(language: language, page: page)
    }
  }

  private func loadMoreItems() async {
    guard hasMorePages && !isLoadingMore else { return }

    isLoadingMore = true
    let nextPage = currentPage + 1
    let language = Language.current.rawValue

    do {
      let result: PaginatedResult
      switch categoryType {
      case .movies:
        result = try await loadMoviesForSubcategory(language: language, page: nextPage)
      case .tvSeries:
        result = try await TMDBService.shared.getPopularTVSeries(language: language, page: nextPage)
      case .animes:
        result = try await TMDBService.shared.getPopularAnimes(language: language, page: nextPage)
      case .doramas:
        result = try await TMDBService.shared.getPopularDoramas(language: language, page: nextPage)
      }

      let newItems = result.results.filter { newItem in
        !items.contains { $0.id == newItem.id }
      }

      items.append(contentsOf: newItems)
      currentPage = result.page
      totalPages = result.totalPages
    } catch {
      // Silently fail on pagination errors
    }

    isLoadingMore = false
  }
}

// MARK: - Category Poster Card
struct CategoryPosterCard: View {
  let item: SearchResult

  var body: some View {
    AsyncImage(url: item.imageURL) { phase in
      switch phase {
      case .empty:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      case .success(let image):
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      case .failure:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: "film")
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      @unknown default:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      }
    }
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .shadow(color: Color.black.opacity(0.15), radius: 4, x: 0, y: 2)
  }
}
