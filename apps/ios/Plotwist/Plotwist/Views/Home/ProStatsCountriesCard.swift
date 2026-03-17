//
//  ProStatsCountriesCard.swift
//  Plotwist
//

import SwiftUI

struct ProStatsCountriesCard: View {
  let countries: [WatchedCountry]
  let strings: Strings

  var body: some View {
    NavigationLink {
      CountriesDetailView(countries: countries, strings: strings)
    } label: {
      cardContent
    }
    .buttonStyle(.plain)
  }

  private var cardContent: some View {
    let top = Array(countries.prefix(6))
    let maxCount = top.first?.count ?? 1

    return ProStatsCardShell.card(
      title: strings.watchedCountries,
      trailing: {
        Image(systemName: "chevron.right")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(.appMutedForegroundAdaptive)
      }
    ) {
      VStack(spacing: 12) {
        ForEach(top) { country in
          HStack(spacing: 10) {
            Text(flagEmoji(for: country.name))
              .font(.system(size: 26))
              .frame(width: 34)

            VStack(alignment: .leading, spacing: 4) {
              Text(country.name)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive)
                .lineLimit(1)

              GeometryReader { geo in
                let fraction = maxCount > 0 ? CGFloat(country.count) / CGFloat(maxCount) : 0
                RoundedRectangle(cornerRadius: 3)
                  .fill(Color.appForegroundAdaptive.opacity(country.id == top.first?.id ? 0.55 : 0.25))
                  .frame(width: geo.size.width * fraction)
              }
              .frame(height: 4)
            }

            Spacer()

            Text("\(country.count)")
              .font(.system(size: 12, weight: .medium, design: .rounded))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
    }
  }

  private func flagEmoji(for countryName: String) -> String {
    let overrides: [String: String] = [
      "united states of america": "US", "united states": "US",
      "united kingdom": "GB", "south korea": "KR", "republic of korea": "KR",
      "estados unidos da américa": "US", "estados unidos": "US", "reino unido": "GB",
      "coreia do sul": "KR", "coréia do sul": "KR",
    ]
    let lower = countryName.lowercased()
    if let code = overrides[lower] { return emojiFlag(code) }
    let locale = Locale(identifier: "en_US")
    for code in Locale.Region.isoRegions.map(\.identifier) where code.count == 2 {
      if let name = locale.localizedString(forRegionCode: code),
         name.caseInsensitiveCompare(countryName) == .orderedSame {
        return emojiFlag(code)
      }
    }
    return "🌍"
  }

  private func emojiFlag(_ code: String) -> String {
    let base: UInt32 = 127397
    var flag = ""
    for scalar in code.uppercased().unicodeScalars {
      if let s = UnicodeScalar(base + scalar.value) { flag.unicodeScalars.append(s) }
    }
    return flag
  }
}

struct ProStatsCountriesSkeleton: View {
  var body: some View {
    ProStatsCardShell.shell(trailing: true) {
      VStack(spacing: 12) {
        ForEach(0..<6, id: \.self) { _ in
          HStack(spacing: 10) {
            RoundedRectangle(cornerRadius: 4)
              .fill(Color.appBorderAdaptive.opacity(0.3))
              .frame(width: 34, height: 26)
              .modifier(ShimmerEffect())
            VStack(alignment: .leading, spacing: 4) {
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.25))
                .frame(width: 100, height: 13)
                .modifier(ShimmerEffect())
              RoundedRectangle(cornerRadius: 2)
                .fill(Color.appBorderAdaptive.opacity(0.2))
                .frame(height: 4)
                .modifier(ShimmerEffect())
            }
            Spacer()
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(width: 24, height: 12)
              .modifier(ShimmerEffect())
          }
        }
      }
    }
  }
}
