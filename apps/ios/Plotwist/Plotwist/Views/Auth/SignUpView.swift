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
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 24) {
          Spacer()

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
                Group {
                  if showPassword {
                    TextField(strings.passwordPlaceholder, text: $password)
                  } else {
                    SecureField(strings.passwordPlaceholder, text: $password)
                  }
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

          Spacer()

          NavigationLink(destination: LoginView()) {
            Text("\(strings.alreadyHaveAccount) \(strings.accessNow)")
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          .padding(.bottom, 16)
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: 400)
      }
      .navigationBarHidden(true)
    }
    .sheet(isPresented: $showUsernameSheet) {
      UsernameSheetView(
        username: $username,
        email: email,
        password: password,
        onError: { self.error = $0 }
      )
      .presentationDetents([.height(320)])
      .presentationDragIndicator(.visible)
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
    VStack(spacing: 24) {
      VStack(spacing: 8) {
        Text(strings.selectUsername)
          .font(.system(size: 20, weight: .bold))
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
    .padding(24)
    .background(Color.appBackgroundAdaptive)
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
