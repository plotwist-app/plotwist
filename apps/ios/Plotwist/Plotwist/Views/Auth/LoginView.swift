//
//  LoginView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Light Status Bar Helper
struct LightStatusBar: ViewModifier {
  func body(content: Content) -> some View {
    content
      .onAppear {
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first as? UIWindowScene
        windowScene?.windows.first?.overrideUserInterfaceStyle = .dark
      }
      .onDisappear {
        let scenes = UIApplication.shared.connectedScenes
        let windowScene = scenes.first as? UIWindowScene
        // Restore to system default
        windowScene?.windows.first?.overrideUserInterfaceStyle = .unspecified
      }
  }
}

extension View {
  func lightStatusBar() -> some View {
    modifier(LightStatusBar())
  }
}

// MARK: - Popular Poster Data
struct PopularPoster: Identifiable {
  let id = UUID()
  let posterPath: String
  let title: String
  let category: String
  
  var posterURL: URL? {
    URL(string: "https://image.tmdb.org/t/p/original\(posterPath)")
  }
  
  // Popular titles across different categories
  static let featured: [PopularPoster] = [
    PopularPoster(posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", title: "Interstellar", category: "Movie"),
    PopularPoster(posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg", title: "Breaking Bad", category: "TV"),
    PopularPoster(posterPath: "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg", title: "Attack on Titan", category: "Anime"),
    PopularPoster(posterPath: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg", title: "Squid Game", category: "K-Drama"),
    PopularPoster(posterPath: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", title: "Dune: Part Two", category: "Movie"),
    PopularPoster(posterPath: "/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg", title: "Stranger Things", category: "TV"),
    PopularPoster(posterPath: "/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg", title: "Demon Slayer", category: "Anime"),
    PopularPoster(posterPath: "/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg", title: "All of Us Are Dead", category: "K-Drama"),
    PopularPoster(posterPath: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", title: "Oppenheimer", category: "Movie"),
    PopularPoster(posterPath: "/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg", title: "The Last of Us", category: "TV"),
    PopularPoster(posterPath: "/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg", title: "One Piece", category: "Anime"),
    PopularPoster(posterPath: "/74xTEgt7R36Fpooo50r9T25onhq.jpg", title: "The Batman", category: "Movie"),
  ]
}

// MARK: - Welcome View (Landing Page)
struct LoginView: View {
  @State private var strings = L10n.current
  @State private var showLoginSheet = false
  @State private var showSignUpSheet = false
  @ObservedObject private var themeManager = ThemeManager.shared
  
  var body: some View {
    NavigationStack {
      ZStack {
        // Layer 1: Masonry background
        VStack {
          PosterMasonry(posters: PopularPoster.featured)
          Spacer()
        }
        .background(Color.black)
        .ignoresSafeArea()
        
        // Layer 2: Gradient for readability
        VStack {
          Spacer()
          LinearGradient(
            stops: [
              .init(color: .clear, location: 0),
              .init(color: Color.black.opacity(0.6), location: 0.3),
              .init(color: Color.black.opacity(0.95), location: 1),
            ],
            startPoint: .top,
            endPoint: .bottom
          )
          .frame(height: 380)
        }
        .ignoresSafeArea()
        
        // Layer 3: Content (floating, no background)
        VStack(alignment: .leading, spacing: 0) {
          Spacer()
          
          // App Icon
          Image("PlotistLogo")
            .resizable()
            .frame(width: 48, height: 48)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .padding(.bottom, 16)
          
          // Title
          Text(strings.welcomeTitle)
            .font(.system(size: 28, weight: .bold))
            .foregroundColor(.white)
            .padding(.bottom, 8)
          
          // Description
          Text(strings.welcomeDescription)
            .font(.subheadline)
            .foregroundColor(.white.opacity(0.7))
            .padding(.bottom, 24)
          
          // Buttons
          VStack(spacing: 12) {
            // Login Button
            Button {
              showLoginSheet = true
            } label: {
              Text(strings.accessButton)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Color.white)
                .clipShape(Capsule())
            }
            
            // Create Account Button
            Button {
              showSignUpSheet = true
            } label: {
              Text(strings.createAccount)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white.opacity(0.7))
                .frame(maxWidth: .infinity)
                .frame(height: 52)
            }

            #if DEBUG
            // Debug: Reset and open onboarding
            Button {
              OnboardingService.shared.reset()
              UserDefaults.standard.set(false, forKey: "isGuestMode")
              NotificationCenter.default.post(name: .authChanged, object: nil)
            } label: {
              Text("Debug: Open Onboarding")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.35))
                .frame(maxWidth: .infinity)
                .frame(height: 36)
            }
            #endif
          }
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 0)
      }
      .navigationBarHidden(true)
    }
    .overlay(alignment: .topTrailing) {
      // Language Switcher at top right (respects safe area)
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
        Image(systemName: "globe")
          .font(.system(size: 18))
          .foregroundColor(.white)
          .frame(width: 44, height: 44)
          .background(.ultraThinMaterial)
          .clipShape(Circle())
      }
      .padding(.horizontal, 24)
      .padding(.top, 8)
    }
    .preferredColorScheme(.dark)
    .lightStatusBar()
    .sheet(isPresented: $showLoginSheet, onDismiss: notifyAuthIfNeeded) {
      LoginFormSheet()
        .floatingSheetDynamicPresentation()
        .preferredColorScheme(themeManager.current.colorScheme)
    }
    .sheet(isPresented: $showSignUpSheet, onDismiss: notifyAuthIfNeeded) {
      SignUpFormSheet()
        .floatingSheetDynamicPresentation()
        .preferredColorScheme(themeManager.current.colorScheme)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  /// Posts .authChanged only if the user is now authenticated (login/signup succeeded before sheet dismiss)
  private func notifyAuthIfNeeded() {
    if AuthService.shared.isAuthenticated {
      NotificationCenter.default.post(name: .authChanged, object: nil)
    }
  }
}

// MARK: - Poster Masonry
struct PosterMasonry: View {
  let posters: [PopularPoster]
  private let columnCount = 4
  private let spacing: CGFloat = 12
  
  var body: some View {
    GeometryReader { geometry in
      let totalSpacing = spacing * CGFloat(columnCount - 1)
      let columnWidth = (geometry.size.width - totalSpacing) / CGFloat(columnCount)
      let posterHeight = columnWidth * 1.5
      let columnOffsets: [CGFloat] = [
        -posterHeight * 0.1,
        -posterHeight * 0.35,
        posterHeight * 0.15,
        -posterHeight * 0.2,
      ]
      
      HStack(spacing: spacing) {
        ForEach(0..<columnCount, id: \.self) { columnIndex in
          let columnPosters = postersForColumn(columnIndex)
          
          VStack(spacing: spacing) {
            ForEach(Array(columnPosters.enumerated()), id: \.offset) { _, poster in
              CachedAsyncImage(url: poster.posterURL) { image in
                image
                  .resizable()
                  .aspectRatio(contentMode: .fill)
                  .frame(width: columnWidth, height: posterHeight)
                  .clipped()
              } placeholder: {
                PosterSkeleton()
                  .frame(width: columnWidth, height: posterHeight)
              }
              .cornerRadius(12)
            }
          }
          .offset(y: columnOffsets[columnIndex])
        }
      }
      .padding(.top, 16)
    }
    .clipped()
    .onAppear {
      let urls = posters.compactMap { $0.posterURL }
      ImageCache.shared.prefetch(urls: urls, priority: .high)
    }
  }
  
  private func postersForColumn(_ columnIndex: Int) -> [PopularPoster] {
    posters.enumerated()
      .filter { $0.offset % columnCount == columnIndex }
      .map { $0.element }
  }
}

// MARK: - Poster Skeleton
struct PosterSkeleton: View {
  @State private var isAnimating = false
  
  var body: some View {
    Rectangle()
      .fill(Color.gray.opacity(0.15))
      .overlay(
        Rectangle()
          .fill(Color.gray.opacity(0.1))
          .opacity(isAnimating ? 0 : 1)
      )
      .onAppear {
        withAnimation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true)) {
          isAnimating = true
        }
      }
  }
}

// MARK: - Login Form Sheet
struct LoginFormSheet: View {
  @Environment(\.dismiss) private var dismiss
  @State private var login = ""
  @State private var password = ""
  @State private var showPassword = false
  @State private var isLoading = false
  @State private var isAppleLoading = false
  @State private var isGoogleLoading = false
  @State private var error: String?
  @State private var strings = L10n.current
  
  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 16) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
        
        // Title
        Text(strings.accessButton)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)
          .frame(maxWidth: .infinity, alignment: .center)
        
        VStack(spacing: 16) {
          // Social Login Icons
          HStack(spacing: 12) {
            SocialLoginIconButton(
              provider: .apple,
              isLoading: isAppleLoading
            ) {
              Task { await signInWithApple() }
            }
            
            SocialLoginIconButton(
              provider: .google,
              isLoading: isGoogleLoading,
              isDisabled: true
            ) {
              // Google Sign-In disabled for now
            }
          }
          
          // Divider with "or"
          HStack {
            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
            Text(strings.or)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
              .padding(.horizontal, 12)
            Rectangle()
              .fill(Color.appBorderAdaptive)
              .frame(height: 1)
          }
          
          // Login Field
          VStack(alignment: .leading, spacing: 6) {
            Text(strings.loginLabel)
              .font(.subheadline.weight(.medium))
              .foregroundColor(.appForegroundAdaptive)
            TextField(strings.loginPlaceholder, text: $login)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .padding(12)
              .background(Color.appInputFilled)
              .cornerRadius(12)
          }
          
          // Password Field
          VStack(alignment: .leading, spacing: 6) {
            Text(strings.passwordLabel)
              .font(.subheadline.weight(.medium))
              .foregroundColor(.appForegroundAdaptive)
            HStack(spacing: 8) {
              ZStack {
                TextField(strings.passwordPlaceholder, text: $password)
                  .opacity(showPassword ? 1 : 0)
                SecureField(strings.passwordPlaceholder, text: $password)
                  .opacity(showPassword ? 0 : 1)
              }
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .padding(12)
              .background(Color.appInputFilled)
              .cornerRadius(12)
              
              Button {
                showPassword.toggle()
              } label: {
                Image(systemName: showPassword ? "eye" : "eye.slash")
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .frame(width: 48, height: 48)
                  .background(Color.appInputFilled)
                  .cornerRadius(12)
              }
              .buttonStyle(.plain)
            }
          }
          
          if let error {
            Text(error)
              .font(.caption)
              .foregroundColor(.appDestructive)
          }
          
          // Submit Button
          Button(action: { Task { await performLogin() } }) {
            Group {
              if isLoading {
                ProgressView()
                  .tint(.appBackgroundAdaptive)
              } else {
                Text(strings.accessButton)
                  .fontWeight(.semibold)
              }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(Color.appForegroundAdaptive)
            .foregroundColor(.appBackgroundAdaptive)
            .clipShape(Capsule())
          }
          .disabled(isLoading || isAppleLoading || isGoogleLoading)
          .opacity(isLoading ? 0.5 : 1)
        }
      }
      .padding(.horizontal, 24)
      .padding(.bottom, 8)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  private func performLogin() async {
    error = nil
    
    guard !login.isEmpty else {
      error = strings.loginRequired
      return
    }
    guard password.count >= 8 else {
      error = strings.passwordLength
      return
    }
    
    isLoading = true
    defer { isLoading = false }
    
    do {
      _ = try await AuthService.shared.signIn(login: login, password: password)
      AnalyticsService.shared.track(.login(method: "email"))
      dismiss()
    } catch {
      self.error = strings.invalidCredentials
    }
  }
  
  private func signInWithApple() async {
    error = nil
    isAppleLoading = true
    defer { isAppleLoading = false }
    
    do {
      let response = try await SocialAuthService.shared.signInWithApple()
      
      // Track sign up or login based on backend response
      if response.isNewUser {
        AnalyticsService.shared.track(.signUp(method: "apple"))
      } else {
        AnalyticsService.shared.track(.login(method: "apple"))
      }
      dismiss()
    } catch let authError as SocialAuthError {
      if case .cancelled = authError {
        // User cancelled, don't show error
        return
      }
      self.error = authError.localizedDescription
    } catch {
      self.error = strings.invalidCredentials
    }
  }
  
  private func signInWithGoogle() async {
    error = nil
    isGoogleLoading = true
    defer { isGoogleLoading = false }
    
    // TODO: Implement Google Sign-In when SDK is configured
    self.error = "Google Sign-In coming soon"
  }
}

// MARK: - Sign Up Form Sheet
struct SignUpFormSheet: View {
  @Environment(\.dismiss) private var dismiss
  @State private var email = ""
  @State private var password = ""
  @State private var username = ""
  @State private var showPassword = false
  @State private var isLoading = false
  @State private var isAppleLoading = false
  @State private var isGoogleLoading = false
  @State private var error: String?
  @State private var showUsernameStep = false
  @State private var strings = L10n.current
  
  var body: some View {
    FloatingSheetContainer {
      VStack(spacing: 16) {
        // Drag Indicator
        RoundedRectangle(cornerRadius: 2.5)
          .fill(Color.gray.opacity(0.4))
          .frame(width: 36, height: 5)
          .padding(.top, 12)
        
        // Title
        VStack(spacing: 8) {
          Text(showUsernameStep ? strings.selectUsername : strings.createAccount)
            .font(.title3.bold())
            .foregroundColor(.appForegroundAdaptive)
          
          Text(showUsernameStep ? strings.selectUsernameDescription : strings.startYourJourney)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
        }
        
        if showUsernameStep {
          // Username Step
          VStack(spacing: 16) {
            TextField(strings.usernamePlaceholder, text: $username)
              .textInputAutocapitalization(.never)
              .autocorrectionDisabled()
              .padding(12)
              .background(Color.appInputFilled)
              .cornerRadius(12)
            
            if let error {
              Text(error)
                .font(.caption)
                .foregroundColor(.appDestructive)
            }
            
            // Submit Button
            Button(action: { Task { await finishSignUp() } }) {
              Group {
                if isLoading {
                  ProgressView()
                    .tint(.appBackgroundAdaptive)
                } else {
                  Text(strings.finishSignUp)
                    .fontWeight(.semibold)
                }
              }
              .frame(maxWidth: .infinity)
              .frame(height: 48)
              .background(Color.appForegroundAdaptive)
              .foregroundColor(.appBackgroundAdaptive)
              .clipShape(Capsule())
            }
            .disabled(isLoading)
            .opacity(isLoading ? 0.5 : 1)
          }
        } else {
          // Email & Password Step
          VStack(spacing: 16) {
            // Social Login Icons
            HStack(spacing: 12) {
              SocialLoginIconButton(
                provider: .apple,
                isLoading: isAppleLoading
              ) {
                Task { await signInWithApple() }
              }
              
              SocialLoginIconButton(
                provider: .google,
                isLoading: isGoogleLoading,
                isDisabled: true
              ) {
                // Google Sign-In disabled for now
              }
            }
            
            // Divider with "or"
            HStack {
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
              Text(strings.or)
                .font(.caption)
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.horizontal, 12)
              Rectangle()
                .fill(Color.appBorderAdaptive)
                .frame(height: 1)
            }
            
            // Email Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.emailLabel)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
              TextField(strings.emailPlaceholder, text: $email)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .keyboardType(.emailAddress)
                .padding(12)
                .background(Color.appInputFilled)
                .cornerRadius(12)
            }
            
            // Password Field
            VStack(alignment: .leading, spacing: 6) {
              Text(strings.passwordLabel)
                .font(.subheadline.weight(.medium))
                .foregroundColor(.appForegroundAdaptive)
              HStack(spacing: 8) {
                ZStack {
                  TextField(strings.passwordPlaceholder, text: $password)
                    .opacity(showPassword ? 1 : 0)
                  SecureField(strings.passwordPlaceholder, text: $password)
                    .opacity(showPassword ? 0 : 1)
                }
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(12)
                .background(Color.appInputFilled)
                .cornerRadius(12)
                
                Button {
                  showPassword.toggle()
                } label: {
                  Image(systemName: showPassword ? "eye" : "eye.slash")
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .frame(width: 48, height: 48)
                    .background(Color.appInputFilled)
                    .cornerRadius(12)
                }
                .buttonStyle(.plain)
              }
            }
            
            if let error {
              Text(error)
                .font(.caption)
                .foregroundColor(.appDestructive)
            }
            
            // Submit Button
            Button(action: { Task { await checkEmailAndContinue() } }) {
              Group {
                if isLoading {
                  ProgressView()
                    .tint(.appBackgroundAdaptive)
                } else {
                  Text(strings.continueButton)
                    .fontWeight(.semibold)
                }
              }
              .frame(maxWidth: .infinity)
              .frame(height: 48)
              .background(Color.appForegroundAdaptive)
              .foregroundColor(.appBackgroundAdaptive)
              .clipShape(Capsule())
            }
            .disabled(isLoading || isAppleLoading || isGoogleLoading)
            .opacity(isLoading ? 0.5 : 1)
          }
        }
      }
      .padding(.horizontal, 24)
      .padding(.bottom, 8)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  private func checkEmailAndContinue() async {
    error = nil
    
    guard !email.isEmpty else {
      error = strings.emailRequired
      return
    }
    guard email.contains("@") && email.contains(".") else {
      error = strings.emailInvalid
      return
    }
    guard password.count >= 8 else {
      error = strings.passwordLength
      return
    }
    
    isLoading = true
    defer { isLoading = false }
    
    do {
      let available = try await AuthService.shared.checkEmailAvailable(email: email)
      if available {
        withAnimation {
          showUsernameStep = true
        }
      } else {
        error = strings.emailAlreadyTaken
      }
    } catch {
      self.error = strings.emailAlreadyTaken
    }
  }
  
  private func finishSignUp() async {
    error = nil
    
    guard !username.isEmpty else {
      error = strings.usernameRequired
      return
    }
    
    isLoading = true
    defer { isLoading = false }
    
    do {
      let available = try await AuthService.shared.checkUsernameAvailable(username: username)
      if available {
        try await AuthService.shared.signUp(email: email, password: password, username: username)
        AnalyticsService.shared.track(.signUp(method: "email"))
        dismiss()
      } else {
        error = strings.usernameAlreadyTaken
      }
    } catch AuthError.alreadyExists {
      error = strings.usernameAlreadyTaken
    } catch {
      self.error = strings.invalidCredentials
    }
  }
  
  private func signInWithApple() async {
    error = nil
    isAppleLoading = true
    defer { isAppleLoading = false }
    
    do {
      let response = try await SocialAuthService.shared.signInWithApple()
      
      // Track sign up or login based on backend response
      if response.isNewUser {
        AnalyticsService.shared.track(.signUp(method: "apple"))
      } else {
        AnalyticsService.shared.track(.login(method: "apple"))
      }
      dismiss()
    } catch let authError as SocialAuthError {
      if case .cancelled = authError {
        // User cancelled, don't show error
        return
      }
      self.error = authError.localizedDescription
    } catch {
      self.error = strings.invalidCredentials
    }
  }
  
  private func signInWithGoogle() async {
    error = nil
    isGoogleLoading = true
    defer { isGoogleLoading = false }
    
    // TODO: Implement Google Sign-In when SDK is configured
    self.error = "Google Sign-In coming soon"
  }
}

// MARK: - Noise Overlay
struct NoiseOverlay: View {
  var body: some View {
    Canvas { context, size in
      for _ in 0..<Int(size.width * size.height * 0.015) {
        let x = CGFloat.random(in: 0...size.width)
        let y = CGFloat.random(in: 0...size.height)
        let opacity = Double.random(in: 0.02...0.06)

        context.fill(
          Path(ellipseIn: CGRect(x: x, y: y, width: 1, height: 1)),
          with: .color(.white.opacity(opacity))
        )
      }
    }
    .ignoresSafeArea()
    .allowsHitTesting(false)
  }
}

// MARK: - Notification Extension
extension Notification.Name {
  static let continueAsGuest = Notification.Name("continueAsGuest")
}

#Preview {
  LoginView()
}
