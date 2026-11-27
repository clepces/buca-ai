/**
 * @fileoverview modal-renderer - Hidratación segura de slots, skeleton, estados y alertas header-center.
 * @module shared/ui/services/modal/modal-renderer
 */
import { $id, $mount } from '@/shared/utils/dom.js';
import { escapeHTML } from '@/shared/utils/security.js';

const ALERT_ICONS = {
    warning: 'bi-exclamation-triangle-fill',
    danger: 'bi-x-octagon-fill',
    info: 'bi-info-circle-fill',
    success: 'bi-check-circle-fill'
};

export class ModalRenderer {
    constructor() {
        this._alertTimer = null;
    }

    el(key) {
        const v2Map = {
            root: 'ui-modal-root',
            dialog: 'ui-modal-dialog',
            headerLeft: 'ui-modal-header-left',
            icon: 'ui-modal-icon',
            title: 'ui-modal-title',
            badge: 'ui-modal-badge',
            subtitle: 'ui-modal-subtitle',
            headerContext: 'ui-modal-header-context',
            headerAlert: 'ui-modal-header-alert',
            headerActions: 'ui-modal-header-actions',
            btnAi: 'ui-modal-btn-ai',
            btnHelp: 'ui-modal-btn-help',
            btnResize: 'ui-modal-btn-resize',
            btnMore: 'ui-modal-btn-more',
            btnClose: 'ui-modal-btn-close',
            body: 'ui-modal-body',
            skeleton: 'ui-modal-skeleton',
            nav: 'ui-modal-nav',
            content: 'ui-modal-content',
            footer: 'ui-modal-footer',
            footerLeft: 'ui-modal-footer-left',
            footerCenter: 'ui-modal-footer-center',
            footerRight: 'ui-modal-footer-right'
        };
        const legacyMap = {
            root: 'modal-base',
            dialog: 'modal-container',
            headerLeft: 'modal-header-left',
            headerContext: 'modal-header-center',
            headerActions: 'modal-header-right',
            content: 'modal-body-content',
            footerLeft: 'modal-footer-left',
            footerCenter: 'modal-footer-center',
            footerRight: 'modal-footer-right'
        };
        return $id(v2Map[key] || key) || (legacyMap[key] ? $id(legacyMap[key]) : null);
    }

    renderHeader(header = {}) {
        const left = header.left || {};
        const leftEl = this.el('headerLeft');

        if (left.legacyHtml !== undefined) {
            if (leftEl) $mount(leftEl, left.legacyHtml);
        } else {
            this._restoreHeaderLeftStructure();
            const iconEl = this.el('icon');
            const titleEl = this.el('title');
            const subtitleEl = this.el('subtitle');
            const badgeEl = this.el('badge');

            if (iconEl) {
                $mount(iconEl, left.icon ? `<i class="bi ${escapeHTML(left.icon)}"></i>` : '');
                iconEl.hidden = !left.icon;
            }
            if (titleEl) titleEl.textContent = left.title || '';
            if (subtitleEl) {
                subtitleEl.textContent = left.subtitle || '';
                subtitleEl.hidden = !left.subtitle;
            }
            if (badgeEl) {
                if (left.badge?.text) {
                    const tone = escapeHTML(left.badge.tone || 'primary');
                    badgeEl.className = `badge badge--${tone} ui-modal__badge`;
                    badgeEl.textContent = left.badge.text;
                    badgeEl.hidden = false;
                } else {
                    badgeEl.hidden = true;
                }
            }
        }

        const contextEl = this.el('headerContext');
        if (contextEl) {
            const centerHtml = header.center?.html || '';
            $mount(contextEl, centerHtml);
            contextEl.hidden = !centerHtml;
        }

        const actionsEl = this.el('headerActions');
        const right = header.right || {};
        if (actionsEl) {
            if (right.legacyHtml !== undefined) {
                $mount(actionsEl, right.legacyHtml);
                actionsEl.querySelectorAll('[data-action="ui:close_modal"]').forEach((btn) => {
                    btn.hidden = true;
                });
            } else {
                $mount(actionsEl, Array.isArray(right.actions) ? right.actions.join('') : (right.html || ''));
            }
        }

        const globals = right.showGlobalControls || {};
        const btnAi = this.el('btnAi');
        const btnHelp = this.el('btnHelp');
        const btnResize = this.el('btnResize');
        const btnMore = this.el('btnMore');
        if (btnAi) btnAi.hidden = globals.ai === false;
        if (btnHelp) btnHelp.hidden = globals.help === false;
        if (btnResize) btnResize.hidden = globals.resize === false;
        if (btnMore) btnMore.hidden = globals.more === false;
    }

    renderFooter(footer = {}) {
        const footerEl = this.el('footer');
        if (footerEl && footer.scope) {
            footerEl.dataset.footerScope = footer.scope;
        }
        const leftEl = this.el('footerLeft');
        const centerEl = this.el('footerCenter');
        const rightEl = this.el('footerRight');
        if (leftEl) $mount(leftEl, footer.left || '');
        if (centerEl) $mount(centerEl, footer.center || '');
        if (rightEl) $mount(rightEl, footer.right || '');
    }

    setLoading(isLoading) {
        const bodyEl = this.el('body');
        const skeletonEl = this.el('skeleton');
        const contentEl = this.el('content');
        if (!bodyEl || !skeletonEl || !contentEl) return;

        bodyEl.dataset.loading = isLoading ? 'true' : 'false';
        skeletonEl.hidden = !isLoading;
        contentEl.hidden = Boolean(isLoading);

        if (isLoading && skeletonEl.childElementCount === 0) {
            $mount(skeletonEl, `
                <div class="ui-modal__skeleton-line ui-modal__skeleton-line--lg"></div>
                <div class="ui-modal__skeleton-line"></div>
                <div class="ui-modal__skeleton-line ui-modal__skeleton-line--sm"></div>
            `);
        }
    }

    setEmpty({ icon = 'bi-inbox', title = 'Sin registros', subtitle = '' } = {}) {
        const contentEl = this.el('content');
        if (!contentEl) return;
        $mount(contentEl, `
            <div class="ui-modal__state">
                <i class="bi ${escapeHTML(icon)} ui-modal__state-icon" aria-hidden="true"></i>
                <h3 class="ui-modal__state-title">${escapeHTML(title)}</h3>
                ${subtitle ? `<p class="ui-modal__state-sub">${escapeHTML(subtitle)}</p>` : ''}
            </div>
        `);
    }

    setError({ title = 'No se pudo cargar', message = '', retryAction = '' } = {}) {
        const contentEl = this.el('content');
        if (!contentEl) return;
        $mount(contentEl, `
            <div class="ui-modal__state ui-modal__state--error" role="alert">
                <i class="bi bi-exclamation-octagon ui-modal__state-icon" aria-hidden="true"></i>
                <h3 class="ui-modal__state-title">${escapeHTML(title)}</h3>
                ${message ? `<p class="ui-modal__state-sub">${escapeHTML(message)}</p>` : ''}
                ${retryAction ? `<button type="button" class="btn btn-sm btn-outline mt-2" data-action="${escapeHTML(retryAction)}">Reintentar</button>` : ''}
            </div>
        `);
    }

    notifyHeader(type = 'warning', message = '', durationMs = 3500) {
        const contextEl = this.el('headerContext');
        const alertEl = this.el('headerAlert');
        if (!alertEl) return;

        if (this._alertTimer) {
            clearTimeout(this._alertTimer);
            this._alertTimer = null;
        }

        if (!message) {
            alertEl.hidden = true;
            if (contextEl) contextEl.hidden = false;
            return;
        }

        const iconCls = ALERT_ICONS[type] || ALERT_ICONS.warning;
        alertEl.dataset.alertType = type;
        $mount(alertEl, `<i class="bi ${iconCls}" aria-hidden="true"></i><span>${escapeHTML(message)}</span>`);
        if (contextEl) contextEl.hidden = true;
        alertEl.hidden = false;

        if (durationMs > 0) {
            this._alertTimer = setTimeout(() => {
                alertEl.hidden = true;
                if (contextEl) contextEl.hidden = false;
                this._alertTimer = null;
            }, durationMs);
        }
    }

    clearAll() {
        this.notifyHeader('', '', 0);
        ['headerContext', 'headerActions', 'content', 'nav', 'footerLeft', 'footerCenter', 'footerRight'].forEach((k) => {
            const node = this.el(k);
            if (node) node.replaceChildren();
        });
        this.setLoading(false);
    }

    _restoreHeaderLeftStructure() {
        if (this.el('title')) return;
        const leftEl = this.el('headerLeft');
        if (!leftEl) return;
        $mount(leftEl, `
            <span class="ui-modal__icon" id="ui-modal-icon" aria-hidden="true" hidden></span>
            <div class="ui-modal__heading">
                <div class="ui-modal__title-row">
                    <h2 class="ui-modal__title" id="ui-modal-title"></h2>
                    <span class="ui-modal__badge" id="ui-modal-badge" hidden></span>
                </div>
                <p class="ui-modal__subtitle" id="ui-modal-subtitle" hidden></p>
            </div>
        `);
    }
}

export default ModalRenderer;
