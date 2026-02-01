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
  
  private let autoScrollTimer = Timer.publish(every: 4, on: .main, in: .common).autoconnect()
  
  private var cornerRadius: CGFloat {
    let deviceRadius = UIScreen.main.deviceCornerRadius
    return deviceRadius > 0 ? deviceRadius : 44
  }
  
  // Check if we're on the welcome screen (poster visible)
  private var isWelcomeScreen: Bool {
    currentStep == .welcome
  }
  
  // Total onboarding steps (excluding welcome)
  private let totalSteps = 4 // name, contentType, genres, addTitles
  
  // Current step index for progress (0-based, starting from name step)
  private var currentStepIndex: Int {
    max(0, currentStep.stepNumber - 1)
  }
  
  var body: some View {
    GeometryReader { geometry in
      let footerHeight: CGFloat = 280
      let posterHeight = geometry.size.height - footerHeight + cornerRadius + 100
      
      ZStack(alignment: .bottom) {
        // Background color
        Color.appBackgroundAdaptive
          .ignoresSafeArea()
        
        // Poster Carousel (only visible on welcome screen)
        if isWelcomeScreen {
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
                Color.black.opacity(0.3),
                Color.black.opacity(0.1),
                Color.black.opacity(0.3),
                Color.black.opacity(0.7),
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
        
        // Content Area
        VStack(spacing: 0) {
          // Page Indicator (only on welcome screen)
          if isWelcomeScreen {
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
            Group {
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
                OnboardingContentTypeContent(onContinue: {
                  withAnimation(.spring(response: 0.5, dampingFraction: 0.8)) {
                    currentStep = .genres
                  }
                })
                
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
  }
}

// MARK: - Progress Bar
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

// MARK: - Welcome Content
struct OnboardingWelcomeContent: View {
  let onContinue: () -> Void
  @State private var strings = L10n.current
  
  var body: some View {
    VStack(spacing: 20) {
      // Title & Description
      VStack(spacing: 8) {
        Text(strings.onboardingWelcomeTitle)
          .font(.system(size: 26, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
        
        Text(strings.onboardingWelcomeSubtitle)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
      }
      
      // CTA Button
      Button(action: onContinue) {
        Text(strings.onboardingGetStarted)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appBackgroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(Color.appForegroundAdaptive)
          .clipShape(Capsule())
      }
    }
    .padding(.horizontal, 24)
    .padding(.top, 28)
    .padding(.bottom, 40)
    .frame(maxWidth: 400)
    .frame(maxWidth: .infinity)
  }
}

// MARK: - Name Content
struct OnboardingNameContent: View {
  let onContinue: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var userName: String = ""
  @FocusState private var isNameFocused: Bool
  
  private var canContinue: Bool {
    !userName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
  }
  
  var body: some View {
    VStack(spacing: 0) {
      Spacer()
      
      // Title & Description
      VStack(spacing: 8) {
        Text(strings.onboardingNameTitle)
          .font(.system(size: 28, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.center)
        
        Text(strings.onboardingNameSubtitle)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .multilineTextAlignment(.center)
      }
      .padding(.bottom, 32)
      .padding(.horizontal, 24)
      
      // Name Input
      TextField(strings.onboardingNamePlaceholder, text: $userName)
        .textInputAutocapitalization(.words)
        .autocorrectionDisabled()
        .padding(12)
        .background(Color.appInputFilled)
        .cornerRadius(12)
        .focused($isNameFocused)
        .submitLabel(.continue)
        .onSubmit {
          if canContinue {
            onboardingService.setUserName(userName.trimmingCharacters(in: .whitespacesAndNewlines))
            onContinue()
          }
        }
        .padding(.horizontal, 24)
      
      Spacer()
      Spacer()
      
      // CTA Button
      Button(action: {
        onboardingService.setUserName(userName.trimmingCharacters(in: .whitespacesAndNewlines))
        onContinue()
      }) {
        Text(strings.continueButton)
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
      // Focus name field after a short delay
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        isNameFocused = true
      }
    }
  }
}

// MARK: - Content Type Content
struct OnboardingContentTypeContent: View {
  let onContinue: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var selectedTypes: Set<ContentTypePreference> = []
  
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
      
      // Options
      VStack(spacing: 12) {
        ForEach(ContentTypePreference.allCases, id: \.rawValue) { type in
          ContentTypeButton(
            type: type,
            isSelected: selectedTypes.contains(type),
            action: {
              withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                if selectedTypes.contains(type) {
                  selectedTypes.remove(type)
                } else {
                  selectedTypes.insert(type)
                  // Haptic feedback
                  let impact = UIImpactFeedbackGenerator(style: .light)
                  impact.impactOccurred()
                }
              }
            }
          )
        }
      }
      
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
      .padding(.bottom, 48)
    }
    .padding(.horizontal, 24)
    .frame(maxWidth: 400)
    .frame(maxWidth: .infinity)
  }
}

// MARK: - Content Type Button
struct ContentTypeButton: View {
  let type: ContentTypePreference
  let isSelected: Bool
  let action: () -> Void
  
  var body: some View {
    Button(action: action) {
      HStack(spacing: 16) {
        Image(systemName: type.icon)
          .font(.system(size: 24))
          .foregroundColor(isSelected ? .appBackgroundAdaptive : .appForegroundAdaptive)
          .frame(width: 32)
        
        Text(type.displayName)
          .font(.headline)
          .foregroundColor(isSelected ? .appBackgroundAdaptive : .appForegroundAdaptive)
        
        Spacer()
        
        if isSelected {
          Image(systemName: "checkmark.circle.fill")
            .foregroundColor(.appBackgroundAdaptive)
        }
      }
      .padding(.horizontal, 20)
      .frame(height: 64)
      .background(isSelected ? Color.appForegroundAdaptive : Color.appInputFilled)
      .clipShape(RoundedRectangle(cornerRadius: 16))
    }
  }
}

// MARK: - Genres Content
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
      }
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
                  // Haptic feedback
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
      
      // Buttons
      VStack(spacing: 12) {
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
            .animation(.easeInOut(duration: 0.2), value: canContinue)
        }
        .disabled(!canContinue)
        
        Button(action: {
          onboardingService.setSelectedGenres([])
          onContinue()
        }) {
          Text(strings.onboardingSkip)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .padding(.horizontal, 24)
      .padding(.bottom, 48)
    }
    .frame(maxWidth: .infinity)
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
    .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isSelected)
  }
}

// MARK: - Add Titles Content
struct OnboardingAddTitlesContent: View {
  let onComplete: () -> Void
  @StateObject private var onboardingService = OnboardingService.shared
  @State private var strings = L10n.current
  @State private var searchText = ""
  @State private var searchResults: [SearchResult] = []
  @State private var trendingItems: [SearchResult] = []
  @State private var genreItems: [SearchResult] = []
  @State private var isSearching = false
  @State private var isLoading = true
  @State private var showCelebration = false
  @FocusState private var isSearchFocused: Bool
  
  private var savedCount: Int {
    onboardingService.localSavedTitles.count
  }
  
  private var canComplete: Bool {
    savedCount >= 5
  }
  
  private var displayItems: [SearchResult] {
    if !searchText.isEmpty {
      return searchResults
    }
    var items: [SearchResult] = []
    let maxTrending = min(6, trendingItems.count)
    let maxGenre = min(6, genreItems.count)
    
    items.append(contentsOf: trendingItems.prefix(maxTrending))
    items.append(contentsOf: genreItems.prefix(maxGenre))
    
    var seen = Set<Int>()
    return items.filter { item in
      if seen.contains(item.id) { return false }
      seen.insert(item.id)
      return true
    }
  }
  
  var body: some View {
    ZStack {
      VStack(spacing: 0) {
        // Header
        VStack(spacing: 8) {
          // Title
          Text(strings.onboardingAddTitlesTitle)
            .font(.system(size: 20, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
          
          // Subtitle
          Text(strings.onboardingAddTitlesSubtitle)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          // Search bar
          HStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
              .foregroundColor(.appMutedForegroundAdaptive)
            
            TextField(strings.onboardingSearchPlaceholder, text: $searchText)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .focused($isSearchFocused)
          }
          .padding(12)
          .background(Color.appInputFilled)
          .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 8)
        
        // Content
        if isLoading && displayItems.isEmpty {
          Spacer()
          ProgressView()
          Spacer()
        } else {
          ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 8) {
              if searchText.isEmpty {
                HStack {
                  Text(strings.onboardingPopularNow)
                    .font(.subheadline.weight(.semibold))
                    .foregroundColor(.appForegroundAdaptive)
                  Spacer()
                }
                .padding(.horizontal, 24)
                .padding(.top, 4)
              }
              
              ForEach(displayItems) { item in
                OnboardingTitleRow(
                  item: item,
                  savedStatus: onboardingService.getLocalTitleStatus(tmdbId: item.id, mediaType: item.mediaType ?? "movie"),
                  onWantToWatch: {
                    addTitle(item, status: "WATCHLIST")
                  },
                  onAlreadyWatched: {
                    addTitle(item, status: "WATCHED")
                  }
                )
              }
            }
            .padding(.bottom, 80)
          }
        }
        
        // Bottom button
        VStack(spacing: 0) {
          LinearGradient(
            colors: [Color.appBackgroundAdaptive.opacity(0), Color.appBackgroundAdaptive],
            startPoint: .top,
            endPoint: .bottom
          )
          .frame(height: 20)
          
          Button(action: {
            if canComplete {
              showCelebration = true
            }
          }) {
            Text(canComplete ? strings.onboardingContinueToApp : "\(strings.onboardingAddMore) (\(5 - savedCount))")
              .font(.system(size: 16, weight: .semibold))
              .foregroundColor(canComplete ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
              .frame(maxWidth: .infinity)
              .frame(height: 52)
              .background(canComplete ? Color.green : Color.appInputFilled)
              .clipShape(Capsule())
          }
          .disabled(!canComplete)
          .padding(.horizontal, 24)
          .padding(.bottom, 40)
          .background(Color.appBackgroundAdaptive)
        }
      }
      .frame(maxWidth: .infinity)
      
      // Celebration overlay
      if showCelebration {
        OnboardingCelebration(onDismiss: onComplete)
      }
    }
    .onChange(of: searchText) { newValue in
      Task {
        await performSearch(query: newValue)
      }
    }
    .task {
      await loadContent()
    }
  }
  
  private func addTitle(_ item: SearchResult, status: String) {
    let wasBelow5 = savedCount < 5
    
    onboardingService.addLocalTitle(
      tmdbId: item.id,
      mediaType: item.mediaType ?? "movie",
      title: item.displayTitle,
      posterPath: item.posterPath,
      status: status
    )
    
    if wasBelow5 && savedCount >= 5 {
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
        showCelebration = true
      }
    }
  }
  
  private func performSearch(query: String) async {
    guard !query.isEmpty else {
      searchResults = []
      return
    }
    
    isSearching = true
    defer { isSearching = false }
    
    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      searchResults = response.results.filter { $0.mediaType == "movie" || $0.mediaType == "tv" }
    } catch {
      searchResults = []
    }
  }
  
  private func loadContent() async {
    isLoading = true
    defer { isLoading = false }
    
    let language = Language.current.rawValue
    let contentTypes = onboardingService.contentTypes
    let selectedGenres = onboardingService.selectedGenres
    
    do {
      var allTrending: [SearchResult] = []
      
      // Load content based on selected preferences
      if contentTypes.isEmpty {
        // No preference - show general trending
        allTrending = try await TMDBService.shared.getTrending(
          mediaType: "all",
          timeWindow: "week",
          language: language
        )
      } else {
        // Load specific content for each selected type
        if contentTypes.contains(.movies) {
          let movies = try await TMDBService.shared.getPopularMovies(language: language)
          allTrending.append(contentsOf: movies.results.prefix(5))
        }
        
        if contentTypes.contains(.series) {
          let series = try await TMDBService.shared.getPopularTVSeries(language: language)
          allTrending.append(contentsOf: series.results.prefix(5))
        }
        
        if contentTypes.contains(.anime) {
          let animes = try await TMDBService.shared.getPopularAnimes(language: language)
          allTrending.append(contentsOf: animes.results.prefix(5))
        }
        
        if contentTypes.contains(.dorama) {
          let doramas = try await TMDBService.shared.getPopularDoramas(language: language)
          allTrending.append(contentsOf: doramas.results.prefix(5))
        }
      }
      
      // Remove duplicates
      var seen = Set<Int>()
      trendingItems = allTrending.filter { item in
        if seen.contains(item.id) { return false }
        seen.insert(item.id)
        return true
      }
      
      // Load genre-based content
      if !selectedGenres.isEmpty {
        let genreIds = selectedGenres.map { $0.id }
        
        // Determine media type for genre discovery
        let hasOnlyMovies = contentTypes == Set([ContentTypePreference.movies])
        let genreMediaType = hasOnlyMovies ? "movie" : "tv"
        
        genreItems = try await TMDBService.shared.discoverByGenres(
          mediaType: genreMediaType,
          genreIds: genreIds,
          language: language
        )
      }
    } catch {
      print("Failed to load onboarding content: \(error)")
    }
  }
}

// MARK: - Title Row
struct OnboardingTitleRow: View {
  let item: SearchResult
  let savedStatus: String?
  let onWantToWatch: () -> Void
  let onAlreadyWatched: () -> Void
  @State private var strings = L10n.current
  
  private var isSaved: Bool {
    savedStatus != nil
  }
  
  var body: some View {
    HStack(spacing: 12) {
      // Poster
      CachedAsyncImage(url: item.imageURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: 8)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: 60, height: 90)
      .clipShape(RoundedRectangle(cornerRadius: 8))
      
      // Info
      VStack(alignment: .leading, spacing: 4) {
        Text(item.displayTitle)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(2)
        
        HStack(spacing: 6) {
          if let mediaType = item.mediaType {
            Text(mediaType == "movie" ? strings.movies : strings.tvSeries)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          
          if let year = item.year {
            Text("•")
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
            Text(year)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
      
      Spacer()
      
      // Action buttons
      if isSaved {
        // Show saved indicator
        Image(systemName: savedStatus == "WATCHED" ? "checkmark.circle.fill" : "bookmark.fill")
          .font(.system(size: 24))
          .foregroundColor(.green)
      } else {
        HStack(spacing: 8) {
          // Want to watch
          Button(action: onWantToWatch) {
            Image(systemName: "bookmark")
              .font(.system(size: 18))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 44, height: 44)
              .background(Color.appInputFilled)
              .clipShape(Circle())
          }
          
          // Already watched
          Button(action: onAlreadyWatched) {
            Image(systemName: "checkmark")
              .font(.system(size: 18))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 44, height: 44)
              .background(Color.appInputFilled)
              .clipShape(Circle())
          }
        }
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 8)
  }
}

// MARK: - Celebration View
struct OnboardingCelebration: View {
  let onDismiss: () -> Void
  @State private var strings = L10n.current
  @State private var showContent = false
  
  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive
        .ignoresSafeArea()
      
      VStack(spacing: 24) {
        Spacer()
        
        // Celebration icon
        Image(systemName: "checkmark.circle.fill")
          .font(.system(size: 80))
          .foregroundColor(.green)
          .scaleEffect(showContent ? 1 : 0.5)
          .opacity(showContent ? 1 : 0)
        
        VStack(spacing: 8) {
          Text(strings.onboardingCelebrationTitle)
            .font(.system(size: 28, weight: .bold))
            .foregroundColor(.appForegroundAdaptive)
            .multilineTextAlignment(.center)
          
          Text(strings.onboardingCelebrationSubtitle)
            .font(.body)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        .opacity(showContent ? 1 : 0)
        .offset(y: showContent ? 0 : 20)
        
        Spacer()
        
        Button(action: onDismiss) {
          Text(strings.onboardingGoToHome)
            .font(.headline)
            .foregroundColor(.appBackgroundAdaptive)
            .frame(maxWidth: .infinity)
            .frame(height: 56)
            .background(Color.appForegroundAdaptive)
            .clipShape(Capsule())
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 48)
        .opacity(showContent ? 1 : 0)
      }
    }
    .onAppear {
      withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
        showContent = true
      }
      
      // Track completion
      AnalyticsService.shared.track(.screenView(name: "Onboarding_Celebration"))
    }
  }
}

#Preview {
  OnboardingView()
}
