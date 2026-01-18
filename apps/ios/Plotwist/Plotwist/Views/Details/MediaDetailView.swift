//
//  MediaDetailView.swift
//  Plotwist
//

import SwiftUI

struct MediaDetailView: View {
  let mediaId: Int
  let mediaType: String

  @Environment(\.dismiss) private var dismiss
  @State private var details: MovieDetails?
  @State private var isLoading = true
  @State private var userReview: Review?
  @State private var userItem: UserItem?
  @State private var showReviewSheet = false
  @State private var reviewsRefreshId = UUID()
  @State private var backdropImages: [TMDBImage] = []
  @State private var currentBackdropIndex = 0
  @ObservedObject private var themeManager = ThemeManager.shared

  // Layout constants
  private let posterOverlapOffset: CGFloat = -70
  private let contentOffset: CGFloat = -54

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading {
        ProgressView()
      } else if let details {
        GeometryReader { geometry in
          let backdropHeight = geometry.size.height * 0.40

          ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
              // Backdrop Carousel
              ZStack(alignment: .topLeading) {
                if backdropImages.isEmpty {
                  // Fallback to single backdrop
                  AsyncImage(url: details.backdropURL) { phase in
                    switch phase {
                    case .success(let image):
                      image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                    default:
                      Rectangle()
                        .fill(Color.appBorderAdaptive)
                    }
                  }
                  .frame(height: backdropHeight)
                  .frame(maxWidth: .infinity)
                  .clipped()
                } else {
                  // Carousel
                  ZStack(alignment: .bottomTrailing) {
                    NavigationLink(
                      destination: MediaImagesView(mediaId: mediaId, mediaType: mediaType)
                    ) {
                      TabView(selection: $currentBackdropIndex) {
                        ForEach(Array(backdropImages.prefix(10).enumerated()), id: \.element.id) {
                          index, backdrop in
                          AsyncImage(url: backdrop.backdropURL) { phase in
                            switch phase {
                            case .success(let image):
                              image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                            default:
                              Rectangle()
                                .fill(Color.appBorderAdaptive)
                            }
                          }
                          .tag(index)
                        }
                      }
                      .tabViewStyle(.page(indexDisplayMode: .never))
                      .frame(height: backdropHeight)
                      .frame(maxWidth: .infinity)
                      .clipped()
                    }
                    .buttonStyle(.plain)

                    // Image counter
                    Text("\(currentBackdropIndex + 1)/\(min(backdropImages.count, 10))")
                      .font(.caption.weight(.semibold))
                      .foregroundColor(.white)
                      .padding(.horizontal, 10)
                      .padding(.vertical, 6)
                      .background(Color.black.opacity(0.6))
                      .clipShape(RoundedRectangle(cornerRadius: 6))
                      .padding(.trailing, 16)
                      .padding(.bottom, 12)
                  }
                }

                // Back button
                Button {
                  dismiss()
                } label: {
                  Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 40, height: 40)
                    .background(.ultraThinMaterial)
                    .clipShape(Circle())
                }
                .padding(.top, 60)
                .padding(.leading, 24)
              }
              .overlay(
                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.5))
                  .frame(height: 1),
                alignment: .bottom
              )

              // Content with poster overlap
              HStack(alignment: .bottom, spacing: 16) {
                // Poster
                AsyncImage(url: details.posterURL) { phase in
                  switch phase {
                  case .success(let image):
                    image
                      .resizable()
                      .aspectRatio(contentMode: .fill)
                  default:
                    RoundedRectangle(cornerRadius: 16)
                      .fill(Color.appBorderAdaptive)
                  }
                }
                .frame(width: 140, height: 210)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .posterShadow()

                // Info
                VStack(alignment: .leading, spacing: 4) {
                  if let releaseDate = details.formattedReleaseDate(
                    locale: Language.current.rawValue)
                  {
                    Text(releaseDate)
                      .font(.caption)
                      .foregroundColor(.appMutedForegroundAdaptive)
                  }

                  Text(details.displayTitle)
                    .font(.headline)
                    .foregroundColor(.appForegroundAdaptive)
                }

                Spacer()
              }
              .padding(.horizontal, 24)
              .offset(y: posterOverlapOffset)

              // Content Section
              VStack(alignment: .leading, spacing: 20) {
                // Action Buttons (Review + Status)
                if AuthService.shared.isAuthenticated {
                  MediaDetailViewActions(
                    mediaId: mediaId,
                    mediaType: mediaType,
                    userReview: userReview,
                    userItem: userItem,
                    onReviewTapped: {
                      showReviewSheet = true
                    },
                    onStatusChanged: { newItem in
                      userItem = newItem
                    }
                  )
                }

                // Overview
                if let overview = details.overview, !overview.isEmpty {
                  Text(overview)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .lineSpacing(6)
                }

                // Genres Badges
                if let genres = details.genres, !genres.isEmpty {
                  ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                      ForEach(genres) { genre in
                        BadgeView(text: genre.name)
                      }
                    }
                  }
                }
              }
              .padding(.horizontal, 24)
              .offset(y: contentOffset)

              Spacer()
                .frame(height: 24)
                .offset(y: contentOffset)

              // Divider
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.5))
                .frame(height: 1)
                .padding(.horizontal, 24)
                .offset(y: contentOffset)

              Spacer()
                .frame(height: 24)
                .offset(y: contentOffset)

              // Review Section
              ReviewSectionView(
                mediaId: mediaId,
                mediaType: mediaType,
                refreshId: reviewsRefreshId,
                onEmptyStateTapped: {
                  if AuthService.shared.isAuthenticated {
                    showReviewSheet = true
                  }
                }
              )
              .offset(y: contentOffset)

              Spacer()
                .frame(height: 24)
                .offset(y: contentOffset)

              // Where to Watch Section
              WhereToWatchSection(
                mediaId: mediaId,
                mediaType: mediaType
              )
              .offset(y: contentOffset)
            }
            .padding(.bottom, 80)
          }
          .ignoresSafeArea(edges: .top)
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .sheet(isPresented: $showReviewSheet) {
      ReviewSheet(mediaId: mediaId, mediaType: mediaType, existingReview: userReview)
    }
    .task {
      await loadDetails()
      await loadImages()
      if AuthService.shared.isAuthenticated {
        await loadUserReview()
        await loadUserItem()
      }
    }
    .onChange(of: showReviewSheet) { _, isPresented in
      if !isPresented && AuthService.shared.isAuthenticated {
        Task {
          await loadUserReview()
        }
        // Refresh the reviews list
        reviewsRefreshId = UUID()
      }
    }
  }

  private func loadDetails() async {
    isLoading = true
    defer { isLoading = false }

    do {
      if mediaType == "movie" {
        details = try await TMDBService.shared.getMovieDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      } else {
        details = try await TMDBService.shared.getTVSeriesDetails(
          id: mediaId,
          language: Language.current.rawValue
        )
      }
    } catch {
      details = nil
    }
  }

  private func loadUserReview() async {
    do {
      userReview = try await ReviewService.shared.getUserReview(
        tmdbId: mediaId,
        mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      )
    } catch {
      userReview = nil
    }
  }

  private func loadUserItem() async {
    do {
      userItem = try await UserItemService.shared.getUserItem(
        tmdbId: mediaId,
        mediaType: mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      )
    } catch {
      userItem = nil
    }
  }

  private func loadImages() async {
    do {
      let images = try await TMDBService.shared.getImages(id: mediaId, mediaType: mediaType)
      backdropImages = images.sortedBackdrops

      // Preload backdrop images in background
      await preloadBackdropImages()
    } catch {
      backdropImages = []
    }
  }

  private func preloadBackdropImages() async {
    let imagesToPreload = Array(backdropImages.prefix(10))

    await withTaskGroup(of: Void.self) { group in
      for image in imagesToPreload {
        guard let url = image.backdropURL else { continue }
        group.addTask {
          do {
            let (_, _) = try await URLSession.shared.data(from: url)
          } catch {
            // Silently ignore preload failures
          }
        }
      }
    }
  }
}

// MARK: - Badge View
struct BadgeView: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.caption)
      .foregroundColor(.appForegroundAdaptive)
      .padding(.horizontal, 10)
      .padding(.vertical, 6)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}
