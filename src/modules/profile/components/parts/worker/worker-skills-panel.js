/**
 * @fileoverview worker-skills-panel - Panel de Habilidades Prácticas y Ocupación del Perfil Laboral
 * @module modules/profile/components/parts/worker/worker-skills-panel
 */

import { escapeHTML } from '@/shared/utils/security.js';

export function renderWorkerSkillsPanel({ jobTitle, bio, formattedSkills }) {
    return `
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
                            ${formattedSkills.length > 0
                                ? formattedSkills.map((sk, idx) => `
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
                                `).join('')
                                : `
                                    <div class="col-12">
                                        <div class="p-3 text-center border rounded-3 bg-body-tertiary">
                                            <i class="bi bi-award text-muted fs-3 d-block mb-1"></i>
                                            <span class="small fw-semibold text-main d-block">Sin habilidades registradas</span>
                                            <span class="profile-subtext-micro text-muted">Aún no has agregado competencias laborales. Pulsa "Agregar Habilidad" para registrarlas.</span>
                                        </div>
                                    </div>
                                `
                            }
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
}
