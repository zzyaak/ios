package com.proskomidiya

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.ConsoleMessage
import android.webkit.WebChromeClient
import android.webkit.SslErrorHandler
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebResourceResponse
import android.net.http.SslError
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.isVisible
import com.proskomidiya.databinding.ActivityMainBinding
import kotlin.math.roundToInt
import java.io.IOException
import java.util.Locale

class MainActivity : AppCompatActivity() {
    
    private lateinit var binding: ActivityMainBinding
    private var retainedWebViewClient: WebViewClient? = null
    private var retainedChromeClient: WebChromeClient? = null
    private val enhancementScript: String by lazy { loadEnhancementScript() }
    private var retryCount = 0
    private val maxRetries = 3
    
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureSystemBars()
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayShowTitleEnabled(false)
        
        setupWebView()
        setupSwipeRefresh()
        setupToolbar()
        setupBackPressHandler()
    }
    
    private fun setupWebView() {
        binding.progressBar.apply {
            isIndeterminate = false
            setProgressCompat(0, false)
            isVisible = true
        }

        binding.webView.apply {
            retainedWebViewClient = createWebViewClient().also { client ->
                webViewClient = client
            }
            retainedChromeClient = createWebChromeClient().also { chrome ->
                webChromeClient = chrome
            }

            val metrics = resources.displayMetrics
            val scaledDensity = metrics.scaledDensity.coerceAtLeast(1f)
            val density = metrics.density.coerceAtLeast(1f)
            val fontScale = resources.configuration.fontScale.coerceAtLeast(1f)
            val computedTextZoom = (
                100 * fontScale * (scaledDensity / density) * 1.15f
            ).roundToInt().coerceIn(130, 180)
            
            settings.apply {
                // Основные настройки
                @Suppress("SetJavaScriptEnabled")
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true  // Разрешаем доступ к файлам для локальных assets
                allowContentAccess = true  // Разрешаем доступ к контенту
                
                // Мобильная адаптация - критически важно для правильного масштабирования
                loadWithOverviewMode = true
                useWideViewPort = true
                layoutAlgorithm = WebSettings.LayoutAlgorithm.TEXT_AUTOSIZING
                
                // Масштабирование - исправленные настройки
                setSupportZoom(true)
                displayZoomControls = false
                builtInZoomControls = false // Отключаем встроенные контролы для избежания конфликтов

                // Текстовый размер - увеличен для лучшей читаемости
                textZoom = computedTextZoom
                minimumFontSize = 16
                minimumLogicalFontSize = 14
                defaultFontSize = 18
                defaultTextEncodingName = "UTF-8"
                
                // Производительность
                cacheMode = WebSettings.LOAD_DEFAULT
                mediaPlaybackRequiresUserGesture = false
                
                // Смешанный контент
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

                // Дополнительные оптимизации
                blockNetworkLoads = false
                blockNetworkImage = false
                
                // Критически важно для загрузки страниц
                loadsImagesAutomatically = true
                setRenderPriority(WebSettings.RenderPriority.HIGH)
            }
            
            val userAgent = settings.userAgentString
            settings.userAgentString = userAgent.replace("Mobile", "").trim() + 
                " Mobile Android " + android.os.Build.VERSION.RELEASE
            
            setBackgroundColor(Color.parseColor("#f8f4e8"))
            overScrollMode = View.OVER_SCROLL_NEVER
            isScrollbarFadingEnabled = true

            // Убираем setInitialScale - он может вызывать проблемы с масштабированием
            // WebView сам правильно масштабирует контент на основе viewport meta тега

            clearCache(true)
            clearHistory()
            
            // Пытаемся загрузить из локальных assets, если не получается - из интернета
            loadLocalOrRemote()
        }
    }
    
    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.apply {
            setOnRefreshListener {
                binding.webView.reload()
            }
            setProgressBackgroundColorSchemeColor(
                ContextCompat.getColor(this@MainActivity, R.color.navigation_card_bg)
            )
            setColorSchemeColors(
                ContextCompat.getColor(this@MainActivity, R.color.primary_color),
                ContextCompat.getColor(this@MainActivity, R.color.accent_color),
                ContextCompat.getColor(this@MainActivity, R.color.primary_dark)
            )
        }
    }
    
    private fun setupToolbar() {
        binding.toolbar.apply {
            title = getString(R.string.app_name)
            subtitle = getString(R.string.app_subtitle)
            navigationIcon?.setTint(ContextCompat.getColor(this@MainActivity, android.R.color.white))
            setNavigationOnClickListener {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    finish()
                }
            }
        }
        
        binding.backButton.setOnClickListener {
            if (binding.webView.canGoBack()) {
                binding.webView.goBack()
            }
        }
        
        binding.forwardButton.setOnClickListener {
            if (binding.webView.canGoForward()) {
                binding.webView.goForward()
            }
        }
        
        binding.homeButton.setOnClickListener {
            loadLocalOrRemote()
        }
        
        binding.refreshButton.setOnClickListener {
            binding.webView.reload()
        }

        updateNavigationButtons()
    }
    
    private fun createWebViewClient(): WebViewClient {
        return object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean = handleExternalNavigation(request?.url)

            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean =
                handleExternalNavigation(url?.let(Uri::parse))
            
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.apply {
                    isVisible = true
                    setProgressCompat(12, false)
                }
                binding.swipeRefreshLayout.isRefreshing = false
                updateNavigationButtons()
            }
            
            override fun onPageCommitVisible(view: WebView?, url: String?) {
                super.onPageCommitVisible(view, url)
                view?.scheduleEnhancements(250)
            }
            
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.isVisible = false
                binding.swipeRefreshLayout.isRefreshing = false
                updateNavigationButtons()
                
                // Сбрасываем счётчик попыток при успешной загрузке
                retryCount = 0
                
                view?.scheduleEnhancements(150, 650)
            }
            
            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                // НЕ вызываем super - это предотвращает показ стандартной страницы ошибки
                val errorCode = error?.errorCode ?: -1
                val errorDescription = error?.description?.toString() ?: "Неизвестная ошибка"
                val url = request?.url?.toString() ?: "неизвестный URL"
                
                Log.e(TAG, "WebView error: $errorCode - $errorDescription for URL: $url")
                
                // Для ошибок DNS (ERR_NAME_NOT_RESOLVED) пытаемся перезагрузить
                if (errorCode == WebViewClient.ERROR_HOST_LOOKUP || errorDescription.contains("ERR_NAME_NOT_RESOLVED", ignoreCase = true)) {
                    if (retryCount < maxRetries) {
                        retryCount++
                        Log.d(TAG, "Попытка перезагрузки $retryCount из $maxRetries")
                        view?.postDelayed({
                            view.loadUrl(getString(R.string.web_url))
                        }, (2000L * retryCount)) // Увеличиваем задержку с каждой попыткой
                        return
                    }
                }
                
                binding.progressBar.isVisible = false
                binding.swipeRefreshLayout.isRefreshing = false
            }
            
            @Deprecated("Deprecated in Java")
            override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                // НЕ вызываем super - это предотвращает показ стандартной страницы ошибки
                Log.e(TAG, "WebView error (deprecated): $errorCode - $description for URL: $failingUrl")
                
                // Для ошибок DNS пытаемся перезагрузить
                if (errorCode == WebViewClient.ERROR_HOST_LOOKUP || 
                    (description?.contains("ERR_NAME_NOT_RESOLVED", ignoreCase = true) == true)) {
                    if (retryCount < maxRetries) {
                        retryCount++
                        Log.d(TAG, "Попытка перезагрузки $retryCount из $maxRetries (deprecated)")
                        view?.postDelayed({
                            view.loadUrl(getString(R.string.web_url))
                        }, (2000L * retryCount))
                        return
                    }
                }
                
                binding.progressBar.isVisible = false
                binding.swipeRefreshLayout.isRefreshing = false
            }
            
            override fun onReceivedHttpError(
                view: WebView?,
                request: WebResourceRequest?,
                errorResponse: WebResourceResponse?
            ) {
                // Не вызываем super для HTTP ошибок - просто логируем
                val statusCode = errorResponse?.statusCode ?: 0
                if (statusCode >= 400) {
                    Log.w(TAG, "HTTP error $statusCode for URL: ${request?.url}")
                }
            }
            
            override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
                // Для локального сервера и нашего домена разрешаем SSL ошибки
                val url = error?.url ?: ""
                if (url.contains("proskomidiya.ru") || url.contains("10.0.2.2") || url.contains("localhost") || url.contains("127.0.0.1")) {
                    Log.w(TAG, "SSL error for local/development server, proceeding anyway")
                    handler?.proceed()
                } else {
                    // Для других доменов тоже разрешаем, чтобы не блокировать загрузку
                    handler?.proceed()
                }
            }
        }
    }
    
    private fun createWebChromeClient(): WebChromeClient {
        return object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                binding.progressBar.apply {
                    if (!isVisible) {
                        isVisible = true
                    }
                    setProgressCompat(newProgress, true)
                    if (newProgress >= 100) {
                        isVisible = false
                    }
                }
                if (newProgress > 65 && view != null) {
                    view.scheduleEnhancements(120)
                }
            }
            
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                consoleMessage?.let {
                    Log.d("WebView", "${it.message()} -- From line ${it.lineNumber()} of ${it.sourceId()}")
                }
                return true
            }
        }
    }
    
    private fun updateNavigationButtons() {
        updateButtonState(binding.backButton, binding.webView.canGoBack())
        updateButtonState(binding.forwardButton, binding.webView.canGoForward())
    }

    private fun updateButtonState(button: View, isEnabled: Boolean) {
        button.isEnabled = isEnabled
        button.alpha = if (isEnabled) 1f else 0.4f
    }
    
    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }
    
    private fun loadLocalOrRemote() {
        // Пытаемся загрузить локальный HTML из assets
        try {
            val html = assets.open("index.html").bufferedReader().use { it.readText() }
            // Загружаем HTML с базовым URL для правильной работы относительных путей
            binding.webView.loadDataWithBaseURL("file:///android_asset/", html, "text/html", "UTF-8", null)
            Log.d(TAG, "Загружен локальный HTML из assets")
        } catch (e: Exception) {
            // Если локальный файл не найден, загружаем из интернета
            Log.w(TAG, "Локальный HTML не найден, загружаем из интернета", e)
            binding.webView.loadUrl(getString(R.string.web_url))
        }
    }
    
    override fun onDestroy() {
        binding.webView.apply {
            stopLoading()
            // Не устанавливаем null, так как типы не nullable
            // WebView автоматически очистит клиенты при уничтожении
        }
        retainedChromeClient = null
        retainedWebViewClient = null
        super.onDestroy()
    }

    private fun WebView.scheduleEnhancements(vararg delays: Long) {
        if (enhancementScript.isEmpty()) {
            return
        }

        evaluateJavascript(enhancementScript, null)
        delays.asSequence()
            .filter { it > 0 }
            .toSet()
            .forEach { delay ->
                postDelayed({ evaluateJavascript(enhancementScript, null) }, delay)
            }
    }

    private fun handleExternalNavigation(targetUri: Uri?): Boolean {
        val uri = targetUri ?: return false
        val scheme = uri.scheme?.lowercase(Locale.US)

        if (scheme == null) {
            return false
        }

        if (scheme == "http" || scheme == "https") {
            val host = uri.host
            if (host == null) {
                return false
            }
            // Разрешаем навигацию внутри приложения для локального сервера и основного домена
            if (host == "proskomidiya.ru" || host.endsWith(".proskomidiya.ru") || 
                host == "10.0.2.2" || host == "localhost" || host == "127.0.0.1" ||
                host.startsWith("192.168.") || host.startsWith("10.")) {
                return false
            }
        } else if (scheme in INTERNAL_SCHEMES) {
            return false
        }

        openExternalLink(uri)
        return true
    }

    private fun openExternalLink(uri: Uri) {
        val intent = Intent(Intent.ACTION_VIEW, uri)
        try {
            startActivity(intent)
        } catch (error: ActivityNotFoundException) {
            Toast.makeText(
                this,
                getString(R.string.error_opening_link),
                Toast.LENGTH_SHORT
            ).show()
            Log.w(TAG, "Не найден обработчик для ссылки: $uri", error)
        }
    }

    private fun loadEnhancementScript(): String {
        return try {
            assets.open(ENHANCER_FILE).bufferedReader().use { it.readText() }
        } catch (error: IOException) {
            Log.e(TAG, "Не удалось загрузить сценарий мобильного улучшения", error)
            ""
        }
    }

    private fun configureSystemBars() {
        window.statusBarColor = ContextCompat.getColor(this, R.color.status_bar_scrim)
        window.navigationBarColor = ContextCompat.getColor(this, R.color.navigation_bar_scrim)
        WindowCompat.getInsetsController(window, binding.root)?.let { controller ->
            controller.isAppearanceLightStatusBars = false
            controller.isAppearanceLightNavigationBars = false
        }
    }
                
    companion object {
        private const val TAG = "MainActivity"
        private const val ENHANCER_FILE = "mobile_enhancements.js"
        private val INTERNAL_SCHEMES = setOf("about", "javascript", "file", "data")
    }
}
