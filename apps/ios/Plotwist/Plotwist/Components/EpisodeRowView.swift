//
//  EpisodeRowView.swift
//  Plotwist
//

import SwiftUI

struct EpisodeRowView: View {
  let episode: Episode

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Top row: Backdrop + Title/Duration
      HStack(alignment: .top, spacing: 12) {
        // Episode backdrop
        CachedAsyncImage(url: episode.stillURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          RoundedRectangle(cornerRadius: 8)
            .fill(Color.appBorderAdaptive)
            .overlay(
              Image(systemName: "play.rectangle")
                .font(.title3)
                .foregroundColor(.appMutedForegroundAdaptive)
            )
        }
        .frame(width: 140, height: 80)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .posterBorder(cornerRadius: 8)

        // Title and duration
        VStack(alignment: .leading, spacing: 4) {
          // Episode title with number prefix
          Text("\(episode.episodeNumber). \(episode.name)")
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(2)

          // Duration
          if let runtime = episode.formattedRuntime {
            Text(runtime)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }

        Spacer()
      }

      // Description below
      if let overview = episode.overview, !overview.isEmpty {
        Text(overview)
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive)
          .lineLimit(3)
      }
    }
  }
}
