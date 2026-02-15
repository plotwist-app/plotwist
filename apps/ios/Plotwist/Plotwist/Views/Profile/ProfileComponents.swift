//
//  ProfileComponents.swift
//  Plotwist
//

import SwiftUI

// MARK: - Profile Avatar
struct ProfileAvatar: View {
  let avatarURL: URL?
  let username: String
  let size: CGFloat

  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    ZStack {
      if let avatarURL {
        CachedAsyncImage(url: avatarURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          avatarPlaceholder
        }
      } else {
        avatarPlaceholder
      }
    }
    .frame(width: size, height: size)
    .clipShape(Circle())
    .overlay(
      Circle()
        .stroke(
          colorScheme == .dark ? Color.appBorderAdaptive : Color.clear,
          lineWidth: 1
        )
    )
  }

  private var avatarPlaceholder: some View {
    Circle()
      .fill(Color.appInputFilled)
      .overlay(
        Text(String(username.prefix(1)).uppercased())
          .font(.system(size: size * 0.4, weight: .bold))
          .foregroundColor(.appForegroundAdaptive)
      )
  }
}

// MARK: - Pro Badge
struct ProBadge: View {
  @Environment(\.colorScheme) private var colorScheme

  var body: some View {
    Text("PRO")
      .font(.system(size: 10, weight: .semibold))
      .foregroundColor(colorScheme == .dark ? .white : .appForegroundAdaptive)
      .padding(.horizontal, 8)
      .padding(.vertical, 3)
      .background(
        colorScheme == .dark
          ? Color(hex: "0a0a0f")
          : Color(hex: "f5f5f5")
      )
      .clipShape(RoundedRectangle(cornerRadius: 6))
      .overlay(
        RoundedRectangle(cornerRadius: 6)
          .stroke(Color.appBorderAdaptive, lineWidth: 1)
      )
  }
}

// MARK: - Collection Count Badge
struct CollectionCountBadge: View {
  let count: Int
  @Environment(\.colorScheme) var colorScheme

  var body: some View {
    Text("\(count)")
      .font(.system(size: 10, weight: .semibold))
      .foregroundColor(colorScheme == .dark ? .white : .appForegroundAdaptive)
      .padding(.horizontal, 8)
      .padding(.vertical, 3)
      .background(
        colorScheme == .dark
          ? Color(hex: "0a0a0f")
          : Color(hex: "f5f5f5")
      )
      .clipShape(Capsule())
      .overlay(
        Capsule()
          .stroke(Color.appBorderAdaptive, lineWidth: 1)
      )
  }
}

// MARK: - Profile Item Card
struct ProfileItemCard: View {
  let tmdbId: Int
  let mediaType: String
  @State private var posterURL: URL?
  @State private var isLoading = true

  var body: some View {
    CachedAsyncImage(url: posterURL) { image in
      image
        .resizable()
        .aspectRatio(contentMode: .fill)
    } placeholder: {
      RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
        .fill(Color.appBorderAdaptive)
    }
    .aspectRatio(2 / 3, contentMode: .fit)
    .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
    .posterBorder()
    .shadow(color: Color.black.opacity(0.1), radius: 2, x: 0, y: 1)
    .task {
      await loadPoster()
    }
  }

  private func loadPoster() async {
    do {
      let type = mediaType == "MOVIE" ? "movie" : "tv"
      if type == "movie" {
        let details = try await TMDBService.shared.getMovieDetails(
          id: tmdbId,
          language: Language.current.rawValue
        )
        posterURL = details.posterURL
      } else {
        let details = try await TMDBService.shared.getTVSeriesDetails(
          id: tmdbId,
          language: Language.current.rawValue
        )
        posterURL = details.posterURL
      }
    } catch {
      print("Error loading poster: \(error)")
    }
    isLoading = false
  }
}

// MARK: - Profile Item Preview (Context Menu)
struct ProfileItemPreview: View {
  let tmdbId: Int
  let mediaType: String
  @State private var posterURL: URL?
  @State private var title: String = ""

  var body: some View {
    VStack(spacing: 0) {
      CachedAsyncImage(url: posterURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      } placeholder: {
        Rectangle()
          .fill(Color.appBorderAdaptive)
      }
      .aspectRatio(2 / 3, contentMode: .fit)
      .frame(width: 220)
      .clipped()

      if !title.isEmpty {
        Text(title)
          .font(.footnote.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(2)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 12)
          .padding(.vertical, 10)
          .frame(width: 220)
          .background(Color.appBackgroundAdaptive)
      }
    }
    .clipShape(RoundedRectangle(cornerRadius: 12))
    .task {
      await loadDetails()
    }
  }

  private func loadDetails() async {
    do {
      let type = mediaType == "MOVIE" ? "movie" : "tv"
      if type == "movie" {
        let details = try await TMDBService.shared.getMovieDetails(
          id: tmdbId,
          language: Language.current.rawValue
        )
        posterURL = details.posterURL
        title = details.title ?? details.name ?? ""
      } else {
        let details = try await TMDBService.shared.getTVSeriesDetails(
          id: tmdbId,
          language: Language.current.rawValue
        )
        posterURL = details.posterURL
        title = details.name ?? details.title ?? ""
      }
    } catch {
      print("Error loading preview: \(error)")
    }
  }
}

// MARK: - Profile Badge
struct ProfileBadge: View {
  let text: String
  var prefix: String? = nil
  var icon: String? = nil
  var logoURL: URL? = nil

  var body: some View {
    HStack(spacing: 6) {
      if let prefix {
        Text(prefix)
          .font(.caption)
      }

      if let icon {
        Image(systemName: icon)
          .font(.system(size: 12))
          .foregroundColor(.appForegroundAdaptive)
      }

      if let logoURL {
        CachedAsyncImage(url: logoURL) { image in
          image
            .resizable()
            .aspectRatio(contentMode: .fill)
        } placeholder: {
          Rectangle()
            .fill(Color.appInputFilled)
        }
        .frame(width: 18, height: 18)
        .cornerRadius(4)
      }

      Text(text)
        .font(.caption)
        .foregroundColor(.appForegroundAdaptive)
        .lineLimit(1)
        .truncationMode(.tail)
    }
    .padding(.horizontal, 10)
    .padding(.vertical, 6)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }
}

// MARK: - Edit Profile Row
struct EditProfileRow: View {
  let label: String
  let value: String
  let labelWidth: CGFloat
  var prefix: String? = nil

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: labelWidth, alignment: .topLeading)
        .multilineTextAlignment(.leading)

      HStack(spacing: 8) {
        if let prefix {
          Text(prefix)
            .font(.title3)
        }
        Text(value)
          .font(.subheadline)
          .foregroundColor(.appForegroundAdaptive)
          .multilineTextAlignment(.leading)
      }
      .frame(maxWidth: .infinity, alignment: .leading)

      Image(systemName: "chevron.right")
        .font(.system(size: 14, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 16)
    .contentShape(Rectangle())
  }
}

// MARK: - Edit Profile Badge Row
struct EditProfileBadgeRow<Content: View>: View {
  let label: String
  @ViewBuilder let content: Content

  var body: some View {
    HStack(alignment: .top, spacing: 16) {
      Text(label)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
        .frame(width: 100, alignment: .topLeading)
        .multilineTextAlignment(.leading)

      content
        .frame(maxWidth: .infinity, alignment: .leading)

      Image(systemName: "chevron.right")
        .font(.system(size: 14, weight: .medium))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 16)
    .contentShape(Rectangle())
  }
}

// MARK: - Flow Layout
struct FlowLayout: Layout {
  var spacing: CGFloat = 8
  var alignment: HorizontalAlignment = .leading

  func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
    let result = FlowResult(in: proposal.width ?? 0, subviews: subviews, spacing: spacing, alignment: alignment)
    return result.size
  }

  func placeSubviews(
    in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
  ) {
    let result = FlowResult(in: bounds.width, subviews: subviews, spacing: spacing, alignment: alignment)
    for (index, subview) in subviews.enumerated() {
      subview.place(
        at: CGPoint(
          x: bounds.minX + result.positions[index].x,
          y: bounds.minY + result.positions[index].y),
        proposal: .unspecified)
    }
  }

  struct FlowResult {
    var size: CGSize = .zero
    var positions: [CGPoint] = []

    init(in maxWidth: CGFloat, subviews: Subviews, spacing: CGFloat, alignment: HorizontalAlignment = .leading) {
      var x: CGFloat = 0
      var y: CGFloat = 0
      var rowHeight: CGFloat = 0
      var rowStartIndex = 0
      var rowWidth: CGFloat = 0
      
      // First pass: calculate positions without alignment offset
      var tempPositions: [CGPoint] = []
      var rowInfos: [(startIndex: Int, endIndex: Int, width: CGFloat, y: CGFloat)] = []
      
      for (index, subview) in subviews.enumerated() {
        let size = subview.sizeThatFits(.unspecified)

        if x + size.width > maxWidth && x > 0 {
          // Save row info
          rowInfos.append((rowStartIndex, index - 1, rowWidth - spacing, y))
          rowStartIndex = index
          x = 0
          y += rowHeight + spacing
          rowHeight = 0
          rowWidth = 0
        }

        tempPositions.append(CGPoint(x: x, y: y))
        rowHeight = max(rowHeight, size.height)
        x += size.width + spacing
        rowWidth = x
        self.size.width = max(self.size.width, x - spacing)
      }
      
      // Don't forget the last row
      if !subviews.isEmpty {
        rowInfos.append((rowStartIndex, subviews.count - 1, rowWidth - spacing, y))
      }
      
      self.size.height = y + rowHeight
      
      // Second pass: apply alignment offset
      if alignment == .center {
        for rowInfo in rowInfos {
          let offset = (maxWidth - rowInfo.width) / 2
          for i in rowInfo.startIndex...rowInfo.endIndex {
            tempPositions[i].x += offset
          }
        }
      }
      
      positions = tempPositions
    }
  }
}
