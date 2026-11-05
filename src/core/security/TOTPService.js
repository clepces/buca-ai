/**
 * TOTPService - Autenticación Multifactor Basada en Tiempo (RFC 6238 / RFC 4226)
 * =========================================================================
 * 100% Nativo en el navegador usando la Web Crypto API (crypto.subtle).
 * Compatible con Google Authenticator, Authy, Microsoft Authenticator y 1Password.
 * Costo: $0. Cero servidores, cero dependencias npm externas.
 * =========================================================================
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decodifica una cadena Base32 a Uint8Array
 * @param {string} base32 
 * @returns {Uint8Array}
 */
function base32ToBytes(base32) {
    const cleaned = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
    let bits = '';
    for (let i = 0; i < cleaned.length; i++) {
        const val = BASE32_ALPHABET.indexOf(cleaned[i]);
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return new Uint8Array(bytes);
}

/**
 * Codifica un Uint8Array a cadena Base32
 * @param {Uint8Array} bytes 
 * @returns {string}
 */
function bytesToBase32(bytes) {
    let bits = '';
    for (let i = 0; i < bytes.length; i++) {
        bits += bytes[i].toString(2).padStart(8, '0');
    }
    let base32 = '';
    for (let i = 0; i < bits.length; i += 5) {
        const chunk = bits.substr(i, 5);
        if (chunk.length < 5) {
            base32 += BASE32_ALPHABET[parseInt(chunk.padEnd(5, '0'), 2)];
        } else {
            base32 += BASE32_ALPHABET[parseInt(chunk, 2)];
        }
    }
    return base32;
}

export const TOTPService = {
    /**
     * Genera una clave secreta aleatoria segura en Base32 (16 caracteres = 80 bits).
     * @returns {string} Clave Base32 (ej. 'JBSWY3DPEHPK3PXP')
     */
    generateSecret() {
        const randomBytes = new Uint8Array(10);
        window.crypto.getRandomValues(randomBytes);
        return bytesToBase32(randomBytes);
    },

    /**
     * Genera el URI estándar otpauth:// para escanear con Google Authenticator
     * @param {string} email - Correo del usuario
     * @param {string} secret - Clave Base32
     * @param {string} [issuer='BUCA AI'] - Nombre de la plataforma
     * @returns {string}
     */
    getOTPAuthURL(email, secret, issuer = 'BUCA AI') {
        const label = encodeURIComponent(`${issuer}:${email}`);
        const encIssuer = encodeURIComponent(issuer);
        return `otpauth://totp/${label}?secret=${secret}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
    },

    /**
     * Retorna una URL para generar el código QR gratuito
     * @param {string} otpauthURL 
     * @returns {string}
     */
    getQRCodeURL(otpauthURL) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(otpauthURL)}`;
    },

    /**
     * Calcula el código TOTP actual para una clave secreta y un paso de tiempo dado
     * @param {string} secret - Clave en Base32
     * @param {number} [timeOffsetSteps=0] - Desplazamiento de ventanas (-1, 0, +1)
     * @returns {Promise<string>} Código de 6 dígitos
     */
    async generateToken(secret, timeOffsetSteps = 0) {
        const keyBytes = base32ToBytes(secret);
        const epochSeconds = Math.floor(Date.now() / 1000);
        const timeStep = Math.floor(epochSeconds / 30) + timeOffsetSteps;

        // Convertir timeStep a búfer de 8 bytes (Big-Endian)
        const timeBuffer = new ArrayBuffer(8);
        const timeView = new DataView(timeBuffer);
        timeView.setBigUint64(0, BigInt(timeStep));

        // Importar clave HMAC-SHA1 nativa con Web Crypto
        const cryptoKey = await window.crypto.subtle.importKey(
            'raw',
            keyBytes,
            { name: 'HMAC', hash: 'SHA-1' },
            false,
            ['sign']
        );

        const hmacBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, timeBuffer);
        const hmac = new Uint8Array(hmacBuffer);

        // Truncamiento dinámico RFC 4226
        const offset = hmac[hmac.length - 1] & 0x0f;
        const binaryCode =
            ((hmac[offset] & 0x7f) << 24) |
            ((hmac[offset + 1] & 0xff) << 16) |
            ((hmac[offset + 2] & 0xff) << 8) |
            (hmac[offset + 3] & 0xff);

        const token = (binaryCode % 1000000).toString().padStart(6, '0');
        return token;
    },

    /**
     * Verifica si el código de 6 dígitos ingresado es válido
     * Aplica ventana de tolerancia de ±1 paso (±30 segundos) para mitigar desfases de reloj
     * @param {string} secret - Clave secreta Base32
     * @param {string} token - Código de 6 dígitos ingresado
     * @returns {Promise<boolean>}
     */
    async verifyCode(secret, token) {
        if (!secret || !token || String(token).trim().length !== 6) return false;
        const cleanToken = String(token).trim();

        const windowOffsets = [0, -1, 1]; // Ventana de tolerancia: actual, 30s antes, 30s después
        for (const offset of windowOffsets) {
            try {
                const expected = await this.generateToken(secret, offset);
                if (expected === cleanToken) {
                    return true;
                }
            } catch (err) {
                console.error('[TOTPService] Error verificando token:', err);
            }
        }
        return false;
    }
};

export default TOTPService;
