/**
 * @fileoverview command-palette-modal - Paleta de Comandos y Buscador Global (Ctrl + K)
 * Migrado a ModalServiceV2: input en header-center, switch Lista/Mosaico en header-right,
 * navegación real por teclado (↑↓←→ + Enter) y estrategia UI Viva vs UI Muerta.
 * @module shared/ui/components/header/command-palette-modal
 */
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';
import { renderField } from '@/shared/ui/primitives/ui-field.js';
import { renderButton } from '@/shared/ui/primitives/ui-button.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { $id, $mount, $on } from '@/shared/utils/dom.js';

export const CommandPaletteModal = {
    _viewMode: 'list',
    _activeIndex: 0,

    getItems() {
        return [
            { id: 'sc-1', section: 'ATAJOS', icon: 'bi-keyboard', title: 'Mostrar todos los atajos de teclado', desc: 'Ver combinaciones de teclas activas', action: 'ui:open_shortcuts', status: 'ready' },
            { id: 'sc-2', section: 'ATAJOS', icon: 'bi-house-door', title: 'Ir al Tablero de Control', desc: 'Panel principal del Workspace', action: 'router:navigate', payload: { path: '/workspace' }, status: 'ready' },
            { id: 'sc-3', section: 'ATAJOS', icon: 'bi-moon-stars', title: 'Alternar Tema Claro / Oscuro', desc: 'Invertir paleta de la interfaz', action: 'ui:toggle_theme', status: 'ready' },
            { id: 'cq-1', section: 'CONSULTAS', icon: 'bi-person-badge', title: 'Directorio de Clientes CRM', desc: 'Cartera de clientes y balances', action: 'router:navigate', payload: { path: '/clients' }, status: 'ready' },
            { id: 'cq-2', section: 'CONSULTAS', icon: 'bi-truck', title: 'Catálogo de Proveedores', desc: 'Órdenes de compra y suministros', action: 'router:navigate', payload: { path: '/providers' }, status: 'ready' },
            { id: 'cq-3', section: 'CONSULTAS', icon: 'bi-box-seam', title: 'Control de Inventario & Almacén', desc: 'Existencias y lotes', action: 'router:navigate', payload: { path: '/inventory' }, status: 'ready' },
            { id: 'cq-4', section: 'CONSULTAS', icon: 'bi-clock-history', title: 'Registro de Actividad & Auditoría', desc: 'Trazabilidad de eventos de usuario', action: 'ui:open_activity_log', status: 'ready' },
            { id: 'cq-5', section: 'CONSULTAS', icon: 'bi-code-slash', title: 'Ejecutar Consulta SQL', desc: 'Editor de consultas de base de datos', action: 'dev:sql_editor', status: 'in-dev' },
            { id: 'ac-1', section: 'ACCIONES', icon: 'bi-plus-circle', title: 'Registrar Nueva Unidad de Negocio', desc: 'Lanzar wizard de alta comercial', action: 'business:open_create', status: 'ready' },
            { id: 'ac-2', section: 'ACCIONES', icon: 'bi-pc-display-horizontal', title: 'Abrir Punto de Venta (POS)', desc: 'Facturación rápida y cobro bi-monetario', action: 'router:navigate', payload: { path: '/pos' }, status: 'ready' },
            { id: 'ac-3', section: 'ACCIONES', icon: 'bi-currency-exchange', title: 'Gestionar Tasas & Cotizaciones', desc: 'Ajuste de paridad BCV y USDT', action: 'finance:open_rate', status: 'ready' },
            { id: 'ac-4', section: 'ACCIONES', icon: 'bi-cloud-arrow-down', title: 'Exportar Reporte Mensual', desc: 'Generar balance operativo en CSV/PDF', action: 'workspace:export_report', status: 'ready' }
        ];
    },

    show() {
        if (modalServiceV2.isOpen('command-palette-modal')) {
            modalServiceV2.requestClose('programmatic');
            return;
        }
        this._activeIndex = 0;
        const items = this.getItems();
        const searchHtml = renderField({
            id: 'cmd-palette-input',
            type: 'search',
            icon: 'bi-search',
            placeholder: 'Ejecuta un comando o busca...',
            kbd: 'Ctrl+K'
        });

        const switcherHtml = renderButton({
            id: 'btn-view-toggle',
            variant: 'ghost',
            size: 'xs',
            iconLeft: this._viewMode === 'list' ? 'bi-grid-fill' : 'bi-list-ul',
            title: this._viewMode === 'list' ? 'Cambiar a vista Mosaico' : 'Cambiar a vista Lista',
            attrs: { 'aria-pressed': String(this._viewMode === 'mosaic') }
        });

        modalServiceV2.showModal({
            id: 'command-palette-modal',
            scope: 'global',
            size: 'lg',
            initialFocus: '#cmd-palette-input',
            header: {
                left: {
                    icon: 'bi-command',
                    title: 'Paleta de Comandos',
                    subtitle: 'Búsqueda global y acciones rápidas'
                },
                center: { html: searchHtml },
                right: { actions: [switcherHtml] }
            },
            body: {
                html: `<div class="command-palette-results" id="cmd-palette-results" role="${this._viewMode === 'mosaic' ? 'grid' : 'listbox'}">${this._renderSections(items, this._viewMode)}</div>`
            },
            footer: {
                left: '<span class="x-small text-muted"><kbd class="cmd-kbd">↑</kbd> <kbd class="cmd-kbd">↓</kbd> navegar · <kbd class="cmd-kbd">Enter</kbd> ejecutar · <kbd class="cmd-kbd">ESC</kbd> salir</span>',
                right: renderButton({ variant: 'secondary', size: 'sm', pill: true, label: 'Cerrar', action: 'ui:close_modal' })
            },
            onOpen: ({ signal }) => this._bindEvents(signal)
        });
    },

    _renderSections(items, viewMode) {
        if (items.length === 0) {
            return '<div class="ui-modal__state"><i class="bi bi-search ui-modal__state-icon"></i><h3 class="ui-modal__state-title">Sin coincidencias</h3><p class="ui-modal__state-sub">Prueba con otro término de búsqueda.</p></div>';
        }
        const sections = ['ATAJOS', 'CONSULTAS', 'ACCIONES'];
        return sections.map((sec) => {
            const secItems = items.filter((i) => i.section === sec);
            if (secItems.length === 0) return '';
            return `
                <div class="cmd-section-group mb-3">
                    <span class="d-block x-small fw-bold text-muted text-uppercase mb-2 px-2">${sec}</span>
                    <div class="${viewMode === 'mosaic' ? 'cmd-mosaic-grid' : 'd-flex flex-column gap-1'}">
                        ${secItems.map((item) => (viewMode === 'mosaic' ? this._renderMosaicItem(item) : this._renderListItem(item))).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderListItem(item) {
        const isDev = item.status === 'in-dev';
        const stateAttrs = isDev ? 'disabled aria-disabled="true" title="En desarrollo — disponible en próxima versión"' : `data-action="${escapeHTML(item.action)}"`;
        return `
            <button type="button" role="option" aria-selected="false"
                 class="cmd-item-row btn text-start w-100 p-2 rounded-3 d-flex align-items-center justify-content-between ${isDev ? 'opacity-50' : ''}"
                 style="${isDev ? 'filter: grayscale(1);' : ''}"
                 ${stateAttrs}
                 ${item.payload ? `data-payload='${escapeHTML(JSON.stringify(item.payload))}'` : ''}>
                <div class="d-flex align-items-center gap-3 min-w-0">
                    <div class="cmd-icon-box rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${isDev ? 'bg-secondary-subtle text-muted' : 'bg-primary-subtle text-primary'}" style="width: 34px; height: 34px;">
                        <i class="bi ${escapeHTML(item.icon)}"></i>
                    </div>
                    <div class="min-w-0">
                        <span class="d-block fw-semibold small text-main text-truncate">${escapeHTML(item.title)}</span>
                        <span class="d-block text-muted x-small text-truncate">${escapeHTML(item.desc)}</span>
                    </div>
                </div>
                ${isDev
        ? '<span class="badge badge--warning ms-2" title="En desarrollo">En desarrollo</span>'
        : '<i class="bi bi-arrow-return-left text-muted x-small opacity-50"></i>'}
            </button>
        `;
    },

    _renderMosaicItem(item) {
        const isDev = item.status === 'in-dev';
        const stateAttrs = isDev ? 'disabled aria-disabled="true" title="En desarrollo — disponible en próxima versión"' : `data-action="${escapeHTML(item.action)}"`;
        return `
            <button type="button" role="gridcell" aria-selected="false"
                 class="cmd-item-card btn text-start w-100 p-3 rounded-3 border h-100 d-flex flex-column justify-content-between ${isDev ? 'opacity-50' : ''}"
                 style="${isDev ? 'filter: grayscale(1);' : ''}"
                 ${stateAttrs}
                 ${item.payload ? `data-payload='${escapeHTML(JSON.stringify(item.payload))}'` : ''}>
                <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <div class="cmd-icon-box rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${isDev ? 'bg-secondary-subtle text-muted' : 'bg-primary-subtle text-primary'}" style="width: 36px; height: 36px;">
                        <i class="bi ${escapeHTML(item.icon)} fs-5"></i>
                    </div>
                    ${isDev ? '<span class="badge badge--warning" title="En desarrollo">En desarrollo</span>' : ''}
                </div>
                <div class="min-w-0 w-100">
                    <span class="d-block fw-semibold small text-main mb-1 text-truncate">${escapeHTML(item.title)}</span>
                    <span class="d-block text-muted x-small text-truncate">${escapeHTML(item.desc)}</span>
                </div>
            </button>
        `;
    },

    _bindEvents(signal) {
        const input = $id('cmd-palette-input');
        const results = $id('cmd-palette-results');
        const btnToggle = $id('btn-view-toggle');
        if (!results) return;

        const rerender = () => {
            const query = input?.value?.toLowerCase().trim() || '';
            const allItems = this.getItems();
            const filtered = query ? allItems.filter((i) => i.title.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query)) : allItems;
            results.setAttribute('role', this._viewMode === 'mosaic' ? 'grid' : 'listbox');
            $mount(results, this._renderSections(filtered, this._viewMode));
            this._activeIndex = 0;
            this._highlightActive(results);
        };

        const toggleMode = () => {
            this._viewMode = this._viewMode === 'list' ? 'mosaic' : 'list';
            if (btnToggle) {
                const isMosaic = this._viewMode === 'mosaic';
                btnToggle.setAttribute('aria-pressed', String(isMosaic));
                btnToggle.setAttribute('title', isMosaic ? 'Cambiar a vista Lista' : 'Cambiar a vista Mosaico');
                $mount(btnToggle, `<i class="bi ${isMosaic ? 'bi-list-ul' : 'bi-grid-fill'} ui-btn__icon" aria-hidden="true"></i>`);
            }
            rerender();
        };

        if (input) {
            $on(input, 'input', rerender, { signal });
            $on(input, 'keydown', (e) => {
                const enabled = Array.from(results.querySelectorAll('[data-action]:not(:disabled)'));
                if (enabled.length === 0) return;
                const cols = this._viewMode === 'mosaic' ? this._getGridColumns(enabled) : 1;

                if (e.key === 'ArrowRight' && this._viewMode === 'mosaic') {
                    e.preventDefault();
                    this._activeIndex = (this._activeIndex + 1) % enabled.length;
                    this._highlightActive(results);
                } else if (e.key === 'ArrowLeft' && this._viewMode === 'mosaic') {
                    e.preventDefault();
                    this._activeIndex = (this._activeIndex - 1 + enabled.length) % enabled.length;
                    this._highlightActive(results);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this._activeIndex = Math.min(this._activeIndex + cols, enabled.length - 1);
                    this._highlightActive(results);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this._activeIndex = Math.max(this._activeIndex - cols, 0);
                    this._highlightActive(results);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    enabled[this._activeIndex]?.click();
                }
            }, { signal });
        }

        if (btnToggle) $on(btnToggle, 'click', toggleMode, { signal });
        this._highlightActive(results);
    },

    _getGridColumns(items) {
        if (items.length < 2) return 1;
        const firstTop = items[0].getBoundingClientRect().top;
        let cols = 0;
        for (const el of items) {
            if (Math.abs(el.getBoundingClientRect().top - firstTop) <= 4) cols += 1;
            else break;
        }
        return Math.max(cols, 1);
    },

    _highlightActive(results) {
        const enabled = Array.from(results.querySelectorAll('[data-action]:not(:disabled)'));
        enabled.forEach((el, idx) => {
            const active = idx === this._activeIndex;
            el.setAttribute('aria-selected', String(active));
            el.classList.toggle('border-primary', active);
            el.classList.toggle('bg-primary-subtle', active && this._viewMode === 'list');
            if (active) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
    }
};

export default CommandPaletteModal;
