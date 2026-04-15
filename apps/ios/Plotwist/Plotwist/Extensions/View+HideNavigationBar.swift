//
//  View+HideNavigationBar.swift
//  Plotwist
//

import SwiftUI
import UIKit

/// Ensures the native UIKit navigation bar is fully hidden, even when the parent
/// NavigationStack has `.searchable` which can prevent SwiftUI's `.toolbar(.hidden)` from working.
struct ForceHideNavigationBar: UIViewControllerRepresentable {
  func makeUIViewController(context: Context) -> ForceHideNavBarController {
    ForceHideNavBarController()
  }

  func updateUIViewController(_ controller: ForceHideNavBarController, context: Context) {}
}

class ForceHideNavBarController: UIViewController {
  override func viewWillAppear(_ animated: Bool) {
    super.viewWillAppear(animated)
    navigationController?.setNavigationBarHidden(true, animated: false)
  }

  override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    navigationController?.setNavigationBarHidden(false, animated: false)
  }
}
