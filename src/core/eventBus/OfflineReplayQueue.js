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
     * Encola un evento transaccional si el cliente está offline.
     */
    async enqueue(event, ...args) {
        if (!this._isTransactional(event)) return false;

        const record = {
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
     */
    async drain(emitterFn) {
        if (this._isReplaying) return 0;
        this._isReplaying = true;
        let count = 0;

        try {
            // 1. Drenar cola en memoria
            while (this._inMemoryQueue.length > 0) {
                const item = this._inMemoryQueue.shift();
                if (typeof emitterFn === 'function') {
                    emitterFn(item.event, ...item.args);
                    count++;
                }
            }

            // 2. Drenar IndexedDB
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
                    if (typeof emitterFn === 'function') {
                        emitterFn(item.event, ...item.args);
                        count++;
                    }
                }

                // Limpiar almacén
                await new Promise((resolve) => {
                    try {
                        const tx = db.transaction(STORE_NAME, 'readwrite');
                        const store = tx.objectStore(STORE_NAME);
                        store.clear();
                        tx.oncomplete = () => resolve();
                        tx.onerror = () => resolve();
                    } catch {
                        resolve();
                    }
                });
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
