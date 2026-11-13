/**
 * ModalService - Servicio unificado y centralizado de gestión de modales del sistema BUSA-I (BUCA OS).
 * =========================================================================
 * Integrado con el sistema Neural Glass y ScrollManager.
 * Desacoplado mediante importaciones dinámicas para evitar ciclos de dependencia.
 */
import { ModalTemplates } from '../templates/ModalTemplates.js';
import { ScrollManager } from '@/shared/ui/utils/ui-helper.js';
import { eventBus } from '@/core/eventBus/index.js';

export class ModalService {
    static isInitialized = false;
    static _backdropBound = false;

    static init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('[ModalService] Initialized unified modal service.');

        // Escuchar cierre global de modales
        eventBus.on('ui:close_modal', () => this.hideModal());

        // Manejar cierre con clic en el fondo oscuro
        const modalBase = document.getElementById('modal-base');
        if (modalBase && !this._backdropBound) {
            modalBase.addEventListener('click', (e) => {
                if (e.target === modalBase) {
                    this.hideModal();
                }
            });
            this._backdropBound = true;
        }

        // Manejar cierre con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const base = document.getElementById('modal-base');
                if (base && base.classList.contains('active')) {
                    this.hideModal();
                }
            }
        });
    }

    /**
     * Muestra un modal utilizando la estructura base definida en el Layout.
     * @param {Object} options
     */
    static showModal({ size = 'md', header = {}, body = '', footer = {} } = {}) {
        this.init();

        const modalBase = document.getElementById('modal-base');
        const modalContainer = document.getElementById('modal-container');

        if (!modalBase || !modalContainer) {
            console.error('[ModalService] No se encontró la estructura base del modal (#modal-base).');
            return;
        }

        // 1. Limpiar clases de tamaño previas y aplicar la nueva
        const sizeClasses = ['modal-full', 'modal-xl', 'modal-lg', 'modal-md', 'modal-sm', 'modal-mini', 'modal-micro'];
        modalContainer.classList.remove(...sizeClasses);
        modalContainer.classList.add(`modal-${size}`);

        // 2. Inyectar contenido en los slots correspondientes
        const slots = {
            'modal-header-left': header.left || '',
            'modal-header-center': header.center || '',
            'modal-header-right': header.right || '',
            'modal-body-content': body || '',
            'modal-footer-left': footer.left || '',
            'modal-footer-center': footer.center || '',
            'modal-footer-right': footer.right || ''
        };

        Object.entries(slots).forEach(([id, content]) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = content;
        });

        // 3. Activar el overlay y bloquear scroll
        modalBase.classList.add('active');
        modalBase.setAttribute('aria-hidden', 'false');
        ScrollManager.lock();

        // 4. Vincular botones de cierre internos
        modalContainer.querySelectorAll('[data-action="ui:close_modal"]').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                this.hideModal();
            };
        });
    }

    /**
     * Oculta el modal activo y libera el bloqueo de pantalla.
     */
    static hideModal() {
        const modalBase = document.getElementById('modal-base');
        if (modalBase) {
            // Remover el foco de cualquier elemento dentro del modal antes de ocultar
            const focusedInside = modalBase.querySelector(':focus');
            if (focusedInside && typeof focusedInside.blur === 'function') {
                focusedInside.blur();
            }
            modalBase.classList.remove('active');
            modalBase.setAttribute('aria-hidden', 'true');
        }
        ScrollManager.forceUnlock();
    }

    static async showSettingsModal() {
        const { default: GraphicsEngine } = await import('@/core/engine/engine.js');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const currentTier = GraphicsEngine?.profile || 'balanced';
        const content = ModalTemplates.settings({ currentTheme, currentTier });

        this.showModal({
            size: 'lg',
            header: ModalTemplates.buildHeader({
                icon: 'bi-gear-fill',
                title: 'Configuraciones del Sistema',
                subtitle: 'PREFERENCIAS GLOBALES Y MOTOR D3'
            }),
            body: content,
            footer: {
                right: '<button type="button" class="btn btn-primary" data-action="ui:close_modal">Cerrar</button>'
            }
        });
        
        setTimeout(async () => {
            const { PerformanceD3Dashboard } = await import('@/modules/workspace/components/PerformanceD3Dashboard.js');
            if (PerformanceD3Dashboard && typeof PerformanceD3Dashboard.init === 'function') {
                PerformanceD3Dashboard.init(currentTier);
            }
        }, 150);
    }

    static showTerminalModal() {
        const stats = { profile: 'balanced', fps: 60, memory: 0.5, latency: 12, uptime: 120 };
        const content = ModalTemplates.terminal(stats);
        this.showModal({
            size: 'md',
            header: ModalTemplates.buildHeader({
                icon: 'bi-terminal-fill',
                title: 'Terminal B.U.C.A',
                subtitle: 'CONSOLA DE SISTEMA'
            }),
            body: content,
            footer: {
                right: '<button type="button" class="btn btn-primary" data-action="ui:close_modal">Cerrar</button>'
            }
        });
    }

    static showHelpModal() {
        const content = ModalTemplates.help();
        this.showModal({
            size: 'md',
            header: ModalTemplates.buildHeader({
                icon: 'bi-headset',
                title: 'Asistencia y Soporte',
                subtitle: 'CANALES DE ATENCIÓN'
            }),
            body: content,
            footer: {
                right: '<button type="button" class="btn btn-primary" data-action="ui:close_modal">Cerrar</button>'
            }
        });
    }

    static showExportReportModal() {
        const content = ModalTemplates.exportReport();
        this.showModal({
            size: 'md',
            header: ModalTemplates.buildHeader({
                icon: 'bi-cloud-arrow-down-fill',
                title: 'Exportar Reporte Maestro',
                subtitle: 'GENERADOR DE DOCUMENTOS ERP'
            }),
            body: content,
            footer: {
                right: '<button type="button" class="btn btn-primary" data-action="ui:close_modal">Cerrar</button>'
            }
        });
    }

    static async showProfileModal(initialTab = 'general') {
        const { default: ProfileController } = await import('@/modules/profile/ProfileController.js');
        const { sessionState } = await import('@/core/state/session.js');
        const { ProfileService } = await import('@/modules/profile/services/ProfileService.js');

        const sessionUser = sessionState.get().user || {};
        let profileData = null;
        if (sessionUser.uid) {
            profileData = await ProfileService.getProfile(sessionUser.uid);
        }

        const userData = {
            uid: sessionUser.uid || '',
            email: sessionUser.email || '',
            displayName: sessionUser.displayName || '',
            profile: profileData || {},
            security: {
                two_factor_enabled: sessionUser.two_factor_enabled || false
            }
        };

        this.showModal({
            size: 'lg',
            header: ModalTemplates.buildHeader({
                icon: 'bi-person-badge',
                title: 'Perfil de Operador & Identidad',
                subtitle: 'CONFIGURACIÓN DE CUENTA Y SEGURIDAD B.U.C.A. AI'
            }),
            body: ModalTemplates.userProfileFull(userData),
            footer: {
                right: '<button type="button" class="btn btn-primary" data-action="ui:close_modal">Cerrar</button>'
            }
        });
        
        setTimeout(() => {
            if (ProfileController && typeof ProfileController.init === 'function') {
                ProfileController.init(initialTab);
            }
        }, 150);
    }

    static async showCreateBusinessModal() {
        const { default: BusinessWizardController } = await import('@/modules/business/BusinessWizardController.js');
        
        this.showModal({
            size: 'lg',
            header: ModalTemplates.buildHeader({
                icon: 'bi-building-add',
                title: 'Asistente de Registro Comercial',
                subtitle: 'NUEVA EMPRESA / COMERCIO EN BUSA-I'
            }),
            body: ModalTemplates.createBusiness(),
            footer: {
                right: `
                    <button type="button" class="btn btn-ghost" data-action="ui:close_modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btn-submit-business-wizard">Registrar Comercio</button>
                `
            }
        });

        setTimeout(() => {
            if (BusinessWizardController && typeof BusinessWizardController.init === 'function') {
                BusinessWizardController.init();
            }
        }, 150);
    }
}

export default ModalService;
