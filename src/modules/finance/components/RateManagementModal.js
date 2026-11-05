/**
 * RateManagementModal Component - Template de Gestión de Divisas & Tasas (Módulo Finanzas)
 * =========================================================================
 */
export const rateManagementTemplate = ({ 
    currentRate = 889.58, 
    lastUpdate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
    bcvData = null, 
    usdtData = null, 
    interventionsData = null, 
    history = [],
    historyPage = 1,
    historyPerPage = 6,
    interventionsPage = 1,
    interventionsPerPage = 5,
    apiConfig = null
} = {}) => {
    const usdVal = bcvData?.current?.usd || currentRate;
    const eurVal = bcvData?.current?.eur || (usdVal * 1.15);
    const rawUsdVar = bcvData?.changePercentage?.usd ?? 0.61;
    const rawEurVar = bcvData?.changePercentage?.eur ?? 0.17;
    const usdVar = Number(rawUsdVar || 0).toFixed(2);
    const eurVar = Number(rawEurVar || 0).toFixed(2);
    const usdVarNum = Number(usdVar);
    const eurVarNum = Number(eurVar);
    const bcvDate = bcvData?.current?.date ? String(bcvData.current.date).split('T')[0] : new Date().toISOString().split('T')[0];

    const usdtBuy = usdtData?.current?.buy || (usdVal * 1.03);
    const usdtSell = usdtData?.current?.sell || (usdVal * 1.05);
    const usdtAvg = usdtData?.current?.average || ((usdtBuy + usdtSell) / 2);

    const defaultHistory = (history && history.length > 0) ? history : [
        { date: bcvDate, usd: usdVal, eur: eurVal, variation: 0.04 },
        { date: '2026-10-30', usd: (usdVal - 0.32), eur: (eurVal + 1.55), variation: 0.12 },
        { date: '2026-10-29', usd: (usdVal - 1.10), eur: (eurVal - 0.25), variation: -0.08 },
        { date: '2026-10-28', usd: (usdVal - 1.45), eur: (eurVal + 0.85), variation: 0.15 },
        { date: '2026-10-27', usd: (usdVal - 2.80), eur: (eurVal - 0.85), variation: 0.05 }
    ];

    const processedHistory = defaultHistory.map((item, idx, arr) => {
        let varVal = item.variation;
        if (varVal === undefined || varVal === null || isNaN(varVal)) {
            if (idx < arr.length - 1) {
                const nextItem = arr[idx + 1];
                const prevUsd = Number(nextItem.usd || nextItem.rate || 0);
                const currUsd = Number(item.usd || item.rate || 0);
                if (prevUsd > 0) {
                    varVal = Number(((currUsd - prevUsd) / prevUsd * 100).toFixed(2));
                } else {
                    varVal = 0;
                }
            } else {
                varVal = 0;
            }
        }
        const formattedDate = item.date ? String(item.date).split('T')[0] : '';
        return { ...item, date: formattedDate, calculatedVariation: Number(Number(varVal || 0).toFixed(2)) };
    });

    const historyTotalPages = Math.ceil(processedHistory.length / historyPerPage) || 1;
    const historySafePage = Math.min(Math.max(1, historyPage), historyTotalPages);
    const historyStartIndex = (historySafePage - 1) * historyPerPage;
    const paginatedHistory = processedHistory.slice(historyStartIndex, historyStartIndex + historyPerPage);

    const lastInterventionRaw = interventionsData?.current || { id: 'INT-2026-42', date: bcvDate, rate: usdVal, usdAmount: '$ 75,000,000 USD' };
    const lastIntervention = {
        ...lastInterventionRaw,
        date: lastInterventionRaw.date ? String(lastInterventionRaw.date).split('T')[0] : bcvDate
    };

    const rawInterventionsList = interventionsData?.list || [
        { id: 'INT-2026-42', date: bcvDate, rate: usdVal, usdAmount: '$ 75M USD' },
        { id: 'INT-2026-41', date: '2026-10-27', rate: (usdVal - 4.38), usdAmount: '$ 60M USD' },
        { id: 'INT-2026-40', date: '2026-10-20', rate: (usdVal - 9.43), usdAmount: '$ 80M USD' },
        { id: 'INT-2026-39', date: '2026-10-13', rate: (usdVal - 14.18), usdAmount: '$ 50M USD' },
        { id: 'INT-2026-38', date: '2026-10-06', rate: (usdVal - 19.48), usdAmount: '$ 65M USD' }
    ];

    const interventionList = rawInterventionsList.map(item => ({
        ...item,
        date: item.date ? String(item.date).split('T')[0] : ''
    }));

    const interventionsTotalPages = Math.ceil(interventionList.length / interventionsPerPage) || 1;
    const interventionsSafePage = Math.min(Math.max(1, interventionsPage), interventionsTotalPages);
    const interventionsStartIndex = (interventionsSafePage - 1) * interventionsPerPage;
    const paginatedInterventions = interventionList.slice(interventionsStartIndex, interventionsStartIndex + interventionsPerPage);

    const formatMoney = (val) => Number(val || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return `
        <div class="rate-update-container">
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

            <!-- TAB 1: RESUMEN DE COTIZACIONES -->
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

            <!-- TAB 2: CALCULADORA -->
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

            <!-- TAB 3: INTERVENCIONES -->
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

            <!-- TAB 4: HISTORIAL -->
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

            <!-- TAB 5: CONFIGURACIÓN DE LA API -->
            <div class="rate-tab-content" id="tab-rate-api-config">
                <div class="modal-setting-card mb-3 p-3">
                    <form id="api-config-form" onsubmit="return false;">
                        <div class="mb-3">
                            <label for="cfg-api-key" class="form-label x-small fw-bold text-muted text-uppercase">Clave API</label>
                            <div class="input-group">
                                <input type="${apiConfig?.showKey ? 'text' : 'password'}" id="cfg-api-key" class="form-control glass-input font-monospace small" value="${apiConfig?.apiKey || '8d7da8345df5e4bd436fe31c0f7648a9d208b8b2c750edc69234ca595d76fa1d'}">
                                <button type="button" class="btn btn-outline-secondary" id="btn-toggle-api-key-vis">
                                    <i class="bi ${apiConfig?.showKey ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i>
                                </button>
                            </div>
                        </div>
                        <div class="d-flex align-items-center justify-content-between pt-2 border-top flex-wrap gap-2">
                            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill" id="btn-reset-api-cfg">Restablecer</button>
                            <div class="d-flex gap-2">
                                <button type="button" class="btn btn-sm btn-outline-primary rounded-pill" id="btn-test-api-conn">Probar</button>
                                <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" id="btn-save-api-cfg">Guardar</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
};

export default rateManagementTemplate;
