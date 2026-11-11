/**
 * SupabaseDriver - Motor de Persistencia Remota Oficial
 * =========================================================================
 * Almacenamiento estructurado en la nube con Supabase (PostgreSQL / Key-Value).
 * Métodos estándar: get, set, remove, list.
 * =========================================================================
 */
import { getSupabase } from '../../config/supabase.js';

export class SupabaseDriver {
    constructor(tableName = 'app_storage') {
        this.tableName = tableName;
        this.client = null;
    }

    _getClient() {
        if (!this.client) {
            this.client = getSupabase();
        }
        return this.client;
    }

    /**
     * Guarda un valor serializable en Supabase.
     * @param {string} key 
     * @param {any} value 
     * @returns {Promise<boolean>}
     */
    async set(key, value) {
        try {
            const client = this._getClient();
            const payload = {
                key,
                value,
                updated_at: new Date().toISOString()
            };
            const session = (await client.auth.getSession())?.data?.session;
            if (session?.user?.id && this.tableName === 'app_storage') {
                payload.owner_id = session.user.id;
            }

            const { error } = await client
                .from(this.tableName)
                .upsert(payload, { onConflict: 'key' });

            if (error) {
                console.warn(`[SupabaseDriver] Error writing key "${key}":`, error.message);
                return false;
            }
            return true;
        } catch (err) {
            console.error(`[SupabaseDriver] Unexpected set error for "${key}":`, err);
            return false;
        }
    }

    /**
     * Obtiene un valor desde Supabase por su clave.
     * @param {string} key 
     * @returns {Promise<any|null>}
     */
    async get(key) {
        try {
            const client = this._getClient();
            const { data, error } = await client
                .from(this.tableName)
                .select('value')
                .eq('key', key)
                .maybeSingle();

            if (error) {
                console.warn(`[SupabaseDriver] Error reading key "${key}":`, error.message);
                return null;
            }

            return data ? data.value : null;
        } catch (err) {
            console.error(`[SupabaseDriver] Unexpected get error for "${key}":`, err);
            return null;
        }
    }

    /**
     * Elimina una clave de Supabase.
     * @param {string} key 
     * @returns {Promise<boolean>}
     */
    async remove(key) {
        try {
            const client = this._getClient();
            const { error } = await client
                .from(this.tableName)
                .delete()
                .eq('key', key);

            if (error) {
                console.warn(`[SupabaseDriver] Error deleting key "${key}":`, error.message);
                return false;
            }
            return true;
        } catch (err) {
            console.error(`[SupabaseDriver] Unexpected remove error for "${key}":`, err);
            return false;
        }
    }

    /**
     * Lista pares clave-valor que coincidan con un prefijo.
     * @param {string} prefix 
     * @returns {Promise<Array<{key: string, value: any}>>}
     */
    async list(prefix = '') {
        try {
            const client = this._getClient();
            let query = client.from(this.tableName).select('key, value');

            if (prefix) {
                query = query.like('key', `${prefix}%`);
            }

            const { data, error } = await query;
            if (error) {
                console.warn(`[SupabaseDriver] Error listing with prefix "${prefix}":`, error.message);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error(`[SupabaseDriver] Unexpected list error:`, err);
            return [];
        }
    }

    /**
     * Retorna el cliente Supabase subyacente para consultas avanzadas a tablas específicas.
     */
    getClient() {
        return this._getClient();
    }
}

export default SupabaseDriver;
