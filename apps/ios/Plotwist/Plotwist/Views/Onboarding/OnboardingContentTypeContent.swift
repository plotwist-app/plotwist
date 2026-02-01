//
//  OnboardingContentTypeContent.swift
//  Plotwist
//

import SwiftUI

// MARK: - Content Type Backdrop Data
struct ContentTypeBackdropData {
  var urls: [ContentTypePreference: URL] = [:]
  var isLoaded: Bool = false
  
  static func load() async -> ContentTypeBackdropData {
    let language = Language.current.rawValue
    var data = ContentTypeBackdropData()
    
    do {
      // Use top rated content for better quality backdrops
      async let moviesTask = TMDBService.shared.getTopRatedMovies(language: language)
      async let seriesTask = TMDBService.shared.getTopRatedTVSeries(language: language)
      async let animesTask = TMDBService.shared.getTopRatedAnimes(language: language)
      async let doramasTask = TMDBService.shared.getTopRatedDoramas(language: language)
      
      let (movies, series, animes, doramas) = try await (moviesTask, seriesTask, animesTask, doramasTask)
      
      if let firstMovie = movies.results.first, let url = firstMovie.backdropURL {
        data.urls[.movies] = url
      }
      if let firstSeries = series.results.first, let url = firstSeries.backdropURL {
        data.urls[.series] = url
      }
      if let firstAnime = animes.results.first, let url = firstAnime.backdropURL {
        data.urls[.anime] = url
      }
      if let firstDorama = doramas.results.first, let url = firstDorama.backdropURL {
        data.urls[.dorama] = url
      }
      
      // Preload images
      let allUrls = Array(data.urls.values)
      ImageCache.shared.prefetch(urls: allUrls, priority: .high)
      
      data.isLoaded = true
    } catch {
      print("Failed to load backdrops: \(error)")
    }
    
    return data
  }
}

// MARK: - Content Type Content
struct OnboardingContentTypeContent: View {
  let onContinue: () -> Void
  let backdropData: ContentTypeBackdropData
  
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var selectedTypes: Set<ContentTypePreference> = []
  
  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12)
  ]
  
  private var canContinue: Bool {
    !selectedTypes.isEmpty
  }
  
  var body: some View {
    VStack(spacing: 0) {
      Spacer()
      
      // Question
      Text(strings.onboardingContentTypeTitle)
        .font(.system(size: 28, weight: .bold))
        .foregroundColor(.appForegroundAdaptive)
        .multilineTextAlignment(.center)
        .padding(.bottom, 32)
        .padding(.horizontal, 24)
      
      // Options - 2 column grid
      GeometryReader { geometry in
        let spacing: CGFloat = 12
        let horizontalPadding: CGFloat = 24
        let availableWidth = geometry.size.width - (horizontalPadding * 2) - spacing
        let cardWidth = availableWidth / 2
        let cardHeight = cardWidth * 0.85 // aspect ratio ~16:13.5
        
        LazyVGrid(columns: columns, spacing: spacing) {
          ForEach(ContentTypePreference.allCases, id: \.rawValue) { type in
            ContentTypeCard(
              type: type,
              isSelected: selectedTypes.contains(type),
              backdropURL: backdropData.urls[type],
              action: { toggleType(type) }
            )
            .frame(height: cardHeight)
          }
        }
        .padding(.horizontal, horizontalPadding)
      }
      .frame(height: 320) // Fixed height for the grid area
      
      Spacer()
      
      // Continue Button
      Button(action: {
        onboardingService.setContentTypes(selectedTypes)
        onContinue()
      }) {
        Text(strings.continueButton)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(canContinue ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(canContinue ? Color.appForegroundAdaptive : Color.appInputFilled)
          .clipShape(Capsule())
          .animation(.easeInOut(duration: 0.2), value: canContinue)
      }
      .disabled(!canContinue)
      .padding(.horizontal, 24)
      .padding(.bottom, 48)
    }
    .frame(maxWidth: .infinity)
  }
  
  private func toggleType(_ type: ContentTypePreference) {
    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
      if selectedTypes.contains(type) {
        selectedTypes.remove(type)
      } else {
        selectedTypes.insert(type)
        let impact = UIImpactFeedbackGenerator(style: .light)
        impact.impactOccurred()
      }
    }
  }
}

// MARK: - Content Type Card
struct ContentTypeCard: View {
  let type: ContentTypePreference
  let isSelected: Bool
  let backdropURL: URL?
  let action: () -> Void
  
  var body: some View {
    Button(action: action) {
      GeometryReader { geometry in
        ZStack(alignment: .bottomLeading) {
          // Backdrop image
          CachedAsyncImage(url: backdropURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            Rectangle()
              .fill(Color.appInputFilled)
          }
          .frame(width: geometry.size.width, height: geometry.size.height)
          .clipped()
          
          // Dark gradient overlay
          LinearGradient(
            colors: [
              Color.black.opacity(0.1),
              Color.black.opacity(0.7)
            ],
            startPoint: .top,
            endPoint: .bottom
          )
          
          // Selection overlay
          if isSelected {
            Color.appForegroundAdaptive.opacity(0.3)
          }
          
          // Content
          VStack(alignment: .leading) {
            Spacer()
            
            Text(type.displayName)
              .font(.system(size: 15, weight: .semibold))
              .foregroundColor(.white)
          }
          .padding(12)
          
          // Checkmark when selected
          if isSelected {
            VStack {
              HStack {
                Spacer()
                Image(systemName: "checkmark.circle.fill")
                  .font(.system(size: 24))
                  .foregroundColor(.white)
                  .shadow(color: .black.opacity(0.3), radius: 2, x: 0, y: 1)
              }
              Spacer()
            }
            .padding(10)
          }
        }
      }
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder(cornerRadius: DesignTokens.CornerRadius.poster)
      .overlay(
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .strokeBorder(isSelected ? Color.white : Color.clear, lineWidth: 3)
      )
    }
    .scaleEffect(isSelected ? 0.98 : 1.0)
    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isSelected)
  }
}
