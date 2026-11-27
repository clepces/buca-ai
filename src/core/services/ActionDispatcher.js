/**
 * @fileoverview ActionDispatcher - Delegación global O(1) de acciones UI [data-action].
 * @module core/services/ActionDispatcher
 * Clean Core: Despacha eventos al EventBus sin importar módulos de negocio ni vistas UI.
 */

import { eventBus } from '@/core/eventBus/index.js';
import { $on } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const IGNORED_DATA_ATTRS = new Set(['action', 'target', 'payload', 'status', 'tooltip', 'bneIgnore']);

const buildSafePayload = (actionEl) => {
    const payload = {};
    Array.from(actionEl.attributes).forEach((attr) => {
        if (!attr.name.startsWith('data-')) return;
        const key = attr.name.slice(5).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        if (FORBIDDEN_KEYS.has(key) || IGNORED_DATA_ATTRS.has(key) || key.startsWith('bs')) return;
        payload[key] = attr.value;
    });

    const rawPayload = actionEl.getAttribute('data-payload');
    if (rawPayload) {
        try {
            const parsed = JSON.parse(rawPayload);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                for (const key of Object.keys(parsed)) {
                    if (!FORBIDDEN_KEYS.has(key)) {
                        payload[key] = parsed[key];
                    }
                }
            }
        } catch (err) {
            Logger.error({ layer: 'UI', role: 'EVENT', target: 'ActionDispatcher', message: 'Error procesando atributo data-payload.', data: err?.message || err });
        }
    }

    const target = actionEl.getAttribute('data-target');
    if (target) payload.target = target;
    payload.trigger = actionEl;
    return payload;
};

export const ActionDispatcher = {
    _initialized: false,
    _cleanups: [],

    init() {
        if (this._initialized) return;
        this._initialized = true;

        Logger.info({ layer: 'UI', role: 'EVENT', target: 'ActionDispatcher', message: 'Delegación global de acciones UI inicializada.' });

        const handleAction = (e, actionEl) => {
            if (!actionEl || e._bucaActionHandled) return;
            const action = actionEl.getAttribute('data-action');
            if (!action) return;

            e._bucaActionHandled = true;
            if (action === 'router:navigate' && actionEl.tagName === 'A') {
                e.preventDefault();
            }

            const status = actionEl.getAttribute('data-status');
            if (status === 'in-development' || actionEl.hasAttribute('disabled') || actionEl.classList.contains('disabled-dev-item')) {
                e.preventDefault();
                eventBus.emit('notifications:push', {
                    title: 'Función en Desarrollo',
                    message: `La opción "${action}" está planificada en el roadmap del sistema.`,
                    type: 'info'
                });
                Logger.info({ layer: 'UI', role: 'EVENT', target: 'ActionDispatcher', message: `Acción en desarrollo seleccionada: ${action}` });
                return;
            }

            const payload = buildSafePayload(actionEl);
            Logger.debug({ layer: 'UI', role: 'EVENT', target: 'ActionDispatcher', message: `Despachando acción UI: ${action}`, data: payload });

            if (!eventBus.hasListeners(action)) {
                Logger.warn({ layer: 'UI', role: 'EVENT', target: 'ActionDispatcher', message: `Acción sin suscriptor activo: "${action}".`, data: actionEl });
                eventBus.emit('notifications:push', {
                    title: 'Función en Desarrollo',
                    message: `La función "${action}" aún no tiene un módulo conectado.`,
                    type: 'warning'
                });
                return;
            }
            eventBus.emit(action, payload);
        };

        this._cleanups.push(
            $on(document, 'click', (e) => {
                const actionEl = e.target?.closest?.('[data-action]');
                if (actionEl) handleAction(e, actionEl);
            }),
            $on(document, 'keydown', (e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                const actionEl = e.target?.closest?.('[data-action]');
                if (!actionEl) return;
                const tag = actionEl.tagName;
                if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
                e.preventDefault();
                handleAction(e, actionEl);
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
