//
//  View+Sheet.swift
//  Plotwist
//

import SwiftUI

// MARK: - UIScreen Extension for Device Corner Radius
extension UIScreen {
  /// Returns the display corner radius of the device screen
  var deviceCornerRadius: CGFloat {
    guard let cornerRadius = value(forKey: "_displayCornerRadius") as? CGFloat else {
      return 44 // Fallback for older devices or simulator
    }
    return cornerRadius
  }
}

// MARK: - Sheet Style Configuration
enum SheetStyle {
  /// Margem horizontal do sheet flutuante
  static let horizontalPadding: CGFloat = 8
  /// Margem inferior do sheet flutuante
  static let bottomPadding: CGFloat = 8
  /// Raio de arredondamento do sheet - usa o raio do dispositivo
  static var cornerRadius: CGFloat {
    UIScreen.main.deviceCornerRadius
  }
  /// Altura extra para compensar o padding
  static let heightOffset: CGFloat = 20
}

// MARK: - Floating Sheet Container
/// Container que aplica o estilo flutuante com margem e arredondamento
struct FloatingSheetContainer<Content: View>: View {
  let content: Content
  @State private var keyboardVisible = false

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    VStack {
      Spacer()
      content
        .background(Color.appBackgroundAdaptive)
        .clipShape(
          UnevenRoundedRectangle(
            topLeadingRadius: SheetStyle.cornerRadius,
            bottomLeadingRadius: keyboardVisible ? 0 : SheetStyle.cornerRadius,
            bottomTrailingRadius: keyboardVisible ? 0 : SheetStyle.cornerRadius,
            topTrailingRadius: SheetStyle.cornerRadius
          )
        )
        .padding(.horizontal, keyboardVisible ? 0 : SheetStyle.horizontalPadding)
        .padding(.bottom, keyboardVisible ? 0 : SheetStyle.bottomPadding)
        .animation(.easeInOut(duration: 0.25), value: keyboardVisible)
    }
    .ignoresSafeArea(.container, edges: .bottom)
    .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)) { _ in
      keyboardVisible = true
    }
    .onReceive(NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)) { _ in
      keyboardVisible = false
    }
  }
}

// MARK: - View Extension
extension View {
  /// Aplica os modificadores de apresentação para sheet flutuante
  func floatingSheetPresentation(height: CGFloat) -> some View {
    self
      .presentationDetents([.height(height + SheetStyle.heightOffset)])
      .presentationBackground(.clear)
      .presentationDragIndicator(.hidden)
  }

  /// Aplica os modificadores de apresentação para sheet flutuante com detents customizados
  func floatingSheetPresentation(detents: Set<PresentationDetent>) -> some View {
    self
      .presentationDetents(detents)
      .presentationBackground(.clear)
      .presentationDragIndicator(.hidden)
  }
}
