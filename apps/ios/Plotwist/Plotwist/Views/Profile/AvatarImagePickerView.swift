//
//  AvatarImagePickerView.swift
//  Plotwist
//

import SwiftUI

// MARK: - Avatar Image Picker Step
private enum AvatarPickerStep {
  case selectTitle
  case selectImage
  case cropImage
}

// MARK: - Selected Title
private struct SelectedTitle: Equatable {
  let id: Int
  let type: String // "movie" or "tv"
  let title: String
}

// MARK: - Avatar Image Picker View
struct AvatarImagePickerView: View {
  let user: User
  let onSaved: (String) -> Void

  @Environment(\.dismiss) private var dismiss
  @State private var strings = L10n.current
  @State private var step: AvatarPickerStep = .selectTitle
  @State private var searchText = ""
  @State private var searchResults: [SearchResult] = []
  @State private var topRatedMovies: [SearchResult] = []
  @State private var isLoadingList = true
  @State private var isSearching = false
  @State private var selectedTitle: SelectedTitle?
  @State private var titleImages: [TMDBImage] = []
  @State private var isLoadingImages = false
  @State private var selectedImage: TMDBImage?
  @State private var cropImage: UIImage?
  @State private var isSaving = false
  @State private var saveError: String?
  // Crop state
  @State private var cropOffset: CGSize = .zero
  @State private var cropScale: CGFloat = 1.0
  @State private var lastOffset: CGSize = .zero
  @State private var lastScale: CGFloat = 1.0
  @State private var minCropScale: CGFloat = 1.0
  // Store actual geometry values for accurate cropping
  @State private var geoDisplayedWidth: CGFloat = 0
  @State private var geoDisplayedHeight: CGFloat = 0
  @State private var geoCropSize: CGFloat = 0

  private let searchDebouncer = Debouncer(delay: 0.5)
  /// Tracks the latest background upload so previous ones can be cancelled
  private static var backgroundUploadTask: Task<Void, Never>?

  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()

      VStack(spacing: 0) {
        headerView
        
        switch step {
        case .selectTitle:
          selectTitleStep
        case .selectImage:
          selectImageStep
        case .cropImage:
          cropImageStep
        }
      }
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }

  // MARK: - Header
  private var headerView: some View {
    VStack(spacing: 0) {
      HStack {
        Button {
          switch step {
          case .selectTitle:
            dismiss()
          case .selectImage:
            withAnimation(.easeInOut(duration: 0.2)) {
              step = .selectTitle
              selectedTitle = nil
              titleImages = []
            }
          case .cropImage:
            withAnimation(.easeInOut(duration: 0.2)) {
              step = .selectImage
              selectedImage = nil
              cropImage = nil
              resetCropState()
            }
          }
        } label: {
          Image(systemName: step == .selectTitle ? "xmark" : "chevron.left")
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
      .padding(.horizontal, 20)
      .padding(.vertical, 12)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }

  private var headerTitle: String {
    switch step {
    case .selectTitle:
      return strings.editPicture
    case .selectImage:
      return selectedTitle?.title ?? strings.images
    case .cropImage:
      return strings.editPicture
    }
  }

  // MARK: - Step 1: Select Title
  private var selectTitleStep: some View {
    VStack(spacing: 0) {
      // Search bar
      searchBar
        .padding(.horizontal, 20)
        .padding(.vertical, 12)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.3))
        .frame(height: 1)

      // Results
      ScrollView(showsIndicators: false) {
        if isLoadingList && searchText.isEmpty {
          loadingGrid
        } else if !searchText.isEmpty && isSearching {
          loadingGrid
        } else if !searchText.isEmpty && searchResults.isEmpty {
          emptyState
        } else {
          titleGrid(items: searchText.isEmpty ? topRatedMovies : searchResults)
        }
      }
    }
    .task {
      await loadTopRated()
    }
  }

  private var searchBar: some View {
    HStack(spacing: 10) {
      Image(systemName: "magnifyingglass")
        .font(.system(size: 16))
        .foregroundColor(.appMutedForegroundAdaptive)

      TextField(strings.searchPlaceholder, text: $searchText)
        .font(.subheadline)
        .foregroundColor(.appForegroundAdaptive)
        .autocorrectionDisabled()
        .textInputAutocapitalization(.never)
        .onChange(of: searchText) { _, newValue in
          if newValue.isEmpty {
            searchResults = []
            isSearching = false
          } else {
            isSearching = true
            searchDebouncer.debounce {
              await performSearch(query: newValue)
            }
          }
        }

      if !searchText.isEmpty {
        Button {
          searchText = ""
          searchResults = []
          isSearching = false
        } label: {
          Image(systemName: "xmark.circle.fill")
            .font(.system(size: 16))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
      }
    }
    .padding(.horizontal, 14)
    .frame(height: 44)
    .background(Color.appInputFilled)
    .clipShape(RoundedRectangle(cornerRadius: 12))
  }

  private func titleGrid(items: [SearchResult]) -> some View {
    LazyVStack(spacing: 12) {
      ForEach(items) { item in
        titleCard(item: item)
      }
    }
    .padding(.horizontal, 20)
    .padding(.vertical, 16)
  }

  private func titleCard(item: SearchResult) -> some View {
    Button {
      let type = item.mediaType ?? "movie"
      selectedTitle = SelectedTitle(
        id: item.id,
        type: type == "tv" ? "tv" : "movie",
        title: item.displayTitle
      )
      withAnimation(.easeInOut(duration: 0.2)) {
        step = .selectImage
      }
    } label: {
      ZStack {
        // Backdrop image
        if let backdropURL = item.hdBackdropURL ?? item.backdropURL {
          CachedAsyncImage(url: backdropURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            Rectangle()
              .fill(Color.appInputFilled)
          }
        } else if let posterURL = item.hdPosterURL ?? item.imageURL {
          CachedAsyncImage(url: posterURL) { image in
            image
              .resizable()
              .aspectRatio(contentMode: .fill)
          } placeholder: {
            Rectangle()
              .fill(Color.appInputFilled)
          }
        } else {
          Rectangle()
            .fill(Color.appInputFilled)
        }

        // Dark overlay
        Color.black.opacity(0.6)

        // Title centered
        Text(item.displayTitle)
          .font(.subheadline.weight(.semibold))
          .foregroundColor(.white)
          .lineLimit(2)
          .multilineTextAlignment(.center)
          .padding(.horizontal, 20)
      }
      .frame(height: 200)
      .clipShape(RoundedRectangle(cornerRadius: 24))
    }
    .buttonStyle(.plain)
  }

  private var loadingGrid: some View {
    LazyVStack(spacing: 12) {
      ForEach(0..<5, id: \.self) { _ in
        RoundedRectangle(cornerRadius: 24)
          .fill(Color.appBorderAdaptive)
          .frame(height: 200)
      }
    }
    .padding(.horizontal, 20)
    .padding(.vertical, 16)
  }

  private var emptyState: some View {
    VStack(spacing: 12) {
      Spacer()
      Image(systemName: "film")
        .font(.system(size: 40))
        .foregroundColor(.appMutedForegroundAdaptive)
      Text(strings.noResults)
        .font(.subheadline)
        .foregroundColor(.appMutedForegroundAdaptive)
      Spacer()
    }
    .frame(maxWidth: .infinity)
    .padding(.top, 60)
  }

  // MARK: - Step 2: Select Image
  private var selectImageStep: some View {
    Group {
      if isLoadingImages {
        VStack {
          Spacer()
          ProgressView()
          Spacer()
        }
      } else if titleImages.isEmpty {
        VStack(spacing: 12) {
          Spacer()
          Image(systemName: "photo.on.rectangle.angled")
            .font(.system(size: 40))
            .foregroundColor(.appMutedForegroundAdaptive)
          Text(strings.noImagesFound)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive)
          Spacer()
        }
        .frame(maxWidth: .infinity)
      } else {
        ScrollView(showsIndicators: false) {
          ImageMasonryView(
            images: titleImages,
            onImageTap: { image in
              selectedImage = image
              loadCropImage(image: image)
              withAnimation(.easeInOut(duration: 0.2)) {
                step = .cropImage
              }
            }
          )
          .padding(.horizontal, 20)
          .padding(.vertical, 16)
        }
      }
    }
    .task(id: selectedTitle) {
      await loadImages()
    }
  }

  // MARK: - Step 3: Crop Image
  private var cropImageStep: some View {
    VStack(spacing: 0) {
      if let cropImage {
        GeometryReader { geo in
          let circleDiameter = min(geo.size.width - 48, geo.size.height - 48, 320)
          let imgAspect = cropImage.size.width / cropImage.size.height
          let fitW = imgAspect > geo.size.width / geo.size.height
          let imgW: CGFloat = fitW ? geo.size.width : geo.size.height * imgAspect
          let imgH: CGFloat = fitW ? geo.size.width / imgAspect : geo.size.height
          let minScale: CGFloat = max(circleDiameter / imgW, circleDiameter / imgH, 1.0)

          ZStack {
            Color.black

            // Dimmed background image
            Image(uiImage: cropImage)
              .resizable()
              .aspectRatio(contentMode: .fit)
              .scaleEffect(cropScale)
              .offset(cropOffset)
              .frame(width: geo.size.width, height: geo.size.height)
              .clipped()
              .opacity(0.3)

            // Visible crop circle
            Image(uiImage: cropImage)
              .resizable()
              .aspectRatio(contentMode: .fit)
              .scaleEffect(cropScale)
              .offset(cropOffset)
              .frame(width: geo.size.width, height: geo.size.height)
              .mask(
                Circle()
                  .frame(width: circleDiameter, height: circleDiameter)
              )

            // Circle border
            Circle()
              .stroke(Color.white, lineWidth: 2)
              .frame(width: circleDiameter, height: circleDiameter)
              .shadow(color: .black.opacity(0.3), radius: 4)
          }
          .frame(width: geo.size.width, height: geo.size.height)
          .contentShape(Rectangle())
          .gesture(
            DragGesture()
              .onChanged { value in
                let raw = CGSize(
                  width: lastOffset.width + value.translation.width,
                  height: lastOffset.height + value.translation.height
                )
                cropOffset = clampOffset(raw, imgW: imgW, imgH: imgH, cropDiameter: circleDiameter)
              }
              .onEnded { _ in
                lastOffset = cropOffset
              }
          )
          .onAppear {
            geoDisplayedWidth = imgW
            geoDisplayedHeight = imgH
            geoCropSize = circleDiameter
            minCropScale = minScale
            if cropScale < minScale {
              cropScale = minScale
              lastScale = minScale
            }
          }
        }

        // Zoom slider
        HStack(spacing: 12) {
          Image(systemName: "minus")
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)

          Slider(value: $cropScale, in: minCropScale...5.0, step: 0.05)
            .tint(.appForegroundAdaptive)
            .onChange(of: cropScale) { _, _ in
              // Re-clamp offset when scale changes
              cropOffset = clampOffset(cropOffset, imgW: geoDisplayedWidth, imgH: geoDisplayedHeight, cropDiameter: geoCropSize)
              lastOffset = cropOffset
            }

          Image(systemName: "plus")
            .font(.system(size: 12, weight: .medium))
            .foregroundColor(.appMutedForegroundAdaptive)
        }
        .padding(.horizontal, 32)
        .padding(.vertical, 12)
      } else {
        Spacer()
        ProgressView()
        Spacer()
      }

      // Error message
      if let saveError {
        Text(saveError)
          .font(.caption)
          .foregroundColor(.appDestructive)
          .padding(.horizontal, 24)
          .padding(.bottom, 8)
      }

      // Save button
      Button {
        Task { await saveCroppedAvatar() }
      } label: {
        HStack(spacing: 8) {
          if isSaving {
            ProgressView()
              .tint(.appBackgroundAdaptive)
          }
          Text(strings.save)
            .font(.system(size: 16, weight: .semibold))
        }
        .foregroundColor(.appBackgroundAdaptive)
        .frame(maxWidth: .infinity)
        .frame(height: 52)
        .background(isSaving ? Color.appForegroundAdaptive.opacity(0.6) : Color.appForegroundAdaptive)
        .cornerRadius(12)
      }
      .disabled(isSaving || cropImage == nil)
      .padding(.horizontal, 24)
      .padding(.bottom, 16)
    }
  }

  // MARK: - Clamp Offset
  /// Prevents the crop circle from going outside the image bounds
  private func clampOffset(_ offset: CGSize, imgW: CGFloat, imgH: CGFloat, cropDiameter: CGFloat) -> CGSize {
    let scaledW = imgW * cropScale
    let scaledH = imgH * cropScale
    let maxX = max(0, (scaledW - cropDiameter) / 2)
    let maxY = max(0, (scaledH - cropDiameter) / 2)
    return CGSize(
      width: min(max(offset.width, -maxX), maxX),
      height: min(max(offset.height, -maxY), maxY)
    )
  }

  // MARK: - Reset Crop
  private func resetCropState() {
    cropOffset = .zero
    cropScale = minCropScale
    lastOffset = .zero
    lastScale = minCropScale
  }

  // MARK: - Load Top Rated
  private func loadTopRated() async {
    guard topRatedMovies.isEmpty else {
      isLoadingList = false
      return
    }
    isLoadingList = true
    do {
      let result = try await TMDBService.shared.getTopRatedMovies(
        language: Language.current.rawValue
      )
      // Filter to only items with backdrop
      topRatedMovies = result.results.filter { $0.backdropPath != nil }
      isLoadingList = false
    } catch {
      isLoadingList = false
    }
  }

  // MARK: - Search
  @MainActor
  private func performSearch(query: String) async {
    guard !query.isEmpty else {
      searchResults = []
      isSearching = false
      return
    }
    isSearching = true
    do {
      let response = try await TMDBService.shared.searchMulti(
        query: query,
        language: Language.current.rawValue
      )
      // Filter to movie/tv with backdrops
      searchResults = response.results.filter {
        ($0.mediaType == "movie" || $0.mediaType == "tv") && $0.backdropPath != nil
      }
    } catch {
      searchResults = []
    }
    isSearching = false
  }

  // MARK: - Load Images
  private func loadImages() async {
    guard let title = selectedTitle else { return }
    isLoadingImages = true
    do {
      let images = try await TMDBService.shared.getImages(
        id: title.id,
        mediaType: title.type
      )
      // Combine backdrops and posters, sorted by vote count
      var allImages = images.sortedBackdrops + images.sortedPosters
      allImages.sort { $0.voteCount > $1.voteCount }
      titleImages = allImages
    } catch {
      titleImages = []
    }
    isLoadingImages = false
  }

  // MARK: - Load Crop Image
  private func loadCropImage(image: TMDBImage) {
    cropImage = nil
    resetCropState()
    Task {
      guard let url = image.fullURL else { return }
      let loaded = await ImageCache.shared.loadImage(from: url, priority: .high)
      await MainActor.run {
        cropImage = loaded
      }
    }
  }

  // MARK: - Save Cropped Avatar
  @MainActor
  private func saveCroppedAvatar() async {
    guard let cropImage else { return }
    isSaving = true
    saveError = nil

    // 1. Render the cropped image (~19ms)
    guard let croppedUIImage = renderCroppedImage(source: cropImage) else {
      saveError = "Failed to crop image"
      isSaving = false
      return
    }

    // 2. Generate a placeholder URL for instant local display
    let timestamp = Int(Date().timeIntervalSince1970)
    let placeholderURLString = "\(API.baseURL)/avatar-pending/\(user.id)-\(timestamp)"

    // 3. Pre-cache with placeholder URL so the avatar shows instantly
    // Keep old avatar in cache so other views don't flash the initial letter
    if let placeholderURL = URL(string: placeholderURLString) {
      ImageCache.shared.setImage(croppedUIImage, for: placeholderURL)
    }

    // 4. Notify all views with the new avatar URL so they update instantly
    onSaved(placeholderURLString)
    NotificationCenter.default.post(
      name: .profileUpdated,
      object: nil,
      userInfo: ["avatarUrl": placeholderURLString]
    )
    dismiss()
    isSaving = false

    // 5. Cancel any previous background upload — only the latest one matters
    Self.backgroundUploadTask?.cancel()

    let image = croppedUIImage
    Self.backgroundUploadTask = Task.detached {
      do {
        // Upload image
        let uploadedURL = try await self.uploadImage(image: image)
        try Task.checkCancellation()

        // Cache at the real URL
        if let realURL = URL(string: uploadedURL) {
          ImageCache.shared.setImage(image, for: realURL)
        }

        // Update backend with the real avatar URL
        _ = try await AuthService.shared.updateUser(avatarUrl: uploadedURL)
        try Task.checkCancellation()

        // Only notify if this is still the latest upload (not cancelled)
        await MainActor.run {
          NotificationCenter.default.post(name: .profileUpdated, object: nil)
        }
      } catch is CancellationError {
        print("ℹ️ [AvatarSave] upload cancelled (newer save started)")
      } catch {
        print("⚠️ [AvatarSave] background upload failed: \(error.localizedDescription)")
      }
    }
  }

  // MARK: - Render Cropped Image
  private func renderCroppedImage(source: UIImage) -> UIImage? {
    let outputSize: CGFloat = 500

    guard let cgSource = source.cgImage else { return nil }

    let imgW = geoDisplayedWidth   // image displayed width at scale 1
    let imgH = geoDisplayedHeight  // image displayed height at scale 1
    let circleDia = geoCropSize    // crop circle diameter in display pts

    guard imgW > 0, imgH > 0, circleDia > 0 else { return nil }

    // Use actual pixel dimensions (CGImage), not UIImage.size which is affected by scale
    let srcW = CGFloat(cgSource.width)
    let srcH = CGFloat(cgSource.height)

    // Pixels per display point at current zoom (aspect-fit keeps ratio uniform)
    let pxPerPt = srcW / (imgW * cropScale)

    // Crop square side in pixels
    let cropPx = circleDia * pxPerPt

    // Crop center in pixel coordinates
    let cx = srcW / 2.0 - cropOffset.width  * pxPerPt
    let cy = srcH / 2.0 - cropOffset.height * pxPerPt

    var rect = CGRect(
      x: cx - cropPx / 2,
      y: cy - cropPx / 2,
      width: cropPx,
      height: cropPx
    )

    // Clamp to pixel bounds
    rect = rect.intersection(CGRect(x: 0, y: 0, width: srcW, height: srcH))
    guard !rect.isEmpty, let cropped = cgSource.cropping(to: rect) else { return nil }

    let format = UIGraphicsImageRendererFormat()
    format.scale = 1.0
    let renderer = UIGraphicsImageRenderer(size: CGSize(width: outputSize, height: outputSize), format: format)
    return renderer.image { _ in
      UIImage(cgImage: cropped).draw(in: CGRect(x: 0, y: 0, width: outputSize, height: outputSize))
    }
  }

  // MARK: - Upload Image
  private func uploadImage(image: UIImage) async throws -> String {
    guard let token = UserDefaults.standard.string(forKey: "token") else {
      throw AuthError.invalidURL
    }

    let timestamp = Int(Date().timeIntervalSince1970)
    guard let url = URL(string: "\(API.baseURL)/image?folder=avatar&fileName=\(user.id)-\(timestamp)") else {
      throw AuthError.invalidURL
    }

    let boundary = UUID().uuidString
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

    guard let imageData = image.jpegData(compressionQuality: 0.7) else {
      throw URLError(.cannotDecodeContentData)
    }
    print("⏱ [AvatarSave] jpeg size: \(imageData.count / 1024)KB")

    var body = Data()
    body.append("--\(boundary)\r\n".data(using: .utf8)!)
    body.append("Content-Disposition: form-data; name=\"file\"; filename=\"avatar.jpg\"\r\n".data(using: .utf8)!)
    body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
    body.append(imageData)
    body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)

    request.httpBody = body

    let (data, response) = try await URLSession.shared.data(for: request)

    guard let http = response as? HTTPURLResponse, http.statusCode == 201 else {
      throw URLError(.badServerResponse)
    }

    struct ImageUploadResponse: Decodable {
      let url: String
    }

    let result = try JSONDecoder().decode(ImageUploadResponse.self, from: data)
    return result.url
  }
}

// MARK: - Debouncer
private class Debouncer: @unchecked Sendable {
  private let delay: TimeInterval
  private var task: Task<Void, Never>?

  init(delay: TimeInterval) {
    self.delay = delay
  }

  func debounce(_ action: @escaping @Sendable () async -> Void) {
    task?.cancel()
    task = Task {
      try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
      guard !Task.isCancelled else { return }
      await action()
    }
  }
}

