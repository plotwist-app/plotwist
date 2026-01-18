//
//  StatusSheet.swift
//  Plotwist
//

import SwiftUI

struct StatusSheet: View {
  let mediaId: Int
  let mediaType: String
  let currentStatus: UserItemStatus?
  let currentItemId: String?
  let initialWatchEntries: [WatchEntry]
  let onStatusChanged: (UserItemStatus?, [WatchEntry]) -> Void
  
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var isLoading = false
  @State private var isAddingRewatch = false
  @State private var selectedStatus: UserItemStatus?
  @State private var watchEntries: [WatchEntry] = []
  @State private var showErrorAlert = false
  @State private var errorMessage = ""
  
  init(
    mediaId: Int,
    mediaType: String,
    currentStatus: UserItemStatus?,
    currentItemId: String?,
    watchEntries: [WatchEntry] = [],
    onStatusChanged: @escaping (UserItemStatus?, [WatchEntry]) -> Void
  ) {
    self.mediaId = mediaId
    self.mediaType = mediaType
    self.currentStatus = currentStatus
    self.currentItemId = currentItemId
    self.initialWatchEntries = watchEntries
    self.onStatusChanged = onStatusChanged
    _selectedStatus = State(initialValue: currentStatus)
    _watchEntries = State(initialValue: watchEntries)
  }
  
  private var sheetHeight: CGFloat {
    if selectedStatus == .watched && !watchEntries.isEmpty {
      // Base height + rewatch section
      let baseHeight: CGFloat = 340
      let rewatchHeaderHeight: CGFloat = 50
      let entryHeight: CGFloat = 32
      let entriesHeight = CGFloat(watchEntries.count) * entryHeight
      return min(baseHeight + rewatchHeaderHeight + entriesHeight + 24, 624)
    }
    return 340
  }
  
  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()
      
      ScrollView {
        VStack(spacing: 0) {
          // Drag Indicator
          RoundedRectangle(cornerRadius: 2.5)
            .fill(Color.gray.opacity(0.4))
            .frame(width: 36, height: 5)
            .padding(.top, 12)
            .padding(.bottom, 16)
          
          // Title
          Text(L10n.current.updateStatus)
            .font(.title3.bold())
            .foregroundColor(.appForegroundAdaptive)
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.bottom, 20)
          
          // Status Options Grid
          LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            ForEach(UserItemStatus.allCases, id: \.rawValue) { status in
              StatusOptionButton(
                status: status,
                isSelected: selectedStatus == status,
                isLoading: isLoading && selectedStatus == status,
                rewatchCount: status == .watched ? watchEntries.count : 0,
                action: {
                  handleStatusChange(status)
                }
              )
            }
          }
          .padding(.horizontal, 24)
          
          // Rewatch Section - Only shows when status is WATCHED
          if selectedStatus == .watched && !watchEntries.isEmpty {
            VStack(alignment: .leading, spacing: 16) {
              // Header
              HStack {
                Text(L10n.current.watchLog)
                  .font(.title3.bold())
                  .foregroundColor(.appForegroundAdaptive)
                
                Spacer()
                
                Button(action: addRewatch) {
                  if isAddingRewatch {
                    ProgressView()
                      .tint(.appForegroundAdaptive)
                  } else {
                    Text("+ Rewatch")
                      .font(.caption)
                      .foregroundColor(.appForegroundAdaptive)
                  }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(Color.appInputFilled)
                .clipShape(RoundedRectangle(cornerRadius: 8))
                .disabled(isAddingRewatch)
              }
              
              // Watch entries timeline
              VStack(alignment: .leading, spacing: 0) {
                ForEach(Array(watchEntries.enumerated()), id: \.element.id) { index, entry in
                  WatchEntryRow(
                    index: index,
                    entry: entry,
                    isLast: index == watchEntries.count - 1,
                    canDelete: watchEntries.count > 1,
                    onDelete: {
                      deleteWatchEntry(entry)
                    }
                  )
                }
              }
            }
            .padding(.horizontal, 24)
            .padding(.top, 24)
          }
          
          Spacer()
            .frame(height: 24)
        }
      }
    }
    .presentationDetents([.height(sheetHeight)])
    .presentationCornerRadius(24)
    .presentationDragIndicator(.hidden)
    .preferredColorScheme(themeManager.current.colorScheme)
    .alert("Error", isPresented: $showErrorAlert) {
      Button("OK", role: .cancel) {}
    } message: {
      Text(errorMessage)
    }
  }
  
  private func handleStatusChange(_ status: UserItemStatus) {
    // If tapping the same status, remove it
    if status == currentStatus, let itemId = currentItemId {
      isLoading = true
      selectedStatus = status
      
      Task {
        do {
          try await UserItemService.shared.deleteUserItem(id: itemId)
          
          await MainActor.run {
            isLoading = false
            watchEntries = []
            onStatusChanged(nil, [])
            dismiss()
          }
        } catch {
          await MainActor.run {
            isLoading = false
            errorMessage = error.localizedDescription
            showErrorAlert = true
          }
        }
      }
    } else {
      // Set new status
      isLoading = true
      selectedStatus = status
      
      Task {
        do {
          let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
          _ = try await UserItemService.shared.upsertUserItem(
            tmdbId: mediaId,
            mediaType: apiMediaType,
            status: status
          )
          
          await MainActor.run {
            isLoading = false
            // If status is WATCHED, fetch the watch entries
            if status == .watched {
              // The API automatically creates the first entry
              Task {
                await reloadUserItem()
              }
            } else {
              watchEntries = []
              onStatusChanged(status, [])
              dismiss()
            }
          }
        } catch {
          await MainActor.run {
            isLoading = false
            errorMessage = error.localizedDescription
            showErrorAlert = true
          }
        }
      }
    }
  }
  
  private func reloadUserItem() async {
    do {
      let apiMediaType = mediaType == "movie" ? "MOVIE" : "TV_SHOW"
      if let userItem = try await UserItemService.shared.getUserItem(
        tmdbId: mediaId,
        mediaType: apiMediaType
      ) {
        await MainActor.run {
          watchEntries = userItem.watchEntries ?? []
        }
      }
    } catch {
      // Ignore errors
    }
  }
  
  private func addRewatch() {
    guard let itemId = currentItemId else { return }
    
    isAddingRewatch = true
    
    Task {
      do {
        let newEntry = try await UserItemService.shared.addWatchEntry(userItemId: itemId)
        
        await MainActor.run {
          isAddingRewatch = false
          watchEntries.append(newEntry)
          onStatusChanged(selectedStatus, watchEntries)
        }
      } catch {
        await MainActor.run {
          isAddingRewatch = false
          errorMessage = error.localizedDescription
          showErrorAlert = true
        }
      }
    }
  }
  
  private func deleteWatchEntry(_ entry: WatchEntry) {
    Task {
      do {
        try await UserItemService.shared.deleteWatchEntry(id: entry.id)
        
        await MainActor.run {
          watchEntries.removeAll { $0.id == entry.id }
          onStatusChanged(selectedStatus, watchEntries)
        }
      } catch {
        await MainActor.run {
          errorMessage = error.localizedDescription
          showErrorAlert = true
        }
      }
    }
  }
}

// MARK: - Watch Entry Row
struct WatchEntryRow: View {
  let index: Int
  let entry: WatchEntry
  let isLast: Bool
  let canDelete: Bool
  let onDelete: () -> Void
  
  private var formattedDate: String {
    guard let date = entry.date else { return "" }
    let formatter = DateFormatter()
    formatter.dateStyle = .medium
    formatter.timeStyle = .none
    return formatter.string(from: date)
  }
  
  private var ordinalLabel: String {
    if index == 0 {
      return L10n.current.firstTime
    } else {
      return L10n.current.nthTime.replacingOccurrences(of: "%@", with: ordinalNumber)
    }
  }
  
  private var ordinalNumber: String {
    let number = index + 1
    let language = Language.current
    
    switch language {
    case .enUS:
      // English ordinals: 1st, 2nd, 3rd, 4th...
      switch number {
      case 1: return "1st"
      case 2: return "2nd"
      case 3: return "3rd"
      default: return "\(number)th"
      }
    case .ptBR, .esES, .itIT:
      // Portuguese/Spanish/Italian: 1ª, 2ª, 3ª...
      return "\(number)ª"
    case .frFR:
      // French: 1ère, 2ème, 3ème...
      return number == 1 ? "1ère" : "\(number)ème"
    case .deDE:
      // German: 1., 2., 3....
      return "\(number)."
    case .jaJP:
      // Japanese: 1, 2, 3...
      return "\(number)"
    }
  }
  
  private var isFirst: Bool {
    index == 0
  }
  
  var body: some View {
    HStack(spacing: 12) {
      // Timeline indicator
      ZStack(alignment: .center) {
        VStack(spacing: 0) {
          // Top line (for non-first items) - connects from previous dot
          Rectangle()
            .fill(isFirst ? Color.clear : Color.appMutedForegroundAdaptive.opacity(0.3))
            .frame(width: 1, height: 12)
          
          // Space for dot
          Color.clear
            .frame(height: 8)
          
          // Bottom line (for non-last items) - connects to next dot
          Rectangle()
            .fill(isLast ? Color.clear : Color.appMutedForegroundAdaptive.opacity(0.3))
            .frame(width: 1, height: 12)
        }
        
        // Dot - centered
        Circle()
          .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
          .frame(width: 8, height: 8)
      }
      .frame(width: 8, height: 32)
      
      // Content
      HStack(spacing: 6) {
        Text(ordinalLabel)
          .font(.subheadline)
          .foregroundColor(.appForegroundAdaptive)
        
        Circle()
          .fill(Color.appMutedForegroundAdaptive.opacity(0.5))
          .frame(width: 4, height: 4)
        
        Text(formattedDate)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
        
        Spacer()
        
        if canDelete {
          Button(action: onDelete) {
            Image(systemName: "xmark")
              .font(.system(size: 12, weight: .medium))
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
    }
    .frame(height: 32)
  }
}

// MARK: - Status Option Button
struct StatusOptionButton: View {
  let status: UserItemStatus
  let isSelected: Bool
  let isLoading: Bool
  let rewatchCount: Int
  let action: () -> Void
  
  private var iconColor: Color {
    switch status {
    case .watched: return .green
    case .watching: return .blue
    case .watchlist: return .orange
    case .dropped: return .red
    }
  }
  
  var body: some View {
    Button(action: action) {
      VStack(spacing: 10) {
        if isLoading {
          ProgressView()
            .tint(.appMutedForegroundAdaptive)
        } else {
          ZStack(alignment: .topTrailing) {
            Image(systemName: status.icon)
              .font(.system(size: 22))
              .foregroundColor(isSelected ? iconColor : .appMutedForegroundAdaptive)
            
            // Rewatch count badge
            if isSelected && rewatchCount > 1 {
              Text("\(rewatchCount)x")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(.white)
                .padding(.horizontal, 4)
                .padding(.vertical, 2)
                .background(iconColor)
                .clipShape(Capsule())
                .offset(x: 16, y: -8)
            }
          }
          
          Text(status.displayName(strings: L10n.current))
            .font(.subheadline.weight(.medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
      .frame(maxWidth: .infinity)
      .frame(height: 80)
      .background(Color.appInputFilled)
      .cornerRadius(12)
    }
    .disabled(isLoading)
  }
}

// MARK: - Preview
#Preview {
  StatusSheet(
    mediaId: 550,
    mediaType: "movie",
    currentStatus: .watched,
    currentItemId: "123",
    watchEntries: [
      WatchEntry(id: "1", watchedAt: "2025-01-10T12:00:00.000Z"),
      WatchEntry(id: "2", watchedAt: "2025-01-15T12:00:00.000Z"),
      WatchEntry(id: "3", watchedAt: "2025-01-17T12:00:00.000Z"),
    ],
    onStatusChanged: { _, _ in }
  )
}
