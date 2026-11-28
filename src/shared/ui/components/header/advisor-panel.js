/**
 * @fileoverview advisor-panel - Centro de Asesoría y Diagnóstico Corporativo (Advisor Center)
 * @module shared/ui/components/header/advisor-panel
 */
import { escapeHTML } from '@/shared/utils/security.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id } from '@/shared/utils/dom.js';
import { ADVISOR_ITEMS } from './advisor-data.js';

export const AdvisorPanel = {
    _activeView: 'list',
    _selectedAdvisor: null,
    _activeCategory: 'all',
    _activeStatus: 'all',
    _activeSeverity: 'all',
    _openFilter: null,
    _eventsBound: false,

    getAdvisors() {
        return ADVISOR_ITEMS;
    },

    _initEvents() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        eventBus.on('advisor:show_detail', (payload) => this.showDetail(payload?.id));
        eventBus.on('advisor:back_to_list', () => this.backToList());
        eventBus.on('advisor:toggle_filter', (payload) => this.toggleFilter(payload?.filter));
        eventBus.on('advisor:select_filter', (payload) => this.selectFilter(payload?.type, payload?.value));
        eventBus.on('advisor:clear_filters', () => this.clearFilters());
    },

    showDetail(id) {
        this._selectedAdvisor = this.getAdvisors().find(a => a.id === id) || null;
        this._activeView = 'detail';
        this._openFilter = null;
        this.refresh();
    },

    backToList() {
        this._selectedAdvisor = null;
        this._activeView = 'list';
        this._openFilter = null;
        this.refresh();
    },

    toggleFilter(filterName) {
        this._openFilter = this._openFilter === filterName ? null : filterName;
        this.refresh();
    },

    selectFilter(type, value) {
        if (type === 'category') this._activeCategory = value;
        if (type === 'status') this._activeStatus = value;
        if (type === 'severity') this._activeSeverity = value;
        this._openFilter = null;
        this.refresh();
    },

    clearFilters() {
        this._activeCategory = 'all';
        this._activeStatus = 'all';
        this._activeSeverity = 'all';
        this._openFilter = null;
        this.refresh();
    },

    refresh() {
        const panel = $id('panel-advisor');
        if (panel) {
            panel.innerHTML = this._renderInner();
        }
    },

    _getFilteredAdvisors() {
        return this.getAdvisors().filter(adv => {
            if (this._activeCategory !== 'all' && adv.categoryKey !== this._activeCategory) return false;
            if (this._activeStatus !== 'all' && adv.status !== this._activeStatus) return false;
            if (this._activeSeverity !== 'all' && adv.severity !== this._activeSeverity) return false;
            return true;
        });
    },

    _renderFilterPopover(type) {
        const categories = ['Security', 'Performance', 'Health'];
        const statuses = [{ id: 'unread', label: 'No leído' }, { id: 'archived', label: 'Archivado' }];
        const severities = [{ id: 'warning', label: 'Auditoría / Warning' }, { id: 'info', label: 'Información' }, { id: 'success', label: 'Óptimo' }];

        let title = 'Seleccionar categoría';
        let items = categories.map(c => ({ id: c, label: c, active: this._activeCategory === c }));

        if (type === 'status') {
            title = 'Seleccionar estado';
            items = statuses.map(s => ({ ...s, active: this._activeStatus === s.id }));
        } else if (type === 'severity') {
            title = 'Seleccionar gravedad';
            items = severities.map(v => ({ ...v, active: this._activeSeverity === v.id }));
        }

        return `
            <div class="advisor-filter-popover shadow-lg" role="listbox" aria-label="${title}">
                <span class="x-small fw-bold text-muted text-uppercase d-block mb-2">${title}</span>
                <div class="d-flex flex-column gap-1 mb-2">
                    ${items.map(opt => `
                        <button type="button" role="option" aria-selected="${opt.active}" class="btn btn-sm text-start py-1.5 px-2.5 rounded-2 border-0 x-small d-flex align-items-center justify-content-between ${opt.active ? 'bg-primary-subtle text-primary fw-bold' : 'text-main bg-subtle'}" data-action="advisor:select_filter" data-type="${type}" data-value="${opt.id}">
                            <span>${opt.label}</span>
                            ${opt.active ? '<i class="bi bi-check2"></i>' : ''}
                        </button>
                    `).join('')}
                </div>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <button type="button" class="btn btn-link text-muted p-0 x-small text-decoration-none" data-action="advisor:select_filter" data-type="${type}" data-value="all">Limpiar</button>
                    <button type="button" class="btn btn-sm btn-primary py-0.5 px-2.5 x-small rounded-pill" data-action="advisor:toggle_filter" data-filter="${type}">Cerrar</button>
                </div>
            </div>
        `;
    },

    _renderList() {
        const advisors = this._getFilteredAdvisors();
        const catLabel = this._activeCategory !== 'all' ? this._activeCategory : '';
        const statusLabel = this._activeStatus !== 'all' ? this._activeStatus : '';
        return `
            <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-lightbulb-fill text-warning fs-5"></i>
                    <span class="fw-bold small text-main">Advisor Center</span>
                    <span class="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5 x-small">${advisors.length} Activos</span>
                </div>
                <button type="button" class="btn-close-panel btn btn-sm p-0 text-muted" data-action="header:close_all_panels" aria-label="Cerrar panel">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <div class="advisor-filter-bar px-3 py-2 border-bottom bg-subtle d-flex flex-wrap align-items-center gap-1.5 position-relative">
                <button type="button" class="badge rounded-pill px-2.5 py-1 x-small border-0 cursor-pointer d-inline-flex align-items-center gap-1 ${this._activeCategory !== 'all' ? 'bg-primary text-white' : 'bg-secondary-subtle text-muted'}" data-action="advisor:toggle_filter" data-filter="category">
                    <span>Categoría${catLabel ? `: ${catLabel}` : ''}</span>
                    <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i>
                </button>
                <button type="button" class="badge rounded-pill px-2.5 py-1 x-small border-0 cursor-pointer d-inline-flex align-items-center gap-1 ${this._activeStatus !== 'all' ? 'bg-primary text-white' : 'bg-secondary-subtle text-muted'}" data-action="advisor:toggle_filter" data-filter="status">
                    <span>Estado${statusLabel ? `: ${statusLabel}` : ''}</span>
                    <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i>
                </button>
                <button type="button" class="badge rounded-pill px-2.5 py-1 x-small border-0 cursor-pointer d-inline-flex align-items-center gap-1 ${this._activeSeverity !== 'all' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-muted'}" data-action="advisor:toggle_filter" data-filter="severity">
                    <span>Gravedad: ${advisors.length}</span>
                    <i class="bi bi-chevron-down" style="font-size:0.6rem;"></i>
                </button>
                ${this._openFilter ? this._renderFilterPopover(this._openFilter) : ''}
            </div>

            <div class="advisor-list p-2 buca-scroll-area max-h-350" id="advisor-items-container">
                ${advisors.length === 0 ? '<div class="p-4 text-center text-muted small"><i class="bi bi-check2-circle fs-3 text-success d-block mb-1"></i>No hay avisos con los filtros seleccionados</div>' : ''}
                ${advisors.map(adv => `
                    <div class="advisor-card p-2.5 rounded-3 border mb-2 cursor-pointer transition-all" data-action="advisor:show_detail" data-id="${adv.id}" role="button" tabindex="0">
                        <div class="d-flex align-items-start gap-2.5">
                            <div class="advisor-shield-icon flex-shrink-0 mt-0.5 ${adv.severity === 'warning' ? 'text-warning' : (adv.severity === 'success' ? 'text-success' : 'text-primary')}">
                                <i class="bi ${adv.severity === 'success' ? 'bi-shield-fill-check' : (adv.severity === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill')} fs-5"></i>
                            </div>
                            <div class="flex-grow-1 min-w-0">
                                <div class="d-flex align-items-center justify-content-between gap-2 mb-0.5">
                                    <span class="d-block fw-bold text-main small text-truncate">${escapeHTML(adv.title)}</span>
                                    <span class="badge advisor-severity-badge severity-${adv.severity} rounded-pill font-monospace flex-shrink-0">${adv.severityLabel}</span>
                                </div>
                                <span class="d-block text-muted x-small mb-1 text-truncate">${escapeHTML(adv.entity)}</span>
                                <p class="x-small text-muted mb-0 lh-sm line-clamp-2">${escapeHTML(adv.desc)}</p>
                            </div>
                            <i class="bi bi-chevron-right text-muted x-small mt-1 flex-shrink-0"></i>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="p-2.5 bg-subtle border-top d-flex justify-content-between align-items-center">
                <span class="x-small text-muted">Auditoría en tiempo real</span>
                <button type="button" class="btn btn-sm p-0 x-small rounded-pill px-2.5 py-1 fw-semibold text-decoration-none" disabled style="filter:grayscale(1);opacity:.5;cursor:not-allowed;">
                    Ver registro completo <i class="bi bi-arrow-right ms-0.5"></i>
                </button>
            </div>
        `;
    },

    _renderDetail(adv) {
        return `
            <div class="p-3 border-bottom d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2 min-w-0">
                    <button type="button" class="btn btn-sm p-0 text-muted me-1" data-action="advisor:back_to_list" title="Volver a la lista">
                        <i class="bi bi-chevron-left fs-6"></i>
                    </button>
                    <span class="fw-bold small text-main text-truncate">${escapeHTML(adv.title)}</span>
                    <span class="badge advisor-severity-badge severity-${adv.severity} rounded-pill font-monospace ms-1 flex-shrink-0">${adv.severityLabel}</span>
                </div>
                <button type="button" class="btn-close-panel btn btn-sm p-0 text-muted ms-2" data-action="header:close_all_panels">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <div class="advisor-detail-content p-3.5 buca-scroll-area max-h-350">
                <div class="mb-3">
                    <span class="d-block text-muted x-small fw-bold text-uppercase mb-1.5">Entidad</span>
                    <span class="badge bg-secondary-subtle text-main border rounded-2 px-2.5 py-1.5 font-monospace">
                        <i class="bi ${adv.entityIcon || 'bi-shield'} me-1.5"></i>${escapeHTML(adv.entity)}
                    </span>
                </div>

                <div class="mb-3">
                    <span class="d-block text-muted x-small fw-bold text-uppercase mb-1">Problema / Hallazgo</span>
                    <p class="small text-main mb-0 lh-base">${escapeHTML(adv.issue)}</p>
                </div>

                <div class="mb-3.5">
                    <span class="d-block text-muted x-small fw-bold text-uppercase mb-1">Descripción</span>
                    <p class="small text-muted mb-0 lh-base">${escapeHTML(adv.desc)}</p>
                </div>

                <div class="pt-3 border-top">
                    <span class="d-block text-muted x-small fw-bold text-uppercase mb-2">Resolución</span>
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-2.5">
                        <button type="button" class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-semibold" data-action="ui:open_ai_assistant">
                            <i class="bi bi-stars"></i> Consultar Asistente
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-semibold" data-action="${adv.resolveAction || 'ui:open_settings'}">
                            ${adv.resolveLabel || 'Configuración'}
                        </button>
                    </div>
                    <a href="#" class="x-small text-primary text-decoration-none d-inline-flex align-items-center gap-1" data-action="ui:open_docs">
                        Más información <i class="bi bi-box-arrow-up-right x-small"></i>
                    </a>
                </div>
            </div>
        `;
    },

    _renderInner() {
        return this._activeView === 'detail' && this._selectedAdvisor 
            ? this._renderDetail(this._selectedAdvisor) 
            : this._renderList();
    },

    render() {
        this._initEvents();
        return `
            <div id="panel-advisor" class="glass-panel solid-dropdown-panel advisor-dropdown-panel">
                ${this._renderInner()}
            </div>
        `;
    }
};

export default AdvisorPanel;