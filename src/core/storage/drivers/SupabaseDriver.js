/**
 * SupabaseDriver - Motor de Persistencia Remota Oficial
 * =========================================================================
 * Almacenamiento estructurado en la nube con Supabase (PostgreSQL / Key-Value).
 * Aislamiento Multi-Tenant estricto filtrando por 'owner_id'.
 * =========================================================================
 */
import { getSupabase } from '../../config/supabase.js';
import { Logger } from '@/shared/utils/logger.js';

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
            if (!client || !client.auth) return null;
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
            if (!client || typeof client.from !== 'function') {
                Logger.warn({
                    layer: 'STORAGE',
                    role: 'DRIVER',
                    target: 'SupabaseDriver',
                    message: 'Cliente Supabase no disponible. Omitiendo guardado remoto.',
                    data: { key }
                });
                return false;
            }
            const payload = {
                key,
                value,
                updated_at: new Date().toISOString()
            };
            const userId = await this._getCurrentUserId();
            if (this.tableName === 'app_storage') {
                if (!userId) {
                    Logger.warn({
                        layer: 'STORAGE',
                        role: 'DRIVER',
                        target: 'SupabaseDriver',
                        message: 'Bloqueo de seguridad: no se permite escribir en app_storage sin owner_id.',
                        data: { key }
                    });
                    return false;
                }
                payload.owner_id = userId;
            }

            const { error } = await client
                .from(this.tableName)
                .upsert(payload, { onConflict: 'key' });

            if (error) {
                Logger.warn({
                    layer: 'STORAGE',
                    role: 'DRIVER',
                    target: 'SupabaseDriver',
                    message: 'Error escribiendo clave remota en app_storage.',
                    data: { key, error: error.message }
                });
                return false;
            }
            return true;
        } catch (err) {
            Logger.error({
                layer: 'STORAGE',
                role: 'DRIVER',
                target: 'SupabaseDriver',
                message: 'Excepción inesperada al escribir clave remota en app_storage.',
                data: { key, error: err?.message || err }
            });
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
            if (!client || typeof client.from !== 'function') return null;
            const userId = await this._getCurrentUserId();
            let query = client
                .from(this.tableName)
                .select('value')
                .eq('key', key);

            if (this.tableName === 'app_storage') {
                if (!userId) return null;
                query = query.eq('owner_id', userId);
            }

            const { data, error } = await query.maybeSingle();

            if (error) {
                Logger.warn({
                    layer: 'STORAGE',
                    role: 'DRIVER',
                    target: 'SupabaseDriver',
                    message: 'Error leyendo clave remota en app_storage.',
                    data: { key, error: error.message }
                });
                return null;
            }

            return data ? data.value : null;
        } catch (err) {
            Logger.error({
                layer: 'STORAGE',
                role: 'DRIVER',
                target: 'SupabaseDriver',
                message: 'Excepción inesperada al leer clave remota en app_storage.',
                data: { key, error: err?.message || err }
            });
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
            if (!client || typeof client.from !== 'function') return false;
            const userId = await this._getCurrentUserId();
            let query = client
                .from(this.tableName)
                .delete()
                .eq('key', key);

            if (this.tableName === 'app_storage') {
                if (!userId) return false;
                query = query.eq('owner_id', userId);
            }

            const { error } = await query;

            if (error) {
                Logger.warn({
                    layer: 'STORAGE',
                    role: 'DRIVER',
                    target: 'SupabaseDriver',
                    message: 'Error eliminando clave remota en app_storage.',
                    data: { key, error: error.message }
                });
                return false;
            }
            return true;
        } catch (err) {
            Logger.error({
                layer: 'STORAGE',
                role: 'DRIVER',
                target: 'SupabaseDriver',
                message: 'Excepción inesperada al eliminar clave remota en app_storage.',
                data: { key, error: err?.message || err }
            });
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
            if (!client || typeof client.from !== 'function') return [];
            const userId = await this._getCurrentUserId();
            let query = client.from(this.tableName).select('key, value');

            if (this.tableName === 'app_storage') {
                if (!userId) return [];
                query = query.eq('owner_id', userId);
            }

            if (prefix) {
                query = query.like('key', `${prefix}%`);
            }

            const { data, error } = await query;
            if (error) {
                Logger.warn({
                    layer: 'STORAGE',
                    role: 'DRIVER',
                    target: 'SupabaseDriver',
                    message: 'Error listando claves remotas por prefijo en app_storage.',
                    data: { prefix, error: error.message }
                });
                return [];
            }

            return data || [];
        } catch (err) {
            Logger.error({
                layer: 'STORAGE',
                role: 'DRIVER',
                target: 'SupabaseDriver',
                message: 'Excepción inesperada al listar claves remotas en app_storage.',
                data: { prefix, error: err?.message || err }
            });
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
