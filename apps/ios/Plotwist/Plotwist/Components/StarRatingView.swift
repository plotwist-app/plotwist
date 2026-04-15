//
//  StarRatingView.swift
//  Plotwist
//

import SwiftUI

struct StarRatingView: View {
  @Binding var rating: Double
  let maxRating: Int = 5
  let size: CGFloat
  let interactive: Bool

  init(rating: Binding<Double>, size: CGFloat = 24, interactive: Bool = true) {
    self._rating = rating
    self.size = size
    self.interactive = interactive
  }

  private let spacing: CGFloat = 4

  var body: some View {
    HStack(spacing: spacing) {
      ForEach(1...maxRating, id: \.self) { index in
        Image(systemName: starImage(for: index))
          .font(.system(size: size))
          .foregroundColor(starColor(for: index))
          .frame(width: size, height: size)
      }
    }
    .frame(height: size)
    .contentShape(Rectangle())
    .gesture(
      interactive
        ? DragGesture(minimumDistance: 0)
            .onChanged { value in
              updateRating(at: value.location.x)
            }
            .onEnded { value in
              updateRating(at: value.location.x)
            }
        : nil
    )
  }

  private func updateRating(at x: CGFloat) {
    let starWidth = size + spacing
    let clampedX = max(0, min(x, starWidth * CGFloat(maxRating) - spacing))
    let starIndex = clampedX / starWidth
    let fraction = starIndex - floor(starIndex)
    let newRating = fraction < 0.5
      ? floor(starIndex) + 0.5
      : floor(starIndex) + 1.0
    let clamped = max(0.5, min(Double(maxRating), newRating))
    if clamped != rating {
      rating = clamped
      Haptics.selection()
    }
  }

  private func starImage(for index: Int) -> String {
    let fillLevel = rating - Double(index - 1)

    if fillLevel >= 1.0 {
      return "star.fill"
    } else if fillLevel >= 0.5 {
      return "star.leadinghalf.filled"
    } else {
      return "star.fill"
    }
  }

  private func starColor(for index: Int) -> Color {
    let fillLevel = rating - Double(index - 1)
    
    if fillLevel >= 1.0 {
      return .appStarYellow
    } else if fillLevel >= 0.5 {
      return .appStarYellow
    } else {
      return Color.gray.opacity(0.3)
    }
  }
}

// MARK: - Preview
#Preview {
  VStack(spacing: 20) {
    StarRatingView(rating: .constant(0), size: 32)
    StarRatingView(rating: .constant(2.5), size: 32)
    StarRatingView(rating: .constant(5), size: 32)
    StarRatingView(rating: .constant(3.5), size: 24, interactive: false)
  }
  .padding()
}
