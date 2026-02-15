//
//  Constants.swift
//  Plotwist
//

import Foundation

enum API {
  static let baseURL = "https://plotwist-api-production.up.railway.app"

  /// Token for production client guard. Set in Info.plist key `IOS_TOKEN` (e.g. via xcconfig).
  static var iosToken: String? {
    Bundle.main.object(forInfoDictionaryKey: "IOS_TOKEN") as? String
  }

  static func addIOSTokenHeader(to request: inout URLRequest) {
    if let token = iosToken, !token.isEmpty {
      request.setValue(token, forHTTPHeaderField: "X-IOS-Token")
    }
  }
}
