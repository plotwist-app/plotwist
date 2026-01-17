//
//  LoginView.swift
//  Plotwist
//

import SwiftUI

struct LoginView: View {
  @State private var login = ""
  @State private var password = ""
  @State private var showPassword = false
  @State private var isLoading = false
  @State private var error: String?
  @State private var strings = L10n.current

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          // Language Switcher at top (centered)
          Menu {
            ForEach(Language.allCases, id: \.self) { lang in
              Button {
                Language.current = lang
              } label: {
                HStack {
                  Text(lang.displayName)
                  if Language.current == lang {
                    Image(systemName: "checkmark")
                  }
                }
              }
            }
          } label: {
            HStack(spacing: 6) {
              Image(systemName: "globe")
              Text(Language.current.displayName)
                .font(.subheadline)
            }
            .foregroundColor(.appMutedForegroundAdaptive)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color.clear)
            .overlay(
              RoundedRectangle(cornerRadius: 12)
                .stroke(Color.appBorderAdaptive, lineWidth: 1)
            )
          }
          .padding(.top, 16)

          Spacer()

          // Centered form content
          VStack(spacing: 16) {
            // Login Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.loginLabel)
                .font(.subheadline.weight(.medium))
              TextField(strings.loginPlaceholder, text: $login)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(12)
                .background(Color.clear)
                .overlay(
                  RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.appBorderAdaptive, lineWidth: 1)
                )
            }

            // Password Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.passwordLabel)
                .font(.subheadline.weight(.medium))
              HStack(spacing: 8) {
                ZStack {
                  TextField(strings.passwordPlaceholder, text: $password)
                    .opacity(showPassword ? 1 : 0)
                  SecureField(strings.passwordPlaceholder, text: $password)
                    .opacity(showPassword ? 0 : 1)
                }
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(12)
                .background(Color.clear)
                .overlay(
                  RoundedRectangle(cornerRadius: 12)
                    .stroke(Color.appBorderAdaptive, lineWidth: 1)
                )

                Button {
                  showPassword.toggle()
                } label: {
                  Image(systemName: showPassword ? "eye" : "eye.slash")
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .frame(width: 48, height: 48)
                    .background(Color.clear)
                    .overlay(
                      RoundedRectangle(cornerRadius: 12)
                        .stroke(Color.appBorderAdaptive, lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
              }
            }

            if let error {
              Text(error)
                .font(.caption)
                .foregroundColor(.appDestructive)
            }

            PrimaryButton(strings.accessButton, variant: .filled, isLoading: isLoading) {
              Task { await performLogin() }
            }

            // Divider
            HStack {
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
              Text(strings.or)
                .font(.caption)
                .foregroundColor(.appMutedForegroundAdaptive)
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
            }

            // Social Login Buttons (disabled)
            SocialButton(strings.continueWithGoogle, icon: "globe", isDisabled: true) {}
            SocialButton(strings.continueWithApple, icon: "apple.logo", isDisabled: true) {}
          }
          .padding(.horizontal, 24)
          .frame(maxWidth: 400)

          Spacer()

          // Bottom link
          NavigationLink(destination: SignUpView()) {
            Text("\(strings.doNotHaveAccount) \(strings.createNow)")
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          .padding(.bottom, 32)
        }
      }
      .navigationBarHidden(true)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func performLogin() async {
    error = nil

    guard !login.isEmpty else {
      error = strings.loginRequired
      return
    }
    guard password.count >= 8 else {
      error = strings.passwordLength
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      _ = try await AuthService.shared.signIn(login: login, password: password)
    } catch {
      self.error = strings.invalidCredentials
    }
  }
}

#Preview {
  LoginView()
}
