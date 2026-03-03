//
//  DotGlobeView.swift
//  Plotwist

import SwiftUI
import MapKit

struct CountryPin: Identifiable {
  let code: String
  let count: Int
  let lat: Double
  let lon: Double

  var id: String { code }
  var coordinate: CLLocationCoordinate2D {
    CLLocationCoordinate2D(latitude: lat, longitude: lon)
  }
}

struct GlobeMapView: View {
  let pins: [CountryPin]
  var footerOverlayColor: Color = .statsCardBackground

  @State private var position: MapCameraPosition = .automatic

  var body: some View {
    Map(position: $position, interactionModes: [.pan, .zoom]) {
      ForEach(pins) { pin in
        Annotation("", coordinate: pin.coordinate) {
          pinView(pin)
        }
      }
    }
    .mapStyle(.standard(pointsOfInterest: .excludingAll))
    .overlay(alignment: .bottom) {
      footerOverlayColor
        .frame(height: 44)
        .allowsHitTesting(false)
    }
    .onAppear { fitPins() }
  }

  private func fitPins() {
    guard !pins.isEmpty else { return }
    let topPin = pins.max(by: { $0.count < $1.count }) ?? pins[0]
    let center = CLLocationCoordinate2D(latitude: topPin.lat, longitude: topPin.lon)
    let padding = 1.4
    let latSpan = pins.map { abs($0.lat - topPin.lat) }.max() ?? 0
    let lonSpan = pins.map { abs($0.lon - topPin.lon) }.max() ?? 0
    let latDelta = min(120, max(18, (latSpan * 2) * padding))
    let lonDelta = min(150, max(25, (lonSpan * 2) * padding))
    position = .region(MKCoordinateRegion(
      center: center,
      span: MKCoordinateSpan(latitudeDelta: latDelta, longitudeDelta: lonDelta)
    ))
  }

  private func pinView(_ pin: CountryPin) -> some View {
    let maxCount = pins.map(\.count).max() ?? 1
    let normalized = Double(pin.count) / Double(maxCount)
    let size: CGFloat = 34 + normalized * 12
    let isTop = normalized >= 0.5

    return Text("\(pin.count)")
      .font(.system(size: isTop ? 13 : 11, weight: .semibold, design: .rounded))
      .foregroundColor(.appForegroundAdaptive)
      .frame(width: size, height: size)
      .background(Circle().fill(Color.appBackgroundAdaptive))
      .overlay(
        Circle()
          .strokeBorder(Color.appBorderAdaptive.opacity(0.6), lineWidth: 1)
      )
      .shadow(color: .black.opacity(0.2), radius: 2, y: 1)
  }
}

// MARK: - Country Centroid Coordinates

let countryCentroids: [String: (lat: Double, lon: Double)] = [
  "US": (39.8, -98.5), "GB": (54.0, -2.0), "CA": (56.1, -106.3),
  "BR": (-14.2, -51.9), "DE": (51.2, 10.4), "JP": (36.2, 138.3),
  "FR": (46.6, 2.2), "ES": (40.5, -3.7), "AU": (-25.3, 133.8),
  "IT": (41.9, 12.6), "KR": (35.9, 127.8), "IN": (20.6, 79.0),
  "CN": (35.9, 104.2), "MX": (23.6, -102.6), "RU": (61.5, 105.3),
  "SE": (62.0, 15.0), "NO": (64.5, 17.1), "FI": (64.0, 26.0),
  "DK": (56.3, 9.5), "NZ": (-40.9, 174.9), "AR": (-38.4, -63.6),
  "TW": (23.7, 121.0), "TH": (15.9, 101.0), "TR": (39.9, 32.9),
  "PL": (51.9, 19.1), "NL": (52.1, 5.3), "BE": (50.5, 4.5),
  "PT": (39.4, -8.2), "HK": (22.4, 114.1), "NG": (9.1, 8.7),
  "ZA": (-30.6, 22.9), "EG": (26.8, 30.8), "CO": (4.6, -74.3),
  "CL": (-35.7, -71.5), "PH": (12.9, 121.8), "ID": (-0.8, 113.9),
  "MY": (4.2, 101.9), "SG": (1.4, 103.8), "IE": (53.4, -8.2),
  "AT": (47.5, 14.6), "CH": (46.8, 8.2), "CZ": (49.8, 15.5),
  "HU": (47.2, 19.5), "RO": (45.9, 25.0), "GR": (39.1, 21.8),
  "UA": (48.4, 31.2), "IL": (31.0, 34.9), "SA": (24.0, 45.1),
  "AE": (24.0, 54.0), "PK": (30.4, 69.3), "VN": (14.1, 108.3),
  "PE": (-9.2, -75.0), "VE": (6.4, -66.6), "EC": (-1.8, -78.2),
  "UY": (-32.5, -55.8), "PY": (-23.4, -58.4), "BO": (-16.3, -63.6),
  "CR": (9.7, -83.8), "PA": (8.5, -80.8), "DO": (18.7, -70.2),
  "CU": (21.5, -77.8), "JM": (18.1, -77.3), "IS": (65.0, -18.0),
  "LU": (49.8, 6.1), "HR": (45.1, 15.2), "RS": (44.0, 21.0),
  "BG": (42.7, 25.5), "SK": (48.7, 19.7), "SI": (46.2, 14.8),
  "LT": (55.2, 23.9), "LV": (56.9, 24.1), "EE": (58.6, 25.0),
  "GE": (42.3, 43.4), "KE": (-0.02, 37.9), "MA": (31.8, -7.1),
  "TN": (34.0, 9.5), "GH": (7.9, -1.0), "ET": (9.1, 40.5),
  "TZ": (-6.4, 34.9), "LB": (33.9, 35.9), "JO": (30.6, 36.2),
  "QA": (25.4, 51.2), "KW": (29.3, 47.5), "BH": (26.0, 50.6),
  "OM": (21.5, 56.0), "NP": (28.4, 84.1), "BD": (23.7, 90.4),
  "LK": (7.9, 80.8), "MM": (21.9, 96.0), "KH": (12.6, 105.0),
  "LA": (19.9, 102.5),
]
