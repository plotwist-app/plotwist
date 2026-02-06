//
//  ProfileStatsView.swift
//  Plotwist
//

import SwiftUI

struct ProfileStatsView: View {
  let userId: String
  var isSelected: Bool = true
  @State private var strings = L10n.current
  @State private var isLoading = true
  @State private var totalHours: Double = 0
  @State private var watchedGenres: [WatchedGenre] = []
  @State private var itemsStatus: [ItemStatusStat] = []
  @State private var bestReviews: [BestReview] = []
  @State private var error: String?
  @State private var showAllGenres = false
  @State private var showAllReviews = false
  @State private var countStartTime: Date?
  @State private var dataLoaded = false
  
  private let countDuration: Double = 1.8

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
    .onChange(of: isSelected) { _, newValue in
      if newValue && dataLoaded {
        countStartTime = .now
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  // MARK: - Loading View
  private var loadingView: some View {
    VStack(spacing: 32) {
      // Hero stats skeleton
      VStack(spacing: 8) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 120, height: 12)
        RoundedRectangle(cornerRadius: 8)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 72)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 100, height: 14)
      }
      .padding(.vertical, 32)
      
      Divider()
      
      // Genres skeleton
      VStack(alignment: .leading, spacing: 16) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 100, height: 12)
        HStack(spacing: 8) {
          ForEach(0..<4, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 20)
              .fill(Color.appBorderAdaptive)
              .frame(width: 80, height: 36)
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      
      Divider()
      
      // Status bar skeleton
      VStack(alignment: .leading, spacing: 16) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 120, height: 12)
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(height: 8)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
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
    VStack(spacing: 32) {
      // Hero Stats - Total Watch Time
      heroStatsSection
      
      Divider()
      
      // Favorite Genres - Horizontal Chips
      if !watchedGenres.isEmpty {
        genresChipsSection
      }
      
      Divider()
      
      // Collection Status - Stacked Bar
      if !itemsStatus.isEmpty {
        statusBarSection
      }
      
      Divider()
      
      // Best Reviews
      if !bestReviews.isEmpty {
        bestReviewsSection
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
    .padding(.bottom, 24)
  }
  
  // MARK: - Hero Stats Section
  private var heroStatsSection: some View {
    TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { timeline in
      let currentHours = interpolatedHours(at: timeline.date)
      
      VStack(spacing: 8) {
        Text(strings.timeWatched.uppercased())
          .font(.system(size: 11, weight: .medium))
          .tracking(1.5)
          .foregroundColor(.appMutedForegroundAdaptive)
        
        HStack(alignment: .firstTextBaseline, spacing: 8) {
          Text(formatHours(currentHours))
            .font(.system(size: 72, weight: .medium))
            .tracking(-2)
            .foregroundColor(.appForegroundAdaptive)
            .contentTransition(.numericText(countsDown: false))
            .animation(.snappy(duration: 0.2), value: formatHours(currentHours))
          
          Text(strings.hours.lowercased())
            .font(.system(size: 18))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        
        let daysText = "\(formatDays(currentHours)) \(strings.daysOfContent)"
        Text(daysText)
          .font(.system(size: 14))
          .foregroundColor(.appMutedForegroundAdaptive)
          .contentTransition(.numericText(countsDown: false))
          .animation(.snappy(duration: 0.2), value: daysText)
      }
      .frame(maxWidth: .infinity)
      .padding(.vertical, 24)
    }
  }
  
  // MARK: - Genres Chips Section
  private var genresChipsSection: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text(strings.favoriteGenres.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      FlowLayout(spacing: 8) {
        ForEach(Array(watchedGenres.prefix(5).enumerated()), id: \.element.id) { index, genre in
          StatsGenreChip(genre: genre, isFirst: index == 0)
        }
        
        if watchedGenres.count > 5 {
          Button {
            showAllGenres = true
          } label: {
            HStack(spacing: 6) {
              Text(strings.othersGenres)
                .font(.system(size: 14, weight: .medium))
              Image(systemName: "chevron.right")
                .font(.system(size: 10, weight: .semibold))
            }
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .overlay(
              RoundedRectangle(cornerRadius: 20)
                .strokeBorder(Color.appBorderAdaptive.opacity(0.5), lineWidth: 1, antialiased: true)
            )
            .clipShape(RoundedRectangle(cornerRadius: 20))
          }
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .sheet(isPresented: $showAllGenres) {
      allGenresSheet
    }
  }
  
  // MARK: - All Genres Sheet
  private var allGenresSheet: some View {
    FloatingSheetContainer {
      VStack(spacing: 0) {
        // Header
        HStack {
          Text(strings.favoriteGenres.uppercased())
            .font(.system(size: 11, weight: .medium))
            .tracking(1.5)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
          Button {
            showAllGenres = false
          } label: {
            Image(systemName: "xmark")
              .font(.system(size: 14, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 24)
        .padding(.bottom, 16)
        
        // Genre list
        ScrollView {
          VStack(spacing: 0) {
            ForEach(watchedGenres) { genre in
              HStack {
                Text(genre.name)
                  .font(.system(size: 16))
                  .foregroundColor(.appForegroundAdaptive)
                Spacer()
                HStack(spacing: 8) {
                  Text("\(genre.count)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.appForegroundAdaptive)
                  Text(String(format: "%.0f%%", genre.percentage))
                    .font(.system(size: 12))
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .frame(width: 36, alignment: .trailing)
                }
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 14)
              
              if genre.id != watchedGenres.last?.id {
                Divider()
                  .padding(.horizontal, 24)
              }
            }
          }
        }
        .frame(maxHeight: 400)
        .padding(.bottom, 24)
      }
    }
    .floatingSheetPresentation(detents: [.medium])
  }
  
  // MARK: - Status Bar Section
  private var statusBarSection: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text(strings.collectionStatus.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      // Stacked progress bar
      GeometryReader { geo in
        HStack(spacing: 0) {
          ForEach(Array(itemsStatus.enumerated()), id: \.element.id) { index, item in
            let statusInfo = getStatusInfo(item.status)
            Rectangle()
              .fill(statusInfo.color)
              .frame(width: geo.size.width * CGFloat(item.percentage / 100))
              .clipShape(
                UnevenRoundedRectangle(
                  topLeadingRadius: index == 0 ? 4 : 0,
                  bottomLeadingRadius: index == 0 ? 4 : 0,
                  bottomTrailingRadius: index == itemsStatus.count - 1 ? 4 : 0,
                  topTrailingRadius: index == itemsStatus.count - 1 ? 4 : 0
                )
              )
          }
        }
      }
      .frame(height: 8)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 4))
      
      // Legend
      FlowLayout(spacing: 16) {
        ForEach(itemsStatus) { item in
          let statusInfo = getStatusInfo(item.status)
          HStack(spacing: 6) {
            Circle()
              .fill(statusInfo.color)
              .frame(width: 8, height: 8)
            Text(statusInfo.name)
              .font(.system(size: 12))
              .foregroundColor(.appMutedForegroundAdaptive)
            Text("\(item.count)")
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.appForegroundAdaptive)
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
  
  // MARK: - Best Reviews Section
  private var bestReviewsSection: some View {
    VStack(alignment: .leading, spacing: 24) {
      Text(strings.bestReviews.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      VStack(alignment: .leading, spacing: 24) {
        ForEach(Array(bestReviews.prefix(3).enumerated()), id: \.element.id) { index, review in
          BestReviewRow(review: review, rank: index + 1)
          
          if index < min(bestReviews.count, 3) - 1 {
            Divider()
              .background(Color.appBorderAdaptive.opacity(0.5))
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      
      if bestReviews.count > 3 {
        Button {
          showAllReviews = true
        } label: {
          Text(strings.seeAll)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .overlay(
              RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.appBorderAdaptive.opacity(0.5), lineWidth: 1)
            )
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .fullScreenCover(isPresented: $showAllReviews) {
      allReviewsSheet
    }
  }
  
  // MARK: - All Reviews Sheet
  private var allReviewsSheet: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 24) {
          ForEach(Array(bestReviews.enumerated()), id: \.element.id) { index, review in
            BestReviewRow(review: review, rank: index + 1)
            
            if index < bestReviews.count - 1 {
              Divider()
                .background(Color.appBorderAdaptive.opacity(0.5))
            }
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 8)
        .padding(.bottom, 24)
      }
      .background(Color.appBackgroundAdaptive)
      .navigationTitle(strings.bestReviews)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button {
            showAllReviews = false
          } label: {
            Image(systemName: "xmark.circle.fill")
              .font(.system(size: 20))
              .foregroundStyle(.gray, Color(.systemGray5))
          }
        }
      }
    }
  }
  
  // MARK: - Helpers
  private func interpolatedHours(at date: Date) -> Double {
    guard let start = countStartTime else { return 0 }
    let elapsed = date.timeIntervalSince(start)
    let progress = min(elapsed / countDuration, 1.0)
    // Ease-out exponential for snappy start, smooth deceleration
    let eased = 1 - pow(2, -10 * progress)
    return totalHours * eased
  }
  
  private func formatHours(_ hours: Double) -> String {
    if totalHours >= 1000 {
      return String(format: "%.1fk", hours / 1000)
    }
    return String(format: "%.0f", hours)
  }

  private func formatDays(_ hours: Double) -> String {
    let days = hours / 24
    return String(format: "%.0f", days)
  }
  
  private func getStatusInfo(_ status: String) -> (color: Color, name: String) {
    switch status {
    case "WATCHED":
      return (Color(hex: "10B981"), strings.watched)  // emerald-500
    case "WATCHING":
      return (Color(hex: "3B82F6"), strings.watching)  // blue-500
    case "WATCHLIST":
      return (Color(hex: "F59E0B"), strings.watchlist)  // amber-500
    case "DROPPED":
      return (Color(hex: "EF4444"), strings.dropped)  // red-500
    default:
      return (Color(hex: "71717A"), status)  // zinc-500
    }
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
      async let reviewsTask = UserStatsService.shared.getBestReviews(
        userId: userId,
        language: Language.current.rawValue
      )

      let (hours, genres, status, reviews) = try await (hoursTask, genresTask, statusTask, reviewsTask)

      totalHours = hours
      watchedGenres = genres
      itemsStatus = status
      bestReviews = reviews
      isLoading = false
      dataLoaded = true
      
      // Only start countdown animation if this tab is currently visible
      if isSelected {
        countStartTime = .now
      }
    } catch {
      self.error = error.localizedDescription
      isLoading = false
    }
  }
}

// MARK: - Stats Genre Chip
private struct StatsGenreChip: View {
  let genre: WatchedGenre
  let isFirst: Bool
  
  var body: some View {
    HStack(spacing: 8) {
      Text(genre.name)
        .font(.system(size: 14, weight: .medium))
      Text("\(genre.count)")
        .font(.system(size: 12))
        .opacity(isFirst ? 0.6 : 1)
    }
    .foregroundColor(isFirst ? .appBackgroundAdaptive : .appForegroundAdaptive)
    .padding(.horizontal, 16)
    .padding(.vertical, 10)
    .background(isFirst ? Color.appForegroundAdaptive : Color.clear)
    .overlay(
      RoundedRectangle(cornerRadius: 20)
        .strokeBorder(Color.appBorderAdaptive, lineWidth: isFirst ? 0 : 1)
    )
    .clipShape(RoundedRectangle(cornerRadius: 20))
  }
}

// MARK: - Best Review Row
private struct BestReviewRow: View {
  let review: BestReview
  let rank: Int
  
  // Same poster sizing as ProfileReviewItem
  private var posterWidth: CGFloat {
    (UIScreen.main.bounds.width - 48 - 24) / 3
  }
  
  private var posterHeight: CGFloat {
    posterWidth * 1.5
  }
  
  private var formattedDate: String {
    let inputFormatter = ISO8601DateFormatter()
    inputFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    
    guard let date = inputFormatter.date(from: review.createdAt) else {
      inputFormatter.formatOptions = [.withInternetDateTime]
      guard let date = inputFormatter.date(from: review.createdAt) else {
        return review.createdAt
      }
      return formatDate(date)
    }
    return formatDate(date)
  }
  
  private func formatDate(_ date: Date) -> String {
    let outputFormatter = DateFormatter()
    outputFormatter.dateFormat = "dd/MM/yyyy"
    return outputFormatter.string(from: date)
  }
  
  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      // Poster
      CachedAsyncImage(url: review.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: posterWidth, height: posterHeight)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
      
      // Content
      VStack(alignment: .leading, spacing: 8) {
        // Title
        Text(review.title)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(2)
        
        // Stars + Date
        HStack(spacing: 8) {
          StarRatingView(rating: .constant(review.rating), size: 14, interactive: false)
          
          Circle()
            .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
            .frame(width: 4, height: 4)
          
          Text(formattedDate)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        
        // Review text
        if !review.review.isEmpty {
          Text(review.review)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(3)
            .multilineTextAlignment(.leading)
            .blur(radius: review.hasSpoilers ? 4 : 0)
            .overlay(
              review.hasSpoilers
                ? Text(L10n.current.containSpoilers)
                    .font(.caption.weight(.medium))
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.appInputFilled)
                    .cornerRadius(4)
                : nil
            )
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

#Preview {
  ProfileStatsView(userId: "preview-user-id")
}
