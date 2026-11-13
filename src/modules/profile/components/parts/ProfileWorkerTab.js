/**
 * ProfileWorkerTab - Plantilla profesional para la pestaña de Talento & Fichas Laboral.
 * =====================================================================================
 * Estructura limpia y amigable:
 * Top: 4 Tarjetas de Métricas & Estado Operativo con Custom Dropdown Selector
 * Izquierda: Talento & Habilidades (Ocupación, Presentación & Habilidades con Puntos y Scroll)
 * Derecha: Fichas Laboral (Historial en comercios con Puestos y Horarios por Turnos)
 * =====================================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const renderFichaCardHtml = (card, idx = 0) => {
    let roleList = [];
    if (Array.isArray(card.roles) && card.roles.length > 0) {
        roleList = card.roles;
    } else if (card.job_role) {
        roleList = card.job_role.split(/[,/•&]/).map(r => r.trim()).filter(Boolean);
    }
    if (roleList.length === 0) roleList = ['Operador Comercial'];

    const rolesHtml = roleList.map(r => `
        <span class="role-badge-pill shadow-2xs">
            <i class="bi bi-briefcase-fill me-1"></i>${escapeHTML(r)}
        </span>
    `).join(' ');

    const shiftList = (Array.isArray(card.shifts) && card.shifts.length > 0)
        ? card.shifts
        : [
            { name: 'Turno Asignado', time: card.schedule_label || '08:00 AM - 05:00 PM', days: 'Lunes a Sábado', theme: 'primary' },
            { name: 'Descanso', time: 'Día Libre', days: 'Domingos Libres', theme: 'success' }
        ];

    const badgeThemes = {
        primary: 'bg-primary-subtle text-primary border-primary-subtle',
        purple: 'bg-purple-subtle text-purple border-purple-subtle',
        warning: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
        success: 'bg-success-subtle text-success border-success-subtle'
    };

    const shiftsHtml = shiftList.map(s => {
        const badgeClass = badgeThemes[s.theme] || badgeThemes.primary;
        return `
            <div class="shift-badge-item">
                <div class="shift-info-group">
                    <span class="badge ${badgeClass} border rounded-pill shift-name-tag">${escapeHTML(s.name)}</span>
                    <span class="shift-time-val text-main">${escapeHTML(s.time)}</span>
                </div>
                <span class="badge bg-body-secondary text-muted border shift-days-badge font-monospace">
                    <i class="bi bi-calendar-week me-1"></i>${escapeHTML(s.days)}
                </span>
            </div>
        `;
    }).join('');

    const cardId = card.id || `exp_${idx}_${Date.now()}`;
    const cardJson = escapeHTML(JSON.stringify({ ...card, id: cardId, roles: roleList, shifts: shiftList }));

    return `
        <div class="p-3 rounded-4 experience-card-item mb-3 shadow-xs position-relative collapsed" data-card-id="${escapeHTML(cardId)}" data-ficha-json="${cardJson}">
            <!-- HEADER (SIEMPRE VISIBLE) -->
            <div class="d-flex align-items-center justify-content-between cursor-pointer ficha-header-toggle" onclick="
                const cards = this.closest('#experience-cards-list').querySelectorAll('.experience-card-item');
                cards.forEach(c => {
                    if (c !== this.parentElement) c.classList.add('collapsed');
                });
                this.parentElement.classList.toggle('collapsed');
            ">
                <div class="d-flex align-items-center gap-2.5 min-w-0">
                    <div class="profile-icon-box-sm rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0">
                        <i class="bi bi-building-check"></i>
                    </div>
                    <div class="min-w-0">
                        <div class="fw-bold text-main small text-truncate exp-company-name">${escapeHTML(card.company_name)}</div>
                        <div class="d-flex gap-2">
                            <span class="badge bg-success-subtle text-success border border-success-subtle profile-badge-micro">
                                <i class="bi bi-patch-check-fill me-1"></i>Verificado
                            </span>
                            <span class="text-muted profile-subtext-micro">${escapeHTML(card.date_range)}</span>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                    <button type="button" class="btn btn-sm text-primary p-0 border-0 btn-edit-experience-card" title="Editar Ficha" data-card-id="${escapeHTML(cardId)}">
                        <i class="bi bi-pencil-square fs-6"></i>
                    </button>
                    <button type="button" class="btn btn-sm text-danger p-0 border-0 btn-delete-experience-card" title="Eliminar Ficha">
                        <i class="bi bi-trash3-fill fs-6"></i>
                    </button>
                    <i class="bi bi-chevron-down text-muted fs-6 ms-2 transition-transform"></i>
                </div>
            </div>

            <!-- CUERPO EXPANDIBLE -->
            <div class="ficha-details-body mt-3 pt-3 border-top">
                <div class="row g-3">
                    <div class="col-12">
                        <div class="d-flex flex-wrap gap-3 mb-3">
                            <div class="bg-body-secondary px-3 py-2 rounded-3 border">
                                <span class="profile-subtext-micro text-muted fw-bold d-block">Fecha de Ingreso:</span>
                                <span class="small text-main fw-semibold">${escapeHTML(card.date_range.split('-')[0].trim())}</span>
                            </div>
                            <div class="bg-body-secondary px-3 py-2 rounded-3 border">
                                <span class="profile-subtext-micro text-muted fw-bold d-block">Tipo de Contrato:</span>
                                <span class="small text-main fw-semibold">${escapeHTML(card.contract_type || 'Tiempo Completo')}</span>
                            </div>
                            <div class="bg-body-secondary px-3 py-2 rounded-3 border">
                                <span class="profile-subtext-micro text-muted fw-bold d-block">Departamento:</span>
                                <span class="small text-main fw-semibold">${escapeHTML(card.department || 'Operaciones')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="mb-2">
                            <span class="profile-subtext-micro text-muted fw-bold d-block mb-1">
                                <i class="bi bi-person-workspace text-primary me-1"></i>Puestos Ocupados:
                            </span>
                            <div class="d-flex flex-wrap gap-1.5">${rolesHtml}</div>
                        </div>
                        <div class="mb-2">
                             <span class="profile-subtext-micro text-muted fw-bold d-block mb-1">
                                <i class="bi bi-geo-alt-fill text-danger me-1"></i>Sede / Lugar de Trabajo:
                            </span>
                            <span class="small text-main font-monospace">${escapeHTML(card.branch_location)}</span>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="mb-2">
                            <span class="profile-subtext-micro text-muted fw-bold d-block mb-1">
                                <i class="bi bi-person-badge text-info me-1"></i>Supervisor Directo:
                            </span>
                            <span class="small text-main">${escapeHTML(card.supervisor || 'Nombre Supervisor Ejemplo')}</span>
                        </div>
                    </div>
                </div>

                <div class="mt-3 p-3 rounded-3 bg-body border border-primary-subtle">
                    <span class="profile-subtext-micro fw-bold text-primary d-block mb-2">
                        <i class="bi bi-clock-history text-primary me-1"></i>Horarios y Turnos Asignados:
                    </span>
                    <div class="d-flex flex-column gap-2 exp-shifts-container">${shiftsHtml}</div>
                </div>

                <div class="mt-3">
                    <span class="profile-subtext-micro text-muted fw-bold d-block mb-1">
                        <i class="bi bi-lightbulb text-warning me-1"></i>Logros Destacados:
                    </span>
                    <p class="small text-muted mb-0">${escapeHTML(card.achievements || 'Optimización de procesos de cierre y atención al cliente.')}</p>
                </div>
            </div>
        </div>
    `;
};

export const ProfileWorkerTab = (data = {}) => {
    const { 
        repScore = 5.0, 
        shiftsCount = 350, 
        jobTitle = 'Cajero Comercial & Operador ERP', 
        availStatus = 'available', 
        bio = '', 
        skillsList = [],
        experienceCards = []
    } = data;

    const defaultSkills = [
        { name: 'Manejo de Caja & Cuadres', icon: 'bi-cash-coin', pts: '1,500 Pts' },
        { name: 'Gestión de Inventario FIFO', icon: 'bi-boxes', pts: '1,280 Pts' },
        { name: 'Operación Multimoneda BCV/USDT', icon: 'bi-currency-exchange', pts: '1,450 Pts' },
        { name: 'Facturación & Ticketera SENIAT', icon: 'bi-receipt', pts: '1,100 Pts' },
        { name: 'Atención al Cliente & POS', icon: 'bi-person-check-fill', pts: '980 Pts' },
        { name: 'Auditoría de Cierres de Turno', icon: 'bi-shield-check', pts: '1,320 Pts' }
    ];

    const formattedSkills = (Array.isArray(skillsList) && skillsList.length > 0)
        ? skillsList.map((item, idx) => {
            if (typeof item === 'string') {
                const defaultFallback = defaultSkills[idx % defaultSkills.length];
                return {
                    name: item,
                    icon: defaultFallback.icon,
                    pts: defaultFallback.pts
                };
            }
            return {
                name: item.name || 'Habilidad Comercial',
                icon: item.icon || 'bi-stars',
                pts: item.pts || '1,000 Pts'
            };
        })
        : defaultSkills;

    const expCards = (Array.isArray(experienceCards) && experienceCards.length > 0)
        ? experienceCards
        : [
            {
                id: 'exp_01',
                company_name: 'BUCA Enterprise Main HQ',
                job_role: 'Super Administrador & Arquitecto Principal ERP',
                roles: ['Super Administrador ERP', 'Arquitecto Principal POS'],
                date_range: '2024 - Presente (2 años)',
                branch_location: 'Caracas - Centro Empresarial B.U.C.A.',
                schedule_label: '08:00 AM - 05:00 PM (Turno Rotativo)',
                shifts: [
                    { name: 'Turno Mañana', time: '08:00 AM - 01:00 PM', days: 'Lunes a Miércoles', theme: 'primary' },
                    { name: 'Turno Tarde', time: '02:00 PM - 07:00 PM', days: 'Jueves a Sábado', theme: 'purple' },
                    { name: 'Descanso', time: 'Día Libre', days: 'Domingos Libres', theme: 'success' }
                ],
                is_verified: true
            },
            {
                id: 'exp_02',
                company_name: 'Comercializadora Gran Plaza C.A.',
                job_role: 'Gerente de Caja & Tesorería Multimoneda',
                roles: ['Gerente de Caja', 'Tesorero BCV/USDT'],
                date_range: '2022 - 2024 (2 años)',
                branch_location: 'Sucursal Central Baruta',
                schedule_label: '08:00 AM - 04:00 PM (Turno Fijo)',
                shifts: [
                    { name: 'Turno Mañana', time: '08:00 AM - 01:00 PM', days: 'Lunes a Viernes', theme: 'primary' },
                    { name: 'Turno Tarde', time: '01:00 PM - 05:00 PM', days: 'Sábados Especiales', theme: 'warning' },
                    { name: 'Descanso', time: 'Día Libre', days: 'Domingos Libres', theme: 'success' }
                ],
                is_verified: true
            }
        ];

    const statusMeta = {
        available: { label: 'Disponible en Turno', dotClass: 'status-dot-available' },
        busy: { label: 'Ocupado en Arqueo', dotClass: 'status-dot-busy' },
        on_leave: { label: 'Guardia / Supervisión', dotClass: 'status-dot-on_leave' },
        offline: { label: 'Fuera de Servicio', dotClass: 'status-dot-offline' }
    };

    const currentStatus = statusMeta[availStatus] || statusMeta.available;

    return `
        <div class="tab-content-pane" id="tab-profile-worker">
            <form id="form-profile-worker">
                
                <!-- TOP SECTION: 4 TARJETAS UNIVERSALES DE MÉTRICAS & ESTADO OPERATIVO -->
                <div class="row g-3 mb-4">
                    <!-- CARD 1: REPUTACIÓN OPERATIVA -->
                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="profile-top-metric-card">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="metric-label-title">Reputación Operativa</span>
                                    <i class="bi bi-star-fill text-warning fs-5"></i>
                                </div>
                                <div class="d-flex align-items-baseline gap-1 mb-1">
                                    <span class="metric-val-hero text-main">${repScore}</span>
                                    <span class="small text-muted fw-bold">/ 5.0</span>
                                </div>
                            </div>
                            <div>
                                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill profile-badge-micro">
                                    <i class="bi bg-warning me-1"></i>Excelente Valoración
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 2: TURNOS DE SERVICIO -->
                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="profile-top-metric-card">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="metric-label-title">Turnos de Servicio</span>
                                    <i class="bi bi-check2-circle text-primary fs-5"></i>
                                </div>
                                <div class="d-flex align-items-baseline gap-1 mb-1">
                                    <span class="metric-val-hero text-primary font-monospace">${shiftsCount}</span>
                                    <span class="small text-muted fw-bold">jornadas</span>
                                </div>
                            </div>
                            <div>
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill profile-badge-micro">
                                    <i class="bi bi-shield-check me-1"></i>Asistencia 100%
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 3: ÍNDICE DE COMPETENCIA -->
                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="profile-top-metric-card">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-1">
                                    <span class="metric-label-title">Índice de Competencia</span>
                                    <i class="bi bi-award-fill text-success fs-5"></i>
                                </div>
                                <div class="d-flex align-items-baseline gap-1 mb-1">
                                    <span class="metric-val-hero text-success">98%</span>
                                    <span class="small text-muted fw-bold">nivel</span>
                                </div>
                            </div>
                            <div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill profile-badge-micro">
                                    <i class="bi bi-award me-1"></i>Especialista Calificado
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- CARD 4: ESTADO OPERATIVO ACTUAL (CUSTOM DROPDOWN SELECTOR) -->
                    <div class="col-12 col-sm-6 col-md-3">
                        <div class="profile-top-metric-card position-relative">
                            <div>
                                <div class="d-flex align-items-center justify-content-between mb-1.5">
                                    <span class="metric-label-title">
                                        <i class="bi bi-broadcast text-primary me-1 animate__animated animate__flash animate__infinite"></i>Estado Operativo
                                    </span>
                                    <span class="badge bg-success-subtle text-success border border-success-subtle profile-badge-micro">En Línea</span>
                                </div>

                                <!-- CUSTOM STATUS DROPDOWN (SIN INPUT SELECT NATIVO) -->
                                <div class="custom-status-dropdown mb-1" id="custom-status-dropdown">
                                    <button type="button" class="status-trigger-btn shadow-2xs" id="btn-status-dropdown-trigger" aria-haspopup="true" aria-expanded="false">
                                        <div class="d-flex align-items-center gap-2 min-w-0">
                                            <span class="status-dot ${currentStatus.dotClass}" id="status-current-dot"></span>
                                            <span class="status-current-label text-truncate" id="status-current-label">${escapeHTML(currentStatus.label)}</span>
                                        </div>
                                        <i class="bi bi-chevron-down text-muted ms-1 profile-subtext-micro"></i>
                                    </button>

                                    <!-- MENÚ FLOTANTE DE ESTADO -->
                                    <div class="status-dropdown-menu d-none" id="status-dropdown-menu">
                                        <div class="status-option-item ${availStatus === 'available' ? 'selected' : ''}" data-value="available" data-label="Disponible en Turno" data-dot="status-dot-available">
                                            <span class="status-dot status-dot-available"></span>
                                            <span>Disponible en Turno</span>
                                        </div>
                                        <div class="status-option-item ${availStatus === 'busy' ? 'selected' : ''}" data-value="busy" data-label="Ocupado en Arqueo" data-dot="status-dot-busy">
                                            <span class="status-dot status-dot-busy"></span>
                                            <span>Ocupado en Arqueo</span>
                                        </div>
                                        <div class="status-option-item ${availStatus === 'on_leave' ? 'selected' : ''}" data-value="on_leave" data-label="Guardia / Supervisión" data-dot="status-dot-on_leave">
                                            <span class="status-dot status-dot-on_leave"></span>
                                            <span>Guardia / Supervisión</span>
                                        </div>
                                        <div class="status-option-item ${availStatus === 'offline' ? 'selected' : ''}" data-value="offline" data-label="Fuera de Servicio" data-dot="status-dot-offline">
                                            <span class="status-dot status-dot-offline"></span>
                                            <span>Fuera de Servicio</span>
                                        </div>
                                    </div>

                                    <!-- INPUT OCULTO CON EL VALOR REAL PARA EL FORMULARIO -->
                                    <input type="hidden" id="worker-avail-status" value="${escapeHTML(availStatus)}">
                                </div>
                            </div>

                            <div class="d-flex align-items-center justify-content-between pt-1 border-top profile-subtext-micro text-muted">
                                <span><i class="bi bi-shield-check text-success me-1"></i>Sincronizado POS</span>
                                <span class="font-monospace text-primary fw-bold">Modo Activo</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- MAIN SPLIT LAYOUT: IZQUIERDA (TALENTO & HABILIDADES) | DERECHA (FICHAS LABORAL) -->
                <div class="row g-3 mb-4">
                    
                    <!-- COLUMNA IZQUIERDA: TALENTO & HABILIDADES DEL USUARIO -->
                    <div class="col-12 col-lg-6">
                        <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100 d-flex flex-column">
                            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                                    <i class="bi bi-person-stars text-primary"></i> Talento & Habilidades
                                </h5>
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle profile-badge-micro">
                                    Perfil Personal
                                </span>
                            </div>

                            <div class="alert alert-primary border-0 bg-primary-subtle text-main p-2.5 rounded-3 mb-3 profile-subtext-micro">
                                <i class="bi bi-info-circle-fill text-primary me-1"></i>
                                <strong>Perfil de Usuario:</strong> Define tu ocupación u oficio en la plataforma y tus habilidades prácticas. Al trabajar en comercios, los dueños valoran tu desempeño otorgándote puntos.
                            </div>

                            <!-- CAMPOS DEL USUARIO (OCUPACIÓN & PRESENTACIÓN) -->
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                    Ocupación o Especialidad <span class="text-danger">*</span>
                                </label>
                                <input type="text" id="worker-job-title" class="form-control glass-input fw-semibold" value="${escapeHTML(jobTitle)}" required placeholder="ej. Cajero Comercial & Operador ERP, Vendedor, Administrador...">
                                <div class="form-text text-muted profile-subtext-micro">Tu labor u ocupación principal visible en la plataforma.</div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                    Presentación Personal / Biografía Breve
                                </label>
                                <textarea id="worker-bio" class="form-control glass-input" rows="2" placeholder="Resumen de tu experiencia, responsabilidad y fortalezas...">${escapeHTML(bio)}</textarea>
                                <div class="form-text text-muted profile-subtext-micro">Breve reseña sobre tus cualidades laborales.</div>
                            </div>

                            <!-- SUBSECCIÓN: HABILIDADES QUE EL USUARIO POSEE (CON SCROLL INTERNO) -->
                            <div class="border-top pt-3 flex-grow-1 d-flex flex-column">
                                <div class="d-flex align-items-center justify-content-between mb-2">
                                    <span class="fw-bold small text-main d-flex align-items-center gap-1.5">
                                        <i class="bi bi-award-fill text-warning"></i> Habilidades Prácticas (Valoradas por Comercios)
                                    </span>
                                    <button type="button" id="btn-add-skill" class="btn btn-outline-primary btn-sm rounded-pill px-2.5 py-0.5 fw-bold profile-badge-sm shadow-xs">
                                        <i class="bi bi-plus-lg me-1"></i>Agregar Habilidad
                                    </button>
                                </div>
                                
                                <div class="text-muted profile-subtext-micro mb-2">
                                    Habilidades que posees y puedes agregar o quitar libremente. La puntuación refleja la valoración otorgada por los negocios donde has colaborado.
                                </div>

                                <!-- CONTENEDOR CON SCROLL GLOBAL UNIFICADO PARA HABILIDADES -->
                                <div class="buca-scroll-area buca-scroll-area--sm flex-grow-1" id="skills-list-container">
                                    <div class="row g-2" id="skills-cards-row">
                                        ${formattedSkills.map((sk, idx) => `
                                            <div class="col-12 col-sm-6 skill-card-wrapper" data-skill-index="${idx}">
                                                <div class="p-2.5 rounded-3 skill-card-item d-flex align-items-center justify-content-between gap-2 shadow-xs">
                                                    <div class="d-flex align-items-center gap-2 min-w-0">
                                                        <i class="bi ${escapeHTML(sk.icon)} text-primary fs-6 flex-shrink-0"></i>
                                                        <span class="fw-semibold small text-main text-truncate skill-name-label">${escapeHTML(sk.name)}</span>
                                                    </div>
                                                    <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                                                        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle font-monospace profile-badge-micro skill-pts-badge">${escapeHTML(sk.pts)}</span>
                                                        <button type="button" class="btn btn-sm text-danger p-0 border-0 btn-delete-skill" title="Quitar habilidad">
                                                            <i class="bi bi-x-circle-fill fs-6"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: FICHAS LABORAL (HISTORIAL EN COMERCIOS CON SCROLL GLOBAL UNIFICADO) -->
                    <div class="col-12 col-lg-6">
                        <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100 d-flex flex-column">
                            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                                    <i class="bi bi-journal-bookmark-fill text-success"></i> Fichas Laboral
                                </h5>
                                <button type="button" id="btn-add-experience-card" class="btn btn-outline-success btn-sm rounded-pill px-3 py-1 fw-bold profile-badge-sm shadow-xs">
                                    <i class="bi bi-plus-lg me-1"></i>Agregar Ficha
                                </button>
                            </div>

                            <div class="alert alert-success border-0 bg-success-subtle text-main p-2.5 rounded-3 mb-3 profile-subtext-micro">
                                <i class="bi bi-journal-check text-success me-1"></i>
                                <strong>Fichas Laboral:</strong> Registro de empresas y comercios donde has prestado servicio. Muestra puestos desempeñados y horarios asignados por turnos (Mañana, Tarde, Noche).
                            </div>

                            <!-- CONTENEDOR CON SCROLL GLOBAL UNIFICADO PARA ADMITIR FICHAS -->
                            <div class="buca-scroll-area buca-scroll-area--md flex-grow-1" id="experience-cards-list">
                                ${expCards.map((card, idx) => renderFichaCardHtml(card, idx)).join('')}
                            </div>
                        </div>
                    </div>

                </div>

                <!-- BOTÓN SUBMIT LABORAL -->
                <div class="d-flex justify-content-end">
                    <button type="submit" id="btn-save-profile-worker" class="btn btn-primary rounded-pill px-4 py-2.5 fw-bold shadow-sm">
                        <i class="bi bi-cloud-arrow-up-fill me-2"></i> Actualizar Talento & Fichas en Supabase
                    </button>
                </div>
            </form>
        </div>
    `;
};

export default ProfileWorkerTab;
