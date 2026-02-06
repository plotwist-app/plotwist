//
//  SocialLoginButton.swift
//  Plotwist
//

import SwiftUI

enum SocialProvider {
  case apple
  case google

  var icon: String {
    switch self {
    case .apple: return "apple.logo"
    case .google: return "g.circle.fill"
    }
  }

  var backgroundColor: Color {
    switch self {
    case .apple: return .black
    case .google: return .white
    }
  }

  var foregroundColor: Color {
    switch self {
    case .apple: return .white
    case .google: return .black
    }
  }
}

struct SocialLoginButton: View {
  let provider: SocialProvider
  let title: String
  let isLoading: Bool
  let isDisabled: Bool
  let action: () -> Void

  init(
    provider: SocialProvider,
    title: String,
    isLoading: Bool = false,
    isDisabled: Bool = false,
    action: @escaping () -> Void
  ) {
    self.provider = provider
    self.title = title
    self.isLoading = isLoading
    self.isDisabled = isDisabled
    self.action = action
  }

  var body: some View {
    Button(action: action) {
      HStack(spacing: 12) {
        if isLoading {
          ProgressView()
            .tint(provider.foregroundColor)
        } else {
          Image(systemName: provider.icon)
            .font(.system(size: 18, weight: .medium))
        }

        Text(title)
          .font(.system(size: 16, weight: .semibold))
      }
      .foregroundColor(provider.foregroundColor)
      .frame(maxWidth: .infinity)
      .frame(height: 52)
      .background(provider.backgroundColor)
      .clipShape(Capsule())
      .overlay(
        Capsule()
          .stroke(Color.appBorderAdaptive, lineWidth: provider == .google ? 1 : 0)
      )
    }
    .disabled(isLoading || isDisabled)
    .opacity(isLoading ? 0.7 : (isDisabled ? 0.4 : 1))
  }
}

// MARK: - Social Login Icon Button (compact, icon-only)
struct SocialLoginIconButton: View {
  let provider: SocialProvider
  let isLoading: Bool
  let isDisabled: Bool
  let action: () -> Void

  init(
    provider: SocialProvider,
    isLoading: Bool = false,
    isDisabled: Bool = false,
    action: @escaping () -> Void
  ) {
    self.provider = provider
    self.isLoading = isLoading
    self.isDisabled = isDisabled
    self.action = action
  }

  var body: some View {
    Button(action: action) {
      Group {
        if isLoading {
          ProgressView()
            .tint(provider.foregroundColor)
        } else {
          Image(systemName: provider.icon)
            .font(.system(size: 20, weight: .medium))
        }
      }
      .foregroundColor(provider.foregroundColor)
      .frame(maxWidth: .infinity)
      .frame(height: 52)
      .background(provider.backgroundColor)
      .clipShape(Capsule())
      .overlay(
        Capsule()
          .stroke(Color.appBorderAdaptive, lineWidth: provider == .google ? 1 : 0)
      )
    }
    .disabled(isLoading || isDisabled)
    .opacity(isLoading ? 0.7 : (isDisabled ? 0.4 : 1))
  }
}

#Preview {
  VStack(spacing: 12) {
    SocialLoginButton(provider: .apple, title: "Continue with Apple") {}
    SocialLoginButton(provider: .google, title: "Continue with Google", isDisabled: true) {}
    HStack(spacing: 12) {
      SocialLoginIconButton(provider: .apple) {}
      SocialLoginIconButton(provider: .google, isDisabled: true) {}
    }
  }
  .padding()
}
