//
//  ProStatsCardsView.swift
//  Plotwist
//

import SwiftUI

struct ProStatsCardsView: View {
  let userId: String
  let strings: Strings
  let period: String

  @State private var tasteDNA: TasteDNAResult?
  @State private var ratingInsights: RatingInsights?
  @State private var resolvedRecs: [ResolvedRecommendation]?
  @State private var countries: [WatchedCountry]?
  @State private var dnaLoaded = false
  @State private var insightsLoaded = false
  @State private var countriesLoaded = false
  @State private var recsLoaded = false
  @State private var dnaLoadedPeriod: String?
  @State private var countriesLoadedPeriod: String?
  @State private var recsLoadedPeriod: String?

  var body: some View {
    VStack(spacing: 16) {
      if !dnaLoaded {
        ProStatsTasteDNASkeleton()
      } else if let dna = tasteDNA {
        ProStatsTasteDNACard(dna: dna, strings: strings)
      }

      if !insightsLoaded {
        ProStatsRatingInsightsSkeleton()
      } else if let insights = ratingInsights, insights.totalReviews > 0 {
        ProStatsRatingInsightsCard(insights: insights, strings: strings)
      }

      if !countriesLoaded {
        ProStatsCountriesSkeleton()
      } else if let countries, !countries.isEmpty {
        ProStatsCountriesCard(countries: countries, strings: strings)
      }

      if !recsLoaded {
        ProStatsRecommendationsSkeleton()
      } else if let recs = resolvedRecs, !recs.isEmpty {
        ProStatsRecommendationsCard(recs: recs, strings: strings)
      }
    }
    .task {
      let language = Language.current.rawValue
      Task { await loadDNA(language: language, period: period) }
      Task { await loadInsights() }
      Task { await loadCountries(language: language, period: period) }
      Task { await loadRecommendations(language: language, period: period) }
    }
    .onChange(of: period) { _, newPeriod in
      Task {
        await reloadDNA(period: newPeriod)
        await reloadCountries(period: newPeriod)
        await reloadRecommendations(period: newPeriod)
      }
    }
  }

  // MARK: - Reload

  private func reloadDNA(period: String) async {
    guard period != dnaLoadedPeriod else { return }
    let language = Language.current.rawValue
    withAnimation(.easeIn(duration: 0.15)) { tasteDNA = nil; dnaLoaded = false }
    await loadDNA(language: language, period: period)
  }

  private func reloadCountries(period: String) async {
    guard period != countriesLoadedPeriod else { return }
    let language = Language.current.rawValue
    withAnimation(.easeIn(duration: 0.15)) { countries = nil; countriesLoaded = false }
    await loadCountries(language: language, period: period)
  }

  private func reloadRecommendations(period: String) async {
    guard period != recsLoadedPeriod else { return }
    let language = Language.current.rawValue
    withAnimation(.easeIn(duration: 0.15)) { resolvedRecs = nil; recsLoaded = false }
    await loadRecommendations(language: language, period: period)
  }

  // MARK: - Loaders

  private func loadCountries(language: String, period: String) async {
    let result = try? await UserStatsService.shared.getWatchedCountries(userId: userId, language: language, period: period)
    withAnimation(.easeIn(duration: 0.25)) { countries = result; countriesLoadedPeriod = period; countriesLoaded = true }
  }

  private func loadInsights() async {
    let result = try? await UserStatsService.shared.getRatingInsights(userId: userId)
    withAnimation(.easeIn(duration: 0.25)) { ratingInsights = result; insightsLoaded = true }
  }

  private func loadDNA(language: String, period: String) async {
    let result = try? await UserStatsService.shared.getTasteDNA(userId: userId, language: language, period: period)
    let hasContent = result != nil && !result!.archetype.isEmpty && !result!.summary.isEmpty
    withAnimation(.easeIn(duration: 0.25)) {
      tasteDNA = hasContent ? result : nil
      dnaLoadedPeriod = period
      dnaLoaded = true
    }
  }

  private func loadRecommendations(language: String, period: String) async {
    guard let recs = try? await UserStatsService.shared.getAIRecommendations(userId: userId, language: language, period: period),
          !recs.isEmpty else {
      withAnimation(.easeIn(duration: 0.25)) { resolvedRecs = nil; recsLoadedPeriod = period; recsLoaded = true }
      return
    }

    let resolved = await withTaskGroup(of: ResolvedRecommendation.self, returning: [ResolvedRecommendation].self) { group in
      for rec in recs {
        group.addTask {
          let mediaType = rec.mediaType == "tv" ? "tv" : "movie"
          guard let results = try? await TMDBService.shared.searchMulti(query: rec.title, language: language),
                !results.results.isEmpty else {
            return ResolvedRecommendation(rec: rec, tmdbId: nil, posterURL: nil, resolvedMediaType: mediaType)
          }
          let candidates = results.results.filter {
            ($0.mediaType == mediaType || $0.mediaType == nil) && ($0.title ?? $0.name ?? "") == rec.title
          }
          let byTitle = candidates.isEmpty ? results.results : candidates
          let hasPoster: (SearchResult) -> Bool = { $0.posterPath != nil }
          let hasOverview: (SearchResult) -> Bool = {
            guard let o = $0.overview else { return false }
            return !o.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
          }
          let match = byTitle.first(where: { hasPoster($0) && hasOverview($0) })
            ?? byTitle.first(where: hasPoster)
            ?? byTitle.first
          guard let match else {
            return ResolvedRecommendation(rec: rec, tmdbId: nil, posterURL: nil, resolvedMediaType: mediaType)
          }
          let posterURL = match.posterPath.flatMap { URL(string: "https://image.tmdb.org/t/p/w342\($0)") }
          return ResolvedRecommendation(
            rec: rec,
            tmdbId: match.id,
            posterURL: posterURL,
            resolvedMediaType: match.mediaType ?? mediaType
          )
        }
      }
      var results: [ResolvedRecommendation] = []
      for await result in group { results.append(result) }
      return results
    }

    let ordered = recs.compactMap { rec in resolved.first(where: { $0.rec.title == rec.title }) }
    let withPoster = ordered.filter { $0.posterURL != nil }
    withAnimation(.easeIn(duration: 0.25)) { resolvedRecs = withPoster; recsLoadedPeriod = period; recsLoaded = true }
  }
}
