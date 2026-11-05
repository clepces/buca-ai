/**
 * @fileoverview PerformanceGuards - Componente para visualizar el estado de las protecciones BNE
 * @module shared/ui/components/performance/PerformanceGuards
 */

export const PerformanceGuards = {
    render(isManual = false, stress = 0) {
        const guards = [
            { id: 'memory', label: 'Memoria Heap', icon: 'bi-cpu', stress: 85, base: 'PROTEGIDO' },
            { id: 'reflow', label: 'Reflow DOM', icon: 'bi-stack', stress: 70, base: 'OPTIMIZADO' },
            { id: 'ghost', label: 'Sanitizador', icon: 'bi-shield-check', stress: 90, base: 'SEGURO' },
            { id: 'drp', label: 'Limitador FPS', icon: 'bi-speedometer2', stress: 60, base: 'ESTABLE' }
        ];

        const globalText = isManual ? 'SISTEMA MANUAL' : (stress > 80 ? 'BAJO ESTRÉS' : 'SISTEMA ACTIVO');
        const globalClass = isManual ? 'warning' : (stress > 80 ? 'danger' : 'active');

        return `
            <div class="perf-section-card guards-module">
                <div class="section-header d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-shield-lock-fill text-primary guard-header-icon"></i>
                        <div>
                            <h4 class="mb-0 fs-6 fw-bold">BNE Security Guards</h4>
                            <span class="guard-status-summary ${isManual ? 'text-warning' : 'text-success'}">
                                ${isManual ? 'Protecciones en Modo Manual' : 'Heap / Reflow / Sanitizador / Limitador FPS'}
                            </span>
                        </div>
                    </div>
                    <span class="badge-status-premium status-${globalClass}" id="guard-global-status">
                        <i class="bi bi-shield-${globalClass === 'active' ? 'check' : 'exclamation'}"></i> ${globalText}
                    </span>
                </div>
                
                <div class="guards-grid">
                    ${guards.map(g => {
        let text = g.base;
        let color = 'text-success';
        if (isManual) { text = 'DESACTIVADO'; color = 'text-warning'; }
        else if (stress > g.stress) { text = 'LIMITADO'; color = 'text-danger'; }

        return `
                            <div class="guard-pill" id="guard-${g.id}">
                                <div class="guard-icon"><i class="bi ${g.icon}"></i></div>
                                <div class="guard-info">
                                    <span class="guard-label">${g.label}</span>
                                    <span class="guard-status ${color}">${text}</span>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        `;
    }
};

export default PerformanceGuards;
