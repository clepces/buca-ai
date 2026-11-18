/**
 * @fileoverview command-palette-modal - Paleta de Comandos y Buscador Global (Ctrl + K)
 * @module shared/ui/components/header/command-palette-modal
 */
import { ModalService } from '@/shared/ui/overlays/ModalService.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { $id, $on, $addClass, $removeClass } from '@/shared/utils/dom.js';

export const CommandPaletteModal = {
    _viewMode: 'list', // 'list' | 'mosaic'

    getItems() {
        return [
            // ATAJOS
            { id: 'sc-1', section: 'ATAJOS', icon: 'bi-keyboard', title: 'Mostrar todos los atajos de teclado', desc: 'Ver combinaciones de teclas activas', action: 'ui:open_shortcuts', status: 'ready' },
            { id: 'sc-2', section: 'ATAJOS', icon: 'bi-house-door', title: 'Ir al Tablero de Control', desc: 'Panel principal del Workspace', action: 'router:navigate', payload: { path: '/workspace' }, status: 'ready' },
            { id: 'sc-3', section: 'ATAJOS', icon: 'bi-moon-stars', title: 'Alternar Tema Claro / Oscuro', desc: 'Invertir paleta de la interfaz', action: 'ui:toggle_theme', status: 'ready' },

            // CONSULTAS
            { id: 'cq-1', section: 'CONSULTAS', icon: 'bi-person-badge', title: 'Directorio de Clientes CRM', desc: 'Cartera de clientes y balances', action: 'router:navigate', payload: { path: '/clients' }, status: 'ready' },
            { id: 'cq-2', section: 'CONSULTAS', icon: 'bi-truck', title: 'Catálogo de Proveedores', desc: 'Órdenes de compra y suministros', action: 'router:navigate', payload: { path: '/providers' }, status: 'ready' },
            { id: 'cq-3', section: 'CONSULTAS', icon: 'bi-box-seam', title: 'Control de Inventario & Almacén', desc: 'Existencias y lotes', action: 'router:navigate', payload: { path: '/inventory' }, status: 'ready' },
            { id: 'cq-4', section: 'CONSULTAS', icon: 'bi-clock-history', title: 'Registro de Actividad & Auditoría', desc: 'Trazabilidad de eventos de usuario', action: 'ui:open_activity_log', status: 'ready' },
            { id: 'cq-5', section: 'CONSULTAS', icon: 'bi-code-slash', title: 'Ejecutar Consulta SQL', desc: 'Editor de consultas de base de datos', action: 'dev:sql_editor', status: 'in-dev' },

            // ACCIONES
            { id: 'ac-1', section: 'ACCIONES', icon: 'bi-plus-circle', title: 'Registrar Nueva Unidad de Negocio', desc: 'Lanzar wizard de alta comercial', action: 'ui:open_create_business', status: 'ready' },
            { id: 'ac-2', section: 'ACCIONES', icon: 'bi-pc-display-horizontal', title: 'Abrir Punto de Venta (POS)', desc: 'Facturación rápida y cobro bi-monetario', action: 'router:navigate', payload: { path: '/pos' }, status: 'ready' },
            { id: 'ac-3', section: 'ACCIONES', icon: 'bi-currency-exchange', title: 'Gestionar Tasas & Cotizaciones', desc: 'Ajuste de paridad BCV y USDT', action: 'ui:open_rate', status: 'ready' },
            { id: 'ac-4', section: 'ACCIONES', icon: 'bi-cloud-arrow-down', title: 'Exportar Reporte Mensual', desc: 'Generar balance operativo en CSV/PDF', action: 'ui:export_report', status: 'ready' }
        ];
    },

    show() {
        const items = this.getItems();
        const bodyHtml = `
            <div class="command-palette-wrapper">
                <!-- Barra de búsqueda superior con switch de vista -->
                <div class="d-flex align-items-center gap-2 pb-3 mb-3 border-bottom">
                    <i class="bi bi-search text-muted fs-5"></i>
                    <input type="search" id="cmd-palette-input" class="form-control form-control-lg border-0 shadow-none px-1 bg-transparent" placeholder="Ejecuta un comando o busca..." autofocus autocomplete="off">
                    
                    <!-- View switcher -->
                    <div class="d-flex align-items-center gap-1 border rounded-pill p-1 bg-subtle">
                        <button type="button" class="btn btn-sm btn-icon rounded-circle d-flex align-items-center justify-content-center p-0 ${this._viewMode === 'list' ? 'btn-primary' : 'btn-link text-muted'}" id="btn-view-list" style="width: 28px; height: 28px;" title="Vista Lista">
                            <i class="bi bi-list-ul"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-icon rounded-circle d-flex align-items-center justify-content-center p-0 ${this._viewMode === 'mosaic' ? 'btn-primary' : 'btn-link text-muted'}" id="btn-view-mosaic" style="width: 28px; height: 28px;" title="Vista Mosaico">
                            <i class="bi bi-grid-fill"></i>
                        </button>
                    </div>
                </div>

                <!-- Lista / Mosaico de Comandos -->
                <div class="command-palette-results buca-scroll-area max-h-420" id="cmd-palette-results">
                    ${this._renderSections(items, this._viewMode)}
                </div>
            </div>
        `;

        ModalService.showModal({
            size: 'lg',
            header: { left: '<span class="fw-bold small text-muted text-uppercase"><i class="bi bi-command me-1"></i> Paleta de Comandos</span>' },
            body: bodyHtml,
            footer: {
                left: '<span class="x-small text-muted"><kbd class="cmd-kbd">↑</kbd> <kbd class="cmd-kbd">↓</kbd> para navegar <kbd class="cmd-kbd">ESC</kbd> para salir</span>',
                right: '<button type="button" class="btn btn-sm btn-secondary rounded-pill px-3" data-action="ui:close_modal">Cerrar</button>'
            }
        });

        this._bindEvents();
    },

    _renderSections(items, viewMode) {
        const sections = ['ATAJOS', 'CONSULTAS', 'ACCIONES'];
        return sections.map(sec => {
            const secItems = items.filter(i => i.section === sec);
            if (secItems.length === 0) return '';

            return `
                <div class="cmd-section-group mb-3">
                    <span class="d-block x-small fw-bold text-muted text-uppercase mb-2 px-2">${sec}</span>
                    <div class="${viewMode === 'mosaic' ? 'row g-2' : 'd-flex flex-column gap-1'}">
                        ${secItems.map(item => viewMode === 'mosaic' ? this._renderMosaicItem(item) : this._renderListItem(item)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderListItem(item) {
        const isDev = item.status === 'in-dev';
        return `
            <div class="cmd-item-row p-2.5 rounded-3 d-flex align-items-center justify-content-between cursor-pointer transition-all ${isDev ? 'cmd-item--in-dev' : ''}"
                 data-action="${item.action}"
                 ${item.payload ? `data-payload='${JSON.stringify(item.payload)}'` : ''}
                 ${isDev ? 'data-status="in-development"' : ''}>
                <div class="d-flex align-items-center gap-3 min-w-0">
                    <div class="cmd-icon-box rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 ${isDev ? 'bg-secondary-subtle text-muted' : 'bg-primary-subtle text-primary'}" style="width: 34px; height: 34px;">
                        <i class="bi ${item.icon}"></i>
                    </div>
                    <div class="min-w-0">
                        <span class="d-block fw-semibold small text-main text-truncate">${escapeHTML(item.title)}</span>
                        <span class="d-block text-muted x-small text-truncate">${escapeHTML(item.desc)}</span>
                    </div>
                </div>
                ${isDev ? `
                    <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-0.5 x-small font-monospace" title="En desarrollo">
                        <i class="bi bi-cone-striped me-1"></i>Roadmap
                    </span>
                ` : `
                    <i class="bi bi-arrow-return-left text-muted x-small opacity-50"></i>
                `}
            </div>
        `;
    },

    _renderMosaicItem(item) {
        const isDev = item.status === 'in-dev';
        return `
            <div class="col-12 col-sm-6 col-md-4">
                <div class="cmd-item-card p-3 rounded-3 border h-100 cursor-pointer transition-all d-flex flex-column justify-content-between ${isDev ? 'cmd-item--in-dev' : ''}"
                     data-action="${item.action}"
                     ${item.payload ? `data-payload='${JSON.stringify(item.payload)}'` : ''}
                     ${isDev ? 'data-status="in-development"' : ''}>
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="cmd-icon-box rounded-3 d-flex align-items-center justify-content-center ${isDev ? 'bg-secondary-subtle text-muted' : 'bg-primary-subtle text-primary'}" style="width: 36px; height: 36px;">
                            <i class="bi ${item.icon} fs-5"></i>
                        </div>
                        ${isDev ? '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-1.5 py-0.5 x-small font-monospace">Roadmap</span>' : ''}
                    </div>
                    <div>
                        <span class="d-block fw-semibold small text-main mb-0.5 text-truncate">${escapeHTML(item.title)}</span>
                        <span class="d-block text-muted x-small line-clamp-2">${escapeHTML(item.desc)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    _bindEvents() {
        const input = $id('cmd-palette-input');
        const results = $id('cmd-palette-results');
        const btnList = $id('btn-view-list');
        const btnMosaic = $id('btn-view-mosaic');

        if (input && results) {
            $on(input, 'input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const allItems = this.getItems();
                const filtered = query ? allItems.filter(i => i.title.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query)) : allItems;
                results.innerHTML = this._renderSections(filtered, this._viewMode);
            });
        }

        if (btnList && btnMosaic && results) {
            $on(btnList, 'click', () => {
                this._viewMode = 'list';
                $addClass(btnList, 'btn-primary');
                $removeClass(btnList, 'btn-link', 'text-muted');
                $removeClass(btnMosaic, 'btn-primary');
                $addClass(btnMosaic, 'btn-link', 'text-muted');
                const query = input?.value?.toLowerCase().trim() || '';
                const allItems = this.getItems();
                const filtered = query ? allItems.filter(i => i.title.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query)) : allItems;
                results.innerHTML = this._renderSections(filtered, 'list');
            });

            $on(btnMosaic, 'click', () => {
                this._viewMode = 'mosaic';
                $addClass(btnMosaic, 'btn-primary');
                $removeClass(btnMosaic, 'btn-link', 'text-muted');
                $removeClass(btnList, 'btn-primary');
                $addClass(btnList, 'btn-link', 'text-muted');
                const query = input?.value?.toLowerCase().trim() || '';
                const allItems = this.getItems();
                const filtered = query ? allItems.filter(i => i.title.toLowerCase().includes(query) || i.desc.toLowerCase().includes(query)) : allItems;
                results.innerHTML = this._renderSections(filtered, 'mosaic');
            });
        }
    }
};

export default CommandPaletteModal;
