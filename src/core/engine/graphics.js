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
import { storage } from '@/core/storage/StorageAdapter.js';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';

/**
 * GraphicsEngine - El motor neural de BUCA
 * =========================================================================
 * Gestiona el rendimiento visual, la calibración de hardware y los efectos
 * de post-procesado dinámicos.
 * Con modo reposo automático (5s inactividad), desacoplamiento reactivo
 * y limpieza rigurosa de ciclo de vida.
 */
export class GraphicsEngine {
    static #instance = null;
    static VERSION = '5.3.0';

    // Propiedades de Gestión de Assets
    activeElements = new Set();
    mutationObserver = null;
    intersectionObserver = null;

    // Modo Reposo Automático (5s de inactividad)
    #isSleeping = false;
    #lastActivityTime = Date.now();
    #sleepCheckTimer = null;
    #activityHandler = null;

    // Listeners del ciclo de vida para descarte limpio
    #modalOpenHandler = null;
    #layoutReadyHandler = null;
    #scanGraphicsHandler = null;

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
        
        this.fpsMonitor = new FPSMonitor(this);
        this.thermalMonitor = new ThermalGuard(this);
        this.memoryGuard = new MemoryGuard(this);
        this.resourceThrottler = new ResourceThrottle(this);
        this.reflowGuard = new ReflowGuard(this);
        this.ghostSanitizer = new GhostSanitizer(this);

        this._visibilityHandler = this.#handleVisibilityChange.bind(this);
        this._resizeHandler = this.#handleResize.bind(this);

        this.#setupVisibilityListener();
        this.#setupRescaleListener();
        this.#initAutoSleepGuard();
        this.#initTelemetrySync();
        this.#initAssetManagement();

        GraphicsEngine.#instance = this;
    }

    /**
     * Inicializa los observadores de assets para carga dinámica guiada por eventos.
     * @private
     */
    #initAssetManagement() {
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeElements.add(entry.target);
                    this.processElement(entry.target);
                } else {
                    this.activeElements.delete(entry.target);
                }
            });
        }, { 
            rootMargin: '100px',
            threshold: 0.01 
        });

        this.#modalOpenHandler = () => this.scan(document.getElementById('modal-container'));
        this.#layoutReadyHandler = () => this.scan();
        this.#scanGraphicsHandler = () => this.scan();

        window.addEventListener('modal:opened', this.#modalOpenHandler);
        window.addEventListener('kernel:layout-ready', this.#layoutReadyHandler);
        window.addEventListener('ui:scan_graphics', this.#scanGraphicsHandler);
    }

    /**
     * Modo Reposo Automático tras 5 segundos de inactividad de usuario.
     * Reduce el consumo de CPU de la pestaña a 0% cuando el usuario no interactúa.
     * @private
     */
    #initAutoSleepGuard() {
        this.#activityHandler = () => {
            this.#lastActivityTime = Date.now();
            if (this.#isSleeping) {
                this.#isSleeping = false;
                if (!this.isPanicMode && !this.isPaused) {
                    this.startMonitors();
                }
            }
        };

        const events = ['pointermove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(evt => window.addEventListener(evt, this.#activityHandler, { passive: true }));

        this.#sleepCheckTimer = setInterval(() => {
            if (this.isPanicMode || this.isPaused || this.#isSleeping) return;
            if (Date.now() - this.#lastActivityTime > 5000) {
                this.#isSleeping = true;
                // Reposo ligero: pausar monitores de alta frecuencia para consumo CPU 0%
                if (this.fpsMonitor) this.fpsMonitor.stop();
                if (this.reflowGuard) this.reflowGuard.stop();
            }
        }, 2000);
    }

    /**
     * Escanea y observa nodos para optimización visual dentro de un contenedor o en el DOM global.
     */
    scan(rootNode = document.body) {
        if (!rootNode || this.isPanicMode) return;
        const selector = '[data-buca-asset], [data-perf-src], [data-src-default]';
        if (rootNode.matches && rootNode.matches(selector)) {
            this.intersectionObserver?.observe(rootNode);
        }
        if (rootNode.querySelectorAll) {
            rootNode.querySelectorAll(selector).forEach(el => {
                this.intersectionObserver?.observe(el);
            });
        }
    }

    /**
     * Procesa un elemento individual según el perfil de rendimiento activo.
     */
    processElement(el) {
        if (!el) return;
        
        const tier = this.profile;
        const tierData = this.tiers[tier];
        const highResSuffix = this.dpr > 1.2 ? '@2x' : '';
        
        const newSrc = el.getAttribute(`data-src-${tier}`) || 
                       el.getAttribute(`data-src-${tierData.id}`) || 
                       (highResSuffix ? el.getAttribute(`data-src${highResSuffix}`) : null) ||
                       el.getAttribute('data-src-default') ||
                       el.getAttribute('src');

        if (newSrc && el.src !== newSrc) {
            this.#applySourceWithTransition(el, newSrc);
        }

        if (el.tagName === 'VIDEO') {
            if (tier === 'eco') {
                el.pause();
                el.style.opacity = '0.3';
            } else {
                el.style.opacity = '1';
                el.play().catch(() => {}); 
            }
        }
    }

    #applySourceWithTransition(el, src) {
        if (el.tagName === 'IMG') {
            el.style.filter = 'blur(10px)';
            el.style.opacity = '0.7';
            el.style.transition = 'filter 0.4s ease, opacity 0.4s ease';
            
            const tempImg = new Image();
            tempImg.onload = () => {
                el.src = src;
                el.style.filter = 'none';
                el.style.opacity = '1';
            };
            tempImg.src = src;
        } else {
            el.src = src;
        }
    }

    /**
     * Inicia el reporte periódico de estadísticas al uiState.
     */
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
            this.#lastActivityTime = Date.now();
            this.#isSleeping = false;
            if (this.fpsMonitor) this.fpsMonitor.lastFrameTime = performance.now();
        }
    }

    #setupRescaleListener() {
        window.addEventListener('resize', this._resizeHandler);
    }

    #setupVisibilityListener() {
        document.addEventListener('visibilitychange', this._visibilityHandler);
    }

    /**
     * Limpia recursos, detiene monitores de rendimiento y remueve observadores globales.
     */
    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
        document.removeEventListener('visibilitychange', this._visibilityHandler);

        if (this.#activityHandler) {
            ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
                window.removeEventListener(evt, this.#activityHandler);
            });
            this.#activityHandler = null;
        }

        if (this.#sleepCheckTimer) {
            clearInterval(this.#sleepCheckTimer);
            this.#sleepCheckTimer = null;
        }

        if (this.#modalOpenHandler) window.removeEventListener('modal:opened', this.#modalOpenHandler);
        if (this.#layoutReadyHandler) window.removeEventListener('kernel:layout-ready', this.#layoutReadyHandler);
        if (this.#scanGraphicsHandler) window.removeEventListener('ui:scan_graphics', this.#scanGraphicsHandler);
        
        // 1. Detener monitores
        if (this.fpsMonitor) this.fpsMonitor.stop();
        if (this.thermalMonitor) {
            if (this.thermalMonitor.stop) this.thermalMonitor.stop();
            else if (this.thermalMonitor.disconnect) this.thermalMonitor.disconnect();
        }
        if (this.memoryGuard && this.memoryGuard.stop) this.memoryGuard.stop();
        if (this.reflowGuard && this.reflowGuard.stop) this.reflowGuard.stop();
        if (this.ghostSanitizer && this.ghostSanitizer.stop) this.ghostSanitizer.stop();
        if (this.resourceThrottler && this.resourceThrottler.stop) this.resourceThrottler.stop();

        // 2. Detener telemetría
        if (this._stateSyncInterval) {
            clearInterval(this._stateSyncInterval);
            this._stateSyncInterval = null;
        }

        // 3. Desconectar observadores
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        this.activeElements.clear();
        GraphicsEngine.#instance = null;
    }

    async init() {
        console.log('%c 🚀 BUCA NEURAL ENGINE: Initializing Modular Phase 4... ', 'background: #2563eb; color: #fff; font-weight: bold;');

        const savedConfig = PerformanceStorage.get();
        if (savedConfig && savedConfig.profile) {
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
        if (this.isCalibrating) return;
        this.isCalibrating = true;

        console.log('%c 🧪 Calibrating hardware performance... ', 'color: #8b5cf6;');
        this.applyTier('balanced');

        return new Promise((resolve) => {
            let frames = 0;
            const start = performance.now();
            let isDone = false;

            const finish = (suggestion = 'balanced') => {
                if (isDone) return;
                isDone = true;
                this.isCalibrating = false;
                if (!this.isManualMode) {
                    this.applyTier(suggestion);
                }
                resolve(suggestion);
            };

            const fallbackTimer = setTimeout(() => {
                finish('balanced');
            }, 1000);

            const bench = () => {
                if (isDone) return;
                frames++;
                if (performance.now() - start < 600) {
                    requestAnimationFrame(bench);
                } else {
                    clearTimeout(fallbackTimer);
                    const hw = detectHardware();
                    let suggestion = hw.suggestion;

                    if (frames < 20) {
                        suggestion = 'eco';
                    }

                    if (hw.memory < 3.5 && (suggestion === 'ultra' || suggestion === 'pro')) {
                        console.warn('[GraphicsEngine] VRAM Guard: Memoria insuficiente. Forzando degradación.');
                        suggestion = 'balanced';
                    }

                    finish(suggestion);
                }
            };
            requestAnimationFrame(bench);
        });
    }

    applyTier(tier) {
        if (!this.tiers[tier]) return;

        const hw = detectHardware();
        if (!this.isManualMode && hw.memory < 4 && (tier === 'ultra' || tier === 'pro')) {
            tier = 'balanced';
        }

        this.profile = tier;
        const tierData = this.tiers[tier];

        const root = document.documentElement;
        root.setAttribute('data-buca-perf', tierData.id);
        root.setAttribute('data-buca-manual', this.isManualMode ? 'true' : 'false');
        root.style.setProperty('--buca-tier-num', tierData.num);
        root.style.setProperty('--buca-blur-factor', this.blurFactor);

        // Core Effects
        root.setAttribute('data-buca-bloom', this.postProcess.bloom);
        root.setAttribute('data-buca-grain', this.postProcess.grain);
        root.setAttribute('data-buca-reflections', this.postProcess.glassReflections);
        root.setAttribute('data-buca-shadows', this.postProcess.shadows);
        root.setAttribute('data-buca-aa', this.postProcess.antiAliasing);
        
        // Intensity & Quality Modifiers
        root.style.setProperty('--buca-bloom-intensity', this.postProcess.bloomIntensity);
        root.style.setProperty('--buca-blur-modifier', this.postProcess.blurIntensity);
        root.style.setProperty('--buca-grain-intensity', this.postProcess.grainIntensity);
        root.style.setProperty('--buca-shadow-quality', this.postProcess.shadowQuality);
        root.style.setProperty('--buca-particle-density', this.postProcess.particleDensity);

        PerformanceStorage.set({
            profile: tier,
            isManualMode: this.isManualMode,
            postProcess: this.postProcess
        });
        PerformanceStorage.propagateToDOM(tier, tierData.id, this.isManualMode);

        storage.set(this.storageKey, {
            profile: tier,
            isManualMode: this.isManualMode,
            postProcess: this.postProcess,
            timestamp: Date.now()
        });

        window.dispatchEvent(new CustomEvent(CONFIG.EVENTS.GRAPHICS.TIER_CHANGED, {
            detail: {
                tier,
                id: tierData.id,
                num: tierData.num,
                isManual: this.isManualMode,
                isLowPerf: tier === 'eco' || tier === 'balanced'
            }
        }));

        this.activeElements.forEach(el => this.processElement(el));

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

    /**
     * Alterna el Botón de Pánico / Modo Cero (Zero-State Mode).
     */
    togglePanicMode(forceState) {
        this.isPanicMode = typeof forceState === 'boolean' ? forceState : !this.isPanicMode;

        const root = document.documentElement;
        const body = document.body;

        if (this.isPanicMode) {
            this.isManualMode = true;
            this.applyTier('eco');
            root.setAttribute('data-buca-perf', 'L0');
            root.classList.add('engine-suspended');
            body.classList.add('engine-suspended');
            
            if (this.fpsMonitor) this.fpsMonitor.stop();
            if (this.reflowGuard) this.reflowGuard.stop();
            if (this.memoryGuard) this.memoryGuard.stop();

            console.warn('[GraphicsEngine] 🚨 Panic Switch ACTIVADO: CPU 0%.');
        } else {
            root.classList.remove('engine-suspended');
            body.classList.remove('engine-suspended');
            this.startMonitors();
            this.applyTier(this.profile || 'balanced');
            console.log('[GraphicsEngine] ⚡ Panic Switch DESACTIVADO.');
        }

        PerformanceStorage.set({
            isPanicMode: this.isPanicMode,
            profile: this.profile,
            isManualMode: this.isManualMode
        });

        window.dispatchEvent(new CustomEvent('buca:panic_mode_toggled', {
            detail: { isPanicMode: this.isPanicMode }
        }));

        return this.isPanicMode;
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
            this.#cachedObjectCount = document.querySelectorAll('*').length;
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
}
