/**
 * SupabaseProvider - Adaptador Oficial de Supabase Auth & MFA
 * =========================================================================
 * Punto de conexión con el SDK de Supabase Auth (@supabase/supabase-js).
 * Soporta autenticación nativa, sesiones automáticas y TOTP MFA en capa gratuita.
 * =========================================================================
 */
import { getSupabase, supabase } from '@/core/config/supabase.js';
import { Logger } from '@/shared/utils/logger.js';
import { getValidatedOrigin } from '@/core/utils/system-helper.js';

export const SupabaseProvider = {
    _getClient() {
        return getSupabase() || supabase;
    },

    /**
     * Autentica al usuario mediante email/password.
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        Logger.info('SupabaseProvider', 'Ejecutando signInWithPassword...');
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
        Logger.info('SupabaseProvider', 'Ejecutando signUp en Supabase...');
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
     * Envía correo de recuperación de contraseña con URL de retorno validada.
     * @param {string} email 
     */
    async recoverPassword(email) {
        Logger.info('SupabaseProvider', 'Enviando solicitud de recuperación...');
        const client = this._getClient();
        const origin = getValidatedOrigin();
        const { error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${origin}/auth/recovery/reset-password`
        });
        if (error) {
            Logger.error('SupabaseProvider', 'Error en recuperación:', error.message);
            throw error;
        }
        Logger.info('SupabaseProvider', 'Solicitud de recuperación procesada por el servidor (200 OK).');
        return true;
    },

    /**
     * Actualiza la contraseña del usuario únicamente en una sesión de recuperación verificada.
     * @param {string} newPassword 
     */
    async updateUserPassword(newPassword) {
        Logger.info('SupabaseProvider', 'Actualizando contraseña de usuario...');
        const isRecovery = await this.isRecoverySession();
        if (!isRecovery) {
            throw new Error('Sesión de recuperación no válida o no verificada.');
        }
        const client = this._getClient();
        const { data, error } = await client.auth.updateUser({ password: newPassword });
        if (error) throw error;
        return data;
    },

    /**
     * Cierra la sesión activa. Si falla el cierre global, intenta limpieza local vía SDK.
     * @returns {Promise<{ success: boolean, localCleared?: boolean, error?: string }>}
     */
    async logout() {
        const client = this._getClient();
        const { error } = await client.auth.signOut();
        if (error) {
            Logger.warn('SupabaseProvider', `Logout warning: ${error.message}`);
            let localCleared;
            try {
                const { error: localErr } = await client.auth.signOut({ scope: 'local' });
                localCleared = !localErr;
            } catch {
                localCleared = false;
            }
            return { success: false, localCleared, error: error.message };
        }
        return { success: true, localCleared: true };
    },

    /**
     * Escucha cambios en el estado de autenticación de Supabase.
     * @param {Function} callback (event, session)
     */
    onAuthStateChange(callback) {
        const client = this._getClient();
        if (!client || !client.auth || typeof client.auth.onAuthStateChange !== 'function') {
            return { unsubscribe: () => {} };
        }
        const res = client.auth.onAuthStateChange(callback);
        return res?.data?.subscription || res?.subscription || { unsubscribe: () => {} };
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

    /**
     * Verifica mediante claims del SDK si la sesión activa tiene origen PASSWORD_RECOVERY.
     * Falla cerrado (false) ante cualquier error o ausencia de claim 'recovery'.
     * @returns {Promise<boolean>}
     */
    async isRecoverySession() {
        try {
            const client = this._getClient();
            if (!client?.auth) return false;

            const session = await this.getSession();
            if (!session?.user) return false;

            const hasRecoveryMethod = (methods) =>
                Array.isArray(methods) &&
                methods.some((entry) => (typeof entry === 'string' ? entry === 'recovery' : entry?.method === 'recovery'));

            if (typeof client.auth.getClaims === 'function') {
                const { data, error } = await client.auth.getClaims();
                Logger.debug('SupabaseProvider', 'isRecoverySession getClaims:', {
                    error: error?.message || null,
                    amr: data?.claims?.amr ?? null
                });
                if (!error && data?.claims?.amr !== undefined) {
                    return hasRecoveryMethod(data.claims.amr);
                }
            }

            if (typeof client.auth.mfa?.getAuthenticatorAssuranceLevel === 'function') {
                const { data, error } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
                Logger.debug('SupabaseProvider', 'isRecoverySession AAL:', {
                    error: error?.message || null,
                    methods: data?.currentAuthenticationMethods ?? null
                });
                if (!error && Array.isArray(data?.currentAuthenticationMethods)) {
                    return hasRecoveryMethod(data.currentAuthenticationMethods);
                }
            }

            return false;
        } catch (err) {
            Logger.warn('SupabaseProvider', 'isRecoverySession exception:', err?.message || err);
            return false;
        }
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
