/**
 * LogoutPage - Cierre seguro de sesión y limpieza de estado global.
 */
import { router } from '@/core/router/router.js';
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import { AuthService } from '../services/AuthService.js';

export const LogoutPage = {
    render() {
        return renderAuthCardShell({
            title: 'Cerrando Sesión',
            bodyHtml: `
                <div class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                    <p class="text-muted small mb-0">Finalizando tu sesión segura...</p>
                </div>
            `,
            footerHtml: '<a href="/auth/login" class="fw-semibold text-decoration-none">Ir al Login</a>'
        });
    },

    async init() {
        await AuthService.logout({ redirect: false });
        router.navigate('/auth/login');
    }
};

export default LogoutPage;
