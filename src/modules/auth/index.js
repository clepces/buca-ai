/**
 * Módulo Auth - Orquestador de Identidad (Supabase Native)
 * =========================================================================
 * Punto de entrada del módulo. Coordina el ciclo de autenticación y autorización
 * sincronizando el estado de sesión con Supabase Auth y el Kernel.
 * =========================================================================
 */
import { AUTH_EVENTS } from './constants/auth.constants.js';
import { eventBus } from '@/core/eventBus/index.js';
import DeviceFingerprint from '@/core/security/DeviceFingerprint.js';
import { authRoutes } from './routes.js';
import { AuthService } from './services/AuthService.js';
import { SupabaseProvider } from './services/SupabaseProvider.js';
import { sessionState } from '@/core/state/session.js';
import { router } from '@/core/router/router.js';
import { getSupabase } from '@/core/config/supabase.js';

export const AuthModule = {
    /**
     * Inicializa los listeners del módulo.
     */
    async init() {
        console.log('[Auth] -> Módulo inicializado (Supabase Backend)');
        if (router && typeof router.addRoutes === 'function') {
            router.addRoutes(authRoutes);
        }
        this.setupListeners();

        // Escuchar cambios de autenticación nativos de Supabase
        try {
            SupabaseProvider.onAuthStateChange(async (_event, session) => {
                if (session && session.user) {
                    const user = session.user;
                    let role = 'user';
                    try {
                        const client = getSupabase();
                        const { data: profile } = await client
                            .from('profiles')
                            .select('platform_role, first_name, last_name')
                            .eq('id', user.id)
                            .maybeSingle();

                        if (profile) {
                            role = profile.platform_role || 'user';
                        }
                    } catch {
                        role = 'user';
                    }

                    try {
                        const aal = await SupabaseProvider.getAssuranceLevel();
                        if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                            sessionState.set({
                                isAuthenticated: false,
                                mfaPending: true,
                                user: null,
                                currentRole: 'guest'
                            });
                            console.log('[AuthModule] -> Sesión retenida: AAL2 pendiente de verificación TOTP.');
                            return;
                        }
                    } catch (aalErr) {
                        console.warn('[AuthModule] -> Error evaluando AAL:', aalErr.message);
                    }

                    sessionState.set({
                        isAuthenticated: true,
                        mfaPending: false,
                        user: {
                            uid: user.id,
                            email: user.email,
                            displayName: user.user_metadata?.displayName || user.email.split('@')[0],
                            role
                        },
                        currentRole: role
                    });
                    console.log('[AuthModule] -> Sesión sincronizada con Supabase Auth:', user.email);
                } else {
                    sessionState.set({
                        isAuthenticated: false,
                        user: null,
                        currentRole: 'guest'
                    });
                }
            });
        } catch (err) {
            console.warn('[AuthModule] -> No se pudo adjuntar listener de Supabase Auth:', err);
        }
    },

    /**
     * Configura la escucha de eventos globales.
     */
    setupListeners() {
        eventBus.on(AUTH_EVENTS.LOGIN_START, async (credentials) => {
            await this.handleLogin(credentials);
        });
    },

    /**
     * Ciclo de vida del Login (Fase 1 y 2).
     */
    async handleLogin({ email, password }) {
        try {
            console.log(`[Auth] -> Iniciando Phase 1: Identity para ${email}`);
            const result = await AuthService.login(email, password);

            if (result.success) {
                // Phase 2: Device Authorization
                const fingerprint = await DeviceFingerprint.generate();
                console.log(`[Auth] -> Fingerprint generado: ${fingerprint}`);

                eventBus.emit(AUTH_EVENTS.DEVICE_CHALLENGE, { fingerprint });
            } else if (result.mfaRequired) {
                console.log('[Auth] -> Desafío MFA requerido para completar el inicio de sesión.');
            } else {
                console.error('[Auth] -> Login fallido:', result.error);
            }
        } catch (error) {
            console.error('[Auth] -> Error en login:', error);
        }
    }
};

export default AuthModule;
