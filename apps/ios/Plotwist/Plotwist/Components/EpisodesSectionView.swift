//
//  EpisodesSectionView.swift
//  Plotwist
//

import SwiftUI

struct EpisodesSectionView: View {
  let seriesId: Int
  let seasonNumber: Int
  let episodes: [Episode]

  @State private var watchedEpisodes: [UserEpisode] = []
  @State private var isLoading = true
  @State private var loadingEpisodeIds: Set<Int> = []

  private var watchedCount: Int {
    episodes.filter { episode in
      watchedEpisodes.contains { $0.episodeNumber == episode.episodeNumber && $0.seasonNumber == seasonNumber }
    }.count
  }

  private var progress: Double {
    guard !episodes.isEmpty else { return 0 }
    return Double(watchedCount) / Double(episodes.count)
  }

  private func isEpisodeWatched(_ episode: Episode) -> Bool {
    watchedEpisodes.contains { $0.episodeNumber == episode.episodeNumber && $0.seasonNumber == seasonNumber }
  }

  private func watchedEpisodeId(for episode: Episode) -> String? {
    watchedEpisodes.first { $0.episodeNumber == episode.episodeNumber && $0.seasonNumber == seasonNumber }?.id
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      // Header with title and progress
      HStack {
        Text(L10n.current.episodes)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        // Progress text (only show if authenticated)
        if AuthService.shared.isAuthenticated {
          Text(L10n.current.episodesWatchedCount
            .replacingOccurrences(of: "%d", with: "\(watchedCount)")
            .replacingOccurrences(of: "%total", with: "\(episodes.count)")
          )
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(.horizontal, 24)

      // Progress bar (only show if authenticated)
      if AuthService.shared.isAuthenticated {
        GeometryReader { geometry in
          ZStack(alignment: .leading) {
            // Background
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.appBorderAdaptive)
              .frame(height: 6)

            // Progress
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.green)
              .frame(width: geometry.size.width * progress, height: 6)
              .animation(.easeInOut(duration: 0.3), value: progress)
          }
        }
        .frame(height: 6)
        .padding(.horizontal, 24)
      }

      // Episodes List
      VStack(spacing: 16) {
        ForEach(episodes) { episode in
          EpisodeRowView(
            episode: episode,
            isWatched: isEpisodeWatched(episode),
            isLoading: loadingEpisodeIds.contains(episode.episodeNumber),
            onToggleWatched: {
              Task {
                await toggleWatched(episode)
              }
            }
          )
        }
      }
      .padding(.horizontal, 24)
    }
    .task {
      if AuthService.shared.isAuthenticated {
        await loadWatchedEpisodes()
      } else {
        isLoading = false
      }
    }
  }

  // MARK: - Load Watched Episodes
  private func loadWatchedEpisodes() async {
    isLoading = true
    defer { isLoading = false }

    do {
      watchedEpisodes = try await UserEpisodeService.shared.getWatchedEpisodes(tmdbId: seriesId)
    } catch {
      print("Error loading watched episodes: \(error)")
      watchedEpisodes = []
    }
  }

  // MARK: - Toggle Watched
  private func toggleWatched(_ episode: Episode) async {
    loadingEpisodeIds.insert(episode.episodeNumber)
    defer { loadingEpisodeIds.remove(episode.episodeNumber) }

    if let watchedId = watchedEpisodeId(for: episode) {
      // Unmark as watched
      do {
        try await UserEpisodeService.shared.unmarkAsWatched(id: watchedId, tmdbId: seriesId)
        watchedEpisodes.removeAll { $0.id == watchedId }
      } catch {
        print("Error unmarking episode: \(error)")
      }
    } else {
      // Mark as watched
      do {
        let userEpisode = try await UserEpisodeService.shared.markAsWatched(
          tmdbId: seriesId,
          seasonNumber: seasonNumber,
          episodeNumber: episode.episodeNumber,
          runtime: episode.runtime
        )
        watchedEpisodes.append(userEpisode)
      } catch {
        print("Error marking episode: \(error)")
      }
    }
  }
}
