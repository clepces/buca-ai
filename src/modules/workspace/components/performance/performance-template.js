/**
 * @fileoverview performance-template - Plantilla HTML para PerformanceD3Dashboard
 * @module modules/workspace/components/performance/performance-template
 */

import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';

export function renderPerformanceDashboardHTML(activeProfile = 'balanced') {
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
