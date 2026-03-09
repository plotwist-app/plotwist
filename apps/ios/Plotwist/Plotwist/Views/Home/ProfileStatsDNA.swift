//
//  ProfileStatsDNA.swift
//  Plotwist
//

import Foundation

struct TasteDNA {
  let traits: [TasteTrait]

  static func compute(
    genres: [WatchedGenre],
    countries: [WatchedCountry],
    movieHours: Double,
    seriesHours: Double,
    totalHours: Double
  ) -> TasteDNA {
    var traits: [TasteTrait] = []

    if !genres.isEmpty {
      traits.append(computePace(genres: genres))
      traits.append(computeTone(genres: genres))
    }

    if totalHours > 0 {
      traits.append(computeFormat(
        movieHours: movieHours,
        seriesHours: seriesHours,
        totalHours: totalHours
      ))
    }

    if !countries.isEmpty {
      traits.append(computeOrigin(countries: countries))
    }

    return TasteDNA(traits: traits)
  }

  // MARK: - Genre Classification Sets

  private static let slowGenres: Set<String> = [
    "drama", "mystery", "documentary", "history", "war", "war & politics",
    "romance", "family", "biography"
  ]

  private static let fastGenres: Set<String> = [
    "action", "action & adventure", "thriller", "horror", "adventure",
    "science fiction", "sci-fi & fantasy", "crime"
  ]

  private static let darkGenres: Set<String> = [
    "horror", "thriller", "crime", "war", "war & politics", "mystery", "drama"
  ]

  private static let lightGenres: Set<String> = [
    "comedy", "animation", "family", "romance", "music", "kids"
  ]

  private static let asianCountryTokens: Set<String> = [
    "south korea", "korea", "japan", "china", "taiwan", "hong kong",
    "thailand", "india", "indonesia", "philippines",
    "coreia do sul", "coréia do sul", "japão", "tailândia", "índia",
    "corea del sur", "japón",
    "corée du sud", "japon", "chine", "thaïlande", "inde",
    "südkorea", "thailand", "indien",
    "corea del sud", "giappone", "cina",
    "韓国", "日本", "中国"
  ]

  private static let westernTokens: Set<String> = [
    "united states of america", "united states", "united kingdom",
    "united kingdom of great britain and northern ireland",
    "estados unidos da américa", "estados unidos", "reino unido",
    "estados unidos de américa",
    "états-unis", "états-unis d'amérique", "royaume-uni",
    "vereinigte staaten", "vereinigte staaten von amerika",
    "großbritannien", "vereinigtes königreich",
    "stati uniti", "stati uniti d'america", "regno unito",
    "アメリカ合衆国", "イギリス"
  ]

  // MARK: - Trait Computation

  private static func computePace(genres: [WatchedGenre]) -> TasteTrait {
    let topGenres = Array(genres.prefix(5))
    let totalWeight = topGenres.reduce(0.0) { $0 + $1.percentage }

    var slowWeight = 0.0
    var fastWeight = 0.0
    var slowEvidence: [String] = []
    var fastEvidence: [String] = []

    for genre in topGenres {
      let lower = genre.name.lowercased()
      if slowGenres.contains(lower) {
        slowWeight += genre.percentage
        slowEvidence.append(genre.name)
      }
      if fastGenres.contains(lower) {
        fastWeight += genre.percentage
        fastEvidence.append(genre.name)
      }
    }

    let value: TasteTraitValue
    let evidence: [String]
    let confidence: Double

    if fastWeight > slowWeight * 1.3 {
      value = .fastIntense
      evidence = fastEvidence
      confidence = min(fastWeight / max(totalWeight, 1), 1)
    } else if slowWeight > fastWeight * 1.3 {
      value = .slowTense
      evidence = slowEvidence
      confidence = min(slowWeight / max(totalWeight, 1), 1)
    } else {
      value = .variedRhythm
      evidence = Array(Set(slowEvidence + fastEvidence))
      confidence = 0.5
    }

    return TasteTrait(
      type: .pace,
      value: value,
      confidence: confidence,
      evidenceGenres: evidence,
      evidencePercent: Int(max(fastWeight, slowWeight)),
      icon: "waveform.path"
    )
  }

  private static func computeTone(genres: [WatchedGenre]) -> TasteTrait {
    let topGenres = Array(genres.prefix(5))
    let totalWeight = topGenres.reduce(0.0) { $0 + $1.percentage }

    var darkWeight = 0.0
    var lightWeight = 0.0
    var darkEvidence: [String] = []
    var lightEvidence: [String] = []

    for genre in topGenres {
      let lower = genre.name.lowercased()
      if darkGenres.contains(lower) {
        darkWeight += genre.percentage
        darkEvidence.append(genre.name)
      }
      if lightGenres.contains(lower) {
        lightWeight += genre.percentage
        lightEvidence.append(genre.name)
      }
    }

    let value: TasteTraitValue
    let evidence: [String]
    let confidence: Double

    if darkWeight > lightWeight * 1.3 {
      value = .darkMoody
      evidence = darkEvidence
      confidence = min(darkWeight / max(totalWeight, 1), 1)
    } else if lightWeight > darkWeight * 1.3 {
      value = .lightUpbeat
      evidence = lightEvidence
      confidence = min(lightWeight / max(totalWeight, 1), 1)
    } else {
      value = .eclectic
      evidence = Array(Set(darkEvidence + lightEvidence))
      confidence = 0.5
    }

    return TasteTrait(
      type: .tone,
      value: value,
      confidence: confidence,
      evidenceGenres: evidence,
      evidencePercent: Int(max(darkWeight, lightWeight)),
      icon: "theatermasks"
    )
  }

  private static func computeFormat(
    movieHours: Double,
    seriesHours: Double,
    totalHours: Double
  ) -> TasteTrait {
    let movieRatio = movieHours / max(totalHours, 1)
    let seriesRatio = seriesHours / max(totalHours, 1)

    let value: TasteTraitValue
    let confidence: Double

    if seriesRatio > 0.65 {
      value = .bingeWatcher
      confidence = seriesRatio
    } else if movieRatio > 0.65 {
      value = .filmLover
      confidence = movieRatio
    } else {
      value = .balancedViewer
      confidence = 0.5
    }

    return TasteTrait(
      type: .format,
      value: value,
      confidence: confidence,
      evidenceGenres: [],
      evidencePercent: Int(max(movieRatio, seriesRatio) * 100),
      icon: "play.rectangle.on.rectangle"
    )
  }

  private static func computeOrigin(countries: [WatchedCountry]) -> TasteTrait {
    let top3 = Array(countries.prefix(3))

    var westernWeight = 0.0
    var asianWeight = 0.0

    for country in top3 {
      let lower = country.name.lowercased()
      if westernTokens.contains(lower) {
        westernWeight += country.percentage
      }
      if asianCountryTokens.contains(lower) {
        asianWeight += country.percentage
      }
    }

    let value: TasteTraitValue
    let confidence: Double

    if asianWeight > 25 {
      value = .asianCinema
      confidence = min(asianWeight / 100, 1)
    } else if westernWeight > 70 || countries.count <= 3 {
      value = .mainstream
      confidence = min(westernWeight / 100, 1)
    } else {
      value = .globalExplorer
      confidence = min(Double(countries.count) / 10.0, 1)
    }

    return TasteTrait(
      type: .origin,
      value: value,
      confidence: confidence,
      evidenceGenres: top3.map(\.name),
      evidencePercent: countries.count,
      icon: "globe"
    )
  }
}

// MARK: - Trait Models

struct TasteTrait {
  let type: TasteTraitType
  let value: TasteTraitValue
  let confidence: Double
  let evidenceGenres: [String]
  let evidencePercent: Int
  let icon: String
}

enum TasteTraitType {
  case pace, tone, format, origin

  func localizedName(_ strings: Strings) -> String {
    switch self {
    case .pace: return strings.dnaPace
    case .tone: return strings.dnaTone
    case .format: return strings.dnaFormat
    case .origin: return strings.dnaOrigin
    }
  }
}

enum TasteTraitValue {
  case slowTense, fastIntense, variedRhythm
  case darkMoody, lightUpbeat, eclectic
  case bingeWatcher, filmLover, balancedViewer
  case globalExplorer, mainstream, asianCinema

  func localizedDescription(_ strings: Strings) -> String {
    switch self {
    case .slowTense: return strings.dnaSlowTense
    case .fastIntense: return strings.dnaFastIntense
    case .variedRhythm: return strings.dnaVariedRhythm
    case .darkMoody: return strings.dnaDarkMoody
    case .lightUpbeat: return strings.dnaLightUpbeat
    case .eclectic: return strings.dnaEclectic
    case .bingeWatcher: return strings.dnaBingeWatcher
    case .filmLover: return strings.dnaFilmLover
    case .balancedViewer: return strings.dnaBalancedViewer
    case .globalExplorer: return strings.dnaGlobalExplorer
    case .mainstream: return strings.dnaMainstream
    case .asianCinema: return strings.dnaAsianCinema
    }
  }
}
