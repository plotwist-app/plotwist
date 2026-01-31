//
//  SeasonsSection.swift
//  Plotwist
//

import SwiftUI

struct SeasonsSection: View {
  let seasons: [Season]
  let seriesId: Int
  let seriesName: String
  var onContentLoaded: ((Bool) -> Void)?

  private let strings = L10n.current

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      if !seasons.isEmpty {
        // Title with navigation
        NavigationLink {
          SeasonsListView(seasons: seasons, seriesId: seriesId, seriesName: seriesName)
        } label: {
          HStack(spacing: 6) {
            Text(strings.tabSeasons)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)

            Image(systemName: "chevron.right")
              .font(.caption.weight(.semibold))
              .foregroundColor(.appMutedForegroundAdaptive)

            Spacer()
          }
          .padding(.horizontal, 24)
        }
        .buttonStyle(.plain)

        // Horizontal scroll of seasons (posters only)
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 12) {
            ForEach(seasons) { season in
              NavigationLink {
                SeasonDetailView(seriesId: seriesId, seriesName: seriesName, season: season)
              } label: {
                SeasonPosterCard(season: season)
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
    .onAppear {
      onContentLoaded?(!seasons.isEmpty)
    }
  }
}

// MARK: - Season Poster Card
struct SeasonPosterCard: View {
  let season: Season

  var body: some View {
    CachedAsyncImage(url: season.posterURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive)
        .overlay(
          VStack(spacing: 4) {
            Image(systemName: "photo")
              .font(.title2)
              .foregroundColor(.appMutedForegroundAdaptive)
            Text(season.name)
              .font(.caption2)
              .foregroundColor(.appMutedForegroundAdaptive)
              .multilineTextAlignment(.center)
              .lineLimit(2)
              .padding(.horizontal, 4)
          }
        )
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .posterShadow()
  }
}

// MARK: - Seasons Section Skeleton
struct SeasonsSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 100, height: 20)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<4, id: \.self) { _ in
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
