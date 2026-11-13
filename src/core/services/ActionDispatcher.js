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

export const ActionDispatcher = {
    _initialized: false,

    init() {
        if (this._initialized) return;
        this._initialized = true;

        console.log('[ActionDispatcher] -> Conectando cables de interfaz (Global Click Delegation)');

        // Delegación Global de Clics
        document.addEventListener('click', (e) => {
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
                    console.error('[ActionDispatcher] Error procesando payload:', err); 
                }

                if (target) payload.target = target;
                payload.trigger = actionEl;

                console.log(`[ActionDispatcher] -> Dispatching: ${action}`, payload);
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
                console.error('[ActionDispatcher] Logout error:', err);
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (e) {
                    console.warn('[ActionDispatcher] Silent logout cleanup:', e.message);
                }
                setTimeout(() => {
                    ModalService.hideModal();
                    window.location.href = '/';
                }, 800);
            }
        });

        // Navegación de Negocios
        eventBus.on('ui:enter_business', () => {
            router.navigate('/workspace');
        });

        // Filtros de Contexto
        eventBus.on('workspace:filter_context', (data = {}) => {
            const context = data?.context || data?.target || 'all';
            document.querySelectorAll('.context-pill').forEach(pill => pill.classList.remove('active'));
            const activePill = document.querySelector(`[data-context="${context}"]`);
            if (activePill) activePill.classList.add('active');

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
    }
};
