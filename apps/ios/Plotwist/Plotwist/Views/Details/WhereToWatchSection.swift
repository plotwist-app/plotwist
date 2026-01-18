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
      } else {
        // Content
        VStack(alignment: .leading, spacing: 24) {
          // Stream
          ProviderCategory(
            title: L10n.current.stream,
            providers: providers?.flatrate
          )
          
          // Rent
          ProviderCategory(
            title: L10n.current.rent,
            providers: providers?.rent
          )
          
          // Buy
          ProviderCategory(
            title: L10n.current.buy,
            providers: providers?.buy
          )
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
  let providers: [WatchProvider]?
  
  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.appForegroundAdaptive)
      
      if let providers, !providers.isEmpty {
        VStack(spacing: 0) {
          ForEach(providers) { provider in
            ProviderRow(provider: provider)
          }
        }
      } else {
        UnavailableRow()
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
    .padding(.vertical, 8)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

// MARK: - Unavailable Row
struct UnavailableRow: View {
  var body: some View {
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
    .padding(.vertical, 8)
    .overlay(
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1),
      alignment: .bottom
    )
  }
}

// MARK: - Preview
#Preview {
  WhereToWatchSection(mediaId: 550, mediaType: "movie")
}
