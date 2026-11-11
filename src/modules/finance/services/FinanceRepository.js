/**
 * FinanceRepository - Repositorio de Persistencia Financiera B.U.C.A. AI (Supabase Native)
 * =========================================================================
 * Almacena y sincroniza tasas cambiarias (BCV, paralelo) y brecha cambiaria
 * en la tabla 'finance_rates' de Supabase con RLS optimizado.
 * =========================================================================
 */
import { getSupabase } from '../../../core/config/supabase.js';

export const FinanceRepository = {
    _getClient() {
        return getSupabase();
    },

    /**
     * Calcula la brecha porcentual entre tasa oficial y paralela.
     * @param {number} official 
     * @param {number} parallel 
     * @returns {number}
     */
    calculateGap(official, parallel) {
        const off = Number(official) || 0;
        const par = Number(parallel) || 0;
        if (off <= 0) return 0;
        const gap = ((par - off) / off) * 100;
        return Number(gap.toFixed(2));
    },

    /**
     * Guarda la tasa operativa personalizada en Supabase.
     * @param {string} tenantId 
     * @param {number} rate 
     * @param {string} currency 
     */
    async saveCustomRate(tenantId = 'default', rate, currency = 'USD') {
        return this.saveRateSnapshot(tenantId, { rate, currency });
    },

    /**
     * Registra un snapshot completo de cotización multimoneda.
     * @param {string} tenantId 
     * @param {Object} options 
     */
    async saveRateSnapshot(tenantId = 'default', options = {}) {
        const {
            rate,
            rateParallel = null,
            currency = 'USD',
            source = 'BCV/DolarVzla'
        } = options;

        try {
            const client = this._getClient();
            const gapPercentage = (rate && rateParallel)
                ? this.calculateGap(rate, rateParallel)
                : null;

            const payload = {
                tenant_id: tenantId,
                rate: Number(rate),
                rate_parallel: rateParallel ? Number(rateParallel) : null,
                gap_percentage: gapPercentage,
                currency,
                source,
                updated_at: new Date().toISOString()
            };

            const { error } = await client
                .from('finance_rates')
                .upsert(payload, { onConflict: 'tenant_id' });

            if (error) throw error;
            return payload;
        } catch (err) {
            console.error('[FinanceRepository] Error saving rate snapshot:', err.message || err);
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
