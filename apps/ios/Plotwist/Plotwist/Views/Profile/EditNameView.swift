//
//  EditNameView.swift
//  Plotwist
//

import SwiftUI

struct EditNameView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var displayName: String
  @State private var isLoading = false
  @State private var error: String?

  let currentDisplayName: String?

  init(currentDisplayName: String?) {
    self.currentDisplayName = currentDisplayName
    _displayName = State(initialValue: currentDisplayName ?? "")
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    displayName != (currentDisplayName ?? "")
  }

  private var canSave: Bool {
    hasChanges
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        headerView
        contentView
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private var headerView: some View {
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

        Text(strings.name)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        saveButton
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private var saveButton: some View {
    Button {
      Task { await saveName() }
    } label: {
      if isLoading {
        ProgressView()
          .tint(.appBackgroundAdaptive)
          .frame(width: 40, height: 40)
          .background(Color.appForegroundAdaptive)
          .clipShape(Circle())
      } else {
        Image(systemName: "checkmark")
          .font(.system(size: 18, weight: .semibold))
          .foregroundColor(canSave ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
          .frame(width: 40, height: 40)
          .background(canSave ? Color.appForegroundAdaptive : Color.clear)
          .clipShape(Circle())
      }
    }
    .disabled(!canSave || isLoading)
  }

  private var contentView: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(strings.name)
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appMutedForegroundAdaptive)

      TextField(strings.onboardingNamePlaceholder, text: $displayName)
        .autocorrectionDisabled()
        .padding(12)
        .background(Color.appInputFilled)
        .cornerRadius(12)

      if let error {
        Text(error)
          .font(.caption)
          .foregroundColor(.appDestructive)
      }

      Spacer()
    }
    .padding(.horizontal, 24)
    .padding(.top, 24)
  }

  private func saveName() async {
    error = nil
    isLoading = true
    defer { isLoading = false }

    do {
      _ = try await AuthService.shared.updateUser(displayName: displayName)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      self.error = error.localizedDescription
    }
  }
}
