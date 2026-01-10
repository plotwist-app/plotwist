//
//  HomeView.swift
//  Plotwist
//

import SwiftUI

struct HomeView: View {
  @State private var selectedTab = 0

  var body: some View {
    TabView(selection: $selectedTab) {
      HomeTabView()
        .tabItem {
          Image(systemName: "house.fill")
        }
        .tag(0)

      SearchTabView()
        .tabItem {
          Image(systemName: "magnifyingglass")
        }
        .tag(1)

      ProfileTabView()
        .tabItem {
          Image(systemName: "person.fill")
        }
        .tag(2)
    }
    .tint(.appForegroundAdaptive)
    .onAppear {
      let appearance = UITabBarAppearance()
      appearance.configureWithOpaqueBackground()
      appearance.shadowColor = UIColor(Color.appBorderAdaptive)
      appearance.stackedLayoutAppearance.normal.iconColor = UIColor(
        Color.appMutedForegroundAdaptive)
      appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color.appForegroundAdaptive)

      // Add vertical padding to icons - move them down from top border
      let iconOffset = UIOffset(horizontal: 0, vertical: 4)
      appearance.stackedLayoutAppearance.normal.titlePositionAdjustment = iconOffset
      appearance.stackedLayoutAppearance.selected.titlePositionAdjustment = iconOffset

      UITabBar.appearance().standardAppearance = appearance
      UITabBar.appearance().scrollEdgeAppearance = appearance
    }
    .safeAreaInset(edge: .bottom) {
      Color.clear.frame(height: 24)
    }
  }
}

// MARK: - Home Tab
struct HomeTabView: View {
  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        Text("Home")
          .font(.title2)
          .foregroundColor(.appMutedForegroundAdaptive)
      }
      .navigationBarHidden(true)
    }
  }
}

// MARK: - Search Tab
struct SearchTabView: View {
  @State private var searchText = ""
  @State private var results: [SearchResult] = []
  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var isLoading = false
  @State private var isLoadingPopular = true
  @State private var strings = L10n.current
  @State private var searchTask: Task<Void, Never>?

  private var movies: [SearchResult] {
    results.filter { $0.mediaType == "movie" }
  }

  private var tvSeries: [SearchResult] {
    results.filter { $0.mediaType == "tv" }
  }

  private var people: [SearchResult] {
    results.filter { $0.mediaType == "person" }
  }

  private var isSearching: Bool {
    !searchText.isEmpty
  }

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          // Search Header
          VStack(spacing: 0) {
            HStack(spacing: 12) {
              HStack(spacing: 12) {
                Image(systemName: "magnifyingglass")
                  .foregroundColor(.appMutedForegroundAdaptive)

                TextField(strings.searchPlaceholder, text: $searchText)
                  .textInputAutocapitalization(.never)
                  .autocorrectionDisabled()
              }
              .padding(12)
              .background(Color.appInputFilled)
              .clipShape(RoundedRectangle(cornerRadius: 12))

              if !searchText.isEmpty {
                Button {
                  withAnimation(.easeInOut(duration: 0.2)) {
                    searchText = ""
                    results = []
                  }
                } label: {
                  Text(strings.cancel)
                    .font(.subheadline)
                    .foregroundColor(.appForegroundAdaptive)
                }
                .transition(.opacity.combined(with: .move(edge: .trailing)))
              }
            }
            .animation(.easeInOut(duration: 0.2), value: searchText.isEmpty)
            .padding(.horizontal, 24)
            .padding(.vertical, 16)

            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
          }

          // Results
          if isLoading || isLoadingPopular {
            ScrollView {
              LazyVStack(alignment: .leading, spacing: 24) {
                SearchSkeletonSection()
                SearchSkeletonSection()
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 24)
            }
          } else if isSearching {
            if results.isEmpty {
              Spacer()
              Text(strings.noResults)
                .foregroundColor(.appMutedForegroundAdaptive)
              Spacer()
            } else {
              ScrollView {
                LazyVStack(alignment: .leading, spacing: 24) {
                  if !movies.isEmpty {
                    SearchSection(title: strings.movies, results: movies)
                  }

                  if !tvSeries.isEmpty {
                    SearchSection(title: strings.tvSeries, results: tvSeries)
                  }

                  if !people.isEmpty {
                    SearchSection(title: strings.people, results: people)
                  }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 24)
              }
            }
          } else {
            // Show popular content
            ScrollView {
              LazyVStack(alignment: .leading, spacing: 24) {
                if !popularMovies.isEmpty {
                  SearchSection(
                    title: strings.popularMovies, results: popularMovies)
                }

                if !popularTVSeries.isEmpty {
                  SearchSection(
                    title: strings.popularTVSeries, results: popularTVSeries)
                }
              }
              .padding(.horizontal, 24)
              .padding(.vertical, 24)
            }
          }
        }
      }
      .navigationBarHidden(true)
    }
    .task {
      await loadPopularContent()
    }
    .onChange(of: searchText) { newValue in
      searchTask?.cancel()
      searchTask = Task {
        try? await Task.sleep(nanoseconds: 500_000_000)  // 500ms debounce
        guard !Task.isCancelled else { return }
        await performSearch(query: newValue)
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func loadPopularContent() async {
    isLoadingPopular = true
    defer { isLoadingPopular = false }

    let language = Language.current.rawValue

    async let moviesTask = TMDBService.shared.getPopularMovies(language: language)
    async let tvTask = TMDBService.shared.getPopularTVSeries(language: language)

    do {
      let (movies, tv) = try await (moviesTask, tvTask)
      popularMovies = movies
      popularTVSeries = tv
    } catch {
      popularMovies = []
      popularTVSeries = []
    }
  }

  private func performSearch(query: String) async {
    guard !query.isEmpty else {
      results = []
      return
    }

    isLoading = true
    defer { isLoading = false }

    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      results = response.results
    } catch {
      results = []
    }
  }
}

// MARK: - Search Section
struct SearchSection: View {
  let title: String
  let results: [SearchResult]

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(title)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)

      LazyVGrid(columns: columns, spacing: 12) {
        ForEach(results.prefix(9)) { result in
          if result.mediaType != "person" {
            NavigationLink {
              MediaDetailView(
                mediaId: result.id,
                mediaType: result.mediaType ?? "movie"
              )
            } label: {
              PosterCard(result: result)
            }
            .buttonStyle(.plain)
          } else {
            PosterCard(result: result)
          }
        }
      }
    }
  }
}

// MARK: - Poster Card
struct PosterCard: View {
  let result: SearchResult

  var body: some View {
    AsyncImage(url: result.imageURL) { phase in
      switch phase {
      case .empty:
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
      case .success(let image):
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      case .failure:
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: result.mediaType == "person" ? "person.fill" : "film")
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      @unknown default:
        RoundedRectangle(cornerRadius: 12)
          .fill(Color.appBorderAdaptive)
      }
    }
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .shadow(color: Color.black.opacity(0.15), radius: 4, x: 0, y: 2)
  }
}

// MARK: - Skeleton Loading
struct SearchSkeletonSection: View {
  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      // Title skeleton
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 80, height: 16)
        .shimmer()

      LazyVGrid(columns: columns, spacing: 12) {
        ForEach(0..<6, id: \.self) { _ in
          PosterSkeletonCard()
        }
      }
    }
  }
}

struct PosterSkeletonCard: View {
  var body: some View {
    RoundedRectangle(cornerRadius: 12)
      .fill(Color.appBorderAdaptive)
      .aspectRatio(2 / 3, contentMode: .fit)
      .shimmer()
  }
}

// MARK: - Shimmer Effect
struct ShimmerModifier: ViewModifier {
  @State private var phase: CGFloat = 0

  func body(content: Content) -> some View {
    content
      .overlay(
        GeometryReader { geometry in
          LinearGradient(
            gradient: Gradient(colors: [
              Color.clear,
              Color.white.opacity(0.3),
              Color.clear,
            ]),
            startPoint: .leading,
            endPoint: .trailing
          )
          .frame(width: geometry.size.width * 2)
          .offset(x: -geometry.size.width + (geometry.size.width * 2 * phase))
        }
        .mask(content)
      )
      .onAppear {
        withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
          phase = 1
        }
      }
  }
}

extension View {
  func shimmer() -> some View {
    modifier(ShimmerModifier())
  }
}

// MARK: - Profile Tab
struct ProfileTabView: View {
  @State private var user: User?
  @State private var isLoading = true
  @State private var showSettings = false
  @State private var strings = L10n.current

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 0) {
          // Header with settings button
          HStack {
            Spacer()
            Button {
              showSettings = true
            } label: {
              Image(systemName: "gearshape")
                .font(.system(size: 18))
                .foregroundColor(.appForegroundAdaptive)
                .frame(width: 44, height: 44)
                .background(Color.appInputFilled)
                .clipShape(Circle())
            }
          }
          .padding(.horizontal, 24)
          .padding(.top, 8)

          Spacer()

          if isLoading {
            ProgressView()
          } else if let user {
            VStack(spacing: 16) {
              // Avatar placeholder
              Circle()
                .fill(Color.appInputFilled)
                .frame(width: 80, height: 80)
                .overlay(
                  Text(String(user.username.prefix(1)).uppercased())
                    .font(.title.bold())
                    .foregroundColor(.appForegroundAdaptive)
                )

              Text("@\(user.username)")
                .font(.title2.bold())
                .foregroundColor(.appForegroundAdaptive)
            }
          }

          Spacer()

          // Sign out button
          Button {
            AuthService.shared.signOut()
          } label: {
            HStack {
              Image(systemName: "rectangle.portrait.and.arrow.right")
              Text(strings.signOut)
            }
            .foregroundColor(.appDestructive)
          }
          .padding(.bottom, 32)
        }
      }
      .navigationBarHidden(true)
    }
    .task {
      await loadUser()
    }
    .sheet(isPresented: $showSettings) {
      SettingsSheet()
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func loadUser() async {
    isLoading = true
    defer { isLoading = false }

    do {
      user = try await AuthService.shared.getCurrentUser()
    } catch {
      user = nil
    }
  }
}

// MARK: - Settings Sheet
struct SettingsSheet: View {
  @Environment(\.colorScheme) private var systemColorScheme
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var strings = L10n.current

  private var effectiveColorScheme: ColorScheme {
    themeManager.current.colorScheme ?? systemColorScheme
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 32) {
        // Header
        Text(strings.settings)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)
          .padding(.top, 8)

        // Theme Picker
        VStack(alignment: .leading, spacing: 12) {
          Text(strings.theme)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          HStack(spacing: 12) {
            ForEach(AppTheme.allCases, id: \.self) { theme in
              ThemeOptionButton(
                theme: theme,
                isSelected: themeManager.current == theme,
                label: themeDisplayName(theme)
              ) {
                themeManager.current = theme
              }
            }
          }
        }

        // Language Picker
        VStack(alignment: .leading, spacing: 12) {
          Text(strings.language)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)

          Menu {
            ForEach(Language.allCases, id: \.self) { lang in
              Button {
                Language.current = lang
              } label: {
                HStack {
                  Text(lang.displayName)
                  if Language.current == lang {
                    Image(systemName: "checkmark")
                  }
                }
              }
            }
          } label: {
            HStack {
              Text(Language.current.displayName)
              Spacer()
              Image(systemName: "chevron.down")
            }
            .padding(12)
            .foregroundColor(.appForegroundAdaptive)
            .background(Color.appInputFilled)
            .clipShape(RoundedRectangle(cornerRadius: 12))
          }
        }

        Spacer()
      }
      .padding(.horizontal, 24)
      .padding(.top, 16)
    }
    .preferredColorScheme(effectiveColorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  private func themeDisplayName(_ theme: AppTheme) -> String {
    switch theme {
    case .system: return strings.themeSystem
    case .light: return strings.themeLight
    case .dark: return strings.themeDark
    }
  }
}

// MARK: - Theme Option Button
struct ThemeOptionButton: View {
  let theme: AppTheme
  let isSelected: Bool
  let label: String
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      VStack(spacing: 8) {
        Image(systemName: theme.icon)
          .font(.system(size: 20))

        Text(label)
          .font(.caption)
      }
      .frame(maxWidth: .infinity)
      .padding(.vertical, 16)
      .foregroundColor(isSelected ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
      .background(isSelected ? Color.appInputFilled : Color.clear)
      .clipShape(RoundedRectangle(cornerRadius: 12))
    }
  }
}

#Preview {
  HomeView()
}
