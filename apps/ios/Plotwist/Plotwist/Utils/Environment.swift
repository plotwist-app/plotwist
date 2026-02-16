//
//  Environment.swift
//  Plotwist
//

import Foundation

enum Env {
    static func value(for key: String, fallback: String? = nil) -> String {
        if let value = Bundle.main.infoDictionary?[key] as? String, !value.isEmpty {
            return value.trimmingCharacters(in: .whitespacesAndNewlines)
        }
        print("⚠️ [Env] Missing key: '\(key)' in Info.plist")
        if let fallback {
            print("⚠️ [Env] Using fallback for '\(key)': \(fallback)")
            return fallback
        }
        return ""
    }

    static func debugPrintAll() {
        print("🔍 [Env] === Environment Debug ===")
        print("🔍 [Env] Info.plist keys: \(Bundle.main.infoDictionary?.keys.sorted() ?? [])")
        print("🔍 [Env] API_BASE_URL = '\(Bundle.main.infoDictionary?["API_BASE_URL"] ?? "NOT FOUND")'")
        print("🔍 [Env] POSTHOG_API_KEY = '\(Bundle.main.infoDictionary?["POSTHOG_API_KEY"] ?? "NOT FOUND")'")
        print("🔍 [Env] POSTHOG_HOST = '\(Bundle.main.infoDictionary?["POSTHOG_HOST"] ?? "NOT FOUND")'")
        print("🔍 [Env] Resolved apiBaseURL = '\(apiBaseURL)'")
        print("🔍 [Env] ===========================")
    }

    static var apiBaseURL: String {
        value(for: "API_BASE_URL", fallback: "https://plotwist-api-production.up.railway.app")
    }

    static var posthogAPIKey: String {
        value(for: "POSTHOG_API_KEY", fallback: "phc_jb6woqg2i2Xo5MYzSR14mDj6tsFoMQzjhLPvZ28iH1T")
    }

    static var posthogHost: String {
        value(for: "POSTHOG_HOST", fallback: "https://app.posthog.com")
    }
}
