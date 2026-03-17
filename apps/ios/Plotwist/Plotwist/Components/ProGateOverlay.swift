//
//  ProGateOverlay.swift
//  Plotwist

import SwiftUI

struct ProLockedCard<Content: View>: View {
  let isPro: Bool
  @ViewBuilder let content: Content

  var body: some View {
    if isPro {
      content
    } else {
      content
        .blur(radius: 6)
        .allowsHitTesting(false)
        .clipShape(RoundedRectangle(cornerRadius: 22))
    }
  }
}
