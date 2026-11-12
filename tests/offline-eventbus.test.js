import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { eventBus, offlineReplayQueue } from '../src/core/eventBus/index.js';

describe('EventBus Offline Replay Queue Suite (Etapa 6)', () => {
    it('Debe identificar eventos transaccionales para encolamiento', () => {
        assert.equal(offlineReplayQueue._isTransactional('tx:create_order'), true);
        assert.equal(offlineReplayQueue._isTransactional('finance:rate_sync'), true);
        assert.equal(offlineReplayQueue._isTransactional('audit:user_action'), true);
        assert.equal(offlineReplayQueue._isTransactional('ui:toggle_theme'), false);
    });

    it('Debe encolar eventos en memoria cuando el cliente simula estar offline', async () => {
        // Mock isOnline -> false
        const originalIsOnline = offlineReplayQueue.isOnline;
        offlineReplayQueue.isOnline = () => false;

        try {
            await offlineReplayQueue.enqueue('tx:payment_processed', { amount: 150, currency: 'USD' });
            assert.ok(offlineReplayQueue._inMemoryQueue.length > 0, 'Debe haber encolado el evento transaccional');
            const lastItem = offlineReplayQueue._inMemoryQueue[offlineReplayQueue._inMemoryQueue.length - 1];
            assert.equal(lastItem.event, 'tx:payment_processed');
            assert.deepEqual(lastItem.args[0], { amount: 150, currency: 'USD' });
            assert.ok(typeof lastItem.idempotency_key === 'string' && lastItem.idempotency_key.length > 5, 'Debe incluir clave idempotente única');
        } finally {
            offlineReplayQueue.isOnline = originalIsOnline;
        }
    });

    it('Debe drenar y retransmitir los eventos pendientes en orden', async () => {
        const replayedEvents = [];
        const testEmitter = (event, ...args) => {
            replayedEvents.push({ event, args });
        };

        const count = await offlineReplayQueue.drain(testEmitter);
        assert.ok(count >= 1, 'Debe haber drenado al menos un evento');
        assert.equal(offlineReplayQueue._inMemoryQueue.length, 0, 'La cola en memoria debe quedar limpia');
        assert.ok(replayedEvents.some(e => e.event === 'tx:payment_processed'));
    });

    it('Debe retener eventos si la confirmación remota falla (resiliencia transaccional)', async () => {
        offlineReplayQueue._inMemoryQueue.push({
            event: 'tx:sync_retry',
            args: [{ retry: 1 }],
            timestamp: Date.now()
        });

        // Emitter que simula fallo de red
        const failingEmitter = async () => {
            throw new Error('Network timeout simulado en Supabase');
        };

        const count = await offlineReplayQueue.drain(failingEmitter);
        assert.equal(count, 0, 'No debe contabilizar como procesado un evento fallido');
        assert.equal(offlineReplayQueue._inMemoryQueue.length, 1, 'El evento debe conservarse en cola para reintento');

        // Limpiar para siguientes tests
        offlineReplayQueue._inMemoryQueue = [];
    });

    it('eventBus.emit debe despachar eventos a suscriptores activos', () => {
        let received = null;
        const unsubscribe = eventBus.on('test:echo', (data) => {
            received = data;
        });

        eventBus.emit('test:echo', { hello: 'BUCA AI' });
        assert.deepEqual(received, { hello: 'BUCA AI' });
        unsubscribe();
    });
});
