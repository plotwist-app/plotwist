//
//  MovieCollectionViews.swift
//  Plotwist
//

import SwiftUI

// MARK: - Movie Collection Section (App Store Highlight style)
struct MovieCollectionSection: View {
  let collection: MovieCollection
  var namespace: Namespace.ID

  private var strings: Strings { L10n.current }

  /// Shared card backdrop + label overlay — identical in card and detail hero.
  @ViewBuilder
  static func cardContent(
    collection: MovieCollection,
    strings: Strings
  ) -> some View {
    GeometryReader { geometry in
      ZStack(alignment: .bottomLeading) {
        // Backdrop
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

        // Label overlay
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

  var body: some View {
    Self.cardContent(collection: collection, strings: strings)
      .frame(height: 260)
      .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
      .posterBorder(cornerRadius: 24)
      .shadow(color: .black.opacity(0.2), radius: 16, x: 0, y: 8)
      // matchedTransitionSource on the card visual (before padding)
      .matchedTransitionSource(id: collection.id, in: namespace)
      .padding(.horizontal, 24)
  }
}

// MARK: - Movie Collection Detail View (full-page, shared-element destination)
struct MovieCollectionDetailView: View {
  let collection: MovieCollection

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @Namespace private var movieTransition

  /// Controls the delayed reveal of content below the hero.
  @State private var showContent = false

  private var strings: Strings { L10n.current }

  private var sortedParts: [CollectionPart] {
    collection.parts.sorted { ($0.releaseDate ?? "") < ($1.releaseDate ?? "") }
  }

  var body: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 0) {
        // Hero — exact same cardContent as the inline card for seamless zoom
        MovieCollectionSection.cardContent(
          collection: collection,
          strings: strings
        )
        .frame(height: 340)

        // Content — each element slides up with staggered delay after zoom
        VStack(alignment: .leading, spacing: 24) {
          // Collection overview
          if let overview = collection.overview, !overview.isEmpty {
            Text(overview)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .lineSpacing(5)
              .opacity(showContent ? 1 : 0)
              .offset(y: showContent ? 0 : 30)
              .animation(.easeOut(duration: 0.4).delay(0.3), value: showContent)
          }

          // Movie list
          VStack(spacing: 36) {
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
              .opacity(showContent ? 1 : 0)
              .offset(y: showContent ? 0 : 40)
              .animation(
                .easeOut(duration: 0.4).delay(0.35 + Double(index) * 0.06),
                value: showContent
              )
            }
          }
        }
        .padding(24)
      }
    }
    .background(Color.appBackgroundAdaptive)
    .ignoresSafeArea(edges: .top)
    .toolbar(.hidden, for: .navigationBar)
    .overlay(alignment: .topTrailing) {
      Button { dismiss() } label: {
        Image(systemName: "xmark")
          .font(.system(size: 14, weight: .bold))
          .foregroundStyle(.white)
          .frame(width: 36, height: 36)
          .background(.ultraThinMaterial)
          .clipShape(Circle())
      }
      .padding(.trailing, 24)
      .padding(.top, 8)
      .safeAreaPadding(.top)
    }
    .onAppear {
      showContent = true
    }
    .preferredColorScheme(themeManager.current.colorScheme)
  }
}

// MARK: - Collection Movie Row
struct CollectionMovieRow: View {
  let movie: CollectionPart
  let position: Int

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Position. Title
      Text("\(position). \(movie.title)")
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)

      // Year. Overview
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

      // Backdrop
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

