/**
 * @fileoverview rate-calculator-tab - Pestaña 2: Calculadora y conversor multidivisa en tiempo real
 * @module modules/finance/components/rate-modal/rate-calculator-tab
 */

export function renderRateCalculatorTab({ usdVal, eurVal, usdtAvg, formatMoney }) {
    return `
        <div class="rate-tab-content" id="tab-rate-calculator">
            <div class="calculator-widget-box">
                <div class="d-flex align-items-center justify-content-between mb-3">
                    <div class="card-title-group mb-0">
                        <i class="bi bi-calculator text-primary fs-5"></i>
                        <h5 class="mb-0">Calculadora & Conversor Multidivisa</h5>
                    </div>
                </div>
                <div class="calc-input-group">
                    <div class="flex-grow-1">
                        <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Monto a Convertir</label>
                        <input type="number" step="any" id="calc-amount-input" class="form-control glass-input fw-bold fs-5" value="100" placeholder="Ingrese monto">
                    </div>
                    <div class="calc-currency-selector">
                        <label class="form-label x-small fw-bold text-muted text-uppercase mb-1">Moneda Origen</label>
                        <select id="calc-currency-select" class="form-select glass-input fw-bold">
                            <option value="USD" selected>USD ($)</option>
                            <option value="VES">VES (Bs.)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="USDT">USDT (₮)</option>
                        </select>
                    </div>
                </div>
                <div class="row g-2 mb-3">
                    <div class="col"><button type="button" class="btn btn-outline-secondary w-100 rounded-3 btn-calc-preset py-2 fw-bold" data-val="10">$10</button></div>
                    <div class="col"><button type="button" class="btn btn-outline-secondary w-100 rounded-3 btn-calc-preset py-2 fw-bold" data-val="50">$50</button></div>
                    <div class="col"><button type="button" class="btn btn-outline-secondary w-100 rounded-3 btn-calc-preset py-2 fw-bold" data-val="100">$100</button></div>
                    <div class="col"><button type="button" class="btn btn-outline-secondary w-100 rounded-3 btn-calc-preset py-2 fw-bold" data-val="500">$500</button></div>
                    <div class="col"><button type="button" class="btn btn-outline-secondary w-100 rounded-3 btn-calc-preset py-2 fw-bold" data-val="1000">1.000</button></div>
                </div>
                <div class="d-flex flex-column gap-2" id="calc-results-container">
                    <div class="calc-result-card">
                        <span class="fw-bold small text-muted"><i class="bi bi-currency-exchange me-1 text-primary"></i> Bolívares (VES BCV)</span>
                        <strong class="fs-5 text-primary font-monospace" id="res-ves">Bs. ${formatMoney(100 * usdVal)}</strong>
                    </div>
                    <div class="calc-result-card">
                        <span class="fw-bold small text-muted"><i class="bi bi-currency-dollar me-1 text-success"></i> Dólares (USD BCV)</span>
                        <strong class="fs-5 text-success font-monospace" id="res-usd">$ 100.00</strong>
                    </div>
                    <div class="calc-result-card">
                        <span class="fw-bold small text-muted"><i class="bi bi-currency-euro me-1 text-purple"></i> Euros (EUR BCV)</span>
                        <strong class="fs-5 text-purple font-monospace" id="res-eur">€ ${formatMoney((100 * usdVal) / eurVal)}</strong>
                    </div>
                    <div class="calc-result-card">
                        <span class="fw-bold small text-muted"><i class="bi bi-currency-bitcoin me-1 text-warning"></i> USDT Binance P2P</span>
                        <strong class="fs-5 text-warning font-monospace" id="res-usdt">₮ ${formatMoney((100 * usdVal) / usdtAvg)}</strong>
                    </div>
                </div>
            </div>
        </div>
    `;
}
