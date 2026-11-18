/**
 * @fileoverview UI Helpers - Scroll & Viewport Management
 * @module shared/ui/utils/ui-helper
 * @description Gestor robusto de bloqueo de scroll para el viewport (modales y overlays).
 */

import { $addClass, $removeClass, $styleVar } from '@/shared/utils/dom.js';
import { getViewportWidth } from '@/core/utils/system-helper.js';

/**
 * Gestor robusto de bloqueo de scroll para el body y html.
 * Maneja un contador interno para permitir múltiples capas de modales/paneles
 * sin que el cierre de uno desbloquee prematuramente el scroll de los demás.
 */
export const ScrollManager = {
    _lockCount: 0,

    lock() {
        this._lockCount++;
        if (this._lockCount === 1) {
            $addClass(document.body, 'overflow-hidden', 'buca-modal-open');
            $addClass(document.documentElement, 'overflow-hidden');
            
            // Compensar ancho de scrollbar para evitar saltos de layout
            const scrollbarWidth = getViewportWidth() - document.documentElement.clientWidth;
            if (scrollbarWidth > 0) {
                $styleVar(document.body, 'padding-right', `${scrollbarWidth}px`);
            }
        }
    },

    unlock() {
        this._lockCount = Math.max(0, this._lockCount - 1);
        if (this._lockCount === 0) {
            $removeClass(document.body, 'overflow-hidden', 'buca-modal-open');
            $removeClass(document.documentElement, 'overflow-hidden');
            $styleVar(document.body, 'padding-right', '');
        }
    },

    forceUnlock() {
        this._lockCount = 0;
        $removeClass(document.body, 'overflow-hidden', 'buca-modal-open');
        $removeClass(document.documentElement, 'overflow-hidden');
        $styleVar(document.body, 'padding-right', '');
    }
};

export default {
    ScrollManager
};
