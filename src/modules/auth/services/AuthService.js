/**
 * AuthService - Orquestador de Autenticación & MFA Nativo de Supabase
 * =========================================================================
 * Maneja login con signInWithPassword, registro, recuperación y TOTP MFA
 * oficial provisto por Supabase en capa gratuita.
 * =========================================================================
 */
import { SupabaseProvider } from './SupabaseProvider.js';
import { getSupabase } from '@/core/config/supabase.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';

export const AuthService = {
    /**
     * Intenta iniciar sesión con email y contraseña.
     * @param {string} email 
     * @param {string} password 
     */
    async login(email, password) {
        console.log(`[AuthService] -> Intentando login con Supabase para ${email}`);

        try {
            const data = await SupabaseProvider.login(email, password);
            const user = data.user;

            // Verificar si el usuario tiene un factor MFA TOTP pendiente (AAL2)
            try {
                const aal = await SupabaseProvider.getAssuranceLevel();
                if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                    console.log('[AuthService] -> MFA Requerido (AAL2)');
                    const factors = await SupabaseProvider.mfaListFactors();
                    const totpFactor = factors?.totp?.[0];

                    if (totpFactor) {
                        eventBus.emit('auth:mfa-required', { factorId: totpFactor.id, user });
                        return {
                            success: false,
                            mfaRequired: true,
                            factorId: totpFactor.id,
                            user
                        };
                    }
                }
            } catch (mfaCheckErr) {
                console.warn('[AuthService] No se pudo evaluar nivel AAL:', mfaCheckErr.message);
            }

            // Cargar o sincronizar perfil en la tabla 'profiles'
            const profile = await this._loadOrCreateProfile(user);
            const role = profile?.platform_role || 'user';

            sessionState.set({
                isAuthenticated: true,
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (user.user_metadata?.displayName || user.email.split('@')[0]),
                    role
                },
                currentRole: role
            });

            eventBus.emit('auth:login-success', { user });
            return { success: true, user };
        } catch (error) {
            console.error('[AuthService] Fallo en autenticación:', error.message);
            eventBus.emit('auth:login-failed', { error });
            return { success: false, error: error.message };
        }
    },

    /**
     * Resuelve el desafío de segundo factor TOTP para completar la autenticación.
     * @param {string} factorId 
     * @param {string} code 
     */
    async verifyMFAChallenge(factorId, code) {
        try {
            const challenge = await SupabaseProvider.mfaChallenge(factorId);
            const result = await SupabaseProvider.mfaVerify(factorId, challenge.id, code);

            const user = await SupabaseProvider.getUser();
            const profile = await this._loadOrCreateProfile(user);
            const role = profile?.platform_role || 'user';

            sessionState.set({
                isAuthenticated: true,
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (user.email.split('@')[0]),
                    role
                },
                currentRole: role
            });

            eventBus.emit('auth:login-success', { user });
            return { success: true, result };
        } catch (error) {
            console.error('[AuthService] Fallo verificando código MFA:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Inicia el enrolamiento de un factor TOTP para el usuario autenticado.
     */
    async enrollTOTP() {
        try {
            const enrollment = await SupabaseProvider.mfaEnroll('BUCA Authenticator');
            return {
                success: true,
                factorId: enrollment.id,
                secret: enrollment.totp.secret,
                qrCode: enrollment.totp.qr_code,
                uri: enrollment.totp.uri
            };
        } catch (error) {
            console.error('[AuthService] Fallo enrolando TOTP:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Confirma la activación del factor TOTP con el primer código de prueba.
     * @param {string} factorId 
     * @param {string} code 
     */
    async confirmTOTPEnrollment(factorId, code) {
        return await this.verifyMFAChallenge(factorId, code);
    },

    /**
     * Registra un nuevo usuario en Supabase.
     */
    async register(email, password, name) {
        try {
            const data = await SupabaseProvider.register(email, password, name);
            const user = data.user;

            if (user) {
                await this._loadOrCreateProfile(user, name);
                sessionState.set({
                    isAuthenticated: true,
                    user: { uid: user.id, email: user.email, displayName: name, role: 'user' },
                    currentRole: 'user'
                });
                eventBus.emit('auth:register-success', { user });
            }

            return { success: true, user };
        } catch (error) {
            console.error('[AuthService] Fallo en registro:', error.message);
            eventBus.emit('auth:register-failed', { error });
            return { success: false, error: error.message };
        }
    },

    /**
     * Envía correo de recuperación de contraseña.
     */
    async recoverPassword(email) {
        try {
            await SupabaseProvider.recoverPassword(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Cierra la sesión activa en Supabase y limpia el estado local.
     */
    async logout() {
        try {
            await SupabaseProvider.logout();
            sessionState.clear();
            try {
                localStorage.removeItem('buca_supabase_auth');
            } catch {
                // Silencioso
            }
            eventBus.emit('auth:logout-success');
        } catch (error) {
            console.error('[AuthService] Error al cerrar sesión:', error);
        } finally {
            setTimeout(() => {
                window.location.href = '/';
            }, 500);
        }
    },

    /**
     * Helper interno para sincronizar el perfil en la tabla 'profiles'.
     * @private
     */
    async _loadOrCreateProfile(user, optionalName = '') {
        if (!user || !user.id) return null;
        const client = getSupabase();

        try {
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!error && data) return data;

            // Crear perfil por defecto si no existe
            const nameParts = (optionalName || user.user_metadata?.displayName || user.email.split('@')[0]).split(' ');
            const defaultProfile = {
                id: user.id,
                email: user.email,
                username: user.email.split('@')[0],
                first_name: nameParts[0] || 'Operador',
                last_name: nameParts.slice(1).join(' ') || 'BUCA',
                platform_role: 'user',
                active_mode: 'owner'
            };

            const { data: inserted } = await client
                .from('profiles')
                .insert(defaultProfile)
                .select()
                .maybeSingle();

            return inserted || defaultProfile;
        } catch (err) {
            console.warn('[AuthService] Error sincronizando perfil:', err.message);
            return null;
        }
    }
};

export default AuthService;
