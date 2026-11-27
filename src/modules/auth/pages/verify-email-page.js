/**
 * VerifyEmailPage - Confirmación de verificación de correo electrónico.
 */
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import { renderAuthStatusView } from '../components/auth-status-view.js';
import { SupabaseProvider } from '../services/SupabaseProvider.js';
import { $id, $mount } from '@/shared/utils/dom.js';

export const VerifyEmailPage = {
    render() {
        return renderAuthCardShell({
            title: 'Verificación de Correo',
            bodyHtml: `
                <div id="verify-email-slot">
                    <div class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
                        <p class="text-muted small mb-0">Comprobando estado de verificación...</p>
                    </div>
                </div>
            `,
            footerHtml: '<a href="/auth/login" class="fw-semibold text-decoration-none">Volver al Login</a>'
        });
    },

    async init() {
        const slot = $id('verify-email-slot');
        if (!slot) return;
        try {
            const user = await SupabaseProvider.getUser();
            const confirmed = Boolean(user?.email_confirmed_at || user?.confirmed_at);
            $mount(slot, renderAuthStatusView({
                icon: confirmed ? 'bi-envelope-check-fill' : 'bi-envelope-exclamation',
                iconColor: confirmed ? 'text-success' : 'text-primary',
                title: confirmed ? 'Correo Verificado' : 'Revisa tu Bandeja de Entrada',
                message: confirmed
                    ? 'Tu correo corporativo fue verificado correctamente. Ya puedes acceder a la plataforma.'
                    : 'Te enviamos un enlace de confirmación. Ábrelo desde tu bandeja de entrada o carpeta de spam.',
                actionHref: confirmed ? '/workspace' : '/auth/login',
                actionLabel: confirmed ? 'IR AL WORKSPACE' : 'IR AL LOGIN',
                actionIcon: 'bi-arrow-right'
            }));
        } catch {
            $mount(slot, renderAuthStatusView({
                icon: 'bi-envelope-exclamation',
                iconColor: 'text-primary',
                title: 'Revisa tu Bandeja de Entrada',
                message: 'Abre el enlace de confirmación enviado a tu correo o inicia sesión para solicitar uno nuevo.',
                actionHref: '/auth/login',
                actionLabel: 'IR AL LOGIN',
                actionIcon: 'bi-box-arrow-in-right'
            }));
        }
    }
};

export default VerifyEmailPage;
