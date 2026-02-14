//
//  FeedbackView.swift
//  Plotwist
//

import SwiftUI
import PhotosUI

// MARK: - Feedback Type
enum FeedbackType: String, CaseIterable {
  case bug = "bug"
  case idea = "idea"
  
  func displayName(strings: Strings) -> String {
    switch self {
    case .bug: return strings.feedbackTypeBug
    case .idea: return strings.feedbackTypeIdea
    }
  }
  
  var icon: String {
    switch self {
    case .bug: return "ladybug.fill"
    case .idea: return "lightbulb.fill"
    }
  }
  
  var color: Color {
    switch self {
    case .bug: return .red
    case .idea: return .yellow
    }
  }
}

// MARK: - Feedback View
struct FeedbackView: View {
  let initialType: FeedbackType
  
  @Environment(\.dismiss) private var dismiss
  @State private var strings = L10n.current
  @State private var selectedType: FeedbackType
  @State private var description: String = ""
  @State private var selectedImage: UIImage?
  @State private var showImagePicker = false
  @State private var isSubmitting = false
  @State private var showSuccess = false
  
  init(initialType: FeedbackType = .bug) {
    self.initialType = initialType
    _selectedType = State(initialValue: initialType)
  }
  
  var body: some View {
    ZStack {
      Color.appBackgroundAdaptive.ignoresSafeArea()
      
      VStack(spacing: 0) {
        headerView
        
        ScrollView(showsIndicators: false) {
          VStack(alignment: .leading, spacing: 24) {
            // Type selector
            typeSelector
            
            // Description
            descriptionField
            
            // Screenshot
            screenshotSection
            
            // Submit
            submitButton
          }
          .padding(24)
        }
      }
    }
    .navigationBarHidden(true)
    .onAppear {
      AnalyticsService.shared.track(.feedbackOpen(contextScreen: "settings"))
    }
    .onReceive(NotificationCenter.default.publisher(for: .languageChanged)) { _ in
      strings = L10n.current
    }
  }
  
  // MARK: - Header
  private var headerView: some View {
    VStack(spacing: 0) {
      HStack {
        Button { dismiss() } label: {
          Image(systemName: "chevron.left")
            .font(.system(size: 18, weight: .semibold))
            .foregroundColor(.appForegroundAdaptive)
            .frame(width: 40, height: 40)
            .background(Color.appInputFilled)
            .clipShape(Circle())
        }

        Spacer()

        Text(strings.feedbackTitle)
          .font(.title3.bold())
          .foregroundColor(.appForegroundAdaptive)

        Spacer()

        Color.clear.frame(width: 40, height: 40)
      }
      .padding(.horizontal, 24)
      .padding(.vertical, 16)

      Rectangle()
        .fill(Color.appBorderAdaptive.opacity(0.5))
        .frame(height: 1)
    }
  }
  
  // MARK: - Type Selector
  private var typeSelector: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(strings.feedbackTypeLabel.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      HStack(spacing: 12) {
        ForEach(FeedbackType.allCases, id: \.self) { type in
          Button {
            withAnimation(.easeInOut(duration: 0.2)) {
              selectedType = type
            }
          } label: {
            HStack(spacing: 8) {
              Image(systemName: type.icon)
                .font(.system(size: 14))
                .foregroundColor(selectedType == type ? type.color : .appMutedForegroundAdaptive)
              
              Text(type.displayName(strings: strings))
                .font(.subheadline.weight(.medium))
                .foregroundColor(selectedType == type ? .appForegroundAdaptive : .appMutedForegroundAdaptive)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(
              RoundedRectangle(cornerRadius: 12)
                .fill(selectedType == type ? Color.appInputFilled : Color.clear)
            )
            .overlay(
              RoundedRectangle(cornerRadius: 12)
                .strokeBorder(
                  selectedType == type ? Color.appForegroundAdaptive.opacity(0.3) : Color.appBorderAdaptive,
                  lineWidth: 1
                )
            )
          }
          .buttonStyle(.plain)
        }
      }
    }
  }
  
  // MARK: - Description Field
  private var descriptionField: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(strings.feedbackDescriptionLabel.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      ZStack(alignment: .topLeading) {
        TextEditor(text: $description)
          .font(.subheadline)
          .foregroundColor(.appForegroundAdaptive)
          .scrollContentBackground(.hidden)
          .frame(minHeight: 120)
          .padding(12)
          .background(
            RoundedRectangle(cornerRadius: 12)
              .fill(Color.appInputFilled)
          )
          .overlay(
            RoundedRectangle(cornerRadius: 12)
              .strokeBorder(Color.appBorderAdaptive, lineWidth: 1)
          )
        
        if description.isEmpty {
          Text(strings.feedbackDescriptionPlaceholder)
            .font(.subheadline)
            .foregroundColor(.appMutedForegroundAdaptive.opacity(0.6))
            .padding(.horizontal, 16)
            .padding(.vertical, 20)
            .allowsHitTesting(false)
        }
      }
    }
  }
  
  // MARK: - Screenshot Section
  private var screenshotSection: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text(strings.feedbackScreenshotLabel.uppercased())
        .font(.system(size: 11, weight: .medium))
        .tracking(1.5)
        .foregroundColor(.appMutedForegroundAdaptive)
      
      if let image = selectedImage {
        ZStack(alignment: .topTrailing) {
          Image(uiImage: image)
            .resizable()
            .scaledToFit()
            .frame(maxHeight: 200)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
              RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.appBorderAdaptive, lineWidth: 1)
            )
          
          Button {
            selectedImage = nil
          } label: {
            Image(systemName: "xmark.circle.fill")
              .font(.system(size: 22))
              .foregroundStyle(.white, .black.opacity(0.6))
          }
          .padding(8)
        }
      } else {
        Button {
          showImagePicker = true
        } label: {
          HStack(spacing: 8) {
            Image(systemName: "camera.fill")
              .font(.system(size: 14))
            Text(strings.feedbackAddScreenshot)
              .font(.subheadline.weight(.medium))
          }
          .foregroundColor(.appMutedForegroundAdaptive)
          .frame(maxWidth: .infinity)
          .padding(.vertical, 14)
          .overlay(
            RoundedRectangle(cornerRadius: 12)
              .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6, 3]))
              .foregroundColor(.appBorderAdaptive)
          )
        }
        .buttonStyle(.plain)
      }
    }
    .sheet(isPresented: $showImagePicker) {
      ImagePicker(image: $selectedImage)
    }
  }
  
  // MARK: - Submit Button
  private var submitButton: some View {
    Button {
      submitFeedback()
    } label: {
      HStack(spacing: 8) {
        if isSubmitting {
          ProgressView()
            .tint(.appBackgroundAdaptive)
        }
        Text(strings.feedbackSubmit)
          .font(.system(size: 16, weight: .semibold))
      }
      .foregroundColor(.appBackgroundAdaptive)
      .frame(maxWidth: .infinity)
      .frame(height: 52)
      .background(
        RoundedRectangle(cornerRadius: 12)
          .fill(description.isEmpty ? Color.appMutedForegroundAdaptive : Color.appForegroundAdaptive)
      )
    }
    .disabled(description.isEmpty || isSubmitting)
    .buttonStyle(.plain)
    .alert(strings.feedbackSubmitSuccess, isPresented: $showSuccess) {
      Button("OK") {
        dismiss()
      }
    }
  }
  
  // MARK: - Submit
  private func submitFeedback() {
    isSubmitting = true
    
    AnalyticsService.shared.track(.feedbackSubmit(type: selectedType.rawValue))
    
    // For MVP: store feedback locally and show confirmation
    // Later: send to backend or PostHog survey
    let feedback: [String: Any] = [
      "type": selectedType.rawValue,
      "description": description,
      "has_screenshot": selectedImage != nil,
      "timestamp": ISO8601DateFormatter().string(from: Date()),
      "app_version": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "unknown",
      "device": UIDevice.current.systemVersion
    ]
    
    // Save to UserDefaults as array of feedback items
    var existingFeedback = UserDefaults.standard.array(forKey: "pendingFeedback") as? [[String: Any]] ?? []
    existingFeedback.append(feedback)
    UserDefaults.standard.set(existingFeedback, forKey: "pendingFeedback")
    
    isSubmitting = false
    showSuccess = true
  }
}

// MARK: - Image Picker (UIKit wrapper)
struct ImagePicker: UIViewControllerRepresentable {
  @Binding var image: UIImage?
  @Environment(\.dismiss) private var dismiss
  
  func makeUIViewController(context: Context) -> UIImagePickerController {
    let picker = UIImagePickerController()
    picker.delegate = context.coordinator
    picker.sourceType = .photoLibrary
    return picker
  }
  
  func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
  
  func makeCoordinator() -> Coordinator {
    Coordinator(self)
  }
  
  class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    let parent: ImagePicker
    
    init(_ parent: ImagePicker) {
      self.parent = parent
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
      if let uiImage = info[.originalImage] as? UIImage {
        parent.image = uiImage
      }
      parent.dismiss()
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
      parent.dismiss()
    }
  }
}

#Preview {
  FeedbackView(initialType: .bug)
}
