//
//  EditBadgesView.swift
//  Plotwist
//

import SwiftUI

struct EditBadgesView: View {
  @Binding var achievements: [Achievement]
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var colorScheme

  private var claimedBadges: [Achievement] {
    achievements.filter { $0.isClaimed }
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        header

        ScrollView(showsIndicators: false) {
          LazyVGrid(
            columns: [
              GridItem(.flexible(), spacing: 12),
              GridItem(.flexible(), spacing: 12)
            ],
            spacing: 12
          ) {
            ForEach(claimedBadges) { badge in
              badgeCard(badge)
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 16)
          .padding(.bottom, 40)
        }
      }
    }
    .navigationBarHidden(true)
  }

  private var header: some View {
    VStack(spacing: 0) {
      HStack {
        Button { dismiss() } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 40, height: 40)
            .background(Color.appInputFilled)
            .clipShape(Circle())
        }

        Spacer()

        Text(L10n.current.badges)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        Color.clear.frame(width: 40, height: 40)
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private func badgeCard(_ badge: Achievement) -> some View {
    Button {
      toggleEquip(id: badge.id)
    } label: {
      VStack(spacing: 0) {
        AchievementIconView(achievement: badge, size: 64)
          .padding(.top, 20)
          .padding(.bottom, 12)

        Text(badge.name)
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
          .lineLimit(2)
          .padding(.horizontal, 14)

        Spacer(minLength: 8)

        Image(systemName: badge.isEquipped ? "checkmark.circle.fill" : "circle")
          .font(.system(size: 22))
          .foregroundColor(
            badge.isEquipped
              ? .appForegroundAdaptive
              : .appBorderAdaptive
          )
          .padding(.bottom, 16)
      }
      .frame(maxWidth: .infinity)
      .frame(minHeight: 150)
      .background(Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
      .opacity(badge.isEquipped ? 1 : 0.45)
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
  }

  private func toggleEquip(id: String) {
    guard let index = achievements.firstIndex(where: { $0.id == id }),
          let remoteId = achievements[index].remoteId else { return }
    let newEquipped = !achievements[index].isEquipped

    Haptics.selection()
    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
      achievements[index].isEquipped = newEquipped
    }

    Task {
      do {
        _ = try await AchievementService.shared.toggleEquip(id: remoteId, isEquipped: newEquipped)
      } catch {
        withAnimation {
          achievements[index].isEquipped = !newEquipped
        }
      }
    }
  }
}
