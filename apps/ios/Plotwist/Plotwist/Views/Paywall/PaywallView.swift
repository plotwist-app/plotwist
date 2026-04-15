//
//  PaywallView.swift
//  Plotwist
//

import RevenueCat
import SwiftUI

struct PaywallView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var colorScheme
  @ObservedObject private var themeManager = ThemeManager.shared

  let source: String

  @State private var strings = L10n.current
  @State private var offerings: Offerings?
  @State private var selectedPackage: Package?
  @State private var isLoading = false
  @State private var showError = false
  @State private var errorMessage = ""
  @State private var backdropURL: URL?

  private var packages: [Package] {
    offerings?.current?.availablePackages ?? []
  }

  private var monthlyPackage: Package? {
    packages.first(where: { $0.packageType == .monthly })
  }

  private var annualPackage: Package? {
    packages.first(where: { $0.packageType == .annual })
  }

  private var selectedHasTrial: Bool {
    selectedPackage?.storeProduct.introductoryDiscount?.paymentMode == .freeTrial
  }


  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 0) {

        // Backdrop
        if let backdropURL {
          CachedAsyncImage(url: backdropURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            Rectangle().fill(Color.appInputFilled)
          }
          .frame(height: 220)
          .clipped()
        } else {
          Rectangle()
            .fill(Color.appInputFilled)
            .frame(height: 220)
        }

        // Title + subtitle
        VStack(spacing: 10) {
          HStack(spacing: 8) {
            Text(strings.paywallUpgradeTo)
              .font(.system(size: 22, weight: .bold))
              .foregroundColor(.appForegroundAdaptive)

            ProBadge(size: .large)
          }

          Text(strings.paywallSubtitle)
            .font(.system(size: 14))
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
            .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.top, 20)
        .padding(.horizontal, 32)

        // Plan selector
        if !packages.isEmpty {
          planSelector
            .padding(.top, 16)
            .padding(.horizontal, 24)
        }

        // CTA
        Button(action: { Task { await purchase() } }) {
          Group {
            if isLoading {
              ProgressView()
                .tint(.appBackgroundAdaptive)
            } else {
              Text(selectedHasTrial ? strings.paywallStartTrial : strings.paywallSubscribe)
                .fontWeight(.semibold)
            }
          }
          .frame(maxWidth: .infinity)
          .frame(height: 48)
          .background(Color.appForegroundAdaptive)
          .foregroundColor(.appBackgroundAdaptive)
          .clipShape(Capsule())
        }
        .disabled(selectedPackage == nil || isLoading)
        .opacity(selectedPackage == nil ? 0.5 : 1)
        .padding(.top, 16)
        .padding(.horizontal, 24)

        // Restore (required by Apple)
        Button(action: { Task { await restore() } }) {
          Text(strings.paywallRestore)
        }
        .font(.system(size: 12))
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.5))
        .padding(.top, 10)
        .padding(.bottom, 16)
      }
    }
    .floatingSheetDynamicPresentation()
    .preferredColorScheme(themeManager.current.colorScheme)
    .alert("Error", isPresented: $showError) {
      Button("OK", role: .cancel) {}
    } message: {
      Text(errorMessage)
    }
    .task {
      AnalyticsService.shared.track(.paywallView(source: source))
      async let offeringsTask: () = loadOfferings()
      async let backdropTask: () = loadBackdrop()
      _ = await (offeringsTask, backdropTask)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  // MARK: - Feature Row

  private func featureRow(icon: String, title: String, subtitle: String) -> some View {
    HStack(spacing: 16) {
      Image(systemName: icon)
        .font(.system(size: 18))
        .foregroundColor(.appForegroundAdaptive)
        .frame(width: 24)

      VStack(alignment: .leading, spacing: 2) {
        Text(title)
          .font(.system(size: 15, weight: .medium))
          .foregroundColor(.appForegroundAdaptive)

        Text(subtitle)
          .font(.system(size: 13))
          .foregroundColor(.appMutedForegroundAdaptive)
      }

      Spacer()
    }
    .padding(.vertical, 12)
  }

  // MARK: - Plan Selector

  private var planSelector: some View {
    VStack(spacing: 12) {
      if let monthly = monthlyPackage {
        planRow(monthly)
      }
      if let annual = annualPackage {
        planRow(annual)
      }
    }
  }

  private func planRow(_ package: Package) -> some View {
    let isSelected = selectedPackage?.identifier == package.identifier
    let isAnnual = package.packageType == .annual
    let hasTrial = package.storeProduct.introductoryDiscount?.paymentMode == .freeTrial
    let trialDays = package.storeProduct.introductoryDiscount?.subscriptionPeriod.value ?? 0

    return Button {
      withAnimation(.easeInOut(duration: 0.15)) {
        selectedPackage = package
      }
    } label: {
      HStack {
        // Radio indicator
        Circle()
          .strokeBorder(isSelected ? Color.appForegroundAdaptive : Color.appBorderAdaptive, lineWidth: isSelected ? 6 : 1.5)
          .frame(width: 20, height: 20)

        // Plan name
        Text(isAnnual ? strings.paywallYear.capitalized : strings.paywallMonth.capitalized)
          .font(.system(size: 16, weight: .medium))
          .foregroundColor(.appForegroundAdaptive)

        // Trial badge
        if hasTrial {
          Text("\(trialDays)-day free trial")
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(.green)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(Color.green.opacity(0.12))
            .clipShape(Capsule())
        }

        Spacer()

        // Price
        Text(package.localizedPriceString)
          .font(.system(size: 16, weight: .semibold))
          .foregroundColor(.appForegroundAdaptive)
      }
      .padding(.horizontal, 16)
      .padding(.vertical, 14)
      .background(colorScheme == .light ? Color.appInputFilled : Color.appBackgroundAdaptive)
      .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
      .overlay(
        RoundedRectangle(cornerRadius: 14, style: .continuous)
          .stroke(isSelected ? Color.appForegroundAdaptive : Color.clear, lineWidth: 1.5)
      )
    }
    .buttonStyle(.plain)
  }

  // MARK: - Actions

  private func showErrorAlert(_ message: String) {
    errorMessage = message
    showError = true
  }

  private func loadBackdrop() async {
    let language = Language.current.rawValue

    if let url = await backdropFromPreferences(language: language) {
      backdropURL = url
      return
    }

    if let url = await backdropFromTrending(language: language) {
      backdropURL = url
    }
  }

  private func backdropFromPreferences(language: String) async -> URL? {
    guard let prefs = try? await AuthService.shared.getUserPreferences(),
          let genreIds = prefs.genreIds, !genreIds.isEmpty else { return nil }

    let mediaType: String
    if let types = prefs.mediaTypes, !types.isEmpty {
      let first = ContentTypePreference(rawValue: types[0])
      mediaType = (first == .movies) ? "movie" : "tv"
    } else {
      mediaType = "movie"
    }

    guard let results = try? await TMDBService.shared.discoverByGenres(
      mediaType: mediaType, genreIds: genreIds, language: language
    ) else { return nil }

    let withBackdrop = results.filter { $0.backdropPath != nil }
    guard let pick = withBackdrop.prefix(5).randomElement() else { return nil }
    return pick.hdBackdropURL ?? pick.backdropURL
  }

  private func backdropFromTrending(language: String) async -> URL? {
    guard let trending = try? await TMDBService.shared.getTrending(
      mediaType: "movie", timeWindow: "week", language: language
    ) else { return nil }
    let withBackdrop = trending.filter { $0.backdropPath != nil }
    guard let pick = withBackdrop.randomElement() else { return nil }
    return pick.hdBackdropURL ?? pick.backdropURL
  }

  private func loadOfferings() async {
    do {
      offerings = try await SubscriptionService.shared.getOfferings()
      if let monthly = monthlyPackage {
        selectedPackage = monthly
      } else {
        selectedPackage = packages.first
      }
    } catch {
      showErrorAlert(error.localizedDescription)
    }
  }

  private func purchase() async {
    guard let package = selectedPackage else { return }
    isLoading = true
    defer { isLoading = false }

    do {
      let success = try await SubscriptionService.shared.purchasePackage(package)
      if success { dismiss() }
    } catch {
      showErrorAlert(error.localizedDescription)
    }
  }

  private func restore() async {
    AnalyticsService.shared.track(.restorePurchases)
    do {
      try await SubscriptionService.shared.restorePurchases()
      if SubscriptionService.shared.isPro { dismiss() }
    } catch {
      showErrorAlert(error.localizedDescription)
    }
  }
}

#Preview {
  PaywallView(source: "preview")
}
