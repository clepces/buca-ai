/**
 * @fileoverview KeyboardShortcuts - Gestor centralizado de atajos de teclado
 * @module core/services/KeyboardShortcuts
 */

import { eventBus } from '@/core/eventBus/index.js';
import { $on } from '@/shared/utils/dom.js';
import { DrilldownMenu } from '@/shared/ui/components/drilldown-menu/drilldown-menu.js';
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';

export const KeyboardShortcuts = {
    _shortcuts: [],
    _unlisten: null,

    init() {
        this.destroy();
        this._unlisten = $on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                if (DrilldownMenu.isOpen()) {
                    DrilldownMenu.close(true);
                    return;
                }
                if (modalServiceV2.isOpen()) {
                    modalServiceV2.requestClose('esc');
                    return;
                }
                eventBus.emit('header:close_all_panels');
            }

            if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                if (modalServiceV2.isShortcutLocked()) return;
                e.preventDefault();
                eventBus.emit('ui:open_search_palette');
            }

            // Ejecutar atajos registrados
            this._shortcuts.forEach(s => {
                if (s.key === e.key && (!s.ctrl || e.ctrlKey || e.metaKey)) {
                    s.action(e);
                }
            });
        });
    },

    destroy() {
        if (typeof this._unlisten === 'function') {
            this._unlisten();
            this._unlisten = null;
        }
    },

    register(key, action, ctrl = false) {
        this._shortcuts.push({ key, action, ctrl });
    }
};

export default KeyboardShortcuts;
