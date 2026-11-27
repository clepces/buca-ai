import './dom-shim.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { eventBus } from '../src/core/eventBus/index.js';
import { BaseState } from '../src/core/state/BaseState.js';
import { ActionDispatcher } from '../src/core/services/ActionDispatcher.js';
import { NotificationService } from '../src/core/services/NotificationService.js';
import { ModalService } from '../src/shared/ui/services/ModalService.js';
import { SearchService } from '../src/core/services/SearchService.js';

// ---------------------------------------------------------------------------
// Suite 1: Primitivas de Cleanup (EventBus, BaseState)
// ---------------------------------------------------------------------------
describe('Cleanup Primitives (EventBus & BaseState)', () => {
    beforeEach(() => {
        eventBus.clear();
    });

    it('EventBus.on retorna un desuscriptor que libera el listener', () => {
        let callCount = 0;
        const off = eventBus.on('test:event', () => { callCount++; });

        eventBus.emit('test:event');
        assert.equal(callCount, 1);

        assert.equal(typeof off, 'function');
        off();

        eventBus.emit('test:event');
        assert.equal(callCount, 1, 'No debe incrementar tras desuscribirse');
    });

    it('Llamar al desuscriptor dos veces no lanza error', () => {
        const off = eventBus.on('test:double_off', () => {});
        off();
        assert.doesNotThrow(() => off());
    });

    it('BaseState.subscribe retorna un desuscriptor que cancela la observacion', () => {
        const state = new BaseState({ active: false });
        let observedCount = 0;

        const unsubscribe = state.subscribe(() => { observedCount++; });
        assert.equal(observedCount, 1, 'Llamada inicial sincrona');

        assert.equal(typeof unsubscribe, 'function');
        unsubscribe();

        state.set({ active: true });
        assert.equal(observedCount, 1, 'No debe ser notificado tras desuscribirse');
    });
});

// ---------------------------------------------------------------------------
// Suite 2: Event Ownership & Prevencion de Efectos Duplicados
// (ActionDispatcher, NotificationService, ModalService)
// ---------------------------------------------------------------------------
describe('Event Ownership & Double-Effect Prevention', () => {
    beforeEach(() => {
        eventBus.clear();
        ActionDispatcher.destroy();
        NotificationService.destroy();
        ModalService.destroy();
    });

    it('notifications:mark_as_read es propiedad de NotificationService (sin doble llamada)', () => {
        NotificationService.init();
        ActionDispatcher.init();

        let markCallCount = 0;
        const origMark = NotificationService.markAsRead;
        NotificationService.markAsRead = () => { markCallCount++; };

        try {
            eventBus.emit('notifications:mark_as_read', { id: 'notif-123' });
            assert.equal(markCallCount, 1, 'Debe ejecutarse exactamente 1 vez (cero doble despacho)');
        } finally {
            NotificationService.markAsRead = origMark;
            ActionDispatcher.destroy();
            NotificationService.destroy();
        }
    });

    it('notifications:clear es propiedad de NotificationService (sin doble llamada)', () => {
        NotificationService.init();
        ActionDispatcher.init();

        let clearCount = 0;
        const origClear = NotificationService.clearNotifications;
        NotificationService.clearNotifications = () => { clearCount++; };

        try {
            eventBus.emit('notifications:clear');
            assert.equal(clearCount, 1, 'Debe ejecutarse exactamente 1 vez');
        } finally {
            NotificationService.clearNotifications = origClear;
            ActionDispatcher.destroy();
            NotificationService.destroy();
        }
    });

    it('ui:close_modal es propiedad de ModalService (sin doble llamada)', () => {
        ModalService.init();
        ActionDispatcher.init();

        let hideCount = 0;
        const origHide = ModalService.hideModal;
        ModalService.hideModal = () => { hideCount++; };

        try {
            eventBus.emit('ui:close_modal');
            assert.equal(hideCount, 1, 'Debe ejecutarse exactamente 1 vez');
        } finally {
            ModalService.hideModal = origHide;
            ActionDispatcher.destroy();
            ModalService.destroy();
        }
    });
});

// ---------------------------------------------------------------------------
// Suite 3: Contratos de Ciclo de Vida e Idempotencia en Servicios
// ---------------------------------------------------------------------------
describe('Service Lifecycle & Idempotency Contracts', () => {
    beforeEach(() => {
        eventBus.clear();
    });

    it('destroy() libera listeners registrados por el servicio', () => {
        NotificationService.init();
        assert.equal(eventBus.hasListeners('notifications:push'), true);

        NotificationService.destroy();
        assert.equal(eventBus.hasListeners('notifications:push'), false);
        assert.equal(NotificationService._initialized, false);
    });

    it('destroy() es idempotente: llamarla dos veces no lanza error', () => {
        NotificationService.init();
        assert.doesNotThrow(() => NotificationService.destroy());
        assert.doesNotThrow(() => NotificationService.destroy());
        assert.equal(NotificationService._initialized, false);
    });

    it('destroy() antes de init() es seguro', () => {
        NotificationService.destroy();
        assert.doesNotThrow(() => NotificationService.destroy());
        assert.equal(NotificationService._initialized, false);
    });

    it('Re-init tras destroy re-registra listeners sin duplicarlos', () => {
        NotificationService.init();
        const initialCount = eventBus._getListeners('notifications:push').length;

        NotificationService.destroy();
        assert.equal(eventBus.hasListeners('notifications:push'), false);

        NotificationService.init();
        const reinitCount = eventBus._getListeners('notifications:push').length;

        assert.equal(reinitCount, initialCount, 'No deben acumularse listeners en re-init');
        NotificationService.destroy();
    });

    it('loadRemoteNotifications() resuelto tras destroy() no modifica estado ni emite eventos', async () => {
        let resolveQuery;
        const deferred = new Promise((resolve) => { resolveQuery = resolve; });

        const fakeClient = {
            from: () => ({
                select: () => ({
                    order: () => ({
                        limit: () => deferred
                    })
                })
            })
        };

        const origGetClient = NotificationService._getClient;
        NotificationService._getClient = () => fakeClient;

        let updateEmitted = false;
        const offUpdate = eventBus.on('notifications:updated', () => { updateEmitted = true; });

        try {
            NotificationService.init();
            NotificationService.destroy();
            assert.deepEqual(NotificationService._notifications, []);

            resolveQuery({
                data: [{ id: 'old-1', title: 'Stale Notification', created_at: new Date().toISOString() }],
                error: null
            });

            await new Promise(r => setTimeout(r, 10));

            assert.deepEqual(NotificationService._notifications, [], 'No debe poblar estado tras destroy()');
            assert.equal(updateEmitted, false, 'No debe emitir notifications:updated tras destroy()');
        } finally {
            offUpdate();
            NotificationService._getClient = origGetClient;
            NotificationService.destroy();
        }
    });

    it('SearchService purga _registry en destroy() y admite nuevo registro en re-init', () => {
        SearchService.init();
        SearchService.registerProvider({ name: 'test-provider', search: async () => [] });
        assert.equal(SearchService._registry.length, 1);

        SearchService.destroy();
        assert.equal(SearchService._registry.length, 0, 'destroy() purga proveedores');
        assert.equal(SearchService._initialized, false);

        // Re-init solo reconecta listener, no auto-reconstruye proveedores sin nuevo registro
        SearchService.init();
        assert.equal(SearchService._initialized, true);
        assert.equal(SearchService._registry.length, 0, 'No auto-reconstruye sin re-registro explicito');

        SearchService.registerProvider({ name: 're-registered', search: async () => [] });
        assert.equal(SearchService._registry.length, 1);
        SearchService.destroy();
    });
});
