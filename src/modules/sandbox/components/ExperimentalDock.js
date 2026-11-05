/**
 * @fileoverview ExperimentalDock - Implementación del Dock Magnético (Física Fluida)
 */
import { Haptics } from '@/shared/utils/haptics.js';

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
        const dock = document.getElementById('dock-experimental');
        if (!dock) return;

        this.dockElements = Array.from(dock.querySelectorAll('.dock-exp-item'));

        this._onMouseMove = (e) => this.handleMouseMove(e);
        window.addEventListener('mousemove', this._onMouseMove);
        
        dock.addEventListener('mouseleave', () => {
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
                
                item.style.setProperty('--scale', scale);
                
                // Efecto de expansión lateral dinámica
                const widthOffset = (scale - 1) * 24;
                item.style.width = `${this.baseWidth + widthOffset}px`;
                
                // Opacidad del tooltip basada en proximidad
                const tip = item.querySelector('.exp-tooltip');
                if (tip) {
                    tip.style.opacity = power > 0.8 ? '1' : '0';
                    tip.style.transform = `translateY(-${10 + power * 10}px) scale(${0.8 + power * 0.2})`;
                }
            } else {
                item.style.setProperty('--scale', 1);
                item.style.width = `${this.baseWidth}px`;
                const tip = item.querySelector('.exp-tooltip');
                if (tip) tip.style.opacity = '0';
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
            item.style.setProperty('--scale', 1);
            item.style.width = `${this.baseWidth}px`;
            item.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            const tip = item.querySelector('.exp-tooltip');
            if (tip) tip.style.opacity = '0';
        });
        
        setTimeout(() => {
            this.dockElements.forEach(item => {
                item.style.transition = 'width 0.15s ease-out, transform 0.1s ease-out';
            });
        }, 400);
    }

    destroy() {
        window.removeEventListener('mousemove', this._onMouseMove);
    }
}
