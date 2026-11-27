/**
 * TwoFactorPage - Pantalla dedicada para verificación MFA (2FA / TOTP) tras login inicial.
 * Requiere sesión pendiente de AAL2; si no existe desafío pendiente, redirige a /auth/login.
 */
import { router } from '@/core/router/router.js';
import { RouterGuards } from '@/core/router/guards.js';
import { sessionState } from '@/core/state/session.js';
import { $id, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import PinForm from '../components/pin-form.js';
import { AuthService } from '../services/AuthService.js';
import { SupabaseProvider } from '../services/SupabaseProvider.js';

export const TwoFactorPage = {
    render() {
        return renderAuthCardShell({
            title: 'Verificación de Identidad (AAL2)',
            bodyHtml: `<div id="two-factor-slot">${PinForm.render('', { hasTotp: true })}</div>`,
            footerHtml: '<a href="/auth/login" class="fw-semibold text-decoration-none">Volver al inicio de sesión</a>'
        });
    },

    async init() {
        const state = sessionState.get();
        if (!state.mfaPending) {
            router.navigate(state.isAuthenticated ? RouterGuards.consumeReturnUrl('/workspace') : '/auth/login');
            return;
        }

        PinForm.init(
            async (enteredPin) => {
                const btnVerify = $id('btn-verify-pin');
                try {
                    const factors = await SupabaseProvider.mfaListFactors();
                    const factorId = factors?.totp?.find(f => f.status === 'verified')?.id;
                    if (!factorId) {
                        throw new Error('No se encontró un factor TOTP verificado.');
                    }
                    const res = await AuthService.verifyMFAChallenge(factorId, String(enteredPin || '').trim());
                    if (!res.success) {
                        throw new Error(res.error || 'Código TOTP incorrecto.');
                    }
                    router.navigate(RouterGuards.consumeReturnUrl('/workspace'));
                } catch (err) {
                    PinForm.showFeedback(err.message || 'Fallo en la verificación MFA.', 'error');
                    if (btnVerify) {
                        setButtonLoading(btnVerify, false);
                        setButtonContent(btnVerify, 'VERIFICAR IDENTIDAD', 'bi bi-shield-check ms-2');
                    }
                }
            },
            async () => {
                await AuthService.logout({ redirect: false });
                router.navigate('/auth/login');
            },
            () => {
                PinForm.showFeedback('Consulte su aplicación Google Authenticator para ver el código actual.', 'success');
            }
        );
    }
};

export default TwoFactorPage;
