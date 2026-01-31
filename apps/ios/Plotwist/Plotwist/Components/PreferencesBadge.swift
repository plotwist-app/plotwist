//
//  PreferencesBadge.swift
//  Plotwist
//

import SwiftUI

struct PreferencesBadge: View {
  @ObservedObject private var preferencesManager = UserPreferencesManager.shared
  @State private var strings = L10n.current
  @State private var showPreferences = false

  var body: some View {
    if preferencesManager.hasStreamingServices {
      Button {
        showPreferences = true
      } label: {
        HStack(spacing: 6) {
          Image(systemName: "sparkles")
            .font(.caption)
          Text(strings.resultsBasedOnPreferences)
            .font(.caption)
        }
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Color.appInputFilled)
        .clipShape(RoundedRectangle(cornerRadius: 8))
      }
      .sheet(isPresented: $showPreferences) {
        PreferencesQuickSheet()
      }
      .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
        strings = L10n.current
      }
    }
  }
}

// MARK: - Preferences Quick Sheet
struct PreferencesQuickSheet: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @ObservedObject private var preferencesManager = UserPreferencesManager.shared
  @State private var strings = L10n.current
  @State private var showRegionPicker = false
  @State private var showServicesPicker = false
  @State private var streamingProviders: [StreamingProvider] = []

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var selectedProviders: [StreamingProvider] {
    streamingProviders.filter { preferencesManager.watchProvidersIds.contains($0.providerId) }
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          // Header
          VStack(spacing: 0) {
            HStack {
              Button {
                dismiss()
              } label: {
                Image(systemName: "xmark")
                  .font(.system(size: 16, weight: .semibold))
                  .foregroundColor(.appForegroundAdaptive)
                  .frame(width: 36, height: 36)
                  .background(Color.appInputFilled)
                  .clipShape(Circle())
              }

              Spacer()

              Text(strings.preferences)
                .font(.title3.bold())
                .foregroundColor(.appForegroundAdaptive)

              Spacer()

              Color.clear
                .frame(width: 36, height: 36)
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 16)

            Rectangle()
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(height: 1)
          }

          // Content
          ScrollView {
            VStack(alignment: .leading, spacing: 0) {
              // Region
              if let region = preferencesManager.watchRegion {
                Button {
                  showRegionPicker = true
                } label: {
                  PreferencesBadgeRow(label: strings.region) {
                    PreferencesItemBadge(
                      text: regionName(for: region),
                      prefix: flagEmoji(for: region)
                    )
                  }
                }
                .sheet(isPresented: $showRegionPicker) {
                  RegionPickerSheet(currentRegion: region)
                }

                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.3))
                  .frame(height: 1)
                  .padding(.leading, 24)

                // Streaming Services
                Button {
                  showServicesPicker = true
                } label: {
                  PreferencesBadgeRow(label: strings.streamingServices) {
                    if selectedProviders.isEmpty {
                      Text(strings.notSet)
                        .font(.caption)
                        .foregroundColor(.appMutedForegroundAdaptive)
                    } else {
                      PreferencesFlowLayout(spacing: 8) {
                        ForEach(selectedProviders) { provider in
                          PreferencesItemBadge(
                            text: provider.providerName,
                            logoURL: provider.logoURL
                          )
                        }
                      }
                    }
                  }
                }
                .sheet(isPresented: $showServicesPicker) {
                  ServicesPickerSheet(
                    watchRegion: region,
                    selectedIds: preferencesManager.watchProvidersIds
                  )
                }
              } else {
                Button {
                  showRegionPicker = true
                } label: {
                  PreferencesBadgeRow(label: strings.region) {
                    Text(strings.notSet)
                      .font(.caption)
                      .foregroundColor(.appMutedForegroundAdaptive)
                  }
                }
                .sheet(isPresented: $showRegionPicker) {
                  RegionPickerSheet(currentRegion: nil)
                }

                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.3))
                  .frame(height: 1)
                  .padding(.leading, 24)

                PreferencesBadgeRow(label: strings.streamingServices) {
                  Text(strings.selectRegionFirst)
                    .font(.caption)
                    .foregroundColor(.appMutedForegroundAdaptive)
                }
                .opacity(0.5)
              }
            }
          }

          Spacer()
        }
      }
      .navigationBarHidden(true)
      .preferredColorScheme(effectiveColorScheme)
    }
    .task {
      await loadProviders()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(NotificationCenter.default.publisher(for: .profileUpdated)) { _ in
      Task { await loadProviders() }
    }
  }

  private func loadProviders() async {
    guard let region = preferencesManager.watchRegion else { return }
    do {
      streamingProviders = try await TMDBService.shared.getStreamingProviders(
        watchRegion: region,
        language: Language.current.rawValue
      )
    } catch {
      print("Error loading providers: \(error)")
    }
  }

  private func regionName(for code: String) -> String {
    let locale = Locale(identifier: Language.current.rawValue)
    return locale.localizedString(forRegionCode: code) ?? code
  }

  private func flagEmoji(for code: String) -> String {
    let base: UInt32 = 127397
    var emoji = ""
    for scalar in code.uppercased().unicodeScalars {
      if let unicode = UnicodeScalar(base + scalar.value) {
        emoji.append(String(unicode))
      }
    }
    return emoji
  }
}

// MARK: - Preferences Badge Row
struct PreferencesBadgeRow<Content: View>: View {
  let label: String
  @ViewBuilder let content: Content

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 100, alignment: .topLeading)
        .multilineTextAlignment(.leading)

      content
        .frame(maxWidth: .infinity, alignment: .leading)

      Image(systemName: "chevron.right")
        .font(.system(size: 14, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 16)
    .contentShape(Rectangle())
  }
}

// MARK: - Preferences Item Badge
struct PreferencesItemBadge: View {
  let text: String
  var prefix: String? = nil
  var logoURL: URL? = nil

  var body: some View {
    HStack(spacing: 6) {
      if let prefix {
        Text(prefix)
          .font(.caption)
      }

      if let logoURL {
        CachedAsyncImage(url: logoURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          Rectangle()
            .fill(Color.appInputFilled)
        }
        .frame(width: 18, height: 18)
        .cornerRadius(4)
      }

      Text(text)
        .font(.caption)
        .foregroundColor(.appForegroundAdaptive)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 6))
  }
}

// MARK: - Preferences Flow Layout
struct PreferencesFlowLayout: Layout {
  var spacing: CGFloat = 8

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    let maxWidth = proposal.width ?? .infinity
    var height: CGFloat = 0
    var currentRowWidth: CGFloat = 0
    var currentRowHeight: CGFloat = 0

    for subview in subviews {
      let size = subview.sizeThatFits(.unspecified)

      if currentRowWidth + size.width > maxWidth && currentRowWidth > 0 {
        height += currentRowHeight + spacing
        currentRowWidth = 0
        currentRowHeight = 0
      }

      currentRowWidth += size.width + spacing
      currentRowHeight = max(currentRowHeight, size.height)
    }

    height += currentRowHeight
    return CGSize(width: maxWidth, height: height)
  }

  func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
    var x = bounds.minX
    var y = bounds.minY
    var currentRowHeight: CGFloat = 0

    for subview in subviews {
      let size = subview.sizeThatFits(.unspecified)

      if x + size.width > bounds.maxX && x > bounds.minX {
        x = bounds.minX
        y += currentRowHeight + spacing
        currentRowHeight = 0
      }

      subview.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
      x += size.width + spacing
      currentRowHeight = max(currentRowHeight, size.height)
    }
  }
}

// MARK: - Region Picker Sheet
struct RegionPickerSheet: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var searchText = ""
  @State private var regions: [WatchRegion] = []
  @State private var filteredRegions: [WatchRegion] = []
  @State private var isLoading = true
  @State private var isSaving = false
  @State private var selectedRegion: String

  init(currentRegion: String?) {
    _selectedRegion = State(initialValue: currentRegion ?? "")
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    !selectedRegion.isEmpty
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "xmark")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 36, height: 36)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.region)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Button {
              Task { await saveRegion() }
            } label: {
              if isSaving {
                ProgressView()
                  .frame(width: 36, height: 36)
              } else {
                Image(systemName: "checkmark")
                  .font(.system(size: 16, weight: .semibold))
                  .foregroundColor(hasChanges ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
                  .frame(width: 36, height: 36)
                  .background(hasChanges ? Color.appForegroundAdaptive : Color.appInputFilled)
                  .clipShape(Circle())
              }
            }
            .disabled(!hasChanges || isSaving)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Search Field
        HStack(spacing: 8) {
          Image(systemName: "magnifyingglass")
            .foregroundColor(.appMutedForegroundAdaptive)
          TextField(strings.searchRegion, text: $searchText)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .onChange(of: searchText) { _ in
              filterRegions()
            }
        }
        .padding(12)
        .background(Color.appInputFilled)
        .cornerRadius(12)
        .padding(.horizontal, 24)
        .padding(.vertical, 16)

        Rectangle()
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(height: 1)

        // Content
        if isLoading {
          Spacer()
          ProgressView()
          Spacer()
        } else {
          ScrollView {
            LazyVStack(spacing: 0) {
              ForEach(filteredRegions) { region in
                Button {
                  selectedRegion = region.iso31661
                } label: {
                  HStack(spacing: 12) {
                    Text(region.flagEmoji)
                      .font(.title2)

                    Text(region.nativeName)
                      .font(.subheadline)
                      .foregroundColor(.appForegroundAdaptive)

                    Spacer()

                    if selectedRegion == region.iso31661 {
                      Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(.appForegroundAdaptive)
                    }
                  }
                  .padding(.horizontal, 24)
                  .padding(.vertical, 12)
                  .background(
                    selectedRegion == region.iso31661
                      ? Color.appInputFilled : Color.clear
                  )
                }

                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.3))
                  .frame(height: 1)
                  .padding(.leading, 60)
              }
            }
          }
        }
      }
    }
    .preferredColorScheme(effectiveColorScheme)
    .task {
      await loadRegions()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func loadRegions() async {
    isLoading = true
    defer { isLoading = false }

    do {
      regions = try await TMDBService.shared.getAvailableRegions(
        language: Language.current.rawValue
      )
      filterRegions()
    } catch {
      print("Error loading regions: \(error)")
    }
  }

  private func filterRegions() {
    if searchText.isEmpty {
      filteredRegions = regions
    } else {
      filteredRegions = regions.filter {
        $0.englishName.localizedCaseInsensitiveContains(searchText)
          || $0.nativeName.localizedCaseInsensitiveContains(searchText)
      }
    }
  }

  private func saveRegion() async {
    guard hasChanges else { return }

    isSaving = true
    defer { isSaving = false }

    do {
      try await AuthService.shared.updateUserPreferences(watchRegion: selectedRegion)
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      print("Error saving region: \(error)")
    }
  }
}

// MARK: - Services Picker Sheet
struct ServicesPickerSheet: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var searchText = ""
  @State private var providers: [StreamingProvider] = []
  @State private var filteredProviders: [StreamingProvider] = []
  @State private var isLoading = true
  @State private var isSaving = false
  @State private var selectedIds: Set<Int>

  let watchRegion: String

  init(watchRegion: String, selectedIds: [Int]) {
    self.watchRegion = watchRegion
    _selectedIds = State(initialValue: Set(selectedIds))
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        VStack(spacing: 0) {
          HStack {
            Button {
              dismiss()
            } label: {
              Image(systemName: "xmark")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 36, height: 36)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }

            Spacer()

            Text(strings.streamingServices)
              .font(.title3.bold())
              .foregroundColor(.appForegroundAdaptive)

            Spacer()

            Button {
              Task { await saveServices() }
            } label: {
              if isSaving {
                ProgressView()
                  .frame(width: 36, height: 36)
              } else {
                Image(systemName: "checkmark")
                  .font(.system(size: 16, weight: .semibold))
                  .foregroundColor(.appBackgroundAdaptive)
                  .frame(width: 36, height: 36)
                  .background(Color.appForegroundAdaptive)
                  .clipShape(Circle())
              }
            }
            .disabled(isSaving)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 16)

          Rectangle()
            .fill(Color.appBorderAdaptive.opacity(0.5))
            .frame(height: 1)
        }

        // Search Field
        HStack(spacing: 8) {
          Image(systemName: "magnifyingglass")
            .foregroundColor(.appMutedForegroundAdaptive)
          TextField(strings.searchStreamingServices, text: $searchText)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .onChange(of: searchText) { _ in
              filterProviders()
            }
        }
        .padding(12)
        .background(Color.appInputFilled)
        .cornerRadius(12)
        .padding(.horizontal, 24)
        .padding(.bottom, 16)

        // Hint message
        HStack(spacing: 8) {
          Image(systemName: "info.circle")
            .font(.caption)
          Text(strings.streamingServicesHint)
            .font(.caption)
        }
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 24)
        .padding(.bottom, 16)

        Rectangle()
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(height: 1)

        // Content
        if isLoading {
          Spacer()
          ProgressView()
          Spacer()
        } else {
          ScrollView {
            LazyVStack(spacing: 0) {
              ForEach(filteredProviders) { provider in
                Button {
                  toggleProvider(provider.providerId)
                } label: {
                  HStack(spacing: 12) {
                    CachedAsyncImage(url: provider.logoURL) { image in
                      image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                    } placeholder: {
                      Rectangle()
                        .fill(Color.appInputFilled)
                    }
                    .frame(width: 40, height: 40)
                    .cornerRadius(8)

                    Text(provider.providerName)
                      .font(.subheadline)
                      .foregroundColor(.appForegroundAdaptive)

                    Spacer()

                    if selectedIds.contains(provider.providerId) {
                      Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 22))
                        .foregroundColor(.appForegroundAdaptive)
                    } else {
                      Image(systemName: "circle")
                        .font(.system(size: 22))
                        .foregroundColor(.appMutedForegroundAdaptive)
                    }
                  }
                  .padding(.horizontal, 24)
                  .padding(.vertical, 12)
                  .background(
                    selectedIds.contains(provider.providerId)
                      ? Color.appInputFilled : Color.clear
                  )
                }

                Rectangle()
                  .fill(Color.appBorderAdaptive.opacity(0.3))
                  .frame(height: 1)
                  .padding(.leading, 76)
              }
            }
          }
        }
      }
    }
    .preferredColorScheme(effectiveColorScheme)
    .task {
      await loadProviders()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func toggleProvider(_ id: Int) {
    if selectedIds.contains(id) {
      selectedIds.remove(id)
    } else {
      selectedIds.insert(id)
    }
  }

  private func loadProviders() async {
    isLoading = true
    defer { isLoading = false }

    do {
      providers = try await TMDBService.shared.getStreamingProviders(
        watchRegion: watchRegion,
        language: Language.current.rawValue
      )
      filterProviders()
    } catch {
      print("Error loading providers: \(error)")
    }
  }

  private func filterProviders() {
    if searchText.isEmpty {
      filteredProviders = providers
    } else {
      filteredProviders = providers.filter {
        $0.providerName.localizedCaseInsensitiveContains(searchText)
      }
    }
  }

  private func saveServices() async {
    isSaving = true
    defer { isSaving = false }

    do {
      try await AuthService.shared.updateUserPreferences(
        watchRegion: watchRegion,
        watchProvidersIds: Array(selectedIds)
      )
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      print("Error saving services: \(error)")
    }
  }
}
