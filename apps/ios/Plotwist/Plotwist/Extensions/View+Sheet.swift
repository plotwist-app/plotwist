//
//  View+Sheet.swift
//  Plotwist
//

import SwiftUI

// MARK: - Floating Sheet Container
/// Container for sheet content — pass-through that preserves existing call sites.
struct FloatingSheetContainer<Content: View>: View {
  let content: Content

  init(@ViewBuilder content: () -> Content) {
    self.content = content()
  }

  var body: some View {
    content
  }
}

// MARK: - View Extension
extension View {
  /// Sheet com altura fixa e fundo sólido (substitui Liquid Glass do iOS 26).
  func floatingSheetPresentation(height: CGFloat) -> some View {
    self
      .presentationDetents([.height(height)])
      .presentationBackground {
        Color.appSheetBackgroundAdaptive.ignoresSafeArea()
      }
      .presentationDragIndicator(.hidden)
  }

  /// Sheet com detents customizados e fundo sólido (substitui Liquid Glass do iOS 26).
  func floatingSheetPresentation(detents: Set<PresentationDetent>) -> some View {
    self
      .presentationDetents(detents)
      .presentationBackground {
        Color.appSheetBackgroundAdaptive.ignoresSafeArea()
      }
      .presentationDragIndicator(.hidden)
  }
}
