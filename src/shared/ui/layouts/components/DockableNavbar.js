import { eventBus } from '@/core/eventBus/index.js';

/**
 * Dock Premium (Refactorizada)
 * =========================================================================
 * Implementa sincronización con el Router, Tooltips dinámicos y curvas suaves.
 * =========================================================================
 */
export const Dock = {
    state: {
        currentContext: 'main',
        activeIndex: 0
    },

    navMaps: {
        main: [
            { id: 'módulos', icon: 'bi-grid-fill', action: 'dock:switch-context', payload: { context: 'modules' }, tip: 'Explorar Módulos', label: 'Módulos' },
            { id: 'unidades', icon: 'bi-layers-fill', action: 'ui:enter_business', payload: { id: 'Dashboard' }, tip: 'Gestión de Unidades', label: 'Unidades' },
            { id: 'inicio', icon: 'bi-house-door-fill', action: 'router:navigate', payload: { path: '/' }, tip: 'Panel Principal', label: 'Inicio' },
            { id: 'personal', icon: 'bi-people-fill', action: 'dock:switch-context', payload: { context: 'people' }, tip: 'Recursos Humanos', label: 'Equipo' },
            { id: 'ajustes', icon: 'bi-gear-fill', action: 'ui:open_settings', tip: 'Preferencias', label: 'Ajustes' }
        ],
        modules: [
            { id: 'volver', icon: 'bi-arrow-left-short', action: 'dock:switch-context', payload: { context: 'main' }, tip: 'Volver', label: 'Volver' },
            { id: 'clientes', icon: 'bi-person-badge', action: 'router:navigate', payload: { path: '/clients' }, tip: 'CRM Clientes', label: 'Clientes' },
            { id: 'compras', icon: 'bi-truck', action: 'router:navigate', payload: { path: '/providers' }, tip: 'Proveedores', label: 'Compras' },
            { id: 'stock', icon: 'bi-box-seam', action: 'router:navigate', payload: { path: '/inventory' }, tip: 'Inventario', label: 'Inventario' },
            { id: 'ventas', icon: 'bi-pc-display-horizontal', action: 'router:navigate', payload: { path: '/pos' }, tip: 'Punto de Venta', label: 'POS' }
        ],
        people: [
            { id: 'volver', icon: 'bi-arrow-left-short', action: 'dock:switch-context', payload: { context: 'main' }, tip: 'Volver', label: 'Volver' },
            { id: 'usuarios', icon: 'bi-people', action: 'router:navigate', payload: { path: '/users' }, tip: 'Directorio', label: 'Usuarios' },
            { id: 'permisos', icon: 'bi-shield-lock', action: 'router:navigate', payload: { path: '/roles' }, tip: 'Roles & Seguridad', label: 'Roles' },
            { id: 'equipos', icon: 'bi-diagram-3', action: 'router:navigate', payload: { path: '/teams' }, tip: 'Estructura', label: 'Equipos' }
        ]
    },

    init(containerId = 'dock-slot') {
        const container = document.getElementById(containerId);
        if (!container || container.querySelector('.dock-container')) return;

        this.renderTo(container);
        if (!this._eventsBound) {
            this._bindEvents();
            this._eventsBound = true;
        }
        
        this.syncWithRouter(window.location.pathname);
    },

    renderTo(container) {
        container.innerHTML = this.render();
        this._updateCurve(this.state.activeIndex);
    },

    _triggerFeedback(trigger) {
        // 1. Haptic feedback nativo en móviles
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
            try { 
                navigator.vibrate(10); 
            } catch {
                // Silencioso si el dispositivo bloquea vibración
            }
        }
        // 2. Micro-animación de pulsado
        if (trigger) {
            trigger.classList.add('dock-item-pressed');
            setTimeout(() => trigger.classList.remove('dock-item-pressed'), 180);
        }
        // 3. Audio micro-pop sintetizado sutil (Web Audio API)
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(520, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);
                gain.gain.setValueAtTime(0.03, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.035);
                setTimeout(() => ctx.close().catch(() => {}), 80);
            }
        } catch {
            // Silencioso si AudioContext está deshabilitado
        }
    },

    _bindEvents() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.dock-item');
            if (!trigger) return;

            this._triggerFeedback(trigger);

            const index = parseInt(trigger.getAttribute('data-index'));
            const action = trigger.getAttribute('data-action');
            const payload = trigger.getAttribute('data-payload');
            const data = payload ? JSON.parse(payload) : {};

            e._bucaActionHandled = true;

            if (action === 'dock:switch-context') {
                this.switchContext(data.context);
                return;
            }

            // Actualizar localmente antes de navegar
            this.state.activeIndex = index;
            this._updateCurve(index);
            document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('active'));
            trigger.classList.add('active');

            if (action) {
                eventBus.emit(action, data);
            }
        });

        // Sincronización Automática con el Router
        eventBus.on('router:changed', ({ path }) => {
            this.syncWithRouter(path);
        });
    },

    syncWithRouter(path) {
        const items = this.navMaps[this.state.currentContext];
        const index = items.findIndex(item => item.payload?.path === path);
        
        if (index !== -1 && index !== this.state.activeIndex) {
            this.state.activeIndex = index;
            const dock = document.querySelector('.dock');
            if (dock) {
                const trigger = dock.querySelector(`[data-index="${index}"]`);
                if (trigger) {
                    document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('active'));
                    trigger.classList.add('active');
                    this._updateCurve(index);
                }
            }
        }
    },

    _updateCurve(index) {
        const curve = document.querySelector('.curve-container');
        const dock = document.querySelector('.dock');
        if (!curve || !dock) return;

        const items = dock.querySelectorAll('.dock-item');
        const totalItems = items.length;
        if (totalItems === 0) return;
        
        const itemWidthPercent = 100 / totalItems;
        const pos = (index * itemWidthPercent) + (itemWidthPercent / 2);
        
        curve.style.left = `calc(${pos}% - 55px)`;
    },

    switchContext(newContext) {
        if (!this.navMaps[newContext]) return;
        this.state.currentContext = newContext;
        this.state.activeIndex = 0; // Reset al cambiar contexto

        const dockContainer = document.querySelector('.dock-container');
        if (dockContainer) {
            dockContainer.classList.add('dock-context-transition');
            setTimeout(() => {
                this.renderTo(document.getElementById('dock-slot'));
                dockContainer.classList.remove('dock-context-transition');
            }, 250);
        }
    },

    _renderItems() {
        const items = this.navMaps[this.state.currentContext];
        return items.map((item, index) => `
            <div class="dock-item-wrapper">
                <button class="dock-item ${this.state.activeIndex === index ? 'active' : ''}" 
                        data-action="${item.action}" 
                        data-index="${index}"
                        data-payload='${JSON.stringify(item.payload || {})}'
                        aria-label="${item.tip}">
                    <div class="dock-icon-wrapper">
                        <i class="${item.icon}"></i>
                    </div>
                    <span class="dock-label">${item.label || item.id}</span>
                    <div class="dock-tooltip">${item.tip}</div>
                </button>
            </div>
        `).join('');
    },

    render() {
        return `
            <div class="dock-slot d-flex align-items-end justify-content-center">
                <nav class="dock-container" aria-label="Navegación principal">
                    <div class="dock-nav-wrapper">
                        <div class="curve-container">
                            <div class="curve-left"></div>
                            <div class="curve-right"></div>
                        </div>
                        <div class="dock" id="dock-scrollable">
                            ${this._renderItems()}
                        </div>
                    </div>
                </nav>
            </div>
        `;
    }
};

export default Dock;
