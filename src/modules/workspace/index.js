/**
 * Módulo Workspace - Host de Negocios
 * =========================================================================
 * Punto de entrada del área de trabajo. Reemplaza al antiguo módulo Home
 * y gestiona la visualización de widgets y negocios.
 * =========================================================================
 */
import { WidgetOrchestrator } from './logic/WidgetOrchestrator.js';
import { uiState } from '@/core/state/ui.js';
import { eventBus } from '@/core/eventBus/index.js';
import { router } from '@/core/router/router.js';
import { workspaceRoutes } from './routes.js';

export const WorkspaceModule = {
    async init() {
        console.log('[Workspace] -> Módulo inicializado');
        if (router && typeof router.addRoutes === 'function') {
            router.addRoutes(workspaceRoutes);
        }
        this.setupDashboard();
    },

    /**
     * Configura el tablero de instrumentos neural.
     */
    setupDashboard() {
        const perf = uiState.get().graphics?.tier || 'balanced';
        const config = WidgetOrchestrator.getLayoutConfig(perf);
        
        console.log(`[Workspace] -> Configurando layout para perfil: ${perf}`, config);
    },

    /**
     * Abre la gestión de negocios a pantalla completa.
     */
    openBusinessModal() {
        eventBus.emit('ui:open_modal', {
            title: 'Mis Negocios',
            subtitle: 'Gestión Multitenant',
            description: 'Seleccione la unidad de negocio para iniciar la gestión operativa.'
        });
    }
};

export default WorkspaceModule;
