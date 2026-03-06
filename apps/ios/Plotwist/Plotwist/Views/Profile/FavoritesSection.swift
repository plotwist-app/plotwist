//
//  FavoritesSection.swift
//  Plotwist
//

import SwiftUI

struct FavoritesSection: View {
  let isOwnProfile: Bool
  var userId: String?

  @State private var favorites: [UserFavorite] = []
  @State private var isLoading = true

  private let columns = Array(repeating: GridItem(.flexible(), spacing: 12), count: 3)

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      if isLoading {
        skeletonGrid
      } else if favorites.isEmpty {
        emptyState
      } else {
        LazyVGrid(columns: columns, spacing: 12) {
          ForEach(favorites) { fav in
            let type = fav.mediaType == "MOVIE" ? "movie" : "tv"
            NavigationLink {
              MediaDetailView(mediaId: fav.tmdbId, mediaType: type)
            } label: {
              ProfileItemCard(tmdbId: fav.tmdbId, mediaType: fav.mediaType)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
      }
    }
    .task {
      await loadFavorites()
    }
  }

  private func loadFavorites() async {
    guard let uid = userId ?? CollectionCache.shared.user?.id else {
      isLoading = false
      return
    }
    do {
      favorites = try await FavoritesService.shared.getFavorites(userId: uid)
    } catch {}
    isLoading = false
  }

  private var skeletonGrid: some View {
    LazyVGrid(columns: columns, spacing: 12) {
      ForEach(0..<3, id: \.self) { _ in
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
          .aspectRatio(2 / 3, contentMode: .fit)
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 16)
  }

  private var emptyState: some View {
    VStack(spacing: 12) {
      Image(systemName: "heart")
        .font(.system(size: 48))
        .foregroundColor(.appMutedForegroundAdaptive)
        .padding(.bottom, 4)

      Text(L10n.current.favorites)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)

      Text(isOwnProfile
        ? L10n.current.favoritesEmptyOwn
        : L10n.current.favoritesEmptyOther)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .multilineTextAlignment(.center)
        .padding(.horizontal, 32)
    }
    .frame(maxWidth: .infinity)
    .padding(.top, 60)
  }
}
