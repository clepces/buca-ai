/**
 * @fileoverview rate-tabs-nav - Barra de navegación de pestañas del modal de tasas
 * @module modules/finance/components/rate-modal/rate-tabs-nav
 */

export function renderRateTabsNav() {
    return `
        <div class="rate-modal-tabs mb-2" id="rate-tabs-nav">
            <button type="button" class="rate-tab-btn active" data-rate-tab="overview">
                <i class="bi bi-grid-1x2-fill"></i> Resumen Divisas
            </button>
            <button type="button" class="rate-tab-btn" data-rate-tab="calculator">
                <i class="bi bi-calculator-fill"></i> Conversor Live
            </button>
            <button type="button" class="rate-tab-btn" data-rate-tab="interventions">
                <i class="bi bi-bank2"></i> Intervenciones
            </button>
            <button type="button" class="rate-tab-btn" data-rate-tab="history">
                <i class="bi bi-graph-up-arrow"></i> Historial
            </button>
            <button type="button" class="rate-tab-btn" data-rate-tab="api-config">
                <i class="bi bi-gear-wide-connected text-warning"></i> Config. API
            </button>
        </div>
    `;
}
