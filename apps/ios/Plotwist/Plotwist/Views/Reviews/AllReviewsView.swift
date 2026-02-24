//
//  AllReviewsView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Reviews Cache
class MediaReviewsCache {
  static let shared = MediaReviewsCache()
  private init() {}

  private var cache: [String: CachedEntry] = [:]
  private let cacheDuration: TimeInterval = 300 // 5 minutes

  private struct CachedEntry {
    let reviews: [ReviewListItem]
    let timestamp: Date
  }

  func get(mediaId: Int, mediaType: String) -> [ReviewListItem]? {
    let key = "\(mediaType)_\(mediaId)"
    guard let entry = cache[key],
          Date().timeIntervalSince(entry.timestamp) < cacheDuration else {
      return nil
    }
    return entry.reviews
  }

  func set(mediaId: Int, mediaType: String, reviews: [ReviewListItem]) {
    let key = "\(mediaType)_\(mediaId)"
    cache[key] = CachedEntry(reviews: reviews, timestamp: Date())
  }

  func invalidate(mediaId: Int, mediaType: String) {
    let key = "\(mediaType)_\(mediaId)"
    cache.removeValue(forKey: key)
  }
}

// MARK: - All Reviews View
struct AllReviewsView: View {
  let mediaId: Int
  let mediaType: String
  var mediaTitle: String? = nil
  var mediaPosterPath: String? = nil
  var mediaYear: String? = nil
  var highlightedReviewId: String? = nil

  @State private var reviews: [ReviewListItem]
  @State private var isLoading: Bool
  @State private var error: String?
  @Environment(\.dismiss) private var dismiss
  @State private var expandedReviewIds: Set<String> = []
  @State private var hasScrolledToHighlight = false
  @ObservedObject private var themeManager = ThemeManager.shared

  private let cache = MediaReviewsCache.shared

  init(
    mediaId: Int,
    mediaType: String,
    mediaTitle: String? = nil,
    mediaPosterPath: String? = nil,
    mediaYear: String? = nil,
    highlightedReviewId: String? = nil
  ) {
    self.mediaId = mediaId
    self.mediaType = mediaType
    self.mediaTitle = mediaTitle
    self.mediaPosterPath = mediaPosterPath
    self.mediaYear = mediaYear
    self.highlightedReviewId = highlightedReviewId

    let cache = MediaReviewsCache.shared
    if let cached = cache.get(mediaId: mediaId, mediaType: mediaType) {
      _reviews = State(initialValue: cached)
      _isLoading = State(initialValue: false)
    } else {
      _reviews = State(initialValue: [])
      _isLoading = State(initialValue: true)
    }
  }

  private var averageRating: Double {
    guard !reviews.isEmpty else { return 0 }
    return reviews.reduce(0) { $0 + $1.rating } / Double(reviews.count)
  }

  var body: some View {
    VStack(spacing: 0) {
      // MARK: Custom Header
      headerView

      // MARK: Content
      ScrollViewReader { proxy in
        ScrollView(showsIndicators: false) {
          LazyVStack(spacing: 0) {
            if isLoading {
              // Rating summary skeleton
              HStack(spacing: 6) {
                RoundedRectangle(cornerRadius: 4)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 16, height: 16)
                RoundedRectangle(cornerRadius: 4)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 28, height: 16)
                Circle()
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 4, height: 4)
                RoundedRectangle(cornerRadius: 4)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 70, height: 14)
              }
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(.horizontal, 24)
              .padding(.top, 12)
              .padding(.bottom, 4)

              // Review items skeleton
              ForEach(0..<5, id: \.self) { index in
                ReviewItemSkeleton()
                  .padding(.horizontal, 24)
                  .padding(.vertical, 20)

                if index < 4 {
                  Divider()
                    .padding(.horizontal, 24)
                }
              }
            } else if let error = error {
              VStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle")
                  .font(.title2)
                  .foregroundColor(.appMutedForegroundAdaptive)
                Text(error)
                  .font(.subheadline)
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
              .frame(maxWidth: .infinity)
              .padding(.top, 40)
            } else if reviews.isEmpty {
              VStack(spacing: 12) {
                Image(systemName: "star.bubble")
                  .font(.system(size: 40))
                  .foregroundColor(.appMutedForegroundAdaptive)

                Text(L10n.current.beFirstToReview)
                  .font(.subheadline)
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
              .frame(maxWidth: .infinity)
              .padding(.top, 60)
            } else {
              // Rating summary
              HStack(spacing: 6) {
                Image(systemName: "star.fill")
                  .font(.system(size: 14))
                  .foregroundColor(.appStarYellow)

                Text(String(format: "%.1f", averageRating))
                  .font(.subheadline.weight(.semibold))
                  .foregroundColor(.appForegroundAdaptive)

                Text("·")
                  .foregroundColor(.appMutedForegroundAdaptive)

                Text(
                  "\(reviews.count) \(reviews.count == 1 ? L10n.current.reviewSingular.lowercased() : L10n.current.tabReviews.lowercased())"
                )
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
              }
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(.horizontal, 24)
              .padding(.top, 12)
              .padding(.bottom, 4)

              // Reviews list
              ForEach(Array(reviews.enumerated()), id: \.element.id) { index, review in
                let isHighlighted = review.id == highlightedReviewId
                let isExpanded = expandedReviewIds.contains(review.id)

                ReviewItemView(
                  review: review,
                  lineLimit: isExpanded || isHighlighted ? nil : 4
                )
                .padding(.horizontal, 24)
                .padding(.vertical, 20)
                .background(
                  isHighlighted && !hasScrolledToHighlight
                    ? Color.accentColor.opacity(0.06)
                    : Color.clear
                )
                .id(review.id)
                .contentShape(Rectangle())
                .onTapGesture {
                  withAnimation(.easeInOut(duration: 0.2)) {
                    if expandedReviewIds.contains(review.id) {
                      expandedReviewIds.remove(review.id)
                    } else {
                      expandedReviewIds.insert(review.id)
                    }
                  }
                }

                if index < reviews.count - 1 {
                  Divider()
                    .padding(.horizontal, 24)
                }
              }
            }
          }
          .padding(.bottom, 40)
        }
        .onChange(of: reviews.count) { _, _ in
          if let highlightId = highlightedReviewId,
             !hasScrolledToHighlight,
             reviews.contains(where: { $0.id == highlightId })
          {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
              withAnimation(.easeInOut(duration: 0.4)) {
                proxy.scrollTo(highlightId, anchor: .top)
              }
              DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                withAnimation(.easeOut(duration: 0.6)) {
                  hasScrolledToHighlight = true
                }
              }
            }
          }
        }
      }
    }
    .background(Color.appBackgroundAdaptive.ignoresSafeArea())
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task { await loadReviews() }
  }

  // MARK: - Custom Header (matching UserProfileView)
  private var headerView: some View {
    ZStack {
      // Centered title
      if let title = mediaTitle {
        NavigationLink {
          MediaDetailView(
            mediaId: mediaId,
            mediaType: mediaType
          )
        } label: {
          Text(title)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
            .underline()
        }
        .buttonStyle(.plain)
      } else {
        Text(L10n.current.tabReviews)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
      }

      // Back button (leading edge)
      HStack {
        Button { dismiss() } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 36, height: 36)
            .background(Color.appInputFilled)
            .clipShape(Circle())
        }
        Spacer()
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 12)
    .background(Color.appBackgroundAdaptive)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive)
        .frame(height: 1),
      alignment: .bottom
    )
  }

  private func loadReviews() async {
    // If we already have cached data in state, skip loading
    if !reviews.isEmpty {
      isLoading = false
      return
    }

    isLoading = true
    error = nil
    do {
      let apiType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      let result = try await ReviewService.shared.getReviews(tmdbId: mediaId, mediaType: apiType)
      reviews = result
      cache.set(mediaId: mediaId, mediaType: mediaType, reviews: result)
      isLoading = false
    } catch {
      self.error = error.localizedDescription
      isLoading = false
    }
  }
}
