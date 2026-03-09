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
  let color: Color
  let level: Int
  var isClaimed: Bool
  var isEquipped: Bool

  var isComplete: Bool { current >= target }
  var isClaimable: Bool { isComplete && !isClaimed }
  var progress: Double { min(Double(current) / Double(target), 1.0) }
  var assetIcon: String { "ach.\(id)" }
}

struct AchievementIconView: View {
  let achievement: Achievement
  let size: CGFloat
  let color: Color
  var muted: Bool = false

  var body: some View {
    if UIImage(named: achievement.assetIcon) != nil {
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
        .foregroundStyle(color)
    }
  }
}

var initialMockAchievements: [Achievement] {
  let s = L10n.current
  return [
    Achievement(
      id: "first_steps", icon: "star", name: s.achFirstSteps,
      description: s.achFirstStepsDesc,
      current: 1, target: 1, color: Color(hex: "D4A843"), level: 1,
      isClaimed: true, isEquipped: true
    ),
    Achievement(
      id: "horror_fan", icon: "theatermasks", name: s.achHorrorFan,
      description: s.achHorrorFanDesc,
      current: 10, target: 10, color: Color(hex: "D46B6B"), level: 2,
      isClaimed: true, isEquipped: false
    ),
    Achievement(
      id: "binge_watcher", icon: "play.rectangle", name: s.achBingeWatcher,
      description: s.achBingeWatcherDesc,
      current: 5, target: 5, color: Color(hex: "9B6EBE"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "explorer", icon: "globe", name: s.achExplorer,
      description: s.achExplorerDesc,
      current: 7, target: 10, color: Color(hex: "5B8DB8"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "critic", icon: "text.bubble", name: s.achCritic,
      description: s.achCriticDesc,
      current: 3, target: 10, color: Color(hex: "D49243"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "marathon", icon: "bolt", name: s.achMarathon,
      description: s.achMarathonDesc,
      current: 1, target: 3, color: Color(hex: "4BA8B8"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "cinephile", icon: "film", name: s.achCinephile,
      description: s.achCinephileDesc,
      current: 42, target: 100, color: Color(hex: "6E6EB8"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "social_butterfly", icon: "person.2", name: s.achSocialButterfly,
      description: s.achSocialButterflyDesc,
      current: 2, target: 10, color: Color(hex: "B86E92"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "watchlist_pro", icon: "list.bullet.rectangle", name: s.achWatchlistPro,
      description: s.achWatchlistProDesc,
      current: 12, target: 50, color: Color(hex: "5BB86E"), level: 1,
      isClaimed: false, isEquipped: false
    ),

    // Sagas
    Achievement(
      id: "saga_lotr", icon: "mountain.2", name: s.achLOTR,
      description: s.achLOTRDesc,
      current: 3, target: 3, color: Color(hex: "B89843"), level: 1,
      isClaimed: true, isEquipped: true
    ),
    Achievement(
      id: "saga_star_wars", icon: "sparkles", name: s.achStarWars,
      description: s.achStarWarsDesc,
      current: 6, target: 9, color: Color(hex: "6B85B8"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_harry_potter", icon: "wand.and.stars", name: s.achHarryPotter,
      description: s.achHarryPotterDesc,
      current: 8, target: 8, color: Color(hex: "8B5E5E"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_mcu", icon: "shield", name: s.achMCU,
      description: s.achMCUDesc,
      current: 18, target: 23, color: Color(hex: "D4705B"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_fast", icon: "car", name: s.achFastFurious,
      description: s.achFastFuriousDesc,
      current: 4, target: 10, color: Color(hex: "787878"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_godfather", icon: "crown", name: s.achGodfather,
      description: s.achGodfatherDesc,
      current: 2, target: 3, color: Color(hex: "A08050"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_batman_nolan", icon: "moon.stars", name: s.achDarkKnight,
      description: s.achDarkKnightDesc,
      current: 3, target: 3, color: Color(hex: "555578"), level: 1,
      isClaimed: true, isEquipped: false
    ),
    Achievement(
      id: "saga_back_future", icon: "clock.arrow.circlepath", name: s.achBackFuture,
      description: s.achBackFutureDesc,
      current: 1, target: 3, color: Color(hex: "4B9AB8"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_indiana_jones", icon: "map", name: s.achIndianaJones,
      description: s.achIndianaJonesDesc,
      current: 2, target: 5, color: Color(hex: "B89050"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_matrix", icon: "circle.grid.cross", name: s.achMatrix,
      description: s.achMatrixDesc,
      current: 1, target: 3, color: Color(hex: "4BA04B"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_alien", icon: "allergens", name: s.achAlien,
      description: s.achAlienDesc,
      current: 0, target: 4, color: Color(hex: "4B784B"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_rocky", icon: "figure.boxing", name: s.achRocky,
      description: s.achRockyDesc,
      current: 3, target: 8, color: Color(hex: "B85B5B"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_mission_impossible", icon: "flame", name: s.achMissionImpossible,
      description: s.achMissionImpossibleDesc,
      current: 5, target: 8, color: Color(hex: "D47843"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_toy_story", icon: "teddybear", name: s.achToyStory,
      description: s.achToyStoryDesc,
      current: 4, target: 4, color: Color(hex: "43A8B8"), level: 1,
      isClaimed: false, isEquipped: false
    ),
    Achievement(
      id: "saga_john_wick", icon: "dog", name: s.achJohnWick,
      description: s.achJohnWickDesc,
      current: 3, target: 4, color: Color(hex: "785878"), level: 1,
      isClaimed: false, isEquipped: false
    ),
  ]
}

// MARK: - Achievements Section

struct AchievementsSection: View {
  @Binding var achievements: [Achievement]
  @Binding var claimedAchievement: Achievement?

  private var claimedCount: Int { achievements.filter(\.isClaimed).count }
  private var claimable: [Achievement] { achievements.filter(\.isClaimable) }

  private var inProgress: [Achievement] {
    achievements
      .filter { $0.current > 0 && !$0.isComplete && !$0.id.hasPrefix("saga_") }
      .sorted { $0.progress > $1.progress }
  }

  private var sagas: [Achievement] {
    achievements.filter { $0.id.hasPrefix("saga_") && !$0.isClaimed }
  }

  private var locked: [Achievement] {
    achievements.filter { $0.current == 0 && !$0.id.hasPrefix("saga_") }
  }

  private var claimed: [Achievement] {
    achievements.filter(\.isClaimed)
  }

  var body: some View {
    VStack(spacing: 0) {
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
          achievements[index].isClaimable else { return }

    withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
      achievements[index].isClaimed = true
      achievements[index].isEquipped = true
    }

    Haptics.notification(.success)

    var claimed = achievements[index]
    claimed.isClaimed = true
    claimed.isEquipped = true
    claimedAchievement = claimed
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
      AchievementIconView(achievement: achievement, size: 64, color: achievement.color)
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
          .background(Color.appBorderAdaptive.opacity(0.5))
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
              AchievementIconView(achievement: badge, size: 14, color: badge.color)

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

          AchievementIconView(achievement: achievement, size: 96, color: .appForegroundAdaptive)
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

  private var hasProgress: Bool { achievement.current > 0 }

  var body: some View {
    VStack(spacing: 0) {
      iconSection
        .padding(.top, 20)
        .padding(.bottom, 14)

      textSection
        .padding(.horizontal, 14)

      Spacer(minLength: 16)

      ctaSection
        .padding(.horizontal, 14)
        .padding(.bottom, 18)
    }
    .frame(maxWidth: .infinity)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
    .opacity(cardOpacity)
    .onAppear {
      withAnimation(.easeOut(duration: 0.6).delay(0.1)) {
        animateProgress = true
      }
    }
  }

  private var cardOpacity: Double {
    if achievement.isClaimed || achievement.isClaimable { return 1 }
    if hasProgress { return 0.7 }
    return 0.45
  }

  // MARK: Icon

  private var iconSection: some View {
    Group {
      if achievement.isComplete {
        AchievementIconView(achievement: achievement, size: 96, color: achievement.color)
      } else if hasProgress {
        AchievementIconView(achievement: achievement, size: 80, color: .appMutedForegroundAdaptive)
      } else {
        Image(systemName: "lock.fill")
          .font(.system(size: 30))
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(width: 80, height: 80)
      }
    }
  }

  // MARK: Text

  private var textSection: some View {
    VStack(spacing: 5) {
      Text(achievement.name)
        .font(.body.weight(.semibold))
        .foregroundColor(.appForegroundAdaptive)
        .multilineTextAlignment(.center)
        .lineLimit(2)
        .fixedSize(horizontal: false, vertical: true)

      Text(achievement.description)
        .font(.caption)
        .foregroundColor(.appMutedForegroundAdaptive)
        .multilineTextAlignment(.center)
        .lineLimit(2)
    }
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
          .background(Color.appBorderAdaptive.opacity(0.5))
          .clipShape(RoundedRectangle(cornerRadius: 12))
      }
      .buttonStyle(.plain)
    } else if hasProgress {
      VStack(spacing: 6) {
        GeometryReader { geo in
          Capsule()
            .fill(Color.appBorderAdaptive)
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
