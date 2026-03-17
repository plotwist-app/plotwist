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
  @State private var removingIds: Set<String> = []

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
            favoriteItem(fav)
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

  @ViewBuilder
  private func favoriteItem(_ fav: UserFavorite) -> some View {
    let type = fav.mediaType == "MOVIE" ? "movie" : "tv"
    let card = NavigationLink {
      MediaDetailView(mediaId: fav.tmdbId, mediaType: type)
    } label: {
      ProfileItemCard(tmdbId: fav.tmdbId, mediaType: fav.mediaType)
    }
    .buttonStyle(.plain)
    .opacity(removingIds.contains(fav.id) ? 0 : 1)
    .scaleEffect(removingIds.contains(fav.id) ? 0.75 : 1)

    if isOwnProfile {
      card
        .contextMenu {
          Button(role: .destructive) {
            Task { await removeFavorite(fav) }
          } label: {
            Label(L10n.current.removeFromFavorites, systemImage: "heart.slash")
          }
        } preview: {
          CachedPosterPreview(tmdbId: fav.tmdbId, mediaType: fav.mediaType, width: 200)
        }
    } else {
      card
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

  private func removeFavorite(_ fav: UserFavorite) async {
    withAnimation(.easeInOut(duration: 0.25)) {
      removingIds.insert(fav.id)
    }

    do {
      _ = try await FavoritesService.shared.toggleFavorite(
        tmdbId: fav.tmdbId,
        mediaType: fav.mediaType
      )
    } catch {
      withAnimation { removingIds.remove(fav.id) }
      return
    }

    try? await Task.sleep(nanoseconds: 200_000_000)

    withAnimation(.easeInOut(duration: 0.3)) {
      favorites.removeAll { $0.id == fav.id }
      removingIds.remove(fav.id)
    }
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
    VStack(spacing: 8) {
      Image(systemName: "heart")
        .font(.system(size: 36, weight: .light))
        .foregroundStyle(.tertiary)
        .padding(.bottom, 4)

      Text(L10n.current.favorites)
        .font(.body.weight(.semibold))
        .foregroundColor(.appForegroundAdaptive)

      Text(isOwnProfile
        ? L10n.current.favoritesEmptyOwn
        : L10n.current.favoritesEmptyOther)
        .font(.subheadline)
        .foregroundStyle(.secondary)
        .multilineTextAlignment(.center)
        .padding(.horizontal, 40)
    }
    .frame(maxWidth: .infinity)
    .padding(.top, 48)
    .padding(.bottom, 24)
  }
}
