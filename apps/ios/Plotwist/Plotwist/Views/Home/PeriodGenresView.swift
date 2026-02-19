//
//  PeriodGenresView.swift
//  Plotwist

import SwiftUI

struct PeriodGenresView: View {
  @Environment(\.dismiss) private var dismiss

  @State var genres: [WatchedGenre]
  let periodLabel: String
  let strings: Strings
  var userId: String? = nil
  var period: String? = nil

  @State private var scrollOffset: CGFloat = 0
  @State private var initialScrollOffset: CGFloat? = nil
  private let scrollThreshold: CGFloat = 10
  @State private var isLoading = false

  private var isScrolled: Bool {
    guard let initial = initialScrollOffset else { return false }
    return scrollOffset < initial - scrollThreshold
  }

  init(genres: [WatchedGenre], periodLabel: String, strings: Strings, userId: String? = nil, period: String? = nil) {
    _genres = State(initialValue: genres)
    self.periodLabel = periodLabel
    self.strings = strings
    self.userId = userId
    self.period = period
  }

  var body: some View {
    VStack(spacing: 0) {
      detailHeaderView(title: strings.favoriteGenres, isScrolled: isScrolled) { dismiss() }

      if isLoading && genres.isEmpty {
        Spacer()
        ProgressView()
        Spacer()
      } else {
        ScrollView {
          VStack(alignment: .leading, spacing: 0) {
            Text(periodLabel)
              .font(.system(size: 13, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)

            Text(strings.favoriteGenres)
              .font(.system(size: 34, weight: .bold))
              .foregroundColor(.appForegroundAdaptive)
              .padding(.bottom, 20)

            LazyVStack(spacing: 0) {
              ForEach(Array(genres.enumerated()), id: \.element.id) { index, genre in
                genreRow(genre: genre, rank: index + 1)

                if index < genres.count - 1 {
                  Divider()
                    .padding(.leading, 40)
                }
              }
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 16)
          .padding(.bottom, 24)
          .background(scrollOffsetReader)
        }
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .task { await loadGenresIfNeeded() }
  }

  private var scrollOffsetReader: some View {
    GeometryReader { geo -> Color in
      DispatchQueue.main.async {
        let offset = geo.frame(in: .global).minY
        if initialScrollOffset == nil {
          initialScrollOffset = offset
        }
        scrollOffset = offset
      }
      return Color.clear
    }
  }

  private func genreRow(genre: WatchedGenre, rank: Int) -> some View {
    HStack(spacing: 14) {
      Text("\(rank)")
        .font(.system(size: 15, weight: .bold, design: .rounded))
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 22, alignment: .leading)

      VStack(alignment: .leading, spacing: 4) {
        Text(genre.name)
          .font(.system(size: rank <= 3 ? 17 : 15, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(1)

        Text(genre.percentage < 1
          ? String(format: "%.1f%%", genre.percentage)
          : String(format: "%.0f%%", genre.percentage))
          .font(.system(size: 14, weight: .semibold, design: .rounded))
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      Spacer()

      PosterDeckView(items: genre.genreItems, urls: genre.posterURLs, rank: rank, genreName: genre.name, itemCount: genre.count, strings: strings)
    }
    .padding(.vertical, 12)
  }

  private func loadGenresIfNeeded() async {
    guard let userId, let period, genres.count <= 1, period != "all" else { return }
    isLoading = true
    if let loaded = try? await UserStatsService.shared.getWatchedGenres(
      userId: userId, language: Language.current.rawValue, period: period
    ) {
      genres = loaded
    }
    isLoading = false
  }
}

// MARK: - Poster Deck View

struct PosterDeckView: View {
  let items: [GenreItem]
  let urls: [URL]
  let rank: Int
  let genreName: String
  let itemCount: Int
  let strings: Strings

  @State private var showSheet = false
  @State private var selectedItem: GenreItem?

  var body: some View {
    let posterWidth: CGFloat = rank == 1 ? 115 : rank == 2 ? 100 : rank == 3 ? 90 : 78
    let posterHeight = posterWidth * 1.5
    let cr: CGFloat = rank <= 2 ? 10 : 8
    let positions: [(x: CGFloat, rotation: Double)] = [
      (0, 0),
      (14, 5),
      (28, 10),
    ]
    let displayURLs = Array(urls.prefix(3))
    let count = displayURLs.count
    let deckWidth: CGFloat = posterWidth + (count > 1 ? positions[count - 1].x : 0)

    Group {
      if items.count == 1, let item = items.first {
        NavigationLink {
          MediaDetailView(mediaId: item.tmdbId, mediaType: item.mediaType)
        } label: {
          deckContent(
            urls: displayURLs,
            posterWidth: posterWidth,
            posterHeight: posterHeight,
            cr: cr,
            positions: positions,
            deckWidth: deckWidth
          )
        }
        .buttonStyle(.plain)
      } else {
        deckContent(
          urls: displayURLs,
          posterWidth: posterWidth,
          posterHeight: posterHeight,
          cr: cr,
          positions: positions,
          deckWidth: deckWidth
        )
        .contentShape(Rectangle())
        .onTapGesture {
          if items.count > 1 { showSheet = true }
        }
        .sheet(isPresented: $showSheet) {
          GenreItemsSheet(items: items, genreName: genreName, itemCount: itemCount, strings: strings) { item in
            showSheet = false
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
              selectedItem = item
            }
          }
          .presentationDetents([.medium, .large])
          .presentationBackground {
            Color.appSheetBackgroundAdaptive.ignoresSafeArea()
          }
          .presentationDragIndicator(.visible)
        }
        .navigationDestination(item: $selectedItem) { item in
          MediaDetailView(mediaId: item.tmdbId, mediaType: item.mediaType)
        }
      }
    }
  }

  private func deckContent(
    urls: [URL],
    posterWidth: CGFloat,
    posterHeight: CGFloat,
    cr: CGFloat,
    positions: [(x: CGFloat, rotation: Double)],
    deckWidth: CGFloat
  ) -> some View {
    ZStack(alignment: .leading) {
      ForEach(Array(urls.enumerated().reversed()), id: \.element) { index, url in
        CachedAsyncImage(url: url) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          RoundedRectangle(cornerRadius: cr)
            .fill(Color.appBorderAdaptive.opacity(0.3))
        }
        .frame(width: posterWidth, height: posterHeight)
        .clipShape(RoundedRectangle(cornerRadius: cr))
        .shadow(color: .black.opacity(0.15), radius: 3, x: 1, y: 1)
        .offset(x: positions[index].x)
        .rotationEffect(.degrees(positions[index].rotation), anchor: .bottom)
      }
    }
    .frame(width: deckWidth + 20, height: posterHeight + 10, alignment: .leading)
  }
}

// MARK: - Genre Items Sheet

struct GenreItemsSheet: View {
  let items: [GenreItem]
  let genreName: String
  let itemCount: Int
  let strings: Strings
  let onSelectItem: (GenreItem) -> Void

  private let columns = [
    GridItem(.flexible(), spacing: 10),
    GridItem(.flexible(), spacing: 10),
    GridItem(.flexible(), spacing: 10),
  ]

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 16) {
        VStack(spacing: 4) {
          Text(genreName)
            .font(.system(size: 22, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)

          Text(String(format: strings.nTitles, itemCount))
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)

        LazyVGrid(columns: columns, spacing: 10) {
          ForEach(items) { item in
            Button {
              onSelectItem(item)
            } label: {
              Group {
                if let url = item.posterURL {
                  CachedAsyncImage(url: url) { image in
                    image
                      .resizable()
                      .aspectRatio(2/3, contentMode: .fill)
                  } placeholder: {
                    RoundedRectangle(cornerRadius: 10)
                      .fill(Color.appBorderAdaptive.opacity(0.3))
                      .aspectRatio(2/3, contentMode: .fill)
                  }
                } else {
                  RoundedRectangle(cornerRadius: 10)
                    .fill(Color.appBorderAdaptive.opacity(0.3))
                    .aspectRatio(2/3, contentMode: .fill)
                    .overlay {
                      Image(systemName: item.mediaType == "movie" ? "film" : "tv")
                        .font(.system(size: 20))
                        .foregroundColor(.appMutedForegroundAdaptive)
                    }
                }
              }
              .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 16)
      }
      .padding(.top, 20)
      .padding(.bottom, 16)
    }
  }
}
