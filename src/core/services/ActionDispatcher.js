/**
 * @fileoverview ActionDispatcher - Maneja la delegación global de clics y acciones UI
 * @module core/services/ActionDispatcher
 */

import { eventBus } from '@/core/eventBus/index.js';
import { ModalService } from '@/shared/ui/services/ModalService.js';
import { ModalTemplates } from '@/shared/ui/templates/ModalTemplates.js';
import { router } from '@/core/router/router.js';
import { NotificationService } from '@/core/services/NotificationService.js';
import { NotificationTray } from '@/shared/ui/components/notifications/NotificationTray.js';
import { Header } from '@/shared/ui/layouts/components/TopBar.js';
import { $, $$, $on, $addClass, $removeClass } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';
import { sessionState } from '@/core/state/session.js';
import { safeReload } from '@/core/utils/system-helper.js';
import { ThemeManager } from '@/core/services/ThemeManager.js';

export const ActionDispatcher = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        Logger.info('ActionDispatcher', 'Conectando cables de interfaz (Global Click Delegation)');

        // Delegación Global de Clics
        $on(document, 'click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (actionEl) {
                // Prevenir burbujeo si ya fue manejado por un componente interno con lógica específica
                if (e._bucaActionHandled) return;
                
                const action = actionEl.getAttribute('data-action');
                const target = actionEl.getAttribute('data-target');
                let payload = {};
                
                // Extraer todos los atributos data-* como payload base
                Array.from(actionEl.attributes).forEach(attr => {
                    if (attr.name.startsWith('data-')) {
                        const key = attr.name.slice(5).replace(/-([a-z])/g, g => g[1].toUpperCase());
                        if (key !== 'action' && key !== 'target' && key !== 'payload') {
                            payload[key] = attr.value;
                        }
                    }
                });

                try {
                    const rawPayload = actionEl.getAttribute('data-payload');
                    if (rawPayload) Object.assign(payload, JSON.parse(rawPayload));
                } catch (err) { 
                    Logger.error('ActionDispatcher', 'Error procesando payload:', err); 
                }

                if (target) payload.target = target;
                payload.trigger = actionEl;

                // Detección de elementos estáticos o en desarrollo
                const status = actionEl.getAttribute('data-status');
                if (status === 'in-development' || actionEl.hasAttribute('disabled') || actionEl.classList.contains('disabled-dev-item')) {
                    e.preventDefault();
                    eventBus.emit('notifications:push', {
                        title: 'Función en Desarrollo',
                        message: `La opción "${action}" está planificada en el roadmap del sistema.`,
                        type: 'info'
                    });
                    Logger.info('ActionDispatcher', `Elemento en desarrollo seleccionado: ${action}`);
                    return;
                }

                Logger.info('ActionDispatcher', `Dispatching: ${action}`, payload);

                // Detección de acciones no implementadas o rotas
                if (!eventBus.hasListeners(action)) {
                    Logger.warn('ActionDispatcher', `[Unbound Action] Sin suscriptor activo para: "${action}". Elemento:`, actionEl);
                    eventBus.emit('notifications:push', {
                        title: 'Función en Desarrollo',
                        message: `La función "${action}" aún no tiene un módulo conectado.`,
                        type: 'warning'
                    });
                    return;
                }

                eventBus.emit(action, payload);
            }
        });

        // --- REGISTRO DE ACCIONES GLOBALES ---

        // Ciclo de Vida de Notificaciones
        eventBus.on('notifications:mark_as_read', (payload) => {
            const id = payload.id;
            if (id) {
                NotificationService.markAsRead(id);
            }
        });

        eventBus.on('ui:clear_notifications', () => {
            NotificationService.clearNotifications();
        });

        eventBus.on('tray:filter_tab', (payload) => {
            const tab = payload.tab || 'all';
            NotificationTray.setActiveTab(tab);
            Header.syncNotifications();
        });

        // Gestión de Tasa BCV: despachada de forma única por FinanceModule para evitar doble apertura
        // eventBus.on('ui:open_rate', ...) delegado al FinanceModule (RateController)

        // Gestor de Rendimiento / Telemetría Gráfica D3
        const openPerformanceModal = async () => {
            const { PerformanceModal } = await import('@/modules/workspace/components/PerformanceModal.js');
            PerformanceModal.show();
        };
        eventBus.on('ui:open_performance', openPerformanceModal);
        eventBus.on('ui:open_perf', openPerformanceModal);

        // Perfil de Usuario y Seguridad
        eventBus.on('ui:open_profile', async (p) => {
            const { ProfileModal } = await import('@/modules/profile/components/profile-modal.js');
            ProfileModal.show(p?.tab || 'general');
        });
        eventBus.on('ui:open_security', async () => {
            const { ProfileModal } = await import('@/modules/profile/components/profile-modal.js');
            ProfileModal.show('security');
        });
        eventBus.on('ui:open_billing', async () => {
            const { ProfileModal } = await import('@/modules/profile/components/profile-modal.js');
            ProfileModal.show('subscription');
        });

        // Ajustes (Settings)
        eventBus.on('ui:open_settings', async () => {
            const { PerformanceModal } = await import('@/modules/workspace/components/PerformanceModal.js');
            PerformanceModal.show();
        });

        eventBus.on('settings:toggle_glass', ({ trigger }) => {
            if (trigger) {
                if (trigger.checked) {
                    $removeClass(document.body, 'disable-glass');
                } else {
                    $addClass(document.body, 'disable-glass');
                }
            }
        });

        // Exportar Reportes
        eventBus.on('ui:export_report', async () => {
            const { ExportReportModal } = await import('@/modules/workspace/components/export-report-modal.js');
            ExportReportModal.show();
        });

        // Registro de Actividad (Auditoría)
        eventBus.on('ui:open_activity_log', async () => {
            const { AuditTerminalModal } = await import('@/shared/ui/components/audit/audit-terminal-modal.js');
            AuditTerminalModal.show();
        });

        // Logout
        eventBus.on('ui:logout', async () => {
            ModalService.showModal({
                size: 'micro',
                header: { left: '<h3>Cierre de Sesión</h3>' },
                body: '<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div><p class="small text-muted mb-0">Desconectando de forma segura...</p></div>'
            });

            try {
                const { AuthService } = await import('@/modules/auth/services/AuthService.js');
                await AuthService.logout();
            } catch (err) {
                Logger.error('ActionDispatcher', 'Logout error:', err);
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (e) {
                    Logger.warn('ActionDispatcher', 'Silent logout cleanup:', e.message);
                }
                setTimeout(() => {
                    ModalService.hideModal();
                    safeReload('/');
                }, 800);
            }
        });

        // Navegación y Selección de Negocios
        eventBus.on('ui:enter_business', (payload = {}) => {
            const bizId = payload?.id || payload?.businessId;
            if (bizId && bizId !== 'Dashboard') {
                sessionState.set({ tenantId: bizId });
                Logger.info('ActionDispatcher', `Unidad comercial activa establecida en sesión: ${bizId}`);
                eventBus.emit('business:selected', { id: bizId });
                eventBus.emit('notifications:push', {
                    title: 'Unidad Seleccionada',
                    message: `Comercio activo establecido en la sesión.`,
                    type: 'info'
                });
            }
            ModalService.closeModal();
            router.navigate('/workspace');
        });

        // Filtros de Contexto
        eventBus.on('workspace:filter_context', (data = {}) => {
            const context = data?.context || data?.target || 'all';
            $$('.context-pill').forEach(pill => $removeClass(pill, 'active'));
            const activePill = $(`[data-context="${context}"]`);
            if (activePill) $addClass(activePill, 'active');

            if (context === 'directory') {
                router.navigate('/workspaces');
            } else {
                router.navigate('/workspace');
            }
        });

        // Creación de Negocio
        eventBus.on('ui:open_create_business', async () => {
            const { BusinessWizardModal } = await import('@/modules/business/components/business-wizard-modal.js');
            BusinessWizardModal.show();
        });

        // Navegación Genérica y Modales
        eventBus.on('router:navigate', (p) => { if (p?.path) router.navigate(p.path); });
        eventBus.on('ui:open_modal', (p) => {
            ModalService.showModal({
                size: p.size || 'md',
                header: { left: `<h3>${p.title || 'Información'}</h3>` },
                body: p.body || '<p>Contenido no disponible.</p>',
                footer: { right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Entendido</button>' }
            });
        });
        eventBus.on('ui:close_modal', () => ModalService.hideModal());

        // Command Palette (Buscador Ctrl + K)
        eventBus.on('ui:open_search_palette', async () => {
            const { default: palette } = await import('@/shared/ui/components/header/command-palette-modal.js');
            palette.show();
        });

        // Selector Directo de Tema
        eventBus.on('ui:set_theme', (p) => { if (p?.theme) ThemeManager.setTheme(p.theme); });

        // Copilot / Asistente AI
        eventBus.on('ui:open_ai_assistant', async () => {
            const { AICopilotModal } = await import('@/shared/ui/components/ai-copilot/ai-copilot-modal.js');
            AICopilotModal.show();
        });

        // Feedback & Ideas
        eventBus.on('feedback:select_type', (payload) => {
            eventBus.emit('header:close_all_panels');
            eventBus.emit('notifications:push', {
                title: 'Feedback Registrado',
                message: `Gracias por tu ${payload?.type === 'idea' ? 'sugerencia' : 'reporte'}. Se ha canalizado al backlog.`,
                type: 'success'
            });
        });

        // Alternar vista del BusinessHub
        eventBus.on('workspace:toggle_view_mode', () => {
            eventBus.emit('business:toggle_view');
        });

        // Funciones de la App & Changelog
        eventBus.on('ui:open_features_modal', () => {
            ModalService.showModal({
                size: 'lg',
                header: { left: '<span class="fw-bold small text-muted text-uppercase"><i class="bi bi-grid-3x3-gap me-1"></i> Ecosistema Modular BUCA AI</span>' },
                body: '<div class="p-3"><p class="text-muted mb-0">ERP modular con 5 dominios activos: <strong>Auth</strong>, <strong>Workspace</strong>, <strong>Business</strong>, <strong>Finance</strong> y <strong>Profile</strong>.</p></div>',
                footer: { right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>' }
            });
        });

        eventBus.on('ui:open_changelog_modal', () => {
            ModalService.showModal({
                size: 'md',
                header: { left: '<span class="fw-bold small text-muted text-uppercase"><i class="bi bi-clock-history me-1"></i> Registro de Cambios</span>' },
                body: '<div class="p-3"><h6 class="fw-bold text-main">Versión v1.1.23-alpha</h6><ul class="small text-muted mb-0 ps-3"><li>Breakpoints BUCA v6 (lg:1024, xl:1280, 2xl:1536, 3xl:1920, 4xl:2560).</li><li>Command Palette global Ctrl + K.</li><li>Tooltips Neural reactivos con edge detection.</li><li>Refactor modular de modales desacoplados.</li></ul></div>',
                footer: { right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>' }
            });
        });
    }
};
