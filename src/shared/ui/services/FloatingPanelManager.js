/**
 * @fileoverview FloatingPanelManager - Gestión de posicionamiento y ciclo de vida de paneles flotantes
 * @module shared/ui/services/FloatingPanelManager
 */
import { $$, $attr, $appendTo, $styleVar } from '@/shared/utils/dom.js';
import { getViewportWidth } from '@/core/utils/system-helper.js';

export const FloatingPanelManager = {
    /**
     * Calcula la posición del panel relativa a su trigger.
     * @param {HTMLElement} panel - El panel a posicionar.
     * @param {HTMLElement} wrapper - El dropdown-wrapper trigger.
     */
    positionPanel(panel, wrapper) {
        if (!panel || !wrapper) return;

        const viewportWidth = getViewportWidth();

        // MOBILE (≤767px): Bottom sheet manejado por CSS
        if (viewportWidth <= 767) {
            $styleVar(panel, 'position', '');
            $styleVar(panel, 'top', '');
            $styleVar(panel, 'left', '');
            $styleVar(panel, 'right', '');
            $styleVar(panel, 'bottom', '');
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        const panelWidth = panel.offsetWidth || 340;

        // Posicionar debajo del trigger, alineado a la derecha
        let left = rect.right - panelWidth;

        // Evitar desbordamiento izquierdo
        if (left < 8) left = 8;

        // Evitar desbordamiento derecho
        if (left + panelWidth > viewportWidth - 8) {
            left = viewportWidth - panelWidth - 8;
        }

        $styleVar(panel, 'position', 'fixed');
        $styleVar(panel, 'top', `${rect.bottom + 10}px`);
        $styleVar(panel, 'left', `${left}px`);
        $styleVar(panel, 'right', 'auto');
    },

    /**
     * Extrae paneles al body para evitar problemas de stacking context.
     * @param {string} selector - Selector de los paneles.
     */
    extractPanelsToBody(selector = '.app-header .glass-panel') {
        const panels = $$(selector);
        panels.forEach(panel => {
            const wrapper = panel.closest('.dropdown-wrapper');
            if (wrapper) {
                if (!wrapper.id) {
                    wrapper.id = 'dw-' + (panel.id || Math.random().toString(36).substr(2, 9));
                }
                $attr(panel, 'data-anchor-wrapper', wrapper.id);
            }
            $appendTo(document.body, panel);
        });
    }
};

export default FloatingPanelManager;
