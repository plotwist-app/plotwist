//
//  PrimaryButton.swift
//  Plotwist
//

import SwiftUI

enum ButtonVariant {
  case filled
  case outline
}

struct PrimaryButton: View {
  let title: String
  let variant: ButtonVariant
  let isLoading: Bool
  let isDisabled: Bool
  let action: () -> Void

  init(
    _ title: String, variant: ButtonVariant = .outline, isLoading: Bool = false,
    isDisabled: Bool = false, action: @escaping () -> Void
  ) {
    self.title = title
    self.variant = variant
    self.isLoading = isLoading
    self.isDisabled = isDisabled
    self.action = action
  }

  var body: some View {
    Button(action: action) {
      Group {
        if isLoading {
          ProgressView().tint(variant == .filled ? .appBackgroundAdaptive : .appForegroundAdaptive)
        } else {
          Text(title)
            .fontWeight(.semibold)
        }
      }
      .frame(maxWidth: .infinity)
      .frame(height: 48)
      .background(variant == .filled ? Color.appForegroundAdaptive : Color.clear)
      .foregroundColor(variant == .filled ? .appBackgroundAdaptive : .appForegroundAdaptive)
      .cornerRadius(12)
      .overlay(
        RoundedRectangle(cornerRadius: 12)
          .stroke(variant == .filled ? Color.clear : Color.appBorderAdaptive, lineWidth: 1)
      )
    }
    .disabled(isLoading || isDisabled)
    .opacity(isDisabled ? 0.5 : 1)
  }
}

struct SocialButton: View {
  let icon: String
  let title: String
  let isDisabled: Bool
  let action: () -> Void

  init(_ title: String, icon: String, isDisabled: Bool = false, action: @escaping () -> Void) {
    self.title = title
    self.icon = icon
    self.isDisabled = isDisabled
    self.action = action
  }

  var body: some View {
    Button(action: action) {
      HStack(spacing: 8) {
        Image(systemName: icon)
        Text(title)
          .fontWeight(.medium)
      }
      .frame(maxWidth: .infinity)
      .frame(height: 48)
      .background(Color.clear)
      .foregroundColor(.appForegroundAdaptive)
      .overlay(
        RoundedRectangle(cornerRadius: 12)
          .stroke(Color.appBorderAdaptive, lineWidth: 1)
      )
    }
    .disabled(isDisabled)
    .opacity(isDisabled ? 0.5 : 1)
  }
}

struct ActionButton: View {
  let title: String
  let icon: String
  let iconColor: Color?
  let action: () -> Void

  init(
    _ title: String,
    icon: String,
    iconColor: Color? = nil,
    action: @escaping () -> Void
  ) {
    self.title = title
    self.icon = icon
    self.iconColor = iconColor
    self.action = action
  }

  var body: some View {
    Button(action: action) {
      HStack(spacing: 6) {
        Image(systemName: icon)
          .font(.system(size: 13))
          .foregroundColor(iconColor ?? .appForegroundAdaptive)

        Text(title)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.horizontal, 14)
      .padding(.vertical, 10)
      .background(Color.appInputFilled)
      .cornerRadius(10)
    }
  }
}

#Preview {
  VStack(spacing: 16) {
    PrimaryButton("Access", variant: .filled) {}
    PrimaryButton("Outline") {}
    PrimaryButton("Loading", variant: .filled, isLoading: true) {}
    PrimaryButton("Disabled", isDisabled: true) {}
    SocialButton("Continue with Google", icon: "globe") {}
    SocialButton("Continue with Apple", icon: "apple.logo", isDisabled: true) {}

    HStack {
      ActionButton("Review", icon: "star") {}
      ActionButton("Reviewed", icon: "star.fill", iconColor: .yellow) {}
      Spacer()
    }
  }
  .padding()
}
