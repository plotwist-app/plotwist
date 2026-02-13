//
//  ReviewItemView.swift
//  Plotwist
//

import SwiftUI

struct ReviewItemView: View {
  let review: ReviewListItem
  @State private var spoilerRevealed = false

  private var usernameInitial: String {
    review.user.username.first?.uppercased() ?? "?"
  }

  private var timeAgo: String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated

    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    if let date = dateFormatter.date(from: review.createdAt) {
      return formatter.localizedString(for: date, relativeTo: Date())
    }
    return ""
  }

  var body: some View {
    HStack(alignment: .top, spacing: 12) {
      // Avatar
      if let avatarUrl = review.user.avatarUrl,
        let url = URL(string: avatarUrl)
      {
        CachedAsyncImage(url: url) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          avatarFallback
        }
        .frame(width: 40, height: 40)
        .clipShape(Circle())
      } else {
        avatarFallback
      }

      // Content
      VStack(alignment: .leading, spacing: 0) {
        // Header: Username + Time (aligned to top)
        HStack(alignment: .top) {
          Text(review.user.username)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          Text(timeAgo)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        // Rating stars (below username)
        HStack(spacing: 2) {
          ForEach(1...5, id: \.self) { index in
            Image(systemName: ratingIcon(for: index))
              .font(.system(size: 14))
              .foregroundColor(ratingColor(for: index))
          }
        }
        .padding(.top, 4)

        // Review content (below stars)
        if !review.review.isEmpty {
          if review.hasSpoilers && !spoilerRevealed {
            Button {
              withAnimation(.easeOut(duration: 0.25)) {
                spoilerRevealed = true
              }
            } label: {
              HStack(spacing: 8) {
                Image(systemName: "eye.slash")
                  .font(.system(size: 13, weight: .medium))
                  .foregroundColor(.appMutedForegroundAdaptive)

                Text(L10n.current.containSpoilers)
                  .font(.caption.weight(.medium))
                  .foregroundColor(.appMutedForegroundAdaptive)

                Spacer()

                Text(L10n.current.tapToReveal)
                  .font(.caption2)
                  .foregroundColor(.appMutedForegroundAdaptive.opacity(0.6))
              }
              .padding(.horizontal, 14)
              .padding(.vertical, 12)
              .background(
                RoundedRectangle(cornerRadius: 10)
                  .fill(Color.appBorderAdaptive.opacity(0.15))
              )
              .overlay(
                RoundedRectangle(cornerRadius: 10)
                  .strokeBorder(Color.appBorderAdaptive.opacity(0.3), style: StrokeStyle(lineWidth: 1, dash: [5, 4]))
              )
            }
            .buttonStyle(.plain)
            .padding(.top, 8)
          } else {
            Text(review.review)
              .font(.subheadline)
              .foregroundColor(.appForegroundAdaptive)
              .lineSpacing(4)
              .padding(.top, 8)
              .transition(.opacity.combined(with: .blurReplace))
          }
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  private var avatarFallback: some View {
    Circle()
      .fill(Color.appForegroundAdaptive)
      .frame(width: 40, height: 40)
      .overlay(
        Text(usernameInitial)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appBackgroundAdaptive)
      )
  }

  private func ratingIcon(for index: Int) -> String {
    let rating = review.rating
    if Double(index) <= rating {
      return "star.fill"
    } else if Double(index) - 0.5 <= rating {
      return "star.leadinghalf.filled"
    } else {
      return "star"
    }
  }

  private func ratingColor(for index: Int) -> Color {
    let rating = review.rating
    if Double(index) <= rating || Double(index) - 0.5 <= rating {
      return .appStarYellow
    } else {
      return .gray.opacity(0.3)
    }
  }
}

#Preview {
  VStack(spacing: 32) {
    ReviewItemView(
      review: ReviewListItem(
        id: "1",
        userId: "user1",
        tmdbId: 123,
        mediaType: "MOVIE",
        review:
          "This is an amazing movie! The cinematography was beautiful and the acting was superb.",
        rating: 4.5,
        hasSpoilers: false,
        seasonNumber: nil,
        episodeNumber: nil,
        language: "en-US",
        createdAt: "2025-01-10T12:00:00.000Z",
        user: ReviewUser(id: "user1", username: "johndoe", avatarUrl: nil),
        likeCount: 5,
        replyCount: 2,
        userLike: nil
      ))

    ReviewItemView(
      review: ReviewListItem(
        id: "2",
        userId: "user2",
        tmdbId: 123,
        mediaType: "MOVIE",
        review: "Contains major plot spoilers about the ending!",
        rating: 3.0,
        hasSpoilers: true,
        seasonNumber: nil,
        episodeNumber: nil,
        language: "en-US",
        createdAt: "2025-01-09T12:00:00.000Z",
        user: ReviewUser(id: "user2", username: "janedoe", avatarUrl: nil),
        likeCount: 10,
        replyCount: 0,
        userLike: nil
      ))
  }
  .padding()
}
