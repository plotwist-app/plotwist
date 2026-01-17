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
  let onStatusChanged: (UserItemStatus?) -> Void
  
  @Environment(\.dismiss) private var dismiss
  @ObservedObject private var themeManager = ThemeManager.shared
  @State private var isLoading = false
  @State private var selectedStatus: UserItemStatus?
  @State private var showErrorAlert = false
  @State private var errorMessage = ""
  
  init(
    mediaId: Int,
    mediaType: String,
    currentStatus: UserItemStatus?,
    currentItemId: String?,
    onStatusChanged: @escaping (UserItemStatus?) -> Void
  ) {
    self.mediaId = mediaId
    self.mediaType = mediaType
    self.currentStatus = currentStatus
    self.currentItemId = currentItemId
    self.onStatusChanged = onStatusChanged
    _selectedStatus = State(initialValue: currentStatus)
  }
  
  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()
      
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
              action: {
                handleStatusChange(status)
              }
            )
          }
        }
        .padding(.horizontal, 24)
        
        Spacer()
      }
    }
    .presentationDetents([.height(340)])
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
            onStatusChanged(nil)
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
            onStatusChanged(status)
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
    }
  }
}

// MARK: - Status Option Button
struct StatusOptionButton: View {
  let status: UserItemStatus
  let isSelected: Bool
  let isLoading: Bool
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
          Image(systemName: status.icon)
            .font(.system(size: 22))
            .foregroundColor(isSelected ? iconColor : .appMutedForegroundAdaptive)
          
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
    currentStatus: nil,
    currentItemId: nil,
    onStatusChanged: { _ in }
  )
}
