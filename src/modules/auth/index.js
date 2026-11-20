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
import { Logger } from '@/shared/utils/logger.js';

export const AuthModule = {
    /**
     * Inicializa los listeners del módulo.
     */
    async init() {
        Logger.info('AuthModule', 'Módulo inicializado (Supabase Backend)');
        if (router && typeof router.addRoutes === 'function') {
            router.addRoutes(authRoutes);
        }
        this.setupListeners();

        // Escuchar cambios de autenticación nativos de Supabase
        try {
            SupabaseProvider.onAuthStateChange(async (_event, session) => {
                if (session && session.user) {
                    const user = session.user;
                    const currentSession = sessionState.get();

                    // Prevenir sobrecarga de peticiones: Si el usuario ya está plenamente autenticado y con AAL2 verificado
                    if (currentSession.isAuthenticated && currentSession.user?.uid === user.id && currentSession.isAAL2Verified) {
                        Logger.debug('AuthModule', `Sincronización silenciosa [${_event}]: sesión activa para ${user.email}`);
                        return;
                    }

                    let role = currentSession.user?.role || 'user';
                    try {
                        const client = getSupabase();
                        const { data: profile } = await client
                            .from('profiles')
                            .select('platform_role, first_name, last_name')
                            .eq('id', user.id)
                            .maybeSingle();

                        if (profile) {
                            role = profile.platform_role || role;
                        }
                    } catch {
                        // Mantener rol previo o fallback seguro
                    }

                    let aal = null;
                    try {
                        aal = await SupabaseProvider.getAssuranceLevel();
                        if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                            // Si el usuario no estaba autenticado o es un login inicial, retener sesión para MFA
                            if (!currentSession.isAuthenticated || currentSession.user?.uid !== user.id) {
                                sessionState.set({
                                    isAuthenticated: false,
                                    mfaPending: true,
                                    isAAL2Verified: false,
                                    user: null,
                                    currentRole: 'guest'
                                });
                                Logger.warn('AuthModule', 'Sesión retenida: AAL2 pendiente de verificación TOTP.');
                                return;
                            }
                            // Si ya estaba plenamente autenticado (reautenticación interna), mantener identidad
                            Logger.info('AuthModule', 'Reautenticación de usuario activo con factor MFA registrado.');
                        }
                    } catch (aalErr) {
                        Logger.error('AuthModule', 'Fallo evaluando AAL (Fail-Closed):', aalErr.message);
                        if (!currentSession.isAuthenticated || currentSession.user?.uid !== user.id) {
                            sessionState.set({
                                isAuthenticated: false,
                                mfaPending: true,
                                isAAL2Verified: false,
                                user: null,
                                currentRole: 'guest'
                            });
                            return;
                        }
                    }

                    const isAAL2 = aal?.currentLevel === 'aal2';
                    sessionState.set({
                        isAuthenticated: true,
                        mfaPending: false,
                        isAAL2Verified: isAAL2,
                        user: {
                            uid: user.id,
                            email: user.email,
                            displayName: user.user_metadata?.displayName || user.email.split('@')[0],
                            role
                        },
                        currentRole: role
                    });
                    Logger.info('AuthModule', `Sesión sincronizada [${_event || 'SYNC'}]: ${user.email}`);
                } else {
                    const currentSession = sessionState.get();
                    if (currentSession.isAuthenticated) {
                        sessionState.set({
                            isAuthenticated: false,
                            isAAL2Verified: false,
                            user: null,
                            currentRole: 'guest'
                        });
                        Logger.info('AuthModule', 'Sesión cerrada o invalidada en Supabase.');
                    }
                }
            });
        } catch (err) {
            Logger.warn('AuthModule', 'No se pudo adjuntar listener de Supabase Auth:', err);
        }
    },

    /**
     * Configura la escucha de eventos globales.
     */
    setupListeners() {
        eventBus.on(AUTH_EVENTS.LOGIN_START, async (credentials) => {
            await this.handleLogin(credentials);
        });

        // Desacoplamiento: AuthLayout emite 'auth-layout:mounted' y auth inyecta SessionDashboard
        eventBus.on('auth-layout:mounted', async () => {
            const { $id, $mount } = await import('@/shared/utils/dom.js');
            const { default: SessionDashboard } = await import('./components/SessionDashboard.js');
            const slot = $id('auth-session-dashboard-slot');
            if (slot) {
                $mount(slot, SessionDashboard.render());
                if (typeof SessionDashboard.init === 'function') SessionDashboard.init();
            }
        });

        eventBus.on('auth:toggle-session-dashboard', async () => {
            const { default: SessionDashboard } = await import('./components/SessionDashboard.js');
            SessionDashboard.toggle();
        });
    },

    /**
     * Ciclo de vida del Login (Fase 1 y 2).
     */
    async handleLogin({ email, password }) {
        try {
            Logger.info('AuthModule', `Iniciando Phase 1: Identity para ${email}`);
            const result = await AuthService.login(email, password);

            if (result.success) {
                // Phase 2: Device Authorization
                const fingerprint = await DeviceFingerprint.generate();
                Logger.info('AuthModule', `Fingerprint generado: ${fingerprint}`);

                eventBus.emit(AUTH_EVENTS.DEVICE_CHALLENGE, { fingerprint });
            } else if (result.mfaRequired) {
                Logger.info('AuthModule', 'Desafío MFA requerido para completar el inicio de sesión.');
            } else {
                Logger.error('AuthModule', 'Login fallido:', result.error);
            }
        } catch (error) {
            Logger.error('AuthModule', 'Error en login:', error);
        }
    }
};

export default AuthModule;
