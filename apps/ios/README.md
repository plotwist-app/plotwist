# 📱 Plotwist iOS

Native iOS application for Plotwist - Track your favorite movies and series.

## 🎯 Overview

This is a native iOS application built with **Swift** and **SwiftUI**, following the **MVVM** architecture pattern.

## 📋 Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+

## 🏗️ Architecture

### MVVM Pattern

The app follows the Model-View-ViewModel architecture:

- **Models**: Data structures (Codable)
- **Views**: SwiftUI views
- **ViewModels**: Business logic (ObservableObject)
- **Services**: API and data services

### Project Structure

```
ios/
├── Plotwist/                 # Main app target
│   ├── App/                  # App entry point & main views
│   │   ├── PlottwistApp.swift
│   │   ├── ContentView.swift
│   │   └── MainTabView.swift
│   ├── Core/                 # Core functionality
│   │   ├── Network/          # API client, endpoints, errors
│   │   └── Storage/          # Keychain, UserDefaults
│   ├── Models/               # Data models (Codable)
│   ├── ViewModels/           # ViewModels (ObservableObject)
│   ├── Views/                # SwiftUI views
│   │   ├── Auth/             # Login, SignUp, ForgotPassword
│   │   ├── Movies/           # Movie screens
│   │   ├── Series/           # Series screens
│   │   ├── Profile/          # Profile screens
│   │   ├── Lists/            # Lists screens
│   │   └── Components/       # Reusable components
│   ├── Services/             # Business services
│   ├── Utils/                # Utilities & Constants
│   ├── Configuration/        # App configuration
│   ├── Resources/            # Assets.xcassets
│   └── Info.plist            # App configuration
├── Plotwist.xcodeproj/       # Xcode project (criar via Xcode)
├── SETUP.md                  # Setup guide
├── README.md                 # This file
└── .gitignore                # Git ignore
```

## 📦 Dependencies

Using **Swift Package Manager (SPM)**.

Currently using native iOS frameworks only:

- URLSession for networking
- Native Keychain for secure storage
- SwiftUI for UI

**Planned dependencies** (to be added as needed):

- [Kingfisher](https://github.com/onevcat/Kingfisher) - Image loading & caching
- [SwiftUI-Introspect](https://github.com/siteline/SwiftUI-Introspect) - UIKit access (optional)

## 🚀 Getting Started

### Setup

**IMPORTANTE**: O projeto ainda não tem o arquivo `.xcodeproj`. Você precisa criá-lo primeiro!

Siga o guia completo em [`SETUP.md`](./SETUP.md) para criar o projeto Xcode.

### Resumo rápido:

1. Abra o Xcode
2. Crie um novo projeto iOS App com SwiftUI
3. Configure conforme instruções no `SETUP.md`
4. Adicione os arquivos existentes ao projeto
5. Configure sua TMDB API Key em `Configuration.swift`
6. Build e run!

### Configuração da API

Edite `Plotwist/Configuration/Configuration.swift` e adicione sua TMDB API Key:

```swift
static var tmdbAPIKey: String {
    return "SUA_API_KEY_AQUI"
}
```

## 🔐 Authentication

The app uses JWT tokens stored securely in the iOS Keychain via KeychainAccess library.

## 🌐 API Integration

The app communicates with the same backend API used by the web application.

Base URL:

- Debug: `http://localhost:3333`
- Release: `https://api.plotwist.app`

## 🎨 Design System

Following iOS Human Interface Guidelines with:

- Native iOS components
- Dark mode support
- Dynamic Type support
- Accessibility features

## 📱 Features

### Implemented

- ✅ Basic project structure (22 Swift files)
- ✅ Authentication (Login/Sign Up/Forgot Password)
- ✅ Networking layer (native URLSession with async/await)
- ✅ Keychain integration (secure token storage)
- ✅ Main navigation (TabView with 5 tabs)
- ✅ Theme management (Dark Mode support)
- ✅ MVVM architecture

### In Progress

- 🚧 Movie catalog
- 🚧 Series catalog
- 🚧 Search
- 🚧 User profile
- 🚧 Reviews system
- 🚧 Lists
- 🚧 Collection
- 🚧 Statistics
- 🚧 Social features

## 🧪 Testing

Tests will be added in future iterations. For now, focus on building the core features.

## 📝 Code Style

Using SwiftLint for code style enforcement. Configuration in `.swiftlint.yml`.

## 🌍 Localization

Supported languages:

- Portuguese (pt-BR)
- English (en-US)
- Spanish (es-ES)
- French (fr-FR)
- German (de-DE)
- Italian (it-IT)
- Japanese (ja-JP)

## 📄 License

Same license as the main Plotwist project.

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.MD) for contribution guidelines.

## 📚 Resources

- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Swift API Design Guidelines](https://swift.org/documentation/api-design-guidelines/)

---

For more details, see [IOS_TASKS.md](../../IOS_TASKS.md) for the complete task list and roadmap.
