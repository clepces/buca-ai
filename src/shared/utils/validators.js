/**
 * Validators - Security & Data Integrity
 * 
 * Centralized logic for data validation across the system.
 */
export const Validators = {
    /**
     * Validates a Venezuelan RIF (Registro de Información Fiscal)
     * Format: J-12345678-9 or V123456789
     * @param {string} rif 
     * @returns {boolean}
     */
    isValidRIF(rif) {
        if (!rif) return false;

        // Normalize: Remove dashes, spaces and uppercase
        const cleanRif = rif.replace(/[-\s]/g, '').toUpperCase();

        // Pattern: [V,J,G,E,P] followed by 9 digits
        const rifRegex = /^[V|J|G|E|P]\d{9}$/;
        if (!rifRegex.test(cleanRif)) return false;

        // Check Digit Logic (Algoritmo del SENIAT)
        const typePrefix = cleanRif[0];
        const digits = cleanRif.substring(1, 9).split('').map(Number);
        const checkDigit = parseInt(cleanRif[9]);

        let typeValue = 0;
        switch (typePrefix) {
        case 'V': typeValue = 1; break;
        case 'E': typeValue = 1; break;
        case 'J': typeValue = 3; break;
        case 'P': typeValue = 4; break;
        case 'G': typeValue = 5; break;
        }

        const weights = [4, 3, 2, 7, 6, 5, 4, 3];
        let sum = typeValue * 8; // Constant for the prefix type

        for (let i = 0; i < digits.length; i++) {
            sum += digits[i] * weights[i];
        }

        const remainder = sum % 11;
        let calculatedCheck = 11 - remainder;

        if (calculatedCheck >= 10) calculatedCheck = 0;

        return calculatedCheck === checkDigit;
    },

    /**
     * Validates email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validates strong password (min 8 chars, 1 upper, 1 lower, 1 number)
     */
    isStrongPassword(password) {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password);
    },

    /**
     * Validates if a rate is a positive number
     */
    isValidRate(rate) {
        return typeof rate === 'number' && rate > 0;
    },

    /**
     * Validates if a string is not empty
     */
    isNotEmpty(str) {
        return typeof str === 'string' && str.trim().length > 0;
    },

    /**
     * Validates the challenge PIN (6 digits)
     */
    isValidChallengePin(pin) {
        return /^\d{6}$/.test(pin);
    }
};

export default Validators;
