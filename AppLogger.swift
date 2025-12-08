import Foundation
import os

enum AppLogger {
    private static let subsystem = Bundle.main.bundleIdentifier ?? "com.proskomidiya.app"
    private static let logger = Logger(subsystem: subsystem, category: "App")

    static func log(_ message: String) {
        print("🪵 " + message)
        logger.log("\(message)")
    }

    static func error(_ message: String) {
        print("❌ " + message)
        logger.error("\(message)")
    }
}
