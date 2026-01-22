//
//  Colors.swift
//  Plotwist
//
//  Dark theme matched to web globals.css

import SwiftUI

extension Color {
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

  // Dark skeleton slightly lighter than input
  static var appSkeletonAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.037, brightness: 0.20, alpha: 1)
          : UIColor(red: 229 / 255, green: 231 / 255, blue: 235 / 255, alpha: 1)
      })
  }
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
}
