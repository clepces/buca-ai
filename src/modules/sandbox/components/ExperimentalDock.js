/**
 * @fileoverview ExperimentalDock - Implementación del Dock Magnético (Física Fluida)
 */
import { Haptics } from '@/shared/utils/haptics.js';
import { $id, $, $$, $on, $styleVar } from '@/shared/utils/dom.js';
import { $onWindow, $offWindow } from '@/core/utils/system-helper.js';

export class ExperimentalDock {
    constructor() {
        this.items = [
            { id: 'módulos', icon: 'bi-grid-fill', tip: 'Explorar Módulos' },
            { id: 'unidades', icon: 'bi-layers-fill', tip: 'Gestión de Unidades' },
            { id: 'inicio', icon: 'bi-house-door-fill', tip: 'Panel Principal' },
            { id: 'personal', icon: 'bi-people-fill', tip: 'Recursos Humanos' },
            { id: 'ajustes', icon: 'bi-gear-fill', tip: 'Preferencias' }
        ];
        this.maxScale = 1.6; // Reducido un poco para mayor elegancia
        this.range = 160; // Rango de influencia aumentado
        this.baseWidth = 52;
        this.lastHoveredIndex = -1;
    }

    render() {
        return `
            <div class="dock-experimental-outer">
                <div class="dock-experimental-container" id="dock-experimental">
                    ${this.items.map((item, index) => `
                        <div class="dock-exp-item" data-index="${index}" data-tip="${item.tip}">
                            <div class="dock-exp-icon-wrapper">
                                <i class="bi ${item.icon}"></i>
                            </div>
                            <span class="exp-tooltip">${item.tip}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    init() {
        const dock = $id('dock-experimental');
        if (!dock) return;

        this.dockElements = $$('.dock-exp-item', dock);

        this._onMouseMove = (e) => this.handleMouseMove(e);
        $onWindow('mousemove', this._onMouseMove);
        
        $on(dock, 'mouseleave', () => {
            this.resetScales();
            this.lastHoveredIndex = -1;
        });
        
        // Animación inicial
        this.resetScales();
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        let closestIndex = -1;
        let minDistance = Infinity;

        this.dockElements.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(mouseX - centerX, 2) + 
                Math.pow(mouseY - centerY, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }

            if (distance < this.range) {
                // Curva de Bell (Gaussian) para escalado ultra-fluido
                const power = Math.exp(-Math.pow(distance / (this.range * 0.6), 2));
                const scale = 1 + (this.maxScale - 1) * power;
                
                $styleVar(item, '--scale', scale);
                
                // Efecto de expansión lateral dinámica
                const widthOffset = (scale - 1) * 24;
                $styleVar(item, 'width', `${this.baseWidth + widthOffset}px`);
                
                // Opacidad del tooltip basada en proximidad
                const tip = $('.exp-tooltip', item);
                if (tip) {
                    $styleVar(tip, 'opacity', power > 0.8 ? '1' : '0');
                    $styleVar(tip, 'transform', `translateY(-${10 + power * 10}px) scale(${0.8 + power * 0.2})`);
                }
            } else {
                $styleVar(item, '--scale', 1);
                $styleVar(item, 'width', `${this.baseWidth}px`);
                const tip = $('.exp-tooltip', item);
                if (tip) $styleVar(tip, 'opacity', '0');
            }
        });

        // Feedback haptico/auditivo al cambiar de icono enfocado
        if (minDistance < 60 && closestIndex !== this.lastHoveredIndex) {
            this.lastHoveredIndex = closestIndex;
            Haptics.vibrate(5);
            Haptics.click();
        }
    }

    resetScales() {
        this.dockElements.forEach(item => {
            $styleVar(item, '--scale', 1);
            $styleVar(item, 'width', `${this.baseWidth}px`);
            $styleVar(item, 'transition', 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)');
            const tip = $('.exp-tooltip', item);
            if (tip) $styleVar(tip, 'opacity', '0');
        });
        
        setTimeout(() => {
            this.dockElements.forEach(item => {
                $styleVar(item, 'transition', 'width 0.15s ease-out, transform 0.1s ease-out');
            });
        }, 400);
    }

    destroy() {
        $offWindow('mousemove', this._onMouseMove);
    }
}
