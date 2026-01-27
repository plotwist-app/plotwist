//
//  WhereToWatchSection.swift
//  Plotwist
//

import SwiftUI

struct WhereToWatchSection: View {
  let mediaId: Int
  let mediaType: String
  var onContentLoaded: ((Bool) -> Void)?

  @State private var providers: WatchProviderCountry?
  @State private var isLoading = true
  @State private var hasLoaded = false
  @State private var isExpanded = false
  
  @Namespace private var animationNamespace

  private var hasAnyProvider: Bool {
    let flatrate = providers?.flatrate ?? []
    let rent = providers?.rent ?? []
    let buy = providers?.buy ?? []
    return !flatrate.isEmpty || !rent.isEmpty || !buy.isEmpty
  }

  var body: some View {
    Group {
      if isLoading {
        VStack(alignment: .leading, spacing: 16) {
          // Title
          Text(L10n.current.tabWhereToWatch)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .padding(.horizontal, 24)

          HStack {
            Spacer()
            ProgressView()
            Spacer()
          }
          .padding(.vertical, 20)
        }
      } else if hasAnyProvider {
        VStack(alignment: .leading, spacing: 16) {
          // Header with title and expand arrow
          Button(action: {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
              isExpanded.toggle()
            }
          }) {
            HStack(spacing: 8) {
              Text(L10n.current.tabWhereToWatch)
                .font(.headline)
                .foregroundColor(.appForegroundAdaptive)
              
              Image(systemName: "chevron.down")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.appMutedForegroundAdaptive)
                .rotationEffect(.degrees(isExpanded ? 180 : 0))
              
              Spacer()
            }
            .padding(.horizontal, 24)
          }
          .buttonStyle(.plain)

          // Categories
          VStack(alignment: .leading, spacing: 20) {
            // Stream
            if let flatrate = providers?.flatrate, !flatrate.isEmpty {
              ProviderCategoryAnimated(
                title: L10n.current.stream,
                providers: flatrate,
                isExpanded: isExpanded,
                namespace: animationNamespace,
                categoryId: "stream"
              )
            }

            // Rent
            if let rent = providers?.rent, !rent.isEmpty {
              ProviderCategoryAnimated(
                title: L10n.current.rent,
                providers: rent,
                isExpanded: isExpanded,
                namespace: animationNamespace,
                categoryId: "rent"
              )
            }

            // Buy
            if let buy = providers?.buy, !buy.isEmpty {
              ProviderCategoryAnimated(
                title: L10n.current.buy,
                providers: buy,
                isExpanded: isExpanded,
                namespace: animationNamespace,
                categoryId: "buy"
              )
            }
          }
          .padding(.horizontal, 24)
        }
      } else {
        // No providers - show nothing
        EmptyView()
      }
    }
    .task {
      await loadProviders()
    }
  }

  private func loadProviders() async {
    // Skip if already loaded
    guard !hasLoaded else {
      isLoading = false
      onContentLoaded?(hasAnyProvider)
      return
    }

    isLoading = true

    do {
      let response = try await TMDBService.shared.getWatchProviders(
        id: mediaId,
        mediaType: mediaType
      )
      providers = response.results.forLanguage(Language.current) ?? response.results.US
      isLoading = false
      hasLoaded = true
      onContentLoaded?(hasAnyProvider)
    } catch {
      providers = nil
      isLoading = false
      hasLoaded = true
      onContentLoaded?(false)
    }
  }
}

// MARK: - Provider Category with Matched Geometry Animation
struct ProviderCategoryAnimated: View {
  let title: String
  let providers: [WatchProvider]
  let isExpanded: Bool
  let namespace: Namespace.ID
  let categoryId: String
  
  private let collapsedIconSize: CGFloat = 40
  private let expandedIconSize: CGFloat = 32
  private let overlapOffset: CGFloat = -18
  
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      // Title - stays fixed
      Text(title.uppercased())
        .font(.caption.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)
      
      if isExpanded {
        // Expanded: vertical list
        VStack(alignment: .leading, spacing: 2) {
          ForEach(Array(providers.enumerated()), id: \.element.id) { index, provider in
            HStack(spacing: 10) {
              ProviderIconAnimated(
                provider: provider,
                size: expandedIconSize,
                namespace: namespace,
                id: "\(categoryId)-\(provider.providerId)"
              )
              
              Text(provider.providerName)
                .font(.subheadline)
                .foregroundColor(.appForegroundAdaptive)
              
              Spacer()
            }
            .padding(.vertical, 4)
          }
        }
      } else {
        // Collapsed: stacked icons with overlap
        HStack(spacing: overlapOffset) {
          ForEach(Array(providers.prefix(5).enumerated()), id: \.element.id) { index, provider in
            ProviderIconAnimated(
              provider: provider,
              size: collapsedIconSize,
              namespace: namespace,
              id: "\(categoryId)-\(provider.providerId)"
            )
            .zIndex(Double(5 - index))
          }
          
          // Show +N if more than 5 providers
          if providers.count > 5 {
            Text("+\(providers.count - 5)")
              .font(.caption.weight(.semibold))
              .foregroundColor(.appMutedForegroundAdaptive)
              .frame(width: collapsedIconSize, height: collapsedIconSize)
              .background(Color.appInputFilled)
              .clipShape(RoundedRectangle(cornerRadius: 10))
              .overlay(
                RoundedRectangle(cornerRadius: 10)
                  .stroke(Color.appBorderAdaptive, lineWidth: 1.5)
              )
          }
        }
      }
    }
  }
}

// MARK: - Provider Icon with Matched Geometry
struct ProviderIconAnimated: View {
  let provider: WatchProvider
  let size: CGFloat
  let namespace: Namespace.ID
  let id: String
  
  var body: some View {
    CachedAsyncImage(url: provider.logoURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: size > 35 ? 10 : 8)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: size, height: size)
    .clipShape(RoundedRectangle(cornerRadius: size > 35 ? 10 : 8))
    .overlay(
      RoundedRectangle(cornerRadius: size > 35 ? 10 : 8)
        .stroke(Color.appBorderAdaptive, lineWidth: 1.5)
    )
    .matchedGeometryEffect(id: id, in: namespace)
  }
}

// MARK: - Preview
#Preview {
  WhereToWatchSection(mediaId: 550, mediaType: "movie")
}
