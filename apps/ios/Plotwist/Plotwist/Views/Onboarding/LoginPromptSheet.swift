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
  @State private var isAppleLoading = false
  @State private var showError = false
  @State private var errorMessage = ""
  @ObservedObject private var themeManager = ThemeManager.shared
  
  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 24) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
        
        // Icon
        Image(systemName: "person.crop.circle")
          .font(.system(size: 48))
          .foregroundColor(.appForegroundAdaptive)
          .padding(.top, 8)
        
        // Content
        VStack(spacing: 8) {
          Text(strings.onboardingLoginTitle)
            .font(.title2.bold())
            .foregroundColor(.appForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          Text(strings.onboardingLoginSubtitle)
            .font(.body)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 16)
        
        // Login buttons
        VStack(spacing: 12) {
          // Apple Sign In
          SocialLoginButton(
            provider: .apple,
            title: strings.continueWithApple,
            isLoading: isAppleLoading
          ) {
            Task { await signInWithApple() }
          }
          
          // Google Sign In (disabled for now)
          SocialLoginButton(
            provider: .google,
            title: strings.continueWithGoogle,
            isLoading: false,
            isDisabled: true
          ) {
            // Google Sign-In disabled for now
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
        .padding(.bottom, 24)
      }
      .padding(.horizontal, 24)
    }
    .floatingSheetPresentation(height: 390)
    .preferredColorScheme(themeManager.current.colorScheme)
    .alert("Error", isPresented: $showError) {
      Button("OK", role: .cancel) {}
    } message: {
      Text(errorMessage)
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
