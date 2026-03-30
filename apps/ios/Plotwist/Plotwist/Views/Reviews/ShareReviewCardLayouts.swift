//
//  ShareReviewCardLayouts.swift
//  Plotwist
//

import SwiftUI

// MARK: - Layout 2: Quote First

extension ShareReviewCardView {
  var quoteFirstLayout: some View {
    ZStack {
      Color(hex: "0C0C0C")

      VStack(spacing: 0) {
        HStack(spacing: 12) {
          avatarCircle(size: 42)
          VStack(alignment: .leading, spacing: 2) {
            Text(review.user.username)
              .font(.system(size: 16, weight: .semibold))
              .foregroundColor(.white)
            Text("assistiu e avaliou")
              .font(.system(size: 11))
              .foregroundColor(.white.opacity(0.4))
          }
          Spacer()
        }
        .padding(.horizontal, 24)
        .padding(.top, 48)

        Spacer().frame(height: 24)
        VStack(alignment: .leading, spacing: 0) {
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
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
                .padding(.leading, 14)
            }
          }

          Text("\u{201D}")
            .font(.system(size: 64, weight: .ultraLight, design: .serif))
            .foregroundColor(.white.opacity(0.1))
            .frame(maxWidth: .infinity, alignment: .trailing)
            .offset(y: -12)
        }
        .padding(.horizontal, 24)
        Spacer()

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
                .clipShape(RoundedRectangle(cornerRadius: 14))
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
}

// MARK: - Layout 3: Ticket

extension ShareReviewCardView {
  var ticketLayout: some View {
    ZStack {
      Color(hex: "0A0A0A")

      Circle()
        .fill(Color.white.opacity(0.02))
        .frame(width: 280, height: 280)
        .blur(radius: 40)
        .offset(y: -60)

      VStack(spacing: 0) {
        Spacer()

        VStack(spacing: 0) {
          ZStack(alignment: .bottom) {
            if let image = backdropImage ?? posterImage {
              Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: cardWidth - 48, height: (cardWidth - 48) * 9 / 16)
                .clipped()
            } else {
              Color.white.opacity(0.04)
                .frame(height: (cardWidth - 48) * 9 / 16)
            }
          }
          .frame(height: (cardWidth - 48) * 9 / 16)
          .clipped()

          HStack(alignment: .bottom, spacing: 16) {
            if let image = posterImage {
              Image(uiImage: image)
                .resizable()
                .aspectRatio(2 / 3, contentMode: .fill)
                .frame(width: 100, height: 150)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .shadow(color: .black.opacity(0.05), radius: 0.5, x: 0, y: 0)
                .shadow(color: .black.opacity(0.05), radius: 0.5, x: 0, y: 1)
                .shadow(color: .black.opacity(0.05), radius: 4, x: 0, y: 8)
                .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 16)
                .overlay(
                  RoundedRectangle(cornerRadius: 16)
                    .strokeBorder(Color.white.opacity(0.08), lineWidth: 0.5)
                )
            }

            VStack(alignment: .leading, spacing: 4) {
              if let year = mediaYear, !year.isEmpty {
                Text(year)
                  .font(.caption)
                  .foregroundColor(.white.opacity(0.4))
              }

              Text(mediaTitle)
                .font(.headline)
                .foregroundColor(.white)
                .lineLimit(2)

              starsRow(rating: review.rating, size: 13)
                .padding(.top, 2)
            }
            .padding(.bottom, 8)

            Spacer(minLength: 0)
          }
          .padding(.horizontal, 20)
          .offset(y: -28)

          if !review.review.isEmpty {
            Text(review.review)
              .font(.subheadline)
              .foregroundColor(.white.opacity(0.6))
              .lineSpacing(5)
              .fixedSize(horizontal: false, vertical: true)
              .frame(maxWidth: .infinity, alignment: .leading)
              .padding(.horizontal, 20)
              .offset(y: -16)
          }

          VStack(spacing: 0) {
            Rectangle()
              .fill(Color.white.opacity(0.06))
              .frame(height: 1)

            HStack {
              HStack(spacing: 8) {
                avatarCircle(size: 24)
                Text(review.user.username)
                  .font(.caption)
                  .foregroundColor(.white.opacity(0.5))
              }
              Spacer()
              HStack(spacing: 5) {
                Image("PlotistLogoMark")
                  .resizable()
                  .aspectRatio(contentMode: .fit)
                  .frame(height: 13)
                Text("Plotwist")
                  .font(.caption.weight(.semibold))
                  .foregroundColor(.white)
              }
              .opacity(0.3)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
          }
        }
        .background(
          RoundedRectangle(cornerRadius: 24)
            .fill(Color(hex: "141416"))
            .shadow(color: .black.opacity(0.4), radius: 20, y: 10)
            .overlay(
              RoundedRectangle(cornerRadius: 24)
                .strokeBorder(Color.white.opacity(0.06), lineWidth: 0.5)
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .padding(.horizontal, 24)

        Spacer()
      }
    }
  }
}
