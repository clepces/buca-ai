/**
 * @fileoverview ficha-card - Componente de Tarjeta de Ficha Laboral con roles y horarios expandibles
 * @module modules/profile/components/parts/worker/ficha-card
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
