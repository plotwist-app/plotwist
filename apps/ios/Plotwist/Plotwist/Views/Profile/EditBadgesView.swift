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
          VStack(spacing: 0) {
            ForEach(Array(claimedBadges.enumerated()), id: \.element.id) { index, badge in
              badgeRow(badge)

              if index < claimedBadges.count - 1 {
                Divider()
                  .padding(.leading, 108)
                  .padding(.trailing, 24)
              }
            }
          }
          .padding(.top, 8)
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

  private func badgeRow(_ badge: Achievement) -> some View {
    Button {
      toggleEquip(id: badge.id)
    } label: {
      HStack(spacing: 16) {
        ZStack {
          RoundedRectangle(cornerRadius: 18, style: .continuous)
            .fill(badge.color.opacity(colorScheme == .dark ? 0.08 : 0.07))
            .frame(width: 68, height: 80)
            .overlay(
              RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(
                  badge.color.opacity(colorScheme == .dark ? 0.2 : 0.15),
                  lineWidth: 1
                )
            )

          Image(systemName: badge.icon)
            .font(.system(size: 30, weight: .medium))
            .symbolRenderingMode(.hierarchical)
            .foregroundStyle(badge.color)
        }
        .frame(width: 68, height: 80)

        VStack(alignment: .leading, spacing: 4) {
          Text(badge.name)
            .font(.body.weight(.semibold))
            .foregroundColor(.appForegroundAdaptive)

          Text(badge.description)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(2)
        }

        Spacer(minLength: 0)

        Image(systemName: badge.isEquipped ? "checkmark.circle.fill" : "circle")
          .font(.system(size: 24))
          .foregroundColor(
            badge.isEquipped
              ? badge.color
              : .appBorderAdaptive
          )
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 20)
      .opacity(badge.isEquipped ? 1 : 0.45)
      .contentShape(Rectangle())
    }
    .buttonStyle(.plain)
  }

  private func toggleEquip(id: String) {
    guard let index = achievements.firstIndex(where: { $0.id == id }) else { return }
    Haptics.selection()
    withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
      achievements[index].isEquipped.toggle()
    }
  }
}
