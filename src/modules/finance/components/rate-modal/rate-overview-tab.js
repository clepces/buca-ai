/**
 * @fileoverview rate-overview-tab - Pestaña 1: Resumen de Divisas (USD, EUR, USDT) y Tasa Operativa
 * @module modules/finance/components/rate-modal/rate-overview-tab
 */

export function renderRateOverviewTab({
    usdVal,
    eurVal,
    usdVar,
    eurVar,
    usdVarNum,
    eurVarNum,
    bcvDate,
    bcvData,
    usdtBuy,
    usdtSell,
    usdtAvg,
    formatMoney,
    lastUpdate
}) {
    return `
        <div class="rate-tab-content active" id="tab-rate-overview">
            <div class="currency-cards-grid mb-3">
                <div class="currency-card-hero card--usd">
                    <div class="card-currency-header">
                        <div class="currency-title">
                            <span class="flag-icon"><i class="bi bi-currency-dollar text-success"></i></span>
                            <span>USD BCV (Dólar)</span>
                        </div>
                        <div class="info-popover-trigger">
                            ?
                            <div class="info-popover-tooltip">
                                <strong>Dólar BCV Oficial</strong><br>
                                Cotización oficial publicada por el Banco Central de Venezuela.
                            </div>
                        </div>
                    </div>
                    <div class="rate-value-large">
                        Bs. ${formatMoney(usdVal)}
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="badge ${usdVarNum >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill x-small fw-bold">
                            <i class="bi bi-caret-${usdVarNum >= 0 ? 'up' : 'down'}-fill"></i> ${usdVarNum >= 0 ? '+' : ''}${usdVar}%
                        </span>
                        <span class="text-muted rate-micro-date"><i class="bi bi-calendar3 me-1"></i>${bcvDate}</span>
                    </div>
                    <div class="card-meta-row">
                        <span>Anterior: Bs. ${formatMoney(bcvData?.previous?.usd || (usdVal * 0.994))}</span>
                        <button class="btn btn-link btn-sm p-0 x-small text-primary text-decoration-none fw-bold" id="btn-anchor-usd">
                            <i class="bi bi-pin-angle-fill me-1"></i>Anclar ERP
                        </button>
                    </div>
                </div>

                <div class="currency-card-hero card--eur">
                    <div class="card-currency-header">
                        <div class="currency-title">
                            <span class="flag-icon"><i class="bi bi-currency-euro text-purple"></i></span>
                            <span>EUR BCV (Euro)</span>
                        </div>
                        <div class="info-popover-trigger">
                            ?
                            <div class="info-popover-tooltip">
                                <strong>Euro BCV Oficial</strong><br>
                                Cotización del Euro para transacciones comerciales e importaciones.
                            </div>
                        </div>
                    </div>
                    <div class="rate-value-large">
                        Bs. ${formatMoney(eurVal)}
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="badge ${eurVarNum >= 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} rounded-pill x-small fw-bold">
                            <i class="bi bi-caret-${eurVarNum >= 0 ? 'up' : 'down'}-fill"></i> ${eurVarNum >= 0 ? '+' : ''}${eurVar}%
                        </span>
                        <span class="text-muted rate-micro-date"><i class="bi bi-calendar3 me-1"></i>${bcvDate}</span>
                    </div>
                    <div class="card-meta-row">
                        <span>Anterior: Bs. ${formatMoney(bcvData?.previous?.eur || (eurVal * 0.998))}</span>
                        <button class="btn btn-link btn-sm p-0 x-small text-primary text-decoration-none fw-bold" id="btn-anchor-eur">
                            <i class="bi bi-pin-angle-fill me-1"></i>Anclar ERP
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal-setting-card mb-3 p-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="card-title-group mb-0">
                        <i class="bi bi-currency-bitcoin text-warning fs-5"></i>
                        <div>
                            <h5 class="mb-0">USDT Binance P2P</h5>
                            <span class="text-muted rate-micro-date">Mercado Digital & Criptoactivo Anclado</span>
                        </div>
                    </div>
                    <span class="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill x-small">
                        <i class="bi bi-key-fill me-1"></i>API Autenticada
                    </span>
                </div>

                <div class="row g-2 text-center my-2">
                    <div class="col-4">
                        <div class="p-2 rounded-3 bg-light border">
                            <span class="text-muted d-block rate-p2p-label">COMPRA P2P</span>
                            <strong class="text-success rate-p2p-value">Bs. ${formatMoney(usdtBuy)}</strong>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 rounded-3 bg-light border">
                            <span class="text-muted d-block rate-p2p-label">VENTA P2P</span>
                            <strong class="text-danger rate-p2p-value">Bs. ${formatMoney(usdtSell)}</strong>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 rounded-3 bg-primary-subtle border border-primary-subtle">
                            <span class="text-primary d-block fw-bold rate-p2p-label">PROMEDIO</span>
                            <strong class="text-primary rate-p2p-value">Bs. ${formatMoney(usdtAvg)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-setting-card p-3">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="card-title-group mb-0">
                        <i class="bi bi-sliders text-primary"></i>
                        <h5>Tasa de Referencia Operativa (ERP)</h5>
                    </div>
                </div>
                <div class="glass-input-premium mb-2">
                    <div class="input-icon-group">
                        <i class="bi bi-currency-dollar symbol-usd"></i>
                        <i class="bi bi-arrow-left-right divider"></i>
                        <i class="bi bi-currency-exchange symbol-bs"></i>
                    </div>
                    <input type="number" step="any" id="manual-rate-input" class="premium-input-field" value="${usdVal}" placeholder="0.00">
                    <button type="button" class="btn-sync-api" id="btn-sync-api" title="Consultar API">
                        <i class="bi bi-cloud-arrow-down-fill"></i>
                    </button>
                </div>
                <div class="d-flex align-items-center justify-content-between text-muted rate-micro-date">
                    <span><i class="bi bi-clock-history me-1"></i>Sincronizado: ${lastUpdate}</span>
                    <div id="sync-spinner" class="spinner-border spinner-border-sm text-primary d-none" role="status"></div>
                </div>
            </div>
        </div>
    `;
}
