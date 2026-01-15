//
//  ReviewItemView.swift
//  Plotwist
//

import SwiftUI

struct ReviewItemView: View {
  let review: ReviewListItem

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
        AsyncImage(url: url) { phase in
          switch phase {
          case .success(let image):
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          default:
            avatarFallback
          }
        }
        .frame(width: 40, height: 40)
        .clipShape(Circle())
        .overlay(Circle().stroke(Color.appBorderAdaptive, lineWidth: 1))
      } else {
        avatarFallback
      }

      // Content
      VStack(alignment: .leading, spacing: 8) {
        // Header
        HStack(spacing: 6) {
          Text(review.user.username)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)

          Circle()
            .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
            .frame(width: 4, height: 4)

          // Rating stars
          HStack(spacing: 2) {
            ForEach(1...5, id: \.self) { index in
              Image(systemName: ratingIcon(for: index))
                .font(.system(size: 10))
                .foregroundColor(ratingColor(for: index))
            }
          }

          Circle()
            .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
            .frame(width: 4, height: 4)

          Text(timeAgo)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        // Review content
        if !review.review.isEmpty {
          ZStack(alignment: .topLeading) {
            Text(review.review)
              .font(.subheadline)
              .foregroundColor(.appForegroundAdaptive)
              .lineSpacing(4)
              .blur(radius: review.hasSpoilers ? 6 : 0)

            if review.hasSpoilers {
              Text(L10n.current.containSpoilers)
                .font(.caption.weight(.medium))
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.appInputFilled)
                .cornerRadius(6)
            }
          }
          .padding(12)
          .frame(maxWidth: .infinity, alignment: .leading)
          .background(Color.appInputFilled.opacity(0.5))
          .overlay(
            RoundedRectangle(cornerRadius: 8)
              .stroke(Color.appBorderAdaptive, lineWidth: 1)
          )
          .cornerRadius(8)
        }

        // Actions
        HStack(spacing: 16) {
          HStack(spacing: 4) {
            Image(systemName: "heart")
              .font(.system(size: 12))
            Text("\(review.likeCount)")
              .font(.caption)
          }
          .foregroundColor(.appMutedForegroundAdaptive)

          HStack(spacing: 4) {
            Image(systemName: "bubble.right")
              .font(.system(size: 12))
            Text("\(review.replyCount)")
              .font(.caption)
          }
          .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
    }
  }

  private var avatarFallback: some View {
    Circle()
      .fill(Color.appInputFilled)
      .frame(width: 40, height: 40)
      .overlay(
        Text(usernameInitial)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      )
      .overlay(Circle().stroke(Color.appBorderAdaptive, lineWidth: 1))
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
      return .yellow
    } else {
      return .gray.opacity(0.3)
    }
  }
}

#Preview {
  VStack(spacing: 16) {
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
