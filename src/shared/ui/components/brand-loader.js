/**
 * @fileoverview BrandLoader - Isotipo SVG animado reutilizable de BUCA AI
 * @module shared/ui/components/brand-loader
 * @description Reemplaza los spinners circulares genéricos en skeletons, placeholders,
 * modales y overlays manteniendo un único trazado SVG ligero sin gradientes duplicados.
 */
import { escapeHTML } from '@/shared/utils/security.js';

const LOGO_PATH = 'M182.2,298.2c29.1,0,52.7-23.6,52.7-52.7c0-29.1-10.5-42.2-21.1-63.2C191.2,137,209.1,96.8,256,55.7c10.5,52.7,42.2,103.3,84.3,137s63.2,73.8,63.2,115.9c0,81.5-66.1,147.6-147.6,147.6s-147.6-66.1-147.6-147.6c0-24.3,9.1-48.4,21.1-63.2C129.5,274.6,153.1,298.2,182.2,298.2z';

/**
 * Renderiza el isotipo animado BUCA AI.
 * @param {Object} [options]
 * @param {'sm'|'md'|'lg'} [options.size='md'] - Tamaño del loader
 * @param {string} [options.label=''] - Texto opcional debajo del loader
 * @param {string} [options.className=''] - Clases adicionales
 * @returns {string} HTML listo para $mount
 */
export function renderBrandLoader(options = {}) {
    const { size = 'md', label = '', className = '' } = options;
    const sizeClass = `buca-brand-loader--${['sm', 'md', 'lg'].includes(size) ? size : 'md'}`;

    return `
        <div class="buca-brand-loader-wrap ${escapeHTML(className)}">
            <div class="buca-brand-loader ${sizeClass}" aria-hidden="true">
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path class="buca-brand-loader__track" d="${LOGO_PATH}" />
                    <path class="buca-brand-loader__stroke buca-brand-loader__stroke--solid" pathLength="100" d="${LOGO_PATH}" />
                </svg>
            </div>
            ${label ? `<div class="small text-muted mt-2">${escapeHTML(label)}</div>` : ''}
        </div>
    `;
}

export default renderBrandLoader;
