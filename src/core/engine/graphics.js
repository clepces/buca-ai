/**
 * @fileoverview GraphicsEngine - El motor neural de BUCA (BNE v5.3.0)
 * @module core/engine/graphics
 * @description Orquesta el rendimiento visual, perfiles (Eco, Balanced, Pro, Ultra),
 * efectos de post-procesado dinámicos, monitores de hardware y telemetría de rendimiento.
 */
import { uiState } from '@/core/state/ui.js';
import { CONFIG } from '@/core/config/config.js';
import { tiers, defaultPostProcess } from '@/core/engine/profiles/index.js';
import { detectHardware } from '@/core/engine/utils/hardwareDetector.js';
import { FPSMonitor } from '@/core/engine/monitors/FPSMonitor.js';
import { ThermalGuard } from '@/core/engine/monitors/ThermalGuard.js';
import { MemoryGuard } from '@/core/engine/monitors/MemoryGuard.js';
import { ResourceThrottle } from '@/core/engine/services/ResourceThrottle.js';
import { ReflowGuard } from '@/core/engine/safety/ReflowGuard.js';
import { GhostSanitizer } from '@/core/engine/safety/GhostSanitizer.js';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import { AssetOptimizer } from './services/AssetOptimizer.js';
import { AutoSleepGuard } from './services/AutoSleepGuard.js';
import { CalibrationService } from './services/CalibrationService.js';
import { DOMEffectsApplier } from './services/DOMEffectsApplier.js';
import { PanicModeManager } from './services/PanicModeManager.js';
import { $$, $on, $off } from '@/shared/utils/dom.js';
import { $onWindow, $offWindow } from '@/core/utils/system-helper.js';
import { Logger } from '@/shared/utils/logger.js';

export class GraphicsEngine {
    static #instance = null;
    static VERSION = '5.3.0';

    constructor() {
        if (GraphicsEngine.#instance) {
            return GraphicsEngine.#instance;
        }

        this.profile = 'balanced';
        this.fps = 60;
        this.latency = 0;
        this.startTime = Date.now();
        this.storageKey = CONFIG.STORAGE.PERFORMANCE;
        this.isPaused = false;
        this.isCalibrating = false;
        this.isManualMode = false;
        this.isPanicMode = false;

        this.tiers = tiers;
        this.dpr = window.devicePixelRatio || 1;
        this.blurFactor = Math.max(0.4, 1 / this.dpr);
        this.postProcess = { ...defaultPostProcess };

        // Monitores y guardas
        this.fpsMonitor = new FPSMonitor(this);
        this.thermalMonitor = new ThermalGuard(this);
        this.memoryGuard = new MemoryGuard(this);
        this.resourceThrottler = new ResourceThrottle(this);
        this.reflowGuard = new ReflowGuard(this);
        this.ghostSanitizer = new GhostSanitizer(this);

        // Servicios modulares desacoplados
        this.assetOptimizer = new AssetOptimizer(this);
        this.sleepGuard = new AutoSleepGuard(this);

        this._visibilityHandler = this.#handleVisibilityChange.bind(this);
        this._resizeHandler = this.#handleResize.bind(this);

        $onWindow('resize', this._resizeHandler);
        $on(document, 'visibilitychange', this._visibilityHandler);

        this.#initTelemetrySync();

        GraphicsEngine.#instance = this;
    }

    get activeElements() { return this.assetOptimizer.activeElements; }
    get intersectionObserver() { return this.assetOptimizer.intersectionObserver; }
    get mutationObserver() { return this.assetOptimizer.mutationObserver; }
    get #isSleeping() { return this.sleepGuard.isSleeping; }

    scan(rootNode = document.body) {
        this.assetOptimizer.scan(rootNode);
    }

    processElement(el) {
        this.assetOptimizer.processElement(el);
    }

    #initTelemetrySync() {
        this._stateSyncInterval = setInterval(() => {
            if (this.isPaused || document.hidden || this.#isSleeping) return;

            const stats = this.getCurrentStats();
            uiState.updateGraphics({
                fps: stats.fps,
                latency: stats.latency,
                memory: stats.vramUsed,
                objects: stats.objects,
                uptime: stats.uptime,
                dpr: stats.dpr,
                isManualMode: this.isManualMode,
                profile: this.profile
            });
        }, 1000);
    }

    #handleResize() {
        const newDpr = window.devicePixelRatio || 1;
        if (newDpr !== this.dpr) {
            this.dpr = newDpr;
            this.blurFactor = Math.max(0.4, 1 / this.dpr);
            this.applyTier(this.profile);
        }
    }

    #handleVisibilityChange() {
        if (document.hidden) {
            this.isPaused = true;
        } else {
            this.isPaused = false;
            this.sleepGuard.wakeUp();
            if (this.fpsMonitor) this.fpsMonitor.lastFrameTime = performance.now();
        }
    }

    async init() {
        Logger.info({ layer: 'ENGINE', role: 'CLASS', target: 'BENE', icon: '🚀', message: 'Inicializando motor gráfico adaptativo BENE.' });

        const savedConfig = PerformanceStorage.get();
        if (savedConfig?.profile) {
            this.profile = savedConfig.profile;
            this.isManualMode = savedConfig.isManualMode;
            this.isPanicMode = !!savedConfig.isPanicMode;
            if (savedConfig.postProcess) this.postProcess = { ...this.postProcess, ...savedConfig.postProcess };

            if (this.isPanicMode) {
                this.togglePanicMode(true);
            } else {
                this.applyTier(this.profile);
            }
        } else {
            await this.calibrate();
        }

        this.startMonitors();

        return {
            tier: this.tiers[this.profile].id,
            profile: this.profile,
            stats: this.getCurrentStats()
        };
    }

    async calibrate() {
        return CalibrationService.calibrate(this);
    }

    applyTier(tier) {
        if (!this.tiers[tier]) return;

        const hw = detectHardware();
        if (!this.isManualMode && hw.memory < 4 && (tier === 'ultra' || tier === 'pro')) {
            tier = 'balanced';
        }

        this.profile = tier;
        const tierData = this.tiers[tier];

        DOMEffectsApplier.apply(this, tier);
        this.assetOptimizer.refreshActive();

        uiState.updateGraphics({
            tier,
            id: tierData.id,
            isManualMode: this.isManualMode,
            timestamp: Date.now()
        });
    }

    setControlMode(isManual) {
        this.isManualMode = isManual;
        this.applyTier(this.profile);
    }

    togglePanicMode(forceState) {
        return PanicModeManager.toggle(this, forceState);
    }

    setPostProfile(effect, value) {
        if (Object.prototype.hasOwnProperty.call(this.postProcess, effect)) {
            this.postProcess[effect] = value;
            this.applyTier(this.profile);
        }
    }

    startMonitors() {
        if (this.#isSleeping || this.isPanicMode) return;
        this.fpsMonitor.start();
        this.thermalMonitor.start();
        this.memoryGuard.start();
        this.reflowGuard.start();
        this.ghostSanitizer.start();
    }

    degrade() {
        if (this.isManualMode) return;
        const sequence = ['eco', 'balanced', 'pro', 'ultra'];
        const currentIndex = sequence.indexOf(this.profile);
        if (currentIndex > 0) {
            this.applyTier(sequence[currentIndex - 1]);
        }
    }

    upgrade() {
        if (this.isManualMode) return;
        const sequence = ['eco', 'balanced', 'pro', 'ultra'];
        const currentIndex = sequence.indexOf(this.profile);
        if (currentIndex < sequence.length - 1) {
            this.applyTier(sequence[currentIndex + 1]);
        }
    }

    #cachedObjectCount = 0;
    #lastObjectCountTime = 0;

    #getObjectCount() {
        const now = Date.now();
        if (now - this.#lastObjectCountTime > 5000) {
            this.#cachedObjectCount = $$('*').length;
            this.#lastObjectCountTime = now;
        }
        return this.#cachedObjectCount;
    }

    getCurrentStats() {
        const memoryInfo = window.performance?.memory;
        const jsHeap = memoryInfo ?
            (memoryInfo.usedJSHeapSize / (1024 * 1024 * 1024)).toFixed(2) :
            '0.00';

        return {
            version: GraphicsEngine.VERSION,
            fps: this.fps,
            latency: this.latency.toFixed(1),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            profile: this.profile,
            tier: this.tiers[this.profile],
            memory: navigator.deviceMemory || 4,
            vramUsed: jsHeap,
            cores: navigator.hardwareConcurrency || 4,
            dpr: this.dpr.toFixed(1),
            blurFactor: this.blurFactor.toFixed(2),
            isManualMode: this.isManualMode,
            isPaused: this.isPaused,
            isSleeping: this.#isSleeping,
            objects: this.#getObjectCount(),
            postProcess: { ...this.postProcess }
        };
    }

    destroy() {
        $offWindow('resize', this._resizeHandler);
        $off(document, 'visibilitychange', this._visibilityHandler);

        this.sleepGuard.destroy();
        this.assetOptimizer.destroy();

        if (this.fpsMonitor) this.fpsMonitor.stop();
        if (this.thermalMonitor) {
            if (this.thermalMonitor.stop) this.thermalMonitor.stop();
            else if (this.thermalMonitor.disconnect) this.thermalMonitor.disconnect();
        }
        if (this.memoryGuard?.stop) this.memoryGuard.stop();
        if (this.reflowGuard?.stop) this.reflowGuard.stop();
        if (this.ghostSanitizer?.stop) this.ghostSanitizer.stop();
        if (this.resourceThrottler?.stop) this.resourceThrottler.stop();

        if (this._stateSyncInterval) {
            clearInterval(this._stateSyncInterval);
            this._stateSyncInterval = null;
        }

        GraphicsEngine.#instance = null;
    }
}
