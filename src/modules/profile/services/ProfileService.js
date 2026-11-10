/**
 * ProfileService - Gestión de Perfiles de Usuario (Supabase Native)
 * =========================================================================
 * Persistencia en tabla 'profiles' con Row Level Security (RLS).
 * =========================================================================
 */
import { getSupabase } from '@/core/config/supabase.js';

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
        console.warn('[ProfileService] Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('[ProfileService] Unexpected profile fetch error:', err);
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
      console.error('[ProfileService] Error updating profile:', err.message || err);
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
      console.error('[ProfileService] Error creating profile:', err.message || err);
      throw err;
    }
  }
};

export default ProfileService;
