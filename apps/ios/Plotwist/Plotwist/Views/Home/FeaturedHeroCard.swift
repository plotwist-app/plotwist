//
//  FeaturedHeroCard.swift
//  Plotwist
//

import SwiftUI

// MARK: - Featured Hero Card (Apple TV+ style)
struct FeaturedHeroCard: View {
  let item: SearchResult
  var label: String = "Featured"

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .bottomLeading) {
        // Backdrop image (full resolution)
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

        // Gradient overlay
        LinearGradient(
          stops: [
            .init(color: .clear, location: 0),
            .init(color: .clear, location: 0.3),
            .init(color: Color.black.opacity(0.4), location: 0.6),
            .init(color: Color.black.opacity(0.85), location: 1),
          ],
          startPoint: .top,
          endPoint: .bottom
        )

        // Content overlay
        VStack(alignment: .leading, spacing: 6) {
          // Label pill
          Text(label.uppercased())
            .font(.system(size: 10, weight: .bold))
            .tracking(1.2)
            .foregroundColor(.white.opacity(0.8))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color.white.opacity(0.15))
            .clipShape(Capsule())

          Spacer()

          // Title
          Text(item.displayTitle)
            .font(.system(size: 22, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(2)

          // Year + media type
          if let year = item.year {
            HStack(spacing: 6) {
              Text(year)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.7))

              if let mediaType = item.mediaType {
                Circle()
                  .fill(Color.white.opacity(0.4))
                  .frame(width: 3, height: 3)

                Text(mediaType == "movie" ? L10n.current.movies : L10n.current.tvSeries)
                  .font(.system(size: 13, weight: .medium))
                  .foregroundColor(.white.opacity(0.7))
              }
            }
          }
        }
        .padding(20)
      }
    }
    .frame(height: 280)
    .clipShape(RoundedRectangle(cornerRadius: 24))
    .posterBorder(cornerRadius: 24)
    .shadow(color: .black.opacity(0.2), radius: 16, x: 0, y: 8)
  }
}

// MARK: - Featured Hero Skeleton
struct FeaturedHeroSkeleton: View {
  var body: some View {
    RoundedRectangle(cornerRadius: 24)
      .fill(Color.appBorderAdaptive)
      .frame(height: 280)
  }
}
