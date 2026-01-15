//
//  View+Sheet.swift
//  Plotwist
//

import SwiftUI

extension View {
  /// Aplica o estilo padrão para sheets/drawers do app
  func standardSheetStyle(detents: Set<PresentationDetent> = [.height(500), .large]) -> some View {
    self
      .presentationCornerRadius(24)
      .presentationDetents(detents)
      .presentationDragIndicator(.hidden)
  }
}
