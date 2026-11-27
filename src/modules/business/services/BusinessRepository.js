/**
 * BusinessRepository - Repositorio de Comercios (Supabase Native)
 * =========================================================================
 * Persistencia en tabla 'businesses' con Row Level Security (RLS).
 * =========================================================================
 */
import { getSupabase } from '@/core/config/supabase.js';
import { Logger } from '@/shared/utils/logger.js';

export const BusinessRepository = {
  _getClient() {
    return getSupabase();
  },

  async getBusinessesForUser(uid) {
    if (!uid) return [];
    try {
      const client = this._getClient();
      const { data, error } = await client
        .from('businesses')
        .select('*')
        .eq('owner_id', uid);

      if (error) {
        Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'BusinessRepository', message: 'Error al consultar comercios del usuario.', data: error.message });
        return [];
      }
      return data || [];
    } catch (err) {
      Logger.error({ layer: 'SERVICE', role: 'CLASS', target: 'BusinessRepository', message: 'Error inesperado consultando comercios.', data: err });
      return [];
    }
  },

  async registerBusiness(uid, businessData) {
    if (!uid) throw new Error('Owner UID required');
    try {
      const client = this._getClient();
      const businessId = 'biz_' + Date.now();
      const safeData = { ...(businessData || {}) };
      delete safeData.businessId;
      delete safeData.owner_id;

      const payload = {
        ...safeData,
        id: businessId,
        owner_id: uid,
        name: safeData.name || 'Mi Negocio BUCA',
        rif: safeData.rif || 'J-00000000-0',
        category: safeData.category || safeData.sector || 'Retail / Alimentos',
        status: 'active',
        created_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('businesses')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data || payload;
    } catch (err) {
      Logger.error({ layer: 'SERVICE', role: 'CLASS', target: 'BusinessRepository', message: 'Error registrando unidad comercial.', data: err.message || err });
      throw err;
    }
  }
};

export default BusinessRepository;
