/**
 * FirebaseProvider (Legacy Shim -> SupabaseProvider)
 * =========================================================================
 * Redirige llamadas residuales hacia SupabaseProvider.
 * =========================================================================
 */
import { SupabaseProvider } from './SupabaseProvider.js';

export const FirebaseProvider = {
    login: (email, password) => SupabaseProvider.login(email, password),
    register: (email, password, name) => SupabaseProvider.register(email, password, name),
    recoverPassword: (email) => SupabaseProvider.recoverPassword(email),
    logout: () => SupabaseProvider.logout(),
    onAuthStateChanged: (callback) => {
        return SupabaseProvider.onAuthStateChange((_event, session) => {
            const user = session ? session.user : null;
            callback(user);
        });
    }
};

export default FirebaseProvider;
