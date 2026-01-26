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

  var body: some View {
    HStack(spacing: 4) {
      ForEach(1...maxRating, id: \.self) { index in
        GeometryReader { geometry in
          ZStack {
            Image(systemName: starImage(for: index))
              .font(.system(size: size))
              .foregroundColor(starColor(for: index))
              .frame(width: geometry.size.width, height: geometry.size.height)
          }
          .contentShape(Rectangle())
          .gesture(
            DragGesture(minimumDistance: 0)
              .onEnded { value in
                if interactive {
                  handleTap(at: value.location, in: geometry.size, for: index)
                }
              }
          )
        }
        .frame(width: size, height: size)
      }
    }
    .frame(height: size)
  }

  private func handleTap(at location: CGPoint, in size: CGSize, for index: Int) {
    let tapPosition = location.x
    
    // If tapped on left half, use .5, if right half use 1.0
    if tapPosition < size.width / 2 {
      rating = Double(index) - 0.5
    } else {
      rating = Double(index)
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
