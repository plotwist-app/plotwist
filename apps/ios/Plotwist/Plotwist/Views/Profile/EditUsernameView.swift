//
//  EditUsernameView.swift
//  Plotwist
//

import SwiftUI

struct EditUsernameView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var username: String
  @State private var isLoading = false
  @State private var isCheckingAvailability = false
  @State private var isAvailable: Bool?
  @State private var error: String?
  @State private var checkTask: Task<Void, Never>?

  let currentUsername: String

  init(currentUsername: String) {
    self.currentUsername = currentUsername
    _username = State(initialValue: currentUsername)
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    username != currentUsername && !username.isEmpty
  }

  private var canSave: Bool {
    hasChanges && isAvailable == true && !isCheckingAvailability
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

        Text(strings.username)
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
      Task { await saveUsername() }
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
      Text(strings.username)
        .font(.subheadline.weight(.medium))
        .foregroundColor(.appMutedForegroundAdaptive)

      HStack(spacing: 0) {
        TextField(strings.usernamePlaceholder, text: $username)
          .textInputAutocapitalization(.never)
          .autocorrectionDisabled()
          .onChange(of: username) { newValue in
            checkUsernameAvailability(newValue)
          }

        if hasChanges {
          if isCheckingAvailability {
            ProgressView()
              .frame(width: 20, height: 20)
          } else if isAvailable == false {
            Image(systemName: "xmark.circle.fill")
              .font(.system(size: 20))
              .foregroundColor(.appDestructive)
          }
        }
      }
      .padding(12)
      .background(Color.appInputFilled)
      .cornerRadius(12)

      if let error {
        Text(error)
          .font(.caption)
          .foregroundColor(.appDestructive)
      } else if hasChanges && isAvailable == false && !isCheckingAvailability {
        Text(strings.usernameAlreadyTaken)
          .font(.caption)
          .foregroundColor(.appDestructive)
      }

      Spacer()
    }
    .padding(.horizontal, 24)
    .padding(.top, 24)
  }

  private func checkUsernameAvailability(_ newUsername: String) {
    checkTask?.cancel()
    error = nil
    isAvailable = nil

    guard newUsername != currentUsername, !newUsername.isEmpty else {
      isCheckingAvailability = false
      return
    }

    isCheckingAvailability = true

    checkTask = Task {
      try? await Task.sleep(nanoseconds: 500_000_000)

      guard !Task.isCancelled else { return }

      do {
        let available = try await AuthService.shared.isUsernameAvailable(newUsername)
        await MainActor.run {
          guard !Task.isCancelled else { return }
          isAvailable = available
          isCheckingAvailability = false
        }
      } catch {
        await MainActor.run {
          guard !Task.isCancelled else { return }
          isCheckingAvailability = false
        }
      }
    }
  }

  private func saveUsername() async {
    error = nil
    isLoading = true
    defer { isLoading = false }

    do {
      _ = try await AuthService.shared.updateUser(username: username)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch AuthError.alreadyExists {
      error = strings.usernameAlreadyTaken
      isAvailable = false
    } catch {
      self.error = error.localizedDescription
    }
  }
}
