//
//  ImageCache.swift
//  Plotwist
//

import SwiftUI

// MARK: - Image Cache Manager
class ImageCache {
  static let shared = ImageCache()
  private init() {}

  private let cache = NSCache<NSURL, UIImage>()

  func image(for url: URL) -> UIImage? {
    return cache.object(forKey: url as NSURL)
  }

  func setImage(_ image: UIImage, for url: URL) {
    cache.setObject(image, forKey: url as NSURL)
  }
}

// MARK: - Cached Async Image
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
  let url: URL?
  let content: (Image) -> Content
  let placeholder: () -> Placeholder

  @State private var loadedImage: UIImage?

  init(
    url: URL?,
    @ViewBuilder content: @escaping (Image) -> Content,
    @ViewBuilder placeholder: @escaping () -> Placeholder
  ) {
    self.url = url
    self.content = content
    self.placeholder = placeholder
  }

  var body: some View {
    Group {
      if let loadedImage {
        content(Image(uiImage: loadedImage))
      } else {
        placeholder()
          .task(id: url) {
            await loadImage()
          }
      }
    }
  }

  @MainActor
  private func loadImage() async {
    guard let url else { return }

    // Check cache first
    if let cachedImage = ImageCache.shared.image(for: url) {
      loadedImage = cachedImage
      return
    }

    do {
      let (data, _) = try await URLSession.shared.data(from: url)
      if let image = UIImage(data: data) {
        ImageCache.shared.setImage(image, for: url)
        loadedImage = image
      }
    } catch {
      print("Failed to load image: \(error)")
    }
  }
}
