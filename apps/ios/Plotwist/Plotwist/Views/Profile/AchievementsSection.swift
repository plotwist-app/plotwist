//
//  AchievementsSection.swift
//  Plotwist
//

import SwiftUI

struct Achievement: Identifiable {
  let id: String
  let icon: String
  let name: String
  let description: String
  let current: Int
  let target: Int
  let level: Int
  var isClaimed: Bool
  var isEquipped: Bool
  var remoteId: String?
  var category: String
  var sortOrder: Int

  var isComplete: Bool { current >= target }
  var isClaimable: Bool { isComplete && !isClaimed }
  var progress: Double { min(Double(current) / Double(target), 1.0) }
  var assetIcon: String { "ach.\(id)" }
  var isSaga: Bool { category == "saga" }

  var iconURL: URL? {
    guard icon.hasPrefix("http") else { return nil }
    return URL(string: icon)
  }
}

struct AchievementIconView: View {
  let achievement: Achievement
  let size: CGFloat
  var muted: Bool = false

  var body: some View {
    if let url = achievement.iconURL {
      CachedAsyncImage(url: url) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fit)
      } placeholder: {
        Color.appInputFilled
      }
      .frame(width: size, height: size)
      .saturation(muted ? 0 : 1)
      .opacity(muted ? 0.5 : 1)
    } else if UIImage(named: achievement.assetIcon) != nil {
      Image(achievement.assetIcon)
        .resizable()
        .aspectRatio(contentMode: .fit)
        .frame(width: size, height: size)
        .saturation(muted ? 0 : 1)
        .opacity(muted ? 0.5 : 1)
    } else {
      Image(systemName: achievement.icon)
        .font(.system(size: size * 0.75, weight: .medium))
        .symbolRenderingMode(.hierarchical)
        .foregroundStyle(Color.appForegroundAdaptive)
    }
  }
}

var initialMockAchievements: [Achievement] {
  []
}

// MARK: - Achievements Section

struct AchievementsSection: View {
  @Binding var achievements: [Achievement]
  @Binding var claimedAchievement: Achievement?

  private var claimedCount: Int { achievements.filter(\.isClaimed).count }
  private var claimable: [Achievement] { achievements.filter(\.isClaimable) }

  private var inProgress: [Achievement] {
    achievements
      .filter { $0.current > 0 && !$0.isComplete && !$0.isSaga }
      .sorted { $0.progress > $1.progress }
  }

  private var sagas: [Achievement] {
    achievements.filter { $0.isSaga && !$0.isClaimed }
  }

  private var locked: [Achievement] {
    achievements.filter { $0.current == 0 && !$0.isSaga }
  }

  private var claimed: [Achievement] {
    achievements.filter(\.isClaimed)
  }

  var body: some View {
    VStack(spacing: 0) {
      if achievements.isEmpty {
        VStack(spacing: 12) {
          Spacer()
          ProgressView()
          Spacer()
        }
        .frame(minHeight: 200)
      } else {
        AchievementsProgressHeader(
          claimedCount: claimedCount,
          totalCount: achievements.count,
          claimableCount: claimable.count
        )
        .padding(.horizontal, 24)
        .padding(.top, 12)
        .padding(.bottom, 20)

        if !claimable.isEmpty {
          ClaimableSpotlightSection(
            achievements: claimable,
            onClaim: { claim(id: $0) }
          )
          .padding(.bottom, 24)
        }

        if !inProgress.isEmpty {
          achievementGroup(
            title: L10n.current.achSectionInProgress,
            items: inProgress
          )
        }

        if !sagas.isEmpty {
          achievementGroup(
            title: L10n.current.achSectionSagas,
            items: sagas
          )
        }

        if !locked.isEmpty {
          achievementGroup(
            title: L10n.current.achSectionLocked,
            items: locked
          )
        }

        if !claimed.isEmpty {
          achievementGroup(
            title: L10n.current.achSectionClaimed,
            items: claimed
          )
        }
      }
    }
    .padding(.bottom, 24)
  }

  private static let gridColumns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12)
  ]

  @ViewBuilder
  private func achievementGroup(title: String, items: [Achievement]) -> some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)
        .textCase(.uppercase)
        .tracking(0.5)
        .padding(.horizontal, 24)
        .padding(.top, 20)

      LazyVGrid(columns: Self.gridColumns, spacing: 12) {
        ForEach(items) { achievement in
          AchievementCard(
            achievement: achievement,
            onClaim: achievement.isClaimable ? { claim(id: achievement.id) } : nil
          )
        }
      }
      .padding(.horizontal, 24)
    }
  }

  private func claim(id: String) {
    guard let index = achievements.firstIndex(where: { $0.id == id }),
          achievements[index].isClaimable,
          let remoteId = achievements[index].remoteId else { return }

    withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
      achievements[index].isClaimed = true
      achievements[index].isEquipped = true
    }

    Haptics.notification(.success)

    var claimed = achievements[index]
    claimed.isClaimed = true
    claimed.isEquipped = true
    claimedAchievement = claimed

    Task {
      do {
        _ = try await AchievementService.shared.claimAchievement(id: remoteId)
      } catch {
        withAnimation {
          achievements[index].isClaimed = false
          achievements[index].isEquipped = false
        }
      }
    }
  }
}

// MARK: - Progress Header

private struct AchievementsProgressHeader: View {
  let claimedCount: Int
  let totalCount: Int
  let claimableCount: Int
  @Environment(\.colorScheme) private var colorScheme

  private var progress: Double {
    guard totalCount > 0 else { return 0 }
    return Double(claimedCount) / Double(totalCount)
  }

  var body: some View {
    HStack(spacing: 16) {
      ZStack {
        Circle()
          .stroke(Color.appBorderAdaptive, lineWidth: 5)

        Circle()
          .trim(from: 0, to: progress)
          .stroke(Color.appForegroundAdaptive, style: StrokeStyle(lineWidth: 5, lineCap: .round))
          .rotationEffect(.degrees(-90))

        Text("\(claimedCount)")
          .font(.system(size: 18, weight: .bold, design: .rounded))
          .foregroundColor(.appForegroundAdaptive)
      }
      .frame(width: 52, height: 52)

      VStack(alignment: .leading, spacing: 4) {
        Text("\(claimedCount) \(L10n.current.achOfTotal) \(totalCount)")
          .font(.body.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .contentTransition(.numericText())

        if claimableCount > 0 {
          Text("\(claimableCount) \(L10n.current.achReadyToClaim)")
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .contentTransition(.numericText())
        } else {
          Text(L10n.current.achBadgesClaimed)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }

      Spacer()
    }
    .padding(16)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
  }
}

// MARK: - Claimable Spotlight

private struct ClaimableSpotlightSection: View {
  let achievements: [Achievement]
  let onClaim: (String) -> Void
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(L10n.current.achReadyToClaim)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)
        .textCase(.uppercase)
        .tracking(0.5)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(achievements) { achievement in
            ClaimableCard(
              achievement: achievement,
              onClaim: { onClaim(achievement.id) }
            )
          }
        }
        .padding(.horizontal, 24)
      }
    }
  }
}

private struct ClaimableCard: View {
  let achievement: Achievement
  let onClaim: () -> Void
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    VStack(spacing: 12) {
      AchievementIconView(achievement: achievement, size: 64)
        .padding(.top, 4)

      Text(achievement.name)
        .font(.caption.weight(.medium))
        .foregroundColor(.appForegroundAdaptive)
        .lineLimit(2)
        .multilineTextAlignment(.center)

      Button(action: onClaim) {
        Text(L10n.current.claimBadge)
          .font(.caption.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .padding(.horizontal, 16)
          .padding(.vertical, 10)
          .background(Color.appForegroundAdaptive.opacity(0.12))
          .clipShape(RoundedRectangle(cornerRadius: 10))
      }
      .buttonStyle(.plain)
    }
    .frame(width: 130)
    .padding(.vertical, 16)
    .padding(.horizontal, 8)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
  }
}

// MARK: - Profile Badges Row (displayed on profile)

struct ProfileBadgesRow: View {
  let badges: [Achievement]
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    if !badges.isEmpty {
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 8) {
          ForEach(badges) { badge in
            HStack(spacing: 6) {
              AchievementIconView(achievement: badge, size: 14)

              Text(badge.name)
                .font(.caption2.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
                .lineLimit(1)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.appInputFilled)
            .clipShape(RoundedRectangle(cornerRadius: 8))
          }
        }
        .padding(.horizontal, 24)
      }
    }
  }
}

// MARK: - Claim Celebration Overlay

struct ClaimCelebrationOverlay: View {
  let achievement: Achievement
  let onDismiss: () -> Void
  @Environment(\.colorScheme) private var colorScheme

  @State private var showContent = false
  @State private var showParticles = false
  @State private var particleOffsets: [(x: CGFloat, y: CGFloat, angle: Double)] = (0..<12).map { i in
    let angle = Double(i) * (360.0 / 12.0)
    return (x: 0, y: 0, angle: angle)
  }

  var body: some View {
    ZStack {
      Color.black.opacity(showContent ? 0.5 : 0)
        .ignoresSafeArea()
        .onTapGesture { dismiss() }

      VStack(spacing: 20) {
        ZStack {
          ForEach(0..<12, id: \.self) { i in
            Circle()
              .fill(Color.appForegroundAdaptive.opacity(showParticles ? 0 : 0.5))
              .frame(width: i % 2 == 0 ? 8 : 5)
              .offset(
                x: showParticles ? particleOffsets[i].x : 0,
                y: showParticles ? particleOffsets[i].y : 0
              )
          }

          AchievementIconView(achievement: achievement, size: 96)
            .scaleEffect(showContent ? 1 : 0.5)
        }

        VStack(spacing: 8) {
          Text(L10n.current.badgeUnlocked)
            .font(.caption.weight(.semibold))
            .foregroundColor(.appMutedForegroundAdaptive)
            .textCase(.uppercase)
            .tracking(1.2)

          Text(achievement.name)
            .font(.title2.weight(.bold))
            .foregroundColor(.appForegroundAdaptive)

          Text(L10n.current.addedToProfile)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .opacity(showContent ? 1 : 0)
        .offset(y: showContent ? 0 : 10)
      }
      .padding(40)
      .background(
        RoundedRectangle(cornerRadius: 20, style: .continuous)
          .fill(Color.appBackgroundAdaptive)
          .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
              .strokeBorder(Color.appBorderAdaptive, lineWidth: 1)
          )
          .opacity(showContent ? 1 : 0)
      )
      .scaleEffect(showContent ? 1 : 0.9)
      .padding(.horizontal, 48)
    }
    .onAppear {
      withAnimation(.spring(response: 0.45, dampingFraction: 0.75)) {
        showContent = true
      }

      withAnimation(.easeOut(duration: 0.6).delay(0.15)) {
        showParticles = true
        for i in 0..<12 {
          let angle = particleOffsets[i].angle
          let distance: CGFloat = CGFloat.random(in: 60...100)
          let rad = angle * .pi / 180
          particleOffsets[i].x = cos(rad) * distance
          particleOffsets[i].y = sin(rad) * distance
        }
      }

      DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
        dismiss()
      }
    }
  }

  private func dismiss() {
    withAnimation(.easeOut(duration: 0.25)) {
      showContent = false
    }
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
      onDismiss()
    }
  }
}

// MARK: - Card

private struct AchievementCard: View {
  let achievement: Achievement
  let onClaim: (() -> Void)?
  @Environment(\.colorScheme) private var colorScheme
  @State private var animateProgress = false
  @State private var isExpanded = false
  @State private var cardOriginY: CGFloat = 0
  @State private var liveCardY: CGFloat = 0

  private var hasProgress: Bool { achievement.current > 0 }
  private let screen = UIScreen.main.bounds

  private var safeAreaTop: CGFloat {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .first?.windows.first?.safeAreaInsets.top ?? 0
  }

  private var spring: Animation {
    .spring(response: 0.5, dampingFraction: 0.86)
  }

  var body: some View {
    ScrollView(showsIndicators: false) {
      VStack(spacing: 0) {
        collapsedContent

        if isExpanded {
          expandedContent
            .transition(.opacity.combined(with: .move(edge: .bottom)))
        }
      }
    }
    .scrollDisabled(!isExpanded)
    .frame(height: isExpanded ? screen.height + safeAreaTop : nil)
    .clipped()
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: isExpanded ? 0 : 22, style: .continuous))
    .opacity(cardOpacity)
    .shadow(color: .black.opacity(isExpanded ? 0.15 : 0), radius: 20, y: -4)
    .background(
      GeometryReader { geo in
        Color.clear
          .onChange(of: geo.frame(in: .global).minY) { _, newY in
            if !isExpanded { liveCardY = newY }
          }
          .onAppear { liveCardY = geo.frame(in: .global).minY }
      }
    )
    .overlay(alignment: .topTrailing) {
      if isExpanded {
        Button {
          withAnimation(spring) { isExpanded = false }
        } label: {
          Image(systemName: "xmark")
            .font(.system(size: 13, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 32, height: 32)
            .background(Color.appForegroundAdaptive.opacity(0.1))
            .clipShape(Circle())
        }
        .padding(.trailing, 16)
        .padding(.top, safeAreaTop + 12)
        .transition(.opacity)
      }
    }
    .contentShape(Rectangle())
    .onTapGesture {
      guard !isExpanded, achievement.isClaimed else { return }
      Haptics.impact(.light)
      cardOriginY = liveCardY
      withAnimation(spring) { isExpanded = true }
    }
    .offset(y: isExpanded ? -cardOriginY : 0)
    .zIndex(isExpanded ? 100 : 0)
    .onAppear {
      withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
        animateProgress = true
      }
    }
  }

  // MARK: Collapsed Content

  private var collapsedContent: some View {
    VStack(spacing: 0) {
      AchievementIconView(achievement: achievement, size: isExpanded ? 120 : iconSize)
        .opacity(iconOpacity)
        .padding(.top, isExpanded ? safeAreaTop + 48 : 20)
        .padding(.bottom, isExpanded ? 24 : 14)

      VStack(spacing: 5) {
        Text(achievement.name)
          .font(isExpanded ? .title2.weight(.bold) : .body.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
          .lineLimit(isExpanded ? nil : 2)
          .fixedSize(horizontal: false, vertical: true)

        Text(achievement.description)
          .font(isExpanded ? .subheadline : .caption)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
          .lineLimit(isExpanded ? nil : 2)
      }
      .padding(.horizontal, isExpanded ? 24 : 14)

      if !isExpanded {
        Spacer(minLength: 16)
        ctaSection
          .padding(.horizontal, 14)
          .padding(.bottom, 18)
      }
    }
  }

  // MARK: Expanded Content

  private var expandedContent: some View {
    VStack(spacing: 20) {
      Divider()
        .padding(.horizontal, 24)
        .padding(.top, 20)

      VStack(spacing: 16) {
        detailRow(label: "Level", value: "\(achievement.level)")
        detailRow(label: L10n.current.achOfTotal, value: "\(achievement.current)/\(achievement.target)")

        if achievement.isClaimed {
          HStack {
            Text(L10n.current.achBadgesClaimed)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
            Spacer()
            Image(systemName: "checkmark.circle.fill")
              .foregroundColor(.green)
          }
        }
      }
      .padding(.horizontal, 24)

      Spacer().frame(height: 40)
    }
  }

  private func detailRow(label: String, value: String) -> some View {
    HStack {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      Spacer()
      Text(value)
        .font(.subheadline.weight(.semibold))
        .foregroundColor(.appForegroundAdaptive)
    }
  }

  // MARK: Helpers

  private var iconSize: CGFloat {
    if achievement.isComplete { return 96 }
    if hasProgress { return 88 }
    return 80
  }

  private var iconOpacity: Double {
    if achievement.isComplete || achievement.isClaimed || hasProgress { return 1 }
    return 0.5
  }

  private var cardOpacity: Double {
    if achievement.isClaimed || achievement.isClaimable { return 1 }
    if hasProgress { return 1 }
    return 0.45
  }

  // MARK: CTA

  @ViewBuilder
  private var ctaSection: some View {
    if achievement.isClaimed {
      EmptyView()
    } else if achievement.isClaimable, let onClaim {
      Button(action: onClaim) {
        Text(L10n.current.claimBadge)
          .font(.footnote.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .padding(.vertical, 12)
          .background(Color.appForegroundAdaptive.opacity(0.12))
          .clipShape(RoundedRectangle(cornerRadius: 12))
      }
      .buttonStyle(.plain)
    } else if hasProgress {
      VStack(spacing: 6) {
        GeometryReader { geo in
          Capsule()
            .fill(Color.appForegroundAdaptive.opacity(0.12))
            .overlay(alignment: .leading) {
              Capsule()
                .fill(Color.appForegroundAdaptive)
                .frame(width: max(geo.size.width * (animateProgress ? achievement.progress : 0), 6))
            }
            .clipShape(Capsule())
        }
        .frame(height: 8)

        Text("\(achievement.current)/\(achievement.target)")
          .font(.system(size: 11, weight: .semibold).monospacedDigit())
          .foregroundColor(.appMutedForegroundAdaptive)
      }
    } else {
      Text("\(achievement.current)/\(achievement.target)")
        .font(.system(size: 11, weight: .semibold).monospacedDigit())
        .foregroundColor(.appMutedForegroundAdaptive)
    }
  }
}
