//
//  Language.swift
//  Plotwist
//

import Foundation

enum Language: String, CaseIterable {
    case enUS = "en-US"
    case ptBR = "pt-BR"
    case esES = "es-ES"
    case frFR = "fr-FR"
    case deDE = "de-DE"
    case itIT = "it-IT"
    case jaJP = "ja-JP"
    
    var displayName: String {
        switch self {
        case .enUS: return "English"
        case .ptBR: return "Português"
        case .esES: return "Español"
        case .frFR: return "Français"
        case .deDE: return "Deutsch"
        case .itIT: return "Italiano"
        case .jaJP: return "日本語"
        }
    }

    var flag: String {
        switch self {
        case .enUS: return "🇺🇸"
        case .ptBR: return "🇧🇷"
        case .esES: return "🇪🇸"
        case .frFR: return "🇫🇷"
        case .deDE: return "🇩🇪"
        case .itIT: return "🇮🇹"
        case .jaJP: return "🇯🇵"
        }
    }
    
    static var current: Language {
        get {
            if let saved = UserDefaults.standard.string(forKey: "language"),
               let lang = Language(rawValue: saved) {
                return lang
            }
            
            let preferredLanguage = Locale.preferredLanguages.first ?? "en-US"
            return Language(rawValue: preferredLanguage) ?? .enUS
        }
        set {
            UserDefaults.standard.set(newValue.rawValue, forKey: "language")
            NotificationCenter.default.post(name: .languageChanged, object: nil)
        }
    }
}

extension Notification.Name {
    static let languageChanged = Notification.Name("languageChanged")
}
