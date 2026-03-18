//
//  ActivityFeedView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Activity Feed Cache

class ActivityFeedCache {
  static let shared = ActivityFeedCache()
  private init() {}

  private var cache: [String: CachedEntry] = [:]
  private let cacheDuration: TimeInterval = 300

  private struct CachedEntry {
    let activities: [UserActivity]
    let nextCursor: String?
    let timestamp: Date
  }

  func get(userId: String) -> (activities: [UserActivity], nextCursor: String?)? {
    guard let entry = cache[userId],
          Date().timeIntervalSince(entry.timestamp) < cacheDuration else {
      return nil
    }
    return (entry.activities, entry.nextCursor)
  }

  func set(userId: String, activities: [UserActivity], nextCursor: String?) {
    cache[userId] = CachedEntry(activities: activities, nextCursor: nextCursor, timestamp: Date())
  }

  func invalidate(userId: String) {
    cache.removeValue(forKey: userId)
  }
}

// MARK: - Activity Feed (profile tab with infinite scroll)

struct ActivityFeedView: View {
  let userId: String
  @State private var activities: [UserActivity] = []
  @State private var nextCursor: String?
  @State private var isLoading = true
  @State private var isLoadingMore = false
  @State private var strings = L10n.current

  private let cache = ActivityFeedCache.shared

  var body: some View {
    LazyVStack(alignment: .leading, spacing: 0) {
      if isLoading && activities.isEmpty {
        ForEach(0..<8, id: \.self) { _ in
          ActivityItemSkeleton()
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
        }
      } else if activities.isEmpty {
        VStack(spacing: 8) {
          Image(systemName: "clock.arrow.circlepath")
            .font(.system(size: 32))
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(strings.activityNoActivity)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 48)
      } else {
        ForEach(activities) { activity in
          ActivityItemLink(activity: activity)
            .padding(.horizontal, 24)
            .padding(.vertical, 12)
            .onAppear {
              if activity.id == activities.last?.id && nextCursor != nil && !isLoadingMore {
                Task { await loadMore() }
              }
            }
        }

        if isLoadingMore {
          ProgressView()
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
        }
      }
    }
    .padding(.top, 8)
    .onAppear { restoreFromCache() }
    .task { await loadActivities() }
  }

  private func restoreFromCache() {
    if activities.isEmpty, let cached = cache.get(userId: userId) {
      activities = cached.activities
      nextCursor = cached.nextCursor
      isLoading = false
    }
  }

  private func loadActivities() async {
    if activities.isEmpty { isLoading = true }
    do {
      let response = try await ActivityService.shared.getUserActivities(
        userId: userId,
        pageSize: 20
      )
      withAnimation(.easeOut(duration: 0.3)) {
        activities = response.userActivities
        nextCursor = response.nextCursor
        isLoading = false
      }
      cache.set(userId: userId, activities: activities, nextCursor: nextCursor)
    } catch {
      isLoading = false
    }
  }

  private func loadMore() async {
    guard let cursor = nextCursor, !isLoadingMore else { return }
    isLoadingMore = true
    do {
      let response = try await ActivityService.shared.getUserActivities(
        userId: userId,
        pageSize: 20,
        cursor: cursor
      )
      withAnimation(.easeOut(duration: 0.2)) {
        activities.append(contentsOf: response.userActivities)
        nextCursor = response.nextCursor
        isLoadingMore = false
      }
      cache.set(userId: userId, activities: activities, nextCursor: nextCursor)
    } catch {
      isLoadingMore = false
    }
  }
}

// MARK: - Network Activity Section (home page, friends only)

struct NetworkActivitySection: View {
  let userId: String
  @State private var activities: [UserActivity] = []
  @State private var isLoading = true
  @State private var strings = L10n.current

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      Text(strings.activityFriendsActivity)
        .font(.title3.weight(.bold))
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      if isLoading {
        ForEach(0..<5, id: \.self) { _ in
          ActivityItemSkeleton()
        }
        .padding(.horizontal, 24)
      } else if activities.isEmpty {
        HStack(spacing: 8) {
          Image(systemName: "person.2")
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(strings.activityNoActivity)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.horizontal, 24)
      } else {
        VStack(alignment: .leading, spacing: 0) {
          ForEach(activities) { activity in
            ActivityItemLink(activity: activity)
              .padding(.horizontal, 24)
              .padding(.vertical, 10)
          }
        }
      }
    }
    .task {
      await loadNetworkActivities()
    }
  }

  private func loadNetworkActivities() async {
    do {
      let response = try await ActivityService.shared.getNetworkActivities(
        userId: userId,
        pageSize: 15
      )
      withAnimation(.easeOut(duration: 0.3)) {
        activities = response.userActivities
        isLoading = false
      }
    } catch {
      isLoading = false
    }
  }
}

// MARK: - Activity Item Link (tappable → media detail)

struct ActivityItemLink: View {
  let activity: UserActivity

  var body: some View {
    if let tmdbId = activity.additionalInfo?.tmdbId,
       let rawType = activity.additionalInfo?.mediaType {
      let mediaType = rawType == "MOVIE" ? "movie" : "tv"
      NavigationLink {
        MediaDetailView(mediaId: tmdbId, mediaType: mediaType)
      } label: {
        ActivityItemView(activity: activity)
      }
      .buttonStyle(.plain)
    } else {
      ActivityItemView(activity: activity)
    }
  }
}

// MARK: - Activity Item View

struct ActivityItemView: View {
  let activity: UserActivity
  @State private var strings = L10n.current

  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      avatarWithBadge

      VStack(alignment: .leading, spacing: 5) {
        activityText
          .font(.subheadline)
          .lineSpacing(2)
          .foregroundColor(.appMutedForegroundAdaptive)

        if activity.activityType == "CREATE_REVIEW", let rating = activity.additionalInfo?.rating {
          HStack(spacing: 2) {
            ForEach(0..<5, id: \.self) { i in
              Image(systemName: Double(i) + 0.5 <= rating ? "star.fill" : (Double(i) < rating ? "star.leadinghalf.filled" : "star"))
                .font(.system(size: 10))
                .foregroundColor(Double(i) + 0.5 <= rating || Double(i) < rating ? .appStarYellow : .gray.opacity(0.3))
            }
          }
        }
      }
    }
  }

  // MARK: - Avatar with activity badge

  private var avatarWithBadge: some View {
    NavigationLink {
      UserProfileView(
        userId: activity.owner.id,
        initialUsername: activity.owner.username,
        initialAvatarUrl: activity.owner.avatarUrl
      )
    } label: {
      ZStack(alignment: .bottomTrailing) {
        Group {
          if let url = activity.owner.avatarUrl, let imageURL = URL(string: url) {
            CachedAsyncImage(url: imageURL) { image in
              image.resizable().aspectRatio(contentMode: .fill)
            } placeholder: {
              initialsView
            }
          } else {
            initialsView
          }
        }
        .frame(width: 36, height: 36)
        .clipShape(Circle())

        Image(systemName: activityIcon)
          .font(.system(size: 7, weight: .bold))
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(width: 16, height: 16)
          .background(Color.appInputFilled)
          .clipShape(Circle())
          .overlay(Circle().stroke(Color.appBackgroundAdaptive, lineWidth: 1.5))
          .offset(x: 2, y: 2)
      }
    }
    .buttonStyle(.plain)
  }

  private var initialsView: some View {
    Circle()
      .fill(Color.appForegroundAdaptive.opacity(0.1))
      .overlay(
        Text(String(activity.owner.username.prefix(1)).uppercased())
          .font(.caption.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
      )
  }

  private var activityIcon: String {
    switch activity.activityType {
    case "CHANGE_STATUS": return "arrow.triangle.swap"
    case "ADD_ITEM": return "plus"
    case "DELETE_ITEM": return "minus"
    case "CREATE_LIST": return "list.bullet"
    case "LIKE_LIST", "LIKE_REVIEW", "LIKE_REPLY": return "heart.fill"
    case "CREATE_REVIEW": return "star.fill"
    case "FOLLOW_USER": return "person.fill"
    case "CREATE_REPLY": return "text.bubble.fill"
    case "WATCH_EPISODE": return "play.fill"
    case "CREATE_ACCOUNT": return "sparkles"
    default: return "circle.fill"
    }
  }

  // MARK: - Activity text (without stars)

  @ViewBuilder
  private var activityText: some View {
    let name = Text(activity.owner.username).fontWeight(.medium).foregroundColor(.appForegroundAdaptive)
    let time = Text(" · \(activity.relativeTime)").foregroundColor(.appMutedForegroundAdaptive.opacity(0.6))

    switch activity.activityType {
    case "CHANGE_STATUS":
      if let info = activity.additionalInfo {
        name + Text(" \(strings.activityMarked) \(info.title ?? "") \(strings.activityAs) \(localizedStatus(info.status))") + time
      }

    case "ADD_ITEM":
      if let info = activity.additionalInfo {
        name + Text(" \(strings.activityAdded) \(info.title ?? "") \(strings.activityTo) \(info.listTitle ?? "")") + time
      }

    case "DELETE_ITEM":
      if let info = activity.additionalInfo {
        name + Text(" \(strings.activityRemoved) \(info.title ?? "") \(strings.activityFrom) \(info.listTitle ?? "")") + time
      }

    case "CREATE_LIST":
      if let info = activity.additionalInfo {
        name + Text(" \(strings.activityCreatedList) \(info.title ?? "")") + time
      }

    case "LIKE_LIST":
      if let info = activity.additionalInfo {
        name + Text(" \(strings.activityLikedList) \(info.title ?? "")") + time
      }

    case "CREATE_REVIEW":
      if let info = activity.additionalInfo {
        name + Text(" \(strings.activityReviewed) \(info.title ?? "")") + time
      }

    case "LIKE_REVIEW":
      if let info = activity.additionalInfo {
        let author = Text(info.author?.username ?? "").fontWeight(.medium).foregroundColor(.appForegroundAdaptive)
        name + Text(" \(strings.activityLikedReview) ") + author + Text(" \(strings.activityAbout) \(info.title ?? "")") + time
      }

    case "FOLLOW_USER":
      if let info = activity.additionalInfo {
        let followed = Text(info.username ?? "").fontWeight(.medium).foregroundColor(.appForegroundAdaptive)
        name + Text(" \(strings.activityFollowed) ") + followed + time
      }

    case "CREATE_REPLY":
      if let info = activity.additionalInfo {
        let author = Text(info.author?.username ?? "").fontWeight(.medium).foregroundColor(.appForegroundAdaptive)
        name + Text(" \(strings.activityRepliedToReview) ") + author + Text(" \(strings.activityAbout) \(info.title ?? "")") + time
      }

    case "LIKE_REPLY":
      if let info = activity.additionalInfo {
        let author = Text(info.author?.username ?? "").fontWeight(.medium).foregroundColor(.appForegroundAdaptive)
        name + Text(" \(strings.activityLikedReply) ") + author + Text(" \(strings.activityAbout) \(info.title ?? "")") + time
      }

    case "WATCH_EPISODE":
      if let info = activity.additionalInfo {
        let count = info.episodes?.count ?? 0
        let episodeWord = count > 1 ? strings.activityWatchedEpisodes : strings.activityWatchedEpisode
        name + Text(" \(strings.activityMarked) \(count) \(episodeWord) \(strings.activityFrom) \(info.title ?? "") \(strings.activityAs) \(strings.watched)") + time
      }

    case "CREATE_ACCOUNT":
      name + Text(" \(strings.activityJoined)") + time

    default:
      name + time
    }
  }

  private func localizedStatus(_ status: String?) -> String {
    switch status {
    case "WATCHED": return strings.watched
    case "WATCHING": return strings.watching
    case "WATCHLIST": return strings.watchlist
    case "DROPPED": return strings.dropped
    default: return status ?? ""
    }
  }
}

// MARK: - Skeleton

private struct ActivityItemSkeleton: View {
  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      Circle()
        .fill(Color.appForegroundAdaptive.opacity(0.08))
        .frame(width: 36, height: 36)

      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appForegroundAdaptive.opacity(0.08))
        .frame(width: .random(in: 160...260), height: 13)

      Spacer()
    }
  }
}
