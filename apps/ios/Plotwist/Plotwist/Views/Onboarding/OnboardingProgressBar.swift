//
//  OnboardingProgressBar.swift
//  Plotwist
//

import SwiftUI

struct OnboardingProgressBar: View {
  let totalSteps: Int
  let currentStep: Int // 0-based index
  
  private let barHeight: CGFloat = 4
  private let segmentSpacing: CGFloat = 4
  
  var body: some View {
    GeometryReader { geometry in
      let availableWidth = geometry.size.width - (CGFloat(totalSteps - 1) * segmentSpacing)
      let segmentWidth = availableWidth / CGFloat(totalSteps)
      
      HStack(spacing: segmentSpacing) {
        ForEach(0..<totalSteps, id: \.self) { index in
          RoundedRectangle(cornerRadius: barHeight / 2)
            .fill(index <= currentStep ? Color.appForegroundAdaptive : Color.appInputFilled)
            .frame(width: segmentWidth, height: barHeight)
            .animation(.easeInOut(duration: 0.3), value: currentStep)
        }
      }
    }
    .frame(height: barHeight)
  }
}
