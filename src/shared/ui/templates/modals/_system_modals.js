/**
 * System Modals Template - Plantillas para Terminal, Alertas y Notificaciones
 * =========================================================================
 * Clean architecture, zero inline styles, using neural semantic tokens.
 * =========================================================================
 */
export const terminalTemplate = ({ profile = 'balanced', fps = 60, memory = '4', latency = '20', uptime = 0 } = {}) => `
    <div class="terminal-body p-3 rounded-3">
        <div class="d-flex justify-content-between border-bottom pb-2 mb-2 term-border">
            <span class="term-muted">B.U.C.A Neural Shell (BNE-CLI)</span>
            <span class="term-success">ONLINE</span>
        </div>
        <div class="mb-1"><span class="term-purple">sys.core:</span> Kernel activo en modo <strong class="term-white">${profile.toUpperCase()}</strong> (${fps} FPS)</div>
        <div class="mb-1"><span class="term-purple">sys.memory:</span> JS Heap Asignado: <strong class="term-white">${memory} GB</strong></div>
        <div class="mb-1"><span class="term-purple">sys.network:</span> Latencia hacia Cloud: <strong class="term-success">${latency} ms</strong></div>
        <div class="mb-1"><span class="term-purple">sys.uptime:</span> Tiempo de sesión: <strong class="term-white">${uptime}s</strong></div>
        <div class="mt-3 pt-2 border-top term-border term-prompt">
            buca@workstation:~$ <span class="animate__animated animate__flash animate__infinite">_</span>
        </div>
    </div>
`;

export const helpTemplate = () => `
    <div class="modal-setting-card">
        <div class="card-title-group">
            <i class="bi bi-headset"></i>
            <h5>Centro de Ayuda B.U.C.A</h5>
        </div>
        <p class="small text-muted">¿Necesita asistencia para configurar sus módulos o usuarios corporativos?</p>
        <div class="setting-item-row">
            <span class="setting-label">Soporte Técnico</span>
            <span class="text-primary small fw-semibold">soporte@buca.com.ve</span>
        </div>
        <div class="setting-item-row">
            <span class="setting-label">Documentación ERP</span>
            <span class="text-muted small">Manual de Usuario & Guías Corporativas</span>
        </div>
    </div>
`;

export const alertMiniTemplate = ({ title = 'Atención', message = '', type = 'warning' } = {}) => {
    const icon = type === 'warning' ? 'bi-exclamation-triangle-fill text-warning' : 'bi-info-circle-fill text-info';
    return `
        <div class="mini-alert-container text-center p-2">
            <div class="mb-2 fs-2">
                <i class="bi ${icon}"></i>
            </div>
            <h6 class="fw-bold mb-1">${title}</h6>
            <p class="small text-muted mb-3">${message}</p>
            <button type="button" class="btn btn-sm btn-primary w-100 rounded-pill" data-action="ui:close_modal">
                Entendido
            </button>
        </div>
    `;
};

export const notificationsTemplate = () => `
    <div class="modal-setting-card">
        <div class="card-title-group mb-3">
            <i class="bi bi-bell-fill"></i>
            <h5>Registro Cronológico de Eventos</h5>
        </div>
        <div class="d-flex flex-column gap-2">
            <div class="p-3 rounded-3 modal-event-item">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold small text-primary"><i class="bi bi-cpu me-1"></i> BNE Motor Calibrado</span>
                    <span class="text-muted profile-subtext-micro">Hace 2 min</span>
                </div>
                <p class="small text-muted mb-0">Sincronización automática completada (Perfil L1 Equilibrado).</p>
            </div>
            <div class="p-3 rounded-3 modal-event-item">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold small text-success"><i class="bi bi-currency-exchange me-1"></i> Tasa BCV Actualizada</span>
                    <span class="text-muted profile-subtext-micro">Hace 15 min</span>
                </div>
                <p class="small text-muted mb-0">Tasa oficial establecida en Bs. 889,58 por USD.</p>
            </div>
        </div>
    </div>
`;

export const comingSoonTemplate = ({ title = 'Módulo en Desarrollo', icon = 'bi-rocket-takeoff' } = {}) => `
    <div class="coming-soon-container text-center p-4">
        <div class="header-icon-box mx-auto mb-4" style="width: 64px; height: 64px;">
            <i class="bi ${icon} fs-1 text-white"></i>
            <div class="icon-glow"></div>
        </div>
        <h4 class="fw-bold mb-2">${title}</h4>
        <p class="text-muted mb-4">Esta sección está siendo optimizada bajo los estándares de BUCA OS v5.4. Estará disponible en la próxima actualización de Kernel.</p>
        
        <div class="p-3 rounded-4 glass-surface border-glass bg-white-5 text-start mb-4">
            <div class="d-flex align-items-center gap-2 mb-2">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span class="small fw-bold text-main">Sincronizando con Roadmap Cloud...</span>
            </div>
            <div class="progress rounded-pill bg-dark bg-opacity-10 border-glass" style="height: 6px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated rounded-pill" role="progressbar" style="width: 75%"></div>
            </div>
        </div>

        <button type="button" class="btn btn-primary rounded-pill px-5" data-action="ui:close_modal">
            Notificarme al Activar
        </button>
    </div>
`;

export default {
    terminalTemplate,
    helpTemplate,
    alertMiniTemplate,
    notificationsTemplate,
    comingSoonTemplate
};
