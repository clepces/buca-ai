/**
 * AuthStatusView - Vista reutilizable de estado para flujos de Auth
 * (enlace expirado, 403 acceso denegado, verificación de email, cierre de sesión).
 */
export const renderAuthStatusView = ({
    id = '',
    icon = 'bi-shield-exclamation',
    iconColor = 'text-warning',
    title,
    message,
    messageId = '',
    actionHref = '/auth/login',
    actionLabel = 'VOLVER AL LOGIN',
    actionIcon = 'bi-arrow-left'
}) => `
    <div${id ? ` id="${id}"` : ''} class="text-center py-3 animate__animated animate__fadeIn">
        <div class="mb-3 ${iconColor}">
            <i class="bi ${icon} fs-1"></i>
        </div>
        <h3 class="h6 fw-bold mb-2">${title}</h3>
        <p class="text-muted small mb-4"${messageId ? ` id="${messageId}"` : ''}>
            ${message}
        </p>
        ${actionHref ? `
            <a href="${actionHref}" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                <i class="bi ${actionIcon}"></i>
                <span>${actionLabel}</span>
            </a>
        ` : ''}
    </div>
`;

export default renderAuthStatusView;
