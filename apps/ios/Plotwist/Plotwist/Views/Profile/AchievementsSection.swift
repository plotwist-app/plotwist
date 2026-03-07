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

  var body: some View {
    VStack(spacing: 0) {
      ForEach(Array(achievements.enumerated()), id: \.element.id) { index, achievement in
        AchievementRow(
          achievement: achievement,
          onClaim: { claim(id: achievement.id) }
        )

        if index < achievements.count - 1 {
          Divider()
            .padding(.leading, 108)
            .padding(.trailing, 24)
        }
      }
    }
    .padding(.top, 8)
    .padding(.bottom, 24)
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
              Image(systemName: badge.icon)
                .font(.system(size: 11, weight: .medium))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(badge.color)

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
              .fill(achievement.color.opacity(showParticles ? 0 : 0.7))
              .frame(width: i % 2 == 0 ? 8 : 5)
              .offset(
                x: showParticles ? particleOffsets[i].x : 0,
                y: showParticles ? particleOffsets[i].y : 0
              )
          }

          RoundedRectangle(cornerRadius: 24, style: .continuous)
            .fill(
              achievement.color.opacity(colorScheme == .dark ? 0.1 : 0.08)
            )
            .frame(width: 96, height: 96)
            .overlay(
              RoundedRectangle(cornerRadius: 24, style: .continuous)
                .strokeBorder(
                  achievement.color.opacity(colorScheme == .dark ? 0.25 : 0.2),
                  lineWidth: 1
                )
            )
            .overlay(
              Image(systemName: achievement.icon)
                .font(.system(size: 40, weight: .medium))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(achievement.color)
            )
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

// MARK: - Row

private struct AchievementRow: View {
  let achievement: Achievement
  let onClaim: () -> Void
  @Environment(\.colorScheme) private var colorScheme

  private let badgeWidth: CGFloat = 68
  private let badgeHeight: CGFloat = 80
  private let badgeRadius: CGFloat = 18

  var body: some View {
    HStack(spacing: 16) {
      badgeIcon
      details
      Spacer(minLength: 0)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 20)
    .opacity(achievement.isComplete ? 1 : 0.45)
  }

  // MARK: Badge

  private var badgeIcon: some View {
    ZStack {
      RoundedRectangle(cornerRadius: badgeRadius, style: .continuous)
        .fill(
          achievement.isComplete
            ? achievement.color.opacity(colorScheme == .dark ? 0.08 : 0.07)
            : Color.appInputFilled
        )
        .frame(width: badgeWidth, height: badgeHeight)
        .overlay(
          RoundedRectangle(cornerRadius: badgeRadius, style: .continuous)
            .strokeBorder(
              achievement.isComplete
                ? achievement.color.opacity(colorScheme == .dark ? 0.2 : 0.15)
                : Color.appBorderAdaptive,
              lineWidth: 1
            )
        )

      if achievement.isComplete {
        Image(systemName: achievement.icon)
          .font(.system(size: 30, weight: .medium))
          .symbolRenderingMode(.hierarchical)
          .foregroundStyle(achievement.color)
      } else {
        Image(systemName: "lock.fill")
          .font(.system(size: 20))
          .foregroundColor(.appMutedForegroundAdaptive)
      }
    }
    .frame(width: badgeWidth, height: badgeHeight)
  }

  // MARK: Details

  private var details: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(achievement.name)
        .font(.body.weight(.semibold))
        .foregroundColor(.appForegroundAdaptive)

      Text(achievement.description)
        .font(.caption)
        .foregroundColor(.appMutedForegroundAdaptive)
        .lineLimit(2)

      if achievement.isClaimable {
        claimButton
          .padding(.top, 4)
          .transition(.opacity.combined(with: .move(edge: .bottom)))
      } else {
        progressBar
          .padding(.top, 4)
          .transition(.opacity.combined(with: .move(edge: .bottom)))
      }
    }
  }

  private var progressBar: some View {
    HStack(spacing: 10) {
      GeometryReader { geo in
        Capsule()
          .fill(Color.appBorderAdaptive)
          .overlay(alignment: .leading) {
            Capsule()
              .fill(achievement.color)
              .frame(width: max(geo.size.width * achievement.progress, 10))
          }
          .clipShape(Capsule())
      }
      .frame(height: 10)

      Text("\(achievement.current)/\(achievement.target)")
        .font(.system(size: 13, weight: .semibold).monospacedDigit())
        .foregroundColor(
          achievement.isComplete
            ? .appForegroundAdaptive
            : .appMutedForegroundAdaptive
        )
        .frame(minWidth: 38, alignment: .trailing)
    }
  }

  private var claimButton: some View {
    Button(action: onClaim) {
      HStack(spacing: 6) {
        Image(systemName: "gift")
          .font(.system(size: 13))
          .foregroundColor(.appForegroundAdaptive)

        Text(L10n.current.claimBadge)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.horizontal, 14)
      .padding(.vertical, 10)
      .background(Color.appInputFilled)
      .cornerRadius(10)
    }
    .buttonStyle(.plain)
  }
}
