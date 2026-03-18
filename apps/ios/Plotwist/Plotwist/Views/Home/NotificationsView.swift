//
//  NotificationsView.swift
//  Plotwist
//

import SwiftUI

struct NotificationsView: View {
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var store = RecommendationStore.shared
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var isScrolled = false
  @State private var slidingIds: [String: CGFloat] = [:]
  @State private var selectedItem: Recommendation?

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "chevron.left")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 40, height: 40)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.notifications)
              .font(.headline)
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Color.clear
              .frame(width: 40, height: 40)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 12)

          Rectangle()
            .fill(Color.appBorderAdaptive)
            .frame(height: 1)
            .opacity(isScrolled ? 1 : 0)
            .animation(.easeInOut(duration: 0.2), value: isScrolled)
        }

        if store.received.isEmpty {
          Spacer()
          emptyState
          Spacer()
        } else {
          ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
              ForEach(Array(store.received.reversed().enumerated()), id: \.element.id) { index, rec in
                let slideOffset = slidingIds[rec.id]

                recommendationCard(rec)
                  .geometryGroup()
                  .offset(x: slideOffset ?? 0)
                  .animation(.easeIn(duration: 0.18), value: slideOffset != nil)

                if index < store.received.count - 1 {
                  Rectangle()
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(height: 1)
                    .padding(.horizontal, 24)
                }
              }
            }
            .padding(.bottom, 40)
            .background(
              GeometryReader { geo in
                Color.clear
                  .onChange(of: geo.frame(in: .global).minY) { _, newValue in
                    isScrolled = newValue < 100
                  }
                  .onAppear {
                    isScrolled = geo.frame(in: .global).minY < 100
                  }
              }
            )
          }
        }
      }
    }
    .navigationBarBackButtonHidden(true)
    .toolbar(.hidden, for: .navigationBar)
    .preferredColorScheme(themeManager.current.colorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .navigationDestination(item: $selectedItem) { rec in
      MediaDetailView(
        mediaId: rec.mediaId,
        mediaType: rec.mediaType
      )
    }
  }

  private var emptyState: some View {
    VStack(spacing: 16) {
      Image(systemName: "bell")
        .font(.system(size: 48))
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.4))

      Text(strings.noNotifications)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
    }
  }

  private func slideAndRemove(_ rec: Recommendation, direction: CGFloat, action: @escaping () -> Void) {
    let screenWidth = UIScreen.main.bounds.width
    slidingIds[rec.id] = direction * screenWidth

    DispatchQueue.main.asyncAfter(deadline: .now() + 0.18) {
      withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {
        action()
      }
      slidingIds.removeValue(forKey: rec.id)
    }
  }

  private func dismissCard(_ rec: Recommendation) {
    Haptics.impact(.light)
    slideAndRemove(rec, direction: -1) { store.decline(rec) }
  }

  private func acceptCard(_ rec: Recommendation) {
    let apiMediaType = rec.mediaType == "movie" ? "MOVIE" : "TV_SHOW"

    Task {
      _ = try? await UserItemService.shared.upsertUserItem(
        tmdbId: rec.mediaId,
        mediaType: apiMediaType,
        status: .watchlist
      )
      NotificationCenter.default.post(name: .collectionCacheInvalidated, object: nil)
    }

    Haptics.notification(.success)
    slideAndRemove(rec, direction: 1) { store.accept(rec) }
  }

  private func timeAgo(_ date: Date) -> String {
    let formatter = RelativeDateTimeFormatter()
    formatter.unitsStyle = .abbreviated
    return formatter.localizedString(for: date, relativeTo: Date())
  }

  private func recommendationCard(_ rec: Recommendation) -> some View {
    VStack(alignment: .leading, spacing: 14) {
      HStack {
        HStack(spacing: 10) {
          ProfileAvatar(
            avatarURL: rec.fromAvatarUrl.flatMap { URL(string: $0) },
            username: rec.fromUsername,
            size: 40
          )

          VStack(alignment: .leading, spacing: 1) {
            Text(rec.fromUsername)
              .font(.subheadline.weight(.medium))
              .foregroundColor(.appForegroundAdaptive)

            Text(strings.recommendedYou)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }

        Spacer()

        Text(timeAgo(rec.createdAt))
          .font(.caption)
          .foregroundColor(.appMutedForegroundAdaptive.opacity(0.7))
      }

      HStack(alignment: .top, spacing: 14) {
        Button {
          selectedItem = rec
        } label: {
          CachedAsyncImage(url: rec.posterURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            RoundedRectangle(cornerRadius: 12)
              .fill(Color.appBorderAdaptive)
          }
          .frame(width: 100, height: 150)
          .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)

        VStack(alignment: .leading, spacing: 8) {
          Button {
            selectedItem = rec
          } label: {
            VStack(alignment: .leading, spacing: 8) {
              Text(rec.mediaTitle)
                .font(.body.weight(.semibold))
                .foregroundColor(.appForegroundAdaptive)
                .lineLimit(2)

              if let msg = rec.message, !msg.isEmpty {
                Text("\"\(msg)\"")
                  .font(.subheadline)
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .italic()
                  .lineLimit(3)
              } else if let overview = rec.mediaOverview, !overview.isEmpty {
                Text(overview)
                  .font(.subheadline)
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .lineLimit(3)
              }
            }
          }
          .buttonStyle(.plain)

          HStack(spacing: 8) {
            Button {
              dismissCard(rec)
            } label: {
              HStack(spacing: 5) {
                Image(systemName: "xmark")
                  .font(.system(size: 11, weight: .semibold))
                Text(strings.decline)
                  .font(.subheadline.weight(.medium))
              }
              .foregroundColor(.appMutedForegroundAdaptive)
              .padding(.horizontal, 14)
              .frame(height: 34)
              .background(Color.appInputFilled)
              .clipShape(Capsule())
            }

            Button {
              acceptCard(rec)
            } label: {
              HStack(spacing: 5) {
                Image(systemName: "plus")
                  .font(.system(size: 11, weight: .semibold))
                Text(strings.watchlist)
                  .font(.subheadline.weight(.medium))
              }
              .foregroundColor(.appBackgroundAdaptive)
              .padding(.horizontal, 14)
              .frame(height: 34)
              .background(Color.appForegroundAdaptive)
              .clipShape(Capsule())
            }
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 20)
  }
}

extension Recommendation: Hashable {
  static func == (lhs: Recommendation, rhs: Recommendation) -> Bool {
    lhs.id == rhs.id
  }
  func hash(into hasher: inout Hasher) {
    hasher.combine(id)
  }
}

#Preview {
  NotificationsView()
}
