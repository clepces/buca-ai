/**
 * AuthService - Comunicador con Firebase Auth
 * =========================================================================
 * Orquestador de la lógica de autenticación del módulo Auth.
 * =========================================================================
 */
import FirebaseProvider from './FirebaseProvider.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';
import { CONFIG } from '@/core/config/config.js';
import { initFirebase } from '@/core/config/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const DEMO_ROLES = {
    'admin@buca.com.ve': { role: 'super_admin', displayName: 'Super Admin Buca', id: 'nhWRyJPvuMUtiOYpCDAa7BwkNOx1' },
    'asicodia@gmail.com': { role: 'admin', displayName: 'Soporte Admin', id: 'QmojtAorrSORnIR652B2OQrLFnV2' },
    'elexdy.publice@gmail.com': { role: 'owner', displayName: 'Owner Elexdy', id: 'rztfsvfopefrflIa6natw4tHFMh2' }
};

export const AuthService = {
    /**
     * Devuelve la metadata de roles para usuarios demo.
     * @param {string} email 
     * @returns {Object}
     */
    getDemoMeta(email) {
        return DEMO_ROLES[email] || {};
    },

    /**
     * Intenta iniciar sesión y emite eventos según el resultado.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Resultado de la operación
     */
    async login(email, password) {
        console.log(`[AuthService] -> Intentando login para ${email}`);

        try {
            const userCredential = await FirebaseProvider.login(email, password);
            const user = userCredential.user;
            
            // Intentar cargar perfil desde Firestore
            let profileData = {};
            try {
                const { db } = initFirebase();
                if (db) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        profileData = userDoc.data().profile || {};
                    }
                }
            } catch (err) {
                console.warn('[AuthService] Could not fetch firestore profile:', err.message);
            }

            const meta = DEMO_ROLES[user.email] || {};
            const role = profileData.platform_role || meta.role || 'user';
            
            sessionState.set({
                isAuthenticated: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: profileData.firstName ? `${profileData.firstName} ${profileData.lastName || ''}`.trim() : (user.displayName || meta.displayName || user.email.split('@')[0]),
                    role: role
                },
                currentRole: role
            });
            eventBus.emit('auth:login-success', { user });
            return { success: true, user };
        } catch (error) {
            console.error('[AuthService] Fallo en autenticación:', error.message);
            
            if (error.code === 'auth/invalid-credential') {
                console.warn('[AuthService] Credenciales inválidas. Verifique el email o contraseña.');
            }

            // Fallback para pruebas solo si está permitido y no estamos en producción
            const isProd = CONFIG?.ENV?.IS_PRODUCTION || CONFIG?.ENV?.MODE === 'production';
            const allowDemoFallback = !isProd && Boolean(CONFIG?.ENV?.SHOW_DEMO_ACCOUNTS);

            const isKnownDemo = DEMO_ROLES[email] && (
                (email === 'admin@buca.com.ve' && password === 'admin123') ||
                (email === 'asicodia@gmail.com' && password === 'soporte123') ||
                (email === 'elexdy.publice@gmail.com' && password === 'owner123') ||
                password === '123456' || password === 'Password123!'
            );

            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const isDevPreview = isLocal || window.location.hostname.includes('run.app') || window.location.hostname.includes('ai.studio');
            if (allowDemoFallback && isDevPreview && isKnownDemo) {
                console.info('[AuthService] Modo de pruebas activo: Aplicando acceso de demostración.');
                const meta = DEMO_ROLES[email] || {};
                const mockUser = {
                    uid: meta.id || 'dev-user-001',
                    email,
                    displayName: meta.displayName || email.split('@')[0],
                    role: meta.role || 'user'
                };
                sessionState.set({ isAuthenticated: true, user: mockUser, currentRole: mockUser.role });
                eventBus.emit('auth:login-success', { user: mockUser });
                return { success: true, user: mockUser };
            }
            eventBus.emit('auth:login-failed', { error });
            return { success: false, error: error.code || error.message };
        }
    },

    /**
     * Registra un nuevo usuario en la plataforma.
     */
    async register(email, password, name) {
        try {
            const userCredential = await FirebaseProvider.register(email, password, name);
            const user = userCredential.user;
            
            // Crear perfil inicial en Firestore
            try {
                const { db } = initFirebase();
                if (db) {
                    await setDoc(doc(db, 'users', user.uid), {
                        uid: user.uid,
                        profile: {
                            firstName: name.split(' ')[0] || '',
                            lastName: name.split(' ').slice(1).join(' ') || '',
                            mail: email,
                            platform_role: 'user',
                            active_mode: 'light',
                            created_at: serverTimestamp()
                        }
                    });
                }
            } catch (err) {
                console.warn('[AuthService] Error creating user profile in Firestore:', err.message);
            }

            sessionState.set({ isAuthenticated: true, user: { uid: user.uid, email: user.email, displayName: name, role: 'user' }, currentRole: 'user' });
            eventBus.emit('auth:register-success', { user });
            return { success: true, user };
        } catch (error) {
            console.error('[AuthService] Fallo en registro:', error.message);
            eventBus.emit('auth:register-failed', { error });
            return { success: false, error: error.code };
        }
    },

    /**
     * Envía enlace de recuperación.
     */
    async recoverPassword(email) {
        try {
            await FirebaseProvider.recoverPassword(email);
            return { success: true };
        } catch (error) {
            console.error('[AuthService] Fallo en recuperación:', error.message);
            return { success: false, error: error.code };
        }
    },

    /**
     * Cierra la sesión y notifica al sistema.
     */
    async logout() {
        try {
            await FirebaseProvider.logout().catch(() => {});
            sessionState.clear();
            try {
                localStorage.clear();
                sessionStorage.clear();
            } catch {
                // Silencioso: ignorar fallos de acceso al storage en iframes restringidos
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

};

export default AuthService;
