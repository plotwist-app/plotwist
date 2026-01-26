//
//  View+Sheet.swift
//  Plotwist
//

import SwiftUI

// MARK: - Sheet Style Configuration
enum SheetStyle {
  /// Margem horizontal do sheet flutuante
  static let horizontalPadding: CGFloat = 16
  /// Raio de arredondamento do sheet
  static let cornerRadius: CGFloat = 32
  /// Altura extra para compensar o padding (padding * 2)
  static let heightOffset: CGFloat = 32
}

// MARK: - Floating Sheet Container
/// Container que aplica o estilo flutuante com margem e arredondamento
struct FloatingSheetContainer<Content: View>: View {
  let content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    VStack {
      Spacer()
      content
        .background(Color.appBackgroundAdaptive)
        .clipShape(RoundedRectangle(cornerRadius: SheetStyle.cornerRadius))
        .padding(.horizontal, SheetStyle.horizontalPadding)
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
