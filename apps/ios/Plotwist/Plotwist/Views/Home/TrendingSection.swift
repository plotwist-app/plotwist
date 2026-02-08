//
//  TrendingSection.swift
//  Plotwist
//

import SwiftUI

// MARK: - Trending Section (backdrop cards, 80% width peek)
struct TrendingSection: View {
  let items: [SearchResult]
  let title: String
  var namespace: Namespace.ID

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.title3.bold())
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      GeometryReader { proxy in
        let cardWidth = proxy.size.width * 0.80

        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 12) {
            ForEach(Array(items.prefix(10).enumerated()), id: \.element.id) { index, item in
              NavigationLink {
                MediaDetailView(
                  mediaId: item.id,
                  mediaType: item.mediaType ?? "movie",
                  initialBackdropURL: item.hdBackdropURL ?? item.backdropURL
                )
                .navigationTransition(.zoom(sourceID: "trending-\(item.id)", in: namespace))
              } label: {
                TrendingCard(
                  item: item,
                  rank: index + 1
                )
              }
              .buttonStyle(.plain)
              .matchedTransitionSource(id: "trending-\(item.id)", in: namespace)
              .frame(width: cardWidth)
            }
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 4)
        }
        .scrollClipDisabled()
      }
      .frame(height: 240)
    }
  }
}

// MARK: - Trending Card (backdrop hero with rank badge)
struct TrendingCard: View {
  let item: SearchResult
  let rank: Int

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .bottomLeading) {
        // Backdrop image (full resolution, same as MediaDetailView)
        CachedAsyncImage(url: item.hdBackdropURL ?? item.backdropURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: geometry.size.width, height: geometry.size.height)
            .clipped()
        } placeholder: {
          Rectangle()
            .fill(Color.appInputFilled)
            .frame(width: geometry.size.width, height: geometry.size.height)
        }

        // Bottom gradient
        LinearGradient(
          stops: [
            .init(color: .clear, location: 0),
            .init(color: .clear, location: 0.35),
            .init(color: Color.black.opacity(0.5), location: 0.65),
            .init(color: Color.black.opacity(0.9), location: 1),
          ],
          startPoint: .top,
          endPoint: .bottom
        )

        // Content overlay
        VStack(alignment: .leading, spacing: 4) {
          // Rank badge
          HStack {
            Text("#\(rank)")
              .font(.system(size: 12, weight: .bold, design: .rounded))
              .foregroundColor(.white)
              .padding(.horizontal, 8)
              .padding(.vertical, 4)
              .background(Color.white.opacity(0.2))
              .clipShape(Capsule())

            Spacer()
          }

          Spacer()

          // Title
          Text(item.displayTitle)
            .font(.system(size: 17, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(1)

          // Year + type
          if let year = item.year {
            HStack(spacing: 5) {
              Text(year)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.7))

              if let mediaType = item.mediaType {
                Circle()
                  .fill(Color.white.opacity(0.4))
                  .frame(width: 3, height: 3)

                Text(mediaType == "movie" ? L10n.current.movies : L10n.current.tvSeries)
                  .font(.system(size: 12, weight: .medium))
                  .foregroundColor(.white.opacity(0.7))
              }
            }
          }
        }
        .padding(14)
      }
    }
    .frame(height: 230)
    .clipShape(RoundedRectangle(cornerRadius: 20))
    .posterBorder(cornerRadius: 20)
    .shadow(color: .black.opacity(0.15), radius: 10, x: 0, y: 6)
  }
}
