/**
 * @fileoverview WorkspaceNavRibbon - Barra de Navegación y Controles del Workspace
 * @module modules/workspace/components/WorkspaceNavRibbon
 */
import { eventBus } from '@/core/eventBus/index.js';
import { businessService } from '@/modules/workspace/services/BusinessService.js';
import { renderRibbonTemplate } from './ribbon-template.js';
import { $id, $, $$, $mount, $on, $text, $addClass, $removeClass, $toggle } from '@/shared/utils/dom.js';

export const WorkspaceNavRibbon = {
    render() {
        return renderRibbonTemplate();
    },

    mount(targetSlotId = 'workspace-nav-slot') {
        const slot = $id(targetSlotId);
        if (!slot) return;
        $mount(slot, this.render());
        this.init();
    },

    init() {
        const ribbon = $('.workspace-navigation-ribbon');
        if (!ribbon || ribbon._bucaInit) return;
        ribbon._bucaInit = true;

        // Cargar contador real de empresas desde Supabase
        const updateBusinessCount = async () => {
            try {
                const res = await businessService.getUserBusinesses();
                const count = (res.success && Array.isArray(res.data)) ? res.data.length : 0;
                $$('.pill-count', ribbon).forEach(el => {
                    $text(el, count);
                });
            } catch (err) {
                // Silencioso en caso de inicio sin conexión
            }
        };

        updateBusinessCount();

        // Control del menú desplegable Nav Overflow ('... Más')
        const overflowBtn = $id('ws-nav-overflow-more-toggle') || $id('ws-actions-overflow-toggle');
        const overflowMenu = $id('ws-actions-dropdown');
        if (overflowBtn && overflowMenu) {
            $on(overflowBtn, 'click', (e) => {
                e.stopPropagation();
                $toggle(overflowMenu);
            });
        }

        // Cierre de desplegable al hacer clic fuera
        $on(document, 'click', (e) => {
            if (overflowMenu && !overflowMenu.contains(e.target) && e.target !== overflowBtn && !overflowBtn?.contains(e.target)) {
                $addClass(overflowMenu, 'd-none');
            }
        });

        // Eventos del EventBus
        eventBus.on('workspace:business_created', () => updateBusinessCount());
        eventBus.on('workspace:refresh_data', () => {
            updateBusinessCount();
            const icon = $('.bi-arrow-clockwise', ribbon);
            if (icon) {
                $addClass(icon, 'spin-anim');
                setTimeout(() => $removeClass(icon, 'spin-anim'), 1000);
            }
            eventBus.emit('notifications:push', {
                title: 'Datos Sincronizados',
                message: 'Información operativa actualizada con el servidor.',
                type: 'success'
            });
        });
    }
};

export default WorkspaceNavRibbon;
