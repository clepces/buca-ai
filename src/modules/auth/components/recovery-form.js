/**
 * RecoveryForm - Componente reutilizable de solicitud de recuperación de contraseña.
 */
import { $id, $on, $className, $addClass, $removeClass, $hide, $show, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { AuthService } from '../services/AuthService.js';
import { Logger } from '@/shared/utils/logger.js';
import { renderFeedbackAlert, renderEmailField } from './auth-form-fields.js';

export const RecoveryForm = {
    _cooldownTimer: null,
    _isSubmitting: false,

    render() {
        return `
            <form class="glass-form" id="recovery-form">
                ${renderFeedbackAlert('recovery-feedback')}
                ${renderEmailField({
                    id: 'recovery-email',
                    name: 'email',
                    placeholder: 'admin@empresa.com',
                    autocomplete: 'email',
                    marginClass: 'mb-4'
                })}

                <button type="submit" id="btn-recovery-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                    <span>ENVIAR ENLACE</span>
                    <i class="bi bi-send-fill"></i>
                </button>
            </form>
        `;
    },

    init() {
        this.destroy();
        const form = $id('recovery-form');
            const emailInput = $id('recovery-email');
            const btn = $id('btn-recovery-submit');
            const feedback = $id('recovery-feedback');
            if (!form) return;

            const resetSubmitButton = () => {
                this.destroy();
                if (!btn) return;
                btn.disabled = false;
                $removeClass(btn, 'btn-success');
                setButtonContent(btn, 'ENVIAR ENLACE', 'bi bi-send-fill');
            };

            if (emailInput) {
                $on(emailInput, 'input', () => {
                    if (btn?.disabled && !this._isSubmitting) {
                        resetSubmitButton();
                    }
                });
            }

            $on(form, 'submit', async (e) => {
                e.preventDefault();
                if (this._isSubmitting) return;
                const email = (emailInput?.value || '').trim().toLowerCase();
                if (!email) return;

                this._isSubmitting = true;
                btn.disabled = true;
                setButtonLoading(btn, true, 'ENVIANDO...');
                $hide(feedback);

                try {
                    const result = await AuthService.recoverPassword(email);
                    if (!result.success) {
                        const isRateLimit = result.status === 429 || /rate limit|too many|429/i.test(result.error || '');
                        const isServerError = (typeof result.status === 'number' && result.status >= 500) || /500|\{\}/.test(result.error || '');
                        let friendlyError = result.error || 'No se pudo procesar la solicitud. Por favor intenta más tarde.';
                        if (isRateLimit) {
                            friendlyError = 'Has alcanzado el límite temporal de envíos. Espera unos minutos antes de intentar nuevamente.';
                        } else if (isServerError) {
                            friendlyError = 'El servicio de correo no está disponible en este momento. Intenta más tarde o contacta a soporte.';
                        }
                        throw new Error(friendlyError);
                    }

                    Logger.info({ layer: 'UI', role: 'CLASS', target: 'RecoveryForm', message: `Solicitud de recuperación enviada para ${email}.` });
                    setButtonContent(btn, 'SOLICITUD ENVIADA', 'bi bi-check-circle');
                    $addClass(btn, 'btn-success');

                    const msgSpan = document.createElement('span');
                    msgSpan.textContent = `Si ${email} está registrado en el sistema, recibirás un enlace de recuperación en unos minutos. Revisa tu bandeja de entrada y spam.`;
                    feedback.replaceChildren(msgSpan);
                    $className(feedback, 'alert alert-success animate__animated animate__fadeIn py-2 small mb-4');
                    $show(feedback);
                    this._isSubmitting = false;

                    this._cooldownTimer = setTimeout(() => {
                        this._cooldownTimer = null;
                        resetSubmitButton();
                    }, 15000);
                } catch (error) {
                    Logger.warn({ layer: 'UI', role: 'CLASS', target: 'RecoveryForm', message: 'Error al solicitar enlace de recuperación.', data: error.message });
                    const errSpan = document.createElement('span');
                    errSpan.textContent = error.message;
                    feedback.replaceChildren(errSpan);
                    $className(feedback, 'alert alert-danger animate__animated animate__headShake py-2 small mb-4');
                    $show(feedback);
                    this._isSubmitting = false;
                    resetSubmitButton();
                }
            });
    },

    destroy() {
        this._isSubmitting = false;
        if (this._cooldownTimer) {
            clearTimeout(this._cooldownTimer);
            this._cooldownTimer = null;
        }
    }
};

export default RecoveryForm;
