/**
 * @fileoverview modal-legacy-bridge - Adapta llamadas legacy de ModalService al contrato v2.
 * Permite migración gradual de los 15 consumidores sin romper la UI.
 * @module shared/ui/services/modal/modal-legacy-bridge
 */

const LEGACY_SIZE_MAP = {
    micro: 'xs',
    mini: 'sm',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    '2xl': '2xl',
    xxl: '2xl',
    full: 'full',
    xs: 'xs'
};

/**
 * Normaliza opciones legacy o v2 al esquema canónico de ModalServiceV2.
 * @param {Object} raw
 * @returns {Object}
 */
export function normalizeModalOptions(raw = {}) {
    const size = LEGACY_SIZE_MAP[raw.size] || 'md';

    const rawHeader = raw.header || {};
    const header = {
        left: typeof rawHeader.left === 'string'
            ? { legacyHtml: rawHeader.left }
            : (rawHeader.left || {}),
        center: typeof rawHeader.center === 'string'
            ? { html: rawHeader.center }
            : (rawHeader.center || {}),
        right: typeof rawHeader.right === 'string'
            ? { legacyHtml: rawHeader.right }
            : (rawHeader.right || {})
    };

    const body = typeof raw.body === 'string'
        ? { html: raw.body }
        : (raw.body || {});

    const footer = raw.footer || {};

    return {
        id: raw.id || null,
        scope: raw.scope || 'module',
        size,
        layout: raw.layout || 'plain',
        mobileMode: raw.mobileMode || 'sheet',
        loading: Boolean(raw.loading),
        closeOnBackdrop: raw.closeOnBackdrop !== false,
        closeOnEsc: raw.closeOnEsc !== false,
        closeOnRouteChange: raw.closeOnRouteChange !== false,
        lockShortcuts: Boolean(raw.lockShortcuts),
        initialFocus: raw.initialFocus || null,
        header,
        body,
        footer: {
            scope: footer.scope || 'view',
            left: footer.left || '',
            center: footer.center || '',
            right: footer.right || ''
        },
        onViewChange: raw.onViewChange || null,
        onResize: raw.onResize || null,
        beforeClose: raw.beforeClose || null,
        onOpen: raw.onOpen || null,
        onClose: raw.onClose || null
    };
}

export default { normalizeModalOptions };
