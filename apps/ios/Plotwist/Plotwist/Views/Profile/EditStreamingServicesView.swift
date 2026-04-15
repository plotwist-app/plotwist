//
//  EditStreamingServicesView.swift
//  Plotwist
//

import SwiftUI

struct EditStreamingServicesView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var providers: [StreamingProvider] = []
  @State private var filteredProviders: [StreamingProvider] = []
  @State private var selectedIds: Set<Int>
  @State private var searchText = ""
  @State private var isLoading = true
  @State private var isSaving = false

  let watchRegion: String
  let initialSelectedIds: [Int]

  init(watchRegion: String, selectedIds: [Int]) {
    self.watchRegion = watchRegion
    self.initialSelectedIds = selectedIds
    _selectedIds = State(initialValue: Set(selectedIds))
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    Set(initialSelectedIds) != selectedIds
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
    .task { await loadProviders() }
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

        Text(strings.streamingServices)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        saveButton
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      searchField
      hintMessage

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private var saveButton: some View {
    Button {
      Task { await saveServices() }
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
      TextField(strings.searchStreamingServices, text: $searchText)
        .textInputAutocapitalization(.never)
        .autocorrectionDisabled()
        .onChange(of: searchText) { filterProviders() }
    }
    .padding(12)
    .background(Color.appInputFilled)
    .cornerRadius(12)
    .padding(.horizontal, 24)
    .padding(.bottom, 16)
  }

  private var hintMessage: some View {
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
          ForEach(filteredProviders) { provider in
            providerRow(provider)
          }
        }
      }
    }
  }

  private func providerRow(_ provider: StreamingProvider) -> some View {
    VStack(spacing: 0) {
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
        .background(selectedIds.contains(provider.providerId) ? Color.appInputFilled : Color.clear)
      }

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.3))
        .frame(height: 1)
        .padding(.leading, 76)
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
