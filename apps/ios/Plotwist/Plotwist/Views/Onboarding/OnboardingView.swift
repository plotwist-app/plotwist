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
}

// MARK: - Main Onboarding View
struct OnboardingView: View {
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var currentStep: OnboardingStep = .welcome
  @State private var currentPosterIndex = 0
  @State private var strings = L10n.current
  @State private var contentTypeBackdropData = ContentTypeBackdropData()
  
  private let autoScrollTimer = Timer.publish(every: 4, on: .main, in: .common).autoconnect()
  
  private var cornerRadius: CGFloat {
    let deviceRadius = UIScreen.main.deviceCornerRadius
    return deviceRadius > 0 ? deviceRadius : 44
  }
  
  private var isWelcomeScreen: Bool {
    currentStep == .welcome
  }
  
  private let totalSteps = 4
  
  private var currentStepIndex: Int {
    max(0, currentStep.stepNumber - 1)
  }
  
  var body: some View {
    GeometryReader { geometry in
      let footerHeight: CGFloat = 280
      let posterHeight = geometry.size.height - footerHeight + cornerRadius + 100
      
      ZStack(alignment: .bottom) {
        Color.appBackgroundAdaptive
          .ignoresSafeArea()
        
        // Poster Carousel (only visible on welcome screen)
        if isWelcomeScreen {
          welcomeBackground(posterHeight: posterHeight)
        }
        
        // Content Area
        VStack(spacing: 0) {
          // Page Indicator (only on welcome screen)
          if isWelcomeScreen {
            pageIndicator
          }
          
          // Content Card
          VStack(spacing: 0) {
            // Progress Bar (only show after welcome)
            if !isWelcomeScreen {
              OnboardingProgressBar(
                totalSteps: totalSteps,
                currentStep: currentStepIndex
              )
              .padding(.top, geometry.safeAreaInsets.top + 20)
              .padding(.horizontal, 24)
              .padding(.bottom, 24)
            }
            
            // Step Content
            stepContent
              .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
              ))
            
            if !isWelcomeScreen {
              Spacer(minLength: 0)
            }
          }
          .frame(maxWidth: .infinity)
          .frame(maxHeight: isWelcomeScreen ? nil : .infinity)
          .background(Color.appBackgroundAdaptive)
          .clipShape(
            RoundedCorner(radius: isWelcomeScreen ? cornerRadius : 0, corners: [.topLeft, .topRight])
          )
        }
        .frame(maxHeight: isWelcomeScreen ? nil : .infinity, alignment: .bottom)
        .animation(.spring(response: 0.6, dampingFraction: 0.85), value: currentStep)
      }
      .ignoresSafeArea(edges: isWelcomeScreen ? [] : .all)
    }
    .onReceive(autoScrollTimer) { _ in
      if isWelcomeScreen {
        withAnimation(.easeInOut(duration: 0.5)) {
          currentPosterIndex = (currentPosterIndex + 1) % PopularPoster.featured.count
        }
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
  
  // MARK: - View Components
  
  @ViewBuilder
  private func welcomeBackground(posterHeight: CGFloat) -> some View {
    VStack {
      PosterCarousel(
        posters: PopularPoster.featured,
        currentIndex: $currentPosterIndex
      )
      .frame(height: posterHeight)
      .clipped()
      
      Spacer()
    }
    .ignoresSafeArea(edges: .top)
    .transition(.opacity)
    
    // Gradient Overlay
    VStack {
      LinearGradient(
        colors: [
          Color.black.opacity(0.1),
          Color.black.opacity(0.0),
          Color.black.opacity(0.1),
          Color.black.opacity(0.5),
        ],
        startPoint: .top,
        endPoint: .bottom
      )
      .frame(height: posterHeight)
      
      Spacer()
    }
    .ignoresSafeArea(edges: .top)
    .transition(.opacity)
  }
  
  private var pageIndicator: some View {
    HStack(spacing: 8) {
      ForEach(0..<PopularPoster.featured.count, id: \.self) { index in
        Circle()
          .fill(index == currentPosterIndex ? Color.white : Color.white.opacity(0.4))
          .frame(width: 8, height: 8)
          .animation(.easeInOut(duration: 0.3), value: currentPosterIndex)
      }
    }
    .padding(.bottom, 16)
  }
  
  @ViewBuilder
  private var stepContent: some View {
    switch currentStep {
    case .welcome:
      OnboardingWelcomeContent(
        onContinue: {
          withAnimation(.spring(response: 0.6, dampingFraction: 0.85)) {
            currentStep = .name
          }
        }
      )
      
    case .name:
      OnboardingNameContent(onContinue: {
        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
          currentStep = .contentType
        }
      })
      
    case .contentType:
      OnboardingContentTypeContent(
        onContinue: {
          withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
            currentStep = .genres
          }
        },
        backdropData: contentTypeBackdropData
      )
      
    case .genres:
      OnboardingGenresContent(onContinue: {
        withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
          currentStep = .addTitles
        }
      })
      
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
