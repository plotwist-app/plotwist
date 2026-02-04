//
//  ProfileStatsView.swift
//  Plotwist
//

import SwiftUI

struct ProfileStatsView: View {
  let userId: String
  @State private var strings = L10n.current
  @State private var isLoading = true
  @State private var totalHours: Double = 0
  @State private var watchedGenres: [WatchedGenre] = []
  @State private var itemsStatus: [ItemStatusStat] = []
  @State private var error: String?

  var body: some View {
    VStack(spacing: 0) {
      if isLoading {
        loadingView
      } else if let error {
        errorView(error)
      } else {
        statsContent
      }
    }
    .task {
      await loadStats()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  // MARK: - Loading View
  private var loadingView: some View {
    VStack(spacing: 16) {
      ForEach(0..<3, id: \.self) { _ in
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
          .frame(height: 100)
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  // MARK: - Error View
  private func errorView(_ message: String) -> some View {
    VStack(spacing: 12) {
      Image(systemName: "chart.bar.xaxis")
        .font(.system(size: 32))
        .foregroundColor(.appMutedForegroundAdaptive)

      Text(strings.couldNotLoadStats)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)

      Button(strings.tryAgain) {
        Task { await loadStats() }
      }
      .font(.footnote.weight(.medium))
      .foregroundColor(.appForegroundAdaptive)
    }
    .frame(maxWidth: .infinity)
    .padding(.vertical, 48)
  }

  // MARK: - Stats Content
  private var statsContent: some View {
    VStack(spacing: 16) {
      // Time watched
      if totalHours > 0 {
        timeWatchedCard
      }

      // Top genres
      if !watchedGenres.isEmpty {
        topGenresCard
      }

      // Status distribution
      if !itemsStatus.isEmpty {
        statusDistributionCard
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
    .padding(.bottom, 24)
  }

  // MARK: - Time Watched Card
  private var timeWatchedCard: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(spacing: 8) {
        Image(systemName: "clock.fill")
          .font(.system(size: 14))
          .foregroundColor(.orange)

        Text(strings.timeWatched)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }

      HStack(alignment: .firstTextBaseline, spacing: 4) {
        Text(formattedHours)
          .font(.system(size: 32, weight: .bold, design: .rounded))
          .foregroundColor(.appForegroundAdaptive)

        Text(hoursLabel)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      if totalHours >= 24 {
        Text(formattedDays)
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(Color.appInputFilled)
    .cornerRadius(12)
  }

  private var formattedHours: String {
    if totalHours >= 1000 {
      return String(format: "%.1fk", totalHours / 1000)
    }
    return String(format: "%.0f", totalHours)
  }

  private var hoursLabel: String {
    totalHours == 1 ? strings.hour : strings.hours
  }

  private var formattedDays: String {
    let days = totalHours / 24
    let daysStr = String(format: "%.1f", days)
    return "≈ \(daysStr) \(strings.days)"
  }

  // MARK: - Top Genres Card
  private var topGenresCard: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(spacing: 8) {
        Image(systemName: "theatermasks.fill")
          .font(.system(size: 14))
          .foregroundColor(.pink)

        Text(strings.topGenres)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }

      VStack(spacing: 8) {
        ForEach(Array(watchedGenres.prefix(5).enumerated()), id: \.element.id) { index, genre in
          GenreRow(genre: genre, rank: index + 1)
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(Color.appInputFilled)
    .cornerRadius(12)
  }

  // MARK: - Status Distribution Card
  private var statusDistributionCard: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(spacing: 8) {
        Image(systemName: "chart.pie.fill")
          .font(.system(size: 14))
          .foregroundColor(.green)

        Text(strings.collectionBreakdown)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }

      VStack(spacing: 8) {
        ForEach(itemsStatus) { item in
          StatusRow(item: item, strings: strings)
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(Color.appInputFilled)
    .cornerRadius(12)
  }

  // MARK: - Load Stats
  private func loadStats() async {
    isLoading = true
    error = nil

    do {
      async let hoursTask = UserStatsService.shared.getTotalHours(userId: userId)
      async let genresTask = UserStatsService.shared.getWatchedGenres(
        userId: userId,
        language: Language.current.rawValue
      )
      async let statusTask = UserStatsService.shared.getItemsStatus(userId: userId)

      let (hours, genres, status) = try await (hoursTask, genresTask, statusTask)

      totalHours = hours
      watchedGenres = genres
      itemsStatus = status
    } catch {
      self.error = error.localizedDescription
    }

    isLoading = false
  }
}

// MARK: - Genre Row
private struct GenreRow: View {
  let genre: WatchedGenre
  let rank: Int

  private var rankColor: Color {
    switch rank {
    case 1: return .yellow
    case 2: return .gray
    case 3: return .orange
    default: return .appMutedForegroundAdaptive
    }
  }

  var body: some View {
    HStack(spacing: 12) {
      Text("\(rank)")
        .font(.caption.weight(.bold))
        .foregroundColor(rankColor)
        .frame(width: 20)

      Text(genre.name)
        .font(.subheadline)
        .foregroundColor(.appForegroundAdaptive)

      Spacer()

      Text("\(genre.count)")
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appForegroundAdaptive)

      Text(String(format: "%.0f%%", genre.percentage))
        .font(.caption)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 40, alignment: .trailing)
    }
  }
}

// MARK: - Status Row
private struct StatusRow: View {
  let item: ItemStatusStat
  let strings: Strings

  private var statusInfo: (icon: String, color: Color, name: String) {
    switch item.status {
    case "WATCHED":
      return ("eye.fill", .green, strings.watched)
    case "WATCHING":
      return ("play.circle.fill", .blue, strings.watching)
    case "WATCHLIST":
      return ("clock.fill", .orange, strings.watchlist)
    case "DROPPED":
      return ("xmark.circle.fill", .red, strings.dropped)
    default:
      return ("questionmark.circle.fill", .gray, item.status)
    }
  }

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: statusInfo.icon)
        .font(.system(size: 12))
        .foregroundColor(statusInfo.color)
        .frame(width: 20)

      Text(statusInfo.name)
        .font(.subheadline)
        .foregroundColor(.appForegroundAdaptive)

      Spacer()

      Text("\(item.count)")
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appForegroundAdaptive)

      // Progress bar
      GeometryReader { geo in
        ZStack(alignment: .leading) {
          RoundedRectangle(cornerRadius: 2)
            .fill(Color.appBorderAdaptive)

          RoundedRectangle(cornerRadius: 2)
            .fill(statusInfo.color)
            .frame(width: geo.size.width * CGFloat(item.percentage / 100))
        }
      }
      .frame(width: 60, height: 4)
    }
  }
}

#Preview {
  ProfileStatsView(userId: "preview-user-id")
}
