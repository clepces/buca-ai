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
        repScore = 0.0, 
        shiftsCount = 0, 
        jobTitle = '', 
        availStatus = 'available', 
        bio = '', 
        skillsList = [],
        experienceCards = []
    } = data;

    const formattedSkills = (Array.isArray(skillsList) && skillsList.length > 0)
        ? skillsList.map((item) => {
            if (typeof item === 'string') {
                return {
                    name: item,
                    icon: 'bi-check2-circle',
                    pts: '0 Pts'
                };
            }
            return {
                name: item.name || 'Habilidad Comercial',
                icon: item.icon || 'bi-stars',
                pts: item.pts || '0 Pts'
            };
        })
        : [];

    const expCards = (Array.isArray(experienceCards) && experienceCards.length > 0)
        ? experienceCards
        : [];

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
                                ${expCards.length > 0
                                    ? expCards.map((card, idx) => renderFichaCardHtml(card, idx)).join('')
                                    : `
                                        <div class="p-4 text-center border rounded-4 bg-body-tertiary">
                                            <i class="bi bi-journal-x fs-2 text-muted mb-2 d-block"></i>
                                            <div class="fw-bold text-main small mb-1">Sin fichas laborales registradas</div>
                                            <div class="text-muted profile-subtext-micro">No tienes historial laboral registrado. Haz clic en "Agregar Ficha" para vincular tus comercios y turnos.</div>
                                        </div>
                                    `
                                }
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
