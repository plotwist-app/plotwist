//
//  ShareReviewSheet.swift
//  Plotwist
//

import SwiftUI

// MARK: - Share Layout

enum ShareReviewLayout: CaseIterable, Identifiable, Hashable {
  case poster, clean, gradient
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
                posterBg: posterBg
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
        colors: [Color(hex: "1a1a2e"), Color(hex: "0f3460")],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
      )
    }
  }

  // MARK: - Data Loading

  private func loadPosterImage() async {
    guard let url = posterURL else { return }
    do {
      let (data, _) = try await URLSession.shared.data(from: url)
      posterImage = UIImage(data: data)
    } catch {}
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
      posterBg: posterBg
    )

    let controller = UIHostingController(rootView: cardView)
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

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3

  var body: some View {
    Group {
      switch layout {
      case .poster: posterLayout
      case .clean: cleanLayout
      case .gradient: gradientLayout
      }
    }
    .frame(width: cardWidth, height: cardHeight)
    .clipped()
  }

  // MARK: - Poster Layout

  private var posterLayout: some View {
    ZStack {
      posterBackground

      VStack(spacing: 0) {
        Spacer().frame(height: 40)

        // Large poster (hero)
        Group {
          if let image = posterImage {
            Image(uiImage: image)
              .resizable()
              .aspectRatio(2 / 3, contentMode: .fit)
          } else {
            RoundedRectangle(cornerRadius: 14)
              .fill(Color.white.opacity(0.06))
              .aspectRatio(2 / 3, contentMode: .fit)
          }
        }
        .frame(width: 200)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .shadow(color: .black.opacity(0.5), radius: 20, y: 10)

        Spacer().frame(height: 20)

        // Title + username grouped
        VStack(spacing: 5) {
          Text(mediaTitle)
            .font(.system(size: 17, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(2)
            .multilineTextAlignment(.center)

          Text("@\(review.user.username)")
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.white.opacity(0.5))
        }
        .padding(.horizontal, 28)

        Spacer().frame(height: 14)

        starsRow(rating: review.rating, size: 14)

        if !review.review.isEmpty {
          Text(review.review)
            .font(.system(size: 13))
            .foregroundColor(.white.opacity(0.6))
            .lineSpacing(4)
            .lineLimit(3)
            .multilineTextAlignment(.center)
            .padding(.horizontal, 28)
            .padding(.top, 12)
        }

        Spacer()

        plotwistBranding
      }
    }
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

  // MARK: - Clean Layout (editorial)

  private var cleanLayout: some View {
    ZStack {
      LinearGradient(
        stops: [
          .init(color: Color(hex: "000000"), location: 0),
          .init(color: Color(hex: "060606"), location: 0.5),
          .init(color: Color(hex: "0C0C0C"), location: 1),
        ],
        startPoint: .top,
        endPoint: .bottom
      )

      VStack(alignment: .leading, spacing: 0) {
        Spacer().frame(height: 48)

        RoundedRectangle(cornerRadius: 1)
          .fill(Color(hex: "FBBF24"))
          .frame(width: 32, height: 3)
          .padding(.horizontal, 28)

        starsRow(rating: review.rating, size: 16)
          .padding(.horizontal, 28)
          .padding(.top, 20)

        if !review.review.isEmpty {
          Text(review.review)
            .font(.system(size: 16))
            .foregroundColor(.white.opacity(0.85))
            .lineSpacing(6)
            .lineLimit(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 28)
            .padding(.top, 24)
        }

        Text("\u{2014} @\(review.user.username)")
          .font(.system(size: 13, weight: .medium))
          .foregroundColor(.white.opacity(0.35))
          .padding(.horizontal, 28)
          .padding(.top, 12)

        Spacer()

        HStack(spacing: 14) {
          if let image = posterImage {
            Image(uiImage: image)
              .resizable()
              .aspectRatio(2 / 3, contentMode: .fill)
              .frame(width: 56, height: 84)
              .clipShape(RoundedRectangle(cornerRadius: 8))
          }

          VStack(alignment: .leading, spacing: 3) {
            Text(mediaTitle)
              .font(.system(size: 14, weight: .bold))
              .foregroundColor(.white)
              .lineLimit(2)

            if let year = mediaYear, !year.isEmpty {
              Text(year)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.35))
            }
          }
        }
        .padding(.horizontal, 28)

        Spacer().frame(height: 20)

        plotwistBranding
      }
    }
  }

  // MARK: - Gradient Layout (cinematic)

  private var gradientLayout: some View {
    ZStack {
      if let image = posterImage {
        Image(uiImage: image)
          .resizable()
          .aspectRatio(contentMode: .fill)
          .frame(width: cardWidth, height: cardHeight)
          .blur(radius: 50)
          .clipped()
      } else {
        Color(hex: "1a1a2e")
      }

      LinearGradient(
        stops: [
          .init(color: .black.opacity(0.65), location: 0),
          .init(color: .black.opacity(0.3), location: 0.3),
          .init(color: .black.opacity(0.5), location: 0.6),
          .init(color: .black.opacity(0.8), location: 1),
        ],
        startPoint: .top,
        endPoint: .bottom
      )

      VStack(alignment: .leading, spacing: 0) {
        Spacer().frame(height: 48)

        Text("\u{275D}")
          .font(.system(size: 56))
          .foregroundColor(.white.opacity(0.12))
          .padding(.horizontal, 24)

        if !review.review.isEmpty {
          Text(review.review)
            .font(.system(size: 17, weight: .medium))
            .foregroundColor(.white.opacity(0.9))
            .lineSpacing(7)
            .lineLimit(10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 28)
            .padding(.top, 4)
        }

        Spacer()

        VStack(alignment: .leading, spacing: 8) {
          Text(mediaTitle)
            .font(.system(size: 15, weight: .bold))
            .foregroundColor(.white)
            .lineLimit(2)

          HStack(spacing: 8) {
            starsRow(rating: review.rating, size: 13)

            if let year = mediaYear, !year.isEmpty {
              Circle()
                .fill(Color.white.opacity(0.3))
                .frame(width: 3, height: 3)

              Text(year)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.4))
            }
          }

          Text("@\(review.user.username)")
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(.white.opacity(0.35))
        }
        .padding(.horizontal, 28)

        Spacer().frame(height: 20)

        plotwistBranding
      }
    }
  }

  // MARK: - Shared Components

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
