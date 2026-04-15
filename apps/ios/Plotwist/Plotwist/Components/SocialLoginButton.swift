//
//  SocialLoginButton.swift
//  Plotwist
//

import SwiftUI

enum SocialProvider {
  case apple
  case google

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

// MARK: - Google Logo (official SVG paths)
struct GoogleLogo: View {
  let size: CGFloat
  
  // Original SVG viewBox: -3 0 262 262
  private let viewBoxWidth: CGFloat = 262
  private let viewBoxHeight: CGFloat = 262
  private let viewBoxOffsetX: CGFloat = -3
  
  var body: some View {
    Canvas { context, canvasSize in
      let scale = min(canvasSize.width / viewBoxWidth, canvasSize.height / viewBoxHeight)
      let offsetX = (canvasSize.width - viewBoxWidth * scale) / 2 - viewBoxOffsetX * scale
      let offsetY = (canvasSize.height - viewBoxHeight * scale) / 2
      
      let transform = CGAffineTransform(translationX: offsetX, y: offsetY)
        .scaledBy(x: scale, y: scale)
      
      // Blue
      var blue = Path()
      blue.move(to: CGPoint(x: 255.878, y: 133.451))
      blue.addCurve(to: CGPoint(x: 253.122, y: 106.761), control1: CGPoint(x: 255.878, y: 122.717), control2: CGPoint(x: 255.007, y: 114.884))
      blue.addLine(to: CGPoint(x: 130.55, y: 106.761))
      blue.addLine(to: CGPoint(x: 130.55, y: 155.209))
      blue.addLine(to: CGPoint(x: 202.497, y: 155.209))
      blue.addCurve(to: CGPoint(x: 175.807, y: 197.565), control1: CGPoint(x: 201.047, y: 167.249), control2: CGPoint(x: 193.214, y: 185.381))
      blue.addLine(to: CGPoint(x: 175.563, y: 199.187))
      blue.addLine(to: CGPoint(x: 214.318, y: 229.21))
      blue.addLine(to: CGPoint(x: 217.003, y: 229.478))
      blue.addCurve(to: CGPoint(x: 255.878, y: 133.451), control1: CGPoint(x: 241.662, y: 206.704), control2: CGPoint(x: 255.878, y: 173.196))
      blue.closeSubpath()
      context.fill(Path(blue.cgPath.copy(using: [transform])!), with: .color(Color(hex: "4285F4")))
      
      // Green
      var green = Path()
      green.move(to: CGPoint(x: 130.55, y: 261.1))
      green.addCurve(to: CGPoint(x: 217.003, y: 229.478), control1: CGPoint(x: 165.798, y: 261.1), control2: CGPoint(x: 195.389, y: 249.495))
      green.addLine(to: CGPoint(x: 175.807, y: 197.565))
      green.addCurve(to: CGPoint(x: 130.55, y: 210.62), control1: CGPoint(x: 164.783, y: 205.253), control2: CGPoint(x: 155.987, y: 210.62))
      green.addCurve(to: CGPoint(x: 56.281, y: 156.37), control1: CGPoint(x: 96.027, y: 210.62), control2: CGPoint(x: 66.726, y: 187.847))
      green.addLine(to: CGPoint(x: 54.75, y: 156.5))
      green.addLine(to: CGPoint(x: 14.452, y: 187.687))
      green.addLine(to: CGPoint(x: 13.925, y: 189.152))
      green.addCurve(to: CGPoint(x: 130.55, y: 261.1), control1: CGPoint(x: 35.393, y: 231.798), control2: CGPoint(x: 79.49, y: 261.1))
      green.closeSubpath()
      context.fill(Path(green.cgPath.copy(using: [transform])!), with: .color(Color(hex: "34A853")))
      
      // Yellow
      var yellow = Path()
      yellow.move(to: CGPoint(x: 56.281, y: 156.37))
      yellow.addCurve(to: CGPoint(x: 51.93, y: 130.55), control1: CGPoint(x: 53.525, y: 148.247), control2: CGPoint(x: 51.93, y: 139.543))
      yellow.addCurve(to: CGPoint(x: 56.136, y: 104.73), control1: CGPoint(x: 51.93, y: 121.556), control2: CGPoint(x: 53.525, y: 112.853))
      yellow.addLine(to: CGPoint(x: 56.063, y: 103.0))
      yellow.addLine(to: CGPoint(x: 15.26, y: 71.312))
      yellow.addLine(to: CGPoint(x: 13.925, y: 71.947))
      yellow.addCurve(to: CGPoint(x: 0, y: 130.55), control1: CGPoint(x: 5.077, y: 89.644), control2: CGPoint(x: 0, y: 109.517))
      yellow.addCurve(to: CGPoint(x: 13.925, y: 189.152), control1: CGPoint(x: 0, y: 151.583), control2: CGPoint(x: 5.077, y: 171.455))
      yellow.addLine(to: CGPoint(x: 56.281, y: 156.37))
      yellow.closeSubpath()
      context.fill(Path(yellow.cgPath.copy(using: [transform])!), with: .color(Color(hex: "FBBC05")))
      
      // Red
      var red = Path()
      red.move(to: CGPoint(x: 130.55, y: 50.479))
      red.addCurve(to: CGPoint(x: 181.029, y: 69.917), control1: CGPoint(x: 155.064, y: 50.479), control2: CGPoint(x: 171.6, y: 61.068))
      red.addLine(to: CGPoint(x: 217.873, y: 33.943))
      red.addCurve(to: CGPoint(x: 130.55, y: 0), control1: CGPoint(x: 195.245, y: 12.91), control2: CGPoint(x: 165.798, y: 0))
      red.addCurve(to: CGPoint(x: 13.925, y: 71.947), control1: CGPoint(x: 79.49, y: 0), control2: CGPoint(x: 35.393, y: 29.301))
      red.addLine(to: CGPoint(x: 56.136, y: 104.73))
      red.addCurve(to: CGPoint(x: 130.55, y: 50.479), control1: CGPoint(x: 66.726, y: 73.253), control2: CGPoint(x: 96.027, y: 50.479))
      red.closeSubpath()
      context.fill(Path(red.cgPath.copy(using: [transform])!), with: .color(Color(hex: "EB4335")))
    }
    .frame(width: size, height: size)
  }
}

// MARK: - Provider Icon View
@ViewBuilder
private func providerIcon(for provider: SocialProvider, size: CGFloat) -> some View {
  switch provider {
  case .apple:
    Image(systemName: "apple.logo")
      .font(.system(size: size, weight: .medium))
  case .google:
    GoogleLogo(size: size)
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
          providerIcon(for: provider, size: 18)
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
          providerIcon(for: provider, size: 20)
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
