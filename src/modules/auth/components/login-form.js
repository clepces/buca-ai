/**
 * LoginForm - Componente de Entrada de Credenciales
 */
import { $id, $on, $show, $hide, $val, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { AuthService } from '../services/AuthService.js';
import { renderFeedbackAlert, renderEmailField, renderPasswordField, bindPasswordToggle } from './auth-form-fields.js';

export const LoginForm = {
    _isSubmitting: false,
    _submitTimer: null,

    render() {
        return `
            <form id="login-form" class="glass-form">
                ${renderFeedbackAlert('login-feedback')}
                ${renderEmailField({
                    id: 'email',
                    name: 'email',
                    placeholder: 'usuario@empresa.com',
                    autocomplete: 'username email'
                })}
                ${renderPasswordField({
                    id: 'password',
                    name: 'password',
                    toggleId: 'toggle-password',
                    autocomplete: 'current-password'
                })}

                <div class="d-flex justify-content-between align-items-center mb-4 px-2 form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" name="remember" id="remember">
                        <div class="checkmark"></div>
                        Recordarme
                    </label>
                    <a href="/auth/recovery" class="forgot-link">¿Olvidó su contraseña?</a>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" id="btn-login-submit">
                    <span class="btn-text">ACCEDER AL PORTAL</span>
                    <i class="bi bi-arrow-right-short ms-2"></i>
                </button>
            </form>
        `;
    },

    init(onSubmit) {
        this.destroy();
        const form = $id('login-form');
            const togglePwd = $id('toggle-password');
            const emailInput = $id('email');
            const pwdInput = $id('password');
            const btnSubmit = $id('btn-login-submit');

            bindPasswordToggle(togglePwd, pwdInput);

            if (form) {
                $on(form, 'submit', async (e) => {
                    e.preventDefault();
                    if (this._isSubmitting) return;
                    this._isSubmitting = true;

                    const email = $val(emailInput);
                    const password = $val(pwdInput);

                    setButtonLoading(btnSubmit, true, 'VERIFICANDO...');
                    this.hideFeedback();

                    try {
                        const result = await AuthService.login(email, password);

                        if (result.mfaRequired) {
                            this.showFeedback('Verificación MFA (TOTP) requerida...', 'success');
                            this._submitTimer = setTimeout(() => {
                                this._submitTimer = null;
                                this._isSubmitting = false;
                                onSubmit({ email, mfaRequired: true, factorId: result.factorId });
                            }, 500);
                            return;
                        }

                        if (!result.success) {
                            let errorMsg = 'Credenciales inválidas. Verifique sus datos.';
                            if (result.error === 'auth/user-not-found' || result.error === 'auth/wrong-password' || result.error === 'auth/invalid-credential') {
                                errorMsg = 'Usuario o contraseña incorrectos.';
                            } else if (result.error === 'auth/too-many-requests') {
                                errorMsg = 'Demasiados intentos fallidos. Intente más tarde.';
                            } else if (result.error === 'auth/network-request-failed') {
                                errorMsg = 'Error de conexión con el servidor. Verifique su red.';
                            } else if (result.error === 'auth/user-disabled') {
                                errorMsg = 'Esta cuenta corporativa ha sido inhabilitada.';
                            } else if (result.error === 'auth/invalid-email') {
                                errorMsg = 'El formato del correo corporativo no es válido.';
                            } else if (result.error) {
                                errorMsg = result.error;
                            }
                            throw new Error(errorMsg);
                        }

                        if (pwdInput) pwdInput.value = '';
                        this.showFeedback('Acceso Aprobado. Iniciando sesión...', 'success');
                        this._submitTimer = setTimeout(() => {
                            this._submitTimer = null;
                            this._isSubmitting = false;
                            onSubmit({ email, mfaRequired: false });
                        }, 500);
                    } catch (error) {
                        this._isSubmitting = false;
                        if (pwdInput) pwdInput.value = '';
                        this.showFeedback(error.message, 'error');
                        setButtonLoading(btnSubmit, false);
                        setButtonContent(btnSubmit, 'ACCEDER AL PORTAL', 'bi bi-arrow-right-short ms-2');
                    }
                });
            }
    },

    showFeedback(message, type = 'error') {
        const area = $id('login-feedback');
        if (!area) return;
        area.textContent = message;
        area.className = `alert alert-${type === 'error' ? 'danger' : 'success'} animate__animated animate__headShake py-2 small mb-4`;
        $show(area);
    },

    hideFeedback() {
        const area = $id('login-feedback');
        if (area) $hide(area);
    },

    destroy() {
        this._isSubmitting = false;
        if (this._submitTimer) {
            clearTimeout(this._submitTimer);
            this._submitTimer = null;
        }
    }
};

export default LoginForm;
