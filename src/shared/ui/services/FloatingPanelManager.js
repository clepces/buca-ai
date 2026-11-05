/**
 * @fileoverview FloatingPanelManager - Gestión de posicionamiento y ciclo de vida de paneles flotantes
 * @module shared/ui/services/FloatingPanelManager
 */

export const FloatingPanelManager = {
    /**
     * Calcula la posición del panel relativa a su trigger.
     * @param {HTMLElement} panel - El panel a posicionar.
     * @param {HTMLElement} wrapper - El dropdown-wrapper trigger.
     */
    positionPanel(panel, wrapper) {
        if (!panel || !wrapper) return;

        // MOBILE (≤767px): Bottom sheet manejado por CSS
        if (window.innerWidth <= 767) {
            panel.style.position = '';
            panel.style.top = '';
            panel.style.left = '';
            panel.style.right = '';
            panel.style.bottom = '';
            return;
        }

        const rect = wrapper.getBoundingClientRect();
        const panelWidth = panel.offsetWidth || 340;

        // Posicionar debajo del trigger, alineado a la derecha
        let left = rect.right - panelWidth;

        // Evitar desbordamiento izquierdo
        if (left < 8) left = 8;

        // Evitar desbordamiento derecho
        if (left + panelWidth > window.innerWidth - 8) {
            left = window.innerWidth - panelWidth - 8;
        }

        panel.style.position = 'fixed';
        panel.style.top = `${rect.bottom + 10}px`;
        panel.style.left = `${left}px`;
        panel.style.right = 'auto';
    },

    /**
     * Extrae paneles al body para evitar problemas de stacking context.
     * @param {string} selector - Selector de los paneles.
     */
    extractPanelsToBody(selector = '.app-header .glass-panel') {
        const panels = document.querySelectorAll(selector);
        panels.forEach(panel => {
            const wrapper = panel.closest('.dropdown-wrapper');
            if (wrapper) {
                if (!wrapper.id) {
                    wrapper.id = 'dw-' + (panel.id || Math.random().toString(36).substr(2, 9));
                }
                panel.setAttribute('data-anchor-wrapper', wrapper.id);
            }
            document.body.appendChild(panel);
        });
    }
};

export default FloatingPanelManager;
