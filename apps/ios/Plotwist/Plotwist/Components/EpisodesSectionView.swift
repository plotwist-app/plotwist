//
//  EpisodesSectionView.swift
//  Plotwist
//

import SwiftUI

struct EpisodesSectionView: View {
  let episodes: [Episode]

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text(L10n.current.episodes)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      VStack(spacing: 16) {
        ForEach(episodes) { episode in
          EpisodeRowView(episode: episode)
        }
      }
      .padding(.horizontal, 24)
    }
  }
}
