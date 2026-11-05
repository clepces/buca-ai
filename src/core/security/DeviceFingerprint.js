/**
 * DeviceFingerprint - Identificador Único de Hardware (BNE Security)
 * =========================================================================
 * Genera una firma digital basada en las capacidades del hardware para
 * la Fase 2 de Autenticación. Optimizado para el bus de la ATI 4650.
 * =========================================================================
 */
export const DeviceFingerprint = {
    /**
     * Genera un hash único basado en la configuración del navegador y hardware.
     * @returns {Promise<string>} Fingerprint del dispositivo.
     */
    async generate() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            this._getCanvasFingerprint(),
            this._getWebGLEngineInfo()
        ];

        const rawString = components.join('###');
        return await this._sha256(rawString);
    },

    /**
     * Genera una firma visual mediante Canvas (detecta variaciones de renderizado).
     * @private
     */
    _getCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('buca-bne-security-v5', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('buca-bne-security-v5', 4, 17);
        
        return canvas.toDataURL();
    },

    /**
     * Extrae información del driver de video para identificar el GPU.
     * @private
     */
    _getWebGLEngineInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'no-webgl';
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'no-webgl-debug';
        
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_ID);
    },

    /**
     * Función helper para hashing SHA-256 (Vanilla JS).
     * @private
     */
    async _sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};

export default DeviceFingerprint;
