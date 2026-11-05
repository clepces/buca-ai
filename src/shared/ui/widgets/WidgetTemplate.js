/**
 * WidgetTemplate - Estructura Visual Base para el Workspace
 * =========================================================================
 * Define la plantilla HTML/CSS para todos los widgets de la plataforma,
 * aplicando Glassmorphism dinámico según el nivel de performance.
 * =========================================================================
 */
export const WidgetTemplate = {
    /**
     * Renderiza el contenedor de un widget.
     * @param {Object} props - { id, title, icon, content, colorClass }
     * @returns {string} HTML del widget.
     */
    render({ id, title, icon, content, colorClass = 'primary' }) {
        return `
            <div class="glass-widget widget--${colorClass}" id="widget-${id}" data-buca-perf-affected="true">
                <div class="widget-header">
                    <div class="header-main">
                        <i class="bi ${icon}"></i>
                        <span class="widget-title">${title}</span>
                    </div>
                    <div class="header-actions">
                        <button class="widget-action-btn" onclick="console.log('Refresh widget ${id}')">
                            <i class="bi bi-arrow-clockwise"></i>
                        </button>
                    </div>
                </div>
                <div class="widget-body">
                    ${content}
                </div>
                <div class="widget-footer">
                    <div class="status-dot"></div>
                    <span class="status-text">Sincronizado</span>
                </div>
            </div>
        `;
    }
};

export default WidgetTemplate;
