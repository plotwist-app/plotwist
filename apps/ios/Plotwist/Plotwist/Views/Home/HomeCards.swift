//
//  HomeCards.swift
//  Plotwist
//

import SwiftUI

// MARK: - Home Section Card
struct HomeSectionCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .posterShadow()
  }
}

// MARK: - Home Poster Card
struct HomePosterCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .posterShadow()
  }
}

// MARK: - Home Section Skeleton
struct HomeSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Title skeleton - matches .font(.title3) height
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 160, height: 20)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.appBorderAdaptive)
              .frame(width: 120, height: 180)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}
