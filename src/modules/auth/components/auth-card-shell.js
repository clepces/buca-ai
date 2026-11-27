/**
 * AuthCardShell - Contenedor visual reutilizable para vistas del módulo Auth.
 * Evita duplicar la estructura <div class="auth-view-content"> / <main> / <footer>.
 * @param {object} config
 * @param {string} [config.viewId]
 * @param {string} config.title
 * @param {string} [config.titleId]
 * @param {string} [config.subtitle]
 * @param {string} [config.subtitleId]
 * @param {string} [config.bodyId]
 * @param {string} config.bodyHtml
 * @param {string} [config.footerId]
 * @param {string} config.footerHtml
 * @returns {string}
 */
export const renderAuthCardShell = ({
    viewId = '',
    title,
    titleId = '',
    subtitle = '',
    subtitleId = '',
    bodyId = '',
    bodyHtml,
    footerId = '',
    footerHtml
}) => `
    <div class="auth-view-content"${viewId ? ` id="${viewId}"` : ''}>
        <main class="auth-body"${bodyId ? ` id="${bodyId}"` : ''}>
            <h2 class="auth-title h5 fw-semibold ${subtitle ? 'mb-3' : 'mb-4'} text-center"${titleId ? ` id="${titleId}"` : ''}>${title}</h2>
            ${subtitle ? `<p class="auth-subtitle text-muted small text-center mb-4"${subtitleId ? ` id="${subtitleId}"` : ''}>${subtitle}</p>` : ''}
            ${bodyHtml}
        </main>

        <footer class="text-center mt-4 border-top pt-3"${footerId ? ` id="${footerId}"` : ''}>
            <p class="small text-muted mb-0">
                ${footerHtml}
            </p>
        </footer>
    </div>
`;

export default renderAuthCardShell;
