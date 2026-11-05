/**
 * FinanceRepository - Repositorio de Persistencia Financiera BUSA-I
 * =========================================================================
 * Maneja el almacenamiento de tasas cambiarias personalizadas y preferencias de divisas en Firestore.
 */
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initFirebase } from '@/core/config/firebase.js';

const getDb = () => {
    const { db } = initFirebase();
    if (!db) throw new Error('[FinanceRepository] Firestore DB no inicializada.');
    return db;
};

export const FinanceRepository = {
    /**
     * Guarda la tasa operativa personalizada en Firestore.
     * @param {string} tenantId 
     * @param {number} rate 
     * @param {string} currency 
     */
    async saveCustomRate(tenantId = 'default', rate, currency = 'USD') {
        try {
            const db = getDb();
            const ref = doc(db, 'finance_rates', tenantId);
            const data = {
                rate,
                currency,
                updatedAt: new Date().toISOString(),
                tenantId
            };
            await setDoc(ref, data, { merge: true });
            return data;
        } catch (err) {
            console.error('[FinanceRepository] Error saving custom rate:', err);
            throw err;
        }
    },

    /**
     * Obtiene las preferencias de tasa cambiaria del tenant.
     * @param {string} tenantId 
     */
    async getTenantRate(tenantId = 'default') {
        try {
            const db = getDb();
            const ref = doc(db, 'finance_rates', tenantId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                return snap.data();
            }
            return null;
        } catch (err) {
            console.warn('[FinanceRepository] Warning getting tenant rate:', err.message);
            return null;
        }
    }
};

export default FinanceRepository;
