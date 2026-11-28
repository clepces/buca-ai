/**
 * @fileoverview Controlador del Preloader y Badges de Estado
 * @module shared/ui/overlays/preloader-controller
 * @description Gestiona de forma segura y sin fugas las fases de carga, iconos SVG,
 * sub-estados con animación vertical (↑↓) vía Web Animations API, colores semánticos y acciones.
 */

import {
    $id, $text, $attr, $addClass, $removeClass, $mount,
    $styleVar, $create, $appendTo, $empty, $on
} from '@/shared/utils/dom.js';
import { isBrowser } from '@/core/utils/system-helper.js';

const STATE_CLASSES = [
    'preloader--boot', 'preloader--engine', 'preloader--database',
    'preloader--auth', 'preloader--layout', 'preloader--modules',
    'preloader--router', 'preloader--ready', 'preloader--success',
    'preloader--info', 'preloader--warning', 'preloader--offline',
    'preloader--error', 'preloader--401', 'preloader--403',
    'preloader--404', 'preloader--500', 'preloader--503',
    'is-error', 'is-warning'
];

const SVG_ICONS = {
    boot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    engine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>',
    auth: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    layout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
    modules: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    router: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    ready: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    offline: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 13a10 10 0 0 1 5.17-2.69"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    401: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    403: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
    404: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    500: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    503: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

const LEAVE_MS = 100;
const ENTER_MS = 160;
const HOLD_MS = 60;
const DEBUG_HOLD_MS = 850;

class PreloaderController {
    constructor() {
        this._currentPhase = 'boot';
        this._currentState = 'boot';
        this._isAnimating = false;
        this._isDisposed = false;
        this._activeAnims = [];
        this._holdTimer = null;
        this._queue = [];
        this._idleResolvers = [];
        this._actionsController = null;
        this._debugSlowMode = isBrowser() && window.location.search.includes('debug_preloader=1');
    }

    _isDebugSlowMode() {
        if (!this._debugSlowMode && isBrowser() && window.location.search.includes('debug_preloader=1')) {
            this._debugSlowMode = true;
        }
        return this._debugSlowMode;
    }

    getPerfTier() {
        if (!isBrowser()) return 'L1';
        const root = document.documentElement;
        return $attr(root, 'bene-perf') || $attr(root, 'data-buca-perf') || 'L1';
    }

    setProgress(percent) {
        const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
        const bar = $id('splash-progress');
        if (bar) $styleVar(bar, '--buca-progress', `${clamped}%`);

        const pct = $id('splash-percentage');
        if (pct) $text(pct, `${clamped}%`);
    }

    updateStatus(payload = {}) {
        const preloader = $id('global-preloader');
        if (!preloader || preloader._isExiting) return;

        this._isDisposed = false;

        // En arranque normal, solo fusionar sub-estados de la misma fase si ya está en cola,
        // conservando siempre todas las fases distintas (nunca saltar de 20% a 85%).
        if (!this._isDebugSlowMode()) {
            const samePhaseIdx = this._queue.findIndex((item) => item?.phaseId === payload.phaseId);
            if (samePhaseIdx !== -1) {
                this._queue[samePhaseIdx] = payload;
                return;
            }
        }

        this._queue.push(payload);
        if (!this._isAnimating) {
            this._processNext();
        }
    }

    whenIdle() {
        if (!this._isAnimating && this._queue.length === 0) {
            return Promise.resolve();
        }
        const maxWait = this._isDebugSlowMode() ? 12000 : 5000;
        return new Promise((resolve) => {
            const fallback = setTimeout(resolve, maxWait);
            this._idleResolvers.push(() => {
                clearTimeout(fallback);
                resolve();
            });
        });
    }

    clearState() {
        const preloader = $id('global-preloader');
        if (!preloader) return;
        $removeClass(preloader, ...STATE_CLASSES);
        $addClass(preloader, 'preloader--boot');
        $attr(preloader, 'data-preloader-state', 'boot');
        this._renderActions([]);
    }

    destroy() {
        this._isDisposed = true;
        this._queue = [];
        this._isAnimating = false;
        this._cancelActiveAnims();
        if (this._holdTimer) {
            clearTimeout(this._holdTimer);
            this._holdTimer = null;
        }
        if (this._actionsController) {
            this._actionsController.abort();
            this._actionsController = null;
        }
        this._flushIdle();
    }

    _cancelActiveAnims() {
        while (this._activeAnims.length > 0) {
            const anim = this._activeAnims.pop();
            try { anim.cancel(); } catch { /* noop */ }
        }
    }

    async _animateParts(parts, keyframes, duration, easing, staggerMs, fill) {
        const anims = parts
            .filter(Boolean)
            .map((el, idx) => {
                const anim = el.animate(keyframes, {
                    duration,
                    delay: idx * staggerMs,
                    easing,
                    fill
                });
                this._activeAnims.push(anim);
                return anim;
            });
        await Promise.all(anims.map((a) => a.finished));
        this._cancelActiveAnims();
    }

    async _processNext() {
        const preloader = $id('global-preloader');
        if (this._isDisposed || !preloader || preloader._isExiting || this._queue.length === 0) {
            this._isAnimating = false;
            this._flushIdle();
            return;
        }

        this._isAnimating = true;
        const payload = this._queue.shift();
        const {
            phaseId = this._currentPhase,
            state = phaseId || 'boot',
            icon,
            title,
            description = '',
            progress,
            actions = []
        } = payload;

        const isSamePhase = phaseId === this._currentPhase;
        this._currentPhase = phaseId;
        this._currentState = state;

        const iconEl = $id('splash-badge-icon');
        const titleEl = $id('splash-badge-title');
        const textEl = $id('splash-status-text');
        const pillEl = $id('splash-badge-pill');
        const actionsEl = $id('splash-actions');

        if (!textEl) {
            this._processNext();
            return;
        }

        const applyContent = () => {
            if (typeof progress === 'number') this.setProgress(progress);
            this._applyStateClass(preloader, state, phaseId);
            this._renderActions(actions);
            if (iconEl) {
                const svg = icon || SVG_ICONS[state] || SVG_ICONS[phaseId] || SVG_ICONS.boot;
                $mount(iconEl, svg);
            }
            if (title !== undefined && titleEl) $text(titleEl, title);
            $text(textEl, description);
        };

        if (typeof textEl.animate !== 'function') {
            applyContent();
            this._processNext();
            return;
        }

        const animParts = isSamePhase ? [textEl] : [pillEl, textEl, actionsEl];
        const leaveFrames = [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-16px)' }
        ];
        const enterFrames = [
            { opacity: 0, transform: 'translateY(16px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ];

        const staggerLeave = isSamePhase ? 0 : 40;
        const staggerEnter = isSamePhase ? 0 : 50;

        try {
            await this._animateParts(animParts, leaveFrames, LEAVE_MS, 'cubic-bezier(0.4, 0, 0.2, 1)', staggerLeave, 'forwards');
            if (this._isDisposed || preloader._isExiting) return;

            applyContent();

            await this._animateParts(animParts, enterFrames, ENTER_MS, 'cubic-bezier(0.22, 1, 0.36, 1)', staggerEnter, 'both');

            const holdDuration = this._isDebugSlowMode() ? DEBUG_HOLD_MS : HOLD_MS;
            if (this._queue.length > 0 && !this._isDisposed && !preloader._isExiting) {
                await new Promise((resolve) => {
                    this._holdTimer = setTimeout(() => {
                        this._holdTimer = null;
                        resolve();
                    }, holdDuration);
                });
            }
        } catch {
            this._cancelActiveAnims();
            return;
        }

        this._processNext();
    }

    _flushIdle() {
        while (this._idleResolvers.length > 0) {
            const resolve = this._idleResolvers.shift();
            resolve();
        }
    }

    _applyStateClass(preloader, state, phaseId) {
        $removeClass(preloader, ...STATE_CLASSES);
        const normalized = state.startsWith('preloader--') ? state : `preloader--${state}`;
        $addClass(preloader, normalized);

        if (normalized === 'preloader--error' || normalized === 'preloader--500') {
            $addClass(preloader, 'is-error');
        } else if (normalized === 'preloader--warning' || normalized === 'preloader--503') {
            $addClass(preloader, 'is-warning');
        }

        $attr(preloader, 'data-preloader-phase', phaseId);
        $attr(preloader, 'data-preloader-state', state);
    }

    _renderActions(actions) {
        const container = $id('splash-actions');
        if (!container) return;

        if (this._actionsController) {
            this._actionsController.abort();
            this._actionsController = null;
        }

        $empty(container);
        if (!Array.isArray(actions) || actions.length === 0) return;

        this._actionsController = new AbortController();
        const { signal } = this._actionsController;

        actions.forEach((act) => {
            const variantClass = act.variant === 'secondary' ? 'splash-action-btn--secondary' : '';
            const btn = $create('button', {
                type: 'button',
                className: `splash-action-btn ${variantClass}`.trim()
            });
            $text(btn, act.label || 'Continuar');

            if (typeof act.onClick === 'function') {
                $on(btn, 'click', (e) => {
                    e.preventDefault();
                    act.onClick();
                }, { signal });
            }
            $appendTo(container, btn);
        });
    }
}

export const preloaderController = new PreloaderController();
export default preloaderController;
