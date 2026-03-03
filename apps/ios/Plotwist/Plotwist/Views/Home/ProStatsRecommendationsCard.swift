//
//  ProStatsRecommendationsCard.swift
//  Plotwist
//

import SwiftUI

struct ResolvedRecommendation: Identifiable {
  let rec: AIRecommendation
  let tmdbId: Int?
  let posterURL: URL?
  let resolvedMediaType: String

  var id: String { rec.id }
}

struct ProStatsRecommendationsCard: View {
  let recs: [ResolvedRecommendation]
  let strings: Strings

  var body: some View {
    ProStatsCardShell.card(
      title: strings.forYou,
      trailing: {
        HStack(spacing: 4) {
          Image(systemName: "sparkles")
            .font(.system(size: 9))
          Text(strings.generatedByAI)
            .font(.system(size: 11, weight: .medium))
        }
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.7))
      }
    ) {
      let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
      ]
      LazyVGrid(columns: columns, spacing: 14) {
        ForEach(recs) { resolved in
          recPosterWithReason(resolved)
        }
      }
    }
  }

  @ViewBuilder
  private func recPosterWithReason(_ resolved: ResolvedRecommendation) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      let poster = CachedAsyncImage(url: resolved.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive.opacity(0.3))
          .overlay {
            Image(systemName: resolved.rec.mediaType == "movie" ? "film" : "tv")
              .font(.system(size: 24))
              .foregroundColor(.appMutedForegroundAdaptive.opacity(0.4))
          }
      }
      .aspectRatio(2 / 3, contentMode: .fit)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .shadow(color: .black.opacity(0.12), radius: 3, x: 0, y: 1)

      if let tmdbId = resolved.tmdbId {
        NavigationLink {
          MediaDetailView(mediaId: tmdbId, mediaType: resolved.resolvedMediaType)
        } label: {
          poster
        }
        .buttonStyle(.plain)
      } else {
        poster
      }

      Text(resolved.rec.reason)
        .font(.system(size: 11, weight: .regular))
        .foregroundColor(.appMutedForegroundAdaptive)
        .lineLimit(4)
        .multilineTextAlignment(.leading)
    }
  }
}

struct ProStatsRecommendationsSkeleton: View {
  var body: some View {
    ProStatsCardShell.shell(trailing: true) {
      let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
      ]
      LazyVGrid(columns: columns, spacing: 14) {
        ForEach(0..<3, id: \.self) { _ in
          VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.appBorderAdaptive.opacity(0.3))
              .aspectRatio(2 / 3, contentMode: .fit)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(height: 10)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.2))
              .frame(height: 10)
              .modifier(ShimmerEffect())
          }
        }
      }
    }
  }
}
