import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { ENV } from './environment.js';
import { CONFIG } from './config.js';
import firebaseConfig from '../../../firebase-applet-config.json';

/**
 * Firebase Module - BUCA Modular
 * =========================================================================
 * Maneja la inicialización de Firebase siguiendo el patrón de arquitectura centralizada.
 */

let app;
let auth;
let db;
let functions;

import { doc, getDocFromServer } from 'firebase/firestore';
import { uiState } from '@/core/state/ui.js';

export const initFirebase = () => {
    if (!db) {
        try {
            if (!app) {
                app = initializeApp(firebaseConfig);
            }
            if (!auth) {
                auth = getAuth(app);
            }
            const dbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
                ? firebaseConfig.firestoreDatabaseId
                : undefined;
            db = dbId ? getFirestore(app, dbId) : getFirestore(app);
        } catch (e) {
            console.error('[Firebase] Emergency sync init db error:', e);
            db = getFirestore(app);
        }
    }

    if (!app) {
        console.log('[Firebase] Initializing Modular Services...');
        uiState.set({ isConnecting: true });

        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            
            const dbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)')
                ? firebaseConfig.firestoreDatabaseId
                : undefined;

            console.log(`[Firebase] Target Database ID: ${dbId || '(default)'}`);

            try {
                db = dbId ? getFirestore(app, dbId) : getFirestore(app);
                console.log(`[Firebase] Firestore initialized on DB: ${dbId || '(default)'}`);
            } catch (fsErr) {
                console.error('[Firebase] Critical Firestore init failure:', fsErr);
                uiState.set({ isConnecting: false, isOnline: false });
            }

            // [CRITICAL] Validate Connection to Firestore
            const testConnection = async () => {
                try {
                    console.log('[Firebase] Testing connection to Firestore...');
                    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
                    console.log('[Firebase] Connection established successfully.');
                    uiState.set({ isConnecting: false, isOnline: true });
                } catch (error) {
                    uiState.set({ isConnecting: false });
                    
                    if (error.code === 'unavailable') {
                        console.error('[Firebase] CRITICAL: Firestore backend is unavailable.');
                        uiState.set({ isOnline: false });
                        
                        if (dbId) {
                            console.warn('[Firebase] Retrying with default database as fallback...');
                            try {
                                db = getFirestore(app);
                                await getDocFromServer(doc(db, '_internal_', 'connection_test'));
                                console.log('[Firebase] Success with default database.');
                                uiState.set({ isOnline: true });
                            } catch (e2) {
                                console.error('[Firebase] Fallback failed:', e2.message);
                            }
                        }
                    } else if (error.code === 'permission-denied') {
                        console.log('[Firebase] Connection test: Network is reachable.');
                        uiState.set({ isOnline: true });
                    } else {
                        console.warn('[Firebase] Connection test status:', error.code || error.message);
                        uiState.set({ isOnline: navigator.onLine });
                    }
                }
            };
            testConnection();

            try {
                functions = getFunctions(app);
            } catch (fnErr) {
                console.warn('[Firebase] Functions init warning:', fnErr);
            }

            // [GUARDIÁN DE ENTORNO Y PRESUPUESTO]
            const isProduction = CONFIG?.ENV?.IS_PRODUCTION || CONFIG?.ENV?.MODE === 'production';
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            
            const shouldConnectEmulator = !isProduction && isLocalhost && (CONFIG?.ENV?.USE_EMULATOR || ENV.USE_EMULATOR);

            if (shouldConnectEmulator) {
                console.warn('%c 🛡️ BUCA SECURITY: MODO EMULADOR ACTIVO ', 'background: #2563eb; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
                
                const authHost = 'http://localhost:9099';
                const dbHost = 'localhost';
                const dbPort = 8080;
                const fnPort = 5001;

                try {
                    if (auth) connectAuthEmulator(auth, authHost, { disableWarnings: true });
                    if (db) connectFirestoreEmulator(db, dbHost, dbPort);
                    if (functions) connectFunctionsEmulator(functions, dbHost, fnPort);
                    console.log(`[Firebase] Emulators connected: Auth(${authHost}), Firestore(${dbHost}:${dbPort})`);
                } catch (emuErr) {
                    console.warn('[Firebase] Emulator connection warning:', emuErr);
                }
            }
        } catch (error) {
            console.error('[Firebase] Critical Initialization Error:', error);
            uiState.set({ isConnecting: false, isOnline: navigator.onLine });
        }
    }
    return { app, auth, db, functions };
};

export default initFirebase;
