//
//  ShareReviewSheet.swift
//  Plotwist
//

import SwiftUI
import UIKit

// MARK: - Dominant Color Extraction

func extractDominantColors(from image: UIImage, count: Int = 3) -> [Color] {
  guard let cgImage = image.cgImage else { return [] }

  let size = 16
  let colorSpace = CGColorSpaceCreateDeviceRGB()
  var pixelData = [UInt8](repeating: 0, count: size * size * 4)
  guard let context = CGContext(
    data: &pixelData,
    width: size,
    height: size,
    bitsPerComponent: 8,
    bytesPerRow: size * 4,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
  ) else { return [] }

  context.draw(cgImage, in: CGRect(x: 0, y: 0, width: size, height: size))

  struct ColorBucket: Hashable {
    let r: UInt8, g: UInt8, b: UInt8
  }

  var buckets: [ColorBucket: Int] = [:]
  let quantize: UInt8 = 32

  for y in 0..<size {
    for x in 0..<size {
      let offset = (y * size + x) * 4
      let r = pixelData[offset]
      let g = pixelData[offset + 1]
      let b = pixelData[offset + 2]

      let brightness = (Int(r) + Int(g) + Int(b)) / 3
      if brightness < 20 || brightness > 240 { continue }

      let bucket = ColorBucket(
        r: (r / quantize) * quantize,
        g: (g / quantize) * quantize,
        b: (b / quantize) * quantize
      )
      buckets[bucket, default: 0] += 1
    }
  }

  let sorted = buckets.sorted { $0.value > $1.value }
  var result: [Color] = []

  for item in sorted.prefix(count) {
    result.append(
      Color(
        red: Double(item.key.r) / 255,
        green: Double(item.key.g) / 255,
        blue: Double(item.key.b) / 255
      )
    )
  }

  while result.count < count {
    result.append(Color(hex: "1a1a2e"))
  }

  return result
}

// MARK: - Share Layout

enum ShareReviewLayout: CaseIterable, Identifiable, Hashable {
  case poster, quoteFirst, ticket
  var id: Self { self }
}

// MARK: - Poster Background Style

enum PosterBackground: CaseIterable, Identifiable {
  case blur, solid, gradient
  var id: Self { self }
}

// MARK: - Share Review Sheet

struct ShareReviewSheet: View {
  let review: ReviewListItem
  let mediaTitle: String
  let mediaPosterPath: String?
  let mediaYear: String?

  @State private var selectedLayout: ShareReviewLayout? = .poster
  @State private var posterBg: PosterBackground = .blur
  @State private var posterImage: UIImage?
  @State private var posterColors: [Color] = []
  @State private var avatarImage: UIImage?
  @State private var backdropImage: UIImage?
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared

  private var posterURL: URL? {
    guard let path = mediaPosterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w780\(path)")
  }

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3
  private let previewWidth: CGFloat = 240

  private var previewScale: CGFloat { previewWidth / cardWidth }
  private var previewHeight: CGFloat { cardHeight * previewScale }

  private var sheetHeight: CGFloat {
    28 + previewHeight + 44 + 68
  }

  private var sideInset: CGFloat {
    (UIScreen.main.bounds.width - previewWidth) / 2
  }

  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 0) {
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
          .padding(.bottom, 16)

        ScrollView(.horizontal, showsIndicators: false) {
          HStack(spacing: 12) {
            ForEach(ShareReviewLayout.allCases) { layout in
              ShareReviewCardView(
                layout: layout,
                review: review,
                mediaTitle: mediaTitle,
                mediaYear: mediaYear,
                posterImage: posterImage,
                posterBg: posterBg,
                posterColors: posterColors,
                avatarImage: avatarImage,
                backdropImage: backdropImage
              )
              .frame(width: cardWidth, height: cardHeight)
              .clipShape(RoundedRectangle(cornerRadius: 32))
              .scaleEffect(previewScale)
              .frame(width: previewWidth, height: previewHeight)
              .scrollTransition(.interactive) { content, phase in
                content
                  .scaleEffect(phase.isIdentity ? 1.0 : 0.85)
                  .opacity(phase.isIdentity ? 1.0 : 0.5)
              }
              .id(layout)
            }
          }
          .scrollTargetLayout()
        }
        .scrollTargetBehavior(.viewAligned)
        .scrollPosition(id: $selectedLayout)
        .contentMargins(.horizontal, sideInset, for: .scrollContent)
        .frame(height: previewHeight)

        HStack(spacing: 10) {
          ForEach(PosterBackground.allCases) { bg in
            Button {
              posterBg = bg
            } label: {
              bgPreviewCircle(bg)
                .frame(width: 32, height: 32)
                .clipShape(Circle())
                .overlay(
                  Circle()
                    .strokeBorder(
                      posterBg == bg
                        ? Color.appForegroundAdaptive
                        : Color.appMutedForegroundAdaptive.opacity(0.2),
                      lineWidth: 2
                    )
                )
            }
          }
        }
        .padding(.top, 12)
        .opacity(selectedLayout == .poster ? 1 : 0)
        .animation(.easeInOut(duration: 0.2), value: selectedLayout)

        Button {
          shareImage()
        } label: {
          HStack(spacing: 8) {
            Image(systemName: "square.and.arrow.up")
            Text(L10n.current.shareMyStats)
          }
          .fontWeight(.semibold)
          .frame(maxWidth: .infinity)
          .frame(height: 48)
          .background(Color.appForegroundAdaptive)
          .foregroundColor(.appBackgroundAdaptive)
          .clipShape(Capsule())
        }
        .padding(.horizontal, 24)
        .padding(.top, 12)
        .padding(.bottom, 4)
      }
    }
    .floatingSheetPresentation(height: sheetHeight)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task { await loadPosterImage() }
  }

  // MARK: - Background Preview Circles

  @ViewBuilder
  private func bgPreviewCircle(_ bg: PosterBackground) -> some View {
    switch bg {
    case .blur:
      if let image = posterImage {
        Image(uiImage: image)
          .resizable()
          .aspectRatio(contentMode: .fill)
      } else {
        Color.gray.opacity(0.3)
      }
    case .solid:
      Color(hex: "0A0A0A")
    case .gradient:
      LinearGradient(
        colors: posterColors.isEmpty
          ? [Color(hex: "1a1a2e"), Color(hex: "0f3460")]
          : [posterColors[0].opacity(0.45), posterColors.count > 1 ? posterColors[1].opacity(0.35) : posterColors[0].opacity(0.3)],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
    }
  }

  // MARK: - Data Loading

  private func loadPosterImage() async {
    await withTaskGroup(of: Void.self) { group in
      group.addTask {
        guard let url = posterURL else { return }
        do {
          let (data, _) = try await URLSession.shared.data(from: url)
          if let img = UIImage(data: data) {
            await MainActor.run {
              posterImage = img
              posterColors = extractDominantColors(from: img, count: 3)
            }
          }
        } catch {}
      }
      group.addTask {
        guard let avatarUrl = review.user.avatarUrl,
              let url = URL(string: avatarUrl) else { return }
        do {
          let (data, _) = try await URLSession.shared.data(from: url)
          if let img = UIImage(data: data) {
            await MainActor.run { avatarImage = img }
          }
        } catch {}
      }
      group.addTask {
        do {
          let lang = review.language ?? "en-US"
          let details: MovieDetails
          if review.mediaType == "tv" {
            details = try await TMDBService.shared.getTVSeriesDetails(
              id: review.tmdbId, language: lang
            )
          } else {
            details = try await TMDBService.shared.getMovieDetails(
              id: review.tmdbId, language: lang
            )
          }
          if let path = details.backdropPath,
             let url = URL(string: "https://image.tmdb.org/t/p/w780\(path)") {
            let (data, _) = try await URLSession.shared.data(from: url)
            if let img = UIImage(data: data) {
              await MainActor.run {
                backdropImage = img
              }
            }
          }
        } catch {}
      }
    }
  }

  // MARK: - Share

  @MainActor
  private func shareImage() {
    let layout = selectedLayout ?? .poster
    let cardView = ShareReviewCardView(
      layout: layout,
      review: review,
      mediaTitle: mediaTitle,
      mediaYear: mediaYear,
      posterImage: posterImage,
      posterBg: posterBg,
      posterColors: posterColors,
      avatarImage: avatarImage,
      backdropImage: backdropImage
    )

    let wrappedView = cardView.ignoresSafeArea()
    let controller = UIHostingController(rootView: wrappedView)
    controller.safeAreaRegions = []
    let size = CGSize(width: cardWidth, height: cardHeight)
    controller.view.bounds = CGRect(origin: .zero, size: size)
    controller.view.backgroundColor = .clear

    let window = UIWindow(frame: CGRect(origin: .zero, size: size))
    window.rootViewController = controller
    window.makeKeyAndVisible()
    controller.view.setNeedsLayout()
    controller.view.layoutIfNeeded()

    let renderer = UIGraphicsImageRenderer(
      size: size,
      format: {
        let f = UIGraphicsImageRendererFormat()
        f.scale = 3.0
        return f
      }()
    )
    let image = renderer.image { _ in
      controller.view.drawHierarchy(in: controller.view.bounds, afterScreenUpdates: true)
    }
    window.isHidden = true

    let activityVC = UIActivityViewController(
      activityItems: [image], applicationActivities: nil)
    if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
      let root = scene.windows.first?.rootViewController
    {
      let presenter = Self.topViewController(root)
      presenter.present(activityVC, animated: true)
    }
  }

  private static func topViewController(_ base: UIViewController) -> UIViewController {
    if let presented = base.presentedViewController {
      return topViewController(presented)
    }
    if let nav = base as? UINavigationController,
      let visible = nav.visibleViewController
    {
      return topViewController(visible)
    }
    if let tab = base as? UITabBarController,
      let selected = tab.selectedViewController
    {
      return topViewController(selected)
    }
    return base
  }
}
