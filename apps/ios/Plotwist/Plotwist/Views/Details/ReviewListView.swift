//
//  ReviewListView.swift
//  Plotwist
//

import SwiftUI

struct ReviewListView: View {
  let mediaId: Int
  let mediaType: String
  
  @State private var reviews: [ReviewListItem] = []
  @State private var isLoading = true
  @State private var error: String?
  
  var body: some View {
    VStack(spacing: 0) {
      if isLoading {
        // Loading state
        VStack(spacing: 16) {
          ForEach(0..<3, id: \.self) { _ in
            ReviewItemSkeleton()
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
      } else if let error = error {
        // Error state
        VStack(spacing: 8) {
          Image(systemName: "exclamationmark.triangle")
            .font(.title)
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(error)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.top, 32)
      } else if reviews.isEmpty {
        // Empty state
        VStack(spacing: 8) {
          Text(L10n.current.beFirstToReview)
            .font(.subheadline)
            .foregroundColor(.appForegroundAdaptive)
          Text(L10n.current.shareYourOpinion)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .overlay(
          RoundedRectangle(cornerRadius: 12)
            .stroke(style: StrokeStyle(lineWidth: 1, dash: [5]))
            .foregroundColor(.appBorderAdaptive)
        )
        .padding(.horizontal, 24)
        .padding(.top, 16)
      } else {
        // Reviews list
        LazyVStack(spacing: 0) {
          ForEach(Array(reviews.filter { !$0.review.isEmpty }.enumerated()), id: \.element.id) { index, review in
            VStack(spacing: 0) {
              ReviewItemView(review: review)
                .padding(.vertical, 16)
              
              // Divider (except for last item)
              if index < reviews.filter({ !$0.review.isEmpty }).count - 1 {
                Divider()
                  .background(Color.appBorderAdaptive.opacity(0.5))
              }
            }
          }
        }
        .padding(.horizontal, 24)
      }
    }
    .task {
      await loadReviews()
    }
  }
  
  private func loadReviews() async {
    isLoading = true
    error = nil
    
    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      reviews = try await ReviewService.shared.getReviews(
        tmdbId: mediaId,
        mediaType: apiMediaType
      )
      isLoading = false
    } catch {
      self.error = error.localizedDescription
      isLoading = false
    }
  }
}

// MARK: - Skeleton
struct ReviewItemSkeleton: View {
  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      // Avatar skeleton
      Circle()
        .fill(Color.appInputFilled)
        .frame(width: 40, height: 40)
      
      VStack(alignment: .leading, spacing: 0) {
        // Header: username + time
        HStack {
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appInputFilled)
            .frame(width: 100, height: 14)
          
          Spacer()
          
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appInputFilled)
            .frame(width: 40, height: 12)
        }
        
        // Stars skeleton
        HStack(spacing: 2) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 2)
              .fill(Color.appInputFilled)
              .frame(width: 14, height: 14)
          }
        }
        .padding(.top, 4)
        
        // Review text skeleton
        VStack(alignment: .leading, spacing: 4) {
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appInputFilled)
            .frame(height: 14)
          RoundedRectangle(cornerRadius: 4)
            .fill(Color.appInputFilled)
            .frame(width: 200, height: 14)
        }
        .padding(.top, 8)
      }
    }
    .shimmer()
  }
}

#Preview {
  ReviewListView(mediaId: 123, mediaType: "movie")
}
