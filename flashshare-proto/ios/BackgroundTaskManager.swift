import UIKit

@objc(BackgroundTaskManager)
class BackgroundTaskManager: NSObject {

  private var backgroundTask: UIBackgroundTaskIdentifier = .invalid

  @objc
  func startBackgroundTask() {
    DispatchQueue.main.async {
      self.backgroundTask = UIApplication.shared.beginBackgroundTask {
        // Expiration handler
        self.endBackgroundTask()
      }
    }
  }

  @objc
  func endBackgroundTask() {
    if backgroundTask != .invalid {
      UIApplication.shared.endBackgroundTask(backgroundTask)
      backgroundTask = .invalid
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
