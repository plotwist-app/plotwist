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
  @State private var bestReviews: [DetailedReview] = []
  @State private var error: String?
  @State private var showAllGenres = false
  @State private var animatedHours: Double = 0

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
    VStack(spacing: 8) {
      Text(strings.timeWatched.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      HStack(alignment: .firstTextBaseline, spacing: 8) {
        Text(formattedAnimatedHours)
          .font(.system(size: 72, weight: .medium))
          .tracking(-2)
          .foregroundColor(.appForegroundAdaptive)
          .contentTransition(.numericText(countsDown: false))
        
        Text(strings.hours.lowercased())
          .font(.system(size: 18))
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      
      Text("\(formattedAnimatedDays) \(strings.daysOfContent)")
        .font(.system(size: 14))
        .foregroundColor(.appMutedForegroundAdaptive)
        .contentTransition(.numericText(countsDown: false))
    }
    .frame(maxWidth: .infinity)
    .padding(.vertical, 24)
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
      HStack(spacing: 16) {
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
      
      VStack(spacing: 24) {
        ForEach(Array(bestReviews.prefix(3).enumerated()), id: \.element.id) { index, review in
          BestReviewRow(review: review, rank: index + 1)
          
          if index < min(bestReviews.count, 3) - 1 {
            Divider()
              .background(Color.appBorderAdaptive.opacity(0.5))
          }
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
  
  // MARK: - Helpers
  private var formattedAnimatedHours: String {
    if animatedHours >= 1000 {
      return String(format: "%.1fk", animatedHours / 1000)
    }
    return String(format: "%.0f", animatedHours)
  }

  private var formattedAnimatedDays: String {
    let days = animatedHours / 24
    return String(format: "%.0f", days)
  }
  
  private func animateCount() {
    animatedHours = 0
    let target = totalHours
    let totalDuration: Double = 1.5
    let steps = 40
    let stepDuration = totalDuration / Double(steps)
    
    for step in 1...steps {
      let delay = stepDuration * Double(step)
      let progress = Double(step) / Double(steps)
      // Ease-out curve for natural deceleration
      let eased = 1 - pow(1 - progress, 3)
      
      DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
        withAnimation(.easeOut(duration: stepDuration)) {
          animatedHours = target * eased
        }
      }
    }
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
      async let reviewsTask = ReviewService.shared.getUserDetailedReviews(
        userId: userId,
        language: Language.current.rawValue,
        orderBy: "likeCount",
        page: 1,
        limit: 3
      )

      let (hours, genres, status, reviewsResponse) = try await (hoursTask, genresTask, statusTask, reviewsTask)

      totalHours = hours
      watchedGenres = genres
      itemsStatus = status
      bestReviews = reviewsResponse.reviews
      isLoading = false
      animateCount()
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
  let review: DetailedReview
  let rank: Int
  
  var body: some View {
    HStack(alignment: .top, spacing: 14) {
      // Poster
      CachedAsyncImage(url: review.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: "film")
              .font(.system(size: 16))
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      }
      .frame(width: 72, height: 108)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
      
      // Review content
      VStack(alignment: .leading, spacing: 8) {
        // Title and year
        HStack(spacing: 12) {
          Text(review.title)
            .font(.system(size: 18, weight: .light))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
          
          if let year = extractYear(from: review) {
            Text(year)
              .font(.system(size: 11, weight: .medium))
              .tracking(0.5)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        
        // Review text
        Text(review.review)
          .font(.system(size: 14))
          .foregroundColor(.appMutedForegroundAdaptive)
          .lineLimit(2)
          .lineSpacing(4)
        
        // Rating only
        HStack(spacing: 4) {
          Image(systemName: "star.fill")
            .font(.system(size: 12))
            .foregroundColor(.appForegroundAdaptive)
          Text(String(format: "%.1f", review.rating))
            .font(.system(size: 14))
            .foregroundColor(.appForegroundAdaptive)
        }
        .padding(.top, 4)
      }
    }
  }
  
  private func extractYear(from review: DetailedReview) -> String? {
    let inputFormatter = ISO8601DateFormatter()
    inputFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    
    if let date = inputFormatter.date(from: review.createdAt) {
      let calendar = Calendar.current
      return String(calendar.component(.year, from: date))
    }
    
    inputFormatter.formatOptions = [.withInternetDateTime]
    if let date = inputFormatter.date(from: review.createdAt) {
      let calendar = Calendar.current
      return String(calendar.component(.year, from: date))
    }
    
    return nil
  }
}

#Preview {
  ProfileStatsView(userId: "preview-user-id")
}
