//
//  OnboardingGenresContent.swift
//  Plotwist
//

import SwiftUI

struct OnboardingGenresContent: View {
  let onContinue: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var selectedGenres: Set<Int> = []
  
  private var genres: [OnboardingGenre] {
    onboardingService.getRelevantGenres()
  }
  
  private var canContinue: Bool {
    selectedGenres.count >= 1
  }
  
  private var remainingCount: Int {
    max(0, 1 - selectedGenres.count)
  }
  
  private var buttonLabel: String {
    if canContinue {
      return strings.continueButton
    } else if selectedGenres.isEmpty {
      return strings.onboardingSelectGenres
    } else {
      return "\(remainingCount) \(strings.onboardingMoreToGo)"
    }
  }
  
  var body: some View {
    VStack(spacing: 0) {
      Spacer()
      
      // Header
      VStack(spacing: 8) {
        Text(strings.onboardingGenresTitle)
          .font(.system(size: 28, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
        
        Text(strings.onboardingGenresSubtitle)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
      }
      .padding(.horizontal, 24)
      .padding(.bottom, 32)
      
      // Genre chips - centered
      FlowLayout(spacing: 10, alignment: .center) {
        ForEach(genres) { genre in
          GenreChip(
            genre: genre,
            isSelected: selectedGenres.contains(genre.id),
            action: {
              withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                if selectedGenres.contains(genre.id) {
                  selectedGenres.remove(genre.id)
                } else {
                  selectedGenres.insert(genre.id)
                  let impact = UIImpactFeedbackGenerator(style: .light)
                  impact.impactOccurred()
                }
              }
            }
          )
        }
      }
      .padding(.horizontal, 24)
      
      Spacer()
      
      // Continue Button
      Button(action: {
        let selected = genres.filter { selectedGenres.contains($0.id) }
        onboardingService.setSelectedGenres(selected)
        onContinue()
      }) {
        Text(buttonLabel)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(canContinue ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(canContinue ? Color.appForegroundAdaptive : Color.appInputFilled)
          .clipShape(Capsule())
      }
      .disabled(!canContinue)
      .padding(.horizontal, 24)
      .padding(.bottom, 48)
    }
    .frame(maxWidth: .infinity)
    .onAppear {
      // Load saved genres if returning to this step
      if selectedGenres.isEmpty && !onboardingService.selectedGenres.isEmpty {
        selectedGenres = Set(onboardingService.selectedGenres.map { $0.id })
      }
    }
  }
}

// MARK: - Genre Chip
struct GenreChip: View {
  let genre: OnboardingGenre
  let isSelected: Bool
  let action: () -> Void
  
  var body: some View {
    Button(action: action) {
      Text(genre.name)
        .font(.caption)
        .foregroundColor(isSelected ? .appBackgroundAdaptive : .appForegroundAdaptive)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(isSelected ? Color.appForegroundAdaptive : Color.appInputFilled)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(
          RoundedRectangle(cornerRadius: 8)
            .strokeBorder(isSelected ? Color.appForegroundAdaptive : Color.clear, lineWidth: 1)
        )
    }
    .scaleEffect(isSelected ? 1.05 : 1.0)
    .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
  }
}
