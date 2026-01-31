//
//  EditBiographyView.swift
//  Plotwist
//

import SwiftUI

struct EditBiographyView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var biography: String
  @State private var isLoading = false
  @State private var error: String?

  let currentBiography: String?

  init(currentBiography: String?) {
    self.currentBiography = currentBiography
    _biography = State(initialValue: currentBiography ?? "")
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    biography != (currentBiography ?? "")
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

        Text(strings.biography)
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
      Task { await saveBiography() }
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
      Text(strings.biography)
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appMutedForegroundAdaptive)

      TextEditor(text: $biography)
        .frame(minHeight: 120, maxHeight: 200)
        .padding(12)
        .multilineTextAlignment(.leading)
        .scrollContentBackground(.hidden)
        .background(Color.appInputFilled)
        .cornerRadius(12)
        .overlay(
          Group {
            if biography.isEmpty {
              Text(strings.biographyPlaceholder)
                .font(.body)
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 16)
                .padding(.vertical, 20)
                .allowsHitTesting(false)
            }
          },
          alignment: .topLeading
        )

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

  private func saveBiography() async {
    error = nil
    isLoading = true
    defer { isLoading = false }

    do {
      _ = try await AuthService.shared.updateUser(biography: biography)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      self.error = error.localizedDescription
    }
  }
}
