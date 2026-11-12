/**
 * WorkspacePage - Vista Principal Consolidada del Ecosistema Operativo BUCA
 * =========================================================================
 * Orquesta los submódulos modulares del Workspace en Secciones Responsivas de 2 Columnas:
 * - Banner Corporativo con Acordeón
 * - Franja de Telemetría Avanzada (Tasas BCV, Ventas, Staff, Servidor)
 * - Business Hub (Mis Negocios con Selector de Perspectiva Carrusel / Cuadrícula / Lista)
 * - Fila 1 (2 Cols): Actividad Reciente (Izquierda) + Centro de Control Operativo (Derecha)
 * - Fila 2 (2 Cols): Infraestructura & Rendimiento (Izquierda) + Monitoreo Cloud & Hardware (Derecha)
 * =========================================================================
 */
import { WidgetOrchestrator } from '../logic/WidgetOrchestrator.js';
import { uiState } from '@/core/state/ui.js';
import { sessionState } from '@/core/state/session.js';
import { SkeletonLoader } from '@/shared/ui/components/skeleton/SkeletonLoader.js';

// Workspace Components
import { BannerComponent } from '../components/BannerComponent.js';
import { TelemetryComponent } from '../components/TelemetryComponent.js';
import { QuickActionsControl } from '../components/QuickActionsControl.js';
import { RecentActivity } from '../components/RecentActivity.js';
import { SystemWidgets } from '../components/SystemWidgets.js';
import { SystemHealthMonitor } from '../components/SystemHealthMonitor.js';
import { WorkspaceNavRibbon } from '../components/WorkspaceNavRibbon.js';

// Business Module Components
import { BusinessHub } from '@/modules/business/components/BusinessHub.js';

export const WorkspacePage = {
    renderSkeleton() {
        return SkeletonLoader.renderWorkspaceSkeleton();
    },
    render() {
        const { user } = sessionState.get();
        const displayName = user?.displayName || user?.email || 'Usuario';
        const perfTier = uiState.get().graphics?.tier || 'balanced';
        const config = WidgetOrchestrator.getLayoutConfig(perfTier);
        const showAll = config.includes('all');
        
        return `
            <div class="workspace-layout-content fade-in">
                <!-- Branded Banner & Onboarding Accordion -->
                <div class="mb-4">
                    ${BannerComponent.render(displayName)}
                </div>

                <!-- Advanced Telemetry Strip (BCV, Ventas, Staff, Servidor) -->
                ${(showAll || config.includes('stats-strip')) ? `
                    <div class="mb-4">
                        ${TelemetryComponent.render()}
                    </div>
                ` : ''}

                <!-- Business Hub (Mis Negocios) -->
                ${(showAll || config.includes('business-carousel') || config.includes('business-list')) ? `
                    <div class="mb-4">
                        ${BusinessHub.render()}
                    </div>
                ` : ''}

                <!-- Row 1: 2-Column Section (Actividades Recientes | Centro de Control Operativo) -->
                <div class="row g-4 mb-4 align-items-stretch">
                    <div class="col-12 col-lg-7 d-flex flex-column">
                        ${RecentActivity.render()}
                    </div>
                    <div class="col-12 col-lg-5 d-flex flex-column">
                        ${QuickActionsControl.render()}
                    </div>
                </div>

                <!-- Row 2: Infrastructure & Health Monitor -->
                <div class="row g-4 mb-4 align-items-stretch">
                    <div class="col-12 col-lg-7 d-flex flex-column">
                        ${SystemWidgets.render()}
                    </div>
                    <div class="col-12 col-lg-5 d-flex flex-column">
                        ${SystemHealthMonitor.render()}
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        console.log('[WorkspacePage] -> Full Neural Workspace initialized');
        
        // Mount Navigation Ribbon
        WorkspaceNavRibbon.mount('workspace-nav-slot');

        // Initialize all active workspace modules
        BannerComponent.init();
        if (typeof TelemetryComponent.init === 'function') TelemetryComponent.init();
        if (typeof BusinessHub.init === 'function') BusinessHub.init();
        if (typeof RecentActivity.init === 'function') RecentActivity.init();
        if (typeof SystemWidgets.init === 'function') SystemWidgets.init();
        if (typeof SystemHealthMonitor.init === 'function') SystemHealthMonitor.init();
    },
    destroy() {
        console.log('[WorkspacePage] -> Destroying workspace components...');
        if (typeof BusinessHub.destroy === 'function') BusinessHub.destroy();
        if (typeof RecentActivity.destroy === 'function') RecentActivity.destroy();
        if (typeof WorkspaceNavRibbon.unmount === 'function') WorkspaceNavRibbon.unmount();
    }
};
export default WorkspacePage;
