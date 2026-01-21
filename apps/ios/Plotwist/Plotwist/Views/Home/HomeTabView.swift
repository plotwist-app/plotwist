//
//  HomeTabView.swift
//  Plotwist
//

import SwiftUI

struct HomeTabView: View {
  var body: some View {
    NavigationView {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()

        VStack(spacing: 24) {
          Spacer()

          Image("logo-white")
            .resizable()
            .scaledToFit()
            .frame(width: 120, height: 120)
            .opacity(0.3)

          Spacer()
        }
      }
      .navigationBarHidden(true)
    }
  }
}

// MARK: - Home Category Type
enum HomeCategoryType {
  case movies
  case tvSeries
  case animes
  case doramas
}

// MARK: - Home Section View
struct HomeSectionView: View {
  let title: String
  let items: [SearchResult]
  let mediaType: String
  let categoryType: HomeCategoryType
  var initialMovieSubcategory: MovieSubcategory?
  var initialTVSeriesSubcategory: TVSeriesSubcategory?

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      NavigationLink {
        CategoryListView(
          categoryType: categoryType,
          initialMovieSubcategory: initialMovieSubcategory,
          initialTVSeriesSubcategory: initialTVSeriesSubcategory
        )
      } label: {
        HStack(spacing: 6) {
          Text(title)
            .font(.headline)
            .foregroundColor(.appForegroundAdaptive)

          Image(systemName: "chevron.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)

          Spacer()
        }
        .padding(.horizontal, 24)
      }

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(items.prefix(10)) { item in
            NavigationLink {
              MediaDetailView(
                mediaId: item.id,
                mediaType: mediaType
              )
            } label: {
              HomePosterCard(item: item)
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
}

// MARK: - Home Poster Card
struct HomePosterCard: View {
  let item: SearchResult

  var body: some View {
    AsyncImage(url: item.imageURL) { phase in
      switch phase {
      case .empty:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      case .success(let image):
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
      case .failure:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
          .overlay(
            Image(systemName: "film")
              .foregroundColor(.appMutedForegroundAdaptive)
          )
      @unknown default:
        RoundedRectangle(cornerRadius: 16)
          .fill(Color.appBorderAdaptive)
      }
    }
    .frame(width: 120, height: 180)
    .clipShape(RoundedRectangle(cornerRadius: 16))
    .posterShadow()
  }
}

// MARK: - Home Section Skeleton
struct HomeSectionSkeleton: View {
  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      RoundedRectangle(cornerRadius: 4)
        .fill(Color.appSkeletonAdaptive)
        .frame(width: 140, height: 20)
        .padding(.horizontal, 24)

      ScrollView(.horizontal, showsIndicators: false) {
        HStack(spacing: 12) {
          ForEach(0..<5, id: \.self) { _ in
            RoundedRectangle(cornerRadius: 16)
              .fill(Color.appSkeletonAdaptive)
              .frame(width: 120, height: 180)
          }
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 16)
      }
      .scrollClipDisabled()
    }
  }
}
