//
//  MediaImagesView.swift
//  Plotwist
//

import SwiftUI

struct MediaImagesView: View {
  let mediaId: Int
  let mediaType: String

  @Environment(\.dismiss) private var dismiss
  @State private var images: MediaImages?
  @State private var isLoading = true
  @State private var selectedImage: TMDBImage?
  @ObservedObject private var themeManager = ThemeManager.shared

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header (same as CategoryListView)
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(L10n.current.images)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive)
            .frame(height: 1)
        }

        // Content
        if isLoading {
          Spacer()
          ProgressView()
          Spacer()
        } else if let images, !images.backdrops.isEmpty || !images.posters.isEmpty {
          ScrollView(showsIndicators: false) {
            // Masonry layout with all images
            ImageMasonryView(
              images: allImages,
              onImageTap: { image in
                selectedImage = image
              }
            )
            .padding(.horizontal, 24)
            .padding(.vertical, 24)
          }
        } else {
          Spacer()
          VStack(spacing: 12) {
            Image(systemName: "photo.on.rectangle.angled")
              .font(.system(size: 48))
              .foregroundColor(.appMutedForegroundAdaptive)
            Text(L10n.current.noImagesFound)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          Spacer()
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .fullScreenCover(item: $selectedImage) { image in
      ImageFullScreenView(image: image)
    }
    .task {
      await loadImages()
    }
  }

  private var allImages: [TMDBImage] {
    guard let images else { return [] }
    // Combine all images and sort by vote count for better distribution
    return (images.backdrops + images.posters).sorted { $0.voteCount > $1.voteCount }
  }

  private func loadImages() async {
    isLoading = true
    defer { isLoading = false }

    do {
      images = try await TMDBService.shared.getImages(id: mediaId, mediaType: mediaType)
    } catch {
      images = nil
    }
  }
}

// MARK: - Image Masonry View
struct ImageMasonryView: View {
  let images: [TMDBImage]
  let onImageTap: (TMDBImage) -> Void

  private let spacing: CGFloat = 8

  var body: some View {
    GeometryReader { geometry in
      let columnWidth = (geometry.size.width - spacing) / 2

      HStack(alignment: .top, spacing: spacing) {
        // Left column
        LazyVStack(spacing: spacing) {
          ForEach(leftColumnImages) { image in
            MasonryImageCell(
              image: image,
              width: columnWidth,
              onTap: { onImageTap(image) }
            )
          }
        }

        // Right column
        LazyVStack(spacing: spacing) {
          ForEach(rightColumnImages) { image in
            MasonryImageCell(
              image: image,
              width: columnWidth,
              onTap: { onImageTap(image) }
            )
          }
        }
      }
    }
    .frame(height: calculateTotalHeight())
  }

  private var leftColumnImages: [TMDBImage] {
    images.enumerated().filter { $0.offset % 2 == 0 }.map { $0.element }
  }

  private var rightColumnImages: [TMDBImage] {
    images.enumerated().filter { $0.offset % 2 == 1 }.map { $0.element }
  }

  private func calculateTotalHeight() -> CGFloat {
    let screenWidth = UIScreen.main.bounds.width - 48 // 24 padding on each side
    let columnWidth = (screenWidth - spacing) / 2

    var leftHeight: CGFloat = 0
    var rightHeight: CGFloat = 0

    for (index, image) in images.enumerated() {
      let imageHeight = columnWidth / image.aspectRatio
      if index % 2 == 0 {
        leftHeight += imageHeight + spacing
      } else {
        rightHeight += imageHeight + spacing
      }
    }

    return max(leftHeight, rightHeight)
  }
}

// MARK: - Masonry Image Cell
struct MasonryImageCell: View {
  let image: TMDBImage
  let width: CGFloat
  let onTap: () -> Void

  private var height: CGFloat {
    width / image.aspectRatio
  }

  var body: some View {
    Button(action: onTap) {
      CachedAsyncImage(url: image.thumbnailURL) { loadedImage in
        loadedImage
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        Rectangle()
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: width, height: height)
      .clipShape(RoundedRectangle(cornerRadius: 12))
      .posterBorder(cornerRadius: 12)
    }
    .buttonStyle(.plain)
  }
}

// MARK: - Full Screen Image View
struct ImageFullScreenView: View {
  let image: TMDBImage

  @Environment(\.dismiss) private var dismiss
  @State private var scale: CGFloat = 1.0
  @State private var lastScale: CGFloat = 1.0
  @State private var offset: CGSize = .zero
  @State private var lastOffset: CGSize = .zero

  var body: some View {
    ZStack {
      Color.black.ignoresSafeArea()

      CachedAsyncImage(url: image.fullURL) { loadedImage in
        loadedImage
          .resizable()
          .aspectRatio(contentMode: .fit)
          .scaleEffect(scale)
          .offset(offset)
          .gesture(
            MagnificationGesture()
              .onChanged { value in
                let delta = value / lastScale
                lastScale = value
                scale = min(max(scale * delta, 1), 4)
              }
              .onEnded { _ in
                lastScale = 1.0
                if scale < 1 {
                  withAnimation {
                    scale = 1
                  }
                }
              }
          )
          .gesture(
            DragGesture()
              .onChanged { value in
                if scale > 1 {
                  offset = CGSize(
                    width: lastOffset.width + value.translation.width,
                    height: lastOffset.height + value.translation.height
                  )
                }
              }
              .onEnded { _ in
                lastOffset = offset
              }
          )
          .onTapGesture(count: 2) {
            withAnimation {
              if scale > 1 {
                scale = 1
                offset = .zero
                lastOffset = .zero
              } else {
                scale = 2
              }
            }
          }
      } placeholder: {
        ProgressView()
          .tint(.white)
      }

      // Close button
      VStack {
        HStack {
          Spacer()
          Button {
            dismiss()
          } label: {
            Image(systemName: "xmark")
              .font(.system(size: 16, weight: .semibold))
              .foregroundColor(.white)
              .frame(width: 36, height: 36)
              .background(.ultraThinMaterial)
              .clipShape(Circle())
          }
          .padding(.trailing, 20)
          .padding(.top, 60)
        }
        Spacer()
      }
    }
  }
}
