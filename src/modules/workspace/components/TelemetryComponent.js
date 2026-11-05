/**
 * TelemetryComponent - Franja de Telemetría Operativa (Refactorizada)
 * =========================================================================
 * Refactorización Phase 5: Delegación de eventos robusta y diseño Zero-Pill.
 * =========================================================================
 */
import { eventBus } from '@/core/eventBus/index.js';

export const TelemetryComponent = {
    _metrics: [
        {
            id: 'currency_usd',
            title: 'Dólar Oficial BCV',
            icon: 'bi-currency-dollar',
            flag: '🇻🇪',
            color: '#2563eb',
            activeIdx: 0,
            variants: [
                { label: 'Tasa Oficial BCV', value: 'Bs. 889,58', trend: 'up', trendText: '+0.12%', sub: 'Banco Central • 1:00 PM' },
                { label: 'Histórico 7 Días', value: 'Bs. 881,20', trend: 'up', trendText: '+0.95%', sub: 'Promedio Ponderado' },
                { label: 'Proyección Cierre', value: 'Bs. 892,10', trend: 'stable', trendText: 'Estable', sub: 'Modelo Predictivo' }
            ]
        },
        {
            id: 'currency_eur',
            title: 'Euro Oficial BCV',
            icon: 'bi-currency-euro',
            flag: '🇪🇺',
            color: '#4f46e5',
            activeIdx: 0,
            variants: [
                { label: 'Tasa Euro BCV', value: 'Bs. 968,45', trend: 'up', trendText: '+0.08%', sub: 'Fijación Oficial SENIAT' },
                { label: 'Paridad EUR / USD', value: '1.0885', trend: 'stable', trendText: 'Paridad OK', sub: 'Mercado Forex Global' },
                { label: 'Cierre Anterior', value: 'Bs. 965,10', trend: 'down', trendText: '-0.15%', sub: 'Mes Anterior' }
            ]
        },
        {
            id: 'crypto_usdt',
            title: 'Binance P2P USDT',
            icon: 'bi-coin',
            flag: '🟡',
            color: '#d97706',
            activeIdx: 0,
            variants: [
                { label: 'USDT / Bolívares', value: 'Bs. 1.025,50', trend: 'down', trendText: '-0.35%', sub: 'P2P Comercial Venezuela' },
                { label: 'Spread vs BCV', value: '+15.2%', trend: 'up', trendText: 'Diferencial', sub: 'Brecha Paralelo / Oficial' },
                { label: 'Volumen 24 Horas', value: '$ 245.800', trend: 'up', trendText: 'Alta Liquidez', sub: 'Transacciones Verificadas' }
            ]
        },
        {
            id: 'pos_sales',
            title: 'Ventas y Caja POS',
            icon: 'bi-cash-coin',
            flag: '💳',
            color: '#059669',
            activeIdx: 0,
            variants: [
                { label: 'Facturación Hoy', value: 'Bs. 42.500', trend: 'up', trendText: '+14.2%', sub: '~$47.50 USD • 28 Facturas' },
                { label: 'Ticket Promedio', value: 'Bs. 1.517', trend: 'up', trendText: '+5.1%', sub: '12 Clientes Recurrentes' },
                { label: 'Cuadre de Cajas', value: '100% Cuadrado', trend: 'stable', trendText: 'Sin Mermas', sub: 'Auditoría al Cierre' }
            ]
        }
    ],

    render() {
        return `
            <div class="ws-telemetry-strip" id="telemetry-strip">
                <div class="row g-3">
                    ${this._metrics.map((m, i) => this.renderMetricCard(m, i)).join('')}
                </div>
            </div>
        `;
    },

    renderMetricCard(metric, index) {
        const v = metric.variants[metric.activeIdx];
        const trendIcon = v.trend === 'up' ? 'bi-graph-up-arrow' : (v.trend === 'down' ? 'bi-graph-down-arrow' : 'bi-dash');
        const trendClass = v.trend === 'up' ? 'bg-success-subtle text-success' : (v.trend === 'down' ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-muted');

        return `
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="glass-surface p-3 p-md-3.5 rounded-4 border-glass shadow-sm position-relative overflow-hidden h-100 tel-card-premium transition-all shadow-2xs-hover" style="border-color: rgba(255,255,255,0.2) !important;">
                    <div class="d-flex justify-content-between align-items-center mb-2.5">
                        <div class="d-flex align-items-center gap-2">
                            <div class="rounded-3 d-flex align-items-center justify-content-center shadow-2xs" style="width: 36px; height: 36px; background: ${metric.color}; color: #fff;">
                                <i class="bi ${metric.icon} fs-6"></i>
                            </div>
                            <div>
                                <span class="d-block fw-bold text-main small" style="line-height: 1.1;">
                                    ${metric.flag} ${metric.title}
                                </span>
                                <span class="x-small text-muted">${v.sub || 'Indicador En Vivo'}</span>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-1">
                            <span class="badge rounded-pill ${trendClass} px-2 py-0.5 x-small fw-bold">
                                <i class="bi ${trendIcon} me-0.5"></i> ${v.trendText || ''}
                            </span>
                            <button type="button" class="btn-tel-overflow btn btn-link p-0 text-muted ms-1" data-action="telemetry:open_menu" data-index="${index}" title="Ver Análisis">
                                <i class="bi bi-three-dots-vertical"></i>
                            </button>
                        </div>
                    </div>

                    <div class="tel-content-carousel bg-white-5 p-2.5 rounded-3 border border-secondary border-opacity-10 my-2">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-muted fw-bold text-uppercase x-small ls-1">${v.label}</span>
                            <div class="tel-nav-arrows d-flex gap-1">
                                <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1.5 rounded-2 tel-nav-btn" data-dir="prev" data-index="${index}" style="font-size: 0.7rem;"><i class="bi bi-chevron-left"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-1.5 rounded-2 tel-nav-btn" data-dir="next" data-index="${index}" style="font-size: 0.7rem;"><i class="bi bi-chevron-right"></i></button>
                            </div>
                        </div>
                        <div class="d-flex align-items-baseline justify-content-between gap-2 mt-1">
                            <h4 class="mb-0 fw-bold text-main h5">${v.value}</h4>
                            <span class="x-small text-primary fw-semibold clickable" data-action="${metric.id.startsWith('currency') ? 'ui:open_rate' : 'ui:enter_business'}">
                                ${metric.id.startsWith('currency') ? 'Ajustar Tasa <i class="bi bi-arrow-up-right"></i>' : 'Ver Detalles <i class="bi bi-arrow-right"></i>'}
                            </span>
                        </div>
                    </div>

                    <div class="tel-dots-indicator d-flex justify-content-center gap-1.5 mt-2">
                        ${metric.variants.map((_, vi) => `
                            <span class="dot ${vi === metric.activeIdx ? 'active' : ''}" style="width: ${vi === metric.activeIdx ? '16px' : '6px'}; height: 4px; border-radius: 99px; background: ${vi === metric.activeIdx ? 'var(--buca-blue, #2563eb)' : 'rgba(148, 163, 184, 0.3)'}; transition: all 0.25s;"></span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const strip = document.getElementById('telemetry-strip');
        if (!strip || strip._bucaInit) return;
        strip._bucaInit = true;

        strip.addEventListener('click', async (e) => {
            const navBtn = e.target.closest('.tel-nav-btn');
            if (navBtn) {
                const idx = parseInt(navBtn.dataset.index);
                const dir = navBtn.dataset.dir;
                this.cycleMetric(idx, dir);
                return;
            }

            const overflowBtn = e.target.closest('.btn-tel-overflow');
            if (overflowBtn) {
                const idx = parseInt(overflowBtn.dataset.index);
                const metric = this._metrics[idx];
                
                if (metric.id.startsWith('currency')) {
                    eventBus.emit('ui:open_rate');
                } else {
                    const { ModalTemplates } = await import('@/shared/ui/templates/ModalTemplates.js');
                    ModalService.showModal({
                        size: 'md',
                        header: ModalTemplates.buildHeader({
                            icon: metric.icon,
                            title: metric.title,
                            subtitle: 'INDICADOR OPERATIVO'
                        }),
                        body: `
                            <div class="p-3 text-center">
                                <div class="rounded-circle p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center shadow-sm" style="width: 56px; height: 56px; background: ${metric.color}; color: #fff;">
                                    <i class="bi ${metric.icon} fs-4"></i>
                                </div>
                                <h5 class="fw-bold mb-1">${metric.flag} ${metric.title}</h5>
                                <p class="text-muted small mb-3">Métrica en tiempo real sincronizada con el motor transaccional de BUCA.</p>
                                <div class="p-3 rounded-3 bg-light border text-start">
                                    <div class="d-flex justify-content-between mb-2">
                                        <span class="text-muted small">Valor Actual:</span>
                                        <strong class="text-primary">${metric.variants[metric.activeIdx].value}</strong>
                                    </div>
                                    <div class="d-flex justify-content-between">
                                        <span class="text-muted small">Detalle:</span>
                                        <span>${metric.variants[metric.activeIdx].sub}</span>
                                    </div>
                                </div>
                            </div>
                        `,
                        footer: {
                            right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Cerrar</button>'
                        }
                    });
                }
            }
        });
        
        eventBus.on('buca:rate_change', ({ rate }) => {
            const usd = this._metrics.find(m => m.id === 'currency_usd');
            const eur = this._metrics.find(m => m.id === 'currency_eur');
            const usdt = this._metrics.find(m => m.id === 'crypto_usdt');

            if (usd && rate) {
                usd.variants[0].value = `Bs. ${Number(rate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            if (eur && rate) {
                eur.variants[0].value = `Bs. ${(rate * 1.0885).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            if (usdt && rate) {
                usdt.variants[0].value = `Bs. ${(rate * 1.152).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            this.refresh();
        });
    },

    cycleMetric(index, direction) {
        const m = this._metrics[index];
        if (direction === 'next') {
            m.activeIdx = (m.activeIdx + 1) % m.variants.length;
        } else {
            m.activeIdx = (m.activeIdx - 1 + m.variants.length) % m.variants.length;
        }
        this.refresh();
    },

    refresh() {
        const slot = document.getElementById('telemetry-strip');
        if (slot) {
            slot.innerHTML = `
                <div class="row g-3">
                    ${this._metrics.map((m, i) => this.renderMetricCard(m, i)).join('')}
                </div>
            `;
        }
    }
};

export default TelemetryComponent;
