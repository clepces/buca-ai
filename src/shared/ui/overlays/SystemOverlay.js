/**
 * @fileoverview SystemOverlay - Componente Unificado de Precarga, Alertas y Errores
 * @module shared/ui/overlays/SystemOverlay
 * @description Centraliza el diseño y renderizado del Preloader, Alertas del Kernel
 * y Vistas de Error (404, 500, 503, Alertas de Recuperación) reutilizando la misma
 * composición, estructura HTML y estilos CSS con variante glassmorphism.
 */

export class SystemOverlay {
    /**
     * Mapeo de iconos predeterminados según la severidad/tipo de alerta
     */
    static ICONS = {
        loading: '<div class="buca-spinner"></div>',
        recovery: '⚠️',
        danger: '❌',
        warning: '⚠️',
        info: 'ℹ️',
        '404': '🔍',
        '500': '💥',
        '503': '🔌',
        '401': '🔒',
        '403': '🚫'
    };

    /**
     * Genera la estructura HTML unificada de una tarjeta de alerta o error.
     * @param {Object} options - Configuración de la alerta.
     * @param {string} [options.type='info'] - 'loading' | 'recovery' | 'danger' | 'warning' | 'info' | '404' | '500' | '503'
     * @param {string} [options.code] - Etiqueta superior (ej: '404', 'RECUPERACIÓN DE SISTEMA', 'SISTEMA OFFLINE')
     * @param {string} [options.icon] - Icono personalizado en HTML/SVG/Emoji
     * @param {string} options.title - Título principal
     * @param {string} options.message - Mensaje explicativo o subtítulo
     * @param {string} [options.details] - Traza de error o detalles técnicos opcionales
     * @param {Array<Object>} [options.actions] - Botones de acción [{ text, type: 'primary'|'secondary', onClick, href, icon }]
     * @returns {string} HTML generado
     */
    static renderCard(options = {}) {
        const {
            type = 'info',
            code = '',
            icon,
            title = 'Notificación de Sistema',
            message = '',
            details = '',
            actions = []
        } = options;

        const activeIcon = icon || this.ICONS[type] || 'ℹ️';
        const cardClass = `buca-overlay-card buca-overlay-card--${type}`;

        const actionsHtml = actions.length > 0
            ? actions.map((act, index) => {
                const btnType = act.type === 'secondary' ? 'buca-btn-action--secondary' : 'buca-btn-action--primary';
                const actIcon = act.icon ? `<i class="${act.icon}"></i>` : '';
                const dataAttr = act.action ? `data-overlay-action="${act.action}"` : `data-overlay-btn-index="${index}"`;
                if (act.href) {
                    return `<a href="${act.href}" class="buca-btn-action ${btnType}" ${dataAttr}>${actIcon} ${act.text}</a>`;
                }
                return `<button type="button" class="buca-btn-action ${btnType}" ${dataAttr}>${actIcon} ${act.text}</button>`;
            }).join('')
            : '';

        return `
            <div class="${cardClass}">
                <div class="buca-overlay-icon">${activeIcon}</div>
                ${code ? `<div class="buca-overlay-badge">${code}</div>` : ''}
                <h3 class="buca-overlay-title">${title}</h3>
                <p class="buca-overlay-sub">${message}</p>
                ${details ? `<div class="buca-overlay-details">${details}</div>` : ''}
                ${actionsHtml ? `<div class="buca-overlay-actions">${actionsHtml}</div>` : ''}
            </div>
        `;
    }

    /**
     * Muestra la alerta/error como un overlay a pantalla completa aplicando las clases de utilidad
     * al #global-preloader o a un overlay creado dinámicamente.
     * @param {Object} options - Opciones de la alerta (mismas que renderCard)
     */
    static showOverlay(options = {}) {
        let overlay = document.getElementById('global-preloader') || document.getElementById('buca-system-overlay');
        const type = options.type || 'info';
        const typeClass = `preloader--${type}`;

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'buca-system-overlay';
            overlay.className = `buca-system-overlay ${typeClass}`;
            document.body.appendChild(overlay);
        } else {
            if (overlay.id === 'global-preloader') {
                overlay.className = `preloader-state ${typeClass} ${type === 'warning' ? 'is-warning' : 'is-error'}`;
            } else {
                overlay.className = `buca-system-overlay ${typeClass}`;
            }
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            overlay.style.pointerEvents = 'all';
        }

        overlay.innerHTML = this.renderCard(options);

        // Bind click handlers para los botones de acción
        if (options.actions && options.actions.length > 0) {
            options.actions.forEach((act, index) => {
                const btn = overlay.querySelector(`[data-overlay-btn-index="${index}"]`);
                if (btn && typeof act.onClick === 'function') {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        act.onClick();
                    });
                }
            });
        }
    }

    /**
     * Aplica directamente una clase de utilidad al #global-preloader para cambiar su estado (error, warning, 404, 500, 503)
     * sin destruir su estructura interna.
     * @param {string} stateClass - 'preloader--error' | 'preloader--warning' | 'preloader--404' | 'preloader--500' | 'preloader--503'
     * @param {string} [statusText] - Texto opcional para actualizar #splash-status
     */
    static setPreloaderState(stateClass, statusText) {
        const preloader = document.getElementById('global-preloader');
        if (!preloader) return;

        preloader.classList.add(stateClass);
        if (stateClass.includes('error') || stateClass.includes('500') || stateClass.includes('503')) {
            preloader.classList.add('is-error');
        } else if (stateClass.includes('warning')) {
            preloader.classList.add('is-warning');
        }

        if (statusText) {
            const statusEl = document.getElementById('splash-status');
            if (statusEl) statusEl.textContent = statusText;
        }
    }

    /**
     * Remueve todas las clases de utilidad de error/advertencia del #global-preloader.
     */
    static clearPreloaderState() {
        const preloader = document.getElementById('global-preloader');
        if (!preloader) return;

        preloader.classList.remove(
            'preloader--error', 'preloader--warning', 'preloader--404',
            'preloader--500', 'preloader--503', 'is-error', 'is-warning'
        );
    }

    /**
     * Oculta suavemente el overlay si existe.
     */
    static hideOverlay() {
        const overlay = document.getElementById('global-preloader') || document.getElementById('buca-system-overlay');
        if (!overlay) return;

        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay && overlay.parentNode && overlay.id === 'buca-system-overlay') {
                overlay.remove();
            }
        }, 500);
    }

    /**
     * Helper para renderizar una página de error en una vista embebida (SPA)
     * @param {Object} options 
     */
    static renderPage(options = {}) {
        return `
            <div class="view-enter d-flex flex-column align-items-center justify-content-center h-100 py-5">
                ${this.renderCard(options)}
            </div>
        `;
    }
}

export default SystemOverlay;

