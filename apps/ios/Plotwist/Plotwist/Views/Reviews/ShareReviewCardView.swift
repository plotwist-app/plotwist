//
//  ShareReviewCardView.swift
//  Plotwist
//

import SwiftUI
import UIKit

struct ShareReviewCardView: View {
  let layout: ShareReviewLayout
  let review: ReviewListItem
  let mediaTitle: String
  let mediaYear: String?
  let posterImage: UIImage?
  var posterBg: PosterBackground = .blur
  var posterColors: [Color] = []
  var avatarImage: UIImage?
  var backdropImage: UIImage?

  let cardWidth: CGFloat = 1080 / 3
  let cardHeight: CGFloat = 1920 / 3

  var body: some View {
    Group {
      switch layout {
      case .poster: posterLayout
      case .quoteFirst: quoteFirstLayout
      case .ticket: ticketLayout
      }
    }
    .frame(width: cardWidth, height: cardHeight)
    .clipped()
  }

  // MARK: - Layout 1: Poster

  var posterLayout: some View {
    ZStack {
      posterBackground

      VStack(spacing: 0) {
        Spacer()

        Group {
          if let image = posterImage {
            Image(uiImage: image)
              .resizable()
              .aspectRatio(2 / 3, contentMode: .fit)
          } else {
            RoundedRectangle(cornerRadius: 28)
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

        Text(mediaTitle)
          .font(.system(size: 20, weight: .bold))
          .foregroundColor(.white)
          .lineLimit(1)
          .padding(.horizontal, 24)

        Spacer().frame(height: 6)

        starsRow(rating: review.rating, size: 16)
          .padding(.horizontal, 24)

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

        HStack(spacing: 6) {
          avatarCircle(size: 20)

          Text(review.user.username)
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.white.opacity(0.6))

          Text("via")
            .font(.system(size: 11))
            .foregroundColor(.white.opacity(0.25))

          Image("PlotistLogoMark")
            .resizable()
            .aspectRatio(contentMode: .fit)
            .frame(height: 13)
            .opacity(0.5)

          Text("Plotwist")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.white.opacity(0.4))
        }
        .padding(.bottom, 32)
      }
    }
  }

  // MARK: - Poster Background

  @ViewBuilder
  var posterBackground: some View {
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
        Color.black
        LinearGradient(
          stops: [
            .init(color: posterColors[0].opacity(0.5), location: 0),
            .init(color: posterColors[1].opacity(0.35), location: 0.5),
            .init(color: posterColors.count > 2 ? posterColors[2].opacity(0.5) : posterColors[0].opacity(0.5), location: 1),
          ],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
        .frame(width: cardWidth, height: cardHeight)
        .overlay(Color.black.opacity(0.4))
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
        .frame(width: cardWidth, height: cardHeight)
      }
    }
  }

  // MARK: - Shared Components

  func avatarCircle(size: CGFloat) -> some View {
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

  func starsRow(rating: Double, size: CGFloat) -> some View {
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

  func ratingPill(_ rating: Double) -> some View {
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

  var plotwistBranding: some View {
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
