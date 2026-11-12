/**
 * CryptoWrapper - Capa de Seguridad e Integridad para el Cliente
 * =========================================================================
 * Proporciona codificación segura e integridad de datos en memoria/cliente.
 * Eliminado el cifrado XOR simétrico con clave fija por directiva de seguridad.
 * =========================================================================
 */

export const CryptoWrapper = {
    /**
     * Codifica un texto en Base64 seguro para almacenamiento local de parámetros.
     * @param {string} text 
     * @returns {string}
     */
    encrypt(text) {
        if (!text) return text;
        try {
            return btoa(unescape(encodeURIComponent(String(text))));
        } catch {
            return text;
        }
    },

    /**
     * Decodifica un texto previamente codificado en Base64.
     * @param {string} encodedText 
     * @returns {string}
     */
    decrypt(encodedText) {
        if (!encodedText) return encodedText;
        try {
            return decodeURIComponent(escape(atob(String(encodedText))));
        } catch {
            return encodedText;
        }
    },

    /**
     * Genera un hash criptográfico SHA-256 seguro usando Web Crypto API.
     * @param {string} message 
     * @returns {Promise<string>}
     */
    async sha256(message) {
        if (!globalThis.crypto?.subtle) return message;
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};

export default CryptoWrapper;
