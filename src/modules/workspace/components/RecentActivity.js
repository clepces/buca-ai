/**
 * RecentActivity - Sección de Actividad Reciente y Bitácora de Auditoría (Supabase Native)
 * =========================================================================
 * Consume en tiempo real la tabla 'public.activity_log'.
 * Cero datos quemados (hardcoded). Manejo reactivo de eventos.
 * =========================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';
import { ActivityLogService } from '@/core/services/ActivityLogService.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';

export const RecentActivity = {
    _items: [],
    _isLoading: true,
    _unsubActivity: null,
    _filterClickHandler: null,

    _getIconMeta(category) {
        switch (String(category).toLowerCase()) {
            case 'seguridad':
                return { icon: 'bi-shield-check', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', tag: 'SEGURIDAD' };
            case 'sistemas':
                return { icon: 'bi-arrow-repeat', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', tag: 'SISTEMA' };
            case 'operaciones':
            default:
                return { icon: 'bi-building-gear', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)', tag: 'OPERATIVO' };
        }
    },

    render() {
        return `
            <section class="ws-section h-100 d-flex flex-column mb-0" id="recent-activity-section">
                <div class="section-header d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-4 p-2 shadow-2xs d-flex align-items-center justify-content-center bg-primary-subtle text-primary profile-icon-box-sm">
                            <i class="bi bi-clock-history fs-5"></i>
                        </div>
                        <div>
                            <h2 class="section-title h5 fw-bold mb-0 text-main">
                                Actividad & Auditoría
                            </h2>
                            <span class="text-muted small">Bitácora inmutable en Supabase</span>
                        </div>
                    </div>

                    <!-- Category Filters -->
                    <div class="activity-filter-group d-flex align-items-center gap-1 bg-light p-1 rounded-4 border" id="activity-filter-group" role="tablist">
                        <button type="button" class="activity-filter-pill active" data-filter="all">Todas</button>
                        <button type="button" class="activity-filter-pill" data-filter="seguridad">Seguridad</button>
                        <button type="button" class="activity-filter-pill" data-filter="operaciones">Operaciones</button>
                        <button type="button" class="activity-filter-pill" data-filter="sistemas">Sistemas</button>
                    </div>
                </div>

                <div class="card glass-surface p-3 p-md-4 rounded-4 border shadow-sm bg-white flex-grow-1 d-flex flex-column">
                    <!-- CONTENEDOR SCROLL GLOBAL UNIFICADO -->
                    <div class="buca-scroll-area buca-scroll-area--md flex-grow-1" id="activity-list-container">
                        <ul class="list-unstyled mb-0 divide-y" id="activity-list-items">
                            ${this.renderActivityList()}
                        </ul>
                    </div>
                </div>
            </section>
        `;
    },

    renderActivityList() {
        if (this._isLoading) {
            return `
                <li class="py-4 text-center text-muted small">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                    <span>Cargando bitácora de auditoría...</span>
                </li>
            `;
        }

        if (!this._items || this._items.length === 0) {
            return `
                <li class="py-4 text-center text-muted small">
                    <i class="bi bi-journal-check fs-3 d-block mb-2 text-primary opacity-50"></i>
                    <p class="mb-0 fw-semibold text-main">Sin actividad registrada recientemente</p>
                    <span class="x-small">Las operaciones y cambios en el sistema se reflejarán aquí en tiempo real.</span>
                </li>
            `;
        }

        const sessionUser = sessionState.get().user;
        const currentEmail = sessionUser?.email || 'Usuario Activo';

        return this._items.map((act, index) => {
            const meta = this._getIconMeta(act.category);
            const timeStr = act.created_at
                ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Reciente';

            return `
                <li class="activity-item d-flex align-items-start gap-3 py-3 ${index !== 0 ? 'border-top border-light' : ''}" data-category="${escapeHTML(act.category || 'operaciones')}">
                    <div class="widget-icon-box p-2.5 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center shadow-2xs activity-icon-box" style="--icon-bg: ${meta.bg}; --icon-color: ${meta.color}; background-color: var(--icon-bg); color: var(--icon-color);">
                        <i class="bi ${meta.icon} fs-5"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-1 mb-1">
                            <div class="d-flex align-items-center gap-2">
                                <h3 class="h6 fw-bold mb-0 activity-title">${escapeHTML(act.title || act.action)}</h3>
                                <span class="activity-tag px-2 py-0.5 rounded-pill badge bg-secondary-subtle text-secondary">${meta.tag}</span>
                            </div>
                            <span class="activity-time">
                                <i class="bi bi-clock me-1 text-muted"></i>${escapeHTML(timeStr)}
                            </span>
                        </div>
                        <p class="activity-desc small mb-1.5">${escapeHTML(act.description || '')}</p>
                        <div class="d-flex align-items-center gap-2">
                            <span class="activity-user d-flex align-items-center gap-1.5">
                                <i class="bi bi-person-circle text-muted"></i> ${escapeHTML(act.user_email || currentEmail)}
                            </span>
                        </div>
                    </div>
                </li>
            `;
        }).join('');
    },

    async init() {
        this._bindFilterEvents();

        try {
            const acts = await ActivityLogService.getRecentActivities(15);
            this._items = acts;
            this._isLoading = false;
            this._refreshDOM();
        } catch {
            this._isLoading = false;
            this._refreshDOM();
        }

        // Suscribirse de forma limpia a nuevos eventos en tiempo real
        if (typeof this._unsubActivity === 'function') {
            this._unsubActivity();
        }
        this._unsubActivity = eventBus.on('activity:logged', (newAct) => {
            if (newAct) {
                this._items.unshift(newAct);
                this._refreshDOM();
            }
        });
    },

    _refreshDOM() {
        const container = document.getElementById('activity-list-items');
        if (container) {
            container.innerHTML = this.renderActivityList();
        }
    },

    _bindFilterEvents() {
        if (this._filterClickHandler) {
            document.removeEventListener('click', this._filterClickHandler);
        }

        this._filterClickHandler = (e) => {
            const btn = e.target.closest('.activity-filter-pill');
            if (!btn) return;

            const group = btn.closest('#activity-filter-group');
            if (!group) return;

            group.querySelectorAll('.activity-filter-pill').forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.getAttribute('data-filter');
            const items = document.querySelectorAll('#activity-list-items .activity-item');
            items.forEach(item => {
                const itemCat = item.getAttribute('data-category');
                if (cat === 'all' || itemCat === cat) {
                    item.classList.remove('is-hidden');
                    item.style.display = '';
                } else {
                    item.classList.add('is-hidden');
                    item.style.display = 'none';
                }
            });
        };

        document.addEventListener('click', this._filterClickHandler);
    },

    /**
     * Limpieza completa del ciclo de vida para prevenir memory leaks
     */
    destroy() {
        if (typeof this._unsubActivity === 'function') {
            this._unsubActivity();
            this._unsubActivity = null;
        }
        if (this._filterClickHandler) {
            document.removeEventListener('click', this._filterClickHandler);
            this._filterClickHandler = null;
        }
        this._items = [];
        this._isLoading = true;
    }
};

export default RecentActivity;
