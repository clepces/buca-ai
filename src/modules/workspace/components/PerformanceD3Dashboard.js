/**
 * @fileoverview PerformanceD3Dashboard - Visualizador de Métricas de Carga y Perfiles en Tiempo Real (D3.js)
 * @module modules/workspace/components/PerformanceD3Dashboard
 * @description Orquestador del dashboard de rendimiento visual con D3.js. Compara tiempos
 * de carga históricos vs. perfiles de hardware (Eco, Equilibrado, Pro, Ultra).
 */

import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import GraphicsEngine from '@/core/engine/engine.js';
import { eventBus } from '@/core/eventBus/index.js';
import { renderPerformanceDashboardHTML } from './performance/performance-template.js';
import { D3BenchmarkChart } from './performance/D3BenchmarkChart.js';

export class PerformanceD3Dashboard {
    static currentProfile = 'balanced';
    static chartContainerId = 'd3-perf-chart';

    static renderHTML(activeProfile = 'balanced') {
        return renderPerformanceDashboardHTML(activeProfile);
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
        D3BenchmarkChart.render(
            this.chartContainerId, 
            activeProfile || this.currentProfile, 
            (selectedProfile) => this.selectProfile(selectedProfile)
        );
    }

    static updateD3Chart(activeProfile) {
        D3BenchmarkChart.update(this.chartContainerId, activeProfile || this.currentProfile);
    }

    static destroy() {
        D3BenchmarkChart.destroy();
    }
}

export default PerformanceD3Dashboard;
