/**
 * MFAEnrollmentModal - Modal de Enrolamiento y Configuración de MFA (TOTP)
 * =========================================================================
 * 1. Reautenticación previa por contraseña obligatoria.
 * 2. Enrolamiento nativo con Supabase y renderizado de QR local en <canvas>.
 * 3. Emisión de claves de respaldo de emergencia descargables/imprimibles.
 * =========================================================================
 */
import ModalService from '@/shared/ui/overlays/ModalService.js';
import { AuthService } from '@/modules/auth/services/AuthService.js';
import { SupabaseProvider } from '@/modules/auth/services/SupabaseProvider.js';
import { CanvasQRRenderer } from '@/core/security/CanvasQRRenderer.js';
import { BackupKeyService } from '@/core/security/BackupKeyService.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';

export class MFAEnrollmentModal {
    static _enrollmentData = null;
    static _backupKeys = [];

    /**
     * Muestra el modal de enrolamiento iniciando en Paso 1: Reautenticación.
     */
    static show() {
        const user = sessionState.get().user || {};
        const email = user.email || '';

        ModalService.showModal({
            size: 'md',
            header: {
                left: '<h4 class="fw-bold mb-0 text-main d-flex align-items-center gap-2"><i class="bi bi-shield-lock-fill text-primary"></i> Configurar Doble Factor (MFA)</h4>',
                right: '<span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold">Paso 1 de 3</span>'
            },
            body: `
                <div id="mfa-step-container" class="p-2">
                    <div class="alert alert-warning d-flex align-items-start gap-2 rounded-3 small mb-3">
                        <i class="bi bi-shield-exclamation text-warning fs-5 flex-shrink-0"></i>
                        <div>
                            <strong>Reautenticación de Seguridad:</strong> Ingrese su contraseña actual para desbloquear la vinculación del autenticador TOTP.
                        </div>
                    </div>
                    <form id="mfa-reauth-form">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">Correo Electrónico</label>
                            <input type="email" class="form-control glass-input opacity-75" value="${email}" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">Contraseña Actual <span class="text-danger">*</span></label>
                            <input type="password" id="mfa-reauth-pwd" class="form-control glass-input" placeholder="••••••••" required autofocus>
                        </div>
                        <div id="mfa-reauth-feedback" class="small text-danger mb-3 d-none"></div>
                        <div class="d-flex justify-content-end gap-2">
                            <button type="button" class="btn btn-ghost" data-action="ui:close_modal">Cancelar</button>
                            <button type="submit" id="btn-mfa-reauth" class="btn btn-primary px-4 fw-bold">
                                <span>Verificar Contraseña</span>
                                <i class="bi bi-arrow-right ms-1"></i>
                            </button>
                        </div>
                    </form>
                </div>
            `,
            footer: {}
        });

        this._bindReauthForm(email);
    }

    static _bindReauthForm(email) {
        const form = document.getElementById('mfa-reauth-form');
        if (!form) return;

        form.onsubmit = async (e) => {
            e.preventDefault();
            const pwdInput = document.getElementById('mfa-reauth-pwd');
            const feedback = document.getElementById('mfa-reauth-feedback');
            const btn = document.getElementById('btn-mfa-reauth');

            const password = pwdInput?.value || '';
            if (!password) return;

            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Verificando...';
            if (feedback) feedback.classList.add('d-none');

            try {
                // Reautenticar con Supabase Auth
                await SupabaseProvider.login(email, password);
                await this._showStep2QR(email);
            } catch (err) {
                if (feedback) {
                    feedback.textContent = 'Contraseña incorrecta. Se requiere reautenticación válida.';
                    feedback.classList.remove('d-none');
                }
                btn.disabled = false;
                btn.innerHTML = '<span>Verificar Contraseña</span><i class="bi bi-arrow-right ms-1"></i>';
            }
        };
    }

    static async _showStep2QR(email) {
        const container = document.getElementById('mfa-step-container');
        if (!container) return;

        container.innerHTML = `
            <div class="text-center py-2">
                <div class="buca-spinner mx-auto mb-3"></div>
                <div class="small text-muted">Generando factor TOTP y código QR seguro...</div>
            </div>
        `;

        const enrollment = await AuthService.enrollTOTP();
        if (!enrollment.success) {
            container.innerHTML = `<div class="alert alert-danger py-2 small">Error generando TOTP: ${enrollment.error}</div>`;
            return;
        }

        this._enrollmentData = enrollment;

        container.innerHTML = `
            <div class="text-center mb-3">
                <p class="small text-muted mb-2">Escanee este código con Google Authenticator, Authy o Microsoft Authenticator:</p>
                <div class="d-flex justify-content-center p-2 rounded-3 bg-white shadow-xs mx-auto border" style="width: 220px; height: 220px;">
                    <canvas id="mfa-canvas-qr" width="220" height="220"></canvas>
                </div>
                <div class="small text-muted mt-2 mb-1">O ingrese esta clave secreta manualmente:</div>
                <div class="p-2 rounded bg-body-tertiary border font-monospace small fw-bold text-primary text-break user-select-all mb-2" id="mfa-secret-text">
                    ${enrollment.secret}
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label small fw-bold text-muted text-uppercase mb-1">Código de 6 dígitos de la App <span class="text-danger">*</span></label>
                <div class="input-group">
                    <input type="text" id="mfa-verify-code" class="form-control text-center font-monospace fw-bold fs-5" maxlength="6" inputmode="numeric" placeholder="000000" autofocus>
                    <button class="btn btn-primary fw-bold px-4" id="btn-mfa-confirm-code" type="button">Activar</button>
                </div>
                <div id="mfa-verify-feedback" class="small text-danger mt-1 d-none"></div>
            </div>
        `;

        // Renderizado nativo del QR en Canvas (Cero APIs externas)
        const canvas = document.getElementById('mfa-canvas-qr');
        if (canvas && enrollment.qrCode) {
            await CanvasQRRenderer.renderToCanvas(canvas, enrollment.qrCode, { size: 220, padding: 10 });
        }

        const confirmBtn = document.getElementById('btn-mfa-confirm-code');
        const codeInput = document.getElementById('mfa-verify-code');
        const verifyFeedback = document.getElementById('mfa-verify-feedback');

        confirmBtn.onclick = async () => {
            const code = codeInput?.value?.trim() || '';
            if (code.length !== 6) {
                if (verifyFeedback) {
                    verifyFeedback.textContent = 'Ingrese el código de 6 dígitos generado por la aplicación.';
                    verifyFeedback.classList.remove('d-none');
                }
                return;
            }

            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Verificando...';
            if (verifyFeedback) verifyFeedback.classList.add('d-none');

            const res = await AuthService.confirmTOTPEnrollment(enrollment.factorId, code);
            if (res.success) {
                await this._showStep3BackupKeys(email);
            } else {
                if (verifyFeedback) {
                    verifyFeedback.textContent = 'Código inválido o expirado. Compruebe la hora de su teléfono móvil.';
                    verifyFeedback.classList.remove('d-none');
                }
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = 'Activar';
            }
        };
    }

    static async _showStep3BackupKeys(email) {
        const user = sessionState.get().user || {};
        const container = document.getElementById('mfa-step-container');
        if (!container) return;

        // Generar 8 claves de respaldo de emergencia
        const keys = BackupKeyService.generateKeys(8);
        this._backupKeys = keys;

        // Guardar cifrado en Supabase
        await BackupKeyService.saveEncryptedKeys(user.uid, keys);

        container.innerHTML = `
            <div class="text-center mb-3">
                <div class="profile-icon-box-sm rounded-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center mb-2">
                    <i class="bi bi-check2-circle fs-3"></i>
                </div>
                <h5 class="fw-bold text-main mb-1">¡MFA Vinculado Exitosamente!</h5>
                <p class="small text-muted mb-3">Guarde sus claves de respaldo de emergencia. Cada una es de un solo uso en caso de extraviar su teléfono.</p>
            </div>
            <div class="p-3 bg-body-tertiary rounded-3 border mb-3">
                <div class="row g-2 font-monospace small text-center fw-bold">
                    ${keys.map(k => `<div class="col-6 p-1.5 bg-body rounded border user-select-all">${k}</div>`).join('')}
                </div>
            </div>
            <div class="d-flex justify-content-center gap-2 mb-3">
                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" id="btn-download-keys">
                    <i class="bi bi-download me-1"></i> Descargar Claves (.txt)
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-print-keys">
                    <i class="bi bi-printer me-1"></i> Imprimir
                </button>
            </div>
            <div class="form-check mb-3 p-2 rounded bg-body border">
                <input class="form-check-input ms-1" type="checkbox" id="mfa-saved-keys-check">
                <label class="form-check-label small ms-2 text-main fw-bold" for="mfa-saved-keys-check">
                    He guardado mis claves de emergencia en un lugar seguro.
                </label>
            </div>
            <div class="d-flex justify-content-end">
                <button type="button" id="btn-mfa-finish" class="btn btn-success px-4 rounded-pill fw-bold" disabled>
                    Finalizar y Activar Protección
                </button>
            </div>
        `;

        document.getElementById('btn-download-keys').onclick = () => {
            BackupKeyService.downloadAsText(keys, email);
            const check = document.getElementById('mfa-saved-keys-check');
            if (check) check.checked = true;
            document.getElementById('btn-mfa-finish').disabled = false;
        };

        document.getElementById('btn-print-keys').onclick = () => {
            BackupKeyService.printSlip(keys, email);
        };

        const check = document.getElementById('mfa-saved-keys-check');
        const finishBtn = document.getElementById('btn-mfa-finish');
        check.onchange = () => {
            finishBtn.disabled = !check.checked;
        };

        finishBtn.onclick = () => {
            ModalService.hideModal();
            eventBus.emit('profile:mfa-enrolled');
            eventBus.emit('ui:notification_hud', {
                title: 'Seguridad AAL2 Activada',
                message: 'Autenticación en dos pasos (TOTP) configurada y activa.',
                type: 'success'
            });
        };
    }
}

export default MFAEnrollmentModal;
