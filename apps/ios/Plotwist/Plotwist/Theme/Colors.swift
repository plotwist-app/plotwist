//
//  Colors.swift
//  Plotwist
//
//  Dark theme matched to web globals.css

import SwiftUI
import UIKit

extension Color {
  // MARK: - Hex Initializer
  init(hex: String) {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let a, r, g, b: UInt64
    switch hex.count {
    case 3: // RGB (12-bit)
      (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: // RGB (24-bit)
      (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
    case 8: // ARGB (32-bit)
      (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
    default:
      (a, r, g, b) = (1, 1, 1, 0)
    }
    self.init(
      .sRGB,
      red: Double(r) / 255,
      green: Double(g) / 255,
      blue: Double(b) / 255,
      opacity: Double(a) / 255
    )
  }

  // MARK: - Adaptive Colors (Light/Dark mode)

  // Dark: --background: 240 10% 3.9% (web)
  static var appBackgroundAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.10, brightness: 0.039, alpha: 1)
          : UIColor(hue: 0, saturation: 0, brightness: 1, alpha: 1)
      })
  }

  static var appForegroundAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 0, saturation: 0, brightness: 0.98, alpha: 1)
          : UIColor(hue: 240 / 360, saturation: 0.10, brightness: 0.039, alpha: 1)
      })
  }

  // Dark: --border: 240 3.7% 15.9% (web)
  static var appBorderAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.037, brightness: 0.159, alpha: 1)
          : UIColor(hue: 240 / 360, saturation: 0.059, brightness: 0.90, alpha: 1)
      })
  }

  // Dark: --muted-foreground: 240 5% 64.9% (web)
  static var appMutedForegroundAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.05, brightness: 0.649, alpha: 1)
          : UIColor(hue: 240 / 360, saturation: 0.038, brightness: 0.461, alpha: 1)
      })
  }

  // Dark: --secondary: 240 3.7% 15.9% (web)
  static var appInputFilled: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.037, brightness: 0.159, alpha: 1)
          : UIColor(red: 243 / 255, green: 244 / 255, blue: 246 / 255, alpha: 1)
      })
  }

  static let appDestructive = Color(hue: 0, saturation: 0.842, brightness: 0.602)

  // Star rating yellow - bright gold that works in both light and dark modes
  static let appStarYellow = Color(hex: "FBBF24")
}

// MARK: - Layered Shadow Modifier
extension View {
  /// Applies a smooth layered shadow effect similar to iOS app icons
  /// Based on the "Derek Briggs" shadow style with multiple stacked layers
  func posterShadow() -> some View {
    self
      // Base border shadow (spread: 1px simulated with small radius)
      .shadow(color: Color.black.opacity(0.05), radius: 0.5, x: 0, y: 0)
      // Layer 1: Y: 1px, Blur: 1px
      .shadow(color: Color.black.opacity(0.05), radius: 0.5, x: 0, y: 1)
      // Layer 2: Y: 2px, Blur: 2px
      .shadow(color: Color.black.opacity(0.05), radius: 1, x: 0, y: 2)
      // Layer 3: Y: 4px, Blur: 4px
      .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 4)
      // Layer 4: Y: 8px, Blur: 8px
      .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 8)
      // Layer 5: Y: 16px, Blur: 16px
      .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 16)
  }

  /// Applies a subtle border to poster cards (dark mode only)
  func posterBorder(cornerRadius: CGFloat = 16) -> some View {
    self.modifier(PosterBorderModifier(cornerRadius: cornerRadius))
  }

  /// Applies a border with custom top corners only (dark mode only)
  func topRoundedBorder(cornerRadius: CGFloat) -> some View {
    self.modifier(TopRoundedBorderModifier(cornerRadius: cornerRadius))
  }
}

// MARK: - Border Modifiers (Dark Mode Only)
struct PosterBorderModifier: ViewModifier {
  let cornerRadius: CGFloat
  @Environment(\.colorScheme) var colorScheme

  func body(content: Content) -> some View {
    content.overlay(
      RoundedRectangle(cornerRadius: cornerRadius)
        .strokeBorder(
          colorScheme == .dark ? Color.appBorderAdaptive : Color.clear,
          lineWidth: 1
        )
    )
  }
}

struct TopRoundedBorderModifier: ViewModifier {
  let cornerRadius: CGFloat
  @Environment(\.colorScheme) var colorScheme

  func body(content: Content) -> some View {
    content.overlay(
      TopEdgeShape(cornerRadius: cornerRadius)
        .stroke(
          colorScheme == .dark ? Color.appBorderAdaptive : Color.clear,
          lineWidth: 1
        )
    )
  }
}

// MARK: - Custom Shape for Top Edge Only (with rounded corners)
struct TopEdgeShape: Shape {
  var cornerRadius: CGFloat

  func path(in rect: CGRect) -> Path {
    var path = Path()

    // Start from bottom-left, go up to the curve start
    path.move(to: CGPoint(x: 0, y: cornerRadius))

    // Top-left corner curve
    path.addArc(
      center: CGPoint(x: cornerRadius, y: cornerRadius),
      radius: cornerRadius,
      startAngle: .degrees(180),
      endAngle: .degrees(270),
      clockwise: false
    )

    // Top edge
    path.addLine(to: CGPoint(x: rect.width - cornerRadius, y: 0))

    // Top-right corner curve
    path.addArc(
      center: CGPoint(x: rect.width - cornerRadius, y: cornerRadius),
      radius: cornerRadius,
      startAngle: .degrees(270),
      endAngle: .degrees(0),
      clockwise: false
    )

    return path
  }
}
