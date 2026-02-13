//
//  ImageCache.swift
//  Plotwist
//

import SwiftUI
import UIKit

// MARK: - Image Cache Manager
final class ImageCache: @unchecked Sendable {
  static let shared = ImageCache()

  private let memoryCache = NSCache<NSURL, UIImage>()
  private let fileManager = FileManager.default
  private let diskCacheURL: URL
  private let ioQueue = DispatchQueue(label: "com.plotwist.imagecache.io", qos: .userInitiated)

  // Actor for managing ongoing tasks safely
  private let taskManager = TaskManager()

  private init() {
    // Setup disk cache directory
    let cacheDir = fileManager.urls(for: .cachesDirectory, in: .userDomainMask)[0]
    diskCacheURL = cacheDir.appendingPathComponent("ImageCache", isDirectory: true)

    // Create directory if needed
    try? fileManager.createDirectory(at: diskCacheURL, withIntermediateDirectories: true)

    // Configure memory cache
    memoryCache.countLimit = 100
    memoryCache.totalCostLimit = 100 * 1024 * 1024 // 100MB
  }

  // MARK: - Public API

  func image(for url: URL) -> UIImage? {
    // Check memory cache first (fast)
    if let cached = memoryCache.object(forKey: url as NSURL) {
      return cached
    }

    // Check disk cache (slower, but synchronous for simplicity)
    if let diskImage = loadFromDisk(url: url) {
      memoryCache.setObject(diskImage, forKey: url as NSURL)
      return diskImage
    }

    return nil
  }

  func setImage(_ image: UIImage, for url: URL) {
    // Save to memory
    memoryCache.setObject(image, forKey: url as NSURL)

    // Save to disk asynchronously
    ioQueue.async { [weak self] in
      self?.saveToDisk(image: image, url: url)
    }
  }

  /// Load image with deduplication of concurrent requests
  func loadImage(from url: URL, priority: TaskPriority = .medium) async -> UIImage? {
    // Check caches first
    if let cached = image(for: url) {
      return cached
    }

    // Use actor for safe concurrent access
    return await taskManager.loadImage(url: url, priority: priority) { [weak self] in
      do {
        let (data, _) = try await URLSession.shared.data(from: url)
        guard let image = UIImage(data: data) else { return nil }

        // Use downsampled version for large images
        let optimizedImage = self?.downsampleIfNeeded(image, maxDimension: 1920) ?? image

        self?.setImage(optimizedImage, for: url)
        return optimizedImage
      } catch {
        return nil
      }
    }
  }

  /// Prefetch multiple images (for carousel)
  func prefetch(urls: [URL], priority: TaskPriority = .low) {
    Task(priority: priority) {
      await withTaskGroup(of: Void.self) { group in
        for url in urls {
          group.addTask { [weak self] in
            _ = await self?.loadImage(from: url, priority: .low)
          }
        }
      }
    }
  }

  /// Clear all caches
  func clearCache() {
    memoryCache.removeAllObjects()
    ioQueue.async { [weak self] in
      guard let self else { return }
      try? self.fileManager.removeItem(at: self.diskCacheURL)
      try? self.fileManager.createDirectory(at: self.diskCacheURL, withIntermediateDirectories: true)
    }
  }

  // MARK: - Private Helpers

  private func cacheKey(for url: URL) -> String {
    return url.absoluteString.data(using: .utf8)?.base64EncodedString() ?? url.lastPathComponent
  }

  private func diskPath(for url: URL) -> URL {
    return diskCacheURL.appendingPathComponent(cacheKey(for: url))
  }

  private func loadFromDisk(url: URL) -> UIImage? {
    let path = diskPath(for: url)
    guard let data = try? Data(contentsOf: path) else { return nil }
    return UIImage(data: data)
  }

  private func saveToDisk(image: UIImage, url: URL) {
    let path = diskPath(for: url)
    guard let data = image.jpegData(compressionQuality: 0.85) else { return }
    try? data.write(to: path)
  }

  private func downsampleIfNeeded(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
    let size = image.size
    guard size.width > maxDimension || size.height > maxDimension else { return image }

    let scale = maxDimension / max(size.width, size.height)
    let newSize = CGSize(width: size.width * scale, height: size.height * scale)

    let renderer = UIGraphicsImageRenderer(size: newSize)
    return renderer.image { _ in
      image.draw(in: CGRect(origin: .zero, size: newSize))
    }
  }
}

// MARK: - Task Manager Actor (for safe concurrent task management)
private actor TaskManager {
  private var ongoingTasks: [URL: Task<UIImage?, Never>] = [:]

  func loadImage(
    url: URL,
    priority: TaskPriority,
    loader: @escaping @Sendable () async -> UIImage?
  ) async -> UIImage? {
    // Check if there's already an ongoing task for this URL
    if let existingTask = ongoingTasks[url] {
      return await existingTask.value
    }

    // Create new task
    let task = Task(priority: priority) {
      await loader()
    }

    ongoingTasks[url] = task

    let result = await task.value
    ongoingTasks.removeValue(forKey: url)

    return result
  }
}

// MARK: - Cached Async Image (Enhanced)
struct CachedAsyncImage<Content: View, Placeholder: View>: View {
  let url: URL?
  let content: (Image) -> Content
  let placeholder: () -> Placeholder
  let priority: TaskPriority
  let animated: Bool

  @State private var loadedImage: UIImage?
  @State private var isLoading = false

  init(
    url: URL?,
    priority: TaskPriority = .medium,
    animated: Bool = true,
    @ViewBuilder content: @escaping (Image) -> Content,
    @ViewBuilder placeholder: @escaping () -> Placeholder
  ) {
    self.url = url
    self.priority = priority
    self.animated = animated
    self.content = content
    self.placeholder = placeholder
  }

  var body: some View {
    Group {
      if let loadedImage {
        content(Image(uiImage: loadedImage))
      } else {
        placeholder()
          .task(id: url, priority: priority) {
            await loadImage()
          }
      }
    }
  }

  @MainActor
  private func loadImage() async {
    guard let url, !isLoading else { return }
    isLoading = true

    // Check cache synchronously first for instant display.
    if let cached = ImageCache.shared.image(for: url) {
      loadedImage = cached
      isLoading = false
      return
    }

    // Load from network
    if let image = await ImageCache.shared.loadImage(from: url, priority: priority) {
      if animated {
        withAnimation(.easeIn(duration: 0.2)) {
          loadedImage = image
        }
      } else {
        loadedImage = image
      }
    }
    isLoading = false
  }
}

// MARK: - Backdrop Image View (Optimized for MediaDetailView)
struct BackdropImage: View {
  let url: URL?
  let height: CGFloat

  @State private var loadedImage: UIImage?
  @State private var showImage: Bool

  init(url: URL?, height: CGFloat) {
    self.url = url
    self.height = height
    // Pre-populate from cache synchronously so the very first frame already
    // shows the image, avoiding any gray placeholder flash during transitions
    // (e.g. when the single backdrop switches to the carousel).
    if let url, let cached = ImageCache.shared.image(for: url) {
      _loadedImage = State(initialValue: cached)
      _showImage = State(initialValue: true)
    } else {
      _loadedImage = State(initialValue: nil)
      _showImage = State(initialValue: false)
    }
  }

  var body: some View {
    GeometryReader { proxy in
      ZStack {
        // Solid color placeholder
        Rectangle()
          .fill(Color.appBorderAdaptive)
          .opacity(showImage ? 0 : 1)

        // Actual image with fade-in
        if let loadedImage {
          Image(uiImage: loadedImage)
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: proxy.size.width, height: proxy.size.height)
            .clipped()
            .opacity(showImage ? 1 : 0)
        }
      }
    }
    .frame(height: height)
    .task(id: url) {
      await loadImage()
    }
  }

  @MainActor
  private func loadImage() async {
    // Skip if already loaded (from cache in init)
    guard !showImage else { return }
    guard let url else { return }

    // Check cache for instant display
    if let cached = ImageCache.shared.image(for: url) {
      loadedImage = cached
      withAnimation(.easeIn(duration: 0.15)) {
        showImage = true
      }
      return
    }

    // Load with high priority for visible content
    if let image = await ImageCache.shared.loadImage(from: url, priority: .high) {
      loadedImage = image
      withAnimation(.easeIn(duration: 0.25)) {
        showImage = true
      }
    }
  }
}

// MARK: - Carousel Backdrop View (with prefetching)
struct CarouselBackdropView: View {
  let images: [TMDBImage]
  let height: CGFloat
  @Binding var currentIndex: Int

  private var safeIndex: Binding<Int> {
    Binding(
      get: {
        let maxIndex = min(images.count, 10) - 1
        return min(max(0, currentIndex), max(0, maxIndex))
      },
      set: { currentIndex = $0 }
    )
  }

  var body: some View {
    TabView(selection: safeIndex) {
      ForEach(Array(images.prefix(10).enumerated()), id: \.offset) { index, backdrop in
        BackdropImage(url: backdrop.backdropURL, height: height)
          .tag(index)
      }
    }
    .tabViewStyle(.page(indexDisplayMode: .never))
    .frame(height: height)
    .frame(maxWidth: .infinity)
    .clipped()
    .onAppear {
      // Ensure index is valid on appear
      if currentIndex != 0 {
        currentIndex = 0
      }
      prefetchImages()
    }
    .onChange(of: currentIndex) { _, newIndex in
      prefetchAdjacentImages(around: newIndex)
    }
  }

  private func prefetchImages() {
    // Prefetch first 3 images immediately
    let initialUrls = images.prefix(3).compactMap { $0.backdropURL }
    ImageCache.shared.prefetch(urls: initialUrls, priority: .high)

    // Prefetch rest with lower priority
    let remainingUrls = images.dropFirst(3).prefix(7).compactMap { $0.backdropURL }
    ImageCache.shared.prefetch(urls: remainingUrls, priority: .low)
  }

  private func prefetchAdjacentImages(around index: Int) {
    // Prefetch next 2 images when user swipes
    let nextIndices = [index + 1, index + 2].filter { $0 < images.count && $0 < 10 }
    let urls = nextIndices.compactMap { images[$0].backdropURL }
    ImageCache.shared.prefetch(urls: urls, priority: .medium)
  }
}
