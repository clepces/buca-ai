/**
 * @fileoverview BusinessHub Component (Módulo de Negocios)
 * @module modules/business/components/BusinessHub
 * @description Gestión de unidades de negocio conectadas a Firebase Firestore con display_cache.
 */

import { escapeHTML } from '@/shared/utils/security.js';
import ModalService from '@/shared/ui/overlays/ModalService.js';
import { eventBus } from '@/core/eventBus/index.js';
import { businessService } from '@/modules/workspace/services/BusinessService.js';

export const BusinessHub = {
    _items: [],
    _isLoading: true,
    _currentFilter: 'all',

    render() {
        return `
            <section class="ws-section ws-business-hub mb-4" id="business-hub-section">
                <div class="section-header d-flex justify-content-between align-items-center mb-3">
                    <h2 class="section-title h6 fw-bold mb-0 text-main d-flex align-items-center gap-2">
                        <i class="bi bi-briefcase-fill text-primary"></i> Mis Negocios
                    </h2>
                    
                    <div class="d-flex align-items-center gap-3">
                        <div class="carousel-arrows d-flex gap-1">
                            <button type="button" class="nav-arrow-sm" id="hub-prev" title="Desplazar Izquierda"><i class="bi bi-chevron-left"></i></button>
                            <button type="button" class="nav-arrow-sm" id="hub-next" title="Desplazar Derecha"><i class="bi bi-chevron-right"></i></button>
                        </div>
                        <button type="button" class="btn-link-action" id="btn-open-command-center">
                            Ver todos <i class="bi bi-arrow-up-right-square ms-1"></i>
                        </button>
                    </div>
                </div>
                
                <div class="hub-compact-wrapper">
                    <div class="hub-scroll-container" id="hub-scroll-container">
                        ${this.renderCards()}
                    </div>
                </div>
            </section>
        `;
    },

    renderCards() {
        if (this._isLoading) {
            return `
                <div class="hub-card-compact d-flex align-items-center justify-content-center p-3 opacity-75">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span class="small text-muted">Sincronizando con Firestore...</span>
                </div>
                <div class="hub-card-compact add-new clickable" data-action="ui:open_create_business">
                    <div class="add-icon"><i class="bi bi-plus-lg"></i></div>
                    <span>Nueva Unidad</span>
                </div>
            `;
        }

        if (this._items.length === 0) {
            return `
                <div class="hub-empty-state d-flex align-items-center p-3 rounded-4 glass-surface border-glass shadow-lg">
                    <div class="hub-icon-box p-2.5 rounded-3 me-3 d-flex align-items-center justify-content-center shadow-2xs">
                        <i class="bi bi-buildings fs-5"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-0 fw-bold small text-main">Sin unidades registradas</h6>
                        <span class="x-small text-muted">Haga clic en "+" para dar de alta su primera empresa real</span>
                    </div>
                </div>
                
                <div class="hub-card-compact add-new clickable" data-action="ui:open_create_business">
                    <div class="add-icon"><i class="bi bi-plus-lg"></i></div>
                    <span>Nueva Unidad</span>
                </div>
            `;
        }

        return `
            ${this._items.map(b => this.renderCompactCard(b)).join('')}
            
            <div class="hub-card-compact add-new clickable" data-action="ui:open_create_business">
                <div class="add-icon"><i class="bi bi-plus-lg"></i></div>
                <span>Nueva Unidad</span>
            </div>
        `;
    },

    renderCompactCard(business) {
        const { name, type, status = 'Active', membership_type = 'owner' } = business;
        const isWarning = String(status).toLowerCase() === 'warning';
        const isOwner = membership_type === 'owner';
        
        return `
            <div class="hub-card-compact glass-surface clickable" data-action="ui:enter_business" data-payload='{"id": "${business.id}"}'>
                <div class="card-status-line ${isWarning ? 'bg-warning' : 'bg-success'}"></div>
                <div class="card-content">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <span class="card-type text-truncate small fw-bold text-muted">${escapeHTML(type)}</span>
                        <span class="badge ${isOwner ? 'bg-primary-subtle text-primary' : 'bg-info-subtle text-info'} rounded-pill card-badge-role">
                            ${isOwner ? 'OWNER' : 'WORKER'}
                        </span>
                    </div>
                    <h3 class="card-name text-truncate h6 fw-bold" title="${escapeHTML(name)}">${escapeHTML(name)}</h3>
                    <div class="card-meta d-flex justify-content-between align-items-center mt-2">
                        <span class="x-small text-muted"><i class="bi bi-geo-alt me-1"></i>${escapeHTML(business.location || 'Venezuela')}</span>
                        <span class="badge bg-success-subtle text-success font-monospace card-badge-status">Activo</span>
                    </div>
                </div>
            </div>
        `;
    },

    renderFullView() {
        const hasItems = this._items.length > 0;
        return `
            <div class="command-center-container p-2">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="small text-muted fw-bold text-uppercase">Unidades Comerciales (${this._items.length})</span>
                    <button type="button" class="btn btn-sm btn-primary rounded-pill px-3 fw-bold" data-action="ui:open_create_business">
                        <i class="bi bi-plus-lg me-1"></i> Nueva Unidad
                    </button>
                </div>
                <div class="cc-main buca-scroll-area">
                    <div class="row g-3">
                        ${hasItems ? this._items.map(b => `
                            <div class="col-12 col-md-6 col-xl-4">
                                <div class="cc-business-card p-3 border-glass rounded-4 glass-surface shadow-sm h-100">
                                    <div class="d-flex justify-content-between mb-3">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="cc-icon-box bg-white-10 rounded-3 p-2 shadow-2xs">
                                                <i class="bi bi-building fs-5 text-primary"></i>
                                            </div>
                                            <div>
                                                <h4 class="h6 mb-0 fw-bold">${escapeHTML(b.name)}</h4>
                                                <span class="x-small text-muted">${escapeHTML(b.location || 'Sede Principal')}</span>
                                            </div>
                                        </div>
                                        <span class="badge bg-success-subtle text-success rounded-pill">
                                            ${b.membership_type ? b.membership_type.toUpperCase() : 'ACTIVO'}
                                        </span>
                                    </div>
                                    
                                    <div class="cc-metrics-grid row g-2 mb-3">
                                        <div class="col-6">
                                            <div class="cc-metric p-2 bg-white-5 border-glass rounded-3">
                                                <span class="d-block x-small text-muted">FACTURAS</span>
                                                <span class="fw-bold">${b.invoices || 0}</span>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="cc-metric p-2 bg-white-5 border-glass rounded-3">
                                                <span class="d-block x-small text-muted">STAFF</span>
                                                <span class="fw-bold">${b.staff || 1} Activo</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="button" class="btn btn-primary w-100 rounded-pill btn-sm fw-bold shadow-sm" data-action="ui:enter_business" data-payload='{"id": "${b.id}"}'>
                                        Gestionar Unidad <i class="bi bi-arrow-right ms-1"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="col-12 py-5 text-center">
                                <div class="rounded-circle bg-primary-subtle text-primary p-3 mx-auto mb-3 d-inline-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
                                    <i class="bi bi-buildings fs-4"></i>
                                </div>
                                <h5 class="fw-bold mb-1">Sin unidades comerciales registradas</h5>
                                <p class="text-muted small mb-3">Crea tu primera empresa o comercio para activar el Punto de Venta, CRM y control fiscal.</p>
                                <button type="button" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" data-action="ui:open_create_business">
                                    <i class="bi bi-plus-lg me-1"></i> Dar de Alta Mi Negocio
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    async loadBusinesses() {
        try {
            const res = await businessService.getUserBusinesses(null, this._currentFilter);
            if (res.success) {
                this._items = res.data || [];
            }
        } catch (err) {
            console.error('[BusinessHub] Error cargando negocios:', err);
        } finally {
            this._isLoading = false;
            const container = document.getElementById('hub-scroll-container');
            if (container) {
                container.innerHTML = this.renderCards();
            }
        }
    },

    init() {
        const section = document.getElementById('business-hub-section');
        if (!section || section._bucaInit) return;
        section._bucaInit = true;

        this.loadBusinesses();

        eventBus.on('workspace:business_created', () => {
            this._isLoading = true;
            this.loadBusinesses();
        });

        eventBus.on('workspace:refresh_data', () => {
            this.loadBusinesses();
        });

        eventBus.on('auth:login-success', () => {
            businessService.clearCache();
            this._isLoading = true;
            this.loadBusinesses();
        });

        eventBus.on('workspace:filter_context', (payload = {}) => {
            const filter = payload?.filter || payload?.context || 'all';
            this._currentFilter = filter === 'properties' ? 'owner' : (filter === 'collaborations' ? 'worker' : 'all');
            this._isLoading = true;
            this.loadBusinesses();
        });

        section.addEventListener('click', (e) => {
            const prev = e.target.closest('#hub-prev');
            const next = e.target.closest('#hub-next');
            const container = section.querySelector('#hub-scroll-container');

            if (prev && container) {
                container.scrollBy({ left: -220, behavior: 'smooth' });
                return;
            }
            if (next && container) {
                container.scrollBy({ left: 220, behavior: 'smooth' });
                return;
            }

            const btnFull = e.target.closest('#btn-open-command-center');
            if (btnFull) {
                ModalService.showModal({
                    size: 'lg',
                    header: {
                        left: `
                            <div class="d-flex align-items-center gap-2">
                                <div class="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                                    <i class="bi bi-buildings-fill fs-5"></i>
                                </div>
                                <div>
                                    <h3 class="h6 fw-bold mb-0">Centro de Comando de Negocios</h3>
                                    <span class="x-small text-muted text-uppercase">Gestión Global de Unidades</span>
                                </div>
                            </div>
                        `,
                        right: '<button type="button" class="btn-close" data-action="ui:close_modal" aria-label="Cerrar"></button>'
                    },
                    body: this.renderFullView(),
                    footer: {
                        right: '<button type="button" class="btn btn-secondary rounded-pill px-4" data-action="ui:close_modal">Cerrar</button>'
                    }
                });
            }
        });
    }
};

export default BusinessHub;
