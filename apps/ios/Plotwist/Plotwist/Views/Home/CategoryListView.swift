//
//  CategoryListView.swift
//  Plotwist
//

import SwiftUI

struct CategoryListView: View {
  let categoryType: HomeCategoryType

  @Environment(\.dismiss) private var dismiss
  @State private var items: [SearchResult] = []
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var currentPage = 1
  @State private var totalPages = 1
  @State private var strings = L10n.current
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
          ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
              ForEach(0..<12, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 16)
                  .fill(Color.appBorderAdaptive)
                  .aspectRatio(2 / 3, contentMode: .fit)
                  .shimmer()
              }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 24)
          }
        } else {
          ScrollView {
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
            .padding(.vertical, 24)
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
        result = try await TMDBService.shared.getPopularMovies(language: language, page: 1)
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

  private func loadMoreItems() async {
    guard hasMorePages && !isLoadingMore else { return }

    isLoadingMore = true
    let nextPage = currentPage + 1
    let language = Language.current.rawValue

    do {
      let result: PaginatedResult
      switch categoryType {
      case .movies:
        result = try await TMDBService.shared.getPopularMovies(language: language, page: nextPage)
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
  }
}
