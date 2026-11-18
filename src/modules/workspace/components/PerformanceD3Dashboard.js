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
import { $id, $$, $on, $text, $className, $mount } from '@/shared/utils/dom.js';

export class PerformanceD3Dashboard {
    static currentProfile = 'balanced';
    static chartContainerId = 'd3-perf-chart';

    static renderHTML(activeProfile = 'balanced') {
        return renderPerformanceDashboardHTML(activeProfile);
    }

    static init(profile = null) {
        const stored = PerformanceStorage.get();
        this.currentProfile = profile || stored.profile || 'balanced';

        const pillsContainer = $id('perf-profile-pills');
        if (pillsContainer) {
            $on(pillsContainer, 'click', (e) => {
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

        const pills = $$('#perf-profile-pills .perf-pill-btn');
        pills.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-profile') === profile);
        });

        const tag = $id('perf-d3-active-tag');
        if (tag) $text(tag, data.tag);

        const valLoad = $id('kpi-val-load');
        if (valLoad) $mount(valLoad, `${data.avgLoadMs} <span class="unit">ms</span>`);

        const badgeLoad = $id('kpi-badge-load');
        if (badgeLoad) {
            $text(badgeLoad, data.badgeText);
            $className(badgeLoad, `badge bg-${data.badgeType}-subtle text-${data.badgeType}`);
        }

        const valRam = $id('kpi-val-ram');
        if (valRam) $mount(valRam, `${data.ramMb} <span class="unit">MB</span>`);

        const valFps = $id('kpi-val-fps');
        if (valFps) $mount(valFps, `${data.fps} <span class="unit">FPS</span>`);

        const valFidelity = $id('kpi-val-fidelity');
        if (valFidelity) $text(valFidelity, data.shaderFidelity);

        const subDesc = $id('kpi-sub-desc');
        if (subDesc) $text(subDesc, data.desc);

        const impactText = $id('perf-impact-text');
        if (impactText) {
            $mount(impactText, `Perfil activo <strong>${data.label} (${data.tag})</strong>: ${data.desc}`);
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
