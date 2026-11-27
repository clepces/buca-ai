/**
 * PasswordResetForm - Componente de Restablecimiento de Contraseña.
 * Se monta únicamente tras verificar criptográficamente el contexto recovery (y AAL2 si aplica).
 */
import { $id, $on, $hide, $show, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { AuthService } from '../services/AuthService.js';
import { renderFeedbackAlert, renderPasswordField, bindPasswordToggle } from './auth-form-fields.js';

export const PasswordResetForm = {
    _isSubmitting: false,

    render() {
        return `
            <form class="glass-form animate__animated animate__fadeIn" id="password-reset-form">
                ${renderFeedbackAlert('reset-feedback')}
                <div id="reset-success-feedback" role="alert" aria-live="polite" class="alert alert-success d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                ${renderPasswordField({
                    id: 'reset-new-password',
                    name: 'new-password',
                    label: 'Nueva Contraseña',
                    toggleId: 'btn-toggle-new-password',
                    toggleAriaLabel: 'Mostrar u ocultar nueva contraseña',
                    autocomplete: 'new-password',
                    icon: 'bi-key',
                    hint: 'Mínimo 8 caracteres, una mayúscula, un número y un símbolo.',
                    marginClass: 'mb-3'
                })}

                ${renderPasswordField({
                    id: 'reset-confirm-password',
                    name: 'confirm-password',
                    label: 'Confirmar Contraseña',
                    toggleId: 'btn-toggle-confirm-password',
                    toggleAriaLabel: 'Mostrar u ocultar confirmación de contraseña',
                    autocomplete: 'new-password',
                    icon: 'bi-shield-lock',
                    marginClass: 'mb-4'
                })}

                <button type="submit" id="btn-reset-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                    <span>GUARDAR CONTRASEÑA</span>
                    <i class="bi bi-check2-circle"></i>
                </button>
            </form>
        `;
    },

    validatePolicy(password) {
        if (!password || password.length < 8) {
            return { valid: false, message: 'La contraseña debe contener al menos 8 caracteres.' };
        }
        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'La contraseña debe incluir al menos una letra mayúscula.' };
        }
        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'La contraseña debe incluir al menos un número.' };
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            return { valid: false, message: 'La contraseña debe incluir al menos un carácter especial.' };
        }
        return { valid: true };
    },

    init(onCompleted) {
        this._isSubmitting = false;
        const formEl = $id('password-reset-form');
        const newPwdEl = $id('reset-new-password');
        const confirmPwdEl = $id('reset-confirm-password');
        const feedbackEl = $id('reset-feedback');
        const successFeedbackEl = $id('reset-success-feedback');

        bindPasswordToggle($id('btn-toggle-new-password'), newPwdEl);
        bindPasswordToggle($id('btn-toggle-confirm-password'), confirmPwdEl);
        if (!formEl) return;

        $on(formEl, 'submit', async (e) => {
            e.preventDefault();
            if (this._isSubmitting) return;

            const btn = $id('btn-reset-submit');
            const newPassword = newPwdEl?.value || '';
            const confirmPassword = confirmPwdEl?.value || '';

            $hide(feedbackEl);
            $hide(successFeedbackEl);

            if (newPassword !== confirmPassword) {
                if (feedbackEl) {
                    feedbackEl.textContent = 'Las contraseñas ingresadas no coinciden.';
                    $show(feedbackEl);
                }
                return;
            }

            const policy = this.validatePolicy(newPassword);
            if (!policy.valid) {
                if (feedbackEl) {
                    feedbackEl.textContent = policy.message;
                    $show(feedbackEl);
                }
                return;
            }

            this._isSubmitting = true;
            if (btn) {
                btn.disabled = true;
                setButtonLoading(btn, true, 'ACTUALIZANDO...');
            }

            try {
                const res = await AuthService.updatePassword(newPassword);
                if (!res.success) {
                    throw new Error(res.error || 'No se pudo actualizar la contraseña.');
                }

                if (newPwdEl) newPwdEl.value = '';
                if (confirmPwdEl) confirmPwdEl.value = '';
                if (typeof onCompleted === 'function') await onCompleted();
            } catch (err) {
                this._isSubmitting = false;
                if (feedbackEl) {
                    feedbackEl.textContent = err.message || 'Error inesperado al restablecer contraseña.';
                    $show(feedbackEl);
                }
                if (btn) {
                    btn.disabled = false;
                    setButtonContent(btn, 'GUARDAR CONTRASEÑA', 'bi bi-check2-circle');
                }
            }
        });
    },

    destroy() {
        this._isSubmitting = false;
    }
};

export default PasswordResetForm;
