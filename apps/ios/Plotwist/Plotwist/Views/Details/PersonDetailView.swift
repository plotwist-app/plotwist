//
//  PersonDetailView.swift
//  Plotwist
//

import SwiftUI

struct PersonDetailView: View {
  let personId: Int

  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var person: PersonDetails?
  @State private var credits: PersonCombinedCredits?
  @State private var isLoading = true
  @State private var showFullBio = false
  @State private var strings = L10n.current

  private let cornerRadius: CGFloat = 24
  private let posterOverlapOffset: CGFloat = -70

  private var sortedCredits: [PersonCreditItem] {
    let castItems = credits?.cast ?? []
    let crewItems = credits?.crew ?? []
    let all = castItems + crewItems
    var seen = Set<Int>()
    return all
      .sorted { ($0.voteCount ?? 0) > ($1.voteCount ?? 0) }
      .filter { seen.insert($0.id).inserted }
  }

  private var backdropURL: URL? {
    sortedCredits.first(where: { $0.backdropURL != nil })?.backdropURL
  }

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      if isLoading && person == nil {
        PersonDetailSkeleton(cornerRadius: cornerRadius)
      } else if let person {
        GeometryReader { geometry in
          let backdropHeight = geometry.size.height * 0.35

          ZStack(alignment: .topLeading) {
            ScrollView(showsIndicators: false) {
              VStack(alignment: .leading, spacing: 0) {
                // Backdrop
                if let url = backdropURL {
                  CachedAsyncImage(url: url) { image in
                    image
                      .resizable()
                      .aspectRatio(contentMode: .fill)
                  } placeholder: {
                    Rectangle()
                      .fill(Color.appBorderAdaptive)
                  }
                  .frame(width: geometry.size.width, height: backdropHeight + cornerRadius)
                  .clipped()
                } else {
                  Rectangle()
                    .fill(Color.appBorderAdaptive)
                    .frame(height: backdropHeight + cornerRadius)
                }

                // Content card
                ZStack(alignment: .topLeading) {
                  Color.appBackgroundAdaptive
                    .clipShape(
                      RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
                    )

                  VStack(alignment: .leading, spacing: 0) {
                    headerSection(person)

                    if let bio = person.biography, !bio.isEmpty {
                      biographySection(bio)
                        .padding(.top, 24)
                    }

                    if !sortedCredits.isEmpty {
                      sectionDivider
                      filmographySection
                    }

                    Spacer().frame(height: 80)
                  }
                }
                .offset(y: -cornerRadius)
              }
            }
            .ignoresSafeArea(edges: .top)

            backButton
          }
        }
      }
    }
    .navigationBarHidden(true)
    .preferredColorScheme(themeManager.current.colorScheme)
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .task {
      await loadData()
    }
  }

  // MARK: - Back Button

  private var backButton: some View {
    VStack {
      HStack {
        Button {
          dismiss()
        } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.white)
            .frame(width: 40, height: 40)
            .background(.ultraThinMaterial)
            .clipShape(Circle())
        }

        Spacer()
      }
      .padding(.horizontal, 24)
      Spacer()
    }
    .padding(.top, 16)
  }

  // MARK: - Header

  @ViewBuilder
  private func headerSection(_ person: PersonDetails) -> some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .bottom, spacing: 16) {
        CachedAsyncImage(url: person.profileURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
            .fill(Color.appBorderAdaptive)
            .overlay {
              Image(systemName: "person.fill")
                .font(.title)
                .foregroundColor(.appMutedForegroundAdaptive)
            }
        }
        .frame(width: 120, height: 180)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
        .posterBorder()
        .posterShadow()
        .offset(y: posterOverlapOffset)
        .padding(.bottom, posterOverlapOffset)

        Text(person.name)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()
      }

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 8) {
          if let birthday = person.formattedBirthday {
            let text = person.age != nil ? "\(birthday) (\(person.age!))" : birthday
            BadgeView(text: text)
          }

          if let place = person.placeOfBirth, !place.isEmpty {
            BadgeView(text: place)
          }
        }
      }
      .scrollClipDisabled()
    }
    .padding(.horizontal, 24)
    .padding(.top, 20)
  }

  // MARK: - Biography

  @ViewBuilder
  private func biographySection(_ bio: String) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(bio)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .lineSpacing(6)
        .lineLimit(showFullBio ? nil : 4)

      if bio.count > 200 {
        Button {
          withAnimation(.easeInOut(duration: 0.25)) {
            showFullBio.toggle()
          }
        } label: {
          Text(showFullBio ? strings.showLess : strings.showMore)
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appForegroundAdaptive)
        }
      }
    }
    .padding(.horizontal, 24)
  }

  // MARK: - Section Divider

  private var sectionDivider: some View {
    Rectangle()
      .fill(Color.appBorderAdaptive.opacity(0.5))
      .frame(height: 1)
      .padding(.horizontal, 24)
      .padding(.vertical, 24)
  }

  // MARK: - Filmography

  @ViewBuilder
  private var filmographySection: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(strings.filmography)
        .font(.headline)
        .foregroundColor(.appForegroundAdaptive)
        .padding(.horizontal, 24)

      if let credits = credits {
        let allItems = (credits.cast ?? []) + (credits.crew ?? [])
        let movieCount = Set(allItems.filter { $0.mediaType == "movie" }.map(\.id)).count
        let tvCount = Set(allItems.filter { $0.mediaType == "tv" }.map(\.id)).count

        if movieCount > 0 || tvCount > 0 {
          ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
              if movieCount > 0 {
                BadgeView(text: "\(movieCount) \(strings.movies)")
              }
              if tvCount > 0 {
                BadgeView(text: "\(tvCount) \(strings.tvSeries)")
              }
            }
            .padding(.horizontal, 24)
          }
          .scrollClipDisabled()
        }
      }

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(alignment: .top, spacing: 12) {
          ForEach(sortedCredits) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: item.mediaType ?? "movie"
              )
            } label: {
              FilmographyCard(item: item)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 4)
      }
      .scrollClipDisabled()
    }
  }

  // MARK: - Data Loading

  private func loadData() async {
    isLoading = true
    defer { withAnimation(.easeOut(duration: 0.3)) { isLoading = false } }

    await withTaskGroup(of: Void.self) { group in
      group.addTask {
        do {
          let result = try await TMDBService.shared.getPersonDetails(
            id: personId,
            language: Language.current.rawValue
          )
          await MainActor.run { person = result }
        } catch {}
      }
      group.addTask {
        do {
          let result = try await TMDBService.shared.getPersonCombinedCredits(
            id: personId,
            language: Language.current.rawValue
          )
          await MainActor.run { credits = result }
        } catch {}
      }
    }
  }
}

// MARK: - Filmography Card

private struct FilmographyCard: View {
  let item: PersonCreditItem

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      CachedAsyncImage(url: item.posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
          .fill(Color.appBorderAdaptive)
      }
      .frame(width: 120, height: 180)
      .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
      .posterBorder()
      .posterShadow()

      VStack(alignment: .leading, spacing: 2) {
        Text(item.displayTitle)
          .font(.caption.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(2)

        if let character = item.character, !character.isEmpty {
          Text(character)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(1)
        } else if let job = item.job, !job.isEmpty {
          Text(job)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
            .lineLimit(1)
        } else if let year = item.year {
          Text(year)
            .font(.caption)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
    }
    .frame(width: 120)
  }
}

// MARK: - Person Detail Skeleton

private struct PersonDetailSkeleton: View {
  let cornerRadius: CGFloat

  var body: some View {
    GeometryReader { geometry in
      let backdropHeight = geometry.size.height * 0.35

      VStack(alignment: .leading, spacing: 0) {
        Rectangle()
          .fill(Color.appBorderAdaptive.opacity(0.5))
          .frame(height: backdropHeight + cornerRadius)

        ZStack(alignment: .topLeading) {
          Color.appBackgroundAdaptive
            .clipShape(
              RoundedCorner(radius: cornerRadius, corners: [.topLeft, .topRight])
            )

          VStack(alignment: .leading, spacing: 0) {
            VStack(alignment: .leading, spacing: 12) {
              HStack(alignment: .bottom, spacing: 16) {
                RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 120, height: 180)
                  .offset(y: -70)
                  .padding(.bottom, -70)

                RoundedRectangle(cornerRadius: 4)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 150, height: 20)

                Spacer()
              }

              HStack(spacing: 8) {
                RoundedRectangle(cornerRadius: 8)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 130, height: 28)

                RoundedRectangle(cornerRadius: 8)
                  .fill(Color.appBorderAdaptive)
                  .frame(width: 100, height: 28)
              }
            }
            .padding(.horizontal, 24)
            .padding(.top, 20)

            VStack(alignment: .leading, spacing: 6) {
              ForEach(0..<3, id: \.self) { _ in
                RoundedRectangle(cornerRadius: 4)
                  .fill(Color.appBorderAdaptive)
                  .frame(height: 14)
              }
              RoundedRectangle(cornerRadius: 4)
                .fill(Color.appBorderAdaptive)
                .frame(width: 200, height: 14)
            }
            .padding(.horizontal, 24)
            .padding(.top, 24)

            Rectangle()
              .fill(Color.appBorderAdaptive.opacity(0.5))
              .frame(height: 1)
              .padding(.horizontal, 24)
              .padding(.vertical, 24)

            VStack(alignment: .leading, spacing: 12) {
              RoundedRectangle(cornerRadius: 4)
                .fill(Color.appBorderAdaptive)
                .frame(width: 120, height: 20)
                .padding(.horizontal, 24)

              ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                  ForEach(0..<4, id: \.self) { _ in
                    RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
                      .fill(Color.appBorderAdaptive)
                      .frame(width: 120, height: 180)
                  }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 4)
              }
              .scrollClipDisabled()
            }
          }
        }
        .offset(y: -cornerRadius)

        Spacer()
      }
    }
  }
}
