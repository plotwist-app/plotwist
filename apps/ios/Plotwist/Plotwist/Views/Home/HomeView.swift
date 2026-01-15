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
  @State private var popularMovies: [SearchResult] = []
  @State private var popularTVSeries: [SearchResult] = []
  @State private var popularAnimes: [SearchResult] = []
  @State private var popularDoramas: [SearchResult] = []
  @State private var isLoading = true
  @State private var strings = L10n.current

  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        if isLoading {
          ScrollView {
            VStack(spacing: 32) {
              HomeSectionSkeleton()
              HomeSectionSkeleton()
              HomeSectionSkeleton()
              HomeSectionSkeleton()
            }
            .padding(.top, 24)
            .padding(.bottom, 80)
          }
        } else {
          ScrollView(showsIndicators: false) {
            VStack(spacing: 32) {
              // Popular Movies
              HomeSectionView(
                title: strings.popularMovies,
                items: popularMovies,
                mediaType: "movie",
                categoryType: .movies
              )

              // Popular TV Series
              HomeSectionView(
                title: strings.popularTVSeries,
                items: popularTVSeries,
                mediaType: "tv",
                categoryType: .tvSeries
              )

              // Popular Animes
              HomeSectionView(
                title: strings.popularAnimes,
                items: popularAnimes,
                mediaType: "tv",
                categoryType: .animes
              )

              // Popular Doramas
              HomeSectionView(
                title: strings.popularDoramas,
                items: popularDoramas,
                mediaType: "tv",
                categoryType: .doramas
              )
            }
            .padding(.top, 24)
            .padding(.bottom, 80)
          }
        }
      }
      .navigationBarHidden(true)
    }
    .task {
      await loadContent()
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
      Task {
        await loadContent()
      }
    }
  }

  private func loadContent() async {
    isLoading = true
    defer { isLoading = false }

    let language = Language.current.rawValue

    async let moviesTask = TMDBService.shared.getPopularMovies(language: language)
    async let tvTask = TMDBService.shared.getPopularTVSeries(language: language)
    async let animesTask = TMDBService.shared.getPopularAnimes(language: language)
    async let doramasTask = TMDBService.shared.getPopularDoramas(language: language)

    do {
      let (movies, tv, animes, doramas) = try await (moviesTask, tvTask, animesTask, doramasTask)
      popularMovies = movies
      popularTVSeries = tv
      popularAnimes = animes
      popularDoramas = doramas
    } catch {
      popularMovies = []
      popularTVSeries = []
      popularAnimes = []
      popularDoramas = []
    }
  }
}

// MARK: - Home Category Type
enum HomeCategoryType {
  case movies
  case tvSeries
  case animes
  case doramas
}

// MARK: - Home Section View
struct HomeSectionView: View {
  let title: String
  let items: [SearchResult]
  let mediaType: String
  let categoryType: HomeCategoryType

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      // Header with title and chevron
      NavigationLink {
        CategoryListView(categoryType: categoryType)
      } label: {
        HStack(spacing: 6) {
          Text(title)
            .font(.title3.bold())
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.right")
            .font(.system(size: 14, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)
      }

      // Horizontal scroll of posters
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items.prefix(10)) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: mediaType
              )
            } label: {
              HomePosterCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }
}

// MARK: - Category List View
struct CategoryListView: View {
  let categoryType: HomeCategoryType

  @Environment(\.dismiss) private var dismiss
  @State private var items: [SearchResult] = []
  @State private var isLoading = true
  @State private var strings = L10n.current
  @ObservedObject private var themeManager = ThemeManager.shared

  private var title: String {
    switch categoryType {
    case .movies: return strings.movies
    case .tvSeries: return strings.tvSeries
    case .animes: return strings.animes
    case .doramas: return strings.doramas
    }
  }

  private var mediaType: String {
    switch categoryType {
    case .movies: return "movie"
    case .tvSeries, .animes, .doramas: return "tv"
    }
  }

  private let columns = [
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
    GridItem(.flexible(), spacing: 12),
  ]

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        // Header
        HStack {
          Button {
            dismiss()
          } label: {
            Image(systemName: "chevron.left")
              .font(.system(size: 18, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
              .frame(width: 40, height: 40)
              .background(Color.appInputFilled)
              .clipShape(Circle())
          }

          Spacer()

          Text(title)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Spacer()

          // Placeholder for symmetry
          Color.clear
            .frame(width: 40, height: 40)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)

        Rectangle()
          .fill(Color.appBorderAdaptive)
          .frame(height: 1)

        // Content
        if isLoading {
          ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
              ForEach(0..<12, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 16)
                  .fill(Color.appBorderAdaptive)
                  .aspectRatio(2 / 3, contentMode: .fit)
                  .shimmer()
              }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 24)
          }
        } else {
          ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
              ForEach(items) { item in
                NavigationLink {
                  MediaDetailView(mediaId: item.id, mediaType: mediaType)
                } label: {
                  CategoryPosterCard(item: item)
                }
                .buttonStyle(.plain)
              }
            }
            .padding(.horizontal, 24)
            .padding(.vertical, 24)
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .task {
      await loadItems()
    }
  }

  private func loadItems() async {
    isLoading = true
    defer { isLoading = false }

    let language = Language.current.rawValue

    do {
      switch categoryType {
      case .movies:
        items = try await TMDBService.shared.getPopularMovies(language: language)
      case .tvSeries:
        items = try await TMDBService.shared.getPopularTVSeries(language: language)
      case .animes:
        items = try await TMDBService.shared.getPopularAnimes(language: language)
      case .doramas:
        items = try await TMDBService.shared.getPopularDoramas(language: language)
      }
    } catch {
      items = []
    }
  }
}

// MARK: - Category Poster Card
struct CategoryPosterCard: View {
  let item: SearchResult

  var body: some View {
    AsyncImage(url: item.imageURL) { phase in
      switch phase {
      case .empty:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      case .success(let image):
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      case .failure:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: "film")
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      @unknown default:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      }
    }
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: 16))
  }
}

// MARK: - Home Poster Card
struct HomePosterCard: View {
  let item: SearchResult

  var body: some View {
    AsyncImage(url: item.imageURL) { phase in
      switch phase {
      case .empty:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      case .success(let image):
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      case .failure:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: "film")
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      @unknown default:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      }
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .posterShadow()
  }
}

// MARK: - Home Section Skeleton
struct HomeSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      // Title skeleton
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 140, height: 20)
        .padding(.horizontal, 24)
        .shimmer()

      // Posters skeleton
      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 16)
              .fill(Color.appBorderAdaptive)
              .frame(width: 120, height: 180)
              .shimmer()
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
      }
      .scrollClipDisabled()
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
    .posterShadow()
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
        .standardSheetStyle(detents: [.medium])
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
