/**
 * LanguagePanel - Subcomponente del Header
 * =========================================================================
 * Selector de región e idioma con diseño "Glass Mini".
 */
export const LanguagePanel = {
    render: () => {
        return `
            <div id="panel-language" class="glass-panel glass-panel--mini">
                <div class="panel-header"><i class="bi bi-translate"></i> Idioma</div>
                <button class="panel-item panel-item--lang active" data-action="ui:set_language" data-lang="es-ve">
                    <span class="lang-flag-sm" role="img" aria-label="Venezuela">🇻🇪</span>
                    <span class="item-label">Español</span>
                    <i class="bi bi-check2 item-check"></i>
                </button>
                <button class="panel-item panel-item--lang" data-action="ui:set_language" data-lang="en-us">
                    <span class="lang-flag-sm" role="img" aria-label="USA">🇺🇸</span>
                    <span class="item-label">English</span>
                </button>
            </div>
        `;
    }
};
