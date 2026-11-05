/**
 * WorkspaceNavRibbon - Barra de Navegación y Controles del Workspace (BNE v5.4)
 * =========================================================================
 * Refactorización Phase 5: Robustez de Acciones, Rediseño BCV Premium y 
 * Corrección del Menú de Desbordamiento (3-Dots).
 * =========================================================================
 */
import { eventBus } from '@/core/eventBus/index.js';

export const WorkspaceNavRibbon = {
    render() {
        // Tasa BCV Inicial (Se actualizará reactivamente vía eventBus)
        const bcvRate = '889.58';
        const bcvTrend = 'up'; // up, down, stable
        const bcvPercent = '+0.12%';

        return `
            <div class="workspace-navigation-ribbon" role="toolbar" aria-label="Navegación y controles del Workspace">
                <div class="ribbon-content container-max">
                    <!-- Left Zone: Breadcrumbs, Context Pills & Live BCV -->
                    <div class="ws-ribbon-left">
                        <div class="breadcrumb-trail d-none d-lg-flex" aria-label="Ubicación">
                            <div class="crumb" data-action="router:navigate" data-payload='{"path": "/workspace"}' title="Ir al Panel Principal">
                                <i class="bi bi-buildings-fill crumb-icon text-primary"></i>
                                <span>Workspace</span>
                            </div>
                            <div class="crumb-separator"><i class="bi bi-chevron-right"></i></div>
                            <div class="crumb active">
                                <span class="crumb-badge-live"></span>
                                <span>Panel de Control</span>
                            </div>
                        </div>

                        <!-- Segmented Pills (Adaptable para móvil y escritorio) -->
                        <div class="ws-context-segmented d-flex" role="tablist">
                            <button type="button" class="context-pill active" data-action="workspace:filter_context" data-context="all" role="tab" aria-selected="true" title="Ver todas mis unidades">
                                <i class="bi bi-briefcase-fill text-primary"></i>
                                <span class="pill-text d-none d-sm-inline">Mis Negocios</span>
                                <span class="pill-count">0</span>
                            </button>
                            <button type="button" class="context-pill" data-action="workspace:filter_context" data-context="directory" role="tab" aria-selected="false" title="Explorar directorio global">
                                <i class="bi bi-diagram-3"></i>
                                <span class="pill-text d-none d-sm-inline">Directorio</span>
                            </button>
                        </div>

                        <!-- Premium BCV Metric Display -->
                        <div class="ws-live-metrics d-flex align-items-center">
                            <div class="live-bcv-capsule d-flex align-items-center gap-2 clickable shadow-xs" 
                                 data-action="ui:open_rate" 
                                 title="Gestión de Tasa BCV Oficial">
                                <div class="bcv-icon-box">
                                    <i class="bi bi-currency-exchange fs-6"></i>
                                </div>
                                <div class="bcv-info-stack d-flex flex-column">
                                    <div class="d-flex align-items-center gap-1">
                                        <span class="text-muted fw-bold bcv-label">TASA BCV</span>
                                        <span class="bcv-trend-badge ${bcvTrend === 'up' ? 'text-success' : (bcvTrend === 'down' ? 'text-danger' : 'text-muted')}">
                                            <i class="bi ${bcvTrend === 'up' ? 'bi-caret-up-fill' : (bcvTrend === 'down' ? 'bi-caret-down-fill' : 'bi-dash')}"></i> ${bcvPercent}
                                        </span>
                                    </div>
                                    <span class="fw-bold text-main bcv-val">Bs. ${bcvRate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Zone: Quick Actions & Controls -->
                    <div class="ws-ribbon-right">
                        <!-- Primary Action: Nueva Unidad -->
                        <button type="button" class="ws-btn-primary shadow-sm" data-action="ui:open_create_business" title="Registrar Nueva Unidad de Negocio">
                            <i class="bi bi-plus-lg"></i>
                            <span class="ws-btn-label">Nueva Unidad</span>
                        </button>

                        <div class="ws-ribbon-divider d-none d-sm-block"></div>

                        <!-- Quick Actions Cluster -->
                        <div class="ws-actions-cluster d-flex align-items-center gap-1.5 position-relative">
                            <!-- Direct Action Icons (Tablet / Desktop) -->
                            <div class="ws-direct-actions d-none d-md-flex align-items-center gap-1">
                                <button type="button" class="action-mini-pill" title="Alternar Vista" data-action="workspace:toggle_view_mode">
                                    <i class="bi bi-grid-fill"></i>
                                </button>
                                
                                <button type="button" class="action-mini-pill" title="Sincronizar Datos Operativos" data-action="workspace:refresh_data">
                                    <i class="bi bi-arrow-clockwise"></i>
                                </button>
                                
                                <button type="button" class="action-mini-pill" title="Descargar Reporte Mensual" data-action="ui:export_report">
                                    <i class="bi bi-cloud-arrow-down"></i>
                                </button>

                                <button type="button" class="action-mini-pill" title="Ajustes del Workspace" data-action="ui:open_settings">
                                    <i class="bi bi-sliders2"></i>
                                </button>
                            </div>

                            <!-- Three Dots Overflow Menu Toggle -->
                            <div class="dropdown-wrapper">
                                <button type="button" class="action-mini-pill d-inline-flex" id="ws-actions-overflow-toggle" title="Más Opciones" data-action="workspace:toggle_overflow">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>

                                <!-- Dropdown Menu for Overflow Actions -->
                                <div class="ws-actions-dropdown shadow-lg rounded-4 border d-none" id="ws-actions-dropdown">
                                    <div class="p-2">
                                        <!-- Mobile Only Actions -->
                                        <div class="d-md-none border-bottom pb-2 mb-2">
                                            <button type="button" class="dropdown-item-btn" data-action="workspace:toggle_view_mode">
                                                <i class="bi bi-grid-fill"></i>
                                                <span class="ws-dropdown-label">Cambiar Vista</span>
                                            </button>
                                            <button type="button" class="dropdown-item-btn" data-action="workspace:refresh_data">
                                                <i class="bi bi-arrow-clockwise"></i>
                                                <span class="ws-dropdown-label">Sincronizar Datos</span>
                                            </button>
                                            <button type="button" class="dropdown-item-btn" data-action="ui:export_report">
                                                <i class="bi bi-cloud-arrow-down"></i>
                                                <span class="ws-dropdown-label">Exportar Reporte</span>
                                            </button>
                                            <button type="button" class="dropdown-item-btn" data-action="ui:open_settings">
                                                <i class="bi bi-sliders2"></i>
                                                <span class="ws-dropdown-label">Ajustes</span>
                                            </button>
                                        </div>
                                        
                                        <!-- Overflow-only Actions -->
                                        <button type="button" class="dropdown-item-btn" data-action="ui:open_activity_log">
                                            <i class="bi bi-clock-history"></i>
                                            <span class="ws-dropdown-label">Auditoría y Actividad</span>
                                        </button>
                                        <button type="button" class="dropdown-item-btn" data-action="ui:open_modal" data-payload='{"title": "Ayuda & Documentación"}'>
                                            <i class="bi bi-question-circle"></i>
                                            <span class="ws-dropdown-label">Ayuda del Sistema</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    mount(targetSlotId = 'workspace-nav-slot') {
        const slot = document.getElementById(targetSlotId);
        if (!slot) return;
        slot.innerHTML = this.render();
        this.init();
    },

    init() {
        const ribbon = document.querySelector('.workspace-navigation-ribbon');
        if (!ribbon || ribbon._bucaInit) return;
        ribbon._bucaInit = true;

        // Cargar contador real de empresas desde Firestore
        const updateBusinessCount = async () => {
            try {
                const { businessService } = await import('@/modules/workspace/services/BusinessService.js');
                const res = await businessService.getUserBusinesses();
                const count = (res.success && Array.isArray(res.data)) ? res.data.length : 0;
                ribbon.querySelectorAll('.pill-count').forEach(el => {
                    el.textContent = count;
                });
            } catch (err) {
                console.warn('[WorkspaceNavRibbon] Error consultando negocios reales:', err);
            }
        };

        updateBusinessCount();

        // Delegated click handler for robust UI interactions
        ribbon.addEventListener('click', (e) => {
            const overflowBtn = e.target.closest('#ws-actions-overflow-toggle');
            if (overflowBtn) {
                e.stopPropagation();
                // Emitir evento para abrir el modal de acciones rápidas
                eventBus.emit('ui:open_quick_actions');
                return;
            }

            // Manejar otros botones con data-action
            const actionBtn = e.target.closest('[data-action]');
            if (actionBtn) {
                const action = actionBtn.getAttribute('data-action');
                if (action && action !== 'workspace:toggle_overflow') {
                    let payload = {};
                    const rawPayload = actionBtn.getAttribute('data-payload');
                    if (rawPayload) {
                        try { 
                            payload = JSON.parse(rawPayload); 
                        } catch {
                            payload = {};
                        }
                    }
                    if (actionBtn.dataset) {
                        Object.assign(payload, actionBtn.dataset);
                    }
                    eventBus.emit(action, payload);
                }
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!ribbon.contains(e.target)) {
                const dropdown = ribbon.querySelector('#ws-actions-dropdown');
                if (dropdown) dropdown.classList.add('d-none');
            }
        });

        // Listen for rate changes globally
        eventBus.on('buca:rate_change', ({ rate }) => {
            const valEl = ribbon.querySelector('.bcv-val');
            if (valEl && rate) {
                valEl.textContent = `Bs. ${Number(rate).toFixed(2)}`;
            }
        });

        // Listen for business creations and refreshes
        eventBus.on('workspace:business_created', () => updateBusinessCount());
        eventBus.on('workspace:refresh_data', (payload) => {
            updateBusinessCount();
            const icon = ribbon.querySelector('.bi-arrow-clockwise');
            if (icon) {
                icon.classList.add('spin-anim');
                setTimeout(() => icon.classList.remove('spin-anim'), 1000);
            }
        });
    }
};

export default WorkspaceNavRibbon;
