/**
 * PasswordResetPage - Orquestador de Restablecimiento Seguro de Contraseña.
 * Monta dinámicamente en #reset-state-slot únicamente el componente autorizado según estado real.
 */
import { $id, $mount, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { getHash } from '@/core/utils/system-helper.js';
import { Logger } from '@/shared/utils/logger.js';
import { sessionState } from '@/core/state/session.js';
import { SupabaseProvider } from '../services/SupabaseProvider.js';
import { AuthService } from '../services/AuthService.js';
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import { renderAuthStatusView } from '../components/auth-status-view.js';
import PinForm from '../components/pin-form.js';
import PasswordResetForm from '../components/password-reset-form.js';

export const PasswordResetPage = {
    _redirectTimer: null,

    render() {
        return renderAuthCardShell({
            viewId: 'password-reset-view',
            title: 'Nueva Contraseña',
            subtitle: 'Establece tu nueva credencial de acceso para proteger tu cuenta corporativa.',
            subtitleId: 'reset-page-subtitle',
            bodyHtml: `
                <div id="reset-state-slot">
                    <div id="reset-validating" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <p class="text-muted small mb-0">Verificando enlace de seguridad...</p>
                    </div>
                </div>
            `,
            footerHtml: '<a href="/auth/login" class="fw-semibold text-decoration-none d-flex align-items-center justify-content-center gap-2"><i class="bi bi-arrow-left"></i> Volver al Login</a>'
        });
    },

    validatePolicy(password) {
        return PasswordResetForm.validatePolicy(password);
    },

    async init() {
        this.destroy();
        const slotEl = $id('reset-state-slot');
        const subtitleEl = $id('reset-page-subtitle');

        // 1. Validación criptográfica y de origen recovery con el SDK de Supabase.
        // Protege el flujo/UI cliente; la autorización real de datos y cambio de contraseña reside en el servidor.
        let verifiedMfaFactorId = null;
        let userEmail;
        try {
            const hash = getHash();
            if (/error_code=otp_expired|error=access_denied/i.test(hash)) {
                throw new Error('El enlace de recuperación ya fue utilizado o ha expirado.');
            }
            const isRecovery = await SupabaseProvider.isRecoverySession();
            const user = isRecovery ? await SupabaseProvider.getUser() : null;
            if (!isRecovery || !user || !user.id) {
                throw new Error('Sesión de recuperación no válida, expirada o ausente.');
            }
            userEmail = user.email || '';

            const aal = await SupabaseProvider.getAssuranceLevel();
            if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
                const factors = await SupabaseProvider.mfaListFactors();
                const verifiedTotp = (factors?.totp || []).find(f => f.status === 'verified');
                if (!verifiedTotp) {
                    throw new Error('No se encontró un factor TOTP verificado para elevar la sesión a AAL2.');
                }
                verifiedMfaFactorId = verifiedTotp.id;
            }
        } catch (err) {
            Logger.warn({ layer: 'UI', role: 'CLASS', target: 'PasswordResetPage', message: 'Validación de recuperación rechazada.', data: err.message });
            const hash = getHash();
            const expiredMsg = /error_code=otp_expired|error=access_denied/i.test(hash)
                ? 'El enlace de recuperación ya fue utilizado o ha expirado. Solicita un nuevo enlace.'
                : 'El enlace no es válido, ha caducado o no se detectó un flujo de recuperación activo.';

            try {
                if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('buca_recovery_flow');
            } catch { /* ignore */ }
            if (sessionState.get().isPasswordRecovery) {
                sessionState.set({ isPasswordRecovery: false });
            }

            if (slotEl) {
                $mount(slotEl, renderAuthStatusView({
                    id: 'reset-invalid',
                    icon: 'bi-shield-exclamation',
                    iconColor: 'text-warning',
                    title: 'Enlace no válido o expirado',
                    message: expiredMsg,
                    messageId: 'reset-invalid-message',
                    actionHref: '/auth/recovery',
                    actionLabel: 'SOLICITAR NUEVO ENLACE',
                    actionIcon: 'bi-envelope'
                }));
            }
            return;
        }

        const mountPasswordForm = () => {
            if (!slotEl) return;
            if (subtitleEl) subtitleEl.textContent = 'Establece tu nueva credencial de acceso para proteger tu cuenta corporativa.';
            $mount(slotEl, PasswordResetForm.render());
            PasswordResetForm.init(async () => {
                const logoutRes = await AuthService.logout({ redirect: false });
                try {
                    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('buca_recovery_flow');
                } catch { /* ignore */ }

                const msg = logoutRes.success
                    ? '¡Contraseña actualizada con éxito! Cerrando sesión por seguridad...'
                    : 'Contraseña actualizada. No se pudo confirmar el cierre en el servidor. Por seguridad, inicia sesión nuevamente.';

                $mount(slotEl, renderAuthStatusView({
                    id: 'reset-completed',
                    icon: 'bi-check-circle-fill',
                    iconColor: 'text-success',
                    title: 'Contraseña Actualizada',
                    message: msg,
                    actionHref: '/auth/login',
                    actionLabel: 'IR AL LOGIN',
                    actionIcon: 'bi-box-arrow-in-right'
                }));

                this._redirectTimer = setTimeout(() => {
                    this._redirectTimer = null;
                    window.location.href = '/auth/login';
                }, 2000);
            });
        };

        if (verifiedMfaFactorId && slotEl) {
            if (subtitleEl) subtitleEl.textContent = 'Tu cuenta tiene MFA habilitado. Verifica tu identidad para restablecer la contraseña.';
            $mount(slotEl, PinForm.render(userEmail, { hasTotp: true }));
            PinForm.init(
                async (enteredPin) => {
                    const btnVerify = $id('btn-verify-pin');
                    try {
                        const res = await AuthService.verifyRecoveryMFA(verifiedMfaFactorId, String(enteredPin || '').trim());
                        if (!res.success) {
                            throw new Error(res.error || 'Código TOTP incorrecto.');
                        }
                        verifiedMfaFactorId = null;
                        mountPasswordForm();
                    } catch (mfaErr) {
                        PinForm.showFeedback(mfaErr.message || 'No se pudo verificar el código TOTP.', 'error');
                        if (btnVerify) {
                            setButtonLoading(btnVerify, false);
                            setButtonContent(btnVerify, 'VERIFICAR IDENTIDAD', 'bi bi-shield-check ms-2');
                        }
                    }
                },
                () => { window.location.href = '/auth/login'; },
                () => { PinForm.showFeedback('Consulte su aplicación Google Authenticator para ver el código actual.', 'success'); }
            );
            return;
        }

        mountPasswordForm();
    },

    destroy() {
        PasswordResetForm.destroy();
        if (this._redirectTimer) {
            clearTimeout(this._redirectTimer);
            this._redirectTimer = null;
        }
    }
};

export default PasswordResetPage;
