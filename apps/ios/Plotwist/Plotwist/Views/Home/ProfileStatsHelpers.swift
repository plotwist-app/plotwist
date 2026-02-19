//
//  ProfileStatsHelpers.swift
//  Plotwist
//

import SwiftUI

// MARK: - Free Utility Functions (shared across views)

private let decimalFormatter: NumberFormatter = {
  let f = NumberFormatter()
  f.numberStyle = .decimal
  return f
}()

func formatTotalMinutes(_ hours: Double) -> String {
  let totalMinutes = Int(hours * 60)
  return decimalFormatter.string(from: NSNumber(value: totalMinutes)) ?? "\(totalMinutes)"
}

func formatTotalHours(_ hours: Double) -> String {
  let rounded = Int(hours)
  return decimalFormatter.string(from: NSNumber(value: rounded)) ?? "\(rounded)"
}

func formatHoursMinutes(_ hours: Double) -> String {
  let totalMinutes = Int(hours * 60)
  let h = totalMinutes / 60
  let m = totalMinutes % 60
  if h == 0 { return "\(m)m" }
  if m == 0 { return "\(h)h" }
  return "\(h)h \(m)m"
}

func computeGridSteps(maxValue: Double) -> [Double] {
  guard maxValue > 0 else { return [1] }
  let nice = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000.0]
  let target = maxValue / 3.0
  let step = nice.first(where: { $0 >= target }) ?? maxValue
  var steps: [Double] = []
  var v = step
  while v <= maxValue + step * 0.1 {
    steps.append(v)
    v += step
  }
  if steps.isEmpty { steps = [maxValue] }
  return steps
}

func formatAxisLabel(_ value: Double) -> String {
  if value >= 1000 { return String(format: "%.0fk", value / 1000) }
  if value == floor(value) { return String(format: "%.0f", value) }
  return String(format: "%.1f", value)
}

private let ymParseFormatter: DateFormatter = {
  let f = DateFormatter()
  f.dateFormat = "yyyy-MM"
  return f
}()

private let shortMonthFormatter: DateFormatter = {
  let f = DateFormatter()
  f.dateFormat = "MMM"
  return f
}()

private let fullMonthFormatter: DateFormatter = {
  let f = DateFormatter()
  f.dateFormat = "MMMM"
  return f
}()

func shortMonthLabel(_ month: String) -> String {
  guard let date = ymParseFormatter.date(from: month) else { return month }
  return shortMonthFormatter.string(from: date).prefix(3).lowercased()
}

func fullMonthLabel(_ month: String) -> String {
  guard let date = ymParseFormatter.date(from: month) else { return month }
  return fullMonthFormatter.string(from: date)
}

// MARK: - ProfileStatsView Helpers
extension ProfileStatsView {
  func formatHours(_ hours: Double) -> String {
    if hours >= 1000 {
      return String(format: "%.1fk", hours / 1000)
    }
    return String(format: "%.0f", hours)
  }

  func formatDays(_ hours: Double) -> String {
    let days = hours / 24
    return String(format: "%.0f", days)
  }

  // MARK: - Country Helpers

  static var tmdbNameOverrides: [String: String] {
    [
      "united states of america": "US",
      "united states": "US",
      "united kingdom of great britain and northern ireland": "GB",
      "korea": "KR",
      "republic of korea": "KR",
      "south korea": "KR",
      "czech republic": "CZ",
      "russian federation": "RU",
      "taiwan, province of china": "TW",
      "hong kong sar china": "HK",
      "iran, islamic republic of": "IR",
      "viet nam": "VN",
      "estados unidos da américa": "US",
      "estados unidos": "US",
      "reino unido": "GB",
      "coreia do sul": "KR",
      "coréia do sul": "KR",
      "república tcheca": "CZ",
      "república checa": "CZ",
      "estados unidos de américa": "US",
      "corea del sur": "KR",
      "états-unis": "US",
      "états-unis d'amérique": "US",
      "corée du sud": "KR",
      "royaume-uni": "GB",
      "vereinigte staaten von amerika": "US",
      "vereinigte staaten": "US",
      "südkorea": "KR",
      "großbritannien": "GB",
      "vereinigtes königreich": "GB",
      "tschechien": "CZ",
      "stati uniti d'america": "US",
      "stati uniti": "US",
      "regno unito": "GB",
      "アメリカ合衆国": "US",
      "韓国": "KR",
      "イギリス": "GB",
    ]
  }

  func isoCodeForCountry(_ name: String) -> String? {
    if let code = Self.tmdbNameOverrides[name.lowercased()] {
      return code
    }

    let languageId = Language.current.rawValue.replacingOccurrences(of: "-", with: "_")
    let locale = Locale(identifier: languageId)

    for code in Locale.Region.isoRegions.map(\.identifier) {
      guard code.count == 2 else { continue }
      if let localizedName = locale.localizedString(forRegionCode: code),
         localizedName.caseInsensitiveCompare(name) == .orderedSame {
        return code
      }
    }

    let enLocale = Locale(identifier: "en_US")
    for code in Locale.Region.isoRegions.map(\.identifier) {
      guard code.count == 2 else { continue }
      if let localizedName = enLocale.localizedString(forRegionCode: code),
         localizedName.caseInsensitiveCompare(name) == .orderedSame {
        return code
      }
    }

    for code in Locale.Region.isoRegions.map(\.identifier) {
      guard code.count == 2 else { continue }
      if let localizedName = enLocale.localizedString(forRegionCode: code),
         name.localizedCaseInsensitiveContains(localizedName) || localizedName.localizedCaseInsensitiveContains(name) {
        return code
      }
    }

    return nil
  }

  func flagForCountry(_ name: String) -> String {
    guard let code = isoCodeForCountry(name) else { return "🌍" }
    return emojiFlag(code)
  }

  func emojiFlag(_ countryCode: String) -> String {
    let base: UInt32 = 127397
    var flag = ""
    for scalar in countryCode.uppercased().unicodeScalars {
      if let s = UnicodeScalar(base + scalar.value) {
        flag.unicodeScalars.append(s)
      }
    }
    return flag
  }
}

// MARK: - Stats Genre Chip
struct StatsGenreChip: View {
  let genre: WatchedGenre
  let isFirst: Bool

  var body: some View {
    HStack(spacing: 8) {
      Text(genre.name)
        .font(.system(size: 14, weight: .medium))
      Text("\(genre.count)")
        .font(.system(size: 12))
        .opacity(isFirst ? 0.6 : 1)
    }
    .foregroundColor(isFirst ? .appBackgroundAdaptive : .appForegroundAdaptive)
    .padding(.horizontal, 16)
    .padding(.vertical, 10)
    .background(isFirst ? Color.appForegroundAdaptive : Color.clear)
    .overlay(
      RoundedRectangle(cornerRadius: 20)
        .strokeBorder(Color.appBorderAdaptive, lineWidth: isFirst ? 0 : 1)
    )
    .clipShape(RoundedRectangle(cornerRadius: 20))
  }
}

// MARK: - Best Review Row
struct BestReviewRow: View {
  let review: BestReview
  let rank: Int

  private var posterWidth: CGFloat {
    (UIScreen.main.bounds.width - 48 - 24) / 3
  }

  private var posterHeight: CGFloat {
    posterWidth * 1.5
  }

  private static let isoFormatterFractional: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    return f
  }()

  private static let isoFormatter: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime]
    return f
  }()

  private static let dateOutputFormatter: DateFormatter = {
    let f = DateFormatter()
    f.dateFormat = "dd/MM/yyyy"
    return f
  }()

  private var formattedDate: String {
    if let date = Self.isoFormatterFractional.date(from: review.createdAt) {
      return Self.dateOutputFormatter.string(from: date)
    }
    if let date = Self.isoFormatter.date(from: review.createdAt) {
      return Self.dateOutputFormatter.string(from: date)
    }
    return review.createdAt
  }

  var body: some View {
    HStack(alignment: .center, spacing: 12) {
      CachedAsyncImage(url: review.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: posterWidth, height: posterHeight)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)

      VStack(alignment: .leading, spacing: 8) {
        Text(review.title)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(2)

        HStack(spacing: 8) {
          StarRatingView(rating: .constant(review.rating), size: 14, interactive: false)

          Circle()
            .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
            .frame(width: 4, height: 4)

          Text(formattedDate)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        if !review.review.isEmpty {
          Text(review.review)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(3)
            .multilineTextAlignment(.leading)
            .blur(radius: review.hasSpoilers ? 4 : 0)
            .overlay(
              review.hasSpoilers
                ? Text(L10n.current.containSpoilers)
                    .font(.caption.weight(.medium))
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 3)
                    .background(Color.appInputFilled)
                    .cornerRadius(4)
                : nil
            )
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}
