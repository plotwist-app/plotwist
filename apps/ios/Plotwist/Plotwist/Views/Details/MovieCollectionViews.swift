//
//  MovieCollectionViews.swift
//  Plotwist
//

import SwiftUI

// MARK: - Movie Collection Section
struct MovieCollectionSection: View {
  let collection: MovieCollection
  let onSeeCollectionTapped: () -> Void

  private var strings: Strings { L10n.current }

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .bottomLeading) {
        // Backdrop with darkened overlay
        CachedAsyncImage(url: collection.backdropURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: geometry.size.width, height: geometry.size.height)
        } placeholder: {
          Rectangle()
            .fill(Color.appBorderAdaptive)
        }
        .overlay(
          LinearGradient(
            colors: [
              Color.black.opacity(0.8),
              Color.black.opacity(0.4),
              Color.black.opacity(0.2),
            ],
            startPoint: .bottom,
            endPoint: .top
          )
        )

        // Content
        VStack(alignment: .leading, spacing: 12) {
          VStack(alignment: .leading, spacing: 4) {
            Text(strings.partOf)
              .font(.caption)
              .foregroundColor(.white.opacity(0.8))

            Text(collection.name)
              .font(.title3.bold())
              .foregroundColor(.white)
          }

          Button {
            onSeeCollectionTapped()
          } label: {
            Text(strings.seeCollection)
              .font(.footnote.weight(.medium))
              .foregroundColor(.appForegroundAdaptive)
              .padding(.horizontal, 14)
              .padding(.vertical, 10)
              .background(Color.appBackgroundAdaptive)
              .cornerRadius(10)
          }
          .buttonStyle(.plain)
        }
        .padding(20)
      }
      .frame(width: geometry.size.width, height: geometry.size.height)
      .clipped()
    }
    .frame(height: 240)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .padding(.horizontal, 24)
  }
}

// MARK: - Movie Collection Sheet
struct MovieCollectionSheet: View {
  let collection: MovieCollection
  let onMovieSelected: (Int) -> Void
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  private var sortedParts: [CollectionPart] {
    collection.parts.sorted(by: { ($0.releaseDate ?? "") < ($1.releaseDate ?? "") })
  }

  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 0) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
          .padding(.bottom, 8)

        ScrollView {
          VStack(alignment: .leading, spacing: 8) {
            // Title
            Text(collection.name)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)
              .frame(maxWidth: .infinity, alignment: .center)
              .padding(.top, 4)

            // Collection overview if available
            if let overview = collection.overview, !overview.isEmpty {
              Text(overview)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 24)
                .padding(.top, 8)
            }

            // Movies grid - using regular VStack + HStack for eager loading
            VStack(spacing: 12) {
              ForEach(0..<(sortedParts.count + 2) / 3, id: \.self) { rowIndex in
                HStack(spacing: 12) {
                  ForEach(0..<3) { colIndex in
                    let index = rowIndex * 3 + colIndex
                    if index < sortedParts.count {
                      let movie = sortedParts[index]
                      CollectionPosterCard(movie: movie)
                        .contentShape(Rectangle())
                        .onTapGesture {
                          dismiss()
                          DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            onMovieSelected(movie.id)
                          }
                        }
                    } else {
                      // Empty space for incomplete rows
                      Color.clear
                        .aspectRatio(2 / 3, contentMode: .fill)
                    }
                  }
                }
              }
            }
            .padding(.horizontal, 24)
            .padding(.top, 16)
          }
          .padding(.bottom, 24)
        }
      }
    }
    .floatingSheetPresentation(detents: [.medium])
    .preferredColorScheme(themeManager.current.colorScheme)
  }
}

// MARK: - Collection Poster Card
struct CollectionPosterCard: View {
  let movie: CollectionPart

  var body: some View {
    CachedAsyncImage(url: movie.posterURL) { image in
      image
        .resizable()
        .aspectRatio(2 / 3, contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: 8)
        .fill(Color.appBorderAdaptive)
        .aspectRatio(2 / 3, contentMode: .fill)
        .overlay(
          ProgressView()
            .scaleEffect(0.7)
        )
    }
    .clipShape(RoundedRectangle(cornerRadius: 8))
    .posterBorder(cornerRadius: 8)
    .posterShadow()
  }
}
