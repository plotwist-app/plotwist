//
//  ProfileTabEnums.swift
//  Plotwist
//

import SwiftUI

// MARK: - Scroll Offset Preference Key
struct ScrollOffsetPreferenceKey: PreferenceKey {
  static var defaultValue: CGFloat = 0
  static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
    value = nextValue()
  }
}

// MARK: - Profile Status Tab
enum ProfileStatusTab: String, CaseIterable {
  case watched = "WATCHED"
  case watching = "WATCHING"
  case watchlist = "WATCHLIST"
  case dropped = "DROPPED"

  func displayName(strings: Strings) -> String {
    switch self {
    case .watched: return strings.watched
    case .watching: return strings.watching
    case .watchlist: return strings.watchlist
    case .dropped: return strings.dropped
    }
  }

  var icon: String {
    switch self {
    case .watched: return "eye.fill"
    case .watching: return "play.circle.fill"
    case .watchlist: return "clock.fill"
    case .dropped: return "xmark.circle.fill"
    }
  }

  var color: Color {
    switch self {
    case .watched: return .green
    case .watching: return .blue
    case .watchlist: return .orange
    case .dropped: return .red
    }
  }
}

// MARK: - Profile Main Tab
enum ProfileMainTab: CaseIterable {
  case collection
  case reviews
  case stats

  func displayName(strings: Strings) -> String {
    switch self {
    case .collection: return strings.collection
    case .reviews: return strings.reviews
    case .stats: return strings.stats
    }
  }

  var index: Int {
    switch self {
    case .collection: return 0
    case .reviews: return 1
    case .stats: return 2
    }
  }
}
