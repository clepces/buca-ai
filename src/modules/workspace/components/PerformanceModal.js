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
        const modal = document.getElementById('modal-container');
        if (!modal) return;

        // Tabs
        const tabs = modal.querySelectorAll('#perf-tabs-nav .modal-nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.activeTab = targetTab;
                
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                modal.querySelectorAll('.tab-content-pane').forEach(p => p.classList.remove('active'));
                const targetPane = modal.querySelector(`#tab-perf-${targetTab}`);
                if (targetPane) targetPane.classList.add('active');

                if (targetTab === 'telemetry') {
                    requestAnimationFrame(() => {
                        PerformanceD3Dashboard.renderD3Chart(GraphicsEngine.profile || 'balanced');
                    });
                }
            });
        });

        // Profile Selection
        modal.querySelectorAll('.profile-card[data-tier]').forEach(card => {
            card.addEventListener('click', () => {
                const tier = card.dataset.tier;
                GraphicsEngine.isManualMode = true;
                GraphicsEngine.applyTier(tier);
                PerformanceStorage.set({ profile: tier, isManualMode: true });
                
                // Actualizar UI visual
                modal.querySelectorAll('.profile-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                
                const modeLabel = modal.querySelector('#perf-control-mode-val');
                if (modeLabel) modeLabel.textContent = 'MANUAL';
            });
        });

        // Panic Switch
        const panicSwitch = modal.querySelector('#btn-toggle-panic-switch');
        if (panicSwitch) {
            panicSwitch.onchange = (e) => {
                GraphicsEngine.togglePanicMode(e.target.checked);
            };
        }

        // Quick Mode Toggle
        const quickToggle = modal.querySelector('#btn-quick-mode-toggle');
        if (quickToggle) {
            quickToggle.onclick = () => {
                const stats = GraphicsEngine.getCurrentStats();
                const nextMode = !stats.isManualMode;
                GraphicsEngine.isManualMode = nextMode;
                PerformanceStorage.set({ isManualMode: nextMode });
                this._render(); // Re-render para actualizar iconos
            };
        }
    },

    startTelemetry() {
        if (this.telemetryInterval) clearInterval(this.telemetryInterval);
        this.telemetryInterval = setInterval(() => {
            const stats = GraphicsEngine.getCurrentStats();
            const fpsEl = document.getElementById('perf-fps');
            const vramEl = document.getElementById('perf-vram');
            
            if (fpsEl) fpsEl.textContent = stats.fps;
            if (vramEl) vramEl.textContent = `${stats.memory}GB`;
            
            const latencyEl = document.getElementById('perf-latency-val');
            if (latencyEl) {
                const lat = (Math.random() * 5 + 8).toFixed(1);
                latencyEl.textContent = `${lat}ms`;
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
