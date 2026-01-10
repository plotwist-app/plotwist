//
//  Colors.swift
//  Plotwist
//

import SwiftUI

extension Color {
  // MARK: - Adaptive Colors (Light/Dark mode)

  // #09090B for dark mode, white for light mode
  static var appBackgroundAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(red: 9 / 255, green: 9 / 255, blue: 11 / 255, alpha: 1)
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

  static var appBorderAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.037, brightness: 0.159, alpha: 1)
          : UIColor(hue: 240 / 360, saturation: 0.059, brightness: 0.90, alpha: 1)
      })
  }

  static var appMutedForegroundAdaptive: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 240 / 360, saturation: 0.05, brightness: 0.649, alpha: 1)
          : UIColor(hue: 240 / 360, saturation: 0.038, brightness: 0.461, alpha: 1)
      })
  }

  // #F3F4F6 for light mode, darker for dark mode
  static var appInputFilled: Color {
    Color(
      UIColor {
        $0.userInterfaceStyle == .dark
          ? UIColor(hue: 220 / 360, saturation: 0.06, brightness: 0.14, alpha: 1)
          : UIColor(red: 243 / 255, green: 244 / 255, blue: 246 / 255, alpha: 1)
      })
  }

  static let appDestructive = Color(hue: 0, saturation: 0.842, brightness: 0.602)
}
