import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Use this method to optionally configure and attach the UIWindow `window` to the provided UIWindowScene `scene`.
        // If using a storyboard, the `window` property will automatically be set and attached to the scene.
        // This delegate does not imply the connecting scene or session are new (see `application:configurationForConnectingSceneSession` instead).
        guard let windowScene = (scene as? UIWindowScene) else {
            AppLogger.error("[SceneDelegate] Не удалось получить UIWindowScene")
            return
        }

        AppLogger.log("[SceneDelegate] willConnectTo вызван")

        // Создаём window явно для надёжности
        window = UIWindow(windowScene: windowScene)
        window?.backgroundColor = .systemBackground

        // Загружаем главный view controller из storyboard
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        guard let initialViewController = storyboard.instantiateInitialViewController() else {
            AppLogger.error("[SceneDelegate] Не удалось загрузить initial view controller из Main.storyboard")
            let fallback = UIViewController()
            fallback.view.backgroundColor = .systemBackground
            let label = UILabel()
            label.text = "Не удалось загрузить интерфейс"
            label.textAlignment = .center
            label.textColor = .label
            label.numberOfLines = 0
            fallback.view.addSubview(label)
            label.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                label.centerXAnchor.constraint(equalTo: fallback.view.centerXAnchor),
                label.centerYAnchor.constraint(equalTo: fallback.view.centerYAnchor),
                label.leadingAnchor.constraint(greaterThanOrEqualTo: fallback.view.leadingAnchor, constant: 20),
                label.trailingAnchor.constraint(lessThanOrEqualTo: fallback.view.trailingAnchor, constant: -20)
            ])
            window?.rootViewController = fallback
            window?.makeKeyAndVisible()
            return
        }

        AppLogger.log("[SceneDelegate] Initial view controller загружен: \(type(of: initialViewController))")

        // Если нужен NavigationController, оборачиваем в него
        if !(initialViewController is UINavigationController) {
            let navigationController = UINavigationController(rootViewController: initialViewController)
            window?.rootViewController = navigationController
            AppLogger.log("[SceneDelegate] View controller обёрнут в NavigationController")
        } else {
            window?.rootViewController = initialViewController
        }

        window?.makeKeyAndVisible()
        AppLogger.log("[SceneDelegate] Window создан и отображён")
    }

    func sceneDidDisconnect(_ scene: UIScene) {
        // Called as the scene is being released by the system.
        // This occurs shortly after the scene enters the background, or when its session is discarded.
        // Release any resources associated with this scene that can be re-created the next time the scene connects.
        // The scene may re-connect later, as its session was not necessarily discarded (see `application:didDiscardSceneSessions` instead).
        AppLogger.log("[SceneDelegate] sceneDidDisconnect")
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        // Called when the scene has moved from an inactive state to an active state.
        // Use this method to restart any tasks that were paused (or not yet started) when the scene was inactive.
        AppLogger.log("[SceneDelegate] sceneDidBecomeActive")
    }

    func sceneWillResignActive(_ scene: UIScene) {
        // Called when the scene will move from an active state to an inactive state.
        // This may occur due to temporary interruptions (ex. an incoming phone call).
        AppLogger.log("[SceneDelegate] sceneWillResignActive")
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Called as the scene transitions from the background to the foreground.
        // Use this method to undo the changes made on entering the background.
        AppLogger.log("[SceneDelegate] sceneWillEnterForeground")
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        // Called as the scene transitions from the foreground to the background.
        // Use this method to save data, release shared resources, and store enough scene-specific state information
        // to restore the scene back to its current state.
        AppLogger.log("[SceneDelegate] sceneDidEnterBackground")
    }
}



