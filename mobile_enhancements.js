(function() {
    if (window.__proskomidiyaMobileEnhancer) {
        window.__proskomidiyaMobileEnhancer.applyNow();
        return;
    }

    const calendarClass = 'mobile-calendar-enhanced';
    const calendarGridClass = 'mobile-calendar-grid';
    const calendarDayClass = 'mobile-calendar-day';
    const keyHeadingSelectors = ['о здравии', 'о упокоении'];
    const prayerWrapperClass = 'mobile-prayer-wrapper';
    const prayerControlsClass = 'mobile-prayer-controls';
    const prayerSelectClass = 'mobile-prayer-select';
    const prayerInputsClass = 'mobile-prayer-inputs';
    const prayerInputClass = 'mobile-prayer-input';
    const prayerHiddenClass = 'mobile-prayer-hidden';
    const prayerHelperClass = 'mobile-prayer-helper';
    const prayerQuickWrapClass = 'mobile-prayer-quick-buttons';
    const prayerQuickButtonClass = 'mobile-prayer-quick-button';
    const prayerBadgeClass = 'mobile-prayer-badge';
    let debounceId = null;

    function ensureViewportMeta() {
        try {
            let viewport = document.querySelector('meta[name="viewport"]');
            if (!viewport) {
                viewport = document.createElement('meta');
                viewport.name = 'viewport';
                // Оптимизированные настройки для мобильных устройств
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=0.8, user-scalable=yes, viewport-fit=cover';
                document.head && document.head.appendChild(viewport);
            } else {
                // Принудительно обновляем viewport для правильного масштабирования
                viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=0.8, user-scalable=yes, viewport-fit=cover';
            }
            
            // Дополнительно устанавливаем правильные размеры для предотвращения горизонтального скролла
            if (document.documentElement) {
                document.documentElement.style.setProperty('max-width', '100vw', 'important');
                document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
            }
        } catch (error) {
            console.error('[ProskomidiyaEnhancer] viewport error', error);
        }
    }

    function injectBaseStyles() {
        if (document.getElementById('mobile-enhancement-base-styles')) {
            return;
        }
        const style = document.createElement('style');
        style.id = 'mobile-enhancement-base-styles';
        style.textContent = `
            :root {
                --mobile-base-font: clamp(17px, 2.8vw, 20px);
                --mobile-heading-color: #89621d;
                --mobile-accent-color: #bc9e3f;
                --mobile-calendar-bg: rgba(255, 255, 255, 0.95);
                --mobile-section-gap: clamp(18px, 5vw, 28px);
                --mobile-content-width: min(100%, 440px);
            }
            * {
                -webkit-tap-highlight-color: rgba(188, 158, 63, 0.2) !important;
                -webkit-touch-callout: none !important;
            }
            html {
                max-width: 100vw !important;
                overflow-x: hidden !important;
                -webkit-text-size-adjust: 100% !important;
                text-size-adjust: 100% !important;
            }
            body {
                font-size: var(--mobile-base-font) !important;
                line-height: 1.65 !important;
                padding: clamp(14px, 4vw, 18px) !important;
                margin: 0 auto !important;
                color: #2f1b0c !important;
                background-color: #f8f4e8 !important;
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                max-width: 100vw !important;
                overflow-x: hidden !important;
                position: relative !important;
                width: 100% !important;
            }
            main, section, article, form, .container, .wrapper, .ornate-border {
                width: var(--mobile-content-width) !important;
                max-width: 100% !important;
                margin-left: auto !important;
                margin-right: auto !important;
                box-sizing: border-box !important;
                position: relative !important;
            }
            /* Предотвращаем переполнение контейнеров */
            div, section, article, main, form {
                max-width: 100% !important;
                box-sizing: border-box !important;
            }
            section, article, form {
                margin-bottom: var(--mobile-section-gap) !important;
            }
            h1, h2, h3, h4, h5, h6, .golden-text {
                font-weight: 700 !important;
                color: var(--mobile-heading-color) !important;
                line-height: 1.25 !important;
                margin: clamp(18px, 4vw, 24px) 0 clamp(10px, 3vw, 16px) 0 !important;
                text-align: center !important;
            }
            h1 { font-size: clamp(32px, 6.5vw, 40px) !important; }
            h2 { font-size: clamp(30px, 6vw, 36px) !important; }
            h3 { font-size: clamp(26px, 5.2vw, 32px) !important; }
            h4 { font-size: clamp(22px, 4.8vw, 28px) !important; }
            p, li, span, label {
                font-size: clamp(17px, 3vw, 20px) !important;
                line-height: 1.65 !important;
            }
            strong {
                font-weight: 700 !important;
            }
            button, a.button, input[type="submit"], input[type="button"] {
                font-size: clamp(18px, 3.2vw, 21px) !important;
                min-height: 52px !important;
                padding: 15px clamp(20px, 5vw, 32px) !important;
                border-radius: 14px !important;
                border: none !important;
                font-weight: 600 !important;
                background: linear-gradient(135deg, #bc9e3f, #d8c27a) !important;
                color: #fff !important;
                box-shadow: 0 10px 18px rgba(188, 158, 63, 0.25) !important;
            }
            input, textarea, select {
                font-size: clamp(17px, 3vw, 20px) !important;
                min-height: 52px !important;
                padding: 14px 18px !important;
                border-radius: 12px !important;
                border: 2px solid rgba(188, 158, 63, 0.6) !important;
                width: 100% !important;
                box-sizing: border-box !important;
                background: rgba(255, 255, 255, 0.98) !important;
            }
            select {
                appearance: none !important;
                background-image: linear-gradient(45deg, transparent 50%, var(--mobile-accent-color) 50%), linear-gradient(135deg, var(--mobile-accent-color) 50%, transparent 50%) !important;
                background-position: calc(100% - 22px) calc(1.05em + 4px), calc(100% - 16px) calc(1.05em + 4px) !important;
                background-size: 6px 6px, 6px 6px !important;
                background-repeat: no-repeat !important;
                padding-right: 52px !important;
            }
            /* Специальный стиль для select количества молитв */
            .mobile-prayer-quantity-select {
                font-size: clamp(19px, 3.6vw, 24px) !important;
                font-weight: 700 !important;
                min-height: 60px !important;
                padding: clamp(16px, 4.5vw, 20px) clamp(20px, 5vw, 28px) !important;
                border: 3px solid var(--mobile-accent-color) !important;
                background: linear-gradient(180deg, #ffffff 0%, #faf8f3 50%, #f0ead7 100%) !important;
                box-shadow: 0 8px 20px rgba(188, 158, 63, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
            }
            .mobile-prayer-quantity-select:focus {
                border-color: #a6892f !important;
                box-shadow: 0 10px 24px rgba(188, 158, 63, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1) !important;
                transform: translateY(-1px) !important;
            }
            label {
                display: block !important;
                font-weight: 600 !important;
                margin-bottom: 8px !important;
                color: var(--mobile-heading-color) !important;
            }
            img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                object-fit: contain !important;
            }
            table {
                max-width: 100% !important;
                table-layout: auto !important;
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
            }
            table td, table th {
                word-wrap: break-word !important;
                overflow-wrap: break-word !important;
                max-width: 0 !important;
            }
            .${calendarClass} {
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 248, 243, 0.95) 100%) !important;
                border-radius: 24px !important;
                padding: clamp(24px, 6vw, 36px) !important;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(188, 158, 63, 0.08) !important;
                backdrop-filter: blur(16px) !important;
                margin: clamp(24px, 6vw, 40px) auto !important;
                width: var(--mobile-content-width) !important;
                max-width: 100% !important;
                border: 2px solid rgba(188, 158, 63, 0.25) !important;
                position: relative !important;
            }
            .${calendarClass}::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 4px !important;
                background: linear-gradient(90deg, #bc9e3f, #d8c27a, #bc9e3f) !important;
                border-radius: 24px 24px 0 0 !important;
            }
            .${calendarClass} .${calendarGridClass} {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                gap: clamp(10px, 2.5vw, 14px) !important;
                margin-top: clamp(20px, 5vw, 28px) !important;
                width: 100% !important;
            }
            .${calendarClass} .${calendarDayClass} {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                min-height: clamp(72px, 14vw, 100px) !important;
                aspect-ratio: 1 !important;
                border-radius: 18px !important;
                border: 2.5px solid rgba(188, 158, 63, 0.35) !important;
                background: linear-gradient(180deg, #ffffff 0%, #faf8f3 50%, #f5f0e6 100%) !important;
                font-weight: 700 !important;
                font-size: clamp(20px, 3.8vw, 26px) !important;
                padding: clamp(10px, 2.5vw, 14px) clamp(6px, 1.5vw, 10px) !important;
                text-align: center !important;
                position: relative !important;
                overflow: visible !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                cursor: pointer !important;
                color: #2f1b0c !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
            }
            .${calendarClass} .${calendarDayClass}:hover:not([data-empty="true"]) {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 16px rgba(188, 158, 63, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
                border-color: rgba(188, 158, 63, 0.6) !important;
            }
            .${calendarClass} .${calendarDayClass}:active:not([data-empty="true"]) {
                transform: translateY(0) scale(0.96) !important;
                box-shadow: 0 2px 6px rgba(188, 158, 63, 0.25), inset 0 2px 4px rgba(0, 0, 0, 0.1) !important;
            }
            .${calendarClass} .${calendarDayClass}[data-today="true"] {
                background: linear-gradient(135deg, #d4af37 0%, #bc9e3f 50%, #a6892f 100%) !important;
                color: #ffffff !important;
                box-shadow: 0 8px 24px rgba(188, 158, 63, 0.4), 0 0 0 3px rgba(188, 158, 63, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
                transform: translateY(-4px) scale(1.08) !important;
                border-color: #8b6f1f !important;
                border-width: 3px !important;
                z-index: 10 !important;
                font-weight: 800 !important;
                position: relative !important;
            }
            .${calendarClass} .${calendarDayClass}[data-today="true"]::after {
                content: '●' !important;
                position: absolute !important;
                top: 4px !important;
                right: 4px !important;
                font-size: 8px !important;
                color: rgba(255, 255, 255, 0.9) !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
            }
            .${calendarClass} .${calendarDayClass}[data-today="true"] > small {
                color: rgba(255, 255, 255, 0.95) !important;
                font-weight: 600 !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
            }
            .${calendarClass} .${calendarDayClass}[data-weekend="true"] {
                border-color: rgba(182, 139, 43, 0.5) !important;
                background: linear-gradient(180deg, #fff8f0 0%, #fef5e7 50%, #fdf0dc 100%) !important;
                color: #8b6f1f !important;
            }
            .${calendarClass} .${calendarDayClass}[data-weekend="true"] > small {
                color: rgba(139, 111, 31, 0.85) !important;
            }
            .${calendarClass} .${calendarDayClass}[data-empty="true"] {
                opacity: 0.25 !important;
                border-color: rgba(188, 158, 63, 0.15) !important;
                background: transparent !important;
                cursor: default !important;
                box-shadow: none !important;
            }
            .${calendarClass} .${calendarDayClass} > small {
                display: block !important;
                font-size: clamp(10px, 2vw, 12px) !important;
                font-weight: 600 !important;
                margin-top: clamp(3px, 0.8vw, 5px) !important;
                color: rgba(47, 27, 12, 0.8) !important;
                line-height: 1.3 !important;
                text-align: center !important;
                max-width: 100% !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
            }
            .${calendarClass} table {
                width: 100% !important;
                border-collapse: separate !important;
                border-spacing: clamp(10px, 2.5vw, 14px) !important;
                margin: 0 auto !important;
            }
            .${calendarClass} table th {
                font-weight: 800 !important;
                font-size: clamp(15px, 3vw, 19px) !important;
                color: #6b4e1f !important;
                background: linear-gradient(180deg, rgba(188, 158, 63, 0.25) 0%, rgba(188, 158, 63, 0.15) 100%) !important;
                border: 2px solid rgba(188, 158, 63, 0.35) !important;
                border-radius: 14px !important;
                padding: clamp(12px, 3vw, 16px) clamp(8px, 2vw, 12px) !important;
                text-transform: uppercase !important;
                letter-spacing: 0.05em !important;
                text-align: center !important;
                box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.6) !important;
            }
            .${calendarClass} .mobile-calendar-title {
                font-size: clamp(32px, 7vw, 46px) !important;
                text-transform: uppercase !important;
                letter-spacing: 0.12em !important;
                margin-bottom: clamp(20px, 5vw, 28px) !important;
                color: #6b4e1f !important;
                font-weight: 800 !important;
                text-shadow: 0 3px 10px rgba(137, 98, 29, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                line-height: 1.2 !important;
                padding-bottom: clamp(12px, 3vw, 18px) !important;
                border-bottom: 3px solid rgba(188, 158, 63, 0.3) !important;
            }
            .${calendarClass} .mobile-calendar-subtitle {
                font-size: clamp(17px, 3.5vw, 22px) !important;
                color: rgba(107, 78, 31, 0.75) !important;
                margin-top: -12px !important;
                margin-bottom: clamp(16px, 4vw, 24px) !important;
                text-align: center !important;
                font-weight: 600 !important;
            }
            .${calendarClass} table td {
                border-radius: 18px !important;
                border: 2.5px solid rgba(188, 158, 63, 0.35) !important;
                padding: clamp(12px, 3vw, 16px) clamp(8px, 2vw, 12px) !important;
                text-align: center !important;
                font-size: clamp(20px, 3.8vw, 26px) !important;
                font-weight: 700 !important;
                background: linear-gradient(180deg, #ffffff 0%, #faf8f3 50%, #f5f0e6 100%) !important;
                vertical-align: middle !important;
                min-height: clamp(72px, 14vw, 100px) !important;
                color: #2f1b0c !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                position: relative !important;
            }
            .${calendarClass} table td:hover:not([data-empty="true"]) {
                transform: translateY(-2px) !important;
                box-shadow: 0 6px 16px rgba(188, 158, 63, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
                border-color: rgba(188, 158, 63, 0.6) !important;
            }
            .${calendarClass} table td[data-today="true"] {
                background: linear-gradient(135deg, #d4af37 0%, #bc9e3f 50%, #a6892f 100%) !important;
                color: #ffffff !important;
                box-shadow: 0 8px 24px rgba(188, 158, 63, 0.4), 0 0 0 3px rgba(188, 158, 63, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
                transform: translateY(-4px) scale(1.08) !important;
                border-color: #8b6f1f !important;
                border-width: 3px !important;
                font-weight: 800 !important;
                z-index: 10 !important;
            }
            .${calendarClass} table td[data-today="true"]::after {
                content: '●' !important;
                position: absolute !important;
                top: 6px !important;
                right: 6px !important;
                font-size: 9px !important;
                color: rgba(255, 255, 255, 0.9) !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
            }
            .${calendarClass} table td[data-weekend="true"] {
                border-color: rgba(182, 139, 43, 0.5) !important;
                background: linear-gradient(180deg, #fff8f0 0%, #fef5e7 50%, #fdf0dc 100%) !important;
                color: #8b6f1f !important;
            }
            .${calendarClass} table td[data-empty="true"] {
                opacity: 0.25 !important;
                border-color: rgba(188, 158, 63, 0.15) !important;
                background: transparent !important;
                box-shadow: none !important;
            }
            .${calendarClass} table td > small {
                display: block !important;
                font-size: clamp(10px, 2vw, 12px) !important;
                font-weight: 600 !important;
                margin-top: clamp(3px, 0.8vw, 5px) !important;
                color: rgba(47, 27, 12, 0.8) !important;
                line-height: 1.3 !important;
            }
            .${calendarClass} table td[data-today="true"] > small {
                color: rgba(255, 255, 255, 0.95) !important;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
            }
            .mobile-section {
                background: rgba(255, 255, 255, 0.94) !important;
                border-radius: 18px !important;
                padding: clamp(18px, 5vw, 26px) !important;
                box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12) !important;
                margin-bottom: var(--mobile-section-gap) !important;
            }
            /* Унифицированные стили для всех секций молитв */
            .mobile-section form,
            .mobile-section .ornate-border,
            .mobile-section section {
                display: flex !important;
                flex-direction: column !important;
                gap: clamp(16px, 4vw, 24px) !important;
            }
            /* Унифицированные стили для всех select в секциях молитв */
            .mobile-section select,
            .ornate-border select,
            form select {
                font-size: clamp(18px, 3.4vw, 22px) !important;
                font-weight: 600 !important;
                min-height: 56px !important;
                padding: clamp(14px, 4vw, 18px) clamp(18px, 4.5vw, 26px) !important;
                border-radius: 14px !important;
                border: 2.5px solid rgba(188, 158, 63, 0.65) !important;
                background: linear-gradient(180deg, #faf8f3 0%, #f0ead7 100%) !important;
                color: var(--mobile-heading-color) !important;
                box-shadow: 0 6px 16px rgba(188, 158, 63, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
                appearance: none !important;
                background-image: linear-gradient(45deg, transparent 50%, var(--mobile-accent-color) 50%), linear-gradient(135deg, var(--mobile-accent-color) 50%, transparent 50%) !important;
                background-position: calc(100% - 22px) calc(1.1em + 4px), calc(100% - 16px) calc(1.1em + 4px) !important;
                background-size: 6px 6px, 6px 6px !important;
                background-repeat: no-repeat !important;
                padding-right: 54px !important;
                transition: all 0.25s ease !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            .mobile-section select:focus,
            .ornate-border select:focus,
            form select:focus {
                border-color: var(--mobile-accent-color) !important;
                box-shadow: 0 8px 20px rgba(188, 158, 63, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
                outline: none !important;
            }
            /* Унифицированные стили для всех label в секциях молитв */
            .mobile-section label,
            .ornate-border label,
            form label {
                font-size: clamp(17px, 3.2vw, 21px) !important;
                font-weight: 600 !important;
                color: var(--mobile-heading-color) !important;
                margin-bottom: clamp(10px, 2.5vw, 14px) !important;
                display: block !important;
            }
            /* Унифицированные стили для всех input в секциях молитв */
            .mobile-section input[type="text"],
            .mobile-section textarea,
            .ornate-border input[type="text"],
            .ornate-border textarea,
            form input[type="text"],
            form textarea {
                font-size: clamp(18px, 3.2vw, 22px) !important;
                min-height: 56px !important;
                padding: clamp(14px, 4vw, 18px) clamp(18px, 4.5vw, 26px) !important;
                border-radius: 14px !important;
                border: 2.5px solid rgba(188, 158, 63, 0.65) !important;
                background: rgba(255, 255, 255, 0.96) !important;
                color: #2f1b0c !important;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
                width: 100% !important;
                box-sizing: border-box !important;
                transition: all 0.25s ease !important;
            }
            .mobile-section input[type="text"]:focus,
            .mobile-section textarea:focus,
            .ornate-border input[type="text"]:focus,
            .ornate-border textarea:focus,
            form input[type="text"]:focus,
            form textarea:focus {
                border-color: var(--mobile-accent-color) !important;
                box-shadow: 0 0 0 4px rgba(188, 158, 63, 0.18), inset 0 1px 2px rgba(0, 0, 0, 0.05) !important;
                outline: none !important;
            }
            .${prayerWrapperClass} {
                background: rgba(255, 255, 255, 0.94) !important;
                border-radius: 20px !important;
                padding: clamp(20px, 5.4vw, 28px) !important;
                box-shadow: 0 14px 32px rgba(0, 0, 0, 0.12) !important;
                margin-bottom: var(--mobile-section-gap) !important;
                border: 1px solid rgba(188, 158, 63, 0.22) !important;
            }
            .${prayerControlsClass} {
                display: flex !important;
                flex-direction: column !important;
                gap: clamp(12px, 3vw, 16px) !important;
                align-items: stretch !important;
                margin-bottom: clamp(18px, 4.5vw, 24px) !important;
            }
            .${prayerSelectClass} {
                font-size: clamp(18px, 3.4vw, 22px) !important;
                font-weight: 600 !important;
                border: 2px solid rgba(188, 158, 63, 0.65) !important;
                border-radius: 14px !important;
                padding: clamp(14px, 4vw, 18px) clamp(18px, 4.5vw, 26px) !important;
                background: linear-gradient(180deg, #faf8f3 0%, #f0ead7 100%) !important;
                box-shadow: 0 6px 16px rgba(188, 158, 63, 0.18) !important;
                appearance: none !important;
                position: relative !important;
                color: var(--mobile-heading-color) !important;
            }
            .${prayerHelperClass} {
                font-size: clamp(16px, 2.8vw, 19px) !important;
                color: rgba(47, 27, 12, 0.8) !important;
                margin: 0 !important;
                text-align: left !important;
            }
            .${prayerInputsClass} {
                display: grid !important;
                grid-template-columns: 1fr !important;
                gap: clamp(14px, 4vw, 18px) !important;
            }
            .${prayerInputClass} {
                position: relative !important;
                transition: transform 0.25s ease, opacity 0.25s ease !important;
            }
            .${prayerInputClass} input,
            .${prayerInputClass} textarea {
                font-size: clamp(18px, 3.2vw, 22px) !important;
                padding: clamp(14px, 4vw, 18px) clamp(18px, 4.5vw, 26px) !important;
                border-radius: 14px !important;
                border: 2px solid rgba(188, 158, 63, 0.65) !important;
                background: rgba(255, 255, 255, 0.96) !important;
                box-shadow: inset 0 0 0 rgba(0, 0, 0, 0) !important;
            }
            .${prayerInputClass}:not(.${prayerHiddenClass}) input:focus,
            .${prayerInputClass}:not(.${prayerHiddenClass}) textarea:focus {
                border-color: #bc9e3f !important;
                box-shadow: 0 0 0 4px rgba(188, 158, 63, 0.18) !important;
            }
            .${prayerHiddenClass} {
                display: none !important;
                opacity: 0 !important;
                transform: translateY(-6px) !important;
            }
            .${prayerQuickWrapClass} {
                display: flex !important;
                flex-wrap: wrap !important;
                gap: clamp(10px, 3vw, 14px) !important;
                justify-content: center !important;
                margin-bottom: clamp(16px, 4vw, 22px) !important;
            }
            .${prayerQuickButtonClass} {
                border: none !important;
                border-radius: 999px !important;
                padding: clamp(10px, 3vw, 14px) clamp(16px, 4vw, 22px) !important;
                background: rgba(188, 158, 63, 0.14) !important;
                color: var(--mobile-heading-color) !important;
                font-weight: 600 !important;
                font-size: clamp(15px, 2.8vw, 18px) !important;
            }
            .${prayerQuickButtonClass}[data-active="true"] {
                background: linear-gradient(135deg, #bc9e3f, #d8c27a) !important;
                color: #fff !important;
                box-shadow: 0 10px 18px rgba(188, 158, 63, 0.22) !important;
            }
            .${prayerBadgeClass} {
                align-self: center !important;
                background: rgba(188, 158, 63, 0.16) !important;
                color: var(--mobile-heading-color) !important;
                font-weight: 600 !important;
                border-radius: 999px !important;
                padding: 6px 18px !important;
                font-size: clamp(14px, 2.4vw, 17px) !important;
            }
        `;
        document.head && document.head.appendChild(style);
    }

    function emphasizeKeyHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, .golden-text, .ornate-border h1, .ornate-border h2');
        headings.forEach(heading => {
            const raw = (heading.textContent || '').replace(/\s+/g, ' ').trim();
            const text = raw.toLowerCase();
            if (!text) return;
            if (keyHeadingSelectors.some(keyword => text.includes(keyword))) {
                heading.style.setProperty('font-size', 'clamp(38px, 8vw, 48px)', 'important');
                heading.style.setProperty('letter-spacing', '0.08em', 'important');
                heading.style.setProperty('text-transform', 'uppercase', 'important');
                heading.style.setProperty('color', '#b68b2b', 'important');
                heading.style.setProperty('text-shadow', '0 6px 18px rgba(182, 139, 43, 0.25)', 'important');
            }
        });
    }

    function markSections() {
        const sections = document.querySelectorAll('section, article, form, div.ornate-border');
        sections.forEach(section => {
            const text = (section.textContent || '').toLowerCase();
            if (!text) return;
            if (keyHeadingSelectors.some(keyword => text.includes(keyword))) {
                section.classList.add('mobile-section');
            }
        });
    }

    function enforceQuantitySelection() {
        // Находим все секции молитв (О здравии и О упокоении)
        const prayerSections = Array.from(document.querySelectorAll('.mobile-section, .ornate-border, section, article, form'))
            .filter(section => {
                const text = (section.textContent || '').toLowerCase();
                return keyHeadingSelectors.some(keyword => text.includes(keyword));
            });

        prayerSections.forEach(section => {
            // Находим все select в этой секции
            const selects = Array.from(section.querySelectorAll('select'));
            
            selects.forEach(select => {
                const name = (select.getAttribute('name') || '').toLowerCase();
                const id = (select.id || '').toLowerCase();
                const label = select.previousElementSibling || 
                             select.parentElement?.querySelector('label[for="' + (select.id || '') + '"]') ||
                             select.parentElement?.querySelector('label');
                const labelText = (label?.textContent || '').toLowerCase();
                const parentText = (select.parentElement && select.parentElement.textContent || '').toLowerCase();
                
                // Проверяем, является ли это select для количества молитв
                const isQuantity = /колич|молитв|count|quantity/.test(name + ' ' + id + ' ' + labelText + ' ' + parentText);
                
                // Также проверяем, если это единственный select в секции или если рядом есть поля для имён
                const hasNameInputs = section.querySelectorAll('input[type="text"], textarea').length > 0;
                const isOnlySelect = selects.length === 1;
                
                if (isQuantity || (isOnlySelect && hasNameInputs)) {
                    prepareQuantitySelect(select);
                    // Добавляем унифицированный класс для стилизации
                    select.classList.add('mobile-prayer-quantity-select');
                }
            });
        });
    }

    function prepareQuantitySelect(select) {
        // Проверяем, не обработан ли уже этот select
        if (select.dataset.mobileQuantityEnhanced === 'true') {
            return;
        }
        select.dataset.mobileQuantityEnhanced = 'true';
        
        let hasPlaceholder = false;
        const options = Array.from(select.options || []);
        
        options.forEach(option => {
            const text = (option.textContent || '').trim();
            // Форматируем опции с числами
            if (/^\d+\b/.test(text) && !/молитв/i.test(text)) {
                const num = parseInt(text.match(/^\d+/)[0], 10);
                option.textContent = `${num} молитв`;
            }
            // Проверяем наличие placeholder
            if (option.value === '' || option.disabled) {
                hasPlaceholder = true;
                option.value = '';
                option.disabled = true;
                option.selected = true;
                option.textContent = 'Выберите количество молитв';
            }
        });
        
        // Добавляем placeholder, если его нет
        if (!hasPlaceholder) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Выберите количество молитв';
            placeholder.disabled = true;
            placeholder.selected = true;
            select.insertBefore(placeholder, select.firstChild);
        }
        
        // Сбрасываем значение, чтобы показать placeholder
        select.value = '';
        
        // Добавляем обработчик изменения для визуальной обратной связи
        select.addEventListener('change', function() {
            if (this.value) {
                this.style.setProperty('background', 'linear-gradient(180deg, #ffffff 0%, #faf8f3 50%, #f0ead7 100%)', 'important');
            } else {
                this.style.setProperty('background', 'linear-gradient(180deg, #faf8f3 0%, #f0ead7 100%)', 'important');
            }
        });
    }

    function formatCountLabel(count) {
        if (!count) {
            return '';
        }
        const remainder10 = count % 10;
        const remainder100 = count % 100;
        if (remainder10 === 1 && remainder100 !== 11) {
            return `${count} имя`;
        }
        if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 10 || remainder100 >= 20)) {
            return `${count} имени`;
        }
        return `${count} имён`;
    }

    function isPrayerInput(input) {
        if (!input || input.type === 'hidden' || input.type === 'submit' || input.type === 'button') {
            return false;
        }
        if (input.dataset && input.dataset.mobilePrayerBound === 'true') {
            return false;
        }
        const placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
        const name = (input.getAttribute('name') || '').toLowerCase();
        const aria = (input.getAttribute('aria-label') || '').toLowerCase();
        const label = (input.closest('label') && (input.closest('label').textContent || '').toLowerCase()) || '';
        const parentText = (input.parentElement && (input.parentElement.textContent || '').toLowerCase()) || '';
        const joined = `${placeholder} ${name} ${aria} ${label} ${parentText}`;
        if (!/(имя|name|о здрав|о упоко|раб бож|раба бож|за здравие|за упокой)/i.test(joined)) {
            return false;
        }
        return true;
    }

    function findPrayerRoot(input) {
        if (!input) {
            return null;
        }
        const prioritySelectors = [
            '[data-prayer-group]',
            'fieldset',
            '.ornate-border',
            'section',
            'article',
            '.form-section',
            '.prayer-group',
            '.prayer-block'
        ];
        for (const selector of prioritySelectors) {
            const match = input.closest(selector);
            if (match) {
                return match;
            }
        }
        return input.closest('div, ul, ol, form') || input.parentElement;
    }

    function findPrayerHolder(input) {
        if (!input) {
            return null;
        }
        const holder = input.closest('label, li, p, .form-group, .form__group, .form-field, .field, .input-wrapper, div');
        if (holder) {
            return holder;
        }
        return input.parentElement;
    }

    function enhancePrayerLists() {
        const processedRoots = new Set();
        const inputs = Array.from(document.querySelectorAll('form input[type="text"], form input:not([type]), form textarea'));
        const prayerInputs = inputs.filter(isPrayerInput);
        if (!prayerInputs.length) {
            return;
        }

        const groups = new Map();
        prayerInputs.forEach(input => {
            const root = findPrayerRoot(input);
            if (!root) {
                return;
            }
            if (!groups.has(root)) {
                groups.set(root, []);
            }
            groups.get(root).push(input);
        });

        groups.forEach((groupInputs, root) => {
            if (!root || processedRoots.has(root) || groupInputs.length < 4) {
                return;
            }
            processedRoots.add(root);

            const holders = [];
            groupInputs.forEach((input, index) => {
                const holder = findPrayerHolder(input);
                if (!holder) {
                    return;
                }
                if (!holders.includes(holder)) {
                    holders.push(holder);
                }
                const placeholder = (input.getAttribute('placeholder') || '').trim();
                if (!placeholder || /имя\s*\d+/i.test(placeholder)) {
                    input.setAttribute('placeholder', `Имя ${index + 1}`);
                }
                input.dataset.prayerIndex = String(index + 1);
                input.dataset.mobilePrayerBound = 'true';
            });

            if (holders.length < 4) {
                return;
            }

            const anchor = holders[0];
            if (!anchor || !anchor.parentElement) {
                return;
            }

            const parentNode = anchor.parentElement;
            if (!parentNode) {
                return;
            }

            const wrapper = document.createElement('div');
            wrapper.className = prayerWrapperClass;
            wrapper.dataset.mobilePrayerEnhanced = 'true';

            const controls = document.createElement('div');
            controls.className = prayerControlsClass;

            const helperText = document.createElement('p');
            helperText.className = prayerHelperClass;
            helperText.textContent = 'Выберите, сколько имён хотите добавить — поля появятся автоматически.';

            const select = document.createElement('select');
            select.className = prayerSelectClass;

            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = 'Количество имён';
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            select.appendChild(placeholderOption);

            const maxCount = holders.length;
            for (let i = 1; i <= maxCount; i += 1) {
                const option = document.createElement('option');
                option.value = String(i);
                option.textContent = formatCountLabel(i);
                select.appendChild(option);
            }

            controls.appendChild(select);

            const badge = document.createElement('div');
            badge.className = prayerBadgeClass;
            badge.textContent = `Всего доступно: ${formatCountLabel(maxCount)}`;
            controls.appendChild(badge);

            const quickWrap = document.createElement('div');
            quickWrap.className = prayerQuickWrapClass;

            const quickValues = Array.from(new Set([1, 3, 5, Math.min(10, maxCount), maxCount]))
                .filter(value => value > 0 && value <= maxCount)
                .sort((a, b) => a - b);

            const setActiveButton = value => {
                Array.from(quickWrap.children).forEach(button => {
                    button.dataset.active = button.dataset.value === String(value) ? 'true' : 'false';
                });
            };

            quickValues.forEach(value => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = prayerQuickButtonClass;
                button.dataset.value = String(value);
                button.textContent = formatCountLabel(value);
                button.addEventListener('click', () => {
                    select.value = String(value);
                    setActiveButton(value);
                    updateVisibility(value);
                });
                quickWrap.appendChild(button);
            });

            const addMoreButton = document.createElement('button');
            addMoreButton.type = 'button';
            addMoreButton.className = prayerQuickButtonClass;
            addMoreButton.textContent = 'Добавить ещё имя';
            addMoreButton.addEventListener('click', () => {
                const current = parseInt(select.value || '0', 10);
                const next = Math.min(maxCount, (isNaN(current) ? 0 : current) + 1);
                if (current === next) {
                    return;
                }
                select.value = String(next);
                setActiveButton(next);
                updateVisibility(next);
            });
            quickWrap.appendChild(addMoreButton);

            const inputsContainer = document.createElement('div');
            inputsContainer.className = prayerInputsClass;

            wrapper.appendChild(controls);
            if (quickWrap.children.length) {
                wrapper.appendChild(quickWrap);
            }
            wrapper.appendChild(helperText);
            wrapper.appendChild(inputsContainer);

            parentNode.insertBefore(wrapper, anchor);

            holders.forEach((holder, index) => {
                if (!holder) {
                    return;
                }
                holder.classList.add(prayerInputClass, prayerHiddenClass);
                holder.dataset.prayerIndex = String(index + 1);
                inputsContainer.appendChild(holder);
            });

            function updateVisibility(count) {
                const limit = Math.min(Math.max(Number(count) || 0, 0), maxCount);
                wrapper.dataset.visibleCount = String(limit);
                holders.forEach((holder, index) => {
                    if (!holder) {
                        return;
                    }
                    const show = index < limit;
                    holder.classList.toggle(prayerHiddenClass, !show);
                });
            }

            select.addEventListener('change', () => {
                const value = parseInt(select.value || '0', 10);
                setActiveButton(value);
                updateVisibility(value);
            });

            select.addEventListener('input', () => {
                const value = parseInt(select.value || '0', 10);
                setActiveButton(value);
                updateVisibility(value);
            });

            const filledCount = holders.reduce((count, holder) => {
                const input = holder.querySelector('input, textarea');
                if (input && input.value && input.value.trim().length > 0) {
                    return count + 1;
                }
                return count;
            }, 0);

            if (filledCount > 0) {
                const initial = Math.min(maxCount, Math.max(filledCount, 1));
                select.value = String(initial);
                setActiveButton(initial);
                updateVisibility(initial);
            } else {
                setActiveButton('');
                updateVisibility(0);
            }
        });
    }

    function enhanceCalendar() {
        const keywords = /(календар|calendar|праздник|месяц|январ|феврал|март|апрел|май|июн|июл|август|сентяб|октябр|ноябр|декабр)/i;
        const monthNames = /(январ|феврал|март|апрел|май|июн|июл|август|сентяб|октябр|ноябр|декабр)/i;
        
        // Расширенный поиск контейнеров календаря
        const allContainers = Array.from(document.querySelectorAll(
            '.ornate-border, [data-calendar], [class*="calendar"], [id*="calendar"], ' +
            '[class*="month"], [id*="month"], section, article, div'
        ));
        
        const containers = allContainers.filter(node => {
            if (!node || node === document.body || node === document.documentElement) return false;
            if (node.children.length === 0) return false;
            
            // Если уже обработан
            if (node.classList && node.classList.contains(calendarClass)) return true;
            
            // Проверяем по классам и ID
            const className = (node.className || '').toLowerCase();
            const id = (node.id || '').toLowerCase();
            if (className.includes('calendar') || id.includes('calendar') || 
                className.includes('month') || id.includes('month')) {
                return true;
            }
            
            // Проверяем по содержимому
            const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
            if (text.length < 30) return false;
            
            // Проверяем наличие ключевых слов
            if (keywords.test(text.slice(0, 300))) return true;
            
            // Проверяем наличие названий месяцев
            if (monthNames.test(text)) return true;
            
            // Проверяем наличие таблицы с датами
            const hasTable = node.querySelector('table');
            if (hasTable) {
                const cells = hasTable.querySelectorAll('td, th');
                let dateMatches = 0;
                cells.forEach(cell => {
                    const cellText = (cell.textContent || '').trim();
                    if (/^\d{1,2}$/.test(cellText) || /(пн|вт|ср|чт|пт|сб|вс)/i.test(cellText)) {
                        dateMatches++;
                    }
                });
                if (dateMatches >= 7) return true;
            }
            
            return false;
        });

        containers.forEach(container => {
            if (!container) return;
            
            container.classList.add(calendarClass);
            
            // Улучшаем заголовок календаря
            const heading = container.querySelector('.mobile-calendar-title, h1, h2, h3, h4, .golden-text, strong, b');
            if (heading && !heading.classList.contains('mobile-calendar-title')) {
                heading.classList.add('mobile-calendar-title');
                heading.style.setProperty('text-align', 'center', 'important');
                heading.style.setProperty('margin-bottom', 'clamp(16px, 4vw, 24px)', 'important');
            }

            // Обрабатываем таблицы календаря (приоритет)
            const tables = Array.from(container.querySelectorAll('table'));
            tables.forEach(table => {
                if (!table) return;
                
                table.classList.add(calendarGridClass);
                table.style.setProperty('width', '100%', 'important');
                table.style.setProperty('border-collapse', 'separate', 'important');
                table.style.setProperty('border-spacing', 'clamp(8px, 2vw, 12px)', 'important');
                table.style.setProperty('margin', '0 auto', 'important');
                
                const rows = Array.from(table.querySelectorAll('tr'));
                rows.forEach((row, rowIndex) => {
                    const cells = Array.from(row.querySelectorAll('td, th'));
                    cells.forEach((cell, cellIndex) => {
                        if (!cell) return;
                        
                        const text = (cell.textContent || '').trim();
                        if (!text && cellIndex === 0 && rowIndex === 0) return;
                        
                        cell.classList.add(calendarDayClass);
                        cell.style.setProperty('text-align', 'center', 'important');
                        cell.style.setProperty('vertical-align', 'middle', 'important');
                        
                        // Обрабатываем заголовки дней недели
                        if (rowIndex === 0 || /(пн|вт|ср|чт|пт|сб|вс|понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)/i.test(text)) {
                            cell.style.setProperty('font-weight', '700', 'important');
                            cell.style.setProperty('font-size', 'clamp(14px, 2.8vw, 18px)', 'important');
                            cell.style.setProperty('color', 'var(--mobile-heading-color)', 'important');
                            cell.style.setProperty('background', 'rgba(188, 158, 63, 0.15)', 'important');
                        } else {
                            // Обрабатываем даты
                            const dateMatch = text.match(/^(\d{1,2})/);
                            if (dateMatch) {
                                const dayNum = parseInt(dateMatch[1], 10);
                                const today = new Date();
                                
                                // Проверяем, является ли это сегодняшним днём
                                if (dayNum === today.getDate()) {
                                    cell.setAttribute('data-today', 'true');
                                }
                                
                                // Определяем выходные (суббота и воскресенье)
                                if (cellIndex >= 5 || /\b(сб|суббот|вс|воскрес)/i.test(text)) {
                                    cell.setAttribute('data-weekend', 'true');
                                }
                                
                                // Разделяем число и текст (если есть)
                                if (text.length > 2 && !cell.querySelector('small')) {
                                    const parts = text.split(/\s+/);
                                    const number = parts[0];
                                    const label = parts.slice(1).join(' ').trim();
                                    if (label) {
                                        cell.textContent = number;
                                        const small = document.createElement('small');
                                        small.textContent = label;
                                        cell.appendChild(small);
                                    }
                                }
                            } else if (!text) {
                                // Пустые ячейки
                                cell.setAttribute('data-empty', 'true');
                            }
                        }
                    });
                });
            });

            // Обрабатываем списки и div'ы с датами (если нет таблиц)
            if (tables.length === 0) {
                const listCandidates = Array.from(container.querySelectorAll('div, ul, ol, section'))
                    .filter(el => el !== container && el.children && el.children.length >= 7);

                listCandidates.forEach(candidate => {
                    if (candidate.classList.contains(calendarGridClass)) return;
                    if (candidate.tagName && candidate.tagName.toLowerCase() === 'table') return;
                    
                    const items = Array.from(candidate.children);
                    if (items.length < 7) return;
                    
                    let matches = 0;
                    items.forEach(item => {
                        const text = (item.textContent || '').trim();
                        if (/^\d{1,2}$/.test(text) || /(пн|вт|ср|чт|пт|сб|вс)/i.test(text)) {
                            matches++;
                        }
                    });
                    
                    if (matches >= Math.min(7, Math.ceil(items.length * 0.35))) {
                        candidate.classList.add(calendarGridClass);
                        candidate.style.setProperty('display', 'grid', 'important');
                        candidate.style.setProperty('grid-template-columns', 'repeat(auto-fit, minmax(66px, 1fr))', 'important');
                        candidate.style.setProperty('gap', 'clamp(10px, 2.5vw, 14px)', 'important');
                        
                        items.forEach((item, index) => {
                            const text = (item.textContent || '').trim();
                            if (!text) {
                                item.setAttribute('data-empty', 'true');
                                return;
                            }
                            
                            item.classList.add(calendarDayClass);
                            
                            const dateMatch = text.match(/^(\d{1,2})/);
                            if (dateMatch) {
                                const dayNum = parseInt(dateMatch[1], 10);
                                const today = new Date();
                                
                                if (dayNum === today.getDate()) {
                                    item.setAttribute('data-today', 'true');
                                }
                                
                                if (index % 7 >= 5 || /\b(сб|суббот|вс|воскрес)/i.test(text)) {
                                    item.setAttribute('data-weekend', 'true');
                                }
                                
                                if (text.length > 2 && !item.querySelector('small')) {
                                    const parts = text.split(/\s+/);
                                    const number = parts[0];
                                    const label = parts.slice(1).join(' ').trim();
                                    if (label) {
                                        item.textContent = number;
                                        const small = document.createElement('small');
                                        small.textContent = label;
                                        item.appendChild(small);
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    function enhanceForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.style.setProperty('padding', 'clamp(18px, 5vw, 26px)', 'important');
            form.style.setProperty('background', 'rgba(255, 255, 255, 0.94)', 'important');
            form.style.setProperty('border-radius', '18px', 'important');
            form.style.setProperty('box-shadow', '0 10px 22px rgba(0, 0, 0, 0.12)', 'important');
            form.style.setProperty('margin', 'clamp(18px, 5vw, 26px) auto', 'important');
            form.style.setProperty('width', 'var(--mobile-content-width)', 'important');
        });
    }

    function enhanceCaptcha() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const alt = (img.getAttribute('alt') || '').toLowerCase();
            const src = (img.getAttribute('src') || '').toLowerCase();
            if (/captcha|капч|код/i.test(alt) || /captcha|capcha|securitycode/.test(src)) {
                img.style.setProperty('transform', 'scale(1.6)', 'important');
                img.style.setProperty('transform-origin', 'center', 'important');
                img.style.setProperty('margin', '20px auto', 'important');
                img.style.setProperty('display', 'block', 'important');
                img.style.setProperty('border', '3px solid #bc9e3f', 'important');
                img.style.setProperty('border-radius', '12px', 'important');
                img.style.setProperty('padding', '10px', 'important');
                img.style.setProperty('background', '#fff', 'important');
            }
        });
    }

    function capitalizeFirstLetters() {
        const selector = 'p, li, label, span, button, a, h1, h2, h3, h4, h5, h6';
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (!element || element.childElementCount > 0) {
                return;
            }
            const text = element.textContent;
            if (!text) {
                return;
            }
            const leadingWhitespaceMatch = text.match(/^\s+/);
            const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '';
            const trimmed = text.trimStart();
            if (!trimmed) {
                return;
            }
            const firstChar = trimmed.charAt(0);
            if (!/[a-zа-яё]/i.test(firstChar)) {
                return;
            }
            const capitalized = firstChar.toLocaleUpperCase('ru-RU');
            if (capitalized === firstChar) {
                return;
            }
            element.textContent = leadingWhitespace + capitalized + trimmed.slice(1);
        });
    }

    function preventOverflow() {
        // Оптимизированная функция - обрабатываем только проблемные элементы
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 360;
        
        // Обрабатываем таблицы
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.style.setProperty('max-width', '100%', 'important');
            table.style.setProperty('table-layout', 'auto', 'important');
            table.style.setProperty('word-wrap', 'break-word', 'important');
            table.style.setProperty('overflow-wrap', 'break-word', 'important');
        });
        
        // Обрабатываем изображения
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.style.setProperty('max-width', '100%', 'important');
            img.style.setProperty('height', 'auto', 'important');
            img.style.setProperty('display', 'block', 'important');
        });
        
        // Обрабатываем контейнеры с фиксированной шириной
        const containers = document.querySelectorAll('div, section, article, main');
        containers.forEach(container => {
            const style = window.getComputedStyle(container);
            const width = style.width;
            
            // Проверяем только элементы с фиксированной шириной в пикселях
            if (width && width.endsWith('px')) {
                const widthValue = parseFloat(width);
                if (widthValue > screenWidth) {
                    container.style.setProperty('max-width', '100%', 'important');
                    container.style.setProperty('width', 'auto', 'important');
                }
            }
        });
        
        // Предотвращаем горизонтальный скролл
        document.body.style.setProperty('overflow-x', 'hidden', 'important');
        document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    }

    function enhance() {
        ensureViewportMeta();
        injectBaseStyles();
        preventOverflow();
        markSections();
        emphasizeKeyHeadings();
        enhancePrayerLists();
        enforceQuantitySelection();
        enhanceCalendar();
        enhanceForms();
        enhanceCaptcha();
        capitalizeFirstLetters();
    }

    function scheduleEnhance() {
        window.clearTimeout(debounceId);
        debounceId = window.setTimeout(enhance, 150);
    }

    enhance();
    [250, 600, 1200, 2500].forEach(delay => window.setTimeout(enhance, delay));

    const observer = new MutationObserver(scheduleEnhance);
    const startObserver = () => {
        if (!document.body) {
            window.setTimeout(startObserver, 200);
            return;
        }
        observer.observe(document.body, { childList: true, subtree: true });
    };
    startObserver();

    window.__proskomidiyaMobileEnhancer = {
        applyNow: enhance,
        observer
    };
            })();

