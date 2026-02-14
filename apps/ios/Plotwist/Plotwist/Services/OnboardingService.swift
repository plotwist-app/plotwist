//
//  OnboardingService.swift
//  Plotwist
//

import Foundation

// MARK: - Content Type Preference
enum ContentTypePreference: String, CaseIterable, Codable {
  case movies = "MOVIES"
  case series = "SERIES"
  case anime = "ANIME"
  case dorama = "DORAMA"
  
  var displayName: String {
    switch self {
    case .movies: return L10n.current.onboardingMovies
    case .series: return L10n.current.onboardingSeries
    case .anime: return L10n.current.onboardingAnime
    case .dorama: return L10n.current.onboardingDorama
    }
  }
  
  var icon: String {
    switch self {
    case .movies: return "film"
    case .series: return "tv"
    case .anime: return "sparkles.tv"
    case .dorama: return "play.tv"
    }
  }
}

// MARK: - Genre
struct OnboardingGenre: Identifiable, Codable, Hashable {
  let id: Int
  private let fallbackName: String
  
  init(id: Int, name: String) {
    self.id = id
    self.fallbackName = name
  }
  
  // Localized name based on genre ID
  var name: String {
    let strings = L10n.current
    switch id {
    // Movie genres
    case 28: return strings.genreAction
    case 12: return strings.genreAdventure
    case 16: return strings.genreAnimation
    case 35: return strings.genreComedy
    case 80: return strings.genreCrime
    case 99: return strings.genreDocumentary
    case 18: return strings.genreDrama
    case 14: return strings.genreFantasy
    case 36: return strings.genreHistory
    case 27: return strings.genreHorror
    case 10402: return strings.genreMusic
    case 10749: return strings.genreRomance
    case 878: return strings.genreSciFi
    case 53: return strings.genreThriller
    case 10752: return strings.genreWar
    case 37: return strings.genreWestern
    // TV genres
    case 10759: return strings.genreActionAdventure
    case 10765: return strings.genreSciFiFantasy
    case 10768: return strings.genreWarPolitics
    case 9648: return strings.genreMystery
    case 10751: return strings.genreFamily
    case 10764: return strings.genreReality
    default: return fallbackName
    }
  }
  
  // Common genres across TMDB
  static let movieGenres: [OnboardingGenre] = [
    OnboardingGenre(id: 28, name: "Action"),
    OnboardingGenre(id: 12, name: "Adventure"),
    OnboardingGenre(id: 16, name: "Animation"),
    OnboardingGenre(id: 35, name: "Comedy"),
    OnboardingGenre(id: 80, name: "Crime"),
    OnboardingGenre(id: 99, name: "Documentary"),
    OnboardingGenre(id: 18, name: "Drama"),
    OnboardingGenre(id: 10751, name: "Family"),
    OnboardingGenre(id: 14, name: "Fantasy"),
    OnboardingGenre(id: 36, name: "History"),
    OnboardingGenre(id: 27, name: "Horror"),
    OnboardingGenre(id: 10402, name: "Music"),
    OnboardingGenre(id: 9648, name: "Mystery"),
    OnboardingGenre(id: 10749, name: "Romance"),
    OnboardingGenre(id: 878, name: "Sci-Fi"),
    OnboardingGenre(id: 53, name: "Thriller"),
    OnboardingGenre(id: 10752, name: "War"),
    OnboardingGenre(id: 37, name: "Western"),
  ]
  
  static let tvGenres: [OnboardingGenre] = [
    OnboardingGenre(id: 10759, name: "Action & Adventure"),
    OnboardingGenre(id: 16, name: "Animation"),
    OnboardingGenre(id: 35, name: "Comedy"),
    OnboardingGenre(id: 80, name: "Crime"),
    OnboardingGenre(id: 99, name: "Documentary"),
    OnboardingGenre(id: 18, name: "Drama"),
    OnboardingGenre(id: 10751, name: "Family"),
    OnboardingGenre(id: 9648, name: "Mystery"),
    OnboardingGenre(id: 10764, name: "Reality"),
    OnboardingGenre(id: 10765, name: "Sci-Fi & Fantasy"),
    OnboardingGenre(id: 10768, name: "War & Politics"),
    OnboardingGenre(id: 37, name: "Western"),
  ]
  
  static let animeGenres: [OnboardingGenre] = [
    OnboardingGenre(id: 16, name: "Animation"),
    OnboardingGenre(id: 10759, name: "Action & Adventure"),
    OnboardingGenre(id: 35, name: "Comedy"),
    OnboardingGenre(id: 18, name: "Drama"),
    OnboardingGenre(id: 10765, name: "Sci-Fi & Fantasy"),
    OnboardingGenre(id: 9648, name: "Mystery"),
    OnboardingGenre(id: 10751, name: "Family"),
  ]
  
  static let doramaGenres: [OnboardingGenre] = [
    OnboardingGenre(id: 18, name: "Drama"),
    OnboardingGenre(id: 35, name: "Comedy"),
    OnboardingGenre(id: 10759, name: "Action & Adventure"),
    OnboardingGenre(id: 9648, name: "Mystery"),
    OnboardingGenre(id: 80, name: "Crime"),
    OnboardingGenre(id: 10765, name: "Sci-Fi & Fantasy"),
    OnboardingGenre(id: 10751, name: "Family"),
  ]
}

// MARK: - Local Title (saved before login)
struct LocalSavedTitle: Codable, Identifiable {
  let id: Int
  let tmdbId: Int
  let mediaType: String // "movie" or "tv"
  let title: String
  let posterPath: String?
  let status: String // "WATCHLIST", "WATCHED", or "WATCHING"
  let savedAt: Date
  
  var posterURL: URL? {
    guard let posterPath = posterPath else { return nil }
    return URL(string: "https://image.tmdb.org/t/p/w342\(posterPath)")
  }
}

// MARK: - Onboarding Service
class OnboardingService: ObservableObject {
  static let shared = OnboardingService()
  
  // Keys
  private let hasCompletedOnboardingKey = "hasCompletedOnboarding"
  private let userNameKey = "onboardingUserName"
  private let contentTypesKey = "onboardingContentTypes"
  private let selectedGenresKey = "onboardingSelectedGenres"
  private let localSavedTitlesKey = "onboardingLocalSavedTitles"
  private let hasSeenLoginPromptKey = "hasSeenLoginPrompt"
  private let hasSeenNotificationPromptKey = "hasSeenNotificationPrompt"
  
  // Published state
  @Published var hasCompletedOnboarding: Bool
  @Published var userName: String
  @Published var contentTypes: Set<ContentTypePreference>
  @Published var selectedGenres: [OnboardingGenre]
  @Published var localSavedTitles: [LocalSavedTitle]
  
  private init() {
    self.hasCompletedOnboarding = UserDefaults.standard.bool(forKey: hasCompletedOnboardingKey)
    self.userName = UserDefaults.standard.string(forKey: userNameKey) ?? ""
    
    if let data = UserDefaults.standard.data(forKey: contentTypesKey),
       let types = try? JSONDecoder().decode(Set<ContentTypePreference>.self, from: data) {
      self.contentTypes = types
    } else {
      self.contentTypes = []
    }
    
    if let data = UserDefaults.standard.data(forKey: selectedGenresKey),
       let genres = try? JSONDecoder().decode([OnboardingGenre].self, from: data) {
      self.selectedGenres = genres
    } else {
      self.selectedGenres = []
    }
    
    if let data = UserDefaults.standard.data(forKey: localSavedTitlesKey),
       let titles = try? JSONDecoder().decode([LocalSavedTitle].self, from: data) {
      self.localSavedTitles = titles
    } else {
      self.localSavedTitles = []
    }
  }
  
  // MARK: - User Name
  func setUserName(_ name: String) {
    userName = name
    UserDefaults.standard.set(name, forKey: userNameKey)
  }
  
  // MARK: - Content Types
  func toggleContentType(_ type: ContentTypePreference) {
    if contentTypes.contains(type) {
      contentTypes.remove(type)
    } else {
      contentTypes.insert(type)
    }
    saveContentTypes()
  }
  
  func setContentTypes(_ types: Set<ContentTypePreference>) {
    contentTypes = types
    saveContentTypes()
    
    // Track event
    let typesString = types.map { $0.rawValue }.joined(separator: ",")
    AnalyticsService.shared.track(.onboardingContentTypeSelected(type: typesString))
  }
  
  private func saveContentTypes() {
    if let data = try? JSONEncoder().encode(contentTypes) {
      UserDefaults.standard.set(data, forKey: contentTypesKey)
    }
  }
  
  // MARK: - Genres
  func setSelectedGenres(_ genres: [OnboardingGenre]) {
    selectedGenres = genres
    if let data = try? JSONEncoder().encode(genres) {
      UserDefaults.standard.set(data, forKey: selectedGenresKey)
    }
    
    // Track event
    AnalyticsService.shared.track(.onboardingGenresSelected(count: genres.count))
  }
  
  func getRelevantGenres() -> [OnboardingGenre] {
    // If no content types selected, return a mix
    if contentTypes.isEmpty {
      return [
        OnboardingGenre(id: 28, name: "Action"),
        OnboardingGenre(id: 35, name: "Comedy"),
        OnboardingGenre(id: 18, name: "Drama"),
        OnboardingGenre(id: 27, name: "Horror"),
        OnboardingGenre(id: 10749, name: "Romance"),
        OnboardingGenre(id: 878, name: "Sci-Fi"),
        OnboardingGenre(id: 14, name: "Fantasy"),
        OnboardingGenre(id: 53, name: "Thriller"),
        OnboardingGenre(id: 16, name: "Animation"),
        OnboardingGenre(id: 80, name: "Crime"),
        OnboardingGenre(id: 9648, name: "Mystery"),
        OnboardingGenre(id: 10751, name: "Family"),
      ]
    }
    
    // Combine genres from all selected content types
    var allGenres: [OnboardingGenre] = []
    var seenIds = Set<Int>()
    
    for type in contentTypes {
      let genres: [OnboardingGenre]
      switch type {
      case .movies:
        genres = OnboardingGenre.movieGenres
      case .series:
        genres = OnboardingGenre.tvGenres
      case .anime:
        genres = OnboardingGenre.animeGenres
      case .dorama:
        genres = OnboardingGenre.doramaGenres
      }
      
      for genre in genres {
        if !seenIds.contains(genre.id) {
          seenIds.insert(genre.id)
          allGenres.append(genre)
        }
      }
    }
    
    return allGenres
  }
  
  // MARK: - Local Saved Titles
  func addLocalTitle(tmdbId: Int, mediaType: String, title: String, posterPath: String?, status: String) {
    // Don't add duplicates
    guard !localSavedTitles.contains(where: { $0.tmdbId == tmdbId && $0.mediaType == mediaType }) else {
      return
    }
    
    let newTitle = LocalSavedTitle(
      id: localSavedTitles.count + 1,
      tmdbId: tmdbId,
      mediaType: mediaType,
      title: title,
      posterPath: posterPath,
      status: status,
      savedAt: Date()
    )
    
    localSavedTitles.append(newTitle)
    saveLocalTitles()
    
    // Track event
    AnalyticsService.shared.track(.onboardingTitleAdded(
      tmdbId: tmdbId,
      mediaType: mediaType,
      status: status
    ))
  }
  
  func removeLocalTitle(tmdbId: Int, mediaType: String) {
    localSavedTitles.removeAll { $0.tmdbId == tmdbId && $0.mediaType == mediaType }
    saveLocalTitles()
  }
  
  func isLocalTitleSaved(tmdbId: Int, mediaType: String) -> Bool {
    localSavedTitles.contains { $0.tmdbId == tmdbId && $0.mediaType == mediaType }
  }
  
  func getLocalTitleStatus(tmdbId: Int, mediaType: String) -> String? {
    localSavedTitles.first { $0.tmdbId == tmdbId && $0.mediaType == mediaType }?.status
  }
  
  private func saveLocalTitles() {
    if let data = try? JSONEncoder().encode(localSavedTitles) {
      UserDefaults.standard.set(data, forKey: localSavedTitlesKey)
    }
  }
  
  // MARK: - Completion
  func completeOnboarding() {
    hasCompletedOnboarding = true
    UserDefaults.standard.set(true, forKey: hasCompletedOnboardingKey)
    
    // Enter guest mode automatically
    UserDefaults.standard.set(true, forKey: "isGuestMode")
    NotificationCenter.default.post(name: .continueAsGuest, object: nil)
    
    AnalyticsService.shared.track(.onboardingComplete(titlesAdded: localSavedTitles.count))
  }
  
  // MARK: - Login Prompt
  var hasSeenLoginPrompt: Bool {
    get { UserDefaults.standard.bool(forKey: hasSeenLoginPromptKey) }
    set { UserDefaults.standard.set(newValue, forKey: hasSeenLoginPromptKey) }
  }
  
  // MARK: - Notification Prompt
  var hasSeenNotificationPrompt: Bool {
    get { UserDefaults.standard.bool(forKey: hasSeenNotificationPromptKey) }
    set { UserDefaults.standard.set(newValue, forKey: hasSeenNotificationPromptKey) }
  }
  
  // MARK: - Sync Local Data to Server
  func syncLocalDataToServer() async {
    guard AuthService.shared.isAuthenticated else { return }
    
    // Sync display name from onboarding if available
    if !userName.isEmpty {
      do {
        _ = try await AuthService.shared.updateUser(displayName: userName)
      } catch {
        print("Failed to sync display name: \(error)")
      }
    }
    
    // Sync content types and genres from onboarding
    if !contentTypes.isEmpty || !selectedGenres.isEmpty {
      do {
        let mediaTypeStrings = contentTypes.isEmpty ? nil : contentTypes.map { $0.rawValue }
        let genreIdInts = selectedGenres.isEmpty ? nil : selectedGenres.map { $0.id }
        try await AuthService.shared.updateUserPreferences(
          mediaTypes: mediaTypeStrings,
          genreIds: genreIdInts
        )
      } catch {
        print("Failed to sync content preferences: \(error)")
      }
    }
    
    for title in localSavedTitles {
      do {
        let apiMediaType = title.mediaType == "movie" ? "MOVIE" : "TV_SHOW"
        let status: UserItemStatus
        switch title.status {
        case "WATCHED": status = .watched
        case "WATCHING": status = .watching
        default: status = .watchlist
        }
        
        _ = try await UserItemService.shared.upsertUserItem(
          tmdbId: title.tmdbId,
          mediaType: apiMediaType,
          status: status
        )
      } catch {
        print("Failed to sync title \(title.tmdbId): \(error)")
      }
    }
    
    // Clear local data after sync
    localSavedTitles = []
    saveLocalTitles()
  }
  
  // MARK: - Reset (for testing)
  func reset() {
    hasCompletedOnboarding = false
    userName = ""
    contentTypes = []
    selectedGenres = []
    localSavedTitles = []
    
    UserDefaults.standard.removeObject(forKey: hasCompletedOnboardingKey)
    UserDefaults.standard.removeObject(forKey: userNameKey)
    UserDefaults.standard.removeObject(forKey: contentTypesKey)
    UserDefaults.standard.removeObject(forKey: selectedGenresKey)
    UserDefaults.standard.removeObject(forKey: localSavedTitlesKey)
    UserDefaults.standard.removeObject(forKey: hasSeenLoginPromptKey)
    UserDefaults.standard.removeObject(forKey: hasSeenNotificationPromptKey)
  }
}
