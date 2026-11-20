/**
 * AuthService - Orquestador de Autenticación & MFA Nativo de Supabase
 * Maneja login con signInWithPassword, registro, recuperación y TOTP MFA.
 */
import { SupabaseProvider } from './SupabaseProvider.js';
import { getSupabase } from '@/core/config/supabase.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';
import { Logger } from '@/shared/utils/logger.js';

export const AuthService = {
    async checkSession() {
        try {
            const session = await SupabaseProvider.getSession();
            if (!session || !session.user) {
                sessionState.set({ isAuthenticated: false, mfaPending: false, user: null, currentRole: 'guest' });
                return { isAuthenticated: false };
            }

            const user = session.user;
            try {
                const aal = await SupabaseProvider.getAssuranceLevel();
                if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                    sessionState.set({ isAuthenticated: false, mfaPending: true, user: null, currentRole: 'guest' });
                    return { isAuthenticated: false, mfaPending: true };
                }
            } catch {
                sessionState.set({ isAuthenticated: false, mfaPending: true, user: null, currentRole: 'guest' });
                return { isAuthenticated: false, mfaPending: true };
            }

            const profile = await this._loadOrCreateProfile(user);
            const role = profile?.platform_role || 'user';
            sessionState.set({
                isAuthenticated: true,
                mfaPending: false,
                isAAL2Verified: false,
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (user.user_metadata?.displayName || user.email.split('@')[0]),
                    role
                },
                currentRole: role
            });
            return { isAuthenticated: true, user };
        } catch {
            sessionState.set({ isAuthenticated: false, mfaPending: false, user: null, currentRole: 'guest' });
            return { isAuthenticated: false };
        }
    },

    async login(email, password) {
        Logger.info('AuthService', `Intentando login con Supabase para ${email}`);
        try {
            const data = await SupabaseProvider.login(email, password);
            const user = data.user;

            try {
                const aal = await SupabaseProvider.getAssuranceLevel();
                if (aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                    Logger.info('AuthService', 'MFA Requerido (AAL2)');
                    const factors = await SupabaseProvider.mfaListFactors();
                    const totpFactor = factors?.totp?.[0];

                    if (totpFactor) {
                        sessionState.set({ isAuthenticated: false, mfaPending: true, user: null, currentRole: 'guest' });
                        eventBus.emit('auth:mfa-required', { factorId: totpFactor.id, user });
                        return { success: false, mfaRequired: true, factorId: totpFactor.id, user };
                    }
                }
            } catch (mfaCheckErr) {
                Logger.error('AuthService', 'Fallo evaluando nivel AAL (Fail-Closed):', mfaCheckErr.message);
                sessionState.set({ isAuthenticated: false, mfaPending: true, user: null, currentRole: 'guest' });
                return { success: false, error: 'Error de verificación de seguridad AAL. Se requiere autenticación estricta.' };
            }

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
            Logger.error('AuthService', 'Fallo en autenticación:', error.message);
            eventBus.emit('auth:login-failed', { error });
            return { success: false, error: error.message };
        }
    },

    async _verifyFactorChallenge(factorId, code) {
        const challenge = await SupabaseProvider.mfaChallenge(factorId);
        const verifyResult = await SupabaseProvider.mfaVerify(factorId, challenge.id, code);
        return { challengeId: challenge.id, verifyResult };
    },

    async verifyMFAChallenge(factorId, code) {
        try {
            const { verifyResult } = await this._verifyFactorChallenge(factorId, code);
            const user = await SupabaseProvider.getUser();
            const profile = await this._loadOrCreateProfile(user);
            const role = profile?.platform_role || 'user';

            sessionState.set({
                isAuthenticated: true,
                mfaPending: false,
                isAAL2Verified: true,
                user: {
                    uid: user.id,
                    email: user.email,
                    displayName: profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (user.email.split('@')[0]),
                    role
                },
                currentRole: role
            });

            eventBus.emit('auth:login-success', { user });
            return { success: true, result: verifyResult };
        } catch (error) {
            Logger.error('AuthService', 'Fallo verificando código MFA:', error.message);
            return { success: false, error: error.message };
        }
    },

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
            Logger.error('AuthService', 'Fallo enrolando TOTP:', error.message);
            return { success: false, error: error.message };
        }
    },

    async confirmTOTPEnrollment(factorId, code) {
        try {
            const { verifyResult } = await this._verifyFactorChallenge(factorId, code);
            sessionState.set({ isAAL2Verified: true, mfaPending: false });
            return { success: true, result: verifyResult };
        } catch (error) {
            Logger.error('AuthService', 'Fallo confirmando enrolamiento TOTP:', error.message);
            return { success: false, error: error.message };
        }
    },

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
            Logger.error('AuthService', 'Fallo en registro:', error.message);
            eventBus.emit('auth:register-failed', { error });
            return { success: false, error: error.message };
        }
    },

    async recoverPassword(email) {
        try {
            await SupabaseProvider.recoverPassword(email);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async logout() {
        try {
            await SupabaseProvider.logout();
            sessionState.clear();
            try {
                localStorage.removeItem('buca_supabase_auth');
            } catch { /* ignore */ }
            eventBus.emit('auth:logout-success');
        } catch (error) {
            Logger.error('AuthService', 'Error al cerrar sesión:', error);
        } finally {
            setTimeout(() => { window.location.href = '/'; }, 500);
        }
    },

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
            Logger.warn('AuthService', 'Error sincronizando perfil:', err.message);
            return null;
        }
    }
};

export default AuthService;
