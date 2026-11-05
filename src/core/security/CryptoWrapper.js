/**
 * CryptoWrapper - Capa de Seguridad para el Cliente (L0/L1)
 * =========================================================================
 * Ofusca y cifra datos sensibles en el LocalStorage/IndexedDB para 
 * evitar lectura directa de sesiones, tokens o configuraciones.
 * IMPORTANTE: La seguridad real radica en el backend (Firestore Rules). 
 * Esto protege contra inspección casual o XSS de bajo nivel.
 */

const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY || 'buca_fallback_key_2026';

export const CryptoWrapper = {
    /**
     * Cifra/Ofusca un texto utilizando un cifrado XOR rápido y Base64.
     * @param {string} text 
     * @returns {string}
     */
    encrypt(text) {
        if (!text) return text;
        try {
            // 1. XOR Cipher ligero
            let xorStr = '';
            for (let i = 0; i < text.length; i++) {
                xorStr += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
            }
            // 2. Base64
            // Nota: Para caracteres Unicode, unescape/encodeURIComponent es más seguro, 
            // pero mantenemos esto ligero para rendimiento.
            return btoa(unescape(encodeURIComponent(xorStr)));
        } catch (e) {
            console.error('[CryptoWrapper] Error al cifrar:', e);
            return text; // Fallback al texto plano si falla
        }
    },

    /**
     * Descifra un texto ofuscado previamente con encrypt().
     * @param {string} encodedText 
     * @returns {string}
     */
    decrypt(encodedText) {
        if (!encodedText) return encodedText;
        try {
            // 1. Base64 inverso
            const xorStr = decodeURIComponent(escape(atob(encodedText)));
            // 2. XOR inverso
            let text = '';
            for (let i = 0; i < xorStr.length; i++) {
                text += String.fromCharCode(xorStr.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
            }
            return text;
        } catch (e) {
            // Si falla, asumimos que era texto plano. No mostramos el error completo para evitar ensuciar la consola.
            console.debug('[CryptoWrapper] Se leyó texto plano (no cifrado).');
            return encodedText; 
        }
    }
};

export default CryptoWrapper;
