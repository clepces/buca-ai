/**
 * Utilidades de Seguridad (Buca Neural Engine V4.7.5)
 * Mitigación de XSS para la renderización de HTML dinámico.
 */

/**
 * Escapa caracteres especiales en HTML para prevenir ataques XSS (Cross-Site Scripting).
 * @param {string} str - La cadena a escapar.
 * @returns {string} La cadena escapada y segura para insertar en HTML.
 */
export function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') return String(str);
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
