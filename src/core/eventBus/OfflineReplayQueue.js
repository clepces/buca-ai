/**
 * OfflineReplayQueue - Resiliencia y Encolamiento Transaccional Offline para EventBus
 * =========================================================================
 * Almacenamiento seguro en IndexedDB con retransmisión automática al restablecer
 * la conectividad (evento 'online').
 * =========================================================================
 */

const DB_NAME = 'buca_eventbus_offline';
const STORE_NAME = 'events_queue';
const DB_VERSION = 1;

// Prefijos de eventos transaccionales críticos que deben persistirse offline
const TRANSACTIONAL_PREFIXES = ['tx:', 'finance:', 'audit:', 'sync:', 'activity:', 'notifications:'];

class OfflineReplayQueue {
    constructor() {
        this._db = null;
        this._isReplaying = false;
        this._inMemoryQueue = [];
        this._initListener();
    }

    _isTransactional(event) {
        if (!event || typeof event !== 'string') return false;
        return TRANSACTIONAL_PREFIXES.some(prefix => event.startsWith(prefix));
    }

    _openDB() {
        if (typeof indexedDB === 'undefined') return Promise.resolve(null);
        if (this._db) return Promise.resolve(this._db);

        return new Promise((resolve) => {
            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);
                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(STORE_NAME)) {
                        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                    }
                };
                request.onsuccess = (e) => {
                    this._db = e.target.result;
                    resolve(this._db);
                };
                request.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    /**
     * Encola un evento transaccional si el cliente está offline con clave idempotente.
     */
    async enqueue(event, ...args) {
        if (!this._isTransactional(event)) return false;

        const idempotencyKey = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const record = {
            idempotency_key: idempotencyKey,
            event,
            args,
            timestamp: Date.now()
        };

        const db = await this._openDB();
        if (!db) {
            this._inMemoryQueue.push(record);
            return true;
        }

        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                store.add(record);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => {
                    this._inMemoryQueue.push(record);
                    resolve(true);
                };
            } catch {
                this._inMemoryQueue.push(record);
                resolve(true);
            }
        });
    }

    /**
     * Reejecuta los eventos pendientes a través del emisor suministrado.
     * Espera la confirmación asíncrona de éxito antes de descartar cada evento.
     */
    async drain(emitterFn) {
        if (this._isReplaying) return 0;
        this._isReplaying = true;
        let count = 0;
        const targetEmitter = emitterFn || this._onOnlineEmitter;

        try {
            // 1. Drenar cola en memoria de manera resiliente e idempotente
            while (this._inMemoryQueue.length > 0) {
                const item = this._inMemoryQueue[0];
                if (typeof targetEmitter === 'function') {
                    try {
                        await targetEmitter(item.event, ...item.args);
                        this._inMemoryQueue.shift();
                        count++;
                    } catch (emitErr) {
                        console.warn('[OfflineReplayQueue] Fallo en retransmisión de evento en memoria. Deteniendo drenaje:', emitErr);
                        break;
                    }
                } else {
                    this._inMemoryQueue.shift();
                }
            }

            // 2. Drenar IndexedDB confirmando transacción por transacción con clave idempotente
            const db = await this._openDB();
            if (!db) return count;

            const records = await new Promise((resolve) => {
                try {
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => resolve([]);
                } catch {
                    resolve([]);
                }
            });

            if (records.length > 0) {
                for (const item of records) {
                    if (typeof targetEmitter === 'function') {
                        try {
                            await targetEmitter(item.event, ...item.args);

                            // Descartar el evento de IndexedDB solo tras confirmación asíncrona exitosa
                            await new Promise((resolve) => {
                                try {
                                    const tx = db.transaction(STORE_NAME, 'readwrite');
                                    const store = tx.objectStore(STORE_NAME);
                                    const delReq = store.delete(item.id);
                                    delReq.onsuccess = () => resolve();
                                    delReq.onerror = () => resolve();
                                } catch {
                                    resolve();
                                }
                            });
                            count++;
                        } catch (err) {
                            console.warn('[OfflineReplayQueue] Fallo en confirmación de comando persistido:', item.idempotency_key, err);
                            break;
                        }
                    }
                }
            }

            return count;
        } finally {
            this._isReplaying = false;
        }
    }

    _initListener() {
        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            window.addEventListener('online', () => {
                console.log('[OfflineReplayQueue] Red recuperada. Reenviando eventos encolados...');
                if (this._onOnlineEmitter) {
                    this.drain(this._onOnlineEmitter);
                }
            });
        }
    }

    registerEmitter(emitterFn) {
        this._onOnlineEmitter = emitterFn;
    }

    isOnline() {
        if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
            return navigator.onLine;
        }
        return true;
    }
}

export const offlineReplayQueue = new OfflineReplayQueue();
export default offlineReplayQueue;
