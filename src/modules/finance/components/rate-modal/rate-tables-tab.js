/**
 * @fileoverview rate-tables-tab - Pestañas 3 y 4: Tablas de Intervenciones Cambiarias e Historial de Tasas
 * @module modules/finance/components/rate-modal/rate-tables-tab
 */

export function renderRateInterventionsTab({
    lastIntervention,
    paginatedInterventions,
    interventionsSafePage,
    interventionsTotalPages,
    usdVal,
    formatMoney
}) {
    return `
        <div class="rate-tab-content" id="tab-rate-interventions">
            <div class="modal-setting-card mb-3 p-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="card-title-group mb-0">
                        <i class="bi bi-bank2 text-primary fs-5"></i>
                        <div>
                            <h5 class="mb-0">Última Intervención Cambiaria BCV</h5>
                        </div>
                    </div>
                </div>
                <div class="p-3 rounded-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center justify-content-between">
                    <div>
                        <span class="badge bg-primary rounded-pill mb-1">${lastIntervention.id || 'BCV INT'}</span>
                        <div class="fw-bold text-main intervention-val-hero">${lastIntervention.usdAmount || 'Divisas Inyectadas'}</div>
                        <span class="text-muted rate-micro-date"><i class="bi bi-calendar-event me-1"></i>Fecha: ${lastIntervention.date}</span>
                    </div>
                    <div class="text-end">
                        <span class="text-muted d-block rate-p2p-label">TASA DE COLOCACIÓN</span>
                        <strong class="text-primary fs-5">Bs. ${formatMoney(lastIntervention.rate || usdVal)}</strong>
                    </div>
                </div>
            </div>

            <div class="modal-setting-card p-3">
                <div class="glass-history-table">
                    <div class="history-table-row header">
                        <div class="h-col">ID / Código</div>
                        <div class="h-col">Fecha</div>
                        <div class="h-col">Monto Inyectado</div>
                        <div class="h-col text-end">Tasa BCV</div>
                    </div>
                    ${paginatedInterventions.map(item => `
                        <div class="history-table-row">
                            <div class="h-col fw-bold text-primary">${item.id || 'BCV'}</div>
                            <div class="h-col text-muted">${item.date}</div>
                            <div class="h-col font-monospace fw-semibold">${item.usdAmount || 'Inyección'}</div>
                            <div class="h-col text-end fw-bold">Bs. ${formatMoney(item.rate)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="d-flex align-items-center justify-content-between mt-3 px-1">
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 btn-interventions-prev" ${interventionsSafePage <= 1 ? 'disabled' : ''}>
                        <i class="bi bi-chevron-left me-1"></i> Anterior
                    </button>
                    <span class="small text-muted fw-bold">Página <span class="text-primary">${interventionsSafePage}</span> de ${interventionsTotalPages}</span>
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 btn-interventions-next" ${interventionsSafePage >= interventionsTotalPages ? 'disabled' : ''}>
                        Siguiente <i class="bi bi-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function renderRateHistoryTab({
    paginatedHistory,
    historySafePage,
    historyTotalPages,
    usdVal,
    formatMoney
}) {
    return `
        <div class="rate-tab-content" id="tab-rate-history">
            <div class="modal-setting-card p-3">
                <div class="glass-history-table">
                    <div class="history-table-row header">
                        <div class="h-col">Fecha</div>
                        <div class="h-col">Dólar (USD)</div>
                        <div class="h-col">Euro (EUR)</div>
                        <div class="h-col text-end">Var. %</div>
                    </div>
                    ${paginatedHistory.map(item => `
                        <div class="history-table-row">
                            <div class="h-col fw-semibold">${item.date}</div>
                            <div class="h-col font-monospace fw-bold text-success">Bs. ${item.usd ? formatMoney(item.usd) : formatMoney(item.rate)}</div>
                            <div class="h-col font-monospace fw-bold text-purple">Bs. ${item.eur ? formatMoney(item.eur) : formatMoney((Number(item.rate) || usdVal) * 1.114)}</div>
                            <div class="h-col text-end ${item.calculatedVariation >= 0 ? 'text-success' : 'text-danger'} fw-bold">
                                ${item.calculatedVariation >= 0 ? '+' : ''}${item.calculatedVariation}% 
                                <i class="bi bi-caret-${item.calculatedVariation >= 0 ? 'up' : 'down'}-fill"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="d-flex align-items-center justify-content-between mt-3 px-1">
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 btn-history-prev" ${historySafePage <= 1 ? 'disabled' : ''}>
                        <i class="bi bi-chevron-left me-1"></i> Anterior
                    </button>
                    <span class="small text-muted fw-bold">Página <span class="text-primary">${historySafePage}</span> de ${historyTotalPages}</span>
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 btn-history-next" ${historySafePage >= historyTotalPages ? 'disabled' : ''}>
                        Siguiente <i class="bi bi-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}
