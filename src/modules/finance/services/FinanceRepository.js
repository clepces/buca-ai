/**
 * FinanceRepository - Repositorio de Persistencia Financiera BUSA-I (Supabase Native)
 * =========================================================================
 * Maneja el almacenamiento de tasas cambiarias en la tabla 'finance_rates' de Supabase.
 * =========================================================================
 */
import { getSupabase } from '@/core/config/supabase.js';

export const FinanceRepository = {
    _getClient() {
        return getSupabase();
    },

    /**
     * Guarda la tasa operativa personalizada en Supabase.
     * @param {string} tenantId 
     * @param {number} rate 
     * @param {string} currency 
     */
    async saveCustomRate(tenantId = 'default', rate, currency = 'USD') {
        try {
            const client = this._getClient();
            const data = {
                tenant_id: tenantId,
                rate,
                currency,
                updated_at: new Date().toISOString()
            };

            const { error } = await client
                .from('finance_rates')
                .upsert(data, { onConflict: 'tenant_id' });

            if (error) throw error;
            return data;
        } catch (err) {
            console.error('[FinanceRepository] Error saving custom rate in Supabase:', err.message || err);
            throw err;
        }
    },

    /**
     * Obtiene las preferencias de tasa cambiaria del tenant desde Supabase.
     * @param {string} tenantId 
     */
    async getTenantRate(tenantId = 'default') {
        try {
            const client = this._getClient();
            const { data, error } = await client
                .from('finance_rates')
                .select('*')
                .eq('tenant_id', tenantId)
                .maybeSingle();

            if (error) {
                console.warn('[FinanceRepository] Warning getting tenant rate from Supabase:', error.message);
                return null;
            }
            return data;
        } catch (err) {
            console.warn('[FinanceRepository] Warning getting tenant rate:', err.message);
            return null;
        }
    }
};

export default FinanceRepository;
