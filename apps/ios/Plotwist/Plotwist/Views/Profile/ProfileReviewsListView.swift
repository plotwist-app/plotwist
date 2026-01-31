//
//  ProfileReviewsListView.swift
//  Plotwist
//

import SwiftUI

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
    .task {
      await loadReviews()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  private func loadReviews() async {
    guard reviews.isEmpty else { return }
    
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
  
  // Pre-compute star data for better performance
  private var starData: [(icon: String, color: Color)] {
    (1...5).map { index in
      let rating = review.rating
      let isFilled = Double(index) <= rating
      let isHalf = !isFilled && Double(index) - 0.5 <= rating
      
      let icon: String
      if isFilled {
        icon = "star.fill"
      } else if isHalf {
        icon = "star.leadinghalf.filled"
      } else {
        icon = "star"
      }
      
      let color: Color = (isFilled || isHalf) ? .appStarYellow : .appMutedForegroundAdaptive.opacity(0.3)
      
      return (icon, color)
    }
  }
  
  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      // Poster
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
          HStack(spacing: 2) {
            ForEach(0..<5, id: \.self) { index in
              Image(systemName: starData[index].icon)
                .font(.system(size: 14))
                .foregroundColor(starData[index].color)
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
      }
      .drawingGroup()
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

// MARK: - Skeleton Item
struct ProfileReviewSkeletonItem: View {
  let posterWidth: CGFloat
  
  private var posterHeight: CGFloat {
    posterWidth * 1.5
  }
  
  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      RoundedRectangle(cornerRadius: 12)
        .fill(Color.appBorderAdaptive)
        .frame(width: posterWidth, height: posterHeight)
      
      VStack(alignment: .leading, spacing: 8) {
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive)
          .frame(width: 180, height: 20)
        
        HStack(spacing: 8) {
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(width: 80, height: 14)
          
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appBorderAdaptive)
            .frame(width: 70, height: 14)
        }
        
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
