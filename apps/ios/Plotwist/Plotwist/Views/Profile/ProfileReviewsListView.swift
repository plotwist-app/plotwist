//
//  ProfileReviewsListView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Reviews Cache
class ProfileReviewsCache {
  static let shared = ProfileReviewsCache()
  private init() {}
  
  private var cache: [String: CachedReviews] = [:]
  private let cacheDuration: TimeInterval = 300 // 5 minutes
  
  private struct CachedReviews {
    let reviews: [DetailedReview]
    let timestamp: Date
  }
  
  func get(userId: String) -> (reviews: [DetailedReview], hasMore: Bool)? {
    guard let cached = cache[userId],
          Date().timeIntervalSince(cached.timestamp) < cacheDuration else {
      return nil
    }
    return (cached.reviews, false)
  }
  
  func set(userId: String, reviews: [DetailedReview], hasMore: Bool = false) {
    cache[userId] = CachedReviews(reviews: reviews, timestamp: Date())
  }
  
  func invalidate(userId: String) {
    cache.removeValue(forKey: userId)
  }
  
  func invalidateAll() {
    cache.removeAll()
  }
}

struct ProfileReviewsListView: View {
  let userId: String
  
  @State private var reviews: [DetailedReview] = []
  @State private var isLoading = true
  @State private var error: String?
  @State private var strings = L10n.current
  
  private let cache = ProfileReviewsCache.shared
  
  // Calculate poster width: (screenWidth - 48 padding - 24 grid spacing) / 3
  private var posterWidth: CGFloat {
    (UIScreen.main.bounds.width - 48 - 24) / 3
  }
  
  var body: some View {
    Group {
      if isLoading && reviews.isEmpty {
        // Loading skeleton
        VStack(spacing: 16) {
          ForEach(0..<3, id: \.self) { _ in
            ProfileReviewSkeletonItem(posterWidth: posterWidth)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
      } else if reviews.isEmpty {
        // Empty state
        VStack(spacing: 16) {
          Image(systemName: "text.bubble")
            .font(.system(size: 48))
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(strings.beFirstToReview)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
      } else {
        // Reviews list
        VStack(spacing: 16) {
          ForEach(reviews) { review in
            NavigationLink {
              MediaDetailView(
                mediaId: review.tmdbId,
                mediaType: review.mediaType == "MOVIE" ? "movie" : "tv"
              )
            } label: {
              ProfileReviewItem(review: review, posterWidth: posterWidth)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
      }
    }
    .onAppear {
      restoreFromCache()
    }
    .task {
      await loadReviews()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  private func restoreFromCache() {
    if let cached = cache.get(userId: userId) {
      reviews = cached.reviews
      isLoading = false
    }
  }
  
  private func loadReviews() async {
    // Skip if already have cached data
    if !reviews.isEmpty { 
      isLoading = false
      return 
    }
    
    isLoading = true
    defer { isLoading = false }
    
    do {
      let newReviews = try await ReviewService.shared.getUserDetailedReviews(userId: userId)
      reviews = newReviews
      cache.set(userId: userId, reviews: newReviews, hasMore: false)
    } catch {
      self.error = error.localizedDescription
      reviews = []
    }
  }
}

// MARK: - Profile Review Item
struct ProfileReviewItem: View {
  let review: DetailedReview
  let posterWidth: CGFloat
  
  private var posterHeight: CGFloat {
    posterWidth * 1.5 // 2:3 aspect ratio
  }
  
  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      // Poster - same style as collection
      CachedAsyncImage(url: review.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: posterWidth, height: posterHeight)
      .clipShape(RoundedRectangle(cornerRadius: 12))
      .posterBorder(cornerRadius: 12)
      .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
      
      // Content
      VStack(alignment: .leading, spacing: 8) {
        // Title + Season badge
        HStack(spacing: 6) {
          Text(review.title)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(2)
          
          if let badge = review.seasonBadge {
            Text(badge)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
        
        // Stars + Date
        HStack(spacing: 8) {
          // Stars
          HStack(spacing: 2) {
            ForEach(1...5, id: \.self) { index in
              Image(systemName: starIcon(for: index))
                .font(.system(size: 14))
                .foregroundColor(starColor(for: index))
            }
          }
          
          Circle()
            .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
            .frame(width: 4, height: 4)
          
          Text(review.formattedDate)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        
        // Review text
        if !review.review.isEmpty {
          Text(review.review)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(4)
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
        
        Spacer(minLength: 0)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
  
  private func starIcon(for index: Int) -> String {
    let rating = review.rating
    if Double(index) <= rating {
      return "star.fill"
    } else if Double(index) - 0.5 <= rating {
      return "star.leadinghalf.filled"
    } else {
      return "star"
    }
  }
  
  private func starColor(for index: Int) -> Color {
    let rating = review.rating
    if Double(index) <= rating || Double(index) - 0.5 <= rating {
      return .appStarYellow
    } else {
      return .appMutedForegroundAdaptive.opacity(0.3)
    }
  }
}

// MARK: - Skeleton Item
struct ProfileReviewSkeletonItem: View {
  let posterWidth: CGFloat
  
  private var posterHeight: CGFloat {
    posterWidth * 1.5 // 2:3 aspect ratio
  }
  
  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      // Poster skeleton - same style as collection
      RoundedRectangle(cornerRadius: 12)
        .fill(Color.appBorderAdaptive)
        .frame(width: posterWidth, height: posterHeight)
      
      // Content skeleton
      VStack(alignment: .leading, spacing: 8) {
        // Title
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 20)
        
        // Stars + Date
        HStack(spacing: 8) {
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(width: 80, height: 14)
          
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(width: 70, height: 14)
        }
        
        // Review text
        VStack(alignment: .leading, spacing: 6) {
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(height: 14)
          
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(height: 14)
          
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(width: 140, height: 14)
        }
        
        Spacer(minLength: 0)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

// MARK: - Preview
#Preview {
  NavigationView {
    ProfileReviewsListView(userId: "test-user-id")
  }
}
