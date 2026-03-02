//
//  SubscriptionService.swift
//  Plotwist
//

import Foundation
import RevenueCat

@MainActor
class SubscriptionService: ObservableObject {
  static let shared = SubscriptionService()

  @Published private(set) var isPro: Bool = false
  @Published private(set) var isLoading: Bool = false

  private var isConfigured = false

  private init() {}

  // MARK: - Setup

  func setup() {
    guard !isConfigured else { return }
    let apiKey = Env.revenueCatAPIKey
    guard !apiKey.isEmpty else {
      print("⚠️ [SubscriptionService] Missing REVENUECAT_API_KEY")
      return
    }
    Purchases.logLevel = .warn
    Purchases.configure(withAPIKey: apiKey)
    isConfigured = true
  }

  func configure(userId: String) {
    guard isConfigured else { return }
    Purchases.shared.logIn(userId) { [weak self] customerInfo, _, _ in
      Task { @MainActor in
        self?.updateProStatus(from: customerInfo)
      }
    }
  }

  func logout() {
    guard isConfigured else {
      isPro = false
      return
    }
    Purchases.shared.logOut { [weak self] _, _ in
      Task { @MainActor in
        self?.isPro = false
      }
    }
  }

  // MARK: - Restore & Refresh

  func refreshStatus() async {
    guard isConfigured else { return }
    do {
      let customerInfo = try await Purchases.shared.customerInfo()
      updateProStatus(from: customerInfo)
    } catch {
      print("⚠️ [SubscriptionService] Failed to refresh: \(error)")
    }
  }

  func restorePurchases() async throws {
    guard isConfigured else { return }
    isLoading = true
    defer { isLoading = false }
    let customerInfo = try await Purchases.shared.restorePurchases()
    updateProStatus(from: customerInfo)
  }

  // MARK: - Purchase

  func purchasePackage(_ package: Package) async throws -> Bool {
    guard isConfigured else { return false }
    isLoading = true
    defer { isLoading = false }
    let result = try await Purchases.shared.purchase(package: package)
    updateProStatus(from: result.customerInfo)
    if !result.userCancelled {
      AnalyticsService.shared.track(.subscribe(plan: package.identifier))
    }
    return !result.userCancelled
  }

  // MARK: - Offerings

  func getOfferings() async throws -> Offerings? {
    guard isConfigured else { return nil }
    return try await Purchases.shared.offerings()
  }

  // MARK: - Private

  private func updateProStatus(from customerInfo: CustomerInfo?) {
    let active = customerInfo?.entitlements["pro"]?.isActive == true
    if isPro != active {
      isPro = active
      NotificationCenter.default.post(name: .subscriptionChanged, object: nil)
    }
  }
}

// MARK: - Notification

extension Notification.Name {
  static let subscriptionChanged = Notification.Name("subscriptionChanged")
}
