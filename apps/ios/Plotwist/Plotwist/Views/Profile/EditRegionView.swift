//
//  EditRegionView.swift
//  Plotwist
//

import SwiftUI

struct EditRegionView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var regions: [WatchRegion] = []
  @State private var filteredRegions: [WatchRegion] = []
  @State private var selectedRegion: String?
  @State private var searchText = ""
  @State private var isLoading = true
  @State private var isSaving = false

  let currentRegion: String?

  init(currentRegion: String?) {
    self.currentRegion = currentRegion
    _selectedRegion = State(initialValue: currentRegion)
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    selectedRegion != currentRegion && selectedRegion != nil
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        headerView
        contentView
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task { await loadRegions() }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private var headerView: some View {
    VStack(spacing: 0) {
      HStack {
        Button { dismiss() } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 40, height: 40)
            .background(Color.appInputFilled)
            .clipShape(Circle())
        }

        Spacer()

        Text(strings.region)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        saveButton
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      searchField

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private var saveButton: some View {
    Button {
      Task { await saveRegion() }
    } label: {
      if isSaving {
        ProgressView()
          .tint(.appBackgroundAdaptive)
          .frame(width: 40, height: 40)
          .background(Color.appForegroundAdaptive)
          .clipShape(Circle())
      } else {
        Image(systemName: "checkmark")
          .font(.system(size: 18, weight: .semibold))
          .foregroundColor(hasChanges ? .appBackgroundAdaptive : .appMutedForegroundAdaptive)
          .frame(width: 40, height: 40)
          .background(hasChanges ? Color.appForegroundAdaptive : Color.clear)
          .clipShape(Circle())
      }
    }
    .disabled(!hasChanges || isSaving)
  }

  private var searchField: some View {
    HStack(spacing: 8) {
      Image(systemName: "magnifyingglass")
        .foregroundColor(.appMutedForegroundAdaptive)
      TextField(strings.searchRegion, text: $searchText)
        .textInputAutocapitalization(.never)
        .autocorrectionDisabled()
        .onChange(of: searchText) { filterRegions() }
    }
    .padding(12)
    .background(Color.appInputFilled)
    .cornerRadius(12)
    .padding(.horizontal, 24)
    .padding(.bottom, 16)
  }

  @ViewBuilder
  private var contentView: some View {
    if isLoading {
      VStack {
        Spacer()
        ProgressView()
        Spacer()
      }
    } else {
      ScrollView(showsIndicators: false) {
        LazyVStack(spacing: 0) {
          ForEach(filteredRegions) { region in
            regionRow(region)
          }
        }
      }
    }
  }

  private func regionRow(_ region: WatchRegion) -> some View {
    VStack(spacing: 0) {
      Button {
        selectedRegion = region.iso31661
      } label: {
        HStack(spacing: 12) {
          Text(region.flagEmoji)
            .font(.title2)

          Text(region.englishName)
            .font(.subheadline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          if selectedRegion == region.iso31661 {
            Image(systemName: "checkmark")
              .font(.system(size: 16, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 14)
        .background(selectedRegion == region.iso31661 ? Color.appInputFilled : Color.clear)
      }

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.3))
        .frame(height: 1)
        .padding(.leading, 60)
    }
  }

  private func loadRegions() async {
    isLoading = true
    defer { isLoading = false }

    do {
      regions = try await TMDBService.shared.getAvailableRegions(language: Language.current.rawValue)
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
          || $0.iso31661.localizedCaseInsensitiveContains(searchText)
      }
    }
  }

  private func saveRegion() async {
    guard let selectedRegion else { return }

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
