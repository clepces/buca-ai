# 🔁 Cola de Retransmisión Offline e Idempotencia
## Manejo de Transacciones sin Conexión — B.U.C.A. AI

> **Módulo:** `docs/events/offline-replay-queue.md`  
> **Archivo Fuente:** `src/core/eventBus/OfflineReplayQueue.js`  
> **Estado:** `[Producción v1.1.8-alpha]`

---

## 1. Despacho Transaccional: `emitTransactional`

A diferencia de `emit()` estándar (fuego y olvido), `emitTransactional` garantiza que si la red falla, el evento no se pierda en el vacío:

```javascript
await eventBus.emitTransactional('finance:record_transaction', {
    idempotencyKey: 'tx_' + crypto.randomUUID(),
    amountUsd: 120.00,
    rateSnapshot: 45.20
});
```

1. Si el cliente está online y la red responde, el evento se procesa síncronamente.
2. Si el cliente está offline o el servidor retorna un error de red temporal (`503`, `timeout`), el evento se serializa en `OfflineReplayQueue` (persistido en `IndexedDB`).

---

## 2. Drenaje Secuencial Estricto (Strict FIFO Drain)

Al detectarse la reconexión a Internet (`window.addEventListener('online', ...)`):
- El drenaje retransmite los eventos en el orden exacto de captura para proteger la coherencia contable.
- Si un evento falla por error de negocio permanente (ej. `400 Bad Request`), se descarta y se notifica al usuario sin detener la cola.
- Si falla por conectividad, el drenaje se suspende inmediatamente para preservar el orden secuencial.
