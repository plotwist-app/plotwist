//
//  HomeTabView.swift
//  Plotwist
//

import SwiftUI

struct HomeTabView: View {
  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var popularAnimes: [SearchResult] = []
  @State private var popularDoramas: [SearchResult] = []
  @State private var isLoading = true
  @State private var strings = L10n.current

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        if isLoading {
          ScrollView {
            VStack(spacing: 32) {
              HomeSectionSkeleton()
              HomeSectionSkeleton()
              HomeSectionSkeleton()
              HomeSectionSkeleton()
            }
            .padding(.top, 24)
            .padding(.bottom, 80)
          }
        } else {
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
      .navigationBarHidden(true)
    }
    .task {
      await loadContent()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
      Task {
        await loadContent()
      }
    }
  }

  private func loadContent() async {
    isLoading = true
    defer { isLoading = false }

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

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      NavigationLink {
        CategoryListView(categoryType: categoryType)
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
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .posterShadow()
  }
}

// MARK: - Home Section Skeleton
struct HomeSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 140, height: 20)
        .padding(.horizontal, 24)
        .shimmer()

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 16)
              .fill(Color.appBorderAdaptive)
              .frame(width: 120, height: 180)
              .shimmer()
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
      }
      .scrollClipDisabled()
    }
  }
}
