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

  private init() {
    // Listen for profile updates
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleProfileUpdated),
      name: .profileUpdated,
      object: nil
    )

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

  @objc private func handleProfileUpdated() {
    Task { await loadPreferences() }
  }

  @objc private func handleAuthChanged() {
    if AuthService.shared.isAuthenticated {
      Task { await loadPreferences() }
    } else {
      preferences = nil
    }
  }

  func loadPreferences() async {
    guard AuthService.shared.isAuthenticated else {
      await MainActor.run { preferences = nil }
      return
    }

    await MainActor.run { isLoading = true }
    defer { Task { @MainActor in isLoading = false } }

    do {
      let prefs = try await AuthService.shared.getUserPreferences()
      await MainActor.run { preferences = prefs }
    } catch {
      print("Error loading preferences: \(error)")
    }
  }

  // MARK: - Computed Properties
  var hasStreamingServices: Bool {
    guard let ids = preferences?.watchProvidersIds else { return false }
    return !ids.isEmpty
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
