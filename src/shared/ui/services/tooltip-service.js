/**
 * TooltipService - Gestor Universal de Tooltips Neural (Vanilla JS)
 * =========================================================================
 * Inspirado en el diseño minimalista de Supabase Studio / Vercel.
 * Renderizado de alto rendimiento con contenedor único flotante,
 * detección de bordes (edge-clamping), soporte kbd y supresión nativa de title.
 * =========================================================================
 */
import { $id, $mount } from '@/shared/utils/dom.js';

export class TooltipService {
    static isInitialized = false;
    static _tooltipEl = null;
    static _currentTarget = null;
    static _showTimeout = null;

    /**
     * Inicializa la delegación global de eventos de tooltips.
     */
    static init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        this._ensureContainer();

        // Delegación de eventos en el documento
        document.addEventListener('pointerover', (e) => this._onPointerOver(e), { passive: true });
        document.addEventListener('pointerout', (e) => this._onPointerOut(e), { passive: true });
        document.addEventListener('focusin', (e) => this._onFocusIn(e), { passive: true });
        document.addEventListener('focusout', () => this.hide(), { passive: true });

        // Ocultar de inmediato al scrollear o hacer clic
        window.addEventListener('scroll', () => this.hide(), { passive: true, capture: true });
        document.addEventListener('click', () => this.hide(), { passive: true });
        window.addEventListener('resize', () => this.hide(), { passive: true });
    }

    static _ensureContainer() {
        let el = $id('buca-global-tooltip');
        if (!el) {
            el = document.createElement('div');
            el.id = 'buca-global-tooltip';
            el.className = 'buca-tooltip';
            el.setAttribute('role', 'tooltip');
            el.setAttribute('aria-hidden', 'true');
            document.body.appendChild(el);
        }
        this._tooltipEl = el;
    }

    static _onPointerOver(e) {
        const target = e.target.closest('[data-tooltip], [title]');
        if (!target) return;

        // Migrar title nativo a data-tooltip para suprimir el tooltip del navegador
        if (target.hasAttribute('title')) {
            const rawTitle = target.getAttribute('title');
            if (rawTitle) {
                target.setAttribute('data-tooltip', rawTitle);
            }
            target.removeAttribute('title');
        }

        const text = target.getAttribute('data-tooltip');
        if (!text || text.trim() === '') return;

        this._currentTarget = target;
        clearTimeout(this._showTimeout);

        // Micro-retraso para evitar parpadeos rápidos al deslizar el puntero
        this._showTimeout = setTimeout(() => {
            if (this._currentTarget === target) {
                this.show(target, text);
            }
        }, 120);
    }

    static _onPointerOut(e) {
        if (!this._currentTarget) return;
        const related = e.relatedTarget;
        if (related && this._currentTarget.contains(related)) return;

        clearTimeout(this._showTimeout);
        this.hide();
    }

    static _onFocusIn(e) {
        const target = e.target.closest('[data-tooltip], [title]');
        if (target) {
            if (target.hasAttribute('title')) {
                const rawTitle = target.getAttribute('title');
                if (rawTitle) target.setAttribute('data-tooltip', rawTitle);
                target.removeAttribute('title');
            }
            const text = target.getAttribute('data-tooltip');
            if (text) this.show(target, text);
        }
    }

    /**
     * Muestra el tooltip posicionado con respecto al elemento objetivo.
     * @param {HTMLElement} target 
     * @param {string} text 
     */
    static show(target, text) {
        if (!this._tooltipEl) this._ensureContainer();

        const el = this._tooltipEl;
        this._currentTarget = target;

        // Formatear atajos de teclado como (Ctrl + K) o similar
        const formatted = this._formatContent(text);
        $mount(el, formatted);

        el.classList.remove('buca-tooltip--visible');
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.visibility = 'hidden';
        el.style.display = 'block';

        requestAnimationFrame(() => {
            if (this._currentTarget !== target) return;

            const targetRect = target.getBoundingClientRect();
            const tooltipRect = el.getBoundingClientRect();
            const position = target.getAttribute('data-tooltip-position') || 'bottom';

            let top = 0;
            let left = 0;
            const margin = 7;

            // Calcular posición base
            if (position === 'bottom') {
                top = targetRect.bottom + margin;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                // Si desborda abajo, voltear a top
                if (top + tooltipRect.height > window.innerHeight - margin) {
                    top = targetRect.top - tooltipRect.height - margin;
                }
            } else if (position === 'top') {
                top = targetRect.top - tooltipRect.height - margin;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                // Si desborda arriba, voltear a bottom
                if (top < margin) {
                    top = targetRect.bottom + margin;
                }
            } else if (position === 'left') {
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left - tooltipRect.width - margin;
            } else if (position === 'right') {
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + margin;
            }

            // Detección de bordes horizontales (Edge Clamping)
            const minLeft = margin;
            const maxLeft = window.innerWidth - tooltipRect.width - margin;
            left = Math.max(minLeft, Math.min(left, maxLeft));

            // Aplicar coordenadas finales
            el.style.left = `${Math.round(left)}px`;
            el.style.top = `${Math.round(top)}px`;
            el.style.visibility = 'visible';
            el.setAttribute('aria-hidden', 'false');
            el.classList.add('buca-tooltip--visible');
        });
    }

    /**
     * Oculta el tooltip activo.
     */
    static hide() {
        clearTimeout(this._showTimeout);
        this._currentTarget = null;
        if (this._tooltipEl) {
            this._tooltipEl.classList.remove('buca-tooltip--visible');
            this._tooltipEl.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Convierte combinaciones de teclas entre paréntesis o texto en etiquetas <kbd>.
     * Ej: "Buscar (Ctrl + K)" -> "Buscar <kbd>Ctrl K</kbd>"
     */
    static _formatContent(text) {
        return text.replace(/\((Ctrl\s*\+?\s*[A-Z0-9]+)\)/gi, (_, kbd) => {
            const cleanKey = kbd.replace(/\+/g, ' ').trim();
            return `<kbd class="buca-tooltip-kbd">${cleanKey}</kbd>`;
        });
    }
}

export default TooltipService;
