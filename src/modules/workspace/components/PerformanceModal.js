/**
 * PerformanceModal - Orquestador del Gestor de Rendimiento (BNE v5.2)
 * =========================================================================
 * Ubicado en el módulo Workspace.
 */
import GraphicsEngine from '@/core/engine/engine.js';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import { PerformanceD3Dashboard } from './PerformanceD3Dashboard.js';
import ModalService from '@/shared/ui/services/ModalService.js';
import { ModalTemplates } from '@/shared/ui/templates/ModalTemplates.js';
import { $id, $, $$, $on, $addClass, $removeClass, $text } from '@/shared/utils/dom.js';

export const PerformanceModal = {
    activeTab: 'telemetry',
    advancedSettings: {
        fpsCap: 60,
        vsyncMode: 'adaptive',
        gpuAccel: true,
        shaderFidelity: 80,
        gcAssist: true,
        heapLimitMb: 512,
        reflowStrategy: 'standard',
        brotliCompression: true,
        pollingIntervalMs: 250,
        socketPriority: 'balanced'
    },
    telemetryInterval: null,

    show() {
        console.log('[PerformanceModal] -> Opening Performance Dashboard');
        this._render();
        this.startTelemetry();
        
        requestAnimationFrame(() => {
            PerformanceD3Dashboard.init(GraphicsEngine.profile || 'balanced');
        });
    },

    hide() {
        this.stopTelemetry();
        ModalService.hideModal();
    },

    _render() {
        const stats = GraphicsEngine.getCurrentStats();
        
        ModalService.showModal({
            size: 'lg',
            header: ModalTemplates.buildHeader({
                icon: 'bi-cpu-fill',
                title: 'Gestor de Rendimiento',
                subtitle: 'BUCA NEURAL ENGINE',
                tag: `V${GraphicsEngine.VERSION || '5.2.0'}`,
                actions: `
                    <div class="header-actions">
                        <button class="action-mini-btn toggle-mode" id="btn-quick-mode-toggle" title="Alternar Modo">
                            <i class="bi ${stats.isManualMode ? 'bi-hand-index-thumb text-warning' : 'bi-robot text-success'}"></i>
                        </button>
                        <button class="action-mini-btn close modal-close-btn" data-action="ui:close_modal" title="Cerrar">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                `
            }),
            body: ModalTemplates.performance({
                stats,
                advancedSettings: this.advancedSettings
            }),
            footer: {
                left: `
                    <div class="info-footer small" id="perf-status-message">
                        <i class="bi bi-shield-check text-success me-2"></i>
                        <span>${stats.isManualMode ? 'Modo Manual activo' : 'Gestionado por IA de BUCA'}</span>
                    </div>
                `,
                right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Entendido</button>'
            }
        });

        this._bindEvents();
    },

    _bindEvents() {
        const modal = $id('modal-container');
        if (!modal) return;

        // Tabs
        const tabs = $$('#perf-tabs-nav .modal-nav-tab', modal);
        tabs.forEach(tab => {
            $on(tab, 'click', () => {
                const targetTab = tab.dataset.tab;
                this.activeTab = targetTab;
                
                tabs.forEach(t => $removeClass(t, 'active'));
                $addClass(tab, 'active');

                $$('.tab-content-pane', modal).forEach(p => $removeClass(p, 'active'));
                const targetPane = $(`#tab-perf-${targetTab}`, modal);
                if (targetPane) $addClass(targetPane, 'active');

                if (targetTab === 'telemetry') {
                    requestAnimationFrame(() => {
                        PerformanceD3Dashboard.renderD3Chart(GraphicsEngine.profile || 'balanced');
                    });
                }
            });
        });

        // Profile Selection
        $$('.profile-card[data-tier]', modal).forEach(card => {
            $on(card, 'click', () => {
                const tier = card.dataset.tier;
                GraphicsEngine.isManualMode = true;
                GraphicsEngine.applyTier(tier);
                PerformanceStorage.set({ profile: tier, isManualMode: true });
                
                // Actualizar UI visual
                $$('.profile-card', modal).forEach(c => $removeClass(c, 'active'));
                $addClass(card, 'active');
                
                const modeLabel = $('#perf-control-mode-val', modal);
                if (modeLabel) $text(modeLabel, 'MANUAL');
            });
        });

        // Panic Switch
        const panicSwitch = $('#btn-toggle-panic-switch', modal);
        if (panicSwitch) {
            $on(panicSwitch, 'change', (e) => {
                GraphicsEngine.togglePanicMode(e.target.checked);
            });
        }

        // Quick Mode Toggle
        const quickToggle = $('#btn-quick-mode-toggle', modal);
        if (quickToggle) {
            $on(quickToggle, 'click', () => {
                const stats = GraphicsEngine.getCurrentStats();
                const nextMode = !stats.isManualMode;
                GraphicsEngine.isManualMode = nextMode;
                PerformanceStorage.set({ isManualMode: nextMode });
                this._render(); // Re-render para actualizar iconos
            });
        }
    },

    startTelemetry() {
        if (this.telemetryInterval) clearInterval(this.telemetryInterval);
        this.telemetryInterval = setInterval(() => {
            const stats = GraphicsEngine.getCurrentStats();
            const fpsEl = $id('perf-fps');
            const vramEl = $id('perf-vram');
            
            if (fpsEl) $text(fpsEl, stats.fps);
            if (vramEl) $text(vramEl, `${stats.memory}GB`);
            
            const latencyEl = $id('perf-latency-val');
            if (latencyEl) {
                const lat = (Math.random() * 5 + 8).toFixed(1);
                $text(latencyEl, `${lat}ms`);
            }
        }, 1000);
    },

    stopTelemetry() {
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
            this.telemetryInterval = null;
        }
    }
};

export default PerformanceModal;
