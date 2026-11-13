import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { eventBus, offlineReplayQueue } from '../src/core/eventBus/index.js';

describe('EventBus Offline Replay Queue & Idempotency Suite (Etapa 10)', () => {
    it('Debe identificar eventos transaccionales para encolamiento', () => {
        assert.equal(offlineReplayQueue._isTransactional('tx:create_order'), true);
        assert.equal(offlineReplayQueue._isTransactional('finance:rate_sync'), true);
        assert.equal(offlineReplayQueue._isTransactional('audit:user_action'), true);
        assert.equal(offlineReplayQueue._isTransactional('ui:toggle_theme'), false);
    });

    it('Debe encolar eventos en memoria cuando el cliente simula estar offline con idempotency_key', async () => {
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

    it('Debe retener eventos y detener el orden si el handler remoto falla', async () => {
        offlineReplayQueue._inMemoryQueue = [
            { event: 'tx:fail_first', args: [{ id: 1 }], timestamp: Date.now() },
            { event: 'tx:second_wait', args: [{ id: 2 }], timestamp: Date.now() }
        ];

        const failingEmitter = async (ev) => {
            if (ev === 'tx:fail_first') throw new Error('Timeout simulado en Supabase');
        };

        const count = await offlineReplayQueue.drain(failingEmitter);
        assert.equal(count, 0, 'No debe incrementar count con fallo');
        assert.equal(offlineReplayQueue._inMemoryQueue.length, 2, 'Debe conservar ambos eventos para respetar orden estricto');
        assert.equal(offlineReplayQueue._inMemoryQueue[0].event, 'tx:fail_first');

        offlineReplayQueue._inMemoryQueue = [];
    });

    it('No debe descartar eventos si no existe emisor registrado (drain suspendido)', async () => {
        offlineReplayQueue._inMemoryQueue = [
            { event: 'tx:orphan_event', args: [], timestamp: Date.now() }
        ];

        const count = await offlineReplayQueue.drain(null);
        assert.equal(count, 0);
        assert.equal(offlineReplayQueue._inMemoryQueue.length, 1, 'El evento huérfano no debe desaparecer');

        offlineReplayQueue._inMemoryQueue = [];
    });

    it('Debe asignar idempotency_key determinista a registros legacy antiguos sin clave', async () => {
        offlineReplayQueue._inMemoryQueue = [
            { event: 'tx:legacy_item', args: [{ old: true }], timestamp: 1600000000000 }
        ];

        let receivedContext = null;
        const emitter = async (ev, args, ctx) => {
            receivedContext = ctx;
        };

        const count = await offlineReplayQueue.drain(emitter);
        assert.equal(count, 1);
        assert.ok(receivedContext && receivedContext.idempotency_key, 'Debe haber generado clave para el registro legacy');
        assert.match(receivedContext.idempotency_key, /^mem_/);
    });

    it('emitTransactional debe propagar errores si el suscriptor falla o si no hay handlers', async () => {
        await assert.rejects(
            async () => {
                await eventBus.emitTransactional('tx:unhandled_command', { test: true });
            },
            /Cero handlers registrados/
        );

        const unsub = eventBus.on('tx:exploding_command', () => {
            throw new Error('Explosión en suscriptor');
        });

        await assert.rejects(
            async () => {
                await eventBus.emitTransactional('tx:exploding_command', { test: true });
            },
            /Explosión en suscriptor/
        );

        unsub();
    });

    it('No debe generar doble efecto entre emisión offline local y posterior replay', async () => {
        let executions = 0;
        const unsub = eventBus.on('tx:double_check', () => {
            executions++;
        });

        const origIsOnline = offlineReplayQueue.isOnline;
        offlineReplayQueue.isOnline = () => false;

        try {
            // Mientras está offline, emit() de comando transaccional solo encola
            eventBus.emit('tx:double_check', { amount: 100 });
            assert.equal(executions, 0, 'No debe ejecutar el efecto local mientras está offline');
            assert.equal(offlineReplayQueue._inMemoryQueue.length, 1);

            // Al pasar online y drenar con replay, se ejecuta exactamente una vez
            offlineReplayQueue.isOnline = () => true;
            await offlineReplayQueue.drain(async (ev, ...args) => {
                await eventBus.emitTransactional(ev, ...args);
            });

            assert.equal(executions, 1, 'Debe ejecutarse solo durante el replay confirmado');
        } finally {
            offlineReplayQueue.isOnline = origIsOnline;
            unsub();
            offlineReplayQueue._inMemoryQueue = [];
        }
    });

    it('eventBus.emit estándar debe despachar eventos no transaccionales de forma síncrona', () => {
        let received = null;
        const unsubscribe = eventBus.on('test:echo', (data) => {
            received = data;
        });

        eventBus.emit('test:echo', { hello: 'BUCA AI' });
        assert.deepEqual(received, { hello: 'BUCA AI' });
        unsubscribe();
    });
});
