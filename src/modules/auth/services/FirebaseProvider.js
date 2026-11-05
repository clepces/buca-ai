/**
 * FirebaseProvider - Adaptador de Firebase Auth
 * =========================================================================
 * Punto de conexión con el SDK de Firebase v9+.
 * =========================================================================
 */
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut, 
    sendPasswordResetEmail,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { initFirebase } from '@/core/config/firebase.js';

// Wrapper para métodos de Firebase que dependen de auth
const ensureAuth = () => {
    const { auth } = initFirebase();
    if (!auth) throw new Error('Firebase Auth no inicializado.');
    return auth;
};

export const FirebaseProvider = {
    /**
     * Autentica al usuario mediante email/password.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<UserCredential>}
     */
    async login(email, password) {
        console.log('[FirebaseProvider] -> Ejecutando login en Firebase...');
        try {
            return await signInWithEmailAndPassword(ensureAuth(), email, password);
        } catch (error) {
            console.error('[FirebaseProvider] Login Error:', error.code);
            throw error;
        }
    },

    /**
     * Registra un nuevo usuario.
     * @param {string} email 
     * @param {string} password 
     * @param {string} name 
     */
    async register(email, password, name) {
        console.log('[FirebaseProvider] -> Ejecutando registro en Firebase...');
        try {
            const userCredential = await createUserWithEmailAndPassword(ensureAuth(), email, password);
            if (name) {
                await updateProfile(userCredential.user, { displayName: name });
            }
            return userCredential;
        } catch (error) {
            console.error('[FirebaseProvider] Register Error:', error.code);
            throw error;
        }
    },

    /**
     * Envia enlace de recuperación de contraseña.
     * @param {string} email
     */
    async recoverPassword(email) {
        console.log('[FirebaseProvider] -> Ejecutando recuperación en Firebase...');
        try {
            await sendPasswordResetEmail(ensureAuth(), email);
            return true;
        } catch (error) {
            console.error('[FirebaseProvider] Recovery Error:', error.code);
            throw error;
        }
    },

    /**
     * Cierra la sesión activa.
     * @returns {Promise<void>}
     */
    async logout() {
        return await signOut(ensureAuth());
    },



    /**
     * Escucha cambios en el estado de autenticación.
     * @param {Function} callback 
     */
    onAuthStateChanged(callback) {
        return onAuthStateChanged(ensureAuth(), callback);
    }
};

export default FirebaseProvider;
