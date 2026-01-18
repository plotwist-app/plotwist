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
          // Title
          Text(L10n.current.tabWhereToWatch)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .padding(.horizontal, 24)

          // Content - only show categories that have providers
          VStack(alignment: .leading, spacing: 24) {
            // Stream
            if let flatrate = providers?.flatrate, !flatrate.isEmpty {
              ProviderCategory(
                title: L10n.current.stream,
                providers: flatrate
              )
            }

            // Rent
            if let rent = providers?.rent, !rent.isEmpty {
              ProviderCategory(
                title: L10n.current.rent,
                providers: rent
              )
            }

            // Buy
            if let buy = providers?.buy, !buy.isEmpty {
              ProviderCategory(
                title: L10n.current.buy,
                providers: buy
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

// MARK: - Provider Category
struct ProviderCategory: View {
  let title: String
  let providers: [WatchProvider]

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title.uppercased())
        .font(.caption.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)

      VStack(spacing: 0) {
        ForEach(providers) { provider in
          ProviderRow(provider: provider)
        }
      }
    }
  }
}

// MARK: - Provider Row
struct ProviderRow: View {
  let provider: WatchProvider

  var body: some View {
    HStack(spacing: 8) {
      AsyncImage(url: provider.logoURL) { phase in
        switch phase {
        case .success(let image):
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        default:
          RoundedRectangle(cornerRadius: 6)
            .fill(Color.appBorderAdaptive)
        }
      }
      .frame(width: 24, height: 24)
      .clipShape(RoundedRectangle(cornerRadius: 6))
      .overlay(
        RoundedRectangle(cornerRadius: 6)
          .stroke(Color.appBorderAdaptive, lineWidth: 0.5)
      )

      Text(provider.providerName)
        .font(.subheadline)
        .foregroundColor(.appForegroundAdaptive)

      Spacer()
    }
    .padding(.vertical, 6)
  }
}

// MARK: - Preview
#Preview {
  WhereToWatchSection(mediaId: 550, mediaType: "movie")
}
