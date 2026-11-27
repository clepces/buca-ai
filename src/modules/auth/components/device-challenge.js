/**
 * DeviceChallenge - Componente de Verificación de Dispositivo (Seguridad BNE)
 */
import { $id, $on, $show, $hide, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { AuthValidator } from '../logic/AuthValidator.js';
import { renderFeedbackAlert } from './auth-form-fields.js';

export const DeviceChallenge = {
    _isSubmitting: false,

    render(fingerprint = '') {
        const safePrefix = String(fingerprint || '').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 16);
        return `
            <div class="device-challenge animate__animated animate__fadeIn">
                <div class="text-center mb-3">
                    <div class="d-inline-flex align-items-center justify-content-center p-2 rounded-circle bg-warning-subtle text-warning mb-2">
                        <i class="bi bi-laptop fs-4"></i>
                    </div>
                    <h3 class="h6 fw-bold mb-1">Verificación de Dispositivo</h3>
                    <p class="text-muted small mb-2">Hemos detectado un acceso desde un terminal nuevo:</p>
                    <code class="d-inline-block px-2 py-1 rounded bg-light text-primary small">${safePrefix || 'terminal-nuevo'}...</code>
                </div>

                ${renderFeedbackAlert('device-challenge-feedback', 'mb-3')}

                <form id="device-challenge-form" class="glass-form">
                    <div class="form-group mb-4">
                        <label for="device-pin-input" class="form-label small fw-bold text-uppercase opacity-75">PIN de Autorización (6 dígitos)</label>
                        <div class="input-wrapper">
                            <i class="bi bi-shield-lock"></i>
                            <input type="text" id="device-pin-input" maxlength="6" inputmode="numeric" pattern="[0-9]{6}" placeholder="000000" class="glass-input text-center" required autocomplete="one-time-code">
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2" id="btn-verify-device">
                        <span>AUTORIZAR HARDWARE</span>
                        <i class="bi bi-shield-check"></i>
                    </button>
                </form>

                <div class="text-center mt-3">
                    <button type="button" class="btn btn-link text-decoration-none text-muted small p-0" id="btn-cancel-device">
                        <i class="bi bi-arrow-left me-1"></i> Cancelar acceso
                    </button>
                </div>
            </div>
        `;
    },

    init(onVerify, onCancel) {
        this._isSubmitting = false;
        const form = $id('device-challenge-form');
        const pinInput = $id('device-pin-input');
        const btn = $id('btn-verify-device');
        const cancelBtn = $id('btn-cancel-device');
        const feedback = $id('device-challenge-feedback');

        if (form) {
            $on(form, 'submit', async (e) => {
                e.preventDefault();
                if (this._isSubmitting) return;
                const pin = (pinInput?.value || '').trim();
                $hide(feedback);

                if (!AuthValidator.isValidChallengePin(pin)) {
                    if (feedback) {
                        feedback.textContent = 'Ingresa un PIN de autorización válido de 6 dígitos.';
                        $show(feedback);
                    }
                    return;
                }

                this._isSubmitting = true;
                if (btn) {
                    btn.disabled = true;
                    setButtonLoading(btn, true, 'AUTORIZANDO...');
                }

                try {
                    if (typeof onVerify === 'function') await onVerify(pin);
                } catch (err) {
                    if (feedback) {
                        feedback.textContent = err?.message || 'PIN de dispositivo inválido.';
                        $show(feedback);
                    }
                    if (btn) {
                        btn.disabled = false;
                        setButtonContent(btn, 'AUTORIZAR HARDWARE', 'bi bi-shield-check');
                    }
                } finally {
                    this._isSubmitting = false;
                }
            });
        }

        if (cancelBtn) {
            $on(cancelBtn, 'click', () => {
                if (typeof onCancel === 'function') onCancel();
            });
        }
    }
};

export default DeviceChallenge;
