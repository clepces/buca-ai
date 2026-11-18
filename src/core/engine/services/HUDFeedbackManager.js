
import { $id, $mount, $on, $onReady, $addClass, $removeClass } from '@/shared/utils/dom.js';
import { $onWindow } from '@/core/utils/index.js';

/**
 * HUD Feedback Manager
 * 
 * Reemplaza al antiguo NotificationManager.
 * Emite alertas en formato HUD y responde a estados de Pánico Térmico
 * del Buca Neural Engine.
 */
class HUDFeedbackManager {
    constructor() {
        this.toastQueue = [];
        this.isProcessing = false;
        this.container = null;
        this._boundNotification = null;
        this._boundLegacy = null;
        this.init();
    }

    init() {
        // Aseguramos de correr después de que el DOM esté listo
        $onReady(() => this.setupContainer());

        // BNE Event — cachear referencia para poder desubscribir
        this._boundNotification = (e) => this.pushFeedback(e.detail);
        $onWindow('buca:notification', this._boundNotification);
        
        // Centralized EventBus Integration
        import('@/core/eventBus/index.js').then(({ eventBus }) => {
            eventBus.on('ui:notification_hud', (data) => this.pushFeedback(data));
        });

        // Legacy Modular Event (Bridge)
        this._boundLegacy = (e) => this.pushFeedback(e.detail);
        $onWindow('UI:NOTIFICATION_PUSH', this._boundLegacy);
    }

    setupContainer() {
        this.container = $id('buca-hud-feedback-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'buca-hud-feedback-container';
            this.container.className = 'hud-feedback-container';
            document.body.appendChild(this.container);
        }
    }

    pushFeedback(data) {
        const options = typeof data === 'string' 
            ? { message: data, type: 'info', duration: 4000 } 
            : data;

        this.toastQueue.push(options);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.toastQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const currentToast = this.toastQueue.shift();
        
        await this.renderToast(currentToast);
        
        // Efecto Spring de separación (Staggering)
        setTimeout(() => {
            this.processQueue();
        }, 150);
    }

    renderToast(options) {
        return new Promise((resolve) => {
            if (!this.container) this.setupContainer();

            const toast = document.createElement('div');
            
            // ¿El motor está en pánico?
            const isThermalThrottle = document.documentElement.classList.contains('buca-thermal-throttle');
            
            toast.className = `hud-toast hud-toast--${options.type || 'info'} ${isThermalThrottle ? 'hud-toast--eco' : 'hud-toast--glass'}`;

            $mount(toast, `
                <div class="hud-toast-icon">
                    ${this.getIconForType(options.type)}
                </div>
                <div class="hud-toast-content">
                    <span class="hud-toast-message">${options.message}</span>
                </div>
                <button class="hud-toast-close" title="Cerrar">&times;</button>
            `);

            this.container.appendChild(toast);

            // Animate In (Reflow forzado para transición segura)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    $addClass(toast, 'show');
                });
            });

            const duration = options.duration || 4000;
            let timeout;

            const removeToast = () => {
                clearTimeout(timeout);
                $removeClass(toast, 'show');
                setTimeout(() => {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                    resolve();
                }, 300); // 300ms de transición CSS
            };

            const closeBtn = toast.querySelector('.hud-toast-close');
            if (closeBtn) {
                $on(closeBtn, 'click', removeToast);
            }

            timeout = setTimeout(removeToast, duration);
        });
    }

    getIconForType(type) {
        switch(type) {
        case 'success': return '<i class="bi bi-check2-circle"></i>';
        case 'warning': return '<i class="bi bi-exclamation-triangle"></i>';
        case 'error': return '<i class="bi bi-x-octagon"></i>';
        default: return '<i class="bi bi-info-circle"></i>';
        }
    }

    /**
     * Libera recursos: remueve listeners globales y vacía la cola de toasts.
     */
    destroy() {
        if (this._boundNotification) {
            window.removeEventListener('buca:notification', this._boundNotification);
            this._boundNotification = null;
        }
        if (this._boundLegacy) {
            window.removeEventListener('UI:NOTIFICATION_PUSH', this._boundLegacy);
            this._boundLegacy = null;
        }
        this.toastQueue = [];
        this.isProcessing = false;
    }
}

export default new HUDFeedbackManager();
