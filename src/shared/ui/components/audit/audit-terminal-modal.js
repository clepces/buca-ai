/**
 * @fileoverview AuditTerminalModal - Consola de Auditoría y Trazabilidad en Tiempo Real
 * @module shared/ui/components/audit/audit-terminal-modal
 * =========================================================================
 * Clean Core Vanilla JS - 0 Frameworks, memoria gestionada con ModalService.
 * =========================================================================
 */
import { ModalService } from '@/shared/ui/services/ModalService.js';
import { terminalTemplate } from '@/shared/ui/templates/modals/_system_modals.js';
import { ActivityLogService } from '@/core/services/ActivityLogService.js';
import { sessionState } from '@/core/state/session.js';
import { $id, $on } from '@/shared/utils/dom.js';

export const AuditTerminalModal = {
    async show() {
        const user = sessionState.get()?.user;
        const tenant = sessionState.get()?.tenantId || 'global';
        const recentLogs = await ActivityLogService.getRecentActivities(10);

        ModalService.showModal({
            size: 'lg',
            header: {
                left: `
                    <div class="d-flex align-items-center gap-2">
                        <div class="p-1.5 rounded-2 bg-dark text-light d-flex align-items-center justify-content-center">
                            <i class="bi bi-terminal fs-6"></i>
                        </div>
                        <div>
                            <h6 class="fw-bold mb-0 text-main" style="font-size:0.95rem;">Consola de Auditoría & Trazabilidad</h6>
                            <span class="x-small text-muted">Registro inmutable de eventos y telemetría de Kernel</span>
                        </div>
                        <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill ms-2 px-2" style="font-size:0.65rem;">ONLINE</span>
                    </div>
                `,
                right: `
                    <button type="button" class="btn btn-sm btn-subtle text-muted rounded-pill px-2.5 py-1 x-small" data-action="ui:close_modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                `
            },
            body: `
                <div class="audit-modal-content p-1" id="audit-modal-view">
                    <!-- Nav Tabs Segmentados -->
                    <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                        <div class="d-flex align-items-center gap-2">
                            <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 py-1 x-small fw-semibold audit-tab-btn" id="btn-tab-terminal" data-tab="terminal">
                                <i class="bi bi-cpu me-1"></i> Shell BENE
                            </button>
                            <button type="button" class="btn btn-sm btn-subtle text-muted rounded-pill px-3 py-1 x-small fw-semibold audit-tab-btn" id="btn-tab-logs" data-tab="logs">
                                <i class="bi bi-clock-history me-1"></i> Bitácora Supabase (${recentLogs.length})
                            </button>
                        </div>
                        <div class="x-small text-muted d-none d-sm-block">
                            Tenant: <code>${tenant}</code>
                        </div>
                    </div>

                    <!-- Panel 1: Shell BENE -->
                    <div class="audit-tab-panel" id="panel-audit-terminal">
                        ${terminalTemplate({
                            profile: 'BENE v5.4.0 (Balanced)',
                            fps: 60,
                            memory: '0.45',
                            latency: '18',
                            uptime: Math.floor(performance.now() / 1000)
                        })}
                    </div>

                    <!-- Panel 2: Bitácora de Eventos -->
                    <div class="audit-tab-panel d-none" id="panel-audit-logs">
                        <div class="audit-logs-list d-flex flex-column gap-2" style="max-height: 280px; overflow-y: auto;">
                            ${this._renderLogRows(recentLogs)}
                        </div>
                    </div>
                </div>
            `,
            footer: {
                left: '<span class="x-small text-muted"><i class="bi bi-shield-lock me-1"></i> Tabla inmutable: <code>public.activity_log</code></span>',
                right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-4" data-action="ui:close_modal">Cerrar</button>'
            }
        });

        this._bindEvents();
    },

    _renderLogRows(logs) {
        if (!logs || logs.length === 0) {
            return `
                <div class="text-center py-4 text-muted">
                    <i class="bi bi-shield-check fs-2 opacity-50 d-block mb-1"></i>
                    <p class="small mb-0">No hay registros recientes en la bitácora.</p>
                </div>
            `;
        }

        return logs.map(log => {
            const time = log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'Ahora';
            const catBadge = log.category === 'seguridad' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary';
            return `
                <div class="p-2 rounded-2 border bg-card d-flex align-items-center justify-content-between gap-2 shadow-xs">
                    <div class="d-flex align-items-center gap-2 min-w-0">
                        <span class="badge ${catBadge} rounded-pill px-2 py-0.5 x-small">${log.action || 'EVENTO'}</span>
                        <div class="min-w-0">
                            <strong class="d-block small text-main text-truncate">${log.title || 'Acción de Usuario'}</strong>
                            <span class="d-block x-small text-muted text-truncate">${log.description || 'Sin descripción adicional'}</span>
                        </div>
                    </div>
                    <span class="x-small text-muted text-nowrap">${time}</span>
                </div>
            `;
        }).join('');
    },

    _bindEvents() {
        const btnTerminal = $id('btn-tab-terminal');
        const btnLogs = $id('btn-tab-logs');
        const panelTerminal = $id('panel-audit-terminal');
        const panelLogs = $id('panel-audit-logs');

        const switchTab = (tab) => {
            if (tab === 'terminal') {
                btnTerminal.className = 'btn btn-sm btn-primary rounded-pill px-3 py-1 x-small fw-semibold audit-tab-btn';
                btnLogs.className = 'btn btn-sm btn-subtle text-muted rounded-pill px-3 py-1 x-small fw-semibold audit-tab-btn';
                panelTerminal.classList.remove('d-none');
                panelLogs.classList.add('d-none');
            } else {
                btnLogs.className = 'btn btn-sm btn-primary rounded-pill px-3 py-1 x-small fw-semibold audit-tab-btn';
                btnTerminal.className = 'btn btn-sm btn-subtle text-muted rounded-pill px-3 py-1 x-small fw-semibold audit-tab-btn';
                panelLogs.classList.remove('d-none');
                panelTerminal.classList.add('d-none');
            }
        };

        if (btnTerminal) $on(btnTerminal, 'click', () => switchTab('terminal'));
        if (btnLogs) $on(btnLogs, 'click', () => switchTab('logs'));
    }
};

export default AuditTerminalModal;
