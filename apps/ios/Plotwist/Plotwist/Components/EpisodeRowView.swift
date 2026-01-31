//
//  EpisodeRowView.swift
//  Plotwist
//

import SwiftUI

struct EpisodeRowView: View {
  let episode: Episode
  let isWatched: Bool
  let isLoading: Bool
  let onToggleWatched: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Top row: Backdrop + Title/Duration + Watch button
      HStack(alignment: .center, spacing: 12) {
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
          // Duration
          if let runtime = episode.formattedRuntime {
            Text(runtime)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }

          // Episode title with number prefix
          Text("\(episode.episodeNumber). \(episode.name)")
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(2)
        }

        Spacer()

        // Watch button
        Button(action: onToggleWatched) {
          if isLoading {
            ProgressView()
              .scaleEffect(0.8)
          } else {
            Image(systemName: isWatched ? "checkmark.circle.fill" : "circle")
              .font(.system(size: 24))
              .foregroundColor(isWatched ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
          }
        }
        .disabled(isLoading)
        .frame(width: 44, height: 44)
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
