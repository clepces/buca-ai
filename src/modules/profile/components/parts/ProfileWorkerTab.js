/**
 * @fileoverview ProfileWorkerTab - Plantilla profesional para la pestaña de Talento & Fichas Laboral.
 * @module modules/profile/components/parts/ProfileWorkerTab
 * @description Orquesta la vista de talento laboral, métricas de reputación, habilidades y fichas de experiencia.
 */

import { renderFichaCardHtml } from './worker/ficha-card.js';
import { renderWorkerTopMetrics } from './worker/worker-top-metrics.js';
import { renderWorkerSkillsPanel } from './worker/worker-skills-panel.js';

export { renderFichaCardHtml };

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
                ${renderWorkerTopMetrics({ repScore, shiftsCount, availStatus, currentStatus })}

                <!-- MAIN SPLIT LAYOUT: IZQUIERDA (TALENTO & HABILIDADES) | DERECHA (FICHAS LABORAL) -->
                <div class="row g-3 mb-4">
                    ${renderWorkerSkillsPanel({ jobTitle, bio, formattedSkills })}

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
