/**
 * CallbackPage - Procesador silencioso de retorno OAuth / PKCE de Supabase.
 */
import { router } from '@/core/router/router.js';
import { RouterGuards } from '@/core/router/guards.js';
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import { AuthService } from '../services/AuthService.js';

export const CallbackPage = {
    render() {
        return renderAuthCardShell({
            title: 'Procesando Autenticación',
            bodyHtml: `
                <div class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                    <p class="text-muted small mb-0">Validando credenciales con el servidor...</p>
                </div>
            `,
            footerHtml: '<a href="/auth/login" class="fw-semibold text-decoration-none">Volver al Login</a>'
        });
    },

    async init() {
        const res = await AuthService.checkSession();
        if (res.isPasswordRecovery) {
            router.navigate('/auth/recovery/reset-password');
        } else if (res.mfaPending) {
            router.navigate('/auth/two-factor');
        } else if (res.isAuthenticated) {
            router.navigate(RouterGuards.consumeReturnUrl('/workspace'));
        } else {
            router.navigate('/auth/login');
        }
    }
};

export default CallbackPage;
