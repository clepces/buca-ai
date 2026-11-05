/**
 * LocalDriver - Motor de Almacenamiento Local (LocalStorage)
 * =========================================================================
 * Ideal para configuraciones L0 y datos pequeños que no requieren 
 * persistencia estructurada.
 * =========================================================================
 */
import { CryptoWrapper } from '@/core/security/CryptoWrapper.js';

export class LocalDriver {
    constructor(prefix = 'buca') {
        this.prefix = prefix;
    }

    /**
     * @param {string} key 
     * @param {any} value 
     */
    async set(key, value) {
        const fullKey = `${this.prefix}_${key}`;
        const stringValue = JSON.stringify(value);
        const encryptedValue = CryptoWrapper.encrypt(stringValue);
        localStorage.setItem(fullKey, encryptedValue);
    }

    /**
     * @param {string} key 
     */
    async get(key) {
        const fullKey = `${this.prefix}_${key}`;
        const encryptedData = localStorage.getItem(fullKey);
        if (!encryptedData) return null;
        
        try {
            const decryptedData = CryptoWrapper.decrypt(encryptedData);
            return JSON.parse(decryptedData);
        } catch (e) {
            console.warn(`[LocalDriver] Failed to parse decrypted data for key: ${key}`);
            return null;
        }
    }

    /**
     * @param {string} key 
     */
    async remove(key) {
        localStorage.removeItem(`${this.prefix}_${key}`);
    }

    async clear() {
        // Solo limpia las llaves que empiecen con nuestro prefijo
        Object.keys(localStorage)
            .filter(k => k.startsWith(this.prefix))
            .forEach(k => localStorage.removeItem(k));
    }
}

export default LocalDriver;
