//
//  UserPreferencesManager.swift
//  Plotwist
//

import Foundation
import Combine

class UserPreferencesManager: ObservableObject {
  static let shared = UserPreferencesManager()

  @Published var preferences: UserPreferences?
  @Published var isLoading = false

  /// Serial task to prevent concurrent loadPreferences() calls
  private var loadTask: Task<Void, Never>?

  private init() {
    // Listen for auth changes
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAuthChanged),
      name: .authChanged,
      object: nil
    )

    // Load preferences if authenticated
    if AuthService.shared.isAuthenticated {
      Task { await loadPreferences() }
    }
  }

  @objc private func handleAuthChanged() {
    if AuthService.shared.isAuthenticated {
      Task { await loadPreferences() }
    } else {
      preferences = nil
    }
  }

  /// Loads preferences from the server. Safe to call multiple times —
  /// concurrent calls are serialized so only one network request runs at a time.
  func loadPreferences() async {
    // Cancel any in-flight load and wait for it
    loadTask?.cancel()

    let task = Task { @MainActor in
      guard AuthService.shared.isAuthenticated else {
        preferences = nil
        return
      }

      isLoading = true
      defer { isLoading = false }

      do {
        let prefs = try await AuthService.shared.getUserPreferences()
        preferences = prefs
      } catch {
        if !Task.isCancelled {
          print("Error loading preferences: \(error)")
        }
      }
    }
    loadTask = task
    await task.value
  }

  // MARK: - Computed Properties
  var hasStreamingServices: Bool {
    guard let ids = preferences?.watchProvidersIds else { return false }
    return !ids.isEmpty
  }

  var hasContentTypes: Bool {
    guard let types = preferences?.mediaTypes else { return false }
    return !types.isEmpty
  }

  var hasGenres: Bool {
    guard let ids = preferences?.genreIds else { return false }
    return !ids.isEmpty
  }

  /// True if the user has any preference configured (streaming, content types, or genres)
  var hasAnyPreference: Bool {
    hasStreamingServices || hasContentTypes || hasGenres
  }

  var contentTypes: [ContentTypePreference] {
    guard let types = preferences?.mediaTypes else { return [] }
    return types.compactMap { ContentTypePreference(rawValue: $0) }
  }

  var genreIds: [Int] {
    preferences?.genreIds ?? []
  }

  var watchRegion: String? {
    preferences?.watchRegion
  }

  var watchProvidersIds: [Int] {
    preferences?.watchProvidersIds ?? []
  }

  var watchProvidersString: String {
    watchProvidersIds.map { String($0) }.joined(separator: "|")
  }
}
