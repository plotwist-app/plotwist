//
//  StatsSharedComponents.swift
//  Plotwist

import SwiftUI

// MARK: - Shared Detail Header

@ViewBuilder
func detailHeaderView(title: String, isScrolled: Bool, onBack: @escaping () -> Void) -> some View {
  ZStack {
    if isScrolled {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)
        .transition(.opacity.combined(with: .move(edge: .bottom)))
    }

    HStack {
      Button(action: onBack) {
        Image(systemName: "chevron.left")
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appForegroundAdaptive)
          .frame(width: 36, height: 36)
          .background(Color.appInputFilled)
          .clipShape(Circle())
      }

      Spacer()
    }
  }
  .padding(.horizontal, 24)
  .padding(.vertical, 12)
  .background(Color.appBackgroundAdaptive)
  .overlay(
    Rectangle()
      .fill(Color.appBorderAdaptive)
      .frame(height: 1)
      .opacity(isScrolled ? 1 : 0),
    alignment: .bottom
  )
  .animation(.easeInOut(duration: 0.2), value: isScrolled)
}

// MARK: - Stats Poster (70% width, standard corner radius)

@ViewBuilder
func statsPoster(url: URL?, rating: Double? = nil) -> some View {
  let cr = DesignTokens.CornerRadius.poster
  let screenWidth = UIScreen.main.bounds.width
  let cardContentWidth = (screenWidth - 60) / 2 - 32
  let posterWidth = cardContentWidth * 0.7
  let posterHeight = posterWidth * 1.5

  CachedAsyncImage(url: url) { image in
    image
      .resizable()
      .aspectRatio(contentMode: .fill)
  } placeholder: {
    RoundedRectangle(cornerRadius: cr)
      .fill(Color.appBorderAdaptive.opacity(0.3))
  }
  .frame(width: posterWidth, height: posterHeight)
  .clipShape(RoundedRectangle(cornerRadius: cr))
  .overlay(alignment: .bottomTrailing) {
    if let rating {
      HStack(spacing: 2) {
        Image(systemName: "star.fill")
          .font(.system(size: 9))
          .foregroundColor(Color(hex: "F59E0B"))
        Text(String(format: "%.1f", rating))
          .font(.system(size: 12, weight: .bold, design: .rounded))
          .foregroundColor(.white)
      }
      .padding(.horizontal, 6)
      .padding(.vertical, 4)
      .background(.ultraThinMaterial)
      .clipShape(RoundedRectangle(cornerRadius: cr * 0.5))
      .padding(6)
    }
  }
  .posterBorder()
}

// MARK: - Shimmer Effect

struct ShimmerEffect: ViewModifier {
  @State private var phase: CGFloat = 0

  func body(content: Content) -> some View {
    content
      .opacity(0.4 + 0.3 * Foundation.sin(Double(phase)))
      .onAppear {
        withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
          phase = .pi
        }
      }
  }
}

// MARK: - Stats Share Card (Stories 9:16)

struct StatsShareCardView: View {
  let section: MonthSection
  let strings: Strings
  let genrePosterImage: UIImage?
  let reviewPosterImage: UIImage?

  private let cardWidth: CGFloat = 1080 / 3
  private let cardHeight: CGFloat = 1920 / 3

  private let accentBlue = Color(hex: "60A5FA")
  private let accentPurple = Color(hex: "A78BFA")

  var body: some View {
    ZStack {
      LinearGradient(
        stops: [
          .init(color: Color(hex: "000000"), location: 0),
          .init(color: Color(hex: "050505"), location: 0.4),
          .init(color: Color(hex: "0C0C0C"), location: 0.7),
          .init(color: Color(hex: "111111"), location: 1),
        ],
        startPoint: .top,
        endPoint: .bottom
      )

      VStack(spacing: 0) {
        VStack(alignment: .leading, spacing: 16) {
          Text(section.displayName.uppercased())
            .font(.system(size: 11, weight: .bold))
            .tracking(2.5)
            .foregroundColor(accentBlue)

          Text(strings.myMonthInReview)
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(.white)

          VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline, spacing: 6) {
              Text(formatTotalHours(section.totalHours))
                .font(.system(size: 52, weight: .heavy, design: .rounded))
                .foregroundColor(.white)

              Text(strings.hours)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.white.opacity(0.5))
            }

            if section.movieHours > 0 || section.seriesHours > 0 {
              HStack(spacing: 14) {
                HStack(spacing: 5) {
                  Circle().fill(accentBlue).frame(width: 6, height: 6)
                  Text("\(strings.movies) \(formatHoursMinutes(section.movieHours))")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                }
                HStack(spacing: 5) {
                  Circle().fill(accentPurple).frame(width: 6, height: 6)
                  Text("\(strings.series) \(formatHoursMinutes(section.seriesHours))")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.white.opacity(0.5))
                }
              }
            }
          }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 24)
        .padding(.top, 48)

        Spacer().frame(height: 24)

        HStack(alignment: .top, spacing: 12) {
          if let genreName = section.topGenreName {
            VStack(alignment: .leading, spacing: 8) {
              shareCardPoster(image: genrePosterImage)
              Text(strings.favoriteGenre.uppercased())
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundColor(.white.opacity(0.35))
              Text(genreName)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }

          if let reviewTitle = section.topReviewTitle {
            VStack(alignment: .leading, spacing: 8) {
              shareCardPoster(image: reviewPosterImage, rating: section.topReviewRating)
              Text(strings.bestReview.uppercased())
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundColor(.white.opacity(0.35))
              Text(reviewTitle)
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(.white)
                .lineLimit(1)
            }
            .frame(maxWidth: .infinity)
          }
        }
        .padding(.horizontal, 24)

        Spacer()

        HStack {
          Image("PlotistLogo")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(height: 22)
            .opacity(0.35)

          Spacer()

          Text("plotwist.app")
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(.white.opacity(0.2))
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 32)
      }
    }
    .frame(width: cardWidth, height: cardHeight)
  }

  @ViewBuilder
  func shareCardPoster(image: UIImage?, rating: Double? = nil) -> some View {
    let cr: CGFloat = 12

    if let uiImage = image {
      Image(uiImage: uiImage)
        .resizable()
        .aspectRatio(2 / 3, contentMode: .fit)
        .clipShape(RoundedRectangle(cornerRadius: cr))
        .overlay(alignment: .bottomTrailing) {
          ratingBadge(rating: rating, cornerRadius: cr)
        }
    } else {
      RoundedRectangle(cornerRadius: cr)
        .fill(Color.white.opacity(0.06))
        .aspectRatio(2 / 3, contentMode: .fit)
    }
  }

  @ViewBuilder
  func ratingBadge(rating: Double?, cornerRadius cr: CGFloat) -> some View {
    if let rating {
      HStack(spacing: 3) {
        Image(systemName: "star.fill")
          .font(.system(size: 8))
          .foregroundColor(Color(hex: "F59E0B"))
        Text(String(format: "%.1f", rating))
          .font(.system(size: 11, weight: .bold, design: .rounded))
          .foregroundColor(.white)
      }
      .padding(.horizontal, 6)
      .padding(.vertical, 4)
      .background(Color.black.opacity(0.6))
      .clipShape(RoundedRectangle(cornerRadius: cr * 0.5))
      .padding(6)
    }
  }
}
