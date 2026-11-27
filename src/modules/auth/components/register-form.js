/**
 * RegisterForm - Componente reutilizable de registro de usuarios.
 * Valida política de contraseña antes de enviar y protege contra doble envío.
 */
import { $id, $on, $className, $hide, $show, $val, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { AuthService } from '../services/AuthService.js';
import { AuthValidator } from '../logic/AuthValidator.js';
import { renderFeedbackAlert, renderEmailField, renderPasswordField, bindPasswordToggle } from './auth-form-fields.js';

export const RegisterForm = {
    _isSubmitting: false,

    render() {
        return `
            <form class="glass-form" id="register-form">
                ${renderFeedbackAlert('register-feedback')}

                <div class="form-group mb-3">
                    <label for="reg-name" class="form-label small fw-bold text-uppercase opacity-75">Nombre Completo</label>
                    <div class="input-wrapper">
                        <i class="bi bi-person"></i>
                        <input type="text" id="reg-name" name="full-name" class="glass-input" placeholder="Ej. Juan Pérez" required autocomplete="name">
                    </div>
                </div>

                ${renderEmailField({
                    id: 'reg-email',
                    name: 'email',
                    placeholder: 'admin@empresa.com',
                    autocomplete: 'email'
                })}

                ${renderPasswordField({
                    id: 'reg-password',
                    name: 'new-password',
                    toggleId: 'reg-toggle-password',
                    autocomplete: 'new-password',
                    hint: 'Mínimo 8 caracteres, una mayúscula, un número y un símbolo.',
                    marginClass: 'mb-4'
                })}

                <button type="submit" id="btn-register-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                    <span>REGISTRAR MI EMPRESA</span>
                    <i class="bi bi-person-plus-fill"></i>
                </button>
            </form>
        `;
    },

    init(onSuccess) {
        this._isSubmitting = false;
        const form = $id('register-form');
            const togglePwd = $id('reg-toggle-password');
            const pwdInput = $id('reg-password');
            const btnSubmit = $id('btn-register-submit');
            const feedback = $id('register-feedback');

            bindPasswordToggle(togglePwd, pwdInput);
            if (!form) return;

            const showMsg = (msg, isSuccess = false) => {
                if (!feedback) return;
                const span = document.createElement('span');
                span.textContent = msg;
                feedback.replaceChildren(span);
                $className(feedback, `alert alert-${isSuccess ? 'success' : 'danger'} animate__animated animate__fadeIn py-2 small mb-4`);
                $show(feedback);
            };

            $on(form, 'submit', async (e) => {
                e.preventDefault();
                if (this._isSubmitting) return;

                const name = ($val('reg-name') || '').trim();
                const email = ($val('reg-email') || '').trim().toLowerCase();
                const password = pwdInput?.value || '';

                $hide(feedback);
                if (!AuthValidator.isValidPassword(password)) {
                    showMsg('La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo.');
                    return;
                }

                this._isSubmitting = true;
                if (btnSubmit) {
                    btnSubmit.disabled = true;
                    setButtonLoading(btnSubmit, true, 'REGISTRANDO...');
                }

                try {
                    const result = await AuthService.register(email, password, name);
                    if (!result.success) {
                        throw new Error(result.error === 'auth/email-already-in-use'
                            ? 'El correo ya está registrado.'
                            : 'Error al crear la cuenta. Intente de nuevo.');
                    }

                    if (pwdInput) pwdInput.value = '';
                    showMsg('Cuenta creada con éxito. Redirigiendo...', true);
                    if (typeof onSuccess === 'function') onSuccess(result);
                } catch (error) {
                    this._isSubmitting = false;
                    if (pwdInput) pwdInput.value = '';
                    showMsg(error.message);
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        setButtonContent(btnSubmit, 'REGISTRAR MI EMPRESA', 'bi bi-person-plus-fill');
                    }
                }
            });
    },

    destroy() {
        this._isSubmitting = false;
    }
};

export default RegisterForm;
