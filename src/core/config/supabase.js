/**
 * Supabase Client Configuration - B.U.C.A. AI
 * =========================================================================
 * Instancia oficial del SDK de Supabase con persistencia de sesión nativa.
 * =========================================================================
 */
import { createClient } from '@supabase/supabase-js';
import { ENV } from './environment.js';
import { uiState } from '../state/ui.js';
import { Logger } from '@/shared/utils/logger.js';

let clientInstance = null;
let mockClient = null;
let recoveryObserverSubscription = null;

// Evidencia en memoria del evento PASSWORD_RECOVERY emitido por el SDK.
// Protege el flujo/UI cliente; la autorización real de datos y cambio de contraseña reside en el servidor (Supabase Auth / RLS).
let recoverySessionProof = null;

const decodeJwtClaimFields = (token) => {
    if (typeof token !== 'string') return {};
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return {};
    try {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
        const json = typeof atob === 'function'
            ? atob(padded)
            : globalThis.Buffer?.from(padded, 'base64').toString('utf8');
        const parsed = JSON.parse(json);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const detachRecoveryObserver = () => {
    if (recoveryObserverSubscription && typeof recoveryObserverSubscription.unsubscribe === 'function') {
        try {
            recoveryObserverSubscription.unsubscribe();
        } catch { /* ignore */ }
    }
    recoveryObserverSubscription = null;
};

const installRecoveryObserver = (client) => {
    detachRecoveryObserver();
    if (!client?.auth || typeof client.auth.onAuthStateChange !== 'function') return;

    const res = client.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session?.user?.id) {
            const tokenClaims = decodeJwtClaimFields(session.access_token);
            const sessionId = session.session_id || tokenClaims.session_id || null;
            if (!sessionId) {
                recoverySessionProof = null;
                return;
            }
            recoverySessionProof = {
                userId: session.user.id,
                sessionId,
                expiresAt: session.expires_at ?? tokenClaims.exp ?? null
            };
            return;
        }

        if (event === 'SIGNED_OUT' || !session?.user?.id) {
            recoverySessionProof = null;
            return;
        }

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED' || event === 'MFA_CHALLENGE_VERIFIED') {
            if (!recoverySessionProof) return;
            const tokenClaims = decodeJwtClaimFields(session.access_token);
            const incomingSessionId = session.session_id || tokenClaims.session_id || null;
            const sameUser = session.user.id === recoverySessionProof.userId;
            const sameSessionId = Boolean(
                recoverySessionProof.sessionId &&
                incomingSessionId &&
                incomingSessionId === recoverySessionProof.sessionId
            );

            if (event === 'USER_UPDATED' || !sameUser || !sameSessionId) {
                recoverySessionProof = null;
                return;
            }

            recoverySessionProof = {
                ...recoverySessionProof,
                expiresAt: session.expires_at ?? tokenClaims.exp ?? recoverySessionProof.expiresAt
            };
        }
    });

    recoveryObserverSubscription = res?.data?.subscription || res?.subscription || null;
};

export const getRecoverySessionProof = () => {
    if (!recoverySessionProof) return null;
    if (typeof recoverySessionProof.expiresAt === 'number' && (Date.now() / 1000) >= recoverySessionProof.expiresAt) {
        recoverySessionProof = null;
        return null;
    }
    return { ...recoverySessionProof };
};

export const clearRecoverySessionProof = () => {
    recoverySessionProof = null;
};

/**
 * Permite inyectar un cliente mock para aislamiento de pruebas (Zero Remote Calls).
 */
export const setMockSupabase = (mock) => {
    recoverySessionProof = null;
    mockClient = mock;
    if (mock) {
        installRecoveryObserver(mock);
    } else {
        detachRecoveryObserver();
    }
};

export const resetSupabase = () => {
    detachRecoveryObserver();
    recoverySessionProof = null;
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
    // Instalar observador sincrónicamente antes de ceder el event loop para no perder PASSWORD_RECOVERY
    installRecoveryObserver(clientInstance);

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
        Logger.warn({ layer: 'SERVICE', role: 'ADAPTER', target: 'Supabase', message: 'Advertencia en verificación inicial de sesión Supabase.', data: err?.message || err });
        return { client, session: null };
    }
};

const safeAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: {}, error: new Error('Supabase no inicializado') }),
    signUp: async () => ({ data: {}, error: new Error('Supabase no inicializado') }),
    signOut: async () => ({ error: null })
};

const createSafeQueryBuilder = () => {
    let isSingle = false;
    const handler = {
        get(target, prop) {
            if (prop === 'then') {
                return (resolve) => resolve({ data: isSingle ? null : [], error: null, count: 0 });
            }
            if (prop === 'single' || prop === 'maybeSingle') {
                isSingle = true;
                return () => new Proxy({}, handler);
            }
            if (typeof prop === 'symbol') return undefined;
            return () => new Proxy({}, handler);
        }
    };
    return new Proxy({}, handler);
};

export const supabase = {
    get from() {
        const c = getSupabase();
        return c ? c.from.bind(c) : () => createSafeQueryBuilder();
    },
    get auth() {
        const c = getSupabase();
        return (c && c.auth) ? c.auth : safeAuth;
    },
    get rpc() {
        const c = getSupabase();
        return c ? c.rpc.bind(c) : async () => ({ data: null, error: null });
    },
    get storage() {
        const c = getSupabase();
        return (c && c.storage) ? c.storage : null;
    }
};
export default supabase;
