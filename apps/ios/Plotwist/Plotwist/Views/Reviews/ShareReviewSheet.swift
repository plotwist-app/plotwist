//
//  ShareReviewSheet.swift
//  Plotwist
//

import SwiftUI
import UIKit

// MARK: - Dominant Color Extraction

private func extractDominantColors(from image: UIImage, count: Int = 3) -> [Color] {
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
  case poster, quoteFirst, backdrop, ticket
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
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared

  private var posterURL: URL? {
    guard let path = mediaPosterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w780\(path)")
  }

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3
  private let previewWidth: CGFloat = 260

  private var previewScale: CGFloat { previewWidth / cardWidth }
  private var previewHeight: CGFloat { cardHeight * previewScale }

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

        Spacer()

        // Card carousel
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
                avatarImage: avatarImage
              )
              .frame(width: cardWidth, height: cardHeight)
              .clipShape(RoundedRectangle(cornerRadius: 20))
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

        Spacer()

        // Dot indicators
        HStack(spacing: 8) {
          ForEach(ShareReviewLayout.allCases) { layout in
            Button {
              withAnimation(.easeInOut(duration: 0.3)) {
                selectedLayout = layout
              }
            } label: {
              Circle()
                .fill(
                  selectedLayout == layout
                    ? Color.appForegroundAdaptive
                    : Color.appMutedForegroundAdaptive.opacity(0.3)
                )
                .frame(width: 8, height: 8)
            }
          }
        }
        .animation(.easeInOut(duration: 0.2), value: selectedLayout)
        .padding(.top, 16)

        // Background style switcher (poster layout only)
        if selectedLayout == .poster {
          HStack(spacing: 10) {
            ForEach(PosterBackground.allCases) { bg in
              Button {
                withAnimation(.easeInOut(duration: 0.2)) {
                  posterBg = bg
                }
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
          .transition(.opacity.combined(with: .scale(scale: 0.8)))
        }

        // Share button
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
        .padding(.top, 20)
        .padding(.bottom, 8)
      }
      .animation(.easeInOut(duration: 0.25), value: selectedLayout)
    }
    .floatingSheetPresentation(detents: [.large])
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
          : [posterColors[0].opacity(0.8), posterColors.count > 1 ? posterColors[1].opacity(0.8) : posterColors[0].opacity(0.5)],
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
      avatarImage: avatarImage
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

// MARK: - Share Review Card View

struct ShareReviewCardView: View {
  let layout: ShareReviewLayout
  let review: ReviewListItem
  let mediaTitle: String
  let mediaYear: String?
  let posterImage: UIImage?
  var posterBg: PosterBackground = .blur
  var posterColors: [Color] = []
  var avatarImage: UIImage?

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3

  var body: some View {
    Group {
      switch layout {
      case .poster: posterLayout
      case .quoteFirst: quoteFirstLayout
      case .backdrop: backdropLayout
      case .ticket: ticketLayout
      }
    }
    .frame(width: cardWidth, height: cardHeight)
    .clipped()
  }

  // MARK: - Layout 1: Poster (visual hero — poster dominates)

  private var posterLayout: some View {
    ZStack {
      posterBackground

      VStack(spacing: 0) {
        // Header: avatar + username stacked
        VStack(spacing: 6) {
          avatarCircle(size: 40)

          Text(review.user.username)
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white.opacity(0.85))
        }
        .padding(.top, 32)

        Spacer().frame(height: 14)

        // Poster
        Group {
          if let image = posterImage {
            Image(uiImage: image)
              .resizable()
              .aspectRatio(2 / 3, contentMode: .fit)
          } else {
            RoundedRectangle(cornerRadius: 20)
              .fill(Color.white.opacity(0.08))
              .aspectRatio(2 / 3, contentMode: .fit)
          }
        }
        .frame(height: cardHeight * 0.38)
        .clipShape(RoundedRectangle(cornerRadius: 28))
        .overlay(
          RoundedRectangle(cornerRadius: 28)
            .strokeBorder(Color.white.opacity(0.15), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.4), radius: 20, y: 8)

        Spacer().frame(height: 16)

        // Title
        Text(mediaTitle)
          .font(.system(size: 20, weight: .bold))
          .foregroundColor(.white)
          .lineLimit(1)

        Spacer().frame(height: 6)

        // Stars
        starsRow(rating: review.rating, size: 16)

        // Review text
        if !review.review.isEmpty {
          Text("\"\(review.review)\"")
            .font(.system(size: 12))
            .foregroundColor(.white.opacity(0.55))
            .lineSpacing(4)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
            .padding(.horizontal, 28)
            .padding(.top, 10)
        }

        Spacer()

        plotwistBranding
      }
    }
  }

  private func avatarCircle(size: CGFloat) -> some View {
    Group {
      if let avatar = avatarImage {
        Image(uiImage: avatar)
          .resizable()
          .aspectRatio(contentMode: .fill)
      } else {
        Circle()
          .fill(Color.white.opacity(0.15))
          .overlay(
            Text(String(review.user.username.prefix(1)).uppercased())
              .font(.system(size: size * 0.45, weight: .bold))
              .foregroundColor(.white.opacity(0.6))
          )
      }
    }
    .frame(width: size, height: size)
    .clipShape(Circle())
  }

  // MARK: - Poster Dynamic Background

  @ViewBuilder
  private var posterBackground: some View {
    switch posterBg {
    case .blur:
      if let image = posterImage {
        Image(uiImage: image)
          .resizable()
          .aspectRatio(contentMode: .fill)
          .frame(width: cardWidth, height: cardHeight)
          .blur(radius: 50)
          .clipped()
        Color.black.opacity(0.45)
      } else {
        Color(hex: "0A0A0A")
      }
    case .solid:
      Color(hex: "0A0A0A")
    case .gradient:
      if posterColors.count >= 2 {
        LinearGradient(
          stops: [
            .init(color: posterColors[0].opacity(0.85), location: 0),
            .init(color: posterColors[1].opacity(0.7), location: 0.5),
            .init(color: posterColors.count > 2 ? posterColors[2].opacity(0.85) : posterColors[0].opacity(0.85), location: 1),
          ],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      } else {
        LinearGradient(
          stops: [
            .init(color: Color(hex: "1a1a2e"), location: 0),
            .init(color: Color(hex: "16213e"), location: 0.35),
            .init(color: Color(hex: "0f3460"), location: 0.7),
            .init(color: Color(hex: "1a1a2e"), location: 1),
          ],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      }
    }
  }

  // MARK: - Layout 2: Quote First (typography as protagonist)

  private var quoteFirstLayout: some View {
    ZStack {
      Color(hex: "0C0C0C")

      VStack(spacing: 0) {
        // Header: avatar + username
        HStack(spacing: 10) {
          avatarCircle(size: 32)
          VStack(alignment: .leading, spacing: 1) {
            Text(review.user.username)
              .font(.system(size: 13, weight: .medium))
              .foregroundColor(.white)
            Text("assistiu e avaliou")
              .font(.system(size: 10))
              .foregroundColor(.white.opacity(0.4))
          }
          Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.top, 48)

        // Big quote — center area
        Spacer()
        ZStack(alignment: .topLeading) {
          Text("\u{201C}")
            .font(.system(size: 64, weight: .ultraLight, design: .serif))
            .foregroundColor(.white.opacity(0.1))
            .offset(x: -6, y: -16)

          if !review.review.isEmpty {
            Text(review.review)
              .font(.system(size: 20, weight: .light))
              .foregroundColor(.white.opacity(0.95))
              .lineSpacing(8)
              .fixedSize(horizontal: false, vertical: true)
              .padding(.leading, 14)
          }
        }
        .padding(.horizontal, 24)
        Spacer()

        // Movie info footer
        VStack(spacing: 0) {
          Rectangle()
            .fill(Color.white.opacity(0.08))
            .frame(height: 1)
            .padding(.horizontal, 24)

          HStack(spacing: 14) {
            if let image = posterImage {
              Image(uiImage: image)
                .resizable()
                .aspectRatio(2 / 3, contentMode: .fill)
                .frame(width: 60, height: 90)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .shadow(color: .black.opacity(0.5), radius: 8, y: 4)
            }

            VStack(alignment: .leading, spacing: 6) {
              Text(mediaTitle)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)

              starsRow(rating: review.rating, size: 12)

              Text("PLOTWIST")
                .font(.system(size: 9, weight: .medium))
                .tracking(2)
                .foregroundColor(.white.opacity(0.3))
                .padding(.top, 4)
            }
            Spacer()
          }
          .padding(.horizontal, 24)
          .padding(.top, 16)
          .padding(.bottom, 32)
        }
      }
    }
  }

  // MARK: - Layout 3: Backdrop (cinematic 16:9)

  private var backdropLayout: some View {
    ZStack {
      Color(hex: "08080A")

      VStack(spacing: 0) {
        // Backdrop image area (use poster as cinematic crop)
        ZStack(alignment: .bottomLeading) {
          if let image = posterImage {
            Image(uiImage: image)
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: cardWidth, height: cardWidth * 9 / 16)
              .clipped()

            // Gradient overlay
            LinearGradient(
              stops: [
                .init(color: .clear, location: 0),
                .init(color: Color(hex: "08080A").opacity(0.5), location: 0.5),
                .init(color: Color(hex: "08080A"), location: 1),
              ],
              startPoint: .top,
              endPoint: .bottom
            )
          } else {
            Color.white.opacity(0.05)
              .frame(height: cardWidth * 9 / 16)
          }

          // User badge
          HStack(spacing: 6) {
            avatarCircle(size: 24)
            Text(review.user.username)
              .font(.system(size: 11, weight: .medium))
              .foregroundColor(.white)
          }
          .padding(.horizontal, 10)
          .padding(.vertical, 5)
          .background(Color.black.opacity(0.5))
          .background(.ultraThinMaterial.opacity(0.3))
          .clipShape(Capsule())
          .padding(14)
        }
        .frame(height: cardWidth * 9 / 16)
        .padding(.top, 32)

        // Content area
        VStack(alignment: .leading, spacing: 0) {
          // Poster + title + stars
          HStack(alignment: .bottom, spacing: 12) {
            if let image = posterImage {
              Image(uiImage: image)
                .resizable()
                .aspectRatio(2 / 3, contentMode: .fill)
                .frame(width: 70, height: 105)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .shadow(color: .black.opacity(0.6), radius: 12, y: 6)
                .overlay(
                  RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(Color.white.opacity(0.1), lineWidth: 0.5)
                )
            }

            VStack(alignment: .leading, spacing: 6) {
              Text(mediaTitle)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(2)
              starsRow(rating: review.rating, size: 13)
            }
            .padding(.bottom, 2)
          }
          .padding(.horizontal, 20)
          .offset(y: -24)

          // Review with left accent bar
          if !review.review.isEmpty {
            HStack(alignment: .top, spacing: 0) {
              RoundedRectangle(cornerRadius: 1)
                .fill(
                  LinearGradient(
                    colors: [.white.opacity(0.4), .white.opacity(0.05)],
                    startPoint: .top,
                    endPoint: .bottom
                  )
                )
                .frame(width: 2)

              Text(review.review)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.85))
                .lineSpacing(6)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.leading, 12)
            }
            .padding(.horizontal, 20)
            .offset(y: -10)
          }
        }

        Spacer()

        // Footer
        HStack {
          HStack(spacing: 5) {
            Image("PlotistLogoMark")
              .resizable()
              .aspectRatio(contentMode: .fit)
              .frame(height: 12)
            Text("Plotwist")
              .font(.system(size: 10, weight: .semibold))
              .tracking(1)
              .foregroundColor(.white)
          }
          .opacity(0.3)

          Spacer()

          Text("review")
            .font(.system(size: 10))
            .foregroundColor(.white.opacity(0.2))
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 32)
      }
    }
  }

  // MARK: - Layout 4: Ticket (modern card)

  private var ticketLayout: some View {
    ZStack {
      Color(hex: "111113")

      // Subtle glow
      Circle()
        .fill(Color.white.opacity(0.02))
        .frame(width: 280, height: 280)
        .blur(radius: 40)
        .offset(y: -60)

      VStack(spacing: 0) {
        Spacer()

        // Main card
        VStack(spacing: 0) {
          // Backdrop area (cinematic crop of poster)
          ZStack(alignment: .bottom) {
            if let image = posterImage {
              Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: cardWidth - 36, height: (cardWidth - 36) * 9 / 16)
                .clipped()

              LinearGradient(
                stops: [
                  .init(color: .clear, location: 0.3),
                  .init(color: Color(hex: "1A1A1E"), location: 1),
                ],
                startPoint: .top,
                endPoint: .bottom
              )
              // Top vignette
              LinearGradient(
                stops: [
                  .init(color: .black.opacity(0.4), location: 0),
                  .init(color: .clear, location: 0.4),
                ],
                startPoint: .top,
                endPoint: .bottom
              )
            } else {
              Color.white.opacity(0.05)
                .frame(height: (cardWidth - 36) * 9 / 16)
            }
          }
          .frame(height: (cardWidth - 36) * 9 / 16)
          .clipped()

          // Poster + info overlapping backdrop
          HStack(alignment: .top, spacing: 12) {
            if let image = posterImage {
              Image(uiImage: image)
                .resizable()
                .aspectRatio(2 / 3, contentMode: .fill)
                .frame(width: 64, height: 96)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .shadow(color: .black.opacity(0.5), radius: 8, y: 4)
                .overlay(
                  RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(Color.white.opacity(0.1), lineWidth: 0.5)
                )
            }

            VStack(alignment: .leading, spacing: 6) {
              Text(mediaTitle)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
                .lineLimit(2)
              starsRow(rating: review.rating, size: 13)
            }
            .padding(.top, 4)
          }
          .padding(.horizontal, 16)
          .offset(y: -28)

          // Review
          if !review.review.isEmpty {
            Text(review.review)
              .font(.system(size: 13))
              .foregroundColor(.white.opacity(0.7))
              .lineSpacing(5)
              .fixedSize(horizontal: false, vertical: true)
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(.horizontal, 16)
              .offset(y: -14)
          }

          // Footer divider + user
          VStack(spacing: 0) {
            Rectangle()
              .fill(Color.white.opacity(0.06))
              .frame(height: 1)

            HStack {
              HStack(spacing: 8) {
                avatarCircle(size: 26)
                Text(review.user.username)
                  .font(.system(size: 13, weight: .medium))
                  .foregroundColor(.white)
              }
              Spacer()
              Text("PLOTWIST")
                .font(.system(size: 9, weight: .medium))
                .tracking(1.5)
                .foregroundColor(.white.opacity(0.25))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
          }
        }
        .background(
          RoundedRectangle(cornerRadius: 16)
            .fill(Color(hex: "1A1A1E"))
            .shadow(color: .black.opacity(0.5), radius: 20, y: 10)
            .overlay(
              RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 18)

        Spacer()
      }
    }
  }

  // MARK: - Shared Components

  private func ratingPill(_ rating: Double) -> some View {
    HStack(spacing: 4) {
      Image(systemName: "star.fill")
        .font(.system(size: 11))
        .foregroundColor(Color(hex: "FBBF24"))
      Text(String(format: "%.1f", rating))
        .font(.system(size: 13, weight: .bold, design: .rounded))
        .foregroundColor(.white)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.black.opacity(0.6))
    .clipShape(Capsule())
  }

  private func starsRow(rating: Double, size: CGFloat) -> some View {
    HStack(spacing: 3) {
      ForEach(1...5, id: \.self) { index in
        let filled = Double(index) <= rating || Double(index) - 0.5 <= rating
        let iconName: String = {
          if Double(index) <= rating { return "star.fill" }
          if Double(index) - 0.5 <= rating { return "star.leadinghalf.filled" }
          return "star"
        }()
        Image(systemName: iconName)
          .font(.system(size: size))
          .foregroundColor(filled ? Color(hex: "FBBF24") : Color.white.opacity(0.2))
      }
    }
  }

  private var plotwistBranding: some View {
    HStack(spacing: 6) {
      Image("PlotistLogoMark")
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(height: 16)

      Text("Plotwist")
        .font(.system(size: 14, weight: .semibold))
        .foregroundColor(.white)
    }
    .opacity(0.4)
    .frame(maxWidth: .infinity)
    .padding(.bottom, 32)
  }
}
