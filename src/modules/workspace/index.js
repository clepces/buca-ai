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
import { $, $$, $addClass, $removeClass } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export const WorkspaceModule = {
    _actionsBound: false,

    async init() {
        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Workspace', message: 'Módulo de espacio de trabajo inicializado.' });
        if (router && typeof router.addRoutes === 'function') {
            router.addRoutes(workspaceRoutes);
        }
        this.setupDashboard();
        this.setupActions();
    },

    setupActions() {
        if (this._actionsBound) return;
        this._actionsBound = true;

        const openPerformanceModal = async () => {
            const { PerformanceModal } = await import('./components/PerformanceModal.js');
            PerformanceModal.show();
        };

        eventBus.on('ui:open_performance', openPerformanceModal);
        eventBus.on('ui:open_settings', openPerformanceModal);
        eventBus.on('workspace:export_report', async () => {
            const { ExportReportModal } = await import('./components/export-report-modal.js');
            ExportReportModal.show();
        });
        eventBus.on('workspace:filter_context', (data = {}) => {
            const context = data?.context || data?.target || 'all';
            $$('.context-pill').forEach(pill => $removeClass(pill, 'active'));
            const activePill = $(`[data-context="${context}"]`);
            if (activePill) $addClass(activePill, 'active');
            if (context === 'directory') router.navigate('/workspaces');
            else router.navigate('/workspace');
        });
        eventBus.on('workspace:toggle_view_mode', () => eventBus.emit('business:toggle_view'));
    },

    /**
     * Configura el tablero de instrumentos neural.
     */
    setupDashboard() {
        const perf = uiState.get().graphics?.tier || 'balanced';
        const config = WidgetOrchestrator.getLayoutConfig(perf);
        
        Logger.debug({ layer: 'MODULE', role: 'CLASS', target: 'Workspace', message: `Configurando layout para perfil gráfico: ${perf}.`, data: config });
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
