//
//  SeasonsListView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Seasons Tab
enum SeasonsTab: CaseIterable {
  case grid
  case overview

  func displayName(strings: Strings) -> String {
    switch self {
    case .grid: return strings.grid
    case .overview: return strings.overview
    }
  }
}

// MARK: - Seasons List View
struct SeasonsListView: View {
  let seasons: [Season]
  let seriesId: Int
  let seriesName: String

  @Environment(\.dismiss) private var dismiss
  @State private var selectedTab: SeasonsTab = .grid
  @State private var seasonsDetails: [SeasonDetails] = []
  @State private var isLoadingDetails = false
  @ObservedObject private var themeManager = ThemeManager.shared

  private let strings = L10n.current

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        HStack {
          Button {
            dismiss()
          } label: {
            Image(systemName: "chevron.left")
              .font(.system(size: 18, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 40, height: 40)
          }

          Spacer()

          Text(strings.tabSeasons)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          // Placeholder for symmetry
          Color.clear
            .frame(width: 40, height: 40)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)

        // Tabs
        SeasonsTabs(selectedTab: $selectedTab, strings: strings)
          .padding(.top, 8)

        // Content
        ScrollView {
          switch selectedTab {
          case .grid:
            gridContent
          case .overview:
            overviewContent
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task {
      await loadSeasonsDetails()
    }
  }

  // MARK: - Grid Content
  private var gridContent: some View {
    LazyVGrid(columns: columns, spacing: 16) {
      ForEach(seasons) { season in
        NavigationLink {
          SeasonDetailView(seriesId: seriesId, seriesName: seriesName, season: season)
        } label: {
          VStack(alignment: .leading, spacing: 8) {
            CachedAsyncImage(url: season.posterURL) { image in
              image
                .resizable()
                .aspectRatio(2 / 3, contentMode: .fill)
            } placeholder: {
              RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                .fill(Color.appBorderAdaptive)
                .aspectRatio(2 / 3, contentMode: .fill)
                .overlay(
                  VStack(spacing: 4) {
                    Image(systemName: "photo")
                      .font(.title3)
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
            .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
            .posterBorder()
            .posterShadow()
          }
        }
        .buttonStyle(.plain)
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
    .padding(.bottom, 24)
  }

  // MARK: - Overview Content
  private var overviewContent: some View {
    VStack(spacing: 0) {
      if isLoadingDetails {
        // Loading skeleton
        VStack(spacing: 0) {
          ForEach(0..<10, id: \.self) { _ in
            HStack(spacing: 0) {
              RoundedRectangle(cornerRadius: 4)
                .fill(Color.appBorderAdaptive)
                .frame(width: 30, height: 20)
                .padding(.horizontal, 12)
                .padding(.vertical, 10)

              ForEach(0..<min(seasons.count, 5), id: \.self) { _ in
                RoundedRectangle(cornerRadius: 8)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 40, height: 22)
                  .frame(maxWidth: .infinity)
                  .padding(.vertical, 10)
              }
            }
          }
        }
        .padding(.top, 16)
      } else if seasonsDetails.isEmpty {
        // Empty state
        VStack(spacing: 12) {
          Image(systemName: "chart.bar.xaxis")
            .font(.largeTitle)
            .foregroundColor(.appMutedForegroundAdaptive)
          Text("No data available")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(.top, 60)
      } else {
        // Episodes ratings table
        SeasonsOverviewTable(
          seasons: seasons,
          seasonsDetails: seasonsDetails
        )
        .padding(.top, 16)

        // Color legend (after table)
        RatingLegend()
          .padding(.horizontal, 24)
          .padding(.top, 20)
      }
    }
    .padding(.bottom, 24)
  }

  // MARK: - Load Seasons Details
  private func loadSeasonsDetails() async {
    isLoadingDetails = true
    defer { isLoadingDetails = false }

    do {
      var details: [SeasonDetails] = []
      for season in seasons {
        let seasonDetail = try await TMDBService.shared.getSeasonDetails(
          seriesId: seriesId,
          seasonNumber: season.seasonNumber,
          language: Language.current.rawValue
        )
        details.append(seasonDetail)
      }
      seasonsDetails = details
    } catch {
      seasonsDetails = []
    }
  }
}

// MARK: - Seasons Tabs
struct SeasonsTabs: View {
  @Binding var selectedTab: SeasonsTab
  let strings: Strings
  @Namespace private var tabNamespace

  var body: some View {
    HStack(spacing: 0) {
      ForEach(SeasonsTab.allCases, id: \.self) { tab in
        Button {
          withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
            selectedTab = tab
          }
        } label: {
          VStack(spacing: 8) {
            Text(tab.displayName(strings: strings))
              .font(.subheadline.weight(.medium))
              .foregroundColor(
                selectedTab == tab
                  ? .appForegroundAdaptive
                  : .appMutedForegroundAdaptive
              )

            // Sliding indicator
            ZStack {
              Rectangle()
                .fill(Color.clear)
                .frame(height: 3)

              if selectedTab == tab {
                Rectangle()
                  .fill(Color.appForegroundAdaptive)
                  .frame(height: 3)
                  .matchedGeometryEffect(id: "seasonsTabIndicator", in: tabNamespace)
              }
            }
          }
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
      }
    }
    .padding(.horizontal, 24)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

// MARK: - Rating Colors (iOS System Colors)
enum RatingColor {
  // iOS System Green - Awesome (8-10)
  static let awesome = Color(red: 52 / 255, green: 199 / 255, blue: 89 / 255)
  // iOS System Teal - Great (6-8)
  static let great = Color(red: 90 / 255, green: 200 / 255, blue: 250 / 255)
  // iOS System Yellow - Good (4-6)
  static let good = Color(red: 255 / 255, green: 204 / 255, blue: 0 / 255)
  // iOS System Orange - Bad (2-4)
  static let bad = Color(red: 255 / 255, green: 149 / 255, blue: 0 / 255)
  // iOS System Red - Terrible (0-2)
  static let terrible = Color(red: 255 / 255, green: 59 / 255, blue: 48 / 255)
}

// MARK: - Rating Legend
struct RatingLegend: View {
  private let strings = L10n.current

  var body: some View {
    HStack(spacing: 14) {
      LegendItem(color: RatingColor.awesome, label: strings.ratingAwesome)
      LegendItem(color: RatingColor.great, label: strings.ratingGreat)
      LegendItem(color: RatingColor.good, label: strings.ratingGood)
      LegendItem(color: RatingColor.bad, label: strings.ratingBad)
      LegendItem(color: RatingColor.terrible, label: strings.ratingTerrible)
    }
    .frame(maxWidth: .infinity)
  }
}

// MARK: - Legend Item
struct LegendItem: View {
  let color: Color
  let label: String

  var body: some View {
    HStack(spacing: 5) {
      Circle()
        .fill(color)
        .frame(width: 8, height: 8)

      Text(label)
        .font(.caption2)
        .foregroundColor(.appMutedForegroundAdaptive)
    }
  }
}

// MARK: - Seasons Overview Table
struct SeasonsOverviewTable: View {
  let seasons: [Season]
  let seasonsDetails: [SeasonDetails]

  private var maxEpisodes: Int {
    seasonsDetails.map { $0.episodes.count }.max() ?? 0
  }

  var body: some View {
    VStack(spacing: 0) {
      // Header row
      headerRow

      // Episode rows
      episodeRows
    }
    .clipShape(RoundedRectangle(cornerRadius: 8))
    .overlay(
      RoundedRectangle(cornerRadius: 8)
        .stroke(Color.appBorderAdaptive, lineWidth: 1)
    )
    .padding(.horizontal, 24)
  }

  // MARK: - Header Row
  private var headerRow: some View {
    HStack(spacing: 0) {
      // EP column header
      Text("EP")
        .font(.caption.weight(.bold))
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 44)
        .padding(.vertical, 12)
        .overlay(
          Rectangle()
            .fill(Color.appBorderAdaptive)
            .frame(width: 1),
          alignment: .trailing
        )

      // Season column headers
      ForEach(seasons) { season in
        Text("S\(season.seasonNumber)")
          .font(.caption.weight(.semibold))
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .padding(.vertical, 12)
      }
    }
    .background(Color.appInputFilled)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }

  // MARK: - Episode Rows
  private var episodeRows: some View {
    VStack(spacing: 0) {
      ForEach(1...maxEpisodes, id: \.self) { episodeNumber in
        HStack(spacing: 0) {
          // Episode number
          Text("\(episodeNumber)")
            .font(.caption.weight(.medium))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(width: 44)
            .padding(.vertical, 10)
            .background(Color.appInputFilled)
            .overlay(
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(width: 1),
              alignment: .trailing
            )

          // Ratings for each season
          ForEach(seasons) { season in
            let seasonDetail = seasonsDetails.first { $0.seasonNumber == season.seasonNumber }
            let episode = seasonDetail?.episodes.first { $0.episodeNumber == episodeNumber }

            if let episode = episode, episode.voteAverage > 0 {
              RatingBadge(rating: episode.voteAverage)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 6)
            } else {
              Text("–")
                .font(.caption)
                .foregroundColor(.appBorderAdaptive)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 10)
            }
          }
        }
        .background(Color.appBackgroundAdaptive)

        // Divider (except for last row)
        if episodeNumber < maxEpisodes {
          Rectangle()
            .fill(Color.appBorderAdaptive)
            .frame(height: 1)
        }
      }
    }
  }
}

// MARK: - Rating Badge
struct RatingBadge: View {
  let rating: Double

  private var ratingColor: Color {
    switch rating {
    case 8.0...: return RatingColor.awesome
    case 6.0..<8.0: return RatingColor.great
    case 4.0..<6.0: return RatingColor.good
    case 2.0..<4.0: return RatingColor.bad
    default: return RatingColor.terrible
    }
  }

  var body: some View {
    Text(String(format: "%.1f", rating))
      .font(.caption.weight(.semibold))
      .foregroundColor(ratingColor)
      .padding(.horizontal, 8)
      .padding(.vertical, 4)
      .background(ratingColor.opacity(0.15))
      .clipShape(RoundedRectangle(cornerRadius: 6))
  }
}
