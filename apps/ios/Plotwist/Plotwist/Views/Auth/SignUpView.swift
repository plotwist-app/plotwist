//
//  SignUpView.swift
//  Plotwist
//

import SwiftUI

struct SignUpView: View {
  @Environment(\.dismiss) private var dismiss
  @State private var email = ""
  @State private var password = ""
  @State private var username = ""
  @State private var showPassword = false
  @State private var isLoading = false
  @State private var error: String?
  @State private var showUsernameSheet = false
  @State private var strings = L10n.current

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header with back button (same as CategoryListView)
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
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)

        Spacer()

        // Centered form content
        VStack(spacing: 24) {
          // Header
          VStack(spacing: 8) {
            Text(strings.startNow)
              .font(.system(size: 24, weight: .bold))
            Text(strings.startYourJourney)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .multilineTextAlignment(.center)
          }

          VStack(spacing: 16) {
            // Email Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.emailLabel)
                .font(.subheadline.weight(.medium))
              TextField(strings.emailPlaceholder, text: $email)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .keyboardType(.emailAddress)
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

            PrimaryButton(strings.continueButton, variant: .filled, isLoading: isLoading) {
              Task { await checkEmailAndContinue() }
            }
          }
        }
        .padding(.horizontal, 24)

        Spacer()

        // Bottom link
        Button {
          dismiss()
        } label: {
          Text("\(strings.alreadyHaveAccount) \(strings.accessNow)")
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.bottom, 32)
      }
    }
    .navigationBarHidden(true)
    .sheet(isPresented: $showUsernameSheet) {
      UsernameSheetView(
        username: $username,
        email: email,
        password: password,
        onError: { self.error = $0 }
      )
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func checkEmailAndContinue() async {
    error = nil

    // Validate email
    guard !email.isEmpty else {
      error = strings.emailRequired
      return
    }
    guard email.contains("@") && email.contains(".") else {
      error = strings.emailInvalid
      return
    }

    // Validate password
    guard password.count >= 8 else {
      error = strings.passwordLength
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      let available = try await AuthService.shared.checkEmailAvailable(email: email)
      if available {
        showUsernameSheet = true
      } else {
        error = strings.emailAlreadyTaken
      }
    } catch {
      self.error = strings.emailAlreadyTaken
    }
  }
}

// MARK: - Username Sheet
struct UsernameSheetView: View {
  @Environment(\.dismiss) private var dismiss
  @Binding var username: String
  let email: String
  let password: String
  let onError: (String) -> Void

  @State private var isLoading = false
  @State private var error: String?
  @State private var strings = L10n.current

  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 0) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
          .padding(.bottom, 16)

        VStack(spacing: 24) {
          VStack(spacing: 8) {
            Text(strings.selectUsername)
              .font(.system(size: 20, weight: .bold))
              .foregroundColor(.appForegroundAdaptive)
            Text(strings.selectUsernameDescription)
              .font(.subheadline)
              .foregroundColor(.appMutedForegroundAdaptive)
              .multilineTextAlignment(.center)
          }

          VStack(spacing: 16) {
            TextField(strings.usernamePlaceholder, text: $username)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .padding(12)
              .background(Color.clear)
              .overlay(
                RoundedRectangle(cornerRadius: 12)
                  .stroke(Color.appBorderAdaptive, lineWidth: 1)
              )

            if let error {
              Text(error)
                .font(.caption)
                .foregroundColor(.appDestructive)
            }

            PrimaryButton(strings.finishSignUp, variant: .filled, isLoading: isLoading) {
              Task { await checkUsernameAndFinish() }
            }
          }
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 24)
      }
    }
    .floatingSheetPresentation(height: 320)
  }

  private func checkUsernameAndFinish() async {
    error = nil

    guard !username.isEmpty else {
      error = strings.usernameRequired
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      let available = try await AuthService.shared.checkUsernameAvailable(username: username)
      if available {
        try await AuthService.shared.signUp(email: email, password: password, username: username)
        dismiss()
      } else {
        error = strings.usernameAlreadyTaken
      }
    } catch AuthError.alreadyExists {
      error = strings.usernameAlreadyTaken
    } catch {
      onError(strings.invalidCredentials)
      dismiss()
    }
  }
}

#Preview {
  SignUpView()
}
