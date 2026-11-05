/**
 * @fileoverview UI Helper Utilities
 * @module utils/ui-helper
 * @description Utilidades globales para la manipulación dinámica de la interfaz, preloader y overlays.
 */

/**
 * Mapeo de iconos SVG predeterminados para los estados del preloader
 */
export const DEFAULT_STATE_SVGS = {
    '404': `
        <svg class="buca-preloader-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
    `,
    '500': `
        <svg class="buca-preloader-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
            <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
            <line x1="6" y1="6" x2="6.01" y2="6"></line>
            <line x1="6" y1="18" x2="6.01" y2="18"></line>

        </svg>
    `,
    '503': `
        <svg class="buca-preloader-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M12 2v4"></path>
            <path d="M12 18v4"></path>
            <path d="M4.93 4.93l2.83 2.83"></path>
            <path d="M16.24 16.24l2.83 2.83"></path>
        </svg>
    `,
    'warning': `
        <svg class="buca-preloader-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    `,
    'error': `
        <svg class="buca-preloader-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
    `,
    'info': `
        <svg class="buca-preloader-svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    `
};

/**
 * Manipula dinámicamente las clases del #global-preloader, su icono SVG y el texto de #splash-status.
 * 
 * @param {string} status - Texto descriptivo para el elemento #splash-status
 * @param {string} [icon] - Icono personalizado (SVG HTML, Emoji, o clase de icono Lucide/Bootstrap)
 * @param {string} [type='info'] - Tipo/Estado: 'error' | 'warning' | '404' | '500' | '503' | 'info' | 'reset'
 * @returns {HTMLElement|null} El elemento #global-preloader actualizado
 */
export function updatePreloaderState(status, icon, type = 'info') {
    const preloader = document.getElementById('global-preloader');
    if (!preloader) return null;

    // 1. Limpiar clases de estado previas
    const stateClasses = [
        'preloader--error', 'preloader--warning', 'preloader--404',
        'preloader--500', 'preloader--503', 'preloader--info',
        'is-error', 'is-warning'
    ];
    preloader.classList.remove(...stateClasses);

    // 2. Si el tipo es 'reset' o 'default', restaurar estado normal de carga
    if (type === 'reset' || type === 'default') {
        const spinner = preloader.querySelector('.buca-spinner');
        if (spinner) spinner.style.display = 'block';
        
        const iconEl = document.getElementById('splash-icon');
        if (iconEl) iconEl.remove();

        if (status) {
            const statusEl = document.getElementById('splash-status');
            if (statusEl) statusEl.textContent = status;
        }
        return preloader;
    }

    // 3. Aplicar nuevas clases de estado según 'type'
    const cleanType = String(type).toLowerCase().trim();
    const typeClass = `preloader--${cleanType}`;
    preloader.classList.add(typeClass);

    if (cleanType === 'error' || cleanType === '500' || cleanType === '503' || cleanType.includes('danger')) {
        preloader.classList.add('is-error');
    } else if (cleanType === 'warning') {
        preloader.classList.add('is-warning');
    } else if (cleanType === '404') {
        preloader.classList.add('is-error');
    }

    // 4. Actualizar texto de #splash-status
    if (status) {
        const statusEl = document.getElementById('splash-status');
        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    // 5. Determinar e inyectar el icono SVG o personalizado
    let targetSvg;
    if (icon) {
        if (icon.includes('<svg')) {
            targetSvg = icon;
        } else if (icon.startsWith('bi ') || icon.startsWith('lucide-') || icon.startsWith('fa-')) {
            targetSvg = `<i class="${icon} u-icon-hero"></i>`;
        } else if (DEFAULT_STATE_SVGS[icon]) {
            targetSvg = DEFAULT_STATE_SVGS[icon];
        } else {
            targetSvg = `<span class="u-icon-hero">${icon}</span>`;
        }
    } else {
        // Seleccionar SVG predeterminado según el 'cleanType'
        targetSvg = DEFAULT_STATE_SVGS[cleanType] || DEFAULT_STATE_SVGS['error'];
    }

    let iconContainer = document.getElementById('splash-icon');
    const spinner = preloader.querySelector('.buca-spinner');

    if (!iconContainer) {
        iconContainer = document.createElement('div');
        iconContainer.id = 'splash-icon';
        iconContainer.className = 'buca-overlay-icon';
        
        if (spinner) {
            spinner.parentNode.insertBefore(iconContainer, spinner);
            spinner.style.display = 'none';
        } else {
            preloader.prepend(iconContainer);
        }
    } else if (spinner) {
        spinner.style.display = 'none';
    }

    iconContainer.innerHTML = targetSvg;

    return preloader;
}


/**
 * Gestor robusto de bloqueo de scroll para el body.
 * Maneja un contador interno para permitir múltiples capas de modales/paneles
 * sin que el cierre de uno desbloquee prematuramente el scroll de los demás.
 */
export const ScrollManager = {
    _lockCount: 0,
    _originalStyle: '',

    lock() {
        this._lockCount++;
        if (this._lockCount === 1) {
            this._originalStyle = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden'; // Refuerzo para iOS
            document.body.classList.add('buca-modal-open');
            // Evitar saltos de layout por desaparición de scrollbar
            document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';
        }
    },

    unlock() {
        this._lockCount = Math.max(0, this._lockCount - 1);
        if (this._lockCount === 0) {
            document.body.style.overflow = this._originalStyle;
            document.documentElement.style.overflow = '';
            document.body.style.paddingRight = '';
            document.body.classList.remove('buca-modal-open');
        }
    },

    forceUnlock() {
        this._lockCount = 0;
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('buca-modal-open');
    }
};

export default {
    updatePreloaderState,
    ScrollManager
};
