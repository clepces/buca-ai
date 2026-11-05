/**
 * @fileoverview SkeletonLoader - Componentes de Carga Esquelética Basados en CSS
 * @module shared/ui/components/skeleton/SkeletonLoader
 * @description Genera estructuras esqueléticas con resplandor shimmer CSS para proporcionar
 * retroalimentación visual inmediata durante la hidratación de datos y transiciones de módulos,
 * eliminando fondos planos o vacíos antes de que los componentes terminen de montarse.
 */

export class SkeletonLoader {
    /**
     * Retorna la vista esquelética completa que replica la interfaz principal (Workspace).
     * @returns {string} Markup HTML esquelético con clases utilitarias CSS
     */
    static renderWorkspaceSkeleton() {
        return `
            <div class="buca-skeleton-view" id="app-initial-skeleton" aria-busy="true" aria-label="Cargando interfaz del sistema...">
                <!-- 1. Header Stack Skeleton (TopBar + Ribbon) -->
                <header class="sk-header-stack">
                    <div class="sk-topbar">
                        <div class="sk-topbar-left">
                            <div class="sk-shimmer sk-box md"></div>
                            <div class="sk-shimmer sk-pill search d-none d-md-block"></div>
                        </div>
                        <div class="sk-topbar-right">
                            <div class="sk-shimmer sk-pill lg d-none d-lg-block"></div>
                            <div class="sk-shimmer sk-pill xl d-none d-md-block"></div>
                            <div class="sk-shimmer sk-circle md"></div>
                            <div class="sk-shimmer sk-pill xl"></div>
                        </div>
                    </div>
                    <div class="sk-ribbon">
                        <div class="d-flex align-items-center gap-2">
                            <div class="sk-shimmer sk-pill lg"></div>
                            <div class="sk-shimmer sk-pill md d-none d-sm-block"></div>
                            <div class="sk-shimmer sk-pill md d-none d-md-block"></div>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <div class="sk-shimmer sk-pill lg"></div>
                        </div>
                    </div>
                </header>

                <!-- 2. Workspace Content Skeleton -->
                <main class="sk-workspace-container">
                    <!-- Banner Hero Skeleton -->
                    <div class="sk-banner-card">
                        <div class="d-flex align-items-center gap-4 flex-grow-1">
                            <div class="sk-shimmer sk-circle avatar"></div>
                            <div class="flex-grow-1 sk-banner-text">
                                <div class="sk-shimmer sk-line lg w-50 mb-2"></div>
                                <div class="sk-shimmer sk-line w-75 mb-2"></div>
                                <div class="sk-shimmer sk-line sm w-33"></div>
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <div class="sk-shimmer sk-pill lg"></div>
                            <div class="sk-shimmer sk-pill xl"></div>
                        </div>
                    </div>

                    <!-- Telemetry Strip Skeleton (4 Métricas Clave) -->
                    <div class="sk-telemetry-grid">
                        <div class="sk-telemetry-item">
                            <div class="sk-shimmer sk-box sm"></div>
                            <div class="flex-grow-1">
                                <div class="sk-shimmer sk-line sm w-50 mb-2"></div>
                                <div class="sk-shimmer sk-line lg w-75"></div>
                            </div>
                        </div>
                        <div class="sk-telemetry-item">
                            <div class="sk-shimmer sk-box sm"></div>
                            <div class="flex-grow-1">
                                <div class="sk-shimmer sk-line sm w-50 mb-2"></div>
                                <div class="sk-shimmer sk-line lg w-75"></div>
                            </div>
                        </div>
                        <div class="sk-telemetry-item">
                            <div class="sk-shimmer sk-box sm"></div>
                            <div class="flex-grow-1">
                                <div class="sk-shimmer sk-line sm w-50 mb-2"></div>
                                <div class="sk-shimmer sk-line lg w-75"></div>
                            </div>
                        </div>
                        <div class="sk-telemetry-item">
                            <div class="sk-shimmer sk-box sm"></div>
                            <div class="flex-grow-1">
                                <div class="sk-shimmer sk-line sm w-50 mb-2"></div>
                                <div class="sk-shimmer sk-line lg w-75"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Business Hub Carousel / Grid Skeleton -->
                    <div class="sk-card">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div class="sk-shimmer sk-line lg w-180"></div>
                            <div class="d-flex gap-2">
                                <div class="sk-shimmer sk-pill sm"></div>
                                <div class="sk-shimmer sk-pill sm"></div>
                            </div>
                        </div>
                        <div class="sk-hub-grid">
                            <div class="sk-hub-item">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="sk-shimmer sk-circle md"></div>
                                    <div class="sk-shimmer sk-pill xs"></div>
                                </div>
                                <div class="sk-shimmer sk-line w-75 mb-1"></div>
                                <div class="sk-shimmer sk-line sm w-50"></div>
                            </div>
                            <div class="sk-hub-item">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="sk-shimmer sk-circle md"></div>
                                    <div class="sk-shimmer sk-pill xs"></div>
                                </div>
                                <div class="sk-shimmer sk-line w-75 mb-1"></div>
                                <div class="sk-shimmer sk-line sm w-50"></div>
                            </div>
                            <div class="sk-hub-item d-none d-lg-flex">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div class="sk-shimmer sk-circle md"></div>
                                    <div class="sk-shimmer sk-pill xs"></div>
                                </div>
                                <div class="sk-shimmer sk-line w-75 mb-1"></div>
                                <div class="sk-shimmer sk-line sm w-50"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Secciones de 2 Columnas Skeleton -->
                    <div class="sk-two-columns">
                        <!-- Columna Izquierda: Actividad Reciente / Gráficos -->
                        <div class="sk-card">
                            <div class="sk-shimmer sk-line lg w-33 mb-3"></div>
                            <div class="d-flex flex-column gap-3">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="sk-shimmer sk-circle md"></div>
                                    <div class="flex-grow-1">
                                        <div class="sk-shimmer sk-line w-50 mb-1"></div>
                                        <div class="sk-shimmer sk-line sm w-25"></div>
                                    </div>
                                    <div class="sk-shimmer sk-pill sm"></div>
                                </div>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="sk-shimmer sk-circle md"></div>
                                    <div class="flex-grow-1">
                                        <div class="sk-shimmer sk-line w-50 mb-1"></div>
                                        <div class="sk-shimmer sk-line sm w-25"></div>
                                    </div>
                                    <div class="sk-shimmer sk-pill sm"></div>
                                </div>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="sk-shimmer sk-circle md"></div>
                                    <div class="flex-grow-1">
                                        <div class="sk-shimmer sk-line w-50 mb-1"></div>
                                        <div class="sk-shimmer sk-line sm w-25"></div>
                                    </div>
                                    <div class="sk-shimmer sk-pill sm"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Columna Derecha: Centro de Control / Telemetría -->
                        <div class="sk-card">
                            <div class="sk-shimmer sk-line lg w-50 mb-3"></div>
                            <div class="d-flex flex-column gap-2 mb-3">
                                <div class="sk-shimmer sk-line w-75"></div>
                                <div class="sk-shimmer sk-line sm w-50"></div>
                            </div>
                            <div class="d-grid gap-2">
                                <div class="sk-shimmer sk-box full-h44"></div>
                                <div class="sk-shimmer sk-box full-h44"></div>
                            </div>
                        </div>
                    </div>
                </main>

                <!-- 3. Bottom Floating Dock Skeleton -->
                <div class="sk-floating-dock">
                    <div class="sk-shimmer sk-circle md"></div>
                    <div class="sk-shimmer sk-circle md"></div>
                    <div class="sk-shimmer sk-circle lg"></div>
                    <div class="sk-shimmer sk-circle md"></div>
                    <div class="sk-shimmer sk-circle md"></div>
                </div>
            </div>
        `;
    }

    /**
     * Retorna un esqueleto para tarjetas de métricas o widgets individuales.
     * @param {Object} [options]
     * @param {number} [options.count=3]
     * @returns {string}
     */
    static renderCardsSkeleton(count = 3) {
        let html = '';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="sk-card mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="sk-shimmer sk-line lg w-50"></div>
                        <div class="sk-shimmer sk-circle sm"></div>
                    </div>
                    <div class="sk-shimmer sk-line w-75 mb-2"></div>
                    <div class="sk-shimmer sk-line sm w-33"></div>
                </div>
            `;
        }
        return html;
    }

    /**
     * Retorna un esqueleto para tablas de datos dinámicas.
     * @param {number} [rows=5]
     * @returns {string}
     */
    static renderTableSkeleton(rows = 5) {
        let rowsHtml = '';
        for (let i = 0; i < rows; i++) {
            rowsHtml += `
                <div class="d-flex align-items-center justify-content-between py-2 border-bottom border-light-subtle">
                    <div class="sk-shimmer sk-line w-25 mb-0"></div>
                    <div class="sk-shimmer sk-line w-25 mb-0"></div>
                    <div class="sk-shimmer sk-line w-25 mb-0"></div>
                    <div class="sk-shimmer sk-pill sm"></div>
                </div>
            `;
        }

        return `
            <div class="sk-card">
                <div class="sk-shimmer sk-line lg w-33 mb-3"></div>
                <div class="d-flex flex-column gap-1">
                    ${rowsHtml}
                </div>
            </div>
        `;
    }
}

export default SkeletonLoader;
