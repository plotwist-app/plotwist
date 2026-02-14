//
//  ReviewItemView.swift
//  Plotwist
//

import SwiftUI

struct ReviewItemView: View {
  let review: ReviewListItem
  var lineLimit: Int? = nil
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
    VStack(alignment: .leading, spacing: 0) {
      // Row 1: Avatar + Username
      HStack(spacing: 10) {
        // Avatar
        Group {
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
          } else {
            avatarFallback
          }
        }
        .frame(width: 44, height: 44)
        .clipShape(Circle())

        Text(review.user.username)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)

        Spacer()
      }

      // Row 2: Stars + dot + Date
      HStack(spacing: 8) {
        HStack(spacing: 2) {
          ForEach(1...5, id: \.self) { index in
            Image(systemName: ratingIcon(for: index))
              .font(.system(size: 12))
              .foregroundColor(ratingColor(for: index))
          }
        }

        Circle()
          .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
          .frame(width: 3, height: 3)

        Text(timeAgo)
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      .padding(.top, 10)

      // Row 3: Review text
      if !review.review.isEmpty {
        if review.hasSpoilers && !spoilerRevealed {
          Text(review.review)
            .font(.body)
            .foregroundColor(.appForegroundAdaptive)
            .lineSpacing(5)
            .lineLimit(lineLimit ?? 4)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.top, 14)
            .blur(radius: 6)
            .overlay(alignment: .leading) {
              Label(L10n.current.containSpoilers, systemImage: "eye.slash.fill")
                .font(.caption.weight(.medium))
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
                .padding(.top, 14)
            }
            .contentShape(Rectangle())
            .onTapGesture {
              withAnimation(.easeOut(duration: 0.2)) { spoilerRevealed = true }
            }
        } else {
          Text(review.review)
            .font(.body)
            .foregroundColor(.appForegroundAdaptive)
            .lineSpacing(5)
            .lineLimit(lineLimit)
            .padding(.top, 14)
            .transition(.opacity)
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  private var avatarFallback: some View {
    Circle()
      .fill(Color.appForegroundAdaptive)
      .frame(width: 44, height: 44)
      .overlay(
        Text(usernameInitial)
          .font(.subheadline.weight(.semibold))
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

// MARK: - Review Card (compact horizontal scroll card for season/episode reviews)
struct ReviewCardView: View {
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
    VStack(alignment: .leading, spacing: 10) {
      // Author row: avatar + name + time
      HStack(spacing: 10) {
        Group {
          if let avatarUrl = review.user.avatarUrl,
             let url = URL(string: avatarUrl)
          {
            CachedAsyncImage(url: url) { image in
              image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
              cardAvatarFallback
            }
          } else {
            cardAvatarFallback
          }
        }
        .frame(width: 32, height: 32)
        .clipShape(Circle())

        Text(review.user.username)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        Text(timeAgo)
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      // Stars
      HStack(spacing: 2) {
        ForEach(1...5, id: \.self) { index in
          Image(systemName: cardRatingIcon(for: index))
            .font(.system(size: 12))
            .foregroundColor(cardRatingColor(for: index))
        }
      }

      // Review text
      if !review.review.isEmpty {
        if review.hasSpoilers && !spoilerRevealed {
          Text(review.review)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(3)
            .frame(maxWidth: .infinity, alignment: .leading)
            .blur(radius: 6)
            .overlay(
              Label(L10n.current.containSpoilers, systemImage: "eye.slash.fill")
                .font(.caption.weight(.medium))
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.ultraThinMaterial)
                .clipShape(Capsule())
            )
            .contentShape(Rectangle())
            .onTapGesture {
              withAnimation(.easeOut(duration: 0.2)) { spoilerRevealed = true }
            }
        } else {
          Text(review.review)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(3)
            .lineSpacing(2)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }

  private var cardAvatarFallback: some View {
    Circle()
      .fill(Color.appBorderAdaptive)
      .overlay(
        Text(usernameInitial)
          .font(.caption2.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
      )
  }

  private func cardRatingIcon(for index: Int) -> String {
    let r = review.rating
    if Double(index) <= r { return "star.fill" }
    if Double(index) - 0.5 <= r { return "star.leadinghalf.filled" }
    return "star"
  }

  private func cardRatingColor(for index: Int) -> Color {
    let r = review.rating
    return (Double(index) <= r || Double(index) - 0.5 <= r) ? .appStarYellow : .gray.opacity(0.3)
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
