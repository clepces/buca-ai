/**
 * PINForm - Componente de Verificación de Seguridad y Doble Factor (2FA / TOTP)
 * =========================================================================
 * Soporta Google Authenticator (RFC 6238 TOTP) y Código de Verificación Seguro.
 * Incluye soporte para pegar código (Paste), autocompletado y navegación de foco.
 * =========================================================================
 */
export const PINForm = {
    render(email = 'usuario@empresa.com', options = {}) {
        const { otpCode = '', hasTotp = false } = options;
        const displayCode = otpCode || '123456';

        return `
            <div class="pin-verification-container animate__animated animate__fadeInUp">
                <div class="text-center mb-3">
                    <div class="d-inline-flex align-items-center justify-content-center p-2 rounded-circle bg-primary-subtle text-primary mb-2 shadow-2xs">
                        <i class="bi bi-shield-check fs-4"></i>
                    </div>
                    <h3 class="h6 fw-bold mb-1 text-main">Verificación de Seguridad (2FA)</h3>
                    <p class="text-muted small mb-1">
                        ${hasTotp 
                            ? 'Ingrese el código de su aplicación <strong>Google Authenticator</strong>:' 
                            : 'Hemos generado su código de verificación para:'}
                    </p>
                    <span class="fw-bold text-primary font-monospace">${email}</span>

                    <!-- Indicador de Código y Autocompletado (Desarrollo / Respaldo Resiliente) -->
                    <div class="mt-3 p-2 rounded-3 border-glass bg-white-5 text-center d-flex flex-column align-items-center justify-content-center gap-1.5" id="pin-assist-box">
                        <div class="d-flex align-items-center gap-1 text-muted x-small">
                            <i class="bi ${hasTotp ? 'bi-phone' : 'bi-key-fill'} text-warning"></i>
                            <span>${hasTotp ? 'Google Authenticator o Código de Emergencia' : 'Código de Verificación Activo'}</span>
                        </div>
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <span class="fs-5 fw-bold font-monospace text-primary tracking-wide" id="active-pin-badge">${displayCode}</span>
                            <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill x-small fw-bold" id="btn-autofill-pin" data-code="${displayCode}" title="Autocompletar código">
                                <i class="bi bi-magic me-1"></i> Autocompletar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between mb-4 pin-inputs-row gap-1.5" id="pin-inputs">
                    <input type="text" maxlength="1" id="pin-digit-0" name="pin-0" autocomplete="one-time-code" aria-label="Dígito 1 del PIN" class="form-control text-center fw-bold p-0 pin-digit-box" data-index="0" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-1" name="pin-1" autocomplete="one-time-code" aria-label="Dígito 2 del PIN" class="form-control text-center fw-bold p-0 pin-digit-box" data-index="1" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-2" name="pin-2" autocomplete="one-time-code" aria-label="Dígito 3 del PIN" class="form-control text-center fw-bold p-0 pin-digit-box" data-index="2" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-3" name="pin-3" autocomplete="one-time-code" aria-label="Dígito 4 del PIN" class="form-control text-center fw-bold p-0 pin-digit-box" data-index="3" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-4" name="pin-4" autocomplete="one-time-code" aria-label="Dígito 5 del PIN" class="form-control text-center fw-bold p-0 pin-digit-box" data-index="4" inputmode="numeric" placeholder="•">
                    <input type="text" maxlength="1" id="pin-digit-5" name="pin-5" autocomplete="one-time-code" aria-label="Dígito 6 del PIN" class="form-control text-center fw-bold p-0 pin-digit-box" data-index="5" inputmode="numeric" placeholder="•">
                </div>

                <div id="pin-feedback" class="alert d-none py-2 small mb-4 text-center animate__animated animate__shakeX"></div>

                <button type="button" class="btn btn-primary w-100 py-2.5 fw-bold rounded-pill shadow-sm" id="btn-verify-pin">
                    <span>VERIFICAR IDENTIDAD</span>
                    <i class="bi bi-shield-check ms-2"></i>
                </button>

                <div class="mt-4 text-center">
                    <p class="small text-muted mb-2">
                        ¿Problemas para acceder? 
                        <a href="#" id="resend-pin" class="fw-semibold text-primary text-decoration-none">Generar nuevo PIN</a>
                    </p>
                    <button type="button" class="btn btn-link text-decoration-none text-muted small p-0" id="back-to-login">
                        <i class="bi bi-arrow-left me-1"></i> Volver al inicio de sesión
                    </button>
                </div>
            </div>
        `;
    },

    init(onSuccess, onBack, onResend) {
        const inputs = Array.from(document.querySelectorAll('#pin-inputs input'));
        const btnVerify = document.getElementById('btn-verify-pin');
        const backBtn = document.getElementById('back-to-login');
        const resendBtn = document.getElementById('resend-pin');
        const autofillBtn = document.getElementById('btn-autofill-pin');

        const populateCode = (codeStr) => {
            const digits = String(codeStr).replace(/\D/g, '').slice(0, 6);
            inputs.forEach((input, i) => {
                input.value = digits[i] || '';
                if (digits[i]) input.classList.add('filled');
                else input.classList.remove('filled');
            });
            if (digits.length === 6 && btnVerify) {
                btnVerify.focus();
            }
        };

        // Soporte para botón Autocompletar
        if (autofillBtn) {
            autofillBtn.onclick = () => {
                const code = autofillBtn.dataset.code;
                if (code) {
                    populateCode(code);
                    this.showFeedback('Código cargado. Presione Verificar.', 'success');
                }
            };
        }

        // Auto-foco y navegación entre campos
        inputs.forEach((input, idx) => {
            input.addEventListener('keyup', (e) => {
                if (e.key >= '0' && e.key <= '9') {
                    input.classList.add('filled');
                    if (idx < inputs.length - 1) inputs[idx + 1].focus();
                } else if (e.key === 'Backspace') {
                    input.classList.remove('filled');
                    if (idx > 0) inputs[idx - 1].focus();
                } else if (e.key === 'Enter') {
                    if (btnVerify) btnVerify.click();
                }
            });

            // Evitar caracteres no numéricos
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });

            // Soporte de Pegar (Paste) 6 dígitos de una vez
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = (e.clipboardData || window.clipboardData).getData('text');
                const cleanDigits = pastedData.replace(/\D/g, '').slice(0, 6);
                if (cleanDigits.length > 0) {
                    populateCode(cleanDigits);
                    if (cleanDigits.length === 6 && btnVerify) {
                        btnVerify.click();
                    }
                }
            });
        });

        if (btnVerify) {
            btnVerify.onclick = () => {
                const pin = inputs.map(i => i.value).join('');
                if (pin.length === 6) {
                    this.showFeedback('Validando factor de autenticación...', 'success');
                    btnVerify.disabled = true;
                    btnVerify.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Validando...';
                    setTimeout(() => onSuccess(pin), 600);
                } else {
                    this.showFeedback('Por favor, ingrese los 6 dígitos del código.', 'error');
                }
            };
        }

        if (resendBtn) {
            resendBtn.onclick = (e) => {
                e.preventDefault();
                this.showFeedback('Nuevo código generado.', 'success');
                if (onResend) onResend();
            };
        }

        if (backBtn) {
            backBtn.onclick = (e) => {
                e.preventDefault();
                if (onBack) onBack();
            };
        }

        // Foco inicial suave
        setTimeout(() => {
            if (inputs[0]) inputs[0].focus();
        }, 300);
    },

    showFeedback(message, type = 'error') {
        const area = document.getElementById('pin-feedback');
        if (!area) return;
        
        area.innerHTML = `<span>${message}</span>`;
        area.className = `alert alert-${type === 'error' ? 'danger' : 'success'} py-2 small mb-3 text-center animate__animated animate__shakeX`;
        area.classList.remove('d-none');
    }
};

export default PINForm;
