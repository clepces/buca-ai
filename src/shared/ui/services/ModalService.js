/**
 * ModalService - Servicio global y universal de gestión de modales del sistema BUCA AI.
 * =========================================================================
 * Clean Core Architecture: Servicio genérico desacoplado de dominios de negocio.
 * Integrado con el sistema Neural Glass y ScrollManager.
 * =========================================================================
 */
import { ScrollManager } from '@/shared/ui/utils/ui-helper.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $, $mount, $on, $addClass, $removeClass, $attr, $$ } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export class ModalService {
    static isInitialized = false;
    static _backdropBound = false;
    static _currentOnClose = null;
    static _cleanups = [];

    /**
     * Inicializa listeners globales de modales.
     */
    static init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        Logger.info('ModalService', 'Servicio global de modales inicializado.');

        // Escuchar cierre global de modales
        this._cleanups.push(eventBus.on('ui:close_modal', () => this.hideModal()));

        // Manejar cierre con clic en el fondo oscuro
        const modalBase = $id('modal-base');
        if (modalBase && !this._backdropBound) {
            this._cleanups.push($on(modalBase, 'click', (e) => {
                if (e.target === modalBase) {
                    this.hideModal();
                }
            }));
            this._backdropBound = true;
        }

        // Manejar cierre con tecla Escape
        this._cleanups.push($on(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                const base = $id('modal-base');
                if (base && base.classList.contains('active')) {
                    this.hideModal();
                }
            }
        }));
    }

    static destroy() {
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this.isInitialized = false;
        this._backdropBound = false;
    }

    /**
     * Muestra un modal utilizando la estructura base definida en el Layout.
     * @param {Object} options
     * @param {string} options.size - 'full' | 'xl' | 'lg' | 'md' | 'sm' | 'mini' | 'micro'
     * @param {Object} options.header - { left, center, right }
     * @param {string} options.body - Contenido HTML
     * @param {Object} options.footer - { left, center, right }
     * @param {Function} [options.onOpen] - Callback post-apertura
     * @param {Function} [options.onClose] - Callback post-cierre
     */
    static showModal({ size = 'md', header = {}, body = '', footer = {}, onOpen = null, onClose = null } = {}) {
        this.init();

        const modalBase = $id('modal-base');
        const modalContainer = $id('modal-container');

        if (!modalBase || !modalContainer) {
            Logger.error('ModalService', 'No se encontró la estructura base del modal (#modal-base).');
            return;
        }

        // 1. Limpiar clases de tamaño previas y aplicar la nueva
        const sizeClasses = ['modal-full', 'modal-xl', 'modal-lg', 'modal-md', 'modal-sm', 'modal-mini', 'modal-micro'];
        $removeClass(modalContainer, ...sizeClasses);
        $addClass(modalContainer, `modal-${size}`);

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
            const el = $id(id);
            if (el) $mount(el, content);
        });

        // 3. Activar el overlay y bloquear scroll
        $addClass(modalBase, 'active');
        $attr(modalBase, 'aria-hidden', 'false');
        ScrollManager.lock();

        // 4. Vincular botones de cierre internos
        $$('[data-action="ui:close_modal"]', modalContainer).forEach(btn => {
            $on(btn, 'click', (e) => {
                e.preventDefault();
                this.hideModal();
            });
        });

        this._currentOnClose = onClose;
        if (typeof onOpen === 'function') onOpen(modalContainer);
    }

    /**
     * Oculta el modal activo, libera el bloqueo de pantalla y purga memoria (Load-Clear).
     */
    static hideModal() {
        const modalBase = $id('modal-base');
        const modalContainer = $id('modal-container');

        if (modalBase) {
            const focusedInside = $(':focus', modalBase);
            if (focusedInside && typeof focusedInside.blur === 'function') {
                focusedInside.blur();
            }
            $removeClass(modalBase, 'active');
            $attr(modalBase, 'aria-hidden', 'true');

            // Garbage Collection / Load-Clear de slots de memoria tras el cierre
            setTimeout(() => {
                if (!this.isOpen()) {
                    const slotIds = [
                        'modal-header-left', 'modal-header-center', 'modal-header-right',
                        'modal-body-content',
                        'modal-footer-left', 'modal-footer-center', 'modal-footer-right'
                    ];
                    slotIds.forEach(id => {
                        const el = $id(id);
                        if (el) el.replaceChildren();
                    });
                    if (modalContainer) {
                        const sizeClasses = ['modal-full', 'modal-xl', 'modal-lg', 'modal-md', 'modal-sm', 'modal-mini', 'modal-micro'];
                        $removeClass(modalContainer, ...sizeClasses);
                    }
                }
            }, 180);
        }
        ScrollManager.forceUnlock();

        if (typeof this._currentOnClose === 'function') {
            const cb = this._currentOnClose;
            this._currentOnClose = null;
            cb();
        }
    }

    static closeModal() {
        this.hideModal();
    }

    static isOpen() {
        const modalBase = $id('modal-base');
        return modalBase ? modalBase.classList.contains('active') : false;
    }

    /**
     * Constructor auxiliar de cabecera estándar de modales.
     * @param {Object} options
     * @returns {{ left: string, right: string }}
     */
    static buildHeader({ icon = 'bi-window', title = '', subtitle = '', tag = null, actions = '' } = {}) {
        return {
            left: `
                <div class="header-icon-box">
                    <i class="bi ${icon}"></i>
                    <div class="icon-glow"></div>
                </div>
                <div class="modal-title-group">
                    <h3 class="modal-title">${title}</h3>
                    <div class="d-flex align-items-center gap-2">
                        ${subtitle ? `<span class="modal-subtitle">${subtitle}</span>` : ''}
                        ${tag ? `<span class="engine-version-tag">${tag}</span>` : ''}
                    </div>
                </div>
            `,
            right: actions || `
                <div class="header-actions">
                    <button type="button" class="action-mini-btn close modal-close-btn" data-action="ui:close_modal" title="Cerrar">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `
        };
    }
}

export default ModalService;
