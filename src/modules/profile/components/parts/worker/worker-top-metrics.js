/**
 * @fileoverview worker-top-metrics - 4 Tarjetas de Métricas & Estado Operativo para Perfil Laboral
 * @module modules/profile/components/parts/worker/worker-top-metrics
 */

import { escapeHTML } from '@/shared/utils/security.js';

export function renderWorkerTopMetrics({ repScore, shiftsCount, availStatus, currentStatus }) {
    return `
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
    `;
}
