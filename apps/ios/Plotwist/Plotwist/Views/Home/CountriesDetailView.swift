//
//  CountriesDetailView.swift
//  Plotwist

import SwiftUI
import UIKit

private let countriesDetailCornerRadius: CGFloat = 24

struct CountriesDetailView: View {
  let countries: [WatchedCountry]
  let strings: Strings
  @Environment(\.dismiss) private var dismiss

  private var globePins: [CountryPin] {
    countries.compactMap { country -> CountryPin? in
      guard let code = isoCode(for: country.name),
            let c = countryCentroids[code] else { return nil }
      return CountryPin(code: code, count: country.count, lat: c.lat, lon: c.lon)
    }
  }

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .topLeading) {
        ScrollView {
          VStack(spacing: 0) {
            mapSection
            countryListSection
          }
        }
        .ignoresSafeArea(edges: .top)

        backButton(topSafe: geo.safeAreaInsets.top)
      }
    }
    .background(Color.appBackgroundAdaptive)
    .navigationBarHidden(true)
  }

  // MARK: - Floating Back Button

  private func backButton(topSafe: CGFloat) -> some View {
    Button(action: { dismiss() }) {
      Image(systemName: "chevron.left")
        .font(.system(size: 16, weight: .semibold))
        .foregroundColor(.appForegroundAdaptive)
        .frame(width: 36, height: 36)
        .background(.ultraThinMaterial)
        .clipShape(Circle())
    }
    .padding(.leading, 24)
    .padding(.top, topSafe + 2)
  }

  // MARK: - Map Section

  private var mapSection: some View {
    GlobeMapView(pins: globePins, footerOverlayColor: Color.appBackgroundAdaptive)
      .frame(height: 520)
  }

  // MARK: - Country List (rounded card overlapping map)

  private var countryListSection: some View {
    let maxCount = countries.first?.count ?? 1

    return ZStack(alignment: .top) {
      Color.appBackgroundAdaptive

      VStack(spacing: 0) {
        LazyVStack(spacing: 0) {
          ForEach(Array(countries.enumerated()), id: \.element.id) { index, country in
            countryRow(country, rank: index + 1, maxCount: maxCount)
          }
        }
        .padding(.top, 12)
        .padding(.bottom, 32)
      }
    }
    .clipShape(RoundedCorner(radius: countriesDetailCornerRadius, corners: [.topLeft, .topRight]))
    .offset(y: -countriesDetailCornerRadius)
  }

  private func countryRow(_ country: WatchedCountry, rank: Int, maxCount: Int) -> some View {
    let fraction = maxCount > 0 ? CGFloat(country.count) / CGFloat(maxCount) : 0

    return HStack(spacing: 14) {
      Text(flagEmoji(for: country.name))
        .font(.system(size: 44))
        .frame(width: 52)

      VStack(alignment: .leading, spacing: 6) {
        HStack(alignment: .firstTextBaseline) {
          Text("\(rank). \(country.name)")
            .font(.system(size: 15, weight: .medium))
            .foregroundColor(.appForegroundAdaptive)
            .lineLimit(1)
          Spacer(minLength: 8)
          Text("\(country.count)")
            .font(.system(size: 14, weight: .bold, design: .rounded))
            .foregroundColor(.appMutedForegroundAdaptive)
        }

        GeometryReader { geo in
          ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 2.5)
              .fill(Color.appForegroundAdaptive.opacity(0.06))
            RoundedRectangle(cornerRadius: 2.5)
              .fill(Color.appForegroundAdaptive.opacity(rank == 1 ? 0.6 : 0.25))
              .frame(width: geo.size.width * fraction)
          }
        }
        .frame(height: 4)
      }
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 14)
  }

  // MARK: - Helpers

  private func isoCode(for name: String) -> String? {
    let normalized = name.trimmingCharacters(in: .whitespaces).lowercased()
    var overrides: [String: String] = [:]
    overrides["united states of america"] = "US"
    overrides["united states"] = "US"
    overrides["united kingdom"] = "GB"
    overrides["south korea"] = "KR"
    overrides["republic of korea"] = "KR"
    overrides["estados unidos da américa"] = "US"
    overrides["estados unidos"] = "US"
    overrides["reino unido"] = "GB"
    overrides["coreia do sul"] = "KR"
    overrides["coréia do sul"] = "KR"
    overrides["china"] = "CN"
    overrides["people's republic of china"] = "CN"
    overrides["republic of china"] = "CN"
    overrides["russia"] = "RU"
    overrides["russian federation"] = "RU"
    overrides["vietnam"] = "VN"
    overrides["viet nam"] = "VN"
    overrides["iran"] = "IR"
    overrides["iran, islamic republic of"] = "IR"
    overrides["tanzania"] = "TZ"
    overrides["tanzania, united republic of"] = "TZ"
    overrides["bolivia"] = "BO"
    overrides["bolivia (plurinational state of)"] = "BO"
    overrides["venezuela"] = "VE"
    overrides["venezuela (bolivarian republic of)"] = "VE"
    overrides["laos"] = "LA"
    overrides["lao people's democratic republic"] = "LA"
    overrides["brunei"] = "BN"
    overrides["brunei darussalam"] = "BN"
    overrides["syria"] = "SY"
    overrides["syrian arab republic"] = "SY"
    overrides["moldova"] = "MD"
    overrides["republic of moldova"] = "MD"
    overrides["north macedonia"] = "MK"
    overrides["macedonia"] = "MK"
    overrides["czech republic"] = "CZ"
    overrides["czechia"] = "CZ"
    overrides["taiwan"] = "TW"
    overrides["taiwan, province of china"] = "TW"
    overrides["palestine"] = "PS"
    overrides["palestinian territory"] = "PS"
    overrides["trinidad and tobago"] = "TT"

    if let code = overrides[normalized] { return code }

    for code in Locale.Region.isoRegions.map(\.identifier) where code.count == 2 {
      if let localized = Locale(identifier: "en_US").localizedString(forRegionCode: code),
         localized.lowercased() == normalized {
        return code
      }
    }
    return nil
  }

  private func flagEmoji(for name: String) -> String {
    guard let code = isoCode(for: name) else { return "🌍" }
    let base: UInt32 = 127397
    var flag = ""
    for scalar in code.uppercased().unicodeScalars {
      if let s = UnicodeScalar(base + scalar.value) { flag.unicodeScalars.append(s) }
    }
    return flag
  }
}
