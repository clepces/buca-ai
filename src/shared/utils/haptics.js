/**
 * Haptics Utility - Feedback Táctil y Auditivo
 */

export const Haptics = {
    /**
     * Emite una pequeña vibración (si el hardware lo soporta)
     */
    vibrate(pattern = 10) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    },

    /**
     * Emite un "click" sutil usando Web Audio API
     */
    async click() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
    }
};
