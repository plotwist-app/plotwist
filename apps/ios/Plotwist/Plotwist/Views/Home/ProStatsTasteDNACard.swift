//
//  ProStatsTasteDNACard.swift
//  Plotwist
//

import SwiftUI

struct ProStatsTasteDNACard: View {
  let dna: TasteDNAResult
  let strings: Strings

  var body: some View {
    ProStatsCardShell.card(title: strings.yourTasteDNA) {
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
}

struct ProStatsTasteDNASkeleton: View {
  var body: some View {
    ProStatsCardShell.shell {
      VStack(alignment: .leading, spacing: 14) {
        ProStatsCardShell.skeletonTitle()
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
}
