/**
 * SharedActions - Registro central de acciones UI transversales en shared/ui.
 * Desacopla modales y paneles globales del Kernel/ActionDispatcher.
 */
import { eventBus } from '@/core/eventBus/index.js';
import { ModalService } from '@/shared/ui/services/ModalService.js';
import { NotificationTray } from '@/shared/ui/components/notifications/NotificationTray.js';
import { Header } from '@/shared/ui/layouts/components/TopBar.js';
import { $addClass, $removeClass } from '@/shared/utils/dom.js';
import { ENV } from '@/core/config/environment.js';

export const SharedActions = {
    _initialized: false,
    _cleanups: [],

    init() {
        if (this._initialized) return;
        this._initialized = true;

        this._cleanups.push(
            eventBus.on('notifications:filter_tab', (payload = {}) => {
                NotificationTray.setActiveTab(payload.tab || 'all');
                Header.syncNotifications();
            }),
            eventBus.on('settings:toggle_glass', ({ trigger } = {}) => {
                if (!trigger) return;
                if (trigger.checked) $removeClass(document.body, 'disable-glass');
                else $addClass(document.body, 'disable-glass');
            }),
            eventBus.on('ui:open_activity_log', async () => {
                const { AuditTerminalModal } = await import('@/shared/ui/components/audit/audit-terminal-modal.js');
                AuditTerminalModal.show();
            }),
            eventBus.on('ui:open_search_palette', async () => {
                const { default: palette } = await import('@/shared/ui/components/header/command-palette-modal.js');
                palette.show();
            }),
            eventBus.on('ui:open_ai_assistant', async () => {
                const { AICopilotModal } = await import('@/shared/ui/components/ai-copilot/ai-copilot-modal.js');
                AICopilotModal.show();
            }),
            eventBus.on('feedback:select_type', (payload = {}) => {
                eventBus.emit('header:close_all_panels');
                eventBus.emit('notifications:push', {
                    title: 'Feedback Registrado',
                    message: `Gracias por tu ${payload?.type === 'idea' ? 'sugerencia' : 'reporte'}. Se ha canalizado al backlog.`,
                    type: 'success'
                });
            }),
            eventBus.on('ui:open_features_modal', () => {
                ModalService.showModal({
                    id: 'features-modal',
                    scope: 'global',
                    size: 'lg',
                    header: {
                        left: {
                            icon: 'bi-grid-3x3-gap',
                            title: 'Ecosistema Modular BUCA AI',
                            subtitle: 'Arquitectura Clean Core & dominios activos'
                        }
                    },
                    body: {
                        html: '<p class="text-muted mb-0">ERP modular con dominios activos: <strong>Auth</strong>, <strong>Workspace</strong>, <strong>Business</strong>, <strong>Finance</strong> y <strong>Profile</strong>.</p>'
                    },
                    footer: { right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>' }
                });
            }),
            eventBus.on('ui:open_changelog_modal', () => {
                ModalService.showModal({
                    id: 'changelog-modal',
                    scope: 'global',
                    size: 'md',
                    header: {
                        left: {
                            icon: 'bi-clock-history',
                            title: 'Registro de Cambios',
                            subtitle: `Versión actual v${ENV.APP_VERSION}`,
                            badge: { text: `v${ENV.APP_VERSION}`, tone: 'primary' }
                        }
                    },
                    body: {
                        html: `<h6 class="fw-bold text-main">Novedades v${ENV.APP_VERSION}</h6><ul class="small text-muted mb-0 ps-3"><li>Hardening de recuperación de contraseña y step-up MFA AAL2.</li><li>Command Palette global Ctrl + K con navegación por teclado.</li><li>ModalServiceV2 base sólida con Focus Trap y Drill-down Menu.</li><li>Desacoplamiento Clean Core de ActionDispatcher.</li></ul>`
                    },
                    footer: { right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>' }
                });
            })
        );
    },

    destroy() {
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this._initialized = false;
    }
};

export default SharedActions;
