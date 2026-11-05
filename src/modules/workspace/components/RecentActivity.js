/**
 * RecentActivity - Sección de Actividad Reciente y Bitácora de Auditoría
 * =========================================================================
 * Unified Scroll (.buca-scroll-area), Zero Inline Styles, Strict Clean Architecture
 * =========================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const RecentActivity = {
    render() {
        const activities = [
            { id: 1, category: 'operaciones', icon: 'bi-building-add', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)', title: 'Nueva unidad de negocio registrada', desc: 'Se dio de alta la filial "Distribuidora BUCA Sede Este".', time: 'Hace 10 minutos', user: 'Daisy Tovar', tag: 'OPERATIVO' },
            { id: 2, category: 'seguridad', icon: 'bi-shield-check', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', title: 'Auditoría de seguridad superada', desc: 'Verificación automática de integridad AES-256 completada sin hallazgos.', time: 'Hace 45 minutos', user: 'Sistema BNE', tag: 'SEGURIDAD' },
            { id: 3, category: 'sistemas', icon: 'bi-arrow-repeat', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', title: 'Sincronización Cloud exitosa', desc: 'Actualización de registros fiscales y tasa oficial BCV (36.25 VES/USD).', time: 'Hace 2 horas', user: 'Cloud Daemon', tag: 'SISTEMA' },
            { id: 4, category: 'seguridad', icon: 'bi-person-badge', color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', title: 'Acceso de usuario operador', desc: 'Inicio de sesión verificado con autenticación multifactor biométrica.', time: 'Hace 3 horas', user: 'Carlos Mendoza', tag: 'AUDITORÍA' },
            { id: 5, category: 'operaciones', icon: 'bi-receipt', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)', title: 'Emisión masiva de comprobantes POS', desc: 'Sincronizados 42 comprobantes electrónicos fiscales en la filial Central.', time: 'Hace 4 horas', user: 'Caja Principal', tag: 'FACTURACIÓN' },
            { id: 6, category: 'operaciones', icon: 'bi-box-seam', color: '#475569', bg: 'rgba(71, 85, 105, 0.12)', title: 'Recepción de stock en almacén', desc: 'Ingreso de 150 unidades de suministro con orden de compra #8421.', time: 'Hace 5 horas', user: 'Logística', tag: 'INVENTARIO' }
        ];

        return `
            <section class="ws-section h-100 d-flex flex-column mb-0">
                <div class="section-header d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div class="d-flex align-items-center gap-2">
                        <div class="rounded-4 p-2 shadow-2xs d-flex align-items-center justify-content-center bg-primary-subtle text-primary profile-icon-box-sm">
                            <i class="bi bi-clock-history fs-5"></i>
                        </div>
                        <div>
                            <h2 class="section-title h5 fw-bold mb-0 text-main">
                                Actividad & Auditoría
                            </h2>
                            <span class="text-muted small">Registro en tiempo real</span>
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
                            ${activities.map((act, index) => `
                                <li class="activity-item d-flex align-items-start gap-3 py-3 ${index !== 0 ? 'border-top border-light' : ''}" data-category="${act.category}">
                                    <div class="widget-icon-box p-2.5 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center shadow-2xs activity-icon-box" style="--icon-bg: ${act.bg}; --icon-color: ${act.color}; background-color: var(--icon-bg); color: var(--icon-color);">
                                        <i class="bi ${act.icon} fs-5"></i>
                                    </div>
                                    <div class="flex-grow-1">
                                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-1 mb-1">
                                            <div class="d-flex align-items-center gap-2">
                                                <h3 class="h6 fw-bold mb-0 activity-title">${escapeHTML(act.title)}</h3>
                                                <span class="activity-tag px-2 py-0.5 rounded-pill badge bg-secondary-subtle text-secondary">${act.tag}</span>
                                            </div>
                                            <span class="activity-time">
                                                <i class="bi bi-clock me-1 text-muted"></i>${escapeHTML(act.time)}
                                            </span>
                                        </div>
                                        <p class="activity-desc small mb-1.5">${escapeHTML(act.desc)}</p>
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="activity-user d-flex align-items-center gap-1.5">
                                                <i class="bi bi-person-circle text-muted"></i> ${escapeHTML(act.user)}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </section>
        `;
    },

    init() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.activity-filter-pill');
            if (!btn) return;

            const group = btn.closest('#activity-filter-group');
            if (!group) return;

            const filters = group.querySelectorAll('.activity-filter-pill');
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.getAttribute('data-filter');
            const container = document.getElementById('activity-list-container');
            if (!container) return;

            const items = container.querySelectorAll('.activity-item');
            items.forEach(item => {
                const itemCat = item.getAttribute('data-category');
                if (cat === 'all' || itemCat === cat) {
                    item.classList.remove('is-hidden');
                } else {
                    item.classList.add('is-hidden');
                }
            });
        });
    }
};

export default RecentActivity;
