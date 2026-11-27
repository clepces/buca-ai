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
import { getSupabase, getRecoverySessionProof } from '@/core/config/supabase.js';
import ModalService from '@/shared/ui/services/ModalService.js';
import { Logger } from '@/shared/utils/logger.js';

export const AuthModule = {
    _authSubscription: null,

    /**
     * Inicializa los listeners del módulo.
     */
    async init() {
        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Módulo de autenticación inicializado (Supabase).' });
        if (router && typeof router.addRoutes === 'function') {
            router.addRoutes(authRoutes);
        }
        this.setupListeners();

        // Escuchar cambios de autenticación nativos de Supabase (sin duplicar suscripciones)
        try {
            if (this._authSubscription && typeof this._authSubscription.unsubscribe === 'function') {
                this._authSubscription.unsubscribe();
                this._authSubscription = null;
            }
            this._authSubscription = SupabaseProvider.onAuthStateChange(async (_event, session) => {
                const proof = getRecoverySessionProof();
                const isEarlyRecoveryMatch = Boolean(
                    proof &&
                    proof.sessionId &&
                    session?.user?.id &&
                    proof.userId === session.user.id &&
                    (!session.session_id || session.session_id === proof.sessionId)
                );

                if (
                    _event === 'PASSWORD_RECOVERY' ||
                    (isEarlyRecoveryMatch && (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED' || _event === 'MFA_CHALLENGE_VERIFIED'))
                ) {
                    Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Evento PASSWORD_RECOVERY detectado; aislando sesión de recuperación.' });
                    try {
                        if (typeof sessionStorage !== 'undefined') {
                            sessionStorage.setItem('buca_recovery_flow', 'true');
                        }
                    } catch { /* ignore */ }
                    sessionState.set({
                        isAuthenticated: false,
                        mfaPending: false,
                        isAAL2Verified: false,
                        isPasswordRecovery: true,
                        user: null,
                        currentRole: 'guest'
                    });
                    eventBus.emit('auth:password-recovery', { session });
                    return;
                }

                const isRecoveryFlow = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('buca_recovery_flow') === 'true')
                    || Boolean(sessionState.get().isPasswordRecovery);

                // Procesar SIGNED_OUT o sesión nula antes del aislamiento para garantizar limpieza completa
                if (!session || !session.user || _event === 'SIGNED_OUT') {
                    const currentSession = sessionState.get();
                    if (currentSession.isAuthenticated || currentSession.isPasswordRecovery || isRecoveryFlow) {
                        sessionState.set({
                            isAuthenticated: false,
                            mfaPending: false,
                            isAAL2Verified: false,
                            isPasswordRecovery: false,
                            user: null,
                            currentRole: 'guest'
                        });
                        try {
                            if (typeof sessionStorage !== 'undefined') {
                                sessionStorage.removeItem('buca_recovery_flow');
                            }
                        } catch { /* ignore */ }
                        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Sesión cerrada o invalidada en Supabase.' });
                    }
                    return;
                }

                // Aislar eventos regulares si el flujo de recuperación está activo en la pestaña
                if (isRecoveryFlow) {
                    Logger.debug({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: `Evento [${_event}] aislado mientras la recuperación esté activa.` });
                    return;
                }

                if (session && session.user) {
                    const user = session.user;
                    const currentSession = sessionState.get();

                    // Prevenir sobrecarga de peticiones: Si el usuario ya está plenamente autenticado y con AAL2 verificado
                    if (currentSession.isAuthenticated && currentSession.user?.uid === user.id && currentSession.isAAL2Verified) {
                        Logger.debug({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: `Sincronización silenciosa [${_event}]: sesión activa para ${user.email}.` });
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
                                Logger.warn({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Sesión retenida: AAL2 pendiente de verificación TOTP.' });
                                return;
                            }
                            // Si ya estaba plenamente autenticado (reautenticación interna), mantener identidad
                            Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Reautenticación de usuario activo con factor MFA verificado.' });
                        }
                    } catch (aalErr) {
                        Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Fallo evaluando nivel AAL (Fail-Closed).', data: aalErr.message });
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
                    Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: `Sesión sincronizada [${_event || 'SYNC'}]: ${user.email}.` });
                }
            });
        } catch (err) {
            Logger.warn({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'No se pudo adjuntar listener de Supabase Auth.', data: err?.message || err });
        }
    },

    /**
     * Configura la escucha de eventos globales.
     */
    setupListeners() {
        eventBus.on(AUTH_EVENTS.LOGIN_START, async (credentials) => {
            await this.handleLogin(credentials);
        });

        eventBus.on('auth:logout', async () => {
            ModalService.showModal({
                id: 'auth-logout-modal',
                scope: 'global',
                size: 'xs',
                closeOnBackdrop: false,
                closeOnEsc: false,
                closeOnRouteChange: false,
                lockShortcuts: true,
                header: {
                    left: {
                        icon: 'bi-box-arrow-right',
                        title: 'Cierre de Sesión',
                        subtitle: 'Desconectando de forma segura'
                    },
                    right: { showGlobalControls: { ai: false, help: false, resize: false, more: false } }
                },
                body: {
                    html: '<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div><p class="small text-muted mb-0">Desconectando de forma segura...</p></div>'
                }
            });
            try {
                await AuthService.logout();
            } catch (err) {
                Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Error ejecutando cierre de sesión.', data: err?.message || err });
                ModalService.hideModal();
            }
        });
    },

    /**
     * Ciclo de vida del Login (Fase 1 y 2).
     */
    async handleLogin({ email, password }) {
        try {
            Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: `Iniciando verificación de identidad para ${email}.` });
            const result = await AuthService.login(email, password);

            if (result.success) {
                // Phase 2: Device Authorization
                const fingerprint = await DeviceFingerprint.generate();
                Logger.debug({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Huella de dispositivo generada para desafío.', data: { fingerprint } });

                eventBus.emit(AUTH_EVENTS.DEVICE_CHALLENGE, { fingerprint });
            } else if (result.mfaRequired) {
                Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Desafío MFA requerido para completar el inicio de sesión.' });
            } else {
                Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Inicio de sesión rechazado.', data: result.error });
            }
        } catch (error) {
            Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'Auth', message: 'Error inesperado en flujo de inicio de sesión.', data: error?.message || error });
        }
    }
};

export default AuthModule;
