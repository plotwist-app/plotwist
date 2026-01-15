//
//  ReviewButton.swift
//  Plotwist
//

import SwiftUI

struct ReviewButton: View {
  let hasReview: Bool
  let action: () -> Void

  var body: some View {
    ActionButton(
      hasReview ? L10n.current.reviewed : L10n.current.review,
      icon: hasReview ? "star.fill" : "star",
      iconColor: hasReview ? .yellow : nil,
      action: action
    )
  }
}

#Preview {
  VStack(spacing: 16) {
    HStack {
      ReviewButton(hasReview: false) {}
      Spacer()
    }

    HStack {
      ReviewButton(hasReview: true) {}
      Spacer()
    }
  }
  .padding()
}
