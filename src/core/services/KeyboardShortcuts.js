/**
 * @fileoverview KeyboardShortcuts - Gestor centralizado de atajos de teclado
 * @module core/services/KeyboardShortcuts
 */

import { eventBus } from '@/core/eventBus/index.js';

export const KeyboardShortcuts = {
    _shortcuts: [],

    init() {
        document.addEventListener('keydown', (e) => {
            // Escape: Cerrar modales y paneles por defecto
            if (e.key === 'Escape') {
                eventBus.emit('header:close_all_panels');
                eventBus.emit('ui:close_modal');
            }

            // Ctrl/Cmd + K: Buscador
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                eventBus.emit('workspace:toggle_search', { active: true });
            }

            // Ejecutar atajos registrados
            this._shortcuts.forEach(s => {
                if (s.key === e.key && (!s.ctrl || e.ctrlKey || e.metaKey)) {
                    s.action(e);
                }
            });
        });
    },

    register(key, action, ctrl = false) {
        this._shortcuts.push({ key, action, ctrl });
    }
};

export default KeyboardShortcuts;
