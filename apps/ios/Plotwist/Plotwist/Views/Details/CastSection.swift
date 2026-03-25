//
//  CastSection.swift
//  Plotwist
//

import SwiftUI

struct CastSection: View {
  let mediaId: Int
  let mediaType: String
  var onContentLoaded: ((Bool) -> Void)?

  @State private var cast: [CastMember] = []
  @State private var keyCrew: [KeyCrewMember] = []
  @State private var isLoading = true
  @State private var hasLoaded = false
  @State private var isExpanded = false

  private static let highlightedJobs: Set<String> = [
    "Director", "Writer", "Screenplay", "Story",
    "Novel", "Director of Photography",
    "Original Music Composer", "Music", "Editor"
  ]

  private var hasContent: Bool {
    !cast.isEmpty || !keyCrew.isEmpty
  }

  private var subcategoryCount: Int {
    var count = 0
    if !cast.isEmpty { count += 1 }
    if !keyCrew.isEmpty { count += 1 }
    return count
  }

  private var effectiveExpanded: Bool {
    subcategoryCount <= 1 || isExpanded
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      if isLoading {
        CastSectionSkeleton()
      } else if hasContent {
        // Title with chevron toggle
        if subcategoryCount <= 1 {
          Text(L10n.current.tabCredits)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)
            .padding(.horizontal, 24)
        } else {
          Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
              isExpanded.toggle()
            }
          } label: {
            HStack(spacing: 8) {
              Text(L10n.current.tabCredits)
                .font(.headline)
                .foregroundColor(.appForegroundAdaptive)

              Image(systemName: "chevron.down")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(.appMutedForegroundAdaptive)
                .rotationEffect(.degrees(isExpanded ? 180 : 0))

              Spacer()
            }
            .padding(.horizontal, 24)
          }
          .buttonStyle(.plain)
        }

        VStack(alignment: .leading, spacing: 20) {
          if !cast.isEmpty {
            CreditsCategoryAnimated(
              title: L10n.current.actors,
              items: cast.prefix(15).map { CreditsPerson(id: $0.id, name: $0.name, detail: $0.character, profileURL: $0.profileURL) },
              isExpanded: effectiveExpanded
            )
          }

          if !keyCrew.isEmpty {
            CreditsCategoryAnimated(
              title: L10n.current.technicalCrew,
              items: keyCrew.map { CreditsPerson(id: $0.id, name: $0.name, detail: $0.role, profileURL: $0.profileURL) },
              isExpanded: effectiveExpanded
            )
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
      }
    }
    .task {
      await loadCredits()
    }
  }

  // MARK: - Data Loading

  private func loadCredits() async {
    guard !hasLoaded else {
      isLoading = false
      onContentLoaded?(hasContent)
      return
    }

    isLoading = true

    do {
      let credits = try await TMDBService.shared.getCredits(
        id: mediaId,
        mediaType: mediaType,
        language: Language.current.rawValue
      )
      cast = credits.cast.sorted { ($0.order ?? 999) < ($1.order ?? 999) }
      keyCrew = Self.extractKeyCrew(credits.crew ?? [])
      isLoading = false
      hasLoaded = true
      onContentLoaded?(hasContent)
    } catch {
      cast = []
      keyCrew = []
      isLoading = false
      hasLoaded = true
      onContentLoaded?(false)
    }
  }

  // MARK: - Crew Extraction

  private static let jobPriority: [String: Int] = [
    "Director": 0,
    "Writer": 1, "Screenplay": 1, "Story": 1, "Novel": 1,
    "Director of Photography": 2,
    "Original Music Composer": 3, "Music": 3,
    "Editor": 4,
  ]

  private static func localizedJob(_ job: String) -> String {
    let strings = L10n.current
    switch job {
    case "Director": return strings.crewDirection
    case "Writer", "Screenplay", "Story", "Novel": return strings.crewWriting
    case "Director of Photography": return strings.crewPhotography
    case "Original Music Composer", "Music": return strings.crewMusic
    case "Editor": return strings.crewEditing
    default: return job
    }
  }

  private static func extractKeyCrew(_ crew: [CrewMember]) -> [KeyCrewMember] {
    var seen = Set<Int>()
    return crew
      .filter { member in
        guard let job = member.job, highlightedJobs.contains(job) else { return false }
        return seen.insert(member.id).inserted
      }
      .sorted { a, b in
        let pa = jobPriority[a.job ?? ""] ?? 99
        let pb = jobPriority[b.job ?? ""] ?? 99
        return pa < pb
      }
      .map { member in
        KeyCrewMember(
          id: member.id,
          name: member.name,
          role: localizedJob(member.job ?? ""),
          profileURL: member.profileURL
        )
      }
  }
}

// MARK: - Models

struct KeyCrewMember: Identifiable {
  let id: Int
  let name: String
  let role: String
  let profileURL: URL?
}

struct CreditsPerson: Identifiable {
  let id: Int
  let name: String
  let detail: String?
  let profileURL: URL?
}

// MARK: - Credits Category (animated collapse/expand)

private struct CreditsCategoryAnimated: View {
  let title: String
  let items: [CreditsPerson]
  let isExpanded: Bool

  private let iconSize: CGFloat = 44
  private let collapsedSpacing: CGFloat = -18
  private let expandedSpacing: CGFloat = 6
  private let cornerRadius: CGFloat = 11

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(title.uppercased())
        .font(.caption.weight(.semibold))
        .foregroundColor(.appMutedForegroundAdaptive)

      CreditsIconsLayout(
        items: items,
        isExpanded: isExpanded,
        iconSize: iconSize,
        collapsedSpacing: collapsedSpacing,
        expandedSpacing: expandedSpacing,
        cornerRadius: cornerRadius
      )
    }
  }
}

// MARK: - Credits Icons Layout (morphs between collapsed/expanded)

private struct CreditsIconsLayout: View {
  let items: [CreditsPerson]
  let isExpanded: Bool
  let iconSize: CGFloat
  let collapsedSpacing: CGFloat
  let expandedSpacing: CGFloat
  let cornerRadius: CGFloat

  private let collapsedLimit = 6

  private var displayItems: [CreditsPerson] {
    isExpanded ? items : Array(items.prefix(collapsedLimit))
  }

  var body: some View {
    let layout = isExpanded
      ? AnyLayout(VStackLayout(alignment: .leading, spacing: expandedSpacing))
      : AnyLayout(HStackLayout(spacing: collapsedSpacing))

    layout {
      ForEach(Array(displayItems.enumerated()), id: \.element.id) { index, person in
        HStack(spacing: 12) {
          PersonIconView(profileURL: person.profileURL, size: iconSize, cornerRadius: cornerRadius)
            .zIndex(Double(items.count - index))

          if isExpanded {
            NavigationLink {
              PersonDetailView(personId: person.id)
            } label: {
              HStack {
                Text(person.name)
                  .font(.subheadline.weight(.medium))
                  .foregroundColor(.appForegroundAdaptive)
                  .lineLimit(1)

                Spacer()

                if let detail = person.detail, !detail.isEmpty {
                  Text(detail)
                    .font(.subheadline)
                    .foregroundColor(.appMutedForegroundAdaptive)
                    .lineLimit(1)
                }
              }
            }
            .buttonStyle(.plain)
          }
        }
      }
    }
  }
}

// MARK: - Person Icon View

private struct PersonIconView: View {
  let profileURL: URL?
  let size: CGFloat
  let cornerRadius: CGFloat

  var body: some View {
    CachedAsyncImage(url: profileURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: cornerRadius)
        .fill(Color.appBorderAdaptive)
        .overlay {
          Image(systemName: "person.fill")
            .font(.caption2)
            .foregroundColor(.appMutedForegroundAdaptive)
        }
    }
    .frame(width: size, height: size)
    .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
    .overlay(
      RoundedRectangle(cornerRadius: cornerRadius)
        .stroke(Color.appBorderAdaptive, lineWidth: 1.5)
    )
  }
}

// MARK: - Cast Section Skeleton

private struct CastSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appBorderAdaptive)
        .frame(width: 100, height: 20)

      VStack(alignment: .leading, spacing: 8) {
        RoundedRectangle(cornerRadius: 3)
          .fill(Color.appBorderAdaptive)
          .frame(width: 60, height: 12)

        HStack(spacing: -18) {
          ForEach(0..<6, id: \.self) { index in
            RoundedRectangle(cornerRadius: 11)
              .fill(Color.appBorderAdaptive)
              .frame(width: 44, height: 44)
              .overlay(
                RoundedRectangle(cornerRadius: 11)
                  .stroke(Color.appBackgroundAdaptive, lineWidth: 2)
              )
              .zIndex(Double(6 - index))
          }
        }
      }
    }
    .padding(.horizontal, 24)
  }
}
