/**
 * UnauthorizedPage - Pantalla informativa 403 (Acceso Denegado por Rol).
 */
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import { renderAuthStatusView } from '../components/auth-status-view.js';

export const UnauthorizedPage = {
    render() {
        return renderAuthCardShell({
            title: 'Acceso Restringido',
            bodyHtml: renderAuthStatusView({
                icon: 'bi-shield-x',
                iconColor: 'text-danger',
                title: 'Permisos Insuficientes (403)',
                message: 'Tu rol actual no tiene autorización para acceder a esta sección.',
                actionHref: '/workspace',
                actionLabel: 'VOLVER AL WORKSPACE',
                actionIcon: 'bi-arrow-left'
            }),
            footerHtml: '<a href="/auth/logout" class="fw-semibold text-decoration-none">Cerrar sesión</a>'
        });
    }
};

export default UnauthorizedPage;
