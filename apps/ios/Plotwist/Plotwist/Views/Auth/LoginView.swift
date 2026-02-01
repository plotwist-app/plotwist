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
    // Movie - Interstellar
    PopularPoster(posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", title: "Interstellar", category: "Movie"),
    // TV Series - Breaking Bad
    PopularPoster(posterPath: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg", title: "Breaking Bad", category: "TV"),
    // Anime - Attack on Titan
    PopularPoster(posterPath: "/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg", title: "Attack on Titan", category: "Anime"),
    // K-Drama - Squid Game
    PopularPoster(posterPath: "/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg", title: "Squid Game", category: "K-Drama"),
    // Movie - Dune Part Two
    PopularPoster(posterPath: "/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg", title: "Dune: Part Two", category: "Movie"),
    // TV Series - Stranger Things
    PopularPoster(posterPath: "/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg", title: "Stranger Things", category: "TV"),
    // Anime - Demon Slayer
    PopularPoster(posterPath: "/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg", title: "Demon Slayer", category: "Anime"),
    // K-Drama - All of Us Are Dead
    PopularPoster(posterPath: "/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg", title: "All of Us Are Dead", category: "K-Drama"),
  ]
}

// MARK: - Welcome View (Landing Page)
struct LoginView: View {
  @State private var strings = L10n.current
  @State private var currentPosterIndex = 0
  @State private var showLoginSheet = false
  @State private var showSignUpSheet = false
  @ObservedObject private var themeManager = ThemeManager.shared
  
  private let autoScrollTimer = Timer.publish(every: 4, on: .main, in: .common).autoconnect()
  
  // Use a minimum corner radius to prevent layout issues when deviceCornerRadius returns 0
  private var cornerRadius: CGFloat {
    let deviceRadius = UIScreen.main.deviceCornerRadius
    return deviceRadius > 0 ? deviceRadius : 44
  }
  
  var body: some View {
    NavigationView {
      GeometryReader { geometry in
        let footerHeight: CGFloat = 320
        let posterHeight = geometry.size.height - footerHeight + cornerRadius + 60 // Extra height to cover rounded corners
        
        ZStack(alignment: .bottom) {
          // Background color
          Color.appBackgroundAdaptive
            .ignoresSafeArea()
          
          // Poster Carousel (covers top area only)
          VStack {
            PosterCarousel(
              posters: PopularPoster.featured,
              currentIndex: $currentPosterIndex
            )
            .frame(height: posterHeight)
            .clipped()
            
            Spacer()
          }
          .ignoresSafeArea(edges: .top)
          
          // Gradient Overlay on posters
          VStack {
            LinearGradient(
              colors: [
                Color.black.opacity(0.3),
                Color.black.opacity(0.1),
                Color.black.opacity(0.3),
                Color.black.opacity(0.7),
              ],
              startPoint: .top,
              endPoint: .bottom
            )
            .frame(height: posterHeight)
            
            Spacer()
          }
          .ignoresSafeArea(edges: .top)
          
          // Footer Content
          VStack(spacing: 0) {
            // Page Indicator (above the footer, on poster)
            HStack(spacing: 8) {
              ForEach(0..<PopularPoster.featured.count, id: \.self) { index in
                Circle()
                  .fill(index == currentPosterIndex ? Color.white : Color.white.opacity(0.4))
                  .frame(width: 8, height: 8)
                  .animation(.easeInOut(duration: 0.3), value: currentPosterIndex)
              }
            }
            .padding(.bottom, 16)
            
            // Footer Content Card (rounded with device corner radius)
            VStack(spacing: 20) {
              // Title & Description
              VStack(spacing: 8) {
                Text(strings.welcomeTitle)
                  .font(.system(size: 26, weight: .bold))
                  .foregroundColor(.appForegroundAdaptive)
                  .multilineTextAlignment(.center)
                
                Text(strings.welcomeDescription)
                  .font(.subheadline)
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .multilineTextAlignment(.center)
              }
              
              // Buttons
              VStack(spacing: 12) {
                // Login Button
                Button {
                  showLoginSheet = true
                } label: {
                  Text(strings.accessButton)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.appBackgroundAdaptive)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Color.appForegroundAdaptive)
                    .clipShape(Capsule())
                }
                
                // Create Account Button
                Button {
                  showSignUpSheet = true
                } label: {
                  Text(strings.createAccount)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.appForegroundAdaptive)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Color.appInputFilled)
                    .clipShape(Capsule())
                    .overlay(
                      Capsule()
                        .stroke(Color.appBorderAdaptive, lineWidth: 1)
                    )
                }
                
                // Continue as Guest Button
                Button {
                  NotificationCenter.default.post(name: .continueAsGuest, object: nil)
                } label: {
                  Text(strings.continueAsGuest)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .padding(.top, 4)
                }
              }
            }
            .padding(.horizontal, 24)
            .padding(.top, 28)
            .padding(.bottom, 40)
            .frame(maxWidth: 400)
            .frame(maxWidth: .infinity)
            .background(Color.appBackgroundAdaptive)
            .clipShape(
              RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
            )
          }
        }
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
    .sheet(isPresented: $showLoginSheet) {
      LoginFormSheet()
        .floatingSheetPresentation(height: 620)
        .preferredColorScheme(themeManager.current.colorScheme)
    }
    .sheet(isPresented: $showSignUpSheet) {
      SignUpFormSheet()
        .floatingSheetPresentation(height: 680)
        .preferredColorScheme(themeManager.current.colorScheme)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .onReceive(autoScrollTimer) { _ in
      withAnimation(.easeInOut(duration: 0.5)) {
        currentPosterIndex = (currentPosterIndex + 1) % PopularPoster.featured.count
      }
    }
  }
}

// MARK: - Poster Carousel
struct PosterCarousel: View {
  let posters: [PopularPoster]
  @Binding var currentIndex: Int
  
  @State private var dragOffset: CGFloat = 0
  private let swipeThreshold: CGFloat = 50
  
  var body: some View {
    GeometryReader { geometry in
      ZStack {
        ForEach(Array(posters.enumerated()), id: \.element.id) { index, poster in
          CachedAsyncImage(url: poster.posterURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: geometry.size.width, height: geometry.size.height)
              .clipped()
          } placeholder: {
            Rectangle()
              .fill(Color.appBorderAdaptive)
          }
          .opacity(index == currentIndex ? 1 : 0)
          .animation(.easeInOut(duration: 0.5), value: currentIndex)
        }
      }
      .gesture(
        DragGesture()
          .onChanged { value in
            dragOffset = value.translation.width
          }
          .onEnded { value in
            let dragAmount = value.translation.width
            
            withAnimation(.easeInOut(duration: 0.3)) {
              if dragAmount < -swipeThreshold {
                // Swipe left - next poster
                currentIndex = (currentIndex + 1) % posters.count
              } else if dragAmount > swipeThreshold {
                // Swipe right - previous poster
                currentIndex = (currentIndex - 1 + posters.count) % posters.count
              }
            }
            
            dragOffset = 0
          }
      )
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
          // Social Login Buttons
          VStack(spacing: 12) {
            SocialLoginButton(
              provider: .apple,
              title: strings.continueWithApple,
              isLoading: isAppleLoading
            ) {
              Task { await signInWithApple() }
            }
            
            SocialLoginButton(
              provider: .google,
              title: strings.continueWithGoogle,
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
      .padding(.bottom, 24)
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
      _ = try await SocialAuthService.shared.signInWithApple()
      AnalyticsService.shared.track(.login(method: "apple"))
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
            // Social Login Buttons
            VStack(spacing: 12) {
              SocialLoginButton(
                provider: .apple,
                title: strings.continueWithApple,
                isLoading: isAppleLoading
              ) {
                Task { await signInWithApple() }
              }
              
              SocialLoginButton(
                provider: .google,
                title: strings.continueWithGoogle,
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
      .padding(.bottom, 24)
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
      _ = try await SocialAuthService.shared.signInWithApple()
      AnalyticsService.shared.track(.signUp(method: "apple"))
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
