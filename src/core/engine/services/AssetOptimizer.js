/**
 * @fileoverview AssetOptimizer - Gestión y Carga Adaptativa de Elementos DOM para BNE
 * @module core/engine/services/AssetOptimizer
 * @description Maneja IntersectionObserver para imágenes y videos según el perfil gráfico y DPR.
 */

import { $id, $styleVar } from '@/shared/utils/dom.js';
import { $onWindow, $offWindow } from '@/core/utils/system-helper.js';

export class AssetOptimizer {
    constructor(engine) {
        this.engine = engine;
        this.activeElements = new Set();
        this.intersectionObserver = null;
        this.mutationObserver = null;

        this.#modalOpenHandler = null;
        this.#layoutReadyHandler = null;
        this.#scanGraphicsHandler = null;

        this.#initObservers();
    }

    #modalOpenHandler;
    #layoutReadyHandler;
    #scanGraphicsHandler;

    #initObservers() {
        if (typeof IntersectionObserver === 'undefined') return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeElements.add(entry.target);
                    this.processElement(entry.target);
                } else {
                    this.activeElements.delete(entry.target);
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.01
        });

        this.#modalOpenHandler = () => this.scan($id('modal-container'));
        this.#layoutReadyHandler = () => this.scan();
        this.#scanGraphicsHandler = () => this.scan();

        $onWindow('modal:opened', this.#modalOpenHandler);
        $onWindow('kernel:layout-ready', this.#layoutReadyHandler);
        $onWindow('ui:scan_graphics', this.#scanGraphicsHandler);
    }

    /**
     * Escanea y observa nodos para optimización visual dentro de un contenedor o en el DOM global.
     * @param {Element|Document} [rootNode=document.body]
     */
    scan(rootNode = document.body) {
        if (!rootNode || this.engine.isPanicMode) return;
        const selector = '[data-buca-asset], [data-perf-src], [data-src-default]';
        if (rootNode.matches && rootNode.matches(selector)) {
            this.intersectionObserver?.observe(rootNode);
        }
        if (rootNode.querySelectorAll) {
            rootNode.querySelectorAll(selector).forEach(el => {
                this.intersectionObserver?.observe(el);
            });
        }
    }

    /**
     * Procesa un elemento individual según el perfil de rendimiento activo.
     * @param {Element} el
     */
    processElement(el) {
        if (!el) return;

        const tier = this.engine.profile;
        const tierData = this.engine.tiers[tier];
        const highResSuffix = this.engine.dpr > 1.2 ? '@2x' : '';

        const newSrc = el.getAttribute(`data-src-${tier}`) ||
                       el.getAttribute(`data-src-${tierData?.id}`) ||
                       (highResSuffix ? el.getAttribute(`data-src${highResSuffix}`) : null) ||
                       el.getAttribute('data-src-default') ||
                       el.getAttribute('src');

        if (newSrc && el.src !== newSrc) {
            this.#applySourceWithTransition(el, newSrc);
        }

        if (el.tagName === 'VIDEO') {
            if (tier === 'eco') {
                el.pause();
                $styleVar(el, 'opacity', '0.3');
            } else {
                $styleVar(el, 'opacity', '1');
                el.play().catch(() => {});
            }
        }
    }

    #applySourceWithTransition(el, src) {
        if (el.tagName === 'IMG') {
            $styleVar(el, 'filter', 'blur(10px)');
            $styleVar(el, 'opacity', '0.7');
            $styleVar(el, 'transition', 'filter 0.4s ease, opacity 0.4s ease');

            const tempImg = new Image();
            tempImg.onload = () => {
                el.src = src;
                $styleVar(el, 'filter', 'none');
                $styleVar(el, 'opacity', '1');
            };
            tempImg.src = src;
        } else {
            el.src = src;
        }
    }

    /**
     * Re-procesa todos los elementos activos tras un cambio de perfil.
     */
    refreshActive() {
        this.activeElements.forEach(el => this.processElement(el));
    }

    /**
     * Limpieza completa de observadores y listeners para descarte de ciclo de vida.
     */
    destroy() {
        if (this.#modalOpenHandler) $offWindow('modal:opened', this.#modalOpenHandler);
        if (this.#layoutReadyHandler) $offWindow('kernel:layout-ready', this.#layoutReadyHandler);
        if (this.#scanGraphicsHandler) $offWindow('ui:scan_graphics', this.#scanGraphicsHandler);

        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }

        this.activeElements.clear();
    }
}
