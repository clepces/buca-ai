/**
 * Módulo Auth - Orquestador de Identidad
 * =========================================================================
 * Punto de entrada del módulo. Coordina las fases de login y autorización
 * integrándose con el Kernel y el EventBus.
 * =========================================================================
 */
import { AUTH_EVENTS } from './constants/auth.constants.js';
import { eventBus } from '@/core/eventBus/index.js';
import DeviceFingerprint from '@/core/security/DeviceFingerprint.js';
import { authRoutes } from './routes.js';
import { AuthService } from './services/AuthService.js';
import { FirebaseProvider } from './services/FirebaseProvider.js';
import { sessionState } from '@/core/state/session.js';
import { router } from '@/core/router/router.js';

export const AuthModule = {
    /**
     * Inicializa los listeners del módulo.
     */
    async init() {
        console.log('[Auth] -> Módulo inicializado');
        if (router && typeof router.addRoutes === 'function') {
            router.addRoutes(authRoutes);
        }
        this.setupListeners();

        // Escuchar cambios de autenticación nativos de Firebase Auth
        try {
            FirebaseProvider.onAuthStateChanged((user) => {
                if (user) {
                    const meta = AuthService.getDemoMeta(user.email);
                    sessionState.set({
                        isAuthenticated: true,
                        user: {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || meta.displayName || user.email.split('@')[0],
                            role: meta.role || 'owner'
                        },
                        currentRole: meta.role || 'owner'
                    });
                    console.log('[AuthModule] -> Sesión sincronizada con Firebase Auth:', user.email);
                }
            });
        } catch (err) {
            console.warn('[AuthModule] -> No se pudo adjuntar listener de Firebase Auth:', err);
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
                
                // Emitir evento para que el Kernel o UI reaccionen
                eventBus.emit(AUTH_EVENTS.DEVICE_CHALLENGE, { fingerprint });
            } else {
                console.error('[Auth] -> Login fallido:', result.error);
            }
        } catch (error) {
            console.error('[Auth] -> Error en login:', error);
        }
    }
};

export default AuthModule;
