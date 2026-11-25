/**
 * RecoveryPage - Recuperación de Acceso
 */
import { $id, $on, $className, $addClass, $removeClass, $hide, $show } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';
import { AuthService } from '../services/AuthService.js';

export const RecoveryPage = {
    _cooldownTimer: null,

    render() {
        return `
            <div class="auth-view-content">
                <main class="auth-body">
                    <h2 class="auth-title h5 fw-semibold mb-4 text-center">Recuperar Acceso</h2>
                    <p class="auth-subtitle text-muted small text-center mb-4">
                        Ingresa tu correo corporativo y te enviaremos instrucciones seguras para restablecer tu contraseña.
                    </p>
                    
                    <div id="recovery-feedback" role="alert" aria-live="polite" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                    <form class="glass-form" id="recovery-form">
                        <div class="form-group mb-4">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Correo Corporativo</label>
                            <div class="input-wrapper">
                                <i class="bi bi-envelope"></i>
                                <input type="email" id="recovery-email" class="glass-input" placeholder="admin@empresa.com" required autocomplete="email">
                            </div>
                        </div>

                        <button type="submit" id="btn-recovery-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                            <span>ENVIAR ENLACE</span>
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </form>
                </main>

                <footer class="text-center mt-4 border-top pt-3">
                    <p class="small text-muted mb-0">
                        <a href="/auth/login" class="fw-semibold text-decoration-none d-flex align-items-center justify-content-center gap-2">
                            <i class="bi bi-arrow-left"></i> Volver al Login
                        </a>
                    </p>
                </footer>
            </div>
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
                    if (btn?.disabled) {
                        resetSubmitButton();
                    }
                });
            }

            $on(form, 'submit', async (e) => {
                e.preventDefault();
                const email = (emailInput?.value || '').trim().toLowerCase();
                if (!email) return;

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

                    Logger.info('Auth', 'Solicitud de recuperación procesada para:', email);
                    setButtonContent(btn, 'SOLICITUD ENVIADA', 'bi bi-check-circle');
                    $addClass(btn, 'btn-success');

                    const msgSpan = document.createElement('span');
                    msgSpan.textContent = `Si ${email} está registrado en el sistema, recibirás un enlace de recuperación en unos minutos. Revisa tu bandeja de entrada y spam.`;
                    feedback.replaceChildren(msgSpan);
                    $className(feedback, 'alert alert-success animate__animated animate__fadeIn py-2 small mb-4');
                    $show(feedback);

                    this._cooldownTimer = setTimeout(() => {
                        this._cooldownTimer = null;
                        resetSubmitButton();
                    }, 15000);
                } catch (error) {
                    Logger.warn('Auth', 'Error al solicitar recuperación:', error.message);
                    const errSpan = document.createElement('span');
                    errSpan.textContent = error.message;
                    feedback.replaceChildren(errSpan);
                    $className(feedback, 'alert alert-danger animate__animated animate__headShake py-2 small mb-4');
                    $show(feedback);

                    resetSubmitButton();
                }
            });
    },

    destroy() {
        if (this._cooldownTimer) {
            clearTimeout(this._cooldownTimer);
            this._cooldownTimer = null;
        }
    }
};
export default RecoveryPage;
