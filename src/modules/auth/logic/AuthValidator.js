import { Validators } from '@/shared/utils/validators.js';

export const AuthValidator = {
    /**
     * Valida si una contraseña cumple con los estándares corporativos.
     * @param {string} password 
     * @returns {boolean}
     */
    isValidPassword(password) {
        return Validators.isStrongPassword(password);
    },

    /**
     * Procesa la huella digital del dispositivo y determina si requiere reto.
     * @param {string} fingerprint 
     * @param {string} registeredFingerprint 
     * @returns {boolean} True si requiere verificación adicional.
     */
    requiresDeviceChallenge(fingerprint, registeredFingerprint) {
        if (!registeredFingerprint) return true;
        return fingerprint !== registeredFingerprint;
    },

    /**
     * Valida el PIN de reto (6 dígitos).
     * @param {string} pin 
     * @returns {boolean}
     */
    isValidChallengePin(pin) {
        return Validators.isValidChallengePin(pin);
    }
};

export default AuthValidator;
