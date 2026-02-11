//
//  LoginPromptSheet.swift
//  Plotwist
//
//  Contextual login prompt shown after valuable actions

import SwiftUI

struct LoginPromptSheet: View {
  let onLogin: () -> Void
  let onSkip: () -> Void
  @State private var strings = L10n.current
  @State private var login = ""
  @State private var password = ""
  @State private var username = ""
  @State private var displayName = ""
  @State private var showPassword = false
  @State private var isLoading = false
  @State private var isAppleLoading = false
  @State private var showError = false
  @State private var errorMessage = ""
  @State private var error: String?
  @State private var showUsernameStep = false
  @ObservedObject private var themeManager = ThemeManager.shared
  
  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 16) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 8)
        
        // Content
        VStack(spacing: 8) {
          Text(showUsernameStep ? strings.selectUsername : strings.onboardingLoginTitle)
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          Text(showUsernameStep ? strings.selectUsernameDescription : strings.onboardingLoginSubtitle)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.horizontal, 16)
        
        if showUsernameStep {
          // Name & Username Step
          VStack(spacing: 16) {
            // Name Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.name)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
              TextField(strings.onboardingNamePlaceholder, text: $displayName)
                .autocorrectionDisabled()
                .padding(12)
                .background(Color.appInputFilled)
                .cornerRadius(12)
            }
            
            // Username Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.username)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
              TextField(strings.usernamePlaceholder, text: $username)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(12)
                .background(Color.appInputFilled)
                .cornerRadius(12)
            }
            
            if let error {
              Text(error)
                .font(.caption)
                .foregroundColor(.appDestructive)
            }
            
            // Submit Button
            Button(action: { Task { await finishSignUp() } }) {
              Group {
                if isLoading {
                  ProgressView()
                    .tint(.appBackgroundAdaptive)
                } else {
                  Text(strings.finishSignUp)
                    .fontWeight(.semibold)
                }
              }
              .frame(maxWidth: .infinity)
              .frame(height: 48)
              .background(Color.appForegroundAdaptive)
              .foregroundColor(.appBackgroundAdaptive)
              .clipShape(Capsule())
            }
            .disabled(isLoading)
            .opacity(isLoading ? 0.5 : 1)
          }
          .onAppear {
            if displayName.isEmpty {
              displayName = OnboardingService.shared.userName
            }
          }
        } else {
          VStack(spacing: 16) {
            // Social Login Icons
            HStack(spacing: 12) {
              SocialLoginIconButton(
                provider: .apple,
                isLoading: isAppleLoading
              ) {
                Task { await signInWithApple() }
              }
              
              SocialLoginIconButton(
                provider: .google,
                isLoading: false,
                isDisabled: true
              ) {
                // Google Sign-In disabled for now
              }
            }
            
            // Divider with "or"
            HStack {
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
              Text(strings.or)
                .font(.caption)
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 12)
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
            }
            
            // Login Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.loginLabel)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
              TextField(strings.loginPlaceholder, text: $login)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(12)
                .background(Color.appInputFilled)
                .cornerRadius(12)
            }
            
            // Password Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.passwordLabel)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
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
                .background(Color.appInputFilled)
                .cornerRadius(12)
                
                Button {
                  showPassword.toggle()
                } label: {
                  Image(systemName: showPassword ? "eye" : "eye.slash")
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .frame(width: 48, height: 48)
                    .background(Color.appInputFilled)
                    .cornerRadius(12)
                }
                .buttonStyle(.plain)
              }
            }
            
            if let error {
              Text(error)
                .font(.caption)
                .foregroundColor(.appDestructive)
            }
            
            // Submit Button
            Button(action: { Task { await performLogin() } }) {
              Group {
                if isLoading {
                  ProgressView()
                    .tint(.appBackgroundAdaptive)
                } else {
                  Text(strings.accessButton)
                    .fontWeight(.semibold)
                }
              }
              .frame(maxWidth: .infinity)
              .frame(height: 48)
              .background(Color.appForegroundAdaptive)
              .foregroundColor(.appBackgroundAdaptive)
              .clipShape(Capsule())
            }
            .disabled(isLoading || isAppleLoading)
            .opacity(isLoading ? 0.5 : 1)
          }
        }
        
        // Skip button
        Button(action: {
          OnboardingService.shared.hasSeenLoginPrompt = true
          onSkip()
        }) {
          Text(strings.onboardingNotNow)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.bottom, 4)
      }
      .padding(.horizontal, 24)
    }
    .floatingSheetDynamicPresentation()
    .preferredColorScheme(themeManager.current.colorScheme)
    .alert("Error", isPresented: $showError) {
      Button("OK", role: .cancel) {}
    } message: {
      Text(errorMessage)
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
      AnalyticsService.shared.track(.login(method: "email"))
      
      // Sync local data to server
      await OnboardingService.shared.syncLocalDataToServer()
      
      OnboardingService.shared.hasSeenLoginPrompt = true
      onLogin()
    } catch {
      // If login looks like an email, check if it's a new account
      let isEmail = login.contains("@") && login.contains(".")
      if isEmail {
        do {
          let available = try await AuthService.shared.checkEmailAvailable(email: login)
          if available {
            // Email not registered — transition to sign-up (username step)
            withAnimation {
              showUsernameStep = true
            }
            return
          }
        } catch {
          // If check fails, fall through to show generic error
        }
      }
      self.error = strings.invalidCredentials
    }
  }
  
  private func finishSignUp() async {
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
        try await AuthService.shared.signUp(
          email: login,
          password: password,
          username: username,
          displayName: displayName.isEmpty ? nil : displayName
        )
        AnalyticsService.shared.track(.signUp(method: "email"))
        
        // Sync local data to server
        await OnboardingService.shared.syncLocalDataToServer()
        
        OnboardingService.shared.hasSeenLoginPrompt = true
        onLogin()
      } else {
        error = strings.usernameAlreadyTaken
      }
    } catch AuthError.alreadyExists {
      error = strings.usernameAlreadyTaken
    } catch {
      self.error = strings.invalidCredentials
    }
  }
  
  private func signInWithApple() async {
    isAppleLoading = true
    defer { isAppleLoading = false }
    
    do {
      let response = try await SocialAuthService.shared.signInWithApple()
      
      // Track sign up or login based on backend response
      if response.isNewUser {
        AnalyticsService.shared.track(.signUp(method: "apple"))
      } else {
        AnalyticsService.shared.track(.login(method: "apple"))
      }
      
      // Sync local data to server
      await OnboardingService.shared.syncLocalDataToServer()
      
      OnboardingService.shared.hasSeenLoginPrompt = true
      onLogin()
    } catch {
      errorMessage = error.localizedDescription
      showError = true
    }
  }
}

// MARK: - Login Prompt Modifier
struct LoginPromptModifier: ViewModifier {
  @Binding var showLoginPrompt: Bool
  let onLogin: () -> Void
  
  func body(content: Content) -> some View {
    content
      .sheet(isPresented: $showLoginPrompt) {
        LoginPromptSheet(
          onLogin: {
            showLoginPrompt = false
            onLogin()
          },
          onSkip: {
            showLoginPrompt = false
          }
        )
      }
  }
}

extension View {
  func loginPrompt(isPresented: Binding<Bool>, onLogin: @escaping () -> Void) -> some View {
    modifier(LoginPromptModifier(showLoginPrompt: isPresented, onLogin: onLogin))
  }
}

#Preview {
  LoginPromptSheet(onLogin: {}, onSkip: {})
}
