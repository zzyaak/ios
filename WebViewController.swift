import UIKit
import WebKit

class WebViewController: UIViewController {
    
    @IBOutlet weak var webView: WKWebView!
    @IBOutlet weak var progressView: UIProgressView!
    @IBOutlet weak var toolbar: UIToolbar!
    @IBOutlet weak var backButton: UIBarButtonItem!
    @IBOutlet weak var forwardButton: UIBarButtonItem!
    @IBOutlet weak var refreshButton: UIBarButtonItem!
    @IBOutlet weak var homeButton: UIBarButtonItem!
    
    private var webURL = "https://proskomidiya.ru"
    private let localHTMLFileName = "index"
    private let localHTMLFileExtension = "html"
    private lazy var mobileEnhancementScript: String? = loadEnhancementScript()
    private var estimatedProgressObserver: NSKeyValueObservation?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Устанавливаем цвет фона view
        view.backgroundColor = UIColor.systemBackground
        
        // Проверяем, что outlets подключены
        guard webView != nil else {
            print("❌ ОШИБКА: webView outlet не подключен!")
            return
        }
        
        print("✅ WebViewController загружен, webView доступен")
        
        setupWebView()
        setupNavigationBar()
        setupToolbar()
        loadLocalOrRemote()
        setupProgressObserver()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        print("✅ WebViewController viewDidAppear вызван")
        
        // Убеждаемся, что view видима
        view.isHidden = false
        view.alpha = 1.0
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        // Показываем toolbar, если NavigationController доступен
        if let navigationController = navigationController {
            navigationController.setToolbarHidden(false, animated: animated)
            navigationController.isToolbarHidden = false
            print("✅ Toolbar показан")
        } else {
            print("⚠️ NavigationController недоступен, toolbar не показан")
        }
    }
    
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        navigationController?.setToolbarHidden(true, animated: animated)
    }
    
    // MARK: - Setup Methods
    
    private func setupWebView() {
        guard let webView = webView else {
            print("❌ ОШИБКА: webView равен nil при настройке!")
            return
        }
        
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.allowsLinkPreview = false
        
        // Устанавливаем цвет фона WebView
        webView.backgroundColor = UIColor.systemBackground
        webView.isOpaque = false
        
        // JavaScript включен по умолчанию в WKWebView (iOS 14+)
        // Для явного контроля используйте decidePolicyFor navigationAction:preferences:decisionHandler:
        // с WKWebpagePreferences.allowsContentJavaScript
        
        // User agent
        webView.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
        
        print("✅ WebView настроен успешно")
    }
    
    private func setupNavigationBar() {
        title = "Проскомидия"
        
        // Set navigation bar appearance
        if #available(iOS 15.0, *) {
            let appearance = UINavigationBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = UIColor(red: 0.545, green: 0.271, blue: 0.075, alpha: 1.0) // Primary color
            appearance.titleTextAttributes = [.foregroundColor: UIColor.white]
            appearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
            
            navigationController?.navigationBar.standardAppearance = appearance
            navigationController?.navigationBar.scrollEdgeAppearance = appearance
            navigationController?.navigationBar.compactAppearance = appearance
        } else {
            navigationController?.navigationBar.barTintColor = UIColor(red: 0.545, green: 0.271, blue: 0.075, alpha: 1.0)
            navigationController?.navigationBar.titleTextAttributes = [.foregroundColor: UIColor.white]
        }
        
        navigationController?.navigationBar.tintColor = UIColor.white
        navigationController?.navigationBar.isTranslucent = false
        
        // Add refresh button to navigation bar
        let refreshBarButton = UIBarButtonItem(
            image: UIImage(systemName: "arrow.clockwise"),
            style: .plain,
            target: self,
            action: #selector(refreshButtonTapped)
        )
        navigationItem.rightBarButtonItem = refreshBarButton
    }
    
    private func setupToolbar() {
        toolbar.barTintColor = UIColor(red: 0.545, green: 0.271, blue: 0.075, alpha: 1.0)
        toolbar.tintColor = UIColor.white
        toolbar.isTranslucent = false
        
        // Set button images
        backButton.image = UIImage(systemName: "chevron.left")
        forwardButton.image = UIImage(systemName: "chevron.right")
        refreshButton.image = UIImage(systemName: "arrow.clockwise")
        homeButton.image = UIImage(systemName: "house")
        
        updateToolbarButtons()
    }
    
    private func loadLocalOrRemote() {
        guard let webView = webView else {
            print("❌ ОШИБКА: webView равен nil при загрузке!")
            return
        }
        
        // Пытаемся загрузить локальный HTML из Bundle
        if let htmlPath = Bundle.main.path(forResource: localHTMLFileName, ofType: localHTMLFileExtension),
           let htmlString = try? String(contentsOfFile: htmlPath, encoding: .utf8) {
            // Загружаем локальный HTML
            let baseURL = URL(fileURLWithPath: Bundle.main.bundlePath)
            webView.loadHTMLString(htmlString, baseURL: baseURL)
            print("✅ Загружен локальный HTML из Bundle")
        } else {
            // Если локальный файл не найден, загружаем из интернета
            print("⚠️ Локальный HTML не найден, загружаем из интернета")
            loadWebsite()
        }
    }
    
    private func loadWebsite() {
        guard let url = URL(string: webURL) else {
            showErrorAlert(message: "Неверный URL")
            return
        }
        
        var request = URLRequest(url: url)
        request.cachePolicy = .returnCacheDataElseLoad
        request.timeoutInterval = 30.0
        
        webView.load(request)
    }

    private func loadEnhancementScript() -> String? {
        guard let url = Bundle.main.url(forResource: "mobile_enhancements", withExtension: "js") else {
            print("⚠️ Файл mobile_enhancements.js не найден в Bundle")
            return nil
        }

        do {
            return try String(contentsOf: url, encoding: .utf8)
        } catch {
            print("⚠️ Не удалось загрузить mobile_enhancements.js: \(error)")
            return nil
        }
    }
    
    private func setupProgressObserver() {
        estimatedProgressObserver = webView.observe(\.estimatedProgress, options: [.new]) { [weak self] webView, _ in
            self?.progressView.progress = Float(webView.estimatedProgress)
            self?.progressView.isHidden = webView.estimatedProgress == 1.0
        }
    }
    
    // MARK: - Actions
    
    @IBAction func backButtonTapped(_ sender: UIBarButtonItem) {
        if webView.canGoBack {
            webView.goBack()
        }
    }
    
    @IBAction func forwardButtonTapped(_ sender: UIBarButtonItem) {
        if webView.canGoForward {
            webView.goForward()
        }
    }
    
    @IBAction func refreshButtonTapped(_ sender: UIBarButtonItem) {
        webView.reload()
    }
    
    @IBAction func homeButtonTapped(_ sender: UIBarButtonItem) {
        // Сбрасываем на главную страницу
        loadLocalOrRemote()
    }
    
    // MARK: - Helper Methods
    
    private func updateToolbarButtons() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            self.backButton.isEnabled = self.webView.canGoBack
            self.forwardButton.isEnabled = self.webView.canGoForward
        }
    }
    
    private func showErrorAlert(message: String) {
        let alert = UIAlertController(title: "Ошибка", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// MARK: - WKNavigationDelegate

extension WebViewController: WKNavigationDelegate {
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        progressView.isHidden = false
        progressView.progress = 0.0
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        progressView.isHidden = true
        updateToolbarButtons()

        // Обновляем кнопки тулбара периодически
        DispatchQueue.main.async { [weak self] in
            self?.updateToolbarButtons()
        }

        injectMobileEnhancements()
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        progressView.isHidden = true
        updateToolbarButtons()
        
        let nsError = error as NSError
        // Не показываем ошибку для отменённых запросов
        if nsError.domain == NSURLErrorDomain && nsError.code == NSURLErrorCancelled {
            return
        }
        
        // Попробуем загрузить локальный HTML при ошибке сети
        if nsError.domain == NSURLErrorDomain && 
           (nsError.code == NSURLErrorNotConnectedToInternet || 
            nsError.code == NSURLErrorTimedOut ||
            nsError.code == NSURLErrorNetworkConnectionLost) {
            if let htmlPath = Bundle.main.path(forResource: localHTMLFileName, ofType: localHTMLFileExtension),
               let htmlString = try? String(contentsOfFile: htmlPath, encoding: .utf8) {
                let baseURL = URL(fileURLWithPath: Bundle.main.bundlePath)
                webView.loadHTMLString(htmlString, baseURL: baseURL)
                print("✅ Переключено на локальный HTML из-за ошибки сети")
                return
            }
        }
        
        showErrorAlert(message: "Ошибка загрузки: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        progressView.isHidden = true
        updateToolbarButtons()
        
        let nsError = error as NSError
        // Не показываем ошибку для отменённых запросов
        if nsError.domain == NSURLErrorDomain && nsError.code == NSURLErrorCancelled {
            return
        }
        
        // Попробуем загрузить локальный HTML при ошибке сети
        if nsError.domain == NSURLErrorDomain && 
           (nsError.code == NSURLErrorNotConnectedToInternet || 
            nsError.code == NSURLErrorTimedOut ||
            nsError.code == NSURLErrorNetworkConnectionLost) {
            if let htmlPath = Bundle.main.path(forResource: localHTMLFileName, ofType: localHTMLFileExtension),
               let htmlString = try? String(contentsOfFile: htmlPath, encoding: .utf8) {
                let baseURL = URL(fileURLWithPath: Bundle.main.bundlePath)
                webView.loadHTMLString(htmlString, baseURL: baseURL)
                print("✅ Переключено на локальный HTML из-за ошибки сети")
                return
            }
        }
        
        showErrorAlert(message: "Ошибка загрузки: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.cancel)
            return
        }
        
        // JavaScript включен по умолчанию в WKWebView
        // Для iOS 14+ можно использовать decidePolicyFor navigationAction:preferences:decisionHandler:
        // если нужен явный контроль над JavaScript
        
        // Разрешаем навигацию на основной сайт и его поддомены
        if let host = url.host {
            if host.contains("proskomidiya.ru") || 
               host.contains("same-assets.com") ||
               host.contains("localhost") ||
               url.scheme == "file" {
                decisionHandler(.allow)
                return
            }
        }
        
        // Внешние HTTP/HTTPS ссылки открываем в Safari
        if url.scheme == "http" || url.scheme == "https" {
            if #available(iOS 10.0, *) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            } else {
                UIApplication.shared.openURL(url)
            }
            decisionHandler(.cancel)
            return
        }
        
        // Для других схем (tel:, mailto:, etc.) разрешаем
        decisionHandler(.allow)
    }
}

// MARK: - Mobile Enhancements

private extension WebViewController {
    func injectMobileEnhancements() {
        guard let script = mobileEnhancementScript, !script.isEmpty else {
            return
        }

        webView.evaluateJavaScript(script) { result, error in
            if let error {
                print("⚠️ Ошибка применения мобильных улучшений: \(error)")
                return
            }

            if let result = result {
                print("✅ Мобильные улучшения применены: \(result)")
            } else {
                print("✅ Мобильные улучшения применены")
            }
        }
    }
}

// MARK: - WKUIDelegate

extension WebViewController: WKUIDelegate {
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }
    
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler()
        })
        present(alert, animated: true)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler(true)
        })
        alert.addAction(UIAlertAction(title: "Отмена", style: .cancel) { _ in
            completionHandler(false)
        })
        present(alert, animated: true)
    }
}



