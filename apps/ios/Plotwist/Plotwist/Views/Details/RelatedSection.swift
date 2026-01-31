//
//  RelatedSection.swift
//  Plotwist
//

import SwiftUI

struct RelatedSection: View {
  let mediaId: Int
  let mediaType: String
  var onContentLoaded: ((Bool) -> Void)?

  @State private var recommendations: [SearchResult] = []
  @State private var isLoading = true
  @State private var hasLoaded = false

  private let strings = L10n.current

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      if isLoading {
        RelatedSectionSkeleton()
      } else if !recommendations.isEmpty {
        // Title
        HStack(spacing: 6) {
          Text(strings.tabRecommendations)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)

        // Horizontal scroll of recommendations
        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 12) {
            ForEach(recommendations.prefix(20)) { item in
              NavigationLink {
                MediaDetailView(
                  mediaId: item.id,
                  mediaType: mediaType
                )
              } label: {
                RelatedPosterCard(item: item)
              }
              .buttonStyle(.plain)
            }
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 4)
        }
        .scrollClipDisabled()
      }
    }
    .task {
      await loadRecommendations()
    }
  }

  private func loadRecommendations() async {
    // Skip if already loaded
    guard !hasLoaded else {
      isLoading = false
      onContentLoaded?(!recommendations.isEmpty)
      return
    }

    isLoading = true

    do {
      recommendations = try await TMDBService.shared.getRelatedContent(
        id: mediaId,
        mediaType: mediaType,
        variant: "recommendations",
        language: Language.current.rawValue
      )
      isLoading = false
      hasLoaded = true
      onContentLoaded?(!recommendations.isEmpty)
    } catch {
      recommendations = []
      isLoading = false
      hasLoaded = true
      onContentLoaded?(false)
    }
  }
}

// MARK: - Related Poster Card
struct RelatedPosterCard: View {
  let item: SearchResult

  var body: some View {
    CachedAsyncImage(url: item.imageURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: 16)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .posterBorder(cornerRadius: 16)
    .posterShadow()
  }
}

// MARK: - Related Section Skeleton
struct RelatedSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 140, height: 20)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 16)
              .fill(Color.appBorderAdaptive)
              .frame(width: 120, height: 180)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}
