//
//  OnboardingView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Onboarding Step
enum OnboardingStep: Int, CaseIterable {
  case welcome = 0
  case name = 1
  case contentType = 2
  case genres = 3
  case addTitles = 4
  
  var stepNumber: Int {
    switch self {
    case .welcome: return 0
    case .name: return 1
    case .contentType: return 2
    case .genres: return 3
    case .addTitles: return 4
    }
  }
  
  var previous: OnboardingStep? {
    switch self {
    case .welcome: return nil
    case .name: return .welcome
    case .contentType: return .name
    case .genres: return .contentType
    case .addTitles: return .genres
    }
  }
  
  var canGoBack: Bool {
    self != .welcome
  }
}

// MARK: - Main Onboarding View
struct OnboardingView: View {
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var currentStep: OnboardingStep = .welcome
  @State private var strings = L10n.current
  @State private var contentTypeBackdropData = ContentTypeBackdropData()
  @State private var isGoingBack = false
  
  private var isWelcomeScreen: Bool {
    currentStep == .welcome
  }
  
  private let totalSteps = 4
  
  private var currentStepIndex: Int {
    max(0, currentStep.stepNumber - 1)
  }
  
  var body: some View {
    GeometryReader { geometry in
      if isWelcomeScreen {
        // Welcome screen with masonry
        ZStack {
          // Layer 1: Masonry background
          VStack {
            PosterMasonry(posters: PopularPoster.featured)
            Spacer()
          }
          .background(Color.black)
          .ignoresSafeArea()
          
          // Layer 2: Gradient for readability
          VStack {
            Spacer()
            LinearGradient(
              stops: [
                .init(color: .clear, location: 0),
                .init(color: Color.black.opacity(0.6), location: 0.3),
                .init(color: Color.black.opacity(0.95), location: 1),
              ],
              startPoint: .top,
              endPoint: .bottom
            )
            .frame(height: 380)
          }
          .ignoresSafeArea()
          
          // Layer 3: Content (floating, no background)
          stepContent
            .id(currentStep)
            .transition(.asymmetric(
              insertion: .move(edge: isGoingBack ? .leading : .trailing),
              removal: .move(edge: isGoingBack ? .trailing : .leading)
            ))
        }
      } else {
        // Other onboarding steps
        ZStack(alignment: .bottom) {
          Color.appBackgroundAdaptive
            .ignoresSafeArea()
          
          VStack(spacing: 0) {
            VStack(spacing: 0) {
              HStack(spacing: 16) {
                Button(action: goBack) {
                  Image(systemName: "chevron.left")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.appForegroundAdaptive)
                    .frame(width: 32, height: 32)
                }
                
                OnboardingProgressBar(
                  totalSteps: totalSteps,
                  currentStep: currentStepIndex
                )
              }
              .padding(.top, geometry.safeAreaInsets.top + 20)
              .padding(.horizontal, 24)
              .padding(.bottom, 24)
              
              stepContent
                .id(currentStep)
                .transition(.asymmetric(
                  insertion: .move(edge: isGoingBack ? .leading : .trailing),
                  removal: .move(edge: isGoingBack ? .trailing : .leading)
                ))
              
              Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.appBackgroundAdaptive)
          }
          .frame(maxHeight: .infinity, alignment: .bottom)
        }
        .ignoresSafeArea(edges: .all)
      }
    }
    .onAppear {
      AnalyticsService.shared.track(.onboardingStarted)
    }
    .task {
      // Preload content type backdrops during welcome screen
      contentTypeBackdropData = await ContentTypeBackdropData.load()
    }
  }
  
  // MARK: - Navigation
  
  private func goBack() {
    guard let previousStep = currentStep.previous else { return }
    isGoingBack = true
    withAnimation(.spring(response: 0.4, dampingFraction: 0.88)) {
      currentStep = previousStep
    }
  }
  
  private func goToStep(_ step: OnboardingStep) {
    isGoingBack = false
    withAnimation(.spring(response: 0.4, dampingFraction: 0.88)) {
      currentStep = step
    }
  }
  
  // MARK: - View Components
  
  @ViewBuilder
  private var stepContent: some View {
    switch currentStep {
    case .welcome:
      OnboardingWelcomeContent(
        onContinue: { goToStep(.name) }
      )
      
    case .name:
      OnboardingNameContent(
        onContinue: { goToStep(.contentType) }
      )
      
    case .contentType:
      OnboardingContentTypeContent(
        onContinue: { goToStep(.genres) },
        backdropData: contentTypeBackdropData
      )
      
    case .genres:
      OnboardingGenresContent(
        onContinue: { goToStep(.addTitles) }
      )
      
    case .addTitles:
      OnboardingAddTitlesContent(onComplete: {
        onboardingService.completeOnboarding()
      })
    }
  }
}

#Preview {
  OnboardingView()
}
