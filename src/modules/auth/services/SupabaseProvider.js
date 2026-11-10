/**
 * SupabaseProvider - Adaptador Oficial de Supabase Auth & MFA
 * =========================================================================
 * Punto de conexión con el SDK de Supabase Auth (@supabase/supabase-js).
 * Soporta autenticación nativa, sesiones automáticas y TOTP MFA en capa gratuita.
 * =========================================================================
 */
import { getSupabase } from '@/core/config/supabase.js';

export const SupabaseProvider = {
    _getClient() {
        return getSupabase();
    },

    /**
     * Autentica al usuario mediante email/password.
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        console.log('[SupabaseProvider] -> Ejecutando signInWithPassword...');
        const client = this._getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('[SupabaseProvider] Login Error:', error.message);
            throw error;
        }

        return data;
    },

    /**
     * Registra un nuevo usuario en Supabase Auth.
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    async register(email, password, name) {
        console.log('[SupabaseProvider] -> Ejecutando signUp en Supabase...');
        const client = this._getClient();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: {
                    displayName: name,
                    full_name: name
                }
            }
        });

        if (error) {
            console.error('[SupabaseProvider] Register Error:', error.message);
            throw error;
        }

        return data;
    },

    /**
     * Envía correo de recuperación de contraseña.
     * @param {string} email 
     */
    async recoverPassword(email) {
        console.log('[SupabaseProvider] -> Enviando recuperación...');
        const client = this._getClient();
        const { error } = await client.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return true;
    },

    /**
     * Cierra la sesión activa.
     */
    async logout() {
        const client = this._getClient();
        const { error } = await client.auth.signOut();
        if (error) console.warn('[SupabaseProvider] Logout warning:', error.message);
    },

    /**
     * Escucha cambios en el estado de autenticación de Supabase.
     * @param {Function} callback (event, session)
     */
    onAuthStateChange(callback) {
        const client = this._getClient();
        const { data: { subscription } } = client.auth.onAuthStateChange(callback);
        return subscription;
    },

    async getSession() {
        const client = this._getClient();
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    async getUser() {
        const client = this._getClient();
        const { data, error } = await client.auth.getUser();
        if (error) throw error;
        return data.user;
    },

    // =========================================================================
    // Supabase MFA (Multi-Factor Authentication - TOTP en capa gratuita)
    // =========================================================================

    /**
     * Inicia el enrolamiento de un factor TOTP.
     * @returns {Promise<{ id: string, type: 'totp', totp: { secret: string, qr_code: string, uri: string } }>}
     */
    async mfaEnroll(friendlyName = 'BUCA Authenticator') {
        const client = this._getClient();
        const { data, error } = await client.auth.mfa.enroll({
            factorType: 'totp',
            friendlyName,
            issuer: 'BUCA AI'
        });
        if (error) throw error;
        return data;
    },

    /**
     * Crea un desafío para un factor MFA.
     * @param {string} factorId 
     */
    async mfaChallenge(factorId) {
        const client = this._getClient();
        const { data, error } = await client.auth.mfa.challenge({ factorId });
        if (error) throw error;
        return data;
    },

    /**
     * Verifica el código TOTP para un desafío MFA.
     * @param {string} factorId 
     * @param {string} challengeId 
     * @param {string} code 
     */
    async mfaVerify(factorId, challengeId, code) {
        const client = this._getClient();
        const { data, error } = await client.auth.mfa.verify({
            factorId,
            challengeId,
            code
        });
        if (error) throw error;
        return data;
    },

    /**
     * Lista los factores MFA configurados del usuario actual.
     */
    async mfaListFactors() {
        const client = this._getClient();
        const { data, error } = await client.auth.mfa.listFactors();
        if (error) throw error;
        return data;
    },

    /**
     * Desvincula / elimina un factor MFA.
     * @param {string} factorId 
     */
    async mfaUnenroll(factorId) {
        const client = this._getClient();
        const { data, error } = await client.auth.mfa.unenroll({ factorId });
        if (error) throw error;
        return data;
    },

    /**
     * Obtiene el nivel de aseguramiento de autenticación (AAL1 vs AAL2).
     */
    async getAssuranceLevel() {
        const client = this._getClient();
        const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;
        return data;
    }
};

export default SupabaseProvider;
