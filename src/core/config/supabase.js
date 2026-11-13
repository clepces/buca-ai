/**
 * Supabase Client Configuration - B.U.C.A. AI
 * =========================================================================
 * Instancia oficial del SDK de Supabase con persistencia de sesión nativa.
 * =========================================================================
 */
import { createClient } from '@supabase/supabase-js';
import { ENV } from './environment.js';
import { uiState } from '../state/ui.js';

let clientInstance = null;
let mockClient = null;

/**
 * Permite inyectar un cliente mock para aislamiento de pruebas (Zero Remote Calls).
 */
export const setMockSupabase = (mock) => {
    mockClient = mock;
};

export const resetSupabase = () => {
    clientInstance = null;
    mockClient = null;
};

export const getSupabase = () => {
    if (mockClient) return mockClient;
    if (clientInstance) return clientInstance;

    const url = ENV.SUPABASE.URL;
    const anonKey = ENV.SUPABASE.ANON_KEY;

    // Si no hay credenciales (p.ej. entorno de pruebas unitarias sin mock activo), no invocar createClient
    if (!url || !anonKey) {
        return null;
    }

    clientInstance = createClient(url, anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'buca_supabase_auth'
        }
    });

    return clientInstance;
};

export const initSupabase = async () => {
    const client = getSupabase();
    if (!client) {
        uiState.set({ isConnecting: false, isOnline: false });
        return { client: null, session: null };
    }
    try {
        uiState.set({ isConnecting: true });
        // Verificación ligera contra auth session
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        uiState.set({ isConnecting: false, isOnline: true });
        return { client, session: data.session };
    } catch (err) {
        uiState.set({ isConnecting: false, isOnline: false });
        console.warn('[Supabase] Health check warning:', err.message || err);
        return { client, session: null };
    }
};

export const supabase = {
    get from() { return (...args) => (getSupabase() || {}).from?.(...args); },
    get auth() { return (getSupabase() || {}).auth; },
    get rpc() { return (...args) => (getSupabase() || {}).rpc?.(...args); },
    get storage() { return (getSupabase() || {}).storage; }
};
export default supabase;
