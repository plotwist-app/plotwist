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

// MARK: - Sheet Height Measurement
private struct SheetHeightPreferenceKey: PreferenceKey {
  static var defaultValue: CGFloat = 0
  static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
    value = max(value, nextValue())
  }
}

// MARK: - View Extension
extension View {
  func floatingSheetPresentation(height: CGFloat) -> some View {
    self
      .presentationDetents([.height(height)])
      .presentationBackground {
        Color.appSheetBackgroundAdaptive.ignoresSafeArea()
      }
      .presentationDragIndicator(.hidden)
  }

  func floatingSheetPresentation(detents: Set<PresentationDetent>) -> some View {
    self
      .presentationDetents(detents)
      .presentationBackground {
        Color.appSheetBackgroundAdaptive.ignoresSafeArea()
      }
      .presentationDragIndicator(.hidden)
  }

  func floatingSheetDynamicPresentation() -> some View {
    modifier(DynamicFloatingSheetModifier())
  }
}

// MARK: - Dynamic Height Sheet Modifier
private struct DynamicFloatingSheetModifier: ViewModifier {
  @State private var contentHeight: CGFloat = 0

  func body(content: Content) -> some View {
    content
      .background(
        GeometryReader { geometry in
          Color.clear
            .preference(key: SheetHeightPreferenceKey.self, value: geometry.size.height)
        }
      )
      .onPreferenceChange(SheetHeightPreferenceKey.self) { height in
        if height > 0 {
          contentHeight = height
        }
      }
      .presentationDetents(contentHeight > 0 ? [.height(contentHeight)] : [.medium])
      .presentationBackground {
        Color.appSheetBackgroundAdaptive.ignoresSafeArea()
      }
      .presentationDragIndicator(.hidden)
  }
}
