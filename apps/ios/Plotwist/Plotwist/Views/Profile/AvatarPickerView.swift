//
//  AvatarPickerView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Avatar Picker View
struct AvatarPickerView: View {
  @Environment(\.dismiss) private var dismiss
  @State private var strings = L10n.current
  
  // Navigation state
  @State private var selectedTitle: SearchResult?
  @State private var selectedImage: TMDBImage?
  
  // Search state
  @State private var searchText = ""
  @State private var searchResults: [SearchResult] = []
  @State private var topRatedMovies: [SearchResult] = []
  @State private var isSearching = false
  @State private var searchTask: Task<Void, Never>?
  
  // Images state
  @State private var images: [TMDBImage] = []
  @State private var isLoadingImages = false
  
  // Crop/Save state
  @State private var isSaving = false
  @State private var showSuccess = false
  @State private var saveError: String?
  
  // Crop gesture state
  @State private var cropOffset: CGSize = .zero
  @State private var cropScale: CGFloat = 1.0
  @State private var lastOffset: CGSize = .zero
  @State private var lastScale: CGFloat = 1.0
  
  var onAvatarUpdated: (() -> Void)?
  
  var body: some View {
    NavigationStack {
      ZStack {
        Color.appBackgroundAdaptive.ignoresSafeArea()
        
        VStack(spacing: 0) {
          headerView
          
          if let selectedImage {
            cropStep(image: selectedImage)
          } else if let selectedTitle {
            imagesStep(title: selectedTitle)
          } else {
            searchStep
          }
        }
      }
      .navigationBarHidden(true)
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
    .task {
      await loadTopRated()
    }
  }
  
  // MARK: - Header
  private var headerView: some View {
    VStack(spacing: 0) {
      HStack {
        Button {
          if selectedImage != nil {
            withAnimation(.easeInOut(duration: 0.2)) {
              selectedImage = nil
              cropOffset = .zero
              cropScale = 1.0
              lastOffset = .zero
              lastScale = 1.0
            }
          } else if selectedTitle != nil {
            withAnimation(.easeInOut(duration: 0.2)) {
              selectedTitle = nil
              images = []
            }
          } else {
            dismiss()
          }
        } label: {
          Image(systemName: selectedImage != nil || selectedTitle != nil ? "chevron.left" : "xmark")
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 36, height: 36)
            .background(Color.appInputFilled)
            .clipShape(Circle())
        }
        
        Spacer()
        
        Text(headerTitle)
          .font(.headline)
          .foregroundColor(.appForegroundAdaptive)
        
        Spacer()
        
        // Balance spacer
        Color.clear.frame(width: 36, height: 36)
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 12)
      
      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }
  
  private var headerTitle: String {
    if selectedImage != nil {
      return strings.cropAndSave
    } else if let selectedTitle {
      return selectedTitle.displayTitle
    } else {
      return strings.selectAnImage
    }
  }
  
  // MARK: - Step 1: Search Title
  private var searchStep: some View {
    VStack(spacing: 0) {
      // Search field
      HStack(spacing: 10) {
        Image(systemName: "magnifyingglass")
          .font(.system(size: 15))
          .foregroundColor(.appMutedForegroundAdaptive)
        
        TextField(strings.searchTitle, text: $searchText)
          .font(.subheadline)
          .foregroundColor(.appForegroundAdaptive)
          .autocorrectionDisabled()
          .textInputAutocapitalization(.never)
      }
      .padding(12)
      .background(Color.appInputFilled)
      .cornerRadius(12)
      .padding(.horizontal, 24)
      .padding(.vertical, 16)
      .onChange(of: searchText) { _, newValue in
        searchTask?.cancel()
        if newValue.isEmpty {
          searchResults = []
          return
        }
        searchTask = Task {
          try? await Task.sleep(nanoseconds: 400_000_000) // 400ms debounce
          guard !Task.isCancelled else { return }
          await performSearch(query: newValue)
        }
      }
      
      // Results
      ScrollView(showsIndicators: false) {
        LazyVStack(spacing: 0) {
          let items = searchText.isEmpty ? topRatedMovies : searchResults
          
          if isSearching {
            ProgressView()
              .padding(.top, 32)
          } else {
            if !searchText.isEmpty && searchResults.isEmpty {
              Text(strings.noResults)
                .font(.subheadline)
                .foregroundColor(.appMutedForegroundAdaptive)
                .padding(.top, 32)
            } else {
              if searchText.isEmpty && !topRatedMovies.isEmpty {
                Text(strings.topRated)
                  .font(.system(size: 11, weight: .medium))
                  .tracking(1.5)
                  .foregroundColor(.appMutedForegroundAdaptive)
                  .frame(maxWidth: .infinity, alignment: .leading)
                  .padding(.horizontal, 24)
                  .padding(.bottom, 8)
              }
              
              ForEach(items) { item in
                Button {
                  withAnimation(.easeInOut(duration: 0.2)) {
                    selectedTitle = item
                  }
                  Task { await loadImages(for: item) }
                } label: {
                  titleRow(item)
                }
                .buttonStyle(.plain)
              }
            }
          }
        }
        .padding(.bottom, 24)
      }
    }
  }
  
  private func titleRow(_ item: SearchResult) -> some View {
    HStack(spacing: 12) {
      // Poster thumbnail
      CachedAsyncImage(url: item.imageURL) { image in
        image
          .resizable()
          .aspectRatio(contentMode: .fill)
          .frame(width: 44, height: 66)
          .clipped()
      } placeholder: {
        RoundedRectangle(cornerRadius: 6)
          .fill(Color.appInputFilled)
          .frame(width: 44, height: 66)
      }
      .cornerRadius(6)
      
      VStack(alignment: .leading, spacing: 2) {
        Text(item.displayTitle)
          .font(.subheadline.weight(.medium))
          .foregroundColor(.appForegroundAdaptive)
          .lineLimit(1)
        
        HStack(spacing: 6) {
          if let year = item.year {
            Text(year)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
          
          if let mediaType = item.mediaType, mediaType != "person" {
            Text(mediaType == "movie" ? strings.movies : strings.tvSeries)
              .font(.caption)
              .foregroundColor(.appMutedForegroundAdaptive)
          }
        }
      }
      
      Spacer()
      
      Image(systemName: "chevron.right")
        .font(.system(size: 12))
        .foregroundColor(.appMutedForegroundAdaptive)
    }
    .padding(.horizontal, 24)
    .padding(.vertical, 8)
  }
  
  // MARK: - Step 2: Images Grid
  private func imagesStep(title: SearchResult) -> some View {
    ScrollView(showsIndicators: false) {
      if isLoadingImages {
        VStack {
          ProgressView()
            .padding(.top, 48)
        }
      } else if images.isEmpty {
        Text(strings.noImagesFound)
          .font(.subheadline)
          .foregroundColor(.appMutedForegroundAdaptive)
          .padding(.top, 48)
      } else {
        let columns = [
          GridItem(.flexible(), spacing: 8),
          GridItem(.flexible(), spacing: 8),
          GridItem(.flexible(), spacing: 8),
        ]
        
        LazyVGrid(columns: columns, spacing: 8) {
          ForEach(images) { img in
            Button {
              withAnimation(.easeInOut(duration: 0.2)) {
                selectedImage = img
              }
            } label: {
              CachedAsyncImage(url: img.thumbnailURL) { image in
                image
                  .resizable()
                  .aspectRatio(contentMode: .fill)
                  .frame(minHeight: 100)
                  .clipped()
              } placeholder: {
                Rectangle()
                  .fill(Color.appInputFilled)
                  .frame(minHeight: 100)
              }
              .cornerRadius(8)
            }
            .buttonStyle(.plain)
          }
        }
        .padding(.horizontal, 24)
        .padding(.top, 16)
        .padding(.bottom, 24)
      }
    }
  }
  
  // MARK: - Step 3: Crop & Save
  private func cropStep(image: TMDBImage) -> some View {
    VStack(spacing: 0) {
      Spacer()
      
      // Crop area
      GeometryReader { geo in
        let cropSize = min(geo.size.width - 48, geo.size.height - 48, 320)
        
        ZStack {
          // Image with gestures
          CachedAsyncImage(url: image.fullURL) { loadedImage in
            loadedImage
              .resizable()
              .aspectRatio(contentMode: .fill)
              .frame(width: cropSize * 1.5, height: cropSize * 1.5)
              .offset(cropOffset)
              .scaleEffect(cropScale)
              .gesture(
                SimultaneousGesture(
                  DragGesture()
                    .onChanged { value in
                      cropOffset = CGSize(
                        width: lastOffset.width + value.translation.width,
                        height: lastOffset.height + value.translation.height
                      )
                    }
                    .onEnded { _ in
                      lastOffset = cropOffset
                    },
                  MagnificationGesture()
                    .onChanged { value in
                      cropScale = max(0.5, min(lastScale * value, 4.0))
                    }
                    .onEnded { _ in
                      lastScale = cropScale
                    }
                )
              )
          } placeholder: {
            ProgressView()
              .frame(width: cropSize, height: cropSize)
          }
          
          // Circle mask overlay
          CropOverlay(cropSize: cropSize)
        }
        .frame(width: cropSize, height: cropSize)
        .clipShape(Rectangle())
        .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
      
      Spacer()
      
      // Save button
      VStack(spacing: 8) {
        if let saveError {
          Text(saveError)
            .font(.caption)
            .foregroundColor(.appDestructive)
        }
        
        Button {
          Task { await cropAndSave(image: image) }
        } label: {
          HStack(spacing: 8) {
            if isSaving {
              ProgressView()
                .tint(.appBackgroundAdaptive)
            }
            Text(isSaving ? strings.avatarSaving : strings.cropAndSave)
              .font(.system(size: 16, weight: .semibold))
          }
          .foregroundColor(.appBackgroundAdaptive)
          .frame(maxWidth: .infinity)
          .frame(height: 52)
          .background(Color.appForegroundAdaptive)
          .cornerRadius(12)
        }
        .disabled(isSaving)
        .buttonStyle(.plain)
      }
      .padding(.horizontal, 24)
      .padding(.bottom, 24)
    }
    .alert(strings.avatarSaved, isPresented: $showSuccess) {
      Button("OK") {
        onAvatarUpdated?()
        dismiss()
      }
    }
  }
  
  // MARK: - API Calls
  private func loadTopRated() async {
    do {
      let result = try await TMDBService.shared.getTopRatedMovies(
        language: Language.current.rawValue
      )
      topRatedMovies = result.results
    } catch {
      // Silently fail, user can still search
    }
  }
  
  private func performSearch(query: String) async {
    isSearching = true
    defer { isSearching = false }
    
    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      // Filter out people, only keep movies and TV shows
      searchResults = response.results.filter { $0.mediaType != "person" }
    } catch {
      searchResults = []
    }
  }
  
  private func loadImages(for item: SearchResult) async {
    isLoadingImages = true
    defer { isLoadingImages = false }
    
    let mediaType = item.mediaType ?? "movie"
    
    do {
      let result = try await TMDBService.shared.getImages(
        id: item.id,
        mediaType: mediaType
      )
      // Combine backdrops and posters, sorted by vote count
      images = (result.backdrops + result.posters).sorted { $0.voteCount > $1.voteCount }
    } catch {
      images = []
    }
  }
  
  // MARK: - Crop & Upload
  @MainActor
  private func cropAndSave(image: TMDBImage) async {
    guard let imageURL = image.fullURL else { return }
    isSaving = true
    saveError = nil
    defer { isSaving = false }
    
    do {
      // Download the full image
      let (data, _) = try await URLSession.shared.data(from: imageURL)
      guard let uiImage = UIImage(data: data) else {
        saveError = "Failed to load image"
        return
      }
      
      // Apply crop
      let croppedImage = applyCrop(to: uiImage, cropSize: 320)
      
      guard let token = UserDefaults.standard.string(forKey: "token") else {
        saveError = "Not authenticated"
        return
      }
      
      // Upload to R2
      let avatarURL = try await uploadImage(image: croppedImage, token: token)
      
      // Update user avatar
      _ = try await AuthService.shared.updateUser(avatarUrl: avatarURL)
      
      showSuccess = true
    } catch {
      saveError = error.localizedDescription
    }
  }
  
  private func applyCrop(to image: UIImage, cropSize: CGFloat) -> UIImage {
    let imageSize = image.size
    let scale = image.scale
    
    // The visible area is cropSize x cropSize, the image is displayed at cropSize * 1.5
    let displaySize = cropSize * 1.5
    let imageScale = max(imageSize.width, imageSize.height) / displaySize
    
    // Calculate the crop rect in image coordinates
    let centerX = imageSize.width / 2
    let centerY = imageSize.height / 2
    
    let visibleSize = cropSize / cropScale * imageScale
    let offsetX = -cropOffset.width / cropScale * imageScale
    let offsetY = -cropOffset.height / cropScale * imageScale
    
    let cropRect = CGRect(
      x: centerX - visibleSize / 2 + offsetX,
      y: centerY - visibleSize / 2 + offsetY,
      width: visibleSize,
      height: visibleSize
    )
    
    // Clamp to image bounds
    let clampedRect = cropRect.intersection(CGRect(origin: .zero, size: imageSize))
    
    // Render final 512x512 avatar
    let outputSize = CGSize(width: 512, height: 512)
    let renderer = UIGraphicsImageRenderer(size: outputSize)
    return renderer.image { ctx in
      // Clip to circle
      let circlePath = UIBezierPath(ovalIn: CGRect(origin: .zero, size: outputSize))
      circlePath.addClip()
      
      // Draw the cropped portion
      if let cgImage = image.cgImage?.cropping(to: CGRect(
        x: clampedRect.origin.x * scale,
        y: clampedRect.origin.y * scale,
        width: clampedRect.width * scale,
        height: clampedRect.height * scale
      )) {
        UIImage(cgImage: cgImage).draw(in: CGRect(origin: .zero, size: outputSize))
      } else {
        // Fallback: draw full image
        image.draw(in: CGRect(origin: .zero, size: outputSize))
      }
    }
  }
  
  private func uploadImage(image: UIImage, token: String) async throws -> String {
    let timestamp = Int(Date().timeIntervalSince1970)
    guard let url = URL(string: "\(API.baseURL)/image?folder=avatar&fileName=avatar-\(timestamp)")
    else {
      throw URLError(.badURL)
    }
    
    let boundary = UUID().uuidString
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue(
      "multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    
    guard let imageData = image.jpegData(compressionQuality: 0.85) else {
      throw URLError(.cannotDecodeContentData)
    }
    
    var body = Data()
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append(
      "Content-Disposition: form-data; name=\"file\"; filename=\"avatar.jpg\"\r\n".data(
        using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(imageData)
    body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
    
    request.httpBody = body
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let http = response as? HTTPURLResponse, http.statusCode == 201 else {
      throw URLError(.badServerResponse)
    }
    
    struct UploadResponse: Decodable { let url: String }
    let result = try JSONDecoder().decode(UploadResponse.self, from: data)
    return result.url
  }
}

// MARK: - Crop Overlay
private struct CropOverlay: View {
  let cropSize: CGFloat
  
  var body: some View {
    Canvas { context, size in
      // Draw semi-transparent overlay
      let fullRect = CGRect(origin: .zero, size: size)
      context.fill(Path(fullRect), with: .color(.black.opacity(0.5)))
      
      // Cut out circle
      let circleRect = CGRect(
        x: (size.width - cropSize) / 2,
        y: (size.height - cropSize) / 2,
        width: cropSize,
        height: cropSize
      )
      context.blendMode = .destinationOut
      context.fill(Path(ellipseIn: circleRect), with: .color(.white))
      
      // Draw circle border
      context.blendMode = .normal
      context.stroke(
        Path(ellipseIn: circleRect),
        with: .color(.white.opacity(0.6)),
        lineWidth: 1.5
      )
    }
    .allowsHitTesting(false)
  }
}

#Preview {
  AvatarPickerView()
}
