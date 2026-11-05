/**
 * SystemWidgets - Infraestructura & Rendimiento del Sistema (BNE Core v5.4)
 * Refactorización Phase 5: Sincronización robusta vía EventBus y corrección de fuga de eventos.
 */
import { eventBus } from '@/core/eventBus/index.js';

export const SystemWidgets = {
    render() {
        return `
            <section class="ws-section h-100 d-flex flex-column mb-0" id="system-widgets-section">
                <div class="section-header mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-4 p-2 shadow-2xs d-flex align-items-center justify-content-center system-widgets-header-icon">
                            <i class="bi bi-cpu-fill fs-5"></i>
                        </div>
                        <div>
                            <h2 class="section-title h5 fw-bold mb-0 text-main system-widgets-header-title">
                                Infraestructura & Rendimiento
                            </h2>
                            <span class="text-muted small system-widgets-header-sub">Calibración de hardware e inteligencia predictiva</span>
                        </div>
                    </div>
                </div>
                
                <!-- System Accordion Stack -->
                <div class="system-accordion-stack d-flex flex-column gap-3 flex-grow-1" id="system-accordion-container">
                    
                    <!-- Card 1: Motor Gráfico BNE v5.4 -->
                    <div class="system-accordion-item rounded-4 overflow-hidden border-glass glass-surface" data-accordion-id="graphics">
                        <div class="p-3.5 p-md-4 d-flex flex-wrap align-items-center justify-content-between gap-2 cursor-pointer" data-action="system:toggle_accordion" data-target="graphics" role="button" aria-expanded="true">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-4 p-2.5 d-flex align-items-center justify-content-center shadow-2xs accordion-icon-box accordion-icon-box--blue">
                                    <i class="bi bi-cpu-fill fs-4"></i>
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-2 flex-wrap mb-0.5">
                                        <h6 class="mb-0 fw-bold text-truncate accordion-title">Motor Gráfico BNE v5.4</h6>
                                        <span class="fw-bold accordion-badge accordion-badge--blue">60 FPS V-SYNC</span>
                                    </div>
                                    <span class="text-muted d-block text-truncate accordion-sub">Calibración Reactiva & Shaders WebGPU</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 ms-auto">
                                <div class="d-none d-sm-flex align-items-center gap-1.5 px-2 py-1 rounded-2 border bg-white-5 profile-l4-pill">
                                    <div class="rounded-circle dot-green-micro"></div> Perfil L4 Activo
                                </div>
                                <i class="bi bi-chevron-down accordion-chevron fs-6 text-muted"></i>
                            </div>
                        </div>
                        <div class="accordion-body-content show border-top border-glass">
                            <div class="accordion-scroll-body p-3.5 p-md-4">
                                <div class="accordion-inner-frame p-3.5 p-md-4 rounded-4 border-glass bg-white-5 mb-1">
                                    <p class="mb-3.5 small accordion-desc-text">
                                        El Motor Gráfico BNE v5.4 detecta automáticamente el hardware GPU/CPU y ajusta en tiempo real la tasa de sombreado y el consumo de energía.
                                    </p>
                                    
                                    <div class="row g-3 mb-3.5">
                                        <div class="col-12 col-xl-4">
                                            <div class="system-highlight-card p-3 rounded-4 bg-white-10 border border-white-10 shadow-2xs h-100 d-flex flex-column gap-2">
                                                <div class="d-flex align-items-center gap-2">
                                                    <i class="bi bi-lightning-charge-fill text-primary"></i>
                                                    <strong class="metric-highlight-title">Shaders</strong>
                                                </div>
                                                <span class="text-muted metric-highlight-sub">Latencia ultra baja < 1.2ms</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-xl-4">
                                            <div class="system-highlight-card p-3 rounded-4 bg-white-10 border border-white-10 shadow-2xs h-100 d-flex flex-column gap-2">
                                                <div class="d-flex align-items-center gap-2">
                                                    <i class="bi bi-battery-charging text-success"></i>
                                                    <strong class="metric-highlight-title">Energía</strong>
                                                </div>
                                                <span class="text-muted metric-highlight-sub">Ahorro de batería dinámico</span>
                                            </div>
                                        </div>
                                        <div class="col-12 col-xl-4">
                                            <div class="system-highlight-card p-3 rounded-4 bg-white-10 border border-white-10 shadow-2xs h-100 d-flex flex-column gap-2">
                                                <div class="d-flex align-items-center gap-2">
                                                    <i class="bi bi-memory text-warning"></i>
                                                    <strong class="metric-highlight-title">RAM</strong>
                                                </div>
                                                <span class="text-muted metric-highlight-sub">Consumo < 32.4 MB</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="system-metric-box mt-3.5 p-3.5 rounded-4 bg-white-5 border border-white-10 shadow-2xs">
                                        <div class="d-flex align-items-center justify-content-between gap-2 mb-2 small">
                                            <span class="fw-bold text-main">Estabilidad V-Sync</span>
                                            <span class="fw-bold text-primary">100% Óptimo</span>
                                        </div>
                                        <div class="progress rounded-pill bg-dark bg-opacity-10 border-glass vsync-track">
                                            <div class="progress-bar rounded-pill vsync-bar-fill" role="progressbar"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 2: Inteligencia Predictiva -->
                    <div class="system-accordion-item rounded-4 overflow-hidden border-glass glass-surface" data-accordion-id="ai">
                        <div class="p-3.5 p-md-4 d-flex flex-wrap align-items-center justify-content-between gap-2 cursor-pointer" data-action="system:toggle_accordion" data-target="ai" role="button" aria-expanded="false">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-4 p-2.5 d-flex align-items-center justify-content-center shadow-2xs accordion-icon-box accordion-icon-box--purple">
                                    <i class="bi bi-stars fs-4"></i>
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-2 flex-wrap mb-0.5">
                                        <h6 class="mb-0 fw-bold text-truncate accordion-title">Inteligencia Predictiva</h6>
                                        <span class="fw-bold accordion-badge accordion-badge--purple">3 AGENTES</span>
                                    </div>
                                    <span class="text-muted d-block text-truncate accordion-sub">Supervisión Empresarial & Tasa BCV</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 ms-auto">
                                <i class="bi bi-chevron-down accordion-chevron fs-6 text-muted"></i>
                            </div>
                        </div>
                        <div class="accordion-body-content border-top border-glass">
                            <div class="accordion-scroll-body p-3.5 p-md-4">
                                <div class="accordion-inner-frame p-3.5 p-md-4 rounded-4 border-glass bg-white-5 mb-1">
                                    <p class="mb-3.5 small accordion-desc-text">
                                        Red de agentes autónomos que auditan el flujo de caja y concilian transacciones con la Tasa Oficial BCV.
                                    </p>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <div class="p-3 rounded-4 bg-white-10 border border-white-10 shadow-2xs d-flex align-items-center justify-content-between">
                                                <div class="d-flex align-items-center gap-2">
                                                    <i class="bi bi-shield-check text-purple"></i>
                                                    <span class="metric-event-text">14 Anomalías Evitadas Hoy</span>
                                                </div>
                                                <span class="text-muted fw-bold small">98.4% Precisión</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Card 3: Cloud & Seguridad -->
                    <div class="system-accordion-item rounded-4 overflow-hidden border-glass glass-surface" data-accordion-id="security">
                        <div class="p-3.5 p-md-4 d-flex flex-wrap align-items-center justify-content-between gap-2 cursor-pointer" data-action="system:toggle_accordion" data-target="security" role="button" aria-expanded="false">
                            <div class="d-flex align-items-center gap-3">
                                <div class="rounded-4 p-2.5 d-flex align-items-center justify-content-center shadow-2xs accordion-icon-box accordion-icon-box--green">
                                    <i class="bi bi-shield-lock-fill fs-4"></i>
                                </div>
                                <div>
                                    <div class="d-flex align-items-center gap-2 flex-wrap mb-0.5">
                                        <h6 class="mb-0 fw-bold text-truncate accordion-title">Cloud & Seguridad</h6>
                                        <span class="fw-bold accordion-badge accordion-badge--green">AES-256 OK</span>
                                    </div>
                                    <span class="text-muted d-block text-truncate accordion-sub">Aislamiento Multitenant & RBAC</span>
                                </div>
                            </div>
                            <div class="d-flex align-items-center gap-2 ms-auto">
                                <i class="bi bi-chevron-down accordion-chevron fs-6 text-muted"></i>
                            </div>
                        </div>
                        <div class="accordion-body-content border-top border-glass">
                            <div class="accordion-scroll-body p-3.5 p-md-4">
                                <div class="accordion-inner-frame p-3.5 p-md-4 rounded-4 border-glass bg-white-5 mb-1">
                                    <p class="mb-3.5 small accordion-desc-text">
                                        Infraestructura distribuida con aislamiento estricto de datos y control de acceso RBAC.
                                    </p>
                                    <div class="p-3 rounded-4 bg-white-10 border border-white-10 shadow-2xs">
                                        <div class="d-flex align-items-center gap-2 mb-1">
                                            <i class="bi bi-key-fill text-success"></i>
                                            <span class="metric-event-text">Firewall Perimetral Activo</span>
                                        </div>
                                        <span class="text-muted small">Auditoría de integridad 100% completada</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        `;
    },
    init() {
        const section = document.getElementById('system-widgets-section');
        if (!section || section._bucaInit) return;
        section._bucaInit = true;

        // Delegated click handler utilizing EventBus
        section.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-action="system:toggle_accordion"]');
            if (!trigger) return;

            const targetId = trigger.getAttribute('data-target');
            const item = trigger.closest('.system-accordion-item');
            if (!item) return;

            const content = item.querySelector('.accordion-body-content');
            const chevron = item.querySelector('.accordion-chevron');
            if (!content) return;

            const isCurrentlyOpen = content.classList.contains('show');

            // Emit event before state change
            eventBus.emit('ui:accordion:toggle', { id: targetId, newState: !isCurrentlyOpen });

            if (isCurrentlyOpen) {
                content.classList.remove('show');
                trigger.setAttribute('aria-expanded', 'false');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('show');
                trigger.setAttribute('aria-expanded', 'true');
                if (chevron) chevron.style.transform = 'rotate(180deg)';
            }
        });

        // External control support via EventBus (Single registration via guard)
        if (!this._eventBusBound) {
            eventBus.on('ui:accordion:set_state', ({ id, open }) => {
                const item = document.querySelector(`.system-accordion-item[data-accordion-id="${id}"]`);
                if (!item) return;
                const content = item.querySelector('.accordion-body-content');
                const trigger = item.querySelector('[data-action="system:toggle_accordion"]');
                const chevron = item.querySelector('.accordion-chevron');
                
                if (open) {
                    content.classList.add('show');
                    trigger.setAttribute('aria-expanded', 'true');
                    if (chevron) chevron.style.transform = 'rotate(180deg)';
                } else {
                    content.classList.remove('show');
                    trigger.setAttribute('aria-expanded', 'false');
                    if (chevron) chevron.style.transform = 'rotate(0deg)';
                }
            });
            this._eventBusBound = true;
        }
    }
};
export default SystemWidgets;
