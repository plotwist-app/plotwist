//
//  MovieCollectionViews.swift
//  Plotwist
//

import SwiftUI

// MARK: - Collection Card (inline in MediaDetailView scroll)
struct MovieCollectionCard: View {
  let collection: MovieCollection
  private var strings: Strings { L10n.current }

  var body: some View {
    CollectionHero(collection: collection, strings: strings)
      .frame(height: 260)
      .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
      .posterBorder(cornerRadius: 24)
      .shadow(color: .black.opacity(0.2), radius: 16, x: 0, y: 8)
      .contentShape(Rectangle())
      .padding(.horizontal, 24)
  }
}

// MARK: - Collection Detail Page (full-screen destination for zoom transition)
struct CollectionDetailPage: View {
  let collection: MovieCollection

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @Namespace private var movieTransition
  @State private var contentVisible = false

  private var strings: Strings { L10n.current }

  private var sortedParts: [CollectionPart] {
    collection.parts.sorted { ($0.releaseDate ?? "") < ($1.releaseDate ?? "") }
  }

  var body: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 0) {
        // Same hero as the card — the zoom transition morphs between them
        CollectionHero(collection: collection, strings: strings)
          .frame(height: 340)

        // Content section
        VStack(alignment: .leading, spacing: 24) {
          if let overview = collection.overview, !overview.isEmpty {
            Text(overview)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .lineSpacing(5)
          }

          ForEach(Array(sortedParts.enumerated()), id: \.element.id) { index, movie in
            NavigationLink {
              MediaDetailView(mediaId: movie.id, mediaType: "movie")
                .navigationTransition(
                  .zoom(sourceID: "collection-movie-\(movie.id)", in: movieTransition)
                )
            } label: {
              CollectionMovieRow(movie: movie, position: index + 1)
            }
            .buttonStyle(.plain)
            .matchedTransitionSource(
              id: "collection-movie-\(movie.id)", in: movieTransition
            )
          }
        }
        .padding(24)
        .opacity(contentVisible ? 1 : 0)
        .offset(y: contentVisible ? 0 : 20)

        Spacer().frame(height: 60)
      }
    }
    .ignoresSafeArea(edges: .top)
    .navigationBarHidden(true)
    .overlay(alignment: .topTrailing) {
      Button { dismiss() } label: {
        Image(systemName: "xmark")
          .font(.system(size: 14, weight: .bold))
          .foregroundStyle(.white)
          .frame(width: 36, height: 36)
          .background(.ultraThinMaterial)
          .clipShape(Circle())
      }
      .padding(.trailing, 16)
      .padding(.top, 8)
      .safeAreaPadding(.top)
      .opacity(contentVisible ? 1 : 0)
    }
    .background(Color.appBackgroundAdaptive)
    .preferredColorScheme(themeManager.current.colorScheme)
    .onAppear {
      withAnimation(.easeOut(duration: 0.35).delay(0.15)) {
        contentVisible = true
      }
    }
  }
}

// MARK: - Collection Hero (shared backdrop + labels)
struct CollectionHero: View {
  let collection: MovieCollection
  let strings: Strings

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .bottomLeading) {
        CachedAsyncImage(url: collection.backdropURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
        } placeholder: {
          Rectangle()
            .fill(Color.appBorderAdaptive)
        }
        .overlay(
          LinearGradient(
            stops: [
              .init(color: .clear, location: 0),
              .init(color: .clear, location: 0.25),
              .init(color: Color.black.opacity(0.45), location: 0.55),
              .init(color: Color.black.opacity(0.88), location: 1),
            ],
            startPoint: .top,
            endPoint: .bottom
          )
        )

        VStack(alignment: .leading, spacing: 2) {
          Text(strings.partOf.uppercased())
            .font(.caption2.weight(.bold))
            .tracking(0.6)
            .foregroundStyle(.white.opacity(0.5))

          Text(collection.name)
            .font(.title2.bold())
            .foregroundStyle(.white)
            .lineLimit(2)
        }
        .padding(20)
      }
    }
  }
}

// MARK: - Collection Movie Row
struct CollectionMovieRow: View {
  let movie: CollectionPart
  let position: Int

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("\(position). \(movie.title)")
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)

      if let overview = movie.overview, !overview.isEmpty {
        if let year = movie.year {
          Text("\(year). \(overview)")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(3)
            .lineSpacing(4)
        } else {
          Text(overview)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(3)
            .lineSpacing(4)
        }
      } else if let year = movie.year {
        Text(year)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      CachedAsyncImage(url: movie.backdropURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
          .frame(minWidth: 0, maxWidth: .infinity)
          .aspectRatio(4 / 3, contentMode: .fit)
      } placeholder: {
        RoundedRectangle(cornerRadius: 20)
          .fill(Color.appBorderAdaptive)
          .aspectRatio(4 / 3, contentMode: .fit)
      }
      .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
      .posterBorder(cornerRadius: 20)
    }
  }
}
