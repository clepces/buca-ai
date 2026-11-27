/**
 * @fileoverview ModalService - Fachada de compatibilidad hacia ModalServiceV2.
 * Mantiene el contrato legacy mientras los 15 consumidores migran por fases.
 * @module shared/ui/services/ModalService
 */
import { eventBus } from '@/core/eventBus/index.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { modalServiceV2 } from './modal/modal-service-v2.js';

export class ModalService {
    static _cleanups = [];
    static isInitialized = false;

    static init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        modalServiceV2.init({ registerBusHandlers: false });

        this._cleanups.push(
            eventBus.on('ui:close_modal', () => this.hideModal()),
            eventBus.on('ui:open_modal', (p = {}) => {
                const safeTitle = escapeHTML(String(p.title || 'Información'));
                const safeText = escapeHTML(String(p.description || p.body || 'Contenido no disponible.'));
                this.showModal({
                    size: p.size || 'md',
                    header: { left: `<h3>${safeTitle}</h3>` },
                    body: `<p class="mb-0">${safeText}</p>`,
                    footer: { right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Entendido</button>' }
                });
            })
        );
    }

    static destroy() {
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this.isInitialized = false;
        modalServiceV2.destroy();
    }

    static showModal(options = {}) {
        this.init();
        modalServiceV2.showModal(options);
    }

    static hideModal() {
        modalServiceV2.hideModal('programmatic');
    }

    static closeModal() {
        modalServiceV2.requestClose('programmatic');
    }

    static isOpen(id = null) {
        return modalServiceV2.isOpen(id);
    }

    static buildHeader({ icon = 'bi-window', title = '', subtitle = '', tag = null, actions = '' } = {}) {
        return {
            left: {
                icon,
                title: String(title || ''),
                subtitle: String(subtitle || ''),
                badge: tag ? { text: String(tag), tone: 'primary' } : null
            },
            right: actions ? { legacyHtml: actions } : {}
        };
    }

    static notifyHeader(type, message, durationMs) {
        modalServiceV2.notifyHeader(type, escapeHTML(String(message || '')), durationMs);
    }
}

export default ModalService;
