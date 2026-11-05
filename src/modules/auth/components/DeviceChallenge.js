/**
 * DeviceChallenge - Componente de Fase 2 (Seguridad BNE)
 * =========================================================================
 * Se activa cuando se detecta un hardware nuevo o no autorizado.
 * =========================================================================
 */
export const DeviceChallenge = {
    render(fingerprint) {
        return `
            <div class="device-challenge glass-surface">
                <i class="bi bi-shield-lock-fill"></i>
                <h3>Verificación de Dispositivo</h3>
                <p>Hemos detectado un acceso desde un nuevo terminal:</p>
                <code class="fingerprint-display">${fingerprint.substring(0, 16)}...</code>
                <p>Por favor, ingresa el PIN de seguridad enviado a tu dispositivo autorizado.</p>
                <div class="pin-input-group">
                    <input type="text" maxlength="6" placeholder="000000" class="glass-input pin-field">
                </div>
                <button class="btn-primary" id="btn-verify-device">Autorizar Hardware</button>
            </div>
        `;
    }
};
export default DeviceChallenge;
