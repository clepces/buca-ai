/**
 * @fileoverview PerformanceD3Dashboard - Visualizador de Métricas de Carga y Perfiles en Tiempo Real (D3.js)
 * @module modules/workspace/components/PerformanceD3Dashboard
 * @description Implementa un dashboard visual interactivo con D3.js para contrastar tiempos de carga históricos
 * vs. el perfil de rendimiento elegido (Eco, Equilibrado, Pro, Ultra).
 */

import * as d3 from 'd3';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import GraphicsEngine from '@/core/engine/engine.js';
import { eventBus } from '@/core/eventBus/index.js';

export class PerformanceD3Dashboard {
    static currentProfile = 'balanced';
    static chartContainerId = 'd3-perf-chart';

    static renderHTML(activeProfile = 'balanced') {
        const benchmarks = PerformanceStorage.getBenchmarkData();
        const current = benchmarks[activeProfile] || benchmarks.balanced;

        return `
            <div class="modal-setting-card perf-dashboard-wrapper mt-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="card-title-group mb-0">
                        <i class="bi bi-speedometer2 text-primary"></i>
                        <h5>Impacto de Rendimiento y Tiempos de Carga</h5>
                    </div>
                    <span class="engine-version-tag" id="perf-d3-active-tag">${current.tag}</span>
                </div>
                <p class="small text-muted mb-3">
                    Visualización interactiva generada con D3.js que compara el impacto de hardware y latencia de arranque según el perfil seleccionado.
                </p>

                <!-- Selector Interactivo de Perfiles (Eco, Balanced, Pro, Ultra) -->
                <div class="perf-profile-selector-capsule mb-3" id="perf-profile-pills">
                    <button type="button" class="perf-pill-btn ${activeProfile === 'eco' ? 'active' : ''}" data-profile="eco">
                        <i class="bi bi-lightning-charge-fill text-success"></i>
                        <span class="pill-name">L0 Eco</span>
                        <span class="pill-ms">~125ms</span>
                    </button>
                    <button type="button" class="perf-pill-btn ${activeProfile === 'balanced' ? 'active' : ''}" data-profile="balanced">
                        <i class="bi bi-shield-check text-primary"></i>
                        <span class="pill-name">L1 Equilibrado</span>
                        <span class="pill-ms">~240ms</span>
                    </button>
                    <button type="button" class="perf-pill-btn ${activeProfile === 'pro' ? 'active' : ''}" data-profile="pro">
                        <i class="bi bi-rocket-takeoff-fill text-purple"></i>
                        <span class="pill-name">L2 Pro</span>
                        <span class="pill-ms">~385ms</span>
                    </button>
                    <button type="button" class="perf-pill-btn ${activeProfile === 'ultra' ? 'active' : ''}" data-profile="ultra">
                        <i class="bi bi-stars text-pink"></i>
                        <span class="pill-name">L3 Ultra</span>
                        <span class="pill-ms">~580ms</span>
                    </button>
                </div>

                <!-- Tarjetas KPI de Impacto Dinámico -->
                <div class="perf-kpi-grid mb-3">
                    <div class="perf-kpi-card" id="kpi-load-time">
                        <div class="kpi-label">Tiempo de Arranque</div>
                        <div class="kpi-value text-primary" id="kpi-val-load">${current.avgLoadMs} <span class="unit">ms</span></div>
                        <div class="kpi-subtext" id="kpi-sub-load">
                            <span class="badge bg-success-subtle text-success" id="kpi-badge-load">${current.badgeText}</span>
                        </div>
                    </div>
                    <div class="perf-kpi-card" id="kpi-memory">
                        <div class="kpi-label">Huella en RAM</div>
                        <div class="kpi-value" id="kpi-val-ram">${current.ramMb} <span class="unit">MB</span></div>
                        <div class="kpi-subtext text-muted" id="kpi-sub-ram">Consumo estimado JS Heap</div>
                    </div>
                    <div class="perf-kpi-card" id="kpi-fps">
                        <div class="kpi-label">Objetivo de Fluidez</div>
                        <div class="kpi-value text-info" id="kpi-val-fps">${current.fps} <span class="unit">FPS</span></div>
                        <div class="kpi-subtext text-muted" id="kpi-sub-fps">V-Sync adaptativo activo</div>
                    </div>
                    <div class="perf-kpi-card" id="kpi-fidelity">
                        <div class="kpi-label">Fidelidad Gráfica</div>
                        <div class="kpi-value-sm" id="kpi-val-fidelity">${current.shaderFidelity}</div>
                        <div class="kpi-subtext text-muted" id="kpi-sub-desc">${current.desc}</div>
                    </div>
                </div>

                <!-- Gráfico Interactivo D3.js -->
                <div class="perf-d3-card">
                    <div class="d-flex justify-content-between align-items-center mb-2 px-2 pt-2">
                        <span class="small fw-bold text-main">
                            <i class="bi bi-bar-chart-fill me-1 text-primary"></i> Benchmark Comparativo de Latencia (ms)
                        </span>
                        <span class="small text-muted perf-chart-legend">
                            <i class="bi bi-circle-fill text-success me-1 legend-dot"></i> Perfil Seleccionado
                        </span>
                    </div>
                    <div id="d3-perf-chart" class="d3-perf-chart-container position-relative"></div>
                    <div id="d3-perf-tooltip" class="d3-perf-tooltip d-none"></div>
                </div>

                <!-- Nota Contextual de Impacto -->
                <div class="perf-impact-alert mt-2" id="perf-impact-note">
                    <i class="bi bi-info-circle-fill text-primary me-2"></i>
                    <span id="perf-impact-text">
                        Perfil activo <strong>${current.label}</strong>: ${current.desc}
                    </span>
                </div>
            </div>
        `;
    }

    static init(profile = null) {
        const stored = PerformanceStorage.get();
        this.currentProfile = profile || stored.profile || 'balanced';

        const pillsContainer = document.getElementById('perf-profile-pills');
        if (pillsContainer) {
            pillsContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-profile]');
                if (!btn) return;
                const selected = btn.getAttribute('data-profile');
                if (selected && selected !== this.currentProfile) {
                    this.selectProfile(selected);
                }
            });
        }

        requestAnimationFrame(() => {
            this.renderD3Chart(this.currentProfile);
        });
    }

    static selectProfile(profile) {
        this.currentProfile = profile;
        const benchmarks = PerformanceStorage.getBenchmarkData();
        const data = benchmarks[profile] || benchmarks.balanced;

        PerformanceStorage.set({ profile, isManualMode: true });

        try {
            GraphicsEngine.isManualMode = true;
            GraphicsEngine.applyTier(profile);
        } catch (e) {
            console.warn('[PerformanceD3Dashboard] Error applying tier to GraphicsEngine:', e);
        }

        const pills = document.querySelectorAll('#perf-profile-pills .perf-pill-btn');
        pills.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-profile') === profile);
        });

        const tag = document.getElementById('perf-d3-active-tag');
        if (tag) tag.textContent = data.tag;

        const valLoad = document.getElementById('kpi-val-load');
        if (valLoad) valLoad.innerHTML = `${data.avgLoadMs} <span class="unit">ms</span>`;

        const badgeLoad = document.getElementById('kpi-badge-load');
        if (badgeLoad) {
            badgeLoad.textContent = data.badgeText;
            badgeLoad.className = `badge bg-${data.badgeType}-subtle text-${data.badgeType}`;
        }

        const valRam = document.getElementById('kpi-val-ram');
        if (valRam) valRam.innerHTML = `${data.ramMb} <span class="unit">MB</span>`;

        const valFps = document.getElementById('kpi-val-fps');
        if (valFps) valFps.innerHTML = `${data.fps} <span class="unit">FPS</span>`;

        const valFidelity = document.getElementById('kpi-val-fidelity');
        if (valFidelity) valFidelity.textContent = data.shaderFidelity;

        const subDesc = document.getElementById('kpi-sub-desc');
        if (subDesc) subDesc.textContent = data.desc;

        const impactText = document.getElementById('perf-impact-text');
        if (impactText) {
            impactText.innerHTML = `Perfil activo <strong>${data.label} (${data.tag})</strong>: ${data.desc}`;
        }

        this.updateD3Chart(profile);
        eventBus.emit('engine:profile_selected', { profile, tier: data.tier });
    }

    static renderD3Chart(activeProfile) {
        const container = document.getElementById(this.chartContainerId);
        if (!container) return;

        container.innerHTML = '';
        if (this._resizeObserver) {
            try { 
                this._resizeObserver.disconnect(); 
            } catch {
                // Silencioso
            }
            this._resizeObserver = null;
        }

        const benchmarks = PerformanceStorage.getBenchmarkData();
        const dataList = Object.values(benchmarks);

        const rawWidth = container.clientWidth || 500;
        const isMobile = rawWidth < 480;
        const width = Math.max(280, rawWidth);
        const height = isMobile ? 195 : 180;
        const margin = isMobile 
            ? { top: 25, right: 12, bottom: 35, left: 34 }
            : { top: 25, right: 20, bottom: 35, left: 45 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .attr('class', 'perf-svg');

        const defs = svg.append('defs');
        dataList.forEach(d => {
            const grad = defs.append('linearGradient')
                .attr('id', `grad-${d.id}`)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '0%').attr('y2', '100%');

            grad.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', d.gradient?.[0] || d.color || '#3b82f6')
                .attr('stop-opacity', 0.95);

            grad.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', d.gradient?.[1] || d.color || '#1d4ed8')
                .attr('stop-opacity', 0.6);
        });

        const glowFilter = defs.append('filter')
            .attr('id', 'active-glow')
            .attr('x', '-20%').attr('y', '-20%')
            .attr('width', '140%').attr('height', '140%');
        glowFilter.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'blur');
        glowFilter.append('feComposite')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'blur')
            .attr('operator', 'over');

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(dataList.map(d => d.id))
            .range([0, innerWidth])
            .padding(isMobile ? 0.22 : 0.36);

        const maxVal = d3.max(dataList, d => Number(d.avgLoadMs) || 0) || 600;
        const yScale = d3.scaleLinear()
            .domain([0, maxVal * 1.15])
            .range([innerHeight, 0]);

        const yAxisGrid = d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(-innerWidth)
            .tickFormat('')
            .tickSizeOuter(0);

        g.append('g')
            .attr('class', 'd3-grid')
            .call(yAxisGrid);

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(id => benchmarks[id]?.tag || id);

        g.append('g')
            .attr('class', 'd3-axis-x')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .style('font-size', isMobile ? '9.5px' : '11px')
            .style('font-weight', '600')
            .style('fill', 'var(--text-main, #334155)');

        const yAxis = d3.axisLeft(yScale)
            .ticks(4)
            .tickFormat(d => `${d}ms`);

        g.append('g')
            .attr('class', 'd3-axis-y')
            .call(yAxis)
            .selectAll('text')
            .style('font-size', isMobile ? '8.5px' : '10px')
            .style('fill', 'var(--text-muted, #64748b)');

        const tooltip = d3.select('#d3-perf-tooltip');

        const bars = g.selectAll('.perf-bar')
            .data(dataList)
            .enter()
            .append('rect')
            .attr('class', d => `perf-bar ${d.id === activeProfile ? 'is-active' : ''}`)
            .attr('data-id', d => d.id)
            .attr('x', d => xScale(d.id))
            .attr('width', xScale.bandwidth())
            .attr('y', innerHeight)
            .attr('height', 0)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', d => `url(#grad-${d.id})`)
            .style('cursor', 'pointer')
            .style('transition', 'filter 0.3s ease, stroke-width 0.3s ease')
            .on('mouseover touchstart', (event, d) => {
                const loadVal = Number(d.avgLoadMs) || 0;
                tooltip.classed('d-none', false)
                    .html(`
                        <div class="tooltip-title fw-bold">${d.label} (${d.tag})</div>
                        <div class="tooltip-row"><span>Latencia de inicio:</span> <strong>${loadVal} ms</strong></div>
                        <div class="tooltip-row"><span>Memoria Heap:</span> <strong>${d.ramMb || 0} MB</strong></div>
                        <div class="tooltip-row"><span>Tasa fluidez:</span> <strong>${d.fps || 60} FPS</strong></div>
                        <div class="tooltip-sub">${d.desc || ''}</div>
                    `);
            })
            .on('mousemove touchmove', (event) => {
                const rect = container.getBoundingClientRect();
                const clientX = event.touches ? event.touches[0].clientX : event.clientX;
                const clientY = event.touches ? event.touches[0].clientY : event.clientY;
                
                const tooltipNode = tooltip.node();
                const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 180;
                let leftPos = clientX - rect.left + 12;

                if (leftPos + tooltipWidth > rect.width - 10) {
                    leftPos = Math.max(10, clientX - rect.left - tooltipWidth - 12);
                }

                tooltip.style('left', `${leftPos}px`)
                    .style('top', `${Math.max(10, clientY - rect.top - 20)}px`);
            })
            .on('mouseout touchend', () => {
                tooltip.classed('d-none', true);
            })
            .on('click', (event, d) => {
                this.selectProfile(d.id);
            });

        bars.transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(Number(d.avgLoadMs) || 0))
            .attr('height', d => Math.max(2, innerHeight - yScale(Number(d.avgLoadMs) || 0)));

        const labels = g.selectAll('.perf-bar-label')
            .data(dataList)
            .enter()
            .append('text')
            .attr('class', 'perf-bar-label')
            .attr('x', d => xScale(d.id) + xScale.bandwidth() / 2)
            .attr('y', innerHeight)
            .attr('text-anchor', 'middle')
            .style('font-size', '10.5px')
            .style('font-weight', '700')
            .style('fill', d => d.color || '#3b82f6')
            .text(d => `${Number(d.avgLoadMs) || 0}ms`);

        labels.transition()
            .duration(650)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(Number(d.avgLoadMs) || 0) - 7);

        this._updateIndicator(g, xScale, yScale, activeProfile, innerHeight);

        if (typeof ResizeObserver !== 'undefined') {
            let resizeTimer;
            this._resizeObserver = new ResizeObserver(() => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if (document.getElementById(this.chartContainerId) === container) {
                        this.renderD3Chart(this.currentProfile);
                    }
                }, 150);
            });
            this._resizeObserver.observe(container);
        }
    }

    static updateD3Chart(activeProfile) {
        const container = document.getElementById(this.chartContainerId);
        if (!container) return;

        const svg = d3.select(container).select('svg');
        if (svg.empty()) {
            this.renderD3Chart(activeProfile);
            return;
        }

        svg.selectAll('.perf-bar')
            .classed('is-active', function() {
                return d3.select(this).attr('data-id') === activeProfile;
            })
            .attr('stroke', function() {
                return d3.select(this).attr('data-id') === activeProfile ? '#ffffff' : 'none';
            })
            .attr('stroke-width', function() {
                return d3.select(this).attr('data-id') === activeProfile ? 2.5 : 0;
            });

        const benchmarks = PerformanceStorage.getBenchmarkData();
        const dataList = Object.values(benchmarks);
        const rawWidth = container.clientWidth || 500;
        const isMobile = rawWidth < 480;
        const width = Math.max(280, rawWidth);
        const height = isMobile ? 195 : 180;
        const margin = isMobile 
            ? { top: 25, right: 12, bottom: 35, left: 34 }
            : { top: 25, right: 20, bottom: 35, left: 45 };

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const xScale = d3.scaleBand()
            .domain(dataList.map(d => d.id))
            .range([0, innerWidth])
            .padding(isMobile ? 0.22 : 0.36);

        const maxVal = d3.max(dataList, d => Number(d.avgLoadMs) || 0) || 600;
        const yScale = d3.scaleLinear()
            .domain([0, maxVal * 1.15])
            .range([innerHeight, 0]);

        const g = svg.select('g');
        this._updateIndicator(g, xScale, yScale, activeProfile, innerHeight);
    }

    static _updateIndicator(g, xScale, yScale, activeProfile, innerHeight) {
        const benchmarks = PerformanceStorage.getBenchmarkData();
        const activeData = benchmarks[activeProfile] || benchmarks.balanced;

        g.selectAll('.active-profile-pointer').remove();

        const xVal = xScale(activeProfile);
        if (xVal === undefined) return;

        const x = xVal + xScale.bandwidth() / 2;
        const loadVal = Number(activeData.avgLoadMs) || 0;
        const y = yScale(loadVal) - 18;

        const pointer = g.append('g')
            .attr('class', 'active-profile-pointer')
            .attr('transform', `translate(${x},${y})`);

        pointer.append('circle')
            .attr('r', 5)
            .attr('fill', activeData.color || '#3b82f6')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2);

        const isPanicMode = document.body.classList.contains('engine-suspended');
        if (!isPanicMode) {
            pointer.append('circle')
                .attr('r', 9)
                .attr('fill', 'none')
                .attr('stroke', activeData.color || '#3b82f6')
                .attr('stroke-width', 1.5)
                .attr('opacity', 0.6)
                .attr('class', 'pulsing-ring');
        }
    }
}

export default PerformanceD3Dashboard;
