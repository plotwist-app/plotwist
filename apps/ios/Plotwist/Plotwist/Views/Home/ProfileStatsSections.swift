//
//  ProfileStatsSections.swift
//  Plotwist
//

import SwiftUI

// MARK: - Time Watched Section
extension ProfileStatsView {
  var heroStatsSection: some View {
    TimelineView(.animation(minimumInterval: 1.0 / 60.0)) { timeline in
      let currentHours = interpolatedHours(at: timeline.date)
      
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 4) {
          HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(formatHours(currentHours))
              .font(.system(size: 44, weight: .bold, design: .rounded))
              .foregroundColor(.appForegroundAdaptive)
              .contentTransition(.numericText(countsDown: false))
              .animation(.snappy(duration: 0.2), value: formatHours(currentHours))
            
            Text(strings.hours.lowercased())
              .font(.system(size: 16, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          
          let daysText = "\(formatDays(currentHours)) \(strings.daysOfContent)"
          Text(daysText)
            .font(.system(size: 14))
            .foregroundColor(.appMutedForegroundAdaptive)
            .contentTransition(.numericText(countsDown: false))
            .animation(.snappy(duration: 0.2), value: daysText)
        }
        
        if !monthlyHours.isEmpty {
          monthlyBarChart
        }
        
        if movieHours > 0 || seriesHours > 0 {
          Divider()
          
          HStack(spacing: 24) {
            HStack(spacing: 8) {
              RoundedRectangle(cornerRadius: 2)
                .fill(Color(hex: "3B82F6"))
                .frame(width: 12, height: 12)
              VStack(alignment: .leading, spacing: 1) {
                Text(strings.movies)
                  .font(.system(size: 12, weight: .medium))
                  .foregroundColor(.appForegroundAdaptive)
                Text(formatHoursMinutes(movieHours))
                  .font(.system(size: 12))
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
            }
            
            HStack(spacing: 8) {
              RoundedRectangle(cornerRadius: 2)
                .fill(Color(hex: "10B981"))
                .frame(width: 12, height: 12)
              VStack(alignment: .leading, spacing: 1) {
                Text(strings.series)
                  .font(.system(size: 12, weight: .medium))
                  .foregroundColor(.appForegroundAdaptive)
                Text(formatHoursMinutes(seriesHours))
                  .font(.system(size: 12))
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
            }
          }
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      .padding(.vertical, 4)
    }
  }
  
  var monthlyBarChart: some View {
    let maxHours = max(monthlyHours.map(\.hours).max() ?? 1, 1)
    let avgHours = {
      let nonZero = monthlyHours.filter { $0.hours > 0 }
      guard !nonZero.isEmpty else { return 0.0 }
      return nonZero.map(\.hours).reduce(0, +) / Double(nonZero.count)
    }()
    let chartHeight: CGFloat = 120
    let gridSteps = computeGridSteps(maxValue: maxHours)
    let ceilMax = gridSteps.last ?? maxHours
    
    return VStack(spacing: 0) {
      HStack(alignment: .bottom, spacing: 0) {
        HStack(alignment: .bottom, spacing: 6) {
          ForEach(monthlyHours) { entry in
            let barHeight = entry.hours > 0 ? CGFloat(entry.hours / ceilMax) * chartHeight : 0
            
            RoundedRectangle(cornerRadius: 3)
              .fill(
                entry.hours > 0
                  ? LinearGradient(
                      colors: [Color(hex: "3B82F6"), Color(hex: "10B981")],
                      startPoint: .bottom,
                      endPoint: .top
                    )
                  : LinearGradient(
                      colors: [Color.appBorderAdaptive.opacity(0.2)],
                      startPoint: .bottom,
                      endPoint: .top
                    )
              )
              .frame(height: max(barHeight, 3))
              .frame(maxWidth: .infinity)
          }
        }
        .frame(height: chartHeight)
        .overlay(
          VStack(spacing: 0) {
            ForEach(Array(gridSteps.reversed().enumerated()), id: \.offset) { idx, step in
              if idx > 0 { Spacer() }
              Rectangle()
                .fill(Color.appBorderAdaptive.opacity(0.3))
                .frame(height: 0.5)
            }
            Spacer().frame(height: 0)
          }
          .frame(height: chartHeight)
        )
        .overlay(
          avgHours > 0 ?
            AnyView(
              GeometryReader { geo in
                let y = geo.size.height - CGFloat(avgHours / ceilMax) * geo.size.height
                Path { path in
                  path.move(to: CGPoint(x: 0, y: y))
                  path.addLine(to: CGPoint(x: geo.size.width, y: y))
                }
                .stroke(style: StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
                .foregroundColor(Color(hex: "F59E0B").opacity(0.7))
              }
            ) : AnyView(EmptyView())
        )
        
        VStack(alignment: .trailing) {
          ForEach(Array(gridSteps.reversed().enumerated()), id: \.offset) { idx, step in
            if idx > 0 { Spacer() }
            Text(formatAxisLabel(step))
              .font(.system(size: 9, weight: .medium, design: .rounded))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          Text("0")
            .font(.system(size: 9, weight: .medium, design: .rounded))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .frame(width: 28, height: chartHeight)
        .padding(.leading, 6)
      }
      
      HStack(spacing: 6) {
        ForEach(monthlyHours) { entry in
          Text(shortMonthLabel(entry.month))
            .font(.system(size: 10, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(maxWidth: .infinity)
        }
        Spacer().frame(width: 34)
      }
      .padding(.top, 6)
      
      if avgHours > 0 {
        HStack(spacing: 4) {
          Circle()
            .fill(Color(hex: "F59E0B").opacity(0.7))
            .frame(width: 6, height: 6)
          Text("avg \(formatAxisLabel(avgHours))h")
            .font(.system(size: 10, weight: .medium))
            .foregroundColor(Color(hex: "F59E0B"))
        }
        .frame(maxWidth: .infinity, alignment: .trailing)
        .padding(.top, 4)
      }
    }
  }
}

// MARK: - Genres Section
extension ProfileStatsView {
  var genresListSection: some View {
    let maxCount = watchedGenres.map(\.count).max() ?? 1
    let displayGenres = showAllGenres ? watchedGenres : Array(watchedGenres.prefix(5))
    
    return VStack(spacing: 0) {
      ForEach(Array(displayGenres.enumerated()), id: \.element.id) { index, genre in
        VStack(spacing: 0) {
          HStack(spacing: 0) {
            Text(genre.name)
              .font(.system(size: 13, weight: .medium))
              .foregroundColor(.appForegroundAdaptive)
              .lineLimit(1)
            
            Spacer(minLength: 12)
            
            Text(String(format: "%.0f%%", genre.percentage))
              .font(.system(size: 12, weight: .semibold, design: .rounded))
              .foregroundColor(.appMutedForegroundAdaptive)
              .frame(width: 36, alignment: .trailing)
          }
          .padding(.top, index == 0 ? 0 : 12)
          .padding(.bottom, 12)
          
          GeometryReader { geo in
            ZStack(alignment: .leading) {
              RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.appBorderAdaptive.opacity(0.4))
                .frame(height: 4)
              RoundedRectangle(cornerRadius: 2.5)
                .fill(Color.appForegroundAdaptive)
                .frame(width: geo.size.width * CGFloat(genre.count) / CGFloat(max(maxCount, 1)), height: 4)
            }
          }
          .frame(height: 4)
          
          if index < displayGenres.count - 1 {
            Divider()
              .padding(.top, 12)
          }
        }
      }
      
      if watchedGenres.count > 5 {
        Button {
          withAnimation(.easeInOut(duration: 0.3)) {
            showAllGenres.toggle()
          }
        } label: {
          HStack(spacing: 4) {
            Text(showAllGenres ? strings.showLess : strings.showMore)
              .font(.system(size: 13, weight: .medium))
            Image(systemName: showAllGenres ? "chevron.up" : "chevron.down")
              .font(.system(size: 10, weight: .semibold))
          }
          .foregroundColor(.appMutedForegroundAdaptive)
          .padding(.top, 14)
        }
        .frame(maxWidth: .infinity, alignment: .center)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .clipped()
  }
}

// MARK: - Collection Status Section
extension ProfileStatsView {
  var statusBarSection: some View {
    let totalCount = itemsStatus.reduce(0) { $0 + $1.count }
    
    return HStack(alignment: .center, spacing: 20) {
      ZStack {
        pieSlices
        
        VStack(spacing: 2) {
          Text("\(totalCount)")
            .font(.system(size: 22, weight: .bold, design: .rounded))
            .foregroundColor(.appForegroundAdaptive)
          Text("total")
            .font(.system(size: 10, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .frame(width: 120, height: 120)
      
      VStack(alignment: .leading, spacing: 10) {
        ForEach(itemsStatus) { item in
          let statusInfo = getStatusInfo(item.status)
          HStack(spacing: 8) {
            Circle()
              .fill(statusInfo.color)
              .frame(width: 8, height: 8)
            Text(statusInfo.name)
              .font(.system(size: 13))
              .foregroundColor(.appForegroundAdaptive)
            Spacer()
            Text("\(item.count)")
              .font(.system(size: 13, weight: .semibold))
              .foregroundColor(.appForegroundAdaptive)
          }
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .center)
  }
  
  var pieSliceData: [(id: String, color: Color, startAngle: Angle, endAngle: Angle)] {
    let gap: Angle = .degrees(3)
    var current: Angle = .degrees(-90)
    var slices: [(id: String, color: Color, startAngle: Angle, endAngle: Angle)] = []
    
    for item in itemsStatus {
      let statusInfo = getStatusInfo(item.status)
      let sweep = Angle.degrees(360 * item.percentage / 100)
      let effectiveSweep = max(sweep - gap, .degrees(0.5))
      let sliceStart = current + gap / 2
      slices.append((id: item.id, color: statusInfo.color, startAngle: sliceStart, endAngle: sliceStart + effectiveSweep))
      current = current + sweep
    }
    return slices
  }
  
  var pieSlices: some View {
    let lineWidth: CGFloat = 16
    
    return ZStack {
      ForEach(pieSliceData, id: \.id) { slice in
        PieSliceShape(startAngle: slice.startAngle, endAngle: slice.endAngle)
          .stroke(slice.color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
      }
    }
    .padding(lineWidth / 2)
  }
}

// MARK: - Watched Cast Section
extension ProfileStatsView {
  var watchedCastSection: some View {
    VStack(spacing: 0) {
      ForEach(Array(watchedCast.enumerated()), id: \.element.id) { index, actor in
        VStack(spacing: 0) {
          HStack(spacing: 10) {
            CachedAsyncImage(url: actor.profileURL) { image in
              image
                .resizable()
                .aspectRatio(contentMode: .fill)
            } placeholder: {
              Circle()
                .fill(Color.appInputFilled)
                .overlay(
                  Image(systemName: "person.fill")
                    .font(.system(size: 14))
                    .foregroundColor(.appMutedForegroundAdaptive)
                )
            }
            .frame(width: 40, height: 40)
            .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 6) {
              HStack {
                Text(actor.name)
                  .font(.system(size: 13, weight: .medium))
                  .foregroundColor(.appForegroundAdaptive)
                  .lineLimit(1)
                
                Spacer()
                
                Text(String(format: strings.inTitles, actor.count))
                  .font(.system(size: 12))
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
              
              GeometryReader { geo in
                ZStack(alignment: .leading) {
                  RoundedRectangle(cornerRadius: 3)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(height: 4)
                  
                  RoundedRectangle(cornerRadius: 3)
                    .fill(Color.appForegroundAdaptive)
                    .frame(width: geo.size.width * CGFloat(actor.percentage / 100), height: 4)
                }
              }
              .frame(height: 4)
            }
          }
          .padding(.top, index == 0 ? 0 : 12)
          .padding(.bottom, 12)
          
          if index < watchedCast.count - 1 {
            Divider()
              .padding(.leading, 50)
          }
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

// MARK: - Watched Countries Section
extension ProfileStatsView {
  var watchedCountriesSection: some View {
    let displayCountries = showAllCountries ? watchedCountries : Array(watchedCountries.prefix(5))
    
    return VStack(spacing: 0) {
      ForEach(Array(displayCountries.enumerated()), id: \.element.id) { index, country in
        VStack(spacing: 0) {
          HStack(spacing: 10) {
            Text(flagForCountry(country.name))
              .font(.system(size: 24))
              .frame(width: 32, height: 32)
            
            VStack(alignment: .leading, spacing: 6) {
              HStack {
                Text(country.name)
                  .font(.system(size: 13, weight: .medium))
                  .foregroundColor(.appForegroundAdaptive)
                  .lineLimit(1)
                
                Spacer()
                
                Text(String(format: "%.0f%%", country.percentage))
                  .font(.system(size: 12))
                  .foregroundColor(.appMutedForegroundAdaptive)
              }
              
              GeometryReader { geo in
                ZStack(alignment: .leading) {
                  RoundedRectangle(cornerRadius: 3)
                    .fill(Color.appBorderAdaptive.opacity(0.5))
                    .frame(height: 4)
                  
                  RoundedRectangle(cornerRadius: 3)
                    .fill(Color.appForegroundAdaptive)
                    .frame(width: geo.size.width * CGFloat(country.percentage / 100), height: 4)
                }
              }
              .frame(height: 4)
            }
          }
          .padding(.top, index == 0 ? 0 : 12)
          .padding(.bottom, 12)
          
          if index < displayCountries.count - 1 {
            Divider()
              .padding(.leading, 42)
          }
        }
      }
      
      if watchedCountries.count > 5 {
        Button {
          withAnimation(.easeInOut(duration: 0.3)) {
            showAllCountries.toggle()
          }
        } label: {
          HStack(spacing: 4) {
            Text(showAllCountries ? strings.showLess : strings.showMore)
              .font(.system(size: 13, weight: .medium))
            Image(systemName: showAllCountries ? "chevron.up" : "chevron.down")
              .font(.system(size: 10, weight: .semibold))
          }
          .foregroundColor(.appMutedForegroundAdaptive)
          .padding(.top, 12)
        }
        .frame(maxWidth: .infinity, alignment: .center)
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .clipped()
  }
}

// MARK: - Most Watched Series Section
extension ProfileStatsView {
  var mostWatchedSeriesSection: some View {
    HStack(alignment: .top, spacing: 12) {
      ForEach(mostWatchedSeries, id: \.id) { series in
        VStack(spacing: 6) {
          CachedAsyncImage(url: series.posterURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster)
              .fill(Color.appBorderAdaptive)
          }
          .frame(maxWidth: .infinity)
          .aspectRatio(2/3, contentMode: .fit)
          .clipShape(RoundedRectangle(cornerRadius: DesignTokens.CornerRadius.poster))
          .posterBorder()
          .posterShadow()
          
          Text("\(series.episodes) \(strings.episodesWatched)")
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
            .multilineTextAlignment(.center)
            .frame(maxWidth: .infinity)
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
  }
}

// MARK: - Best Reviews Section
extension ProfileStatsView {
  var bestReviewsSection: some View {
    VStack(alignment: .leading, spacing: 24) {
      VStack(alignment: .leading, spacing: 24) {
        ForEach(Array(bestReviews.prefix(3).enumerated()), id: \.element.id) { index, review in
          BestReviewRow(review: review, rank: index + 1)
        }
      }
      .frame(maxWidth: .infinity, alignment: .leading)
      
      if bestReviews.count > 3 {
        Button {
          showAllReviews = true
        } label: {
          Text(strings.seeAll)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .overlay(
              RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.appBorderAdaptive.opacity(0.5), lineWidth: 1)
            )
        }
      }
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .fullScreenCover(isPresented: $showAllReviews) {
      allReviewsSheet
    }
  }
  
  var allReviewsSheet: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 24) {
          ForEach(Array(bestReviews.enumerated()), id: \.element.id) { index, review in
            BestReviewRow(review: review, rank: index + 1)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 8)
        .padding(.bottom, 24)
      }
      .background(Color.appBackgroundAdaptive)
      .navigationTitle(strings.bestReviews)
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button {
            showAllReviews = false
          } label: {
            Image(systemName: "xmark.circle.fill")
              .font(.system(size: 20))
              .foregroundStyle(.gray, Color(.systemGray5))
          }
        }
      }
    }
  }
}
