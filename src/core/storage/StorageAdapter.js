/**
 * StorageAdapter - Orquestador Inteligente de Persistencia
 * =========================================================================
 * Selecciona dinámicamente el motor de guardado local según el hardware (Tier)
 * e integra SupabaseDriver como el motor de persistencia en la nube oficial.
 * Implementa Namespacing para evitar colisiones entre módulos.
 * =========================================================================
 */
import LocalDriver from './drivers/LocalDriver.js';
import IndexedDBDriver from './drivers/IndexedDBDriver.js';
import SupabaseDriver from './drivers/SupabaseDriver.js';

class StorageAdapter {
    constructor() {
        this.driver = null;
        this.remoteDriver = new SupabaseDriver();
        this._initialized = false;
        this._currentTier = 'L0';
    }

    /**
     * Inicializa o actualiza el motor de guardado basándose en el Tier de rendimiento.
     * @param {string} tier - 'L0', 'L1', 'L2', 'L3'
     */
    init(tier = 'L0') {
        const isAdvancedTier = tier === 'L2' || tier === 'L3';
        const targetDriverClass = isAdvancedTier ? IndexedDBDriver : LocalDriver;

        // Si ya está activo el driver del tipo correspondiente, no re-instanciar
        if (this.driver instanceof targetDriverClass) {
            this._currentTier = tier;
            return;
        }

        if (isAdvancedTier) {
            this.driver = new IndexedDBDriver();
            console.log('[Storage] -> Motor Avanzado Activado (IndexedDB)');
        } else {
            this.driver = new LocalDriver();
            console.log('[Storage] -> Motor Ligero Activado (LocalStorage)');
        }

        this._currentTier = tier;
        this._initialized = true;
    }

    /**
     * Crea un "Cajón" (Namespace) específico para un módulo con acceso local y remoto.
     * @param {string} namespace 
     */
    forModule(namespace) {
        return {
            set: (key, value) => this.set(`${namespace}:${key}`, value),
            get: (key) => this.get(`${namespace}:${key}`),
            remove: (key) => this.remove(`${namespace}:${key}`),
            // Persistencia remota en la nube
            setRemote: (key, value) => this.setRemote(`${namespace}:${key}`, value),
            getRemote: (key) => this.getRemote(`${namespace}:${key}`),
            removeRemote: (key) => this.removeRemote(`${namespace}:${key}`),
            listRemote: (prefix = '') => this.listRemote(`${namespace}:${prefix}`)
        };
    }

    // Persistencia Local (Optimizada por Tiers)
    async set(key, value) {
        if (!this._initialized) this.init();
        return await this.driver.set(key, value);
    }

    async get(key) {
        if (!this._initialized) this.init();
        const val = await this.driver.get(key);
        // Fallback a LocalDriver si estamos en IndexedDB y el dato se guardó en LocalStorage
        if (val === null && this.driver instanceof IndexedDBDriver) {
            const localFallback = new LocalDriver();
            return await localFallback.get(key);
        }
        return val;
    }

    async remove(key) {
        if (!this._initialized) this.init();
        return await this.driver.remove(key);
    }

    // Persistencia Remota Oficial (Supabase Cloud)
    async setRemote(key, value) {
        return await this.remoteDriver.set(key, value);
    }

    async getRemote(key) {
        return await this.remoteDriver.get(key);
    }

    async removeRemote(key) {
        return await this.remoteDriver.remove(key);
    }

    async listRemote(prefix = '') {
        return await this.remoteDriver.list(prefix);
    }

    /**
     * Retorna el driver remoto oficial de Supabase.
     */
    remote() {
        return this.remoteDriver;
    }
}

export const storage = new StorageAdapter();
export default storage;
