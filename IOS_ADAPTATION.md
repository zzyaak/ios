# План переноса Android-приложения "Проскомидия" на iOS

## 1) Ответы на уточняющие вопросы (по анализу Android-версии)
- **Функции**: одноэкранное приложение на `WebView` с офлайн HTML (`index.html`) и мобильными правками (`mobile_enhancements.js`). Есть тулбар с кнопками Назад/Вперед/Домой/Обновить и прогресс-баром. Видео/аудио потоков, чата, донатов, авторизации нет.
- **Стримы/DRM**: не используются; контент статический/формы.
- **Фоновые режимы/AirPlay**: не нужны.
- **Расписание/уведомления**: нет отдельных экранов, только форма подачи записок. Push-уведомлений и напоминаний нет.
- **Каталог/поиск**: нет; две формы (о здравии, об упокоении) с динамическим количеством имён.
- **Авторизация/профиль**: отсутствуют.
- **Настройки**: нет пользовательских настроек.
- **Сети**: главное — загрузка локального HTML из бандла, запасной вариант — загрузка с `https://proskomidiya.ru` при отсутствии файла. Разрешены mixed content и слабые SSL в Android-клиенте (для совместимости).
- **Монетизация**: нет платежей/IAP; итоговая сумма только отображается alert'ом.
- **Дизайн/брендинг**: фирменные цвета (золото/беж/бордо), шрифт Georgia; адаптив под телефон, toolbar с названием и подзаголовком.
- **Минимальные версии**: Android 31 (target), явного minSdk не видно; для iOS целимся на iOS 15+ (SwiftUI/modern WebKit).
- **Улучшения**: можно добавить более нативный опыт (share, открыть внешние ссылки в `SFSafariViewController`, pull-to-refresh, сохранение заполненных имён локально).

## 2) Краткое ТЗ на iOS-версию
- Повторить Android-логику: открыть локальный HTML из бандла, при ошибке — грузить `https://proskomidiya.ru`.
- Экран с `WKWebView`, индикатор прогресса, кнопки Назад/Вперёд/Домой/Обновить.
- Офлайн-режим: `index.html` внутри бандла, доступ к `mobile_enhancements.js`.
- Обработка внешних ссылок: разрешать только proskomidiya.ru и локальные файлы; остальное — в системном браузере.
- Тематическое оформление, поддержка iPhone/iPad, русская локализация.

## 3) Архитектура и стек
- **Подход**: UIKit + MVVM (легковесно) вокруг одного экрана WebView.
- **UI**: `WKWebView` внутри `UIViewController`, `UIProgressView`, `UIRefreshControl`, `UIToolbar` / кастомный bar.
- **Сеть**: `WKNavigationDelegate` + `URLSession` для проверки наличия локального файла. Дополнительно — `NWPathMonitor` для статуса сети (опционально).
- **Хранение**: локальный HTML в bundle; можно кэшировать последние введённые имена в `UserDefaults` (необязательно).
- **Локализация**: `Localizable.strings` (ru, en при необходимости).
- **Минимальная iOS**: 15.0.

## 4) Структура экранов и сценарии
- **Главный экран (WebView)**: загрузка локального `index.html`, прогресс-бар, pull-to-refresh, кнопки навигации. Alert при ошибках загрузки или при попытке открыть внешние ссылки.
- **Внешние ссылки**: открываются в `SFSafariViewController` (или `UIApplication.shared.open`).
- **Нет дополнительных экранов**: расписания, профиля, настроек нет по исходнику; можно позже добавить сохранение черновиков имён/темную тему.

## 5) Структура iOS-проекта (предлагаемая)
```
Proskomidiya/
 ├─ App/
 │   ├─ AppDelegate.swift
 │   ├─ SceneDelegate.swift
 │   └─ ApplicationFlow.swift        # Точка запуска, DI, конфигурация WebView
 ├─ Presentation/
 │   ├─ Web/
 │   │   ├─ WebViewController.swift # UI + toolbar + refresh + прогресс
 │   │   └─ WebViewModel.swift      # Решение, какую URL/HTML грузить
 │   └─ Components/
 │       └─ Controls.swift          # Кнопки тулбара/прогресса
 ├─ Resources/
 │   ├─ index.html
 │   ├─ mobile_enhancements.js
 │   ├─ Assets.xcassets (AppIcon, цвета)
 │   └─ LaunchScreen.storyboard / SwiftUI Launch Screen
 ├─ Supporting/
 │   ├─ Info.plist
 │   └─ Config.xcconfig (bundle id, web URL)
```

## 6) Примеры кода
### Точка входа (SceneDelegate)
```swift
import UIKit
import WebKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication,
                     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }
}

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene,
               willConnectTo session: UISceneSession,
               options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: windowScene)
        window.rootViewController = UINavigationController(rootViewController: WebViewController())
        window.makeKeyAndVisible()
        self.window = window
    }
}
```

### Навигационный контейнер + ViewModel
```swift
final class WebViewModel {
    private let allowedHosts = ["proskomidiya.ru", "www.proskomidiya.ru", "127.0.0.1", "localhost"]
    let remoteURL = URL(string: "https://proskomidiya.ru")!

    func initialRequest() -> URLRequest {
        if let localURL = Bundle.main.url(forResource: "index", withExtension: "html") {
            return URLRequest(url: localURL)
        }
        return URLRequest(url: remoteURL)
    }

    func shouldAllow(_ url: URL) -> Bool {
        guard let host = url.host else { return true }
        return allowedHosts.contains(where: { host.hasSuffix($0) })
    }
}
```

### Экран с WebView
```swift
final class WebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private let webView = WKWebView(frame: .zero, configuration: WKWebViewConfiguration())
    private let progress = UIProgressView(progressViewStyle: .bar)
    private let viewModel = WebViewModel()
    private lazy var refreshControl = UIRefreshControl()

    override func viewDidLoad() {
        super.viewDidLoad()
        title = NSLocalizedString("Проскомидия", comment: "")
        view.backgroundColor = UIColor(named: "Background") ?? .systemBackground
        setupToolbar()
        setupWebView()
        loadInitialContent()
    }

    private func setupWebView() {
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.refreshControl = refreshControl
        refreshControl.addTarget(self, action: #selector(reload), for: .valueChanged)
        webView.addObserver(self, forKeyPath: #"estimatedProgress", options: .new, context: nil)
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
    }

    private func setupToolbar() {
        progress.translatesAutoresizingMaskIntoConstraints = false
        navigationItem.titleView = progress
        let back = UIBarButtonItem(systemItem: .rewind, primaryAction: UIAction { [weak self] _ in
            self?.webView.goBack()
        })
        let forward = UIBarButtonItem(systemItem: .fastForward, primaryAction: UIAction { [weak self] _ in
            self?.webView.goForward()
        })
        let home = UIBarButtonItem(systemItem: .refresh, primaryAction: UIAction { [weak self] _ in
            self?.loadInitialContent()
        })
        let reload = UIBarButtonItem(systemItem: .play, primaryAction: UIAction { [weak self] _ in
            self?.reload()
        })
        navigationItem.rightBarButtonItems = [reload, home, forward, back]
    }

    private func loadInitialContent() {
        webView.load(viewModel.initialRequest())
    }

    @objc private func reload() {
        webView.reload()
    }

    override func observeValue(forKeyPath keyPath: String?, of object: Any?, change: [NSKeyValueChangeKey : Any]?, context: UnsafeMutableRawPointer?) {
        if keyPath == #"estimatedProgress" {
            progress.setProgress(Float(webView.estimatedProgress), animated: true)
            progress.isHidden = webView.estimatedProgress >= 1.0
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if viewModel.shouldAllow(url) {
            decisionHandler(.allow)
        } else {
            presentExternal(url)
            decisionHandler(.cancel)
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        refreshControl.endRefreshing()
    }

    private func presentExternal(_ url: URL) {
        let safari = SFSafariViewController(url: url)
        present(safari, animated: true)
    }
}
```

### Работа с локальными ресурсами/стримингом
- Локальный `index.html` и `mobile_enhancements.js` добавляются в Target Membership (`Copy Bundle Resources`).
- Для загрузки JS после старта можно вызвать `webView.evaluateJavaScript` при `didFinish`.

### Иконка и Launch Screen
- Добавить ассеты в `Assets.xcassets/AppIcon.appiconset`.
- `LaunchScreen.storyboard` с фоном `#f8f4e8` и логотипом монастыря (PDF 1x/2x/3x).

## 7) Инструкции по настройке и запуску
1. Открыть `Proskomidiya.xcodeproj` в Xcode 15+.
2. В `Signing & Capabilities` задать `Bundle Identifier` (например, `ru.proskomidiya.app`), выбрать команду разработчика.
3. Убедиться, что `Deployment Target` ≥ iOS 15.0.
4. Добавить `index.html` и `mobile_enhancements.js` в проект через Xcode с включённым Target Membership.
5. Для симулятора выбрать любое устройство и запустить (⌘+R). Для реального устройства — подключить, выбрать девайс, убедиться в наличии provisioning profile.
6. Проверить, что внешние ссылки открываются в Safari, а локальный HTML грузится без сети.

## 8) Рекомендации по оптимизации и стабильности
- Включить `WKWebView` `allowsInlineMediaPlayback` только при необходимости; сейчас мультимедиа нет.
- Кэш Safari оставить по умолчанию; при слабом интернете использовать локальный HTML как fallback.
- Добавить обработку `NWPathMonitor` для показа баннера "нет сети" и автопереключения на офлайн.
- Сохранять введённые имена в `UserDefaults` и восстанавливать при новой загрузке страницы (через JS bridge) — повысит UX.
- Лимитировать `evaluateJavaScript` вызовы, избегая циклических перезапусков.

## 9) Чек-лист перед публикацией в App Store
- App Icon: 1024x1024 (без альфа), настроена AppIcon.appiconset.
- Launch Screen: статичное изображение/фон.
- Privacy: в `Info.plist` добавить `NSAppTransportSecurity` с `NSAllowsArbitraryLoads` = false; для `proskomidiya.ru` — `NSExceptionDomains` при необходимости HTTP. Нет запросов камеры/микрофона — лишние ключи не добавлять.
- Localization: RU как основной язык, при необходимости EN.
- Screenshots: 6.7", 6.5", 5.5", 12.9" (если поддерживаем iPad).
- Build settings: правильный `Bundle ID`, `Version`/`Build`, `Deployment Target 15+`.
- Testing: проверка на реальном устройстве без сети (офлайн), с сетью, открытие внешних ссылок.
- App Store Connect: заполнить описание, ключевые слова, поддержку, политику конфиденциальности (ссылка на сайт).
