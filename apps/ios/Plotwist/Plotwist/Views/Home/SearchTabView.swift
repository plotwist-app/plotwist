//
//  SearchTabView.swift
//  Plotwist
//

import SwiftUI

struct SearchTabView: View {
  @State private var searchText = ""
  @State private var results: [SearchResult] = []
  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var popularAnimes: [SearchResult] = []
  @State private var popularDoramas: [SearchResult] = []
  @State private var isLoading = false
  @State private var isLoadingPopular = true
  @State private var strings = L10n.current
  @State private var searchTask: Task<Void, Never>?

  private var movies: [SearchResult] {
    results.filter { $0.mediaType == "movie" }
  }

  private var tvSeries: [SearchResult] {
    results.filter { $0.mediaType == "tv" }
  }

  private var people: [SearchResult] {
    results.filter { $0.mediaType == "person" }
  }

  private var isSearching: Bool {
    !searchText.isEmpty
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          // Search Header
          VStack(spacing: 0) {
            HStack(spacing: 12) {
              HStack(spacing: 12) {
                Image(systemName: "magnifyingglass")
                  .foregroundColor(.appMutedForegroundAdaptive)

                TextField(strings.searchPlaceholder, text: $searchText)
                  .textInputAutocapitalization(.never)
                  .autocorrectionDisabled()
              }
              .padding(12)
              .background(Color.appInputFilled)
              .clipShape(RoundedRectangle(cornerRadius: 12))

              if !searchText.isEmpty {
                Button {
                  withAnimation(.easeInOut(duration: 0.2)) {
                    searchText = ""
                    results = []
                  }
                } label: {
                  Text(strings.cancel)
                    .font(.subheadline)
                    .foregroundColor(.appForegroundAdaptive)
                }
                .transition(.opacity.combined(with: .move(edge: .trailing)))
              }
            }
            .animation(.easeInOut(duration: 0.2), value: searchText.isEmpty)
            .padding(.horizontal, 24)
            .padding(.vertical, 16)

            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
          }

          // Results
          if isLoading || isLoadingPopular {
            ScrollView {
              LazyVStack(alignment: .leading, spacing: 24) {
                SearchSkeletonSection()
                SearchSkeletonSection()
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 24)
            }
          } else if isSearching {
            if results.isEmpty {
              Spacer()
              Text(strings.noResults)
                .foregroundColor(.appMutedForegroundAdaptive)
              Spacer()
            } else {
              ScrollView {
                LazyVStack(alignment: .leading, spacing: 24) {
                  if !movies.isEmpty {
                    SearchSection(title: strings.movies, results: movies)
                  }

                  if !tvSeries.isEmpty {
                    SearchSection(title: strings.tvSeries, results: tvSeries)
                  }

                  if !people.isEmpty {
                    SearchSection(title: strings.people, results: people)
                  }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 24)
              }
            }
          } else {
            // Show popular content with horizontal scroll sections
            ScrollView(showsIndicators: false) {
              VStack(spacing: 32) {
                HomeSectionView(
                  title: strings.popularMovies,
                  items: popularMovies,
                  mediaType: "movie",
                  categoryType: .movies
                )

                HomeSectionView(
                  title: strings.popularTVSeries,
                  items: popularTVSeries,
                  mediaType: "tv",
                  categoryType: .tvSeries
                )

                HomeSectionView(
                  title: strings.popularAnimes,
                  items: popularAnimes,
                  mediaType: "tv",
                  categoryType: .animes
                )

                HomeSectionView(
                  title: strings.popularDoramas,
                  items: popularDoramas,
                  mediaType: "tv",
                  categoryType: .doramas
                )
              }
              .padding(.top, 24)
              .padding(.bottom, 80)
            }
          }
        }
      }
      .navigationBarHidden(true)
    }
    .task {
      await loadPopularContent()
    }
    .onChange(of: searchText) { newValue in
      searchTask?.cancel()

      if !newValue.isEmpty {
        isLoading = true  // Show skeleton immediately when user types
      } else {
        isLoading = false
      }

      searchTask = Task {
        try? await Task.sleep(nanoseconds: 500_000_000)  // 500ms debounce
        guard !Task.isCancelled else { return }
        await performSearch(query: newValue)
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
      Task {
        await loadPopularContent()
      }
    }
  }

  private func loadPopularContent() async {
    isLoadingPopular = true
    defer { isLoadingPopular = false }

    let language = Language.current.rawValue

    async let moviesTask = TMDBService.shared.getPopularMovies(language: language)
    async let tvTask = TMDBService.shared.getPopularTVSeries(language: language)
    async let animesTask = TMDBService.shared.getPopularAnimes(language: language)
    async let doramasTask = TMDBService.shared.getPopularDoramas(language: language)

    do {
      let (movies, tv, animes, doramas) = try await (moviesTask, tvTask, animesTask, doramasTask)
      popularMovies = movies.results
      popularTVSeries = tv.results
      popularAnimes = animes.results
      popularDoramas = doramas.results
    } catch {
      popularMovies = []
      popularTVSeries = []
      popularAnimes = []
      popularDoramas = []
    }
  }

  private func performSearch(query: String) async {
    guard !query.isEmpty else {
      results = []
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      results = response.results
    } catch {
      results = []
    }
  }
}

// MARK: - Search Section
struct SearchSection: View {
  let title: String
  let results: [SearchResult]

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)

      LazyVGrid(columns: columns, spacing: 12) {
        ForEach(results.prefix(9)) { result in
          if result.mediaType != "person" {
            NavigationLink {
              MediaDetailView(
                mediaId: result.id,
                mediaType: result.mediaType ?? "movie"
              )
            } label: {
              PosterCard(result: result)
            }
            .buttonStyle(.plain)
          } else {
            PosterCard(result: result)
          }
        }
      }
    }
  }
}

// MARK: - Poster Card
struct PosterCard: View {
  let result: SearchResult

  var body: some View {
    AsyncImage(url: result.imageURL) { phase in
      switch phase {
      case .empty:
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
      case .success(let image):
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      case .failure:
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: result.mediaType == "person" ? "person.fill" : "film")
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      @unknown default:
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
      }
    }
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .posterShadow()
  }
}

// MARK: - Skeleton Views
struct SearchSkeletonSection: View {
  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appSkeletonAdaptive)
        .frame(width: 80, height: 16)

      LazyVGrid(columns: columns, spacing: 12) {
        ForEach(0..<6, id: \.self) { _ in
          PosterSkeletonCard()
        }
      }
    }
  }
}

struct PosterSkeletonCard: View {
  var body: some View {
    RoundedRectangle(cornerRadius: 12)
      .fill(Color.appSkeletonAdaptive)
      .aspectRatio(2 / 3, contentMode: .fit)
  }
}
