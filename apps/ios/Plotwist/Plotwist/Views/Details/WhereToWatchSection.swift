//
//  WhereToWatchSection.swift
//  Plotwist
//

import SwiftUI

struct WhereToWatchSection: View {
  let mediaId: Int
  let mediaType: String

  @State private var providers: WatchProviderCountry?
  @State private var isLoading = true

  private var hasAnyProvider: Bool {
    let flatrate = providers?.flatrate ?? []
    let rent = providers?.rent ?? []
    let buy = providers?.buy ?? []
    return !flatrate.isEmpty || !rent.isEmpty || !buy.isEmpty
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      // Title
      Text(L10n.current.tabWhereToWatch.uppercased())
        .font(.caption.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)
        .padding(.horizontal, 24)

      if isLoading {
        HStack {
          Spacer()
          ProgressView()
          Spacer()
        }
        .padding(.vertical, 20)
      } else if hasAnyProvider {
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
      } else {
        // No providers available
        HStack(spacing: 8) {
          ZStack {
            RoundedRectangle(cornerRadius: 6)
              .stroke(Color.appBorderAdaptive, lineWidth: 1)
              .frame(width: 24, height: 24)

            Image(systemName: "xmark")
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }

          Text(L10n.current.unavailable)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)
      }
    }
    .task {
      await loadProviders()
    }
  }

  private func loadProviders() async {
    isLoading = true
    defer { isLoading = false }

    do {
      let response = try await TMDBService.shared.getWatchProviders(
        id: mediaId,
        mediaType: mediaType
      )
      providers = response.results.forLanguage(Language.current) ?? response.results.US
    } catch {
      providers = nil
    }
  }
}

// MARK: - Provider Category
struct ProviderCategory: View {
  let title: String
  let providers: [WatchProvider]

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.appForegroundAdaptive)

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
