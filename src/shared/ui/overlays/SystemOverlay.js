/**
 * @fileoverview SystemOverlay - Componente Unificado de Precarga, Alertas y Errores
 * @module shared/ui/overlays/SystemOverlay
 * @description Centraliza el diseño y renderizado del Preloader, Alertas del Kernel
 * y Vistas de Error (404, 500, 503, Alertas de Recuperación) reutilizando la misma
 * composición, estructura HTML y estilos CSS con variante glassmorphism.
 */

import { $id, $, $mount, $on, $addClass, $removeClass, $className, $create, $appendTo, $show } from '@/shared/utils/dom.js';
import preloaderController from '@/shared/ui/overlays/preloader-controller.js';
import { renderBrandLoader } from '@/shared/ui/components/brand-loader.js';

export class SystemOverlay {
    /**
     * Mapeo de iconos predeterminados según la severidad/tipo de alerta
     */
    static ICONS = {
        loading: renderBrandLoader({ size: 'lg' }),
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
        let overlay = $id('global-preloader') || $id('buca-system-overlay');
        const type = options.type || 'info';
        const typeClass = `preloader--${type}`;

        if (!overlay) {
            overlay = $create('div', {
                id: 'buca-system-overlay',
                className: `buca-system-overlay ${typeClass}`
            });
            $appendTo(document.body, overlay);
        } else {
            if (overlay._hideTimer) {
                clearTimeout(overlay._hideTimer);
                overlay._hideTimer = null;
            }
            if (overlay.id === 'global-preloader') {
                preloaderController.destroy();
                $className(overlay, `preloader-state ${typeClass} ${type === 'warning' ? 'is-warning' : 'is-error'}`);
            } else {
                $className(overlay, `buca-system-overlay ${typeClass}`);
            }
            $removeClass(overlay, 'preloader--fade-out', 'd-none');
            $show(overlay);
        }

        $mount(overlay, this.renderCard(options));

        // Bind click handlers para los botones de acción con limpieza automática
        if (options.actions && options.actions.length > 0) {
            if (overlay._actionsAbort) overlay._actionsAbort.abort();
            overlay._actionsAbort = new AbortController();
            const { signal } = overlay._actionsAbort;

            options.actions.forEach((act, index) => {
                const btn = $(`[data-overlay-btn-index="${index}"]`, overlay);
                if (btn && typeof act.onClick === 'function') {
                    $on(btn, 'click', (e) => {
                        e.preventDefault();
                        act.onClick();
                    }, { signal });
                }
            });
        }
    }

    /**
     * Aplica un estado semántico y badge al #global-preloader sin destruir su estructura.
     * @param {string} stateClass - Ej. 'preloader--error' | 'preloader--warning' | 'preloader--offline' | 'preloader--503'
     * @param {string} [statusText] - Descripción del estado
     * @param {Object} [options] - { icon, title, phaseId, actions }
     */
    static setPreloaderState(stateClass, statusText = '', options = {}) {
        const state = stateClass.replace(/^preloader--/, '');
        preloaderController.updateStatus({
            phaseId: options.phaseId || state,
            state,
            icon: options.icon,
            title: options.title,
            description: statusText,
            actions: options.actions || []
        });
    }

    /**
     * Remueve todas las clases de utilidad de error/advertencia del #global-preloader.
     */
    static clearPreloaderState() {
        preloaderController.clearState();
    }

    /**
     * Oculta suavemente el overlay si existe y libera sus recursos.
     */
    static hideOverlay() {
        const overlay = $id('global-preloader') || $id('buca-system-overlay');
        if (!overlay) return;

        preloaderController.destroy();
        if (overlay._actionsAbort) {
            overlay._actionsAbort.abort();
            overlay._actionsAbort = null;
        }
        if (overlay._hideTimer) {
            clearTimeout(overlay._hideTimer);
            overlay._hideTimer = null;
        }

        if (preloaderController.getPerfTier() === 'L0') {
            if (overlay.parentNode) overlay.remove();
            return;
        }

        $addClass(overlay, 'preloader--fade-out');
        overlay._hideTimer = setTimeout(() => {
            overlay._hideTimer = null;
            if (overlay.parentNode) {
                overlay.remove();
            }
        }, 450);
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

