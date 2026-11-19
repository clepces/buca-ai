/**
 * BannerComponent - Branded Enterprise Banner with Modular Accordion & Service Badges
 * =========================================================================
 * Clean Core Architecture: Vanilla JS (ES6+), Bootstrap Grid & BNE Standards
 * =========================================================================
 */
import { $id, $$, $on, $off, $addClass, $removeClass } from '@/shared/utils/dom.js';

const APP_SERVICES = [
    { id: 'pos', name: 'Facturación / POS', icon: 'bi-receipt-cutoff', note: 'Emisión fiscal y caja rápida' },
    { id: 'inventory', name: 'Inventario', icon: 'bi-boxes', note: 'Control de stock y almacén' },
    { id: 'finance', name: 'Tasas & Divisas', icon: 'bi-currency-exchange', note: 'BCV y USDT en vivo' },
    { id: 'ai', name: 'Agentes IA', icon: 'bi-stars', note: 'Analítica predictiva de negocio' },
    { id: 'security', name: 'Cloud Secure', icon: 'bi-shield-lock-fill', note: 'Aislamiento RLS AES-256' },
    { id: 'crm', name: 'Clientes & CRM', icon: 'bi-people-fill', note: 'Directorio y fidelización' }
];

const ACCORDION_ITEMS = [
    {
        id: 'acc-bne',
        theme: 'blue',
        icon: 'bi-cpu-fill',
        title: 'Motor BNE v5.4',
        subtitle: 'Renderizado Nativo & GPU Direct',
        chip: '60 FPS OK',
        chipClass: 'chip-blue',
        desc: 'Aceleración gráfica directa por hardware con pipelines de ultra-baja latencia (1.2ms) y perfiles adaptativos L0 a L3 para máxima fluidez.',
        tags: [
            { icon: 'bi-speedometer2', label: '1.2ms Latencia' },
            { icon: 'bi-gpu-card', label: 'GPU Direct' },
            { icon: 'bi-check-circle-fill', label: 'Estado: Óptimo', status: 'success' }
        ],
        initiallyExpanded: true
    },
    {
        id: 'acc-ai',
        theme: 'purple',
        icon: 'bi-stars',
        title: 'IA Predictiva Autónoma',
        subtitle: 'Red Neuronal de Negocio',
        chip: '3 Agentes',
        chipClass: 'chip-purple',
        desc: 'Modelos autónomos de proyección de demanda, estimación de flujo de caja y detección proactiva de anomalías comerciales.',
        tags: [
            { icon: 'bi-robot', label: '3 Agentes Activos' },
            { icon: 'bi-graph-up-arrow', label: '98.4% Precisión' },
            { icon: 'bi-lightning-charge-fill', label: 'Auto-Decisión', status: 'primary' }
        ],
        initiallyExpanded: false
    },
    {
        id: 'acc-security',
        theme: 'green',
        icon: 'bi-shield-lock-fill',
        title: 'Cloud Secure & Multitenant',
        subtitle: 'Aislamiento Estricto & Respaldo Continuo',
        chip: 'AES-256',
        chipClass: 'chip-green',
        desc: 'Seguridad perimetral con cifrado integral en tránsito y reposo. Políticas RLS estrictas en PostgreSQL que garantizan aislamiento absoluto por empresa.',
        tags: [
            { icon: 'bi-lock-fill', label: 'Cifrado AES-256' },
            { icon: 'bi-database-fill-check', label: 'RLS Isolation' },
            { icon: 'bi-shield-check', label: '99.98% SLA', status: 'info' }
        ],
        initiallyExpanded: false
    },
    {
        id: 'acc-forex',
        theme: 'amber',
        icon: 'bi-currency-exchange',
        title: 'Tasa Multi-Divisa en Vivo',
        subtitle: 'Sincronización BCV & USDT',
        chip: 'BCV + USDT',
        chipClass: 'chip-amber',
        desc: 'Conexión en tiempo real con cotizaciones oficiales del BCV (USD/EUR) y feeds P2P. Aplica Snapshot Pattern para preservar el valor histórico de cada transacción.',
        tags: [
            { icon: 'bi-bank', label: 'BCV Oficial' },
            { icon: 'bi-currency-bitcoin', label: 'USDT P2P' },
            { icon: 'bi-camera-fill', label: 'Snapshot Lock', status: 'warning' }
        ],
        initiallyExpanded: false
    },
    {
        id: 'acc-audit',
        theme: 'pink',
        icon: 'bi-journal-check',
        title: 'Audit Trail & Cumplimiento',
        subtitle: 'Trazabilidad Inalterable',
        chip: 'ISO 27001',
        chipClass: 'chip-pink',
        desc: 'Registro inmutable cronológico de auditoría con identificadores UUID y protección contra manipulación para control total corporativo.',
        tags: [
            { icon: 'bi-fingerprint', label: 'UUID Safety' },
            { icon: 'bi-file-earmark-lock-fill', label: 'Append-Only' },
            { icon: 'bi-patch-check-fill', label: 'ISO Verificado', status: 'danger' }
        ],
        initiallyExpanded: false
    }
];

export const BannerComponent = {
    render(displayName = 'Usuario') {
        const servicesHtml = APP_SERVICES.map(service => `
            <div class="banner-service-pill" title="${service.note}" data-service="${service.id}">
                <div class="service-pill-icon">
                    <i class="bi ${service.icon}"></i>
                </div>
                <span class="service-pill-label">${service.name}</span>
            </div>
        `).join('');

        const accordionHtml = ACCORDION_ITEMS.map((item) => `
            <div class="banner-accordion-item ${item.initiallyExpanded ? 'is-expanded' : ''}" data-accordion-id="${item.id}">
                <button type="button" class="banner-accordion-header" data-action="accordion:toggle" aria-expanded="${item.initiallyExpanded}">
                    <div class="acc-header-info">
                        <div class="acc-icon-box acc-icon-box--${item.theme}">
                            <i class="bi ${item.icon}"></i>
                        </div>
                        <div class="acc-text-meta">
                            <span class="acc-title">${item.title}</span>
                            <span class="acc-subtitle">${item.subtitle}</span>
                        </div>
                    </div>
                    <div class="acc-header-actions">
                        <span class="acc-status-chip ${item.chipClass}">${item.chip}</span>
                        <i class="bi bi-chevron-down acc-chevron"></i>
                    </div>
                </button>
                <div class="banner-accordion-body">
                    <div class="acc-body-content">
                        <p class="acc-description">${item.desc}</p>
                        <div class="acc-tags-row">
                            ${item.tags.map(tag => `
                                <span class="acc-tag-badge ${tag.status ? 'acc-tag-badge--' + tag.status : ''}">
                                    <i class="bi ${tag.icon}"></i> ${tag.label}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="ws-branded-banner p-3 p-sm-4 p-xl-5 rounded-4 mb-4 position-relative text-white shadow-lg overflow-hidden" id="banner-container">
                <div class="banner-ambient-glow"></div>
                <div class="banner-grid-overlay"></div>
                
                <div class="row align-items-center g-4 g-xl-5 position-relative z-1">
                    <!-- Left Column: Branding, Greeting & Service Badges -->
                    <div class="col-12 col-lg-5 col-xl-5 d-flex flex-column gap-3">
                        <div class="animate__animated animate__fadeInLeft">
                            <div class="d-inline-flex align-items-center gap-2 banner-status-pill px-2.5 py-1 rounded-pill mb-2">
                                <span class="banner-pulse-dot"></span>
                                <span class="banner-status-text">SISTEMA EN VIVO • BNE v5.4</span>
                                <span class="banner-status-badge">SLA 99.98%</span>
                            </div>
                            
                            <h1 class="h2 fw-bold text-white mb-1 banner-title-hero">
                                BUCA <span class="banner-ai-accent">AI</span>
                            </h1>
                            <p class="text-white text-opacity-75 text-uppercase fw-semibold mb-2 banner-tagline-hero">
                                Inteligencia Empresarial Aplicada
                            </p>
                            <p class="text-white text-opacity-90 mb-0 small banner-desc-hero">
                                Bienvenido, <strong class="text-white fw-bold">${displayName}</strong>. Su ecosistema de gestión corporativa está sincronizado y operando con latencia ultra-baja.
                            </p>
                        </div>
                        
                        <div class="banner-divider my-1"></div>

                        <!-- App Services Badges with Custom Borders -->
                        <div class="banner-services-block">
                            <div class="banner-services-header mb-2 d-flex align-items-center justify-content-between">
                                <span class="banner-services-caption">SERVICIOS DEL ECOSISTEMA</span>
                                <span class="banner-services-count"><i class="bi bi-shield-check text-info"></i> 6 Módulos Conectados</span>
                            </div>
                            <div class="banner-services-grid">
                                ${servicesHtml}
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Interactive Accordion (Legacy Cards Redesigned) -->
                    <div class="col-12 col-lg-7 col-xl-7">
                        <div class="banner-accordion-wrapper" id="banner-accordion-root">
                            <div class="banner-accordion">
                                ${accordionHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init() {
        const container = $id('banner-container');
        if (!container || container._bucaInit) return;
        container._bucaInit = true;

        const accordionRoot = $id('banner-accordion-root');
        if (!accordionRoot) return;

        this._clickHandler = (e) => {
            const headerBtn = e.target.closest('[data-action="accordion:toggle"]');
            if (!headerBtn) return;

            e.preventDefault();
            const currentItem = headerBtn.closest('.banner-accordion-item');
            if (!currentItem) return;

            const isCurrentlyExpanded = currentItem.classList.contains('is-expanded');
            const allItems = $$('.banner-accordion-item', accordionRoot);

            // Collapse all siblings for a unified accordion feel
            allItems.forEach(item => {
                if (item !== currentItem) {
                    $removeClass(item, 'is-expanded');
                    const btn = item.querySelector('.banner-accordion-header');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            if (isCurrentlyExpanded) {
                $removeClass(currentItem, 'is-expanded');
                headerBtn.setAttribute('aria-expanded', 'false');
            } else {
                $addClass(currentItem, 'is-expanded');
                headerBtn.setAttribute('aria-expanded', 'true');
            }
        };

        $on(accordionRoot, 'click', this._clickHandler);
    },

    destroy() {
        const accordionRoot = $id('banner-accordion-root');
        if (accordionRoot && this._clickHandler) {
            $off(accordionRoot, 'click', this._clickHandler);
            this._clickHandler = null;
        }
        const container = $id('banner-container');
        if (container) container._bucaInit = false;
    }
};

export default BannerComponent;
