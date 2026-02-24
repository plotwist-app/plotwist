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
                isExpanded: isExpanded
              )
            }

            // Rent
            if let rent = providers?.rent, !rent.isEmpty {
              ProviderCategoryAnimated(
                title: L10n.current.rent,
                providers: rent,
                isExpanded: isExpanded
              )
            }

            // Buy
            if let buy = providers?.buy, !buy.isEmpty {
              ProviderCategoryAnimated(
                title: L10n.current.buy,
                providers: buy,
                isExpanded: isExpanded
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

    // Check cache first
    if let cached = WatchProvidersCache.shared.providers(for: mediaId, mediaType: mediaType) {
      providers = cached
      isLoading = false
      hasLoaded = true
      onContentLoaded?(hasAnyProvider)
      return
    }

    isLoading = true

    do {
      let response = try await TMDBService.shared.getWatchProviders(
        id: mediaId,
        mediaType: mediaType
      )
      let result = response.results.forLanguage(Language.current) ?? response.results.US
      WatchProvidersCache.shared.setProviders(result, for: mediaId, mediaType: mediaType)
      providers = result
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

// MARK: - Provider Category with Layout Animation
struct ProviderCategoryAnimated: View {
  let title: String
  let providers: [WatchProvider]
  let isExpanded: Bool
  
  private let iconSize: CGFloat = 36
  private let collapsedSpacing: CGFloat = -16
  private let expandedSpacing: CGFloat = 6
  
  private var displayProviders: [WatchProvider] {
    providers
  }
  
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      // Title - stays fixed
      Text(title.uppercased())
        .font(.caption.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)
      
      // Single layout that morphs between states
      ProviderIconsLayout(
        providers: displayProviders,
        allProviders: providers,
        isExpanded: isExpanded,
        iconSize: iconSize,
        collapsedSpacing: collapsedSpacing,
        expandedSpacing: expandedSpacing
      )
    }
  }
}

// MARK: - Custom Layout for Provider Icons
struct ProviderIconsLayout: View {
  let providers: [WatchProvider]
  let allProviders: [WatchProvider]
  let isExpanded: Bool
  let iconSize: CGFloat
  let collapsedSpacing: CGFloat
  let expandedSpacing: CGFloat
  
  private let cornerRadius: CGFloat = 9
  
  var body: some View {
    let layout = isExpanded 
      ? AnyLayout(VStackLayout(alignment: .leading, spacing: expandedSpacing))
      : AnyLayout(HStackLayout(spacing: collapsedSpacing))
    
    layout {
      ForEach(Array(providers.enumerated()), id: \.element.id) { index, provider in
        HStack(spacing: 10) {
          ProviderIconView(provider: provider, size: iconSize, cornerRadius: cornerRadius)
            .zIndex(Double(providers.count - index))
          
          if isExpanded {
            Text(provider.providerName)
              .font(.subheadline)
              .foregroundColor(.appForegroundAdaptive)
            
            Spacer()
          }
        }
      }
      
    }
  }
}

// MARK: - Provider Icon View
struct ProviderIconView: View {
  let provider: WatchProvider
  let size: CGFloat
  let cornerRadius: CGFloat
  
  var body: some View {
    CachedAsyncImage(url: provider.logoURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: cornerRadius)
        .fill(Color.appBorderAdaptive)
    }
    .frame(width: size, height: size)
    .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
    .overlay(
      RoundedRectangle(cornerRadius: cornerRadius)
        .stroke(Color.appBorderAdaptive, lineWidth: 1.5)
    )
  }
}

// MARK: - Preview
#Preview {
  WhereToWatchSection(mediaId: 550, mediaType: "movie")
}
