//
//  EditContentPreferencesView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Edit Media Types View
struct EditMediaTypesView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var selectedTypes: Set<ContentTypePreference>
  @State private var isSaving = false
  @State private var backdropData = ContentTypeBackdropData()

  let currentMediaTypes: [String]?

  init(currentMediaTypes: [String]?) {
    self.currentMediaTypes = currentMediaTypes
    let types = Set((currentMediaTypes ?? []).compactMap { ContentTypePreference(rawValue: $0) })
    _selectedTypes = State(initialValue: types)
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    let currentSet = Set((currentMediaTypes ?? []).compactMap { ContentTypePreference(rawValue: $0) })
    return selectedTypes != currentSet
  }

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        headerView

        ScrollView {
          GeometryReader { geometry in
            let spacing: CGFloat = 12
            let horizontalPadding: CGFloat = 24
            let availableWidth = geometry.size.width - (horizontalPadding * 2) - spacing
            let cardWidth = availableWidth / 2
            let cardHeight = cardWidth * 0.85

            LazyVGrid(columns: columns, spacing: spacing) {
              ForEach(ContentTypePreference.allCases, id: \.rawValue) { type in
                ContentTypeCard(
                  type: type,
                  isSelected: selectedTypes.contains(type),
                  backdropImage: backdropData.images[type],
                  action: { toggleType(type) }
                )
                .frame(height: cardHeight)
              }
            }
            .padding(.horizontal, horizontalPadding)
          }
          .frame(height: 340)
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
    .task { backdropData = await ContentTypeBackdropData.load() }
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

        Text(strings.content)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        saveButton
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private var saveButton: some View {
    Button {
      Task { await save() }
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

  private func save() async {
    isSaving = true
    defer { isSaving = false }

    do {
      try await AuthService.shared.updateUserPreferences(
        mediaTypes: selectedTypes.map { $0.rawValue }
      )
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      // Silently fail
    }
  }
}

// MARK: - Edit Genres View
struct EditGenresView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current
  @State private var selectedGenreIds: Set<Int>
  @State private var isSaving = false

  let currentGenreIds: [Int]?

  init(currentGenreIds: [Int]?) {
    self.currentGenreIds = currentGenreIds
    _selectedGenreIds = State(initialValue: Set(currentGenreIds ?? []))
  }

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  private var hasChanges: Bool {
    selectedGenreIds != Set(currentGenreIds ?? [])
  }

  // All unique genres across all categories
  private var allGenres: [OnboardingGenre] {
    var genres: [OnboardingGenre] = []
    var seenIds = Set<Int>()
    let sources = OnboardingGenre.movieGenres + OnboardingGenre.tvGenres + OnboardingGenre.animeGenres + OnboardingGenre.doramaGenres
    for genre in sources {
      if !seenIds.contains(genre.id) {
        seenIds.insert(genre.id)
        genres.append(genre)
      }
    }
    return genres
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        headerView

        ScrollView {
          FlowLayout(spacing: 10, alignment: .center) {
            ForEach(allGenres) { genre in
              GenreChip(
                genre: genre,
                isSelected: selectedGenreIds.contains(genre.id),
                action: {
                  withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    if selectedGenreIds.contains(genre.id) {
                      selectedGenreIds.remove(genre.id)
                    } else {
                      selectedGenreIds.insert(genre.id)
                      let impact = UIImpactFeedbackGenerator(style: .light)
                      impact.impactOccurred()
                    }
                  }
                }
              )
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 24)
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(effectiveColorScheme)
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

        Text(strings.genres)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        saveButton
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private var saveButton: some View {
    Button {
      Task { await save() }
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

  private func save() async {
    isSaving = true
    defer { isSaving = false }

    do {
      try await AuthService.shared.updateUserPreferences(
        genreIds: Array(selectedGenreIds)
      )
      NotificationCenter.default.post(name: .profileUpdated, object: nil)
      dismiss()
    } catch {
      // Silently fail
    }
  }
}
