/**
 * @fileoverview D3BenchmarkChart - Motor Gráfico D3 para Visualización de Latencia y Perfiles
 * @module modules/workspace/components/performance/D3BenchmarkChart
 */

import * as d3 from 'd3';
import 'd3-transition';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import { $id, $empty, $hasClass } from '@/shared/utils/dom.js';

export class D3BenchmarkChart {
    static _resizeObserver = null;

    /**
     * Dibuja el gráfico completo de D3 en el contenedor indicado
     */
    static render(containerId, activeProfile, onSelectProfile) {
        const container = $id(containerId);
        if (!container) return;

        $empty(container);
        this.destroy();

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
                .attr('id', `grad-${d.id}`).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
            grad.append('stop').attr('offset', '0%')
                .attr('stop-color', d.gradient?.[0] || d.color || '#3b82f6').attr('stop-opacity', 0.95);
            grad.append('stop').attr('offset', '100%')
                .attr('stop-color', d.gradient?.[1] || d.color || '#1d4ed8').attr('stop-opacity', 0.6);
        });

        const glowFilter = defs.append('filter')
            .attr('id', 'active-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
        glowFilter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
        glowFilter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');

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
            .attr('x', d => xScale(d.id)).attr('width', xScale.bandwidth())
            .attr('y', innerHeight).attr('height', 0).attr('rx', 8).attr('ry', 8)
            .attr('fill', d => `url(#grad-${d.id})`)
            .style('cursor', 'pointer').style('transition', 'filter 0.3s ease, stroke-width 0.3s ease')
            .on('mouseover touchstart', (_event, d) => {
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
            .on('click', (_event, d) => {
                if (typeof onSelectProfile === 'function') onSelectProfile(d.id);
            });

        if (typeof bars.transition === 'function') {
            bars.transition()
                .duration(650)
                .ease(d3.easeCubicOut)
                .attr('y', d => yScale(Number(d.avgLoadMs) || 0))
                .attr('height', d => Math.max(2, innerHeight - yScale(Number(d.avgLoadMs) || 0)));
        } else {
            bars.attr('y', d => yScale(Number(d.avgLoadMs) || 0))
                .attr('height', d => Math.max(2, innerHeight - yScale(Number(d.avgLoadMs) || 0)));
        }

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

        if (typeof labels.transition === 'function') {
            labels.transition()
                .duration(650)
                .ease(d3.easeCubicOut)
                .attr('y', d => yScale(Number(d.avgLoadMs) || 0) - 7);
        } else {
            labels.attr('y', d => yScale(Number(d.avgLoadMs) || 0) - 7);
        }

        this._updateIndicator(g, xScale, yScale, activeProfile);

        if (typeof ResizeObserver !== 'undefined') {
            let resizeTimer;
            this._resizeObserver = new ResizeObserver(() => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    if ($id(containerId) === container) {
                        this.render(containerId, activeProfile, onSelectProfile);
                    }
                }, 150);
            });
            this._resizeObserver.observe(container);
        }
    }

    /**
     * Actualiza el perfil activo en el gráfico existente sin reconstruir todo el SVG
     */
    static update(containerId, activeProfile) {
        const container = $id(containerId);
        if (!container) return;

        const svg = d3.select(container).select('svg');
        if (svg.empty()) {
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
        this._updateIndicator(g, xScale, yScale, activeProfile);
    }

    static _updateIndicator(g, xScale, yScale, activeProfile) {
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

        const isPanicMode = $hasClass(document.body, 'engine-suspended');
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

    static destroy() {
        if (this._resizeObserver) {
            try {
                this._resizeObserver.disconnect();
            } catch {
                // Silencioso
            }
            this._resizeObserver = null;
        }
    }
}
