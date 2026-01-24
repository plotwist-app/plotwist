//
//  ReviewButton.swift
//  Plotwist
//

import SwiftUI

struct ReviewButton: View {
  let hasReview: Bool
  let isLoading: Bool
  let action: () -> Void

  init(hasReview: Bool, isLoading: Bool = false, action: @escaping () -> Void) {
    self.hasReview = hasReview
    self.isLoading = isLoading
    self.action = action
  }

  var body: some View {
    Button(action: action) {
      HStack(spacing: 6) {
        if isLoading {
          ProgressView()
            .progressViewStyle(CircularProgressViewStyle())
            .scaleEffect(0.7)
            .frame(width: 13, height: 13)
        } else {
          Image(systemName: hasReview ? "star.fill" : "star")
            .font(.system(size: 13))
            .foregroundColor(hasReview ? .yellow : .appForegroundAdaptive)
        }

        Text(hasReview ? L10n.current.reviewed : L10n.current.review)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.horizontal, 14)
      .padding(.vertical, 10)
      .background(Color.appInputFilled)
      .cornerRadius(10)
      .opacity(isLoading ? 0.5 : 1)
    }
    .disabled(isLoading)
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
