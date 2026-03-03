//
//  ProStatsCardsView.swift
//  Plotwist

import SwiftUI

private struct ResolvedRecommendation: Identifiable {
  let rec: AIRecommendation
  let tmdbId: Int?
  let posterURL: URL?
  let resolvedMediaType: String

  var id: String { rec.id }
}

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
        tasteDNASkeleton()
      } else if let dna = tasteDNA {
        tasteDNACard(dna)
      }

      if !insightsLoaded {
        ratingInsightsSkeleton()
      } else if let insights = ratingInsights, insights.totalReviews > 0 {
        ratingInsightsCard(insights)
      }

      if !countriesLoaded {
        countriesSkeleton()
      } else if let countries, !countries.isEmpty {
        countriesCard(countries)
      }

      if !recsLoaded {
        recommendationsSkeleton()
      } else if let recs = resolvedRecs, !recs.isEmpty {
        recommendationsCard(recs)
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
          if let results = try? await TMDBService.shared.searchMulti(query: rec.title, language: language),
             let match = results.results.first(where: {
               ($0.mediaType == mediaType || $0.mediaType == nil) && ($0.title ?? $0.name ?? "") == rec.title
             }) ?? results.results.first {
            let posterURL = match.posterPath.flatMap { URL(string: "https://image.tmdb.org/t/p/w342\($0)") }
            return ResolvedRecommendation(
              rec: rec,
              tmdbId: match.id,
              posterURL: posterURL,
              resolvedMediaType: match.mediaType ?? mediaType
            )
          }
          return ResolvedRecommendation(rec: rec, tmdbId: nil, posterURL: nil, resolvedMediaType: mediaType)
        }
      }
      var results: [ResolvedRecommendation] = []
      for await result in group { results.append(result) }
      return results
    }

    let ordered = recs.compactMap { rec in resolved.first(where: { $0.rec.title == rec.title }) }
    withAnimation(.easeIn(duration: 0.25)) { resolvedRecs = ordered; recsLoadedPeriod = period; recsLoaded = true }
  }

  // MARK: - Taste DNA Card

  private func tasteDNACard(_ dna: TasteDNAResult) -> some View {
    proCard(title: strings.yourTasteDNA) {
      VStack(alignment: .leading, spacing: 14) {
        Text(dna.archetype)
          .font(.system(size: 20, weight: .bold, design: .rounded))
          .foregroundColor(.appForegroundAdaptive)

        Text(dna.summary)
          .font(.system(size: 14, weight: .regular))
          .foregroundColor(.appForegroundAdaptive)
          .lineSpacing(5)
          .fixedSize(horizontal: false, vertical: true)

        if !dna.traits.isEmpty {
          FlowLayout(spacing: 8) {
            ForEach(dna.traits, id: \.self) { trait in
              Text(trait)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.appForegroundAdaptive.opacity(0.7))
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Color.appForegroundAdaptive.opacity(0.06))
                .clipShape(Capsule())
            }
          }
        }

        HStack(spacing: 4) {
          Image(systemName: "sparkles")
            .font(.system(size: 9))
          Text(strings.generatedByAI)
            .font(.system(size: 10, weight: .medium))
        }
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.6))
      }
    }
  }

  // MARK: - Rating Insights Card

  private func ratingInsightsCard(_ insights: RatingInsights) -> some View {
    proCard(title: strings.ratingInsights) {
      VStack(alignment: .leading, spacing: 20) {
        HStack(alignment: .center, spacing: 16) {
          HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(String(format: "%.1f", insights.averageRating))
              .font(.system(size: 32, weight: .bold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)
            Image(systemName: "star.fill")
              .font(.system(size: 18))
              .foregroundColor(.appStarYellow)
          }
          .padding(.horizontal, 14)
          .padding(.vertical, 10)
          .background(Color.appForegroundAdaptive.opacity(0.06))
          .clipShape(RoundedRectangle(cornerRadius: 12))

          VStack(alignment: .leading, spacing: 2) {
            Text("\(insights.totalReviews) \(strings.reviewsLabel)")
              .font(.system(size: 15, weight: .semibold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)
            Text(strings.avgRating)
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }

          Spacer(minLength: 0)

          VStack(alignment: .trailing, spacing: 2) {
            Text(strings.mostGiven)
              .font(.system(size: 11, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
            HStack(spacing: 3) {
              Text(String(format: "%.1f", insights.mostFrequentRating))
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundColor(.appForegroundAdaptive)
              Image(systemName: "star.fill")
                .font(.system(size: 10))
                .foregroundColor(.appStarYellow)
            }
          }
        }

        ratingDistributionBars(insights.distribution)
      }
    }
  }

  private func ratingDistributionBars(_ distribution: [RatingBucket]) -> some View {
    let maxCount = distribution.map(\.count).max() ?? 1
    let sorted = distribution.sorted { $0.rating > $1.rating }
    let peakRating = distribution.max(by: { $0.count < $1.count })?.rating

    return VStack(spacing: 8) {
      ForEach(sorted) { bucket in
        HStack(alignment: .center, spacing: 10) {
          Text(bucket.rating.truncatingRemainder(dividingBy: 1) == 0 ? "\(Int(bucket.rating))" : String(format: "%.1f", bucket.rating))
            .font(.system(size: 12, weight: .medium, design: .rounded))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(width: 20, alignment: .leading)

          GeometryReader { geo in
            let fraction = maxCount > 0 ? CGFloat(bucket.count) / CGFloat(maxCount) : 0
            ZStack(alignment: .leading) {
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appForegroundAdaptive.opacity(0.08))
              RoundedRectangle(cornerRadius: 3)
                .fill(bucket.rating == peakRating ? Color.appStarYellow.opacity(0.9) : Color.appForegroundAdaptive.opacity(0.28))
                .frame(width: max(geo.size.width * fraction, 4))
            }
          }
          .frame(height: 8)

          Text("\(bucket.count)")
            .font(.system(size: 12, weight: .semibold, design: .rounded))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(width: 24, alignment: .trailing)
        }
      }
    }
  }

  // MARK: - Countries Card

  private func countriesCard(_ countries: [WatchedCountry]) -> some View {
    let top = Array(countries.prefix(6))
    let maxCount = top.first?.count ?? 1

    return NavigationLink {
      CountriesDetailView(countries: countries, strings: strings)
    } label: {
      countriesCardContent(top: top, maxCount: maxCount)
    }
    .buttonStyle(.plain)
  }

  private func countriesCardContent(top: [WatchedCountry], maxCount: Int) -> some View {
    proCard(title: strings.watchedCountries, trailing: {
      Image(systemName: "chevron.right")
        .font(.system(size: 12, weight: .semibold))
        .foregroundColor(.appMutedForegroundAdaptive)
    }) {
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

  // MARK: - AI Recommendations Card (grid 3 cols, posters only)

  private func recommendationsCard(_ recs: [ResolvedRecommendation]) -> some View {
    proCard(
      title: strings.forYou,
      trailing: {
        HStack(spacing: 4) {
          Image(systemName: "sparkles")
            .font(.system(size: 9))
          Text(strings.generatedByAI)
            .font(.system(size: 11, weight: .medium))
        }
        .foregroundColor(.appMutedForegroundAdaptive.opacity(0.7))
      }
    ) {
      let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
      ]
      LazyVGrid(columns: columns, spacing: 14) {
        ForEach(recs) { resolved in
          recPosterWithReason(resolved)
        }
      }
    }
  }

  @ViewBuilder
  private func recPosterWithReason(_ resolved: ResolvedRecommendation) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      let poster = CachedAsyncImage(url: resolved.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive.opacity(0.3))
          .overlay {
            Image(systemName: resolved.rec.mediaType == "movie" ? "film" : "tv")
              .font(.system(size: 24))
              .foregroundColor(.appMutedForegroundAdaptive.opacity(0.4))
          }
      }
      .aspectRatio(2 / 3, contentMode: .fit)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .shadow(color: .black.opacity(0.12), radius: 3, x: 0, y: 1)

      if let tmdbId = resolved.tmdbId {
        NavigationLink {
          MediaDetailView(mediaId: tmdbId, mediaType: resolved.resolvedMediaType)
        } label: {
          poster
        }
        .buttonStyle(.plain)
      } else {
        poster
      }

      Text(resolved.rec.reason)
        .font(.system(size: 11, weight: .regular))
        .foregroundColor(.appMutedForegroundAdaptive)
        .lineLimit(4)
        .multilineTextAlignment(.leading)
    }
  }

  // MARK: - Skeletons (faithful to each card layout)

  private func skeletonCardTitle() -> some View {
    RoundedRectangle(cornerRadius: 4)
      .fill(Color.appBorderAdaptive.opacity(0.4))
      .frame(width: 100, height: 12)
      .modifier(ShimmerEffect())
  }

  private func tasteDNASkeleton() -> some View {
    proCardShell {
      VStack(alignment: .leading, spacing: 14) {
        skeletonCardTitle()
        RoundedRectangle(cornerRadius: 4)
          .fill(Color.appBorderAdaptive.opacity(0.35))
          .frame(width: 160, height: 20)
          .modifier(ShimmerEffect())
        VStack(alignment: .leading, spacing: 6) {
          ForEach(0..<3, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(maxWidth: .infinity)
              .frame(height: 12)
              .modifier(ShimmerEffect())
          }
        }
        HStack(spacing: 8) {
          ForEach(0..<3, id: \.self) { _ in
            Capsule()
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(width: 72, height: 24)
              .modifier(ShimmerEffect())
          }
        }
      }
    }
  }

  private func ratingInsightsSkeleton() -> some View {
    proCardShell {
      VStack(alignment: .leading, spacing: 20) {
        HStack(alignment: .center, spacing: 16) {
          RoundedRectangle(cornerRadius: 12)
            .fill(Color.appBorderAdaptive.opacity(0.3))
            .frame(width: 72, height: 44)
            .modifier(ShimmerEffect())
          VStack(alignment: .leading, spacing: 4) {
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(width: 60, height: 14)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.2))
              .frame(width: 50, height: 11)
              .modifier(ShimmerEffect())
          }
          Spacer(minLength: 0)
          VStack(alignment: .trailing, spacing: 4) {
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.2))
              .frame(width: 56, height: 11)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(width: 36, height: 14)
              .modifier(ShimmerEffect())
          }
        }
        VStack(spacing: 8) {
          ForEach(0..<5, id: \.self) { _ in
            HStack(spacing: 10) {
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.2))
                .frame(width: 20, height: 10)
                .modifier(ShimmerEffect())
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.15))
                .frame(height: 8)
                .modifier(ShimmerEffect())
              RoundedRectangle(cornerRadius: 3)
                .fill(Color.appBorderAdaptive.opacity(0.2))
                .frame(width: 24, height: 10)
                .modifier(ShimmerEffect())
            }
          }
        }
      }
    }
  }

  private func countriesSkeleton() -> some View {
    proCardShell(trailing: true) {
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

  private func recommendationsSkeleton() -> some View {
    proCardShell(trailing: true) {
      let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10),
      ]
      LazyVGrid(columns: columns, spacing: 14) {
        ForEach(0..<3, id: \.self) { _ in
          VStack(alignment: .leading, spacing: 8) {
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.appBorderAdaptive.opacity(0.3))
              .aspectRatio(2 / 3, contentMode: .fit)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.25))
              .frame(height: 10)
              .modifier(ShimmerEffect())
            RoundedRectangle(cornerRadius: 3)
              .fill(Color.appBorderAdaptive.opacity(0.2))
              .frame(height: 10)
              .modifier(ShimmerEffect())
          }
        }
      }
    }
  }

  private func proCardShell<Content: View>(
    trailing: Bool = false,
    @ViewBuilder content: () -> Content
  ) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        skeletonCardTitle()
        Spacer()
        if trailing {
          Circle()
            .fill(Color.appBorderAdaptive.opacity(0.3))
            .frame(width: 20, height: 20)
            .modifier(ShimmerEffect())
        }
      }
      .padding(.bottom, 16)

      content()
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }

  // MARK: - Reusable Card Shell

  private func proCard<Content: View>(
    title: String,
    icon: String? = nil,
    @ViewBuilder content: () -> Content
  ) -> some View {
    proCard(title: title, icon: icon, trailing: { EmptyView() }, content: content)
  }

  private func proCard<Content: View, Trailing: View>(
    title: String,
    icon: String? = nil,
    @ViewBuilder trailing: () -> Trailing,
    @ViewBuilder content: () -> Content
  ) -> some View {
    VStack(alignment: .leading, spacing: 0) {
      HStack {
        HStack(spacing: 4) {
          if let icon {
            Image(systemName: icon)
              .font(.system(size: 11, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          Text(title)
            .font(.system(size: 13, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        Spacer()
        trailing()
      }
      .padding(.bottom, 16)

      content()
    }
    .padding(16)
    .frame(maxWidth: .infinity, alignment: .leading)
    .background(Color.statsCardBackground)
    .clipShape(RoundedRectangle(cornerRadius: 22))
  }
}
