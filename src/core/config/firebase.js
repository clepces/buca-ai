import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, getDocFromServer } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { ENV } from './environment.js';
import { CONFIG } from './config.js';
import firebaseConfig from '../../../firebase-applet-config.json';
import { uiState } from '@/core/state/ui.js';

/**
 * Firebase Module - BUCA Modular
 * =========================================================================
 * Maneja la inicialización de Firebase con blindaje de emuladores para evitar
 * escrituras accidentales en la base de datos de producción.
 * =========================================================================
 */

export let app = null;
export let auth = null;
export let db = null;
export let functions = null;

let emulatorsConnected = false;
let connectionTested = false;

export const initFirebase = () => {
    if (app && auth && db) {
        return { app, auth, db, functions };
    }

    try {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);

        const dbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
            ? firebaseConfig.firestoreDatabaseId
            : undefined;

        db = dbId ? getFirestore(app, dbId) : getFirestore(app);

        try {
            functions = getFunctions(app);
        } catch (fnErr) {
            console.warn('[Firebase] Functions init warning:', fnErr);
        }

        // [BLINDAJE DE ENTORNO: FORZAR EMULADORES EN DESARROLLO/LOCALHOST]
        const isProduction = CONFIG?.ENV?.IS_PRODUCTION || CONFIG?.ENV?.MODE === 'production' || ENV.IS_PROD;
        const isLocalhost = typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.endsWith('.nip.io') ||
            /^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(window.location.hostname)
        );

        const shouldConnectEmulator = (!isProduction || isLocalhost || ENV.USE_EMULATOR) && !CONFIG?.ENV?.FORCE_PRODUCTION;

        if (shouldConnectEmulator && !emulatorsConnected) {
            const authHost = ENV.EMULATOR_HOSTS?.AUTH || 'http://127.0.0.1:9099';
            const dbHost = ENV.EMULATOR_HOSTS?.FIRESTORE || '127.0.0.1';
            const dbPort = ENV.EMULATOR_HOSTS?.FIRESTORE_PORT || 8080;
            const fnPort = ENV.EMULATOR_HOSTS?.FUNCTIONS_PORT || 5001;

            try {
                if (auth) connectAuthEmulator(auth, authHost, { disableWarnings: true });
                if (db) connectFirestoreEmulator(db, dbHost, dbPort);
                if (functions) connectFunctionsEmulator(functions, dbHost, fnPort);
                emulatorsConnected = true;
                console.warn(
                    '%c 🛡️ BUCA SECURITY: EMULADORES ACTIVOS Y FORZADOS (Producción Bloqueada) ',
                    'background: #2563eb; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;'
                );
            } catch (emuErr) {
                console.error('[Firebase] Error conectando a emuladores locales:', emuErr);
                if (isLocalhost || !isProduction) {
                    uiState.set({ isConnecting: false, isOnline: false });
                    throw new Error(
                        '[BUCA SECURITY] Falló la conexión a los emuladores locales. Se aborta la operación para proteger la base de datos de producción.',
                        { cause: emuErr }
                    );
                }
            }
        }

        // Prueba de conectividad segura contra el emulador local
        if (!connectionTested && db) {
            connectionTested = true;
            uiState.set({ isConnecting: true });
            getDocFromServer(doc(db, '_internal_', 'connection_test'))
                .then(() => {
                    uiState.set({ isConnecting: false, isOnline: true });
                })
                .catch((err) => {
                    uiState.set({ isConnecting: false });
                    if (err.code === 'permission-denied') {
                        uiState.set({ isOnline: true });
                    } else if (err.code === 'unavailable') {
                        uiState.set({ isOnline: false });
                        console.warn('[Firebase] Emulador Firestore no disponible:', err.message);
                    } else {
                        uiState.set({ isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true });
                    }
                });
        }
    } catch (error) {
        console.error('[Firebase] Critical Initialization Error:', error);
        uiState.set({ isConnecting: false, isOnline: false });
        throw error;
    }

    return { app, auth, db, functions };
};

export default initFirebase;
