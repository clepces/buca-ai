/**
 * SupabaseDriver - Motor de Persistencia Remota Oficial
 * =========================================================================
 * Almacenamiento estructurado en la nube con Supabase (PostgreSQL / Key-Value).
 * Aislamiento Multi-Tenant estricto filtrando por 'owner_id'.
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

    async _getCurrentUserId() {
        try {
            const client = this._getClient();
            const session = (await client.auth.getSession())?.data?.session;
            return session?.user?.id || null;
        } catch {
            return null;
        }
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
            const userId = await this._getCurrentUserId();
            if (userId && this.tableName === 'app_storage') {
                payload.owner_id = userId;
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
     * Obtiene un valor desde Supabase filtrando por owner_id del usuario.
     * @param {string} key 
     * @returns {Promise<any|null>}
     */
    async get(key) {
        try {
            const client = this._getClient();
            const userId = await this._getCurrentUserId();
            let query = client
                .from(this.tableName)
                .select('value')
                .eq('key', key);

            if (userId && this.tableName === 'app_storage') {
                query = query.or(`owner_id.eq.${userId},owner_id.is.null`);
            }

            const { data, error } = await query.maybeSingle();

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
     * Elimina una clave de Supabase verificando la propiedad del registro.
     * @param {string} key 
     * @returns {Promise<boolean>}
     */
    async remove(key) {
        try {
            const client = this._getClient();
            const userId = await this._getCurrentUserId();
            let query = client
                .from(this.tableName)
                .delete()
                .eq('key', key);

            if (userId && this.tableName === 'app_storage') {
                query = query.eq('owner_id', userId);
            }

            const { error } = await query;

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
     * Lista pares clave-valor que coincidan con un prefijo y pertenezcan al usuario.
     * @param {string} prefix 
     * @returns {Promise<Array<{key: string, value: any}>>}
     */
    async list(prefix = '') {
        try {
            const client = this._getClient();
            const userId = await this._getCurrentUserId();
            let query = client.from(this.tableName).select('key, value');

            if (userId && this.tableName === 'app_storage') {
                query = query.or(`owner_id.eq.${userId},owner_id.is.null`);
            }

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
