/**
 * BUCA - Environment Wrapper
 * Handles VITE env variables and emulator detection.
 * Sigue la estructura modular de buca-app-modular.
 */

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// Extraemos la IP o Host actual del navegador.
const currentHost = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
const targetEmulatorHost = currentHost === 'localhost' ? '127.0.0.1' : currentHost;

const isLocalNetwork = currentHost === 'localhost' ||
    currentHost === '127.0.0.1' ||
    /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(currentHost) ||
    currentHost.endsWith('.nip.io');

export const ENV = {
    MODE: viteEnv.MODE || 'development',
    IS_DEV: viteEnv.DEV || (viteEnv.MODE === 'development'),
    IS_PROD: viteEnv.PROD || (viteEnv.MODE === 'production'),
    USE_EMULATOR: (viteEnv.VITE_USE_EMULATOR === 'true' || isLocalNetwork) && (viteEnv.MODE !== 'production'),

    FIREBASE: {
        apiKey: viteEnv.VITE_FIREBASE_API_KEY || 'AIzaSyB-MOCK-API-KEY',
        authDomain: viteEnv.VITE_FIREBASE_AUTH_DOMAIN || 'buca-scdbs.firebaseapp.com',
        projectId: viteEnv.VITE_FIREBASE_PROJECT_ID || 'buca-scdbs',
        storageBucket: viteEnv.VITE_FIREBASE_STORAGE_BUCKET || 'buca-scdbs.appspot.com',
        messagingSenderId: viteEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
        appId: viteEnv.VITE_FIREBASE_APP_ID || '1:000000000000:web:000000000000'
    },

    EMULATOR_HOSTS: {
        FIRESTORE: targetEmulatorHost,
        FIRESTORE_PORT: 8080,
        AUTH: `http://${targetEmulatorHost}:9099`,
        FUNCTIONS: `http://${targetEmulatorHost}`,
        FUNCTIONS_PORT: viteEnv.VITE_FUNCTIONS_PORT || 5001
    }
};

export default ENV;
