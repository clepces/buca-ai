/**
 * ProfileService - Gestión de Perfiles de Usuario (Supabase Native)
 * =========================================================================
 * Persistencia en tabla 'profiles' con Row Level Security (RLS).
 * =========================================================================
 */
import { getSupabase } from '@/core/config/supabase.js';
import { Logger } from '@/shared/utils/logger.js';

export const ProfileService = {
  _getClient() {
    return getSupabase();
  },

  async getProfile(uid) {
    if (!uid) return null;
    try {
      const client = this._getClient();
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'ProfileService', message: 'Error consultando perfil de usuario.', data: error.message });
        return null;
      }
      return data;
    } catch (err) {
      Logger.error({ layer: 'SERVICE', role: 'CLASS', target: 'ProfileService', message: 'Error inesperado consultando perfil.', data: err });
      return null;
    }
  },

  async updateProfile(uid, data) {
    if (!uid) throw new Error('UID is required');
    try {
      const client = this._getClient();
      const { error } = await client
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', uid);

      if (error) throw error;
      return true;
    } catch (err) {
      Logger.error({ layer: 'SERVICE', role: 'CLASS', target: 'ProfileService', message: 'Error actualizando perfil de usuario.', data: err.message || err });
      throw err;
    }
  },

  async createProfile(uid, data) {
    if (!uid) throw new Error('UID is required');
    try {
      const client = this._getClient();
      const payload = {
        id: uid,
        email: data.email || '',
        first_name: data.displayName || 'Operador BUCA',
        platform_role: data.role || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...data
      };
      const { data: inserted, error } = await client
        .from('profiles')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      return inserted;
    } catch (err) {
      Logger.error({ layer: 'SERVICE', role: 'CLASS', target: 'ProfileService', message: 'Error creando perfil de usuario.', data: err.message || err });
      throw err;
    }
  }
};

export default ProfileService;
