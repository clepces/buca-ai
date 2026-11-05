/**
 * Performance Template - BUCA Neural Engine v5.2
 * =========================================================================
 */
import GraphicsEngine from '@/core/engine/engine.js';
import { PerformanceGuards } from '@/shared/ui/components/performance/PerformanceGuards.js';
import { PerformanceD3Dashboard } from '../components/PerformanceD3Dashboard.js';

export const performanceTemplate = (data = {}) => {
    const { stats, advancedSettings } = data;

    const renderProfileCard = (tier, level, title, desc, perf) => `
        <div class="col-12 col-md-6">
            <div class="profile-card ${GraphicsEngine.profile === tier ? 'active' : ''}" data-tier="${tier}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="badge bg-primary-subtle text-primary fw-bold">NIVEL ${level}</span>
                    <span class="perf-metric-tag">${perf}</span>
                </div>
                <h6 class="fw-bold text-main mb-1">${title}</h6>
                <p class="small text-muted mb-0 profile-subtext-micro">${desc}</p>
                <div class="active-indicator"><i class="bi bi-check-circle-fill"></i></div>
            </div>
        </div>
    `;

    return `
        <div class="performance-dashboard-content">
            <!-- NAVEGACIÓN POR PESTAÑAS -->
            <div class="modal-nav-tabs mb-4 p-1 rounded-4 bg-surface border" id="perf-tabs-nav">
                <button class="modal-nav-tab active flex-fill" data-tab="telemetry">
                    <i class="bi bi-graph-up-arrow me-1"></i> Telemetría
                </button>
                <button class="modal-nav-tab flex-fill" data-tab="profiles">
                    <i class="bi bi-layers-half me-1"></i> Perfiles
                </button>
                <button class="modal-nav-tab flex-fill" data-tab="advanced">
                    <i class="bi bi-sliders2-vertical me-1"></i> Avanzado
                </button>
            </div>
            
            <div class="perf-tab-panes">
                <!-- PESTAÑA 1: TELEMETRÍA -->
                <div class="tab-content-pane active" id="tab-perf-telemetry">
                    <div class="row g-3 mb-4">
                        <div class="col-6 col-md-3">
                            <div class="p-3 rounded-4 bg-surface border text-center shadow-xs">
                                <div class="stat-label small fw-bold text-muted mb-1">FPS</div>
                                <div class="fs-4 fw-bold text-primary" id="perf-fps">${stats.fps}</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-3 rounded-4 bg-surface border text-center shadow-xs">
                                <div class="stat-label small fw-bold text-muted mb-1">LATENCIA</div>
                                <div class="fs-4 fw-bold text-warning" id="perf-latency-val">0.0ms</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-3 rounded-4 bg-surface border text-center shadow-xs">
                                <div class="stat-label small fw-bold text-muted mb-1">MEMORIA</div>
                                <div class="fs-4 fw-bold text-success" id="perf-vram">${stats.memory}GB</div>
                            </div>
                        </div>
                        <div class="col-6 col-md-3">
                            <div class="p-3 rounded-4 bg-surface border text-center shadow-xs">
                                <div class="stat-label small fw-bold text-muted mb-1">CONTROL</div>
                                <div class="fs-6 fw-bold text-main mt-1" id="perf-control-mode-val">${stats.isManualMode ? 'MANUAL' : 'IA AUTO'}</div>
                            </div>
                        </div>
                    </div>

                    <div id="guards-container-slot" class="mb-3">
                        ${PerformanceGuards.render(stats.isManualMode, 0)}
                    </div>

                    ${PerformanceD3Dashboard.renderHTML(stats.profile || 'balanced')}
                </div>

                <!-- PESTAÑA 2: PERFILES -->
                <div class="tab-content-pane" id="tab-perf-profiles">
                    <div class="panic-switch-banner p-3 mb-3 rounded-4 d-flex align-items-center justify-content-between border">
                        <div class="d-flex align-items-center gap-3">
                            <div class="panic-icon-box rounded-circle d-flex align-items-center justify-content-center text-danger">
                                <i class="bi bi-shield-slash-fill fs-5"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold mb-0 text-danger">Interruptor de Pánico (Modo Cero)</h6>
                                <p class="small text-muted mb-0">Suspende el motor gráfico para garantizar respuesta instantánea (L0).</p>
                            </div>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="btn-toggle-panic-switch" ${GraphicsEngine.isPanicMode ? 'checked' : ''}>
                        </div>
                    </div>

                    <div class="row g-3">
                        ${renderProfileCard('eco', 'L0', 'Ahorro Máximo', '30 FPS cap, sin efectos.', '125ms')}
                        ${renderProfileCard('balanced', 'L1', 'Equilibrado', '60 FPS estables, blur suave.', '240ms')}
                        ${renderProfileCard('pro', 'L2', 'Profesional', 'Sombras multicapa, GPU++.', '385ms')}
                        ${renderProfileCard('ultra', 'L3', 'Cine & VR 4K', 'Sin límites, fidelidad máxima.', '580ms')}
                    </div>
                </div>

                <!-- PESTAÑA 3: AVANZADO -->
                <div class="tab-content-pane" id="tab-perf-advanced">
                    <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs mb-4">
                        <h6 class="fw-bold text-main mb-3"><i class="bi bi-display-fill me-2"></i>Renderizado & GPU</h6>
                        <div class="row g-3">
                            <div class="col-12">
                                <label class="form-label small fw-bold text-muted text-uppercase mb-1">Target FPS</label>
                                <div class="d-flex align-items-center gap-3">
                                    <input type="range" class="form-range" min="30" max="144" step="15" value="${advancedSettings.fpsCap}" id="adv-fps-slider">
                                    <span class="badge bg-primary rounded-pill px-3" id="adv-fps-val">${advancedSettings.fpsCap} FPS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export default performanceTemplate;
