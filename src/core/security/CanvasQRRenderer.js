/**
 * CanvasQRRenderer - Renderizador Nativo de Códigos QR en HTML5 Canvas
 * =========================================================================
 * Renderiza el código QR de Supabase TOTP directamente en un elemento <canvas>
 * del navegador sin realizar llamadas HTTP externas ni fugar secretos (Cero 3rd Party).
 * =========================================================================
 */

export class CanvasQRRenderer {
    /**
     * Renderiza un SVG data-URI o string de Supabase en un elemento <canvas>.
     * @param {HTMLCanvasElement} canvasEl 
     * @param {string} svgData 
     * @param {Object} [options]
     * @returns {Promise<HTMLCanvasElement>}
     */
    static async renderToCanvas(canvasEl, svgData, options = {}) {
        if (!canvasEl) throw new Error('[CanvasQRRenderer] Elemento canvas no proporcionado.');

        const size = options.size || 220;
        const padding = options.padding || 12;

        canvasEl.width = size;
        canvasEl.height = size;
        const ctx = canvasEl.getContext('2d');

        // Fondo blanco nítido
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        if (!svgData) {
            this._renderPlaceholder(ctx, size);
            return canvasEl;
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);
                resolve(canvasEl);
            };

            img.onerror = (err) => {
                console.warn('[CanvasQRRenderer] Error al cargar SVG, dibujando fallback visual:', err);
                this._renderPlaceholder(ctx, size);
                resolve(canvasEl);
            };

            const src = svgData.startsWith('data:')
                ? svgData
                : `data:image/svg+xml;utf8,${encodeURIComponent(svgData)}`;

            img.src = src;
        });
    }

    /**
     * Dibuja un placeholder visual estilizado si el QR aún no está listo.
     * @private
     */
    static _renderPlaceholder(ctx, size) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(10, 10, size - 20, size - 20);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, size - 20, size - 20);

        ctx.fillStyle = '#64748b';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Código QR de Seguridad', size / 2, size / 2);
    }
}

export default CanvasQRRenderer;
