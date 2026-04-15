//
//  MovieCollectionSection.swift
//  Plotwist
//

import SwiftUI

struct MovieCollectionSection: View {
  let collection: MovieCollection
  @Binding var isExpanded: Bool

  @Namespace private var movieTransition

  /// The card's Y position in global coordinates, captured on tap.
  @State private var cardOriginY: CGFloat = 0
  /// Live tracking of the card's Y position (only updated while collapsed).
  @State private var liveCardY: CGFloat = 0

  private var strings: Strings { L10n.current }
  private let screen = UIScreen.main.bounds
  private var safeAreaTop: CGFloat {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .first?.windows.first?.safeAreaInsets.top ?? 0
  }

  private var sortedParts: [CollectionPart] {
    collection.parts.sorted { ($0.releaseDate ?? "") < ($1.releaseDate ?? "") }
  }

  /// Expanded hero height that maintains the same image crop proportion as the collapsed card.
  /// The visible image area below the status bar keeps the same aspect ratio,
  /// and safeAreaTop is added so the image extends behind the status bar.
  private var expandedHeroHeight: CGFloat {
    let proportionalHeight = screen.width * 260.0 / (screen.width - 48)
    return proportionalHeight + safeAreaTop
  }

  private var spring: Animation {
    .spring(response: 0.5, dampingFraction: 0.86)
  }

  var body: some View {
    ScrollView(showsIndicators: false) {
      VStack(alignment: .leading, spacing: 0) {
        // Hero — same content in both states, just height changes
        CollectionHero(collection: collection, strings: strings)
          .frame(height: isExpanded ? expandedHeroHeight : 260)

        // Content — revealed when card grows to page size
        if isExpanded {
          VStack(alignment: .leading, spacing: 24) {
            if let overview = collection.overview, !overview.isEmpty {
              Text(overview)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
                .lineSpacing(5)
            }

            LazyVStack(alignment: .leading, spacing: 40) {
              ForEach(Array(sortedParts.enumerated()), id: \.element.id) { index, movie in
                NavigationLink {
                  MediaDetailView(mediaId: movie.id, mediaType: "movie")
                    .navigationTransition(
                      .zoom(sourceID: "col-movie-\(movie.id)", in: movieTransition)
                    )
                } label: {
                  CollectionMovieRow(movie: movie, position: index + 1)
                }
                .buttonStyle(.plain)
                .matchedTransitionSource(
                  id: "col-movie-\(movie.id)", in: movieTransition
                )
              }
            }
          }
          .padding(24)

          Spacer().frame(height: 60)
        }
      }
      .offset(y: isExpanded ? -safeAreaTop : 0)
    }
    .scrollDisabled(!isExpanded)
    .contentMargins(.top, isExpanded ? 0 : nil, for: .scrollContent)
    .ignoresSafeArea(edges: .top)
    .frame(height: isExpanded ? screen.height + safeAreaTop : 260)
    .clipped()
    .background(Color.appBackgroundAdaptive)
    .clipShape(RoundedRectangle(cornerRadius: isExpanded ? 0 : 24, style: .continuous))
    .shadow(color: .black.opacity(isExpanded ? 0 : 0.2), radius: 16, x: 0, y: 8)
    .padding(.horizontal, isExpanded ? 0 : 24)
    // Track the card's position on screen (only while collapsed)
    .background(
      GeometryReader { geo in
        Color.clear
          .onChange(of: geo.frame(in: .global).minY) { _, newY in
            if !isExpanded {
              liveCardY = newY
            }
          }
          .onAppear {
            liveCardY = geo.frame(in: .global).minY
          }
      }
    )
    // Close button (before offset so it moves with the card)
    .overlay(alignment: .topTrailing) {
      if isExpanded {
        Button {
          withAnimation(spring) {
            isExpanded = false
          }
        } label: {
          Image(systemName: "xmark")
            .font(.system(size: 14, weight: .bold))
            .foregroundStyle(.white)
            .frame(width: 36, height: 36)
            .background(.ultraThinMaterial)
            .clipShape(Circle())
        }
        .padding(.trailing, 24)
        .padding(.top, safeAreaTop + 8)
        .transition(.opacity)
      }
    }
    .contentShape(Rectangle())
    .onTapGesture {
      guard !isExpanded else { return }
      // Capture the card's current Y position before animating
      cardOriginY = liveCardY
      withAnimation(spring) {
        isExpanded = true
      }
    }
    // Offset the card to the screen top when expanded (after overlay so button moves with it)
    .offset(y: isExpanded ? -cardOriginY : 0)
  }
}

// MARK: - Collection Hero
private struct CollectionHero: View {
  let collection: MovieCollection
  let strings: Strings

  /// The collapsed card aspect ratio (width / height) used to keep the image crop
  /// consistent between collapsed and expanded states.
  private var collapsedAspectRatio: CGFloat {
    (UIScreen.main.bounds.width - 48) / 260.0
  }

  var body: some View {
    GeometryReader { geometry in
      // Image height that preserves the same crop proportion as the collapsed card.
      // When collapsed (width = screen-48): imageHeight = 260 (matches hero exactly).
      // When expanded (width = screen):     imageHeight ≈ 296 (proportionally taller).
      let imageHeight = geometry.size.width / collapsedAspectRatio

      ZStack(alignment: .bottomLeading) {
        // Background for the area below the image when the hero is taller than imageHeight
        Color.black

        // Backdrop image at proportional height, anchored to the top of the hero
        CachedAsyncImage(url: collection.backdropURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: geometry.size.width, height: imageHeight)
            .clipped()
        } placeholder: {
          Rectangle()
            .fill(Color.appBorderAdaptive)
        }
        .frame(width: geometry.size.width, height: geometry.size.height, alignment: .bottom)

        // Gradient overlay spanning the full hero area
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
private struct CollectionMovieRow: View {
  let movie: CollectionPart
  let position: Int

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Backdrop first
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

      // Title
      Text("\(position). \(movie.title)")
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)

      // Overview / year
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
    }
  }
}
