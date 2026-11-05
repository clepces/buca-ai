export class FPSMonitor {
    constructor(engine) {
        this.engine = engine;
        this.frameWeights = [];
        this.lastFrameTime = performance.now();
        this.isRunning = false;
        this._boundCheck = this.check.bind(this);
        this._rafId = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.frameWeights = [];
        this._rafId = requestAnimationFrame(this._boundCheck);
    }

    stop() {
        this.isRunning = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    check() {
        if (!this.isRunning) return;

        if (this.engine.isPaused || this.engine.isCalibrating) {
            this._rafId = requestAnimationFrame(this._boundCheck);
            return;
        }

        const now = performance.now();
        const delta = now - this.lastFrameTime;
        const currentFps = Math.round(1000 / delta);
        this.lastFrameTime = now;

        this.frameWeights.push(currentFps);
        if (this.frameWeights.length > 60) this.frameWeights.shift();

        const avgFps = this.frameWeights.reduce((a, b) => a + b, 0) / this.frameWeights.length;
        this.engine.fps = Math.round(avgFps);
        
        // Promedio móvil para latencia para suavizar saltos
        if (!this.latencyWeights) this.latencyWeights = [];
        this.latencyWeights.push(delta);
        if (this.latencyWeights.length > 30) this.latencyWeights.shift();
        const avgLatency = this.latencyWeights.reduce((a, b) => a + b, 0) / this.latencyWeights.length;
        this.engine.latency = Math.round(avgLatency * 100) / 100;


        // Umbral de degradación (30 FPS sostenidos)
        if (this.engine.fps < 30 && this.frameWeights.length === 60 && this.engine.profile !== 'eco') {
            this.engine.degrade();
            this.frameWeights = [];
            window.dispatchEvent(new CustomEvent('buca:perf_critical'));
        }

        this._rafId = requestAnimationFrame(this._boundCheck);
    }
}
