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
    let hasMore: Bool
    let currentPage: Int
    let timestamp: Date
  }
  
  func get(userId: String) -> (reviews: [DetailedReview], hasMore: Bool, currentPage: Int)? {
    guard let cached = cache[userId],
          Date().timeIntervalSince(cached.timestamp) < cacheDuration else {
      return nil
    }
    return (cached.reviews, cached.hasMore, cached.currentPage)
  }
  
  func set(userId: String, reviews: [DetailedReview], hasMore: Bool, currentPage: Int) {
    cache[userId] = CachedReviews(reviews: reviews, hasMore: hasMore, currentPage: currentPage, timestamp: Date())
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
  @State private var isLoadingMore = false
  @State private var error: String?
  @State private var strings = L10n.current
  @State private var currentPage = 1
  @State private var hasMore = true
  
  private let pageSize = 20
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
        // Reviews list - LazyVStack for better performance
        LazyVStack(spacing: 24) {
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
            .onAppear {
              // Load more when reaching near the end
              if review.id == reviews.last?.id && hasMore && !isLoadingMore {
                Task {
                  await loadMoreReviews()
                }
              }
            }
          }
          
          // Loading more indicator
          if isLoadingMore {
            HStack {
              Spacer()
              ProgressView()
              Spacer()
            }
            .padding(.vertical, 16)
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
      hasMore = cached.hasMore
      currentPage = cached.currentPage
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
      let response = try await ReviewService.shared.getUserDetailedReviews(
        userId: userId,
        page: 1,
        limit: pageSize
      )
      reviews = response.reviews
      currentPage = 1
      hasMore = response.pagination.hasMore
      cache.set(userId: userId, reviews: reviews, hasMore: hasMore, currentPage: currentPage)
    } catch {
      self.error = error.localizedDescription
      reviews = []
    }
  }
  
  private func loadMoreReviews() async {
    guard hasMore && !isLoadingMore else { return }
    
    isLoadingMore = true
    defer { isLoadingMore = false }
    
    let nextPage = currentPage + 1
    
    do {
      let response = try await ReviewService.shared.getUserDetailedReviews(
        userId: userId,
        page: nextPage,
        limit: pageSize
      )
      
      // Filter out duplicates
      let existingIds = Set(reviews.map { $0.id })
      let uniqueNewReviews = response.reviews.filter { !existingIds.contains($0.id) }
      
      reviews.append(contentsOf: uniqueNewReviews)
      currentPage = nextPage
      hasMore = response.pagination.hasMore
      cache.set(userId: userId, reviews: reviews, hasMore: hasMore, currentPage: currentPage)
    } catch {
      // Silently fail for pagination errors
      hasMore = false
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
        // Title + Season badge
        Group {
          if let badge = review.seasonBadge {
            Text(review.title)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)
            + Text(" \(badge)")
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          } else {
            Text(review.title)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)
          }
        }
        .lineLimit(2)
        
        // Stars + Date
        HStack(spacing: 8) {
          StarRatingView(rating: .constant(review.rating), size: 14, interactive: false)
          
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
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

// MARK: - Skeleton Item
struct ProfileReviewSkeletonItem: View {
  let posterWidth: CGFloat
  
  private var posterHeight: CGFloat {
    posterWidth * 1.5 // 2:3 aspect ratio
  }
  
  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      // Poster skeleton
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
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
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

#Preview {
  NavigationView {
    ProfileReviewsListView(userId: "test-user-id")
  }
}
