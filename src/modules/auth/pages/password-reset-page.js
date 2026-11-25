/**
 * PasswordResetPage - Restablecimiento Seguro de Contraseña
 * =========================================================================
 * Procesa el retorno de enlaces de recuperación de Supabase.
 * Valida la sesión activa de recuperación mediante getUser() y aplica la política
 * de seguridad corporativa antes de ejecutar updateUser({ password }).
 * =========================================================================
 */
import { $id, $on, $hide, $show, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';
import { sessionState } from '@/core/state/session.js';
import { SupabaseProvider } from '../services/SupabaseProvider.js';
import { AuthService } from '../services/AuthService.js';

export const PasswordResetPage = {
    _redirectTimer: null,

    render() {
        return `
            <div class="auth-view-content" id="password-reset-view">
                <main class="auth-body">
                    <h2 class="auth-title h5 fw-semibold mb-3 text-center">Nueva Contraseña</h2>
                    <p class="auth-subtitle text-muted small text-center mb-4" id="reset-page-subtitle">
                        Establece tu nueva credencial de acceso para proteger tu cuenta corporativa.
                    </p>

                    <div id="reset-feedback" role="alert" aria-live="polite" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small mb-4"></div>
                    <div id="reset-success-feedback" role="alert" aria-live="polite" class="alert alert-success d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                    <!-- Estado de Validación Inicial -->
                    <div id="reset-validating" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <p class="text-muted small mb-0">Verificando enlace de seguridad...</p>
                    </div>

                    <!-- Estado de Enlace Inválido -->
                    <div id="reset-invalid" class="d-none text-center py-3">
                        <div class="mb-3 text-warning">
                            <i class="bi bi-shield-exclamation fs-1"></i>
                        </div>
                        <h3 class="h6 fw-bold mb-2">Enlace no válido o expirado</h3>
                        <p class="text-muted small mb-4" id="reset-invalid-message">
                            El enlace no es válido, ha caducado o no se detectó un flujo de recuperación activo.
                        </p>
                        <a href="/auth/recovery" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                            <i class="bi bi-envelope"></i>
                            <span>SOLICITAR NUEVO ENLACE</span>
                        </a>
                    </div>

                    <!-- Formulario de Restablecimiento -->
                    <form class="glass-form d-none" id="password-reset-form">
                        <div class="form-group mb-3">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Nueva Contraseña</label>
                            <div class="input-wrapper">
                                <i class="bi bi-key"></i>
                                <input type="password" id="reset-new-password" class="glass-input" placeholder="••••••••" required autocomplete="new-password">
                                <button class="btn-toggle-password" type="button" id="btn-toggle-new-password" aria-label="Mostrar u ocultar nueva contraseña">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                            <div class="form-text small text-muted" style="font-size: 0.75rem;">
                                Mínimo 8 caracteres, una mayúscula, un número y un símbolo.
                            </div>
                        </div>

                        <div class="form-group mb-4">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Confirmar Contraseña</label>
                            <div class="input-wrapper">
                                <i class="bi bi-shield-lock"></i>
                                <input type="password" id="reset-confirm-password" class="glass-input" placeholder="••••••••" required autocomplete="new-password">
                                <button class="btn-toggle-password" type="button" id="btn-toggle-confirm-password" aria-label="Mostrar u ocultar confirmación de contraseña">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>

                        <button type="submit" id="btn-reset-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                            <span>GUARDAR CONTRASEÑA</span>
                            <i class="bi bi-check2-circle"></i>
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

    /**
     * Valida la política de contraseñas de la plataforma.
     * @param {string} password 
     * @returns {{ valid: boolean, message?: string }}
     */
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

    async init() {
        this.destroy();
        const validatingEl = $id('reset-validating');
        const invalidEl = $id('reset-invalid');
        const formEl = $id('password-reset-form');
        const feedbackEl = $id('reset-feedback');
        const successFeedbackEl = $id('reset-success-feedback');

        // 1. Validación criptográfica y de origen recovery con el SDK de Supabase
        try {
            const user = await SupabaseProvider.getUser();
            const isRecovery = await SupabaseProvider.isRecoverySession();
            if (!user || !user.id || !isRecovery) {
                throw new Error('Sesión de recuperación no válida, expirada o ausente.');
            }
            $hide(validatingEl);
            $hide(invalidEl);
            $show(formEl);
        } catch (err) {
            Logger.warn('PasswordResetPage', 'Validación de recuperación fallida:', err.message);
            const hash = typeof window !== 'undefined' && window.location ? window.location.hash : '';
            const invalidMsgEl = $id('reset-invalid-message');
            if (invalidMsgEl && /error_code=otp_expired|error=access_denied/i.test(hash)) {
                invalidMsgEl.textContent = 'El enlace de recuperación ya fue utilizado o ha expirado. Solicita un nuevo enlace.';
            }
            try {
                if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('buca_recovery_flow');
            } catch { /* ignore */ }
            if (sessionState.get().isPasswordRecovery) {
                sessionState.set({ isPasswordRecovery: false });
            }
            $hide(validatingEl);
            $hide(formEl);
            $show(invalidEl);
            return;
        }

        const bindVisibilityToggle = (btnId, inputId) => {
            const toggleBtn = $id(btnId);
            const inputEl = $id(inputId);
            if (!toggleBtn || !inputEl) return;
            $on(toggleBtn, 'click', () => {
                const isPwd = inputEl.type === 'password';
                inputEl.type = isPwd ? 'text' : 'password';
                setButtonContent(toggleBtn, '', `bi bi-eye${isPwd ? '-slash' : ''}`);
            });
        };
        bindVisibilityToggle('btn-toggle-new-password', 'reset-new-password');
        bindVisibilityToggle('btn-toggle-confirm-password', 'reset-confirm-password');

        // 3. Listener de envío de formulario
        $on(formEl, 'submit', async (e) => {
            e.preventDefault();
            const btn = $id('btn-reset-submit');
            const newPassword = $id('reset-new-password')?.value || '';
            const confirmPassword = $id('reset-confirm-password')?.value || '';

            $hide(feedbackEl);
            $hide(successFeedbackEl);

            if (newPassword !== confirmPassword) {
                feedbackEl.textContent = 'Las contraseñas ingresadas no coinciden.';
                $show(feedbackEl);
                return;
            }

            const policy = this.validatePolicy(newPassword);
            if (!policy.valid) {
                feedbackEl.textContent = policy.message;
                $show(feedbackEl);
                return;
            }

            btn.disabled = true;
            setButtonLoading(btn, true, 'ACTUALIZANDO...');

            try {
                const res = await AuthService.updatePassword(newPassword);
                if (!res.success) {
                    throw new Error(res.error || 'No se pudo actualizar la contraseña.');
                }

                $hide(formEl);
                successFeedbackEl.textContent = '¡Contraseña actualizada con éxito! Cerrando sesión por seguridad...';
                $show(successFeedbackEl);

                // Cierre de sesión y limpieza de contexto de recuperación
                const logoutRes = await AuthService.logout({ redirect: false });
                try {
                    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('buca_recovery_flow');
                } catch { /* ignore */ }

                if (!logoutRes.success) {
                    successFeedbackEl.textContent = 'Contraseña actualizada. No se pudo confirmar el cierre en el servidor. Por seguridad, inicia sesión nuevamente.';
                }

                this._redirectTimer = setTimeout(() => {
                    this._redirectTimer = null;
                    window.location.href = '/auth/login';
                }, 2000);
            } catch (err) {
                feedbackEl.textContent = err.message || 'Error inesperado al restablecer contraseña.';
                $show(feedbackEl);
                btn.disabled = false;
                setButtonContent(btn, 'GUARDAR CONTRASEÑA', 'bi bi-check2-circle');
            }
        });
    },

    destroy() {
        if (this._redirectTimer) {
            clearTimeout(this._redirectTimer);
            this._redirectTimer = null;
        }
    }
};

export default PasswordResetPage;
