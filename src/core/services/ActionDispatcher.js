/**
 * @fileoverview ActionDispatcher - Maneja la delegación global de clics y acciones UI
 * @module core/services/ActionDispatcher
 */

import { eventBus } from '@/core/eventBus/index.js';
import { ModalService } from '@/shared/ui/overlays/ModalService.js';
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
        const openPerformanceModal = () => {
            import('@/modules/workspace/components/PerformanceModal.js').then((module) => {
                const perfModal = module.default;
                if (perfModal && typeof perfModal.show === 'function') {
                    perfModal.show();
                }
            }).catch(err => console.error('[ActionDispatcher] Error abriendo Gestor de Rendimiento:', err));
        };
        eventBus.on('ui:open_performance', openPerformanceModal);
        eventBus.on('ui:open_perf', openPerformanceModal);

        // Perfil de Usuario (Full-Screen Modal conectado a Supabase)
        eventBus.on('ui:open_profile', (payload) => {
            ModalService.showProfileModal(payload?.tab || 'general');
        });

        // Seguridad PIN y Dispositivos
        eventBus.on('ui:open_security', () => {
            ModalService.showProfileModal('security');
        });

        // Facturación y Planes
        eventBus.on('ui:open_billing', () => {
            ModalService.showProfileModal('subscription');
        });

        // Ajustes (Settings)
        eventBus.on('ui:open_settings', () => {
            ModalService.showSettingsModal();
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
        eventBus.on('ui:export_report', () => {
            ModalService.showExportReportModal();
        });

        // Registro de Actividad (Auditoría)
        eventBus.on('ui:open_activity_log', () => {
            ModalService.showModal({
                size: 'md',
                header: ModalTemplates.buildHeader({
                    icon: 'bi-clock-history',
                    title: 'Auditoría de Actividad',
                    subtitle: 'REGISTRO CRONOLÓGICO DE EVENTOS'
                }),
                body: ModalTemplates.notifications(), 
                footer: {
                    right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Cerrar</button>'
                }
            });
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
        eventBus.on('ui:open_create_business', () => {
            ModalService.showCreateBusinessModal();
        });

        // Navegación Genérica
        eventBus.on('router:navigate', (payload) => {
            if (payload && payload.path) router.navigate(payload.path);
        });

        // Modales Genéricos
        eventBus.on('ui:open_modal', (payload) => {
            ModalService.showModal({
                size: payload.size || 'md',
                header: { left: `<h3>${payload.title || 'Información'}</h3>` },
                body: payload.body || '<p>Contenido no disponible.</p>',
                footer: { right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Entendido</button>' }
            });
        });

        eventBus.on('ui:close_modal', () => {
            ModalService.hideModal();
        });

        // Command Palette (Buscador Ctrl + K)
        eventBus.on('ui:open_search_palette', async () => {
            const { default: palette } = await import('@/shared/ui/components/header/command-palette-modal.js');
            palette.show();
        });

        // Selector Directo de Tema
        eventBus.on('ui:set_theme', (payload) => {
            if (payload?.theme) ThemeManager.setTheme(payload.theme);
        });

        // Copilot / Asistente AI
        eventBus.on('ui:open_ai_assistant', () => {
            eventBus.emit('notifications:push', {
                title: 'BUCA AI Copilot',
                message: 'El asistente de inteligencia empresarial está en fase de despliegue.',
                type: 'info'
            });
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
                body: '<div class="p-3"><p class="text-muted">Plataforma ERP modular con 5 dominios centrales activos: <strong>Auth</strong> (MFA/TOTP), <strong>Workspace</strong> (Dashboard/Telemetría), <strong>Business</strong> (Multi-Tenant Hub), <strong>Finance</strong> (Forex/BCV Sync) y <strong>Profile</strong> (Talento & Ficha). Próximamente: POS e Inventario.</p></div>',
                footer: { right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>' }
            });
        });

        eventBus.on('ui:open_changelog_modal', () => {
            ModalService.showModal({
                size: 'md',
                header: { left: '<span class="fw-bold small text-muted text-uppercase"><i class="bi bi-clock-history me-1"></i> Registro de Cambios (Changelog)</span>' },
                body: '<div class="p-3"><h6 class="fw-bold text-main">Versión v1.1.20-alpha</h6><ul class="small text-muted mb-0 ps-3"><li>Rediseño de Header y Toolbar estilo Supabase Studio.</li><li>Command Palette global con atajo Ctrl + K.</li><li>Navegación SPA fluida y eliminación del storm de sesión.</li><li>Módulo de Perfil: Pestaña Trabajador con Talento y Ficha CRUD.</li><li>Sincronización en vivo de tasas monetarias sin datos quemados.</li></ul></div>',
                footer: { right: '<button type="button" class="btn btn-sm btn-primary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>' }
            });
        });
    }
};
