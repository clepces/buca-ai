/**
 * @fileoverview ModulePlaceholderPage - Vista Modular de Secciones del ERP
 * @description Presenta interfaces operativas para los módulos invocados desde el Dock
 * cumpliendo con los estándares de diseño Corporate Hybrid Glass.
 */

export const createModulePage = ({ title, category, icon, description }) => {
    const modalPayload = JSON.stringify({
        title: `Módulo ${title}`,
        subtitle: 'Estado del Desarrollo',
        body: `<div class="text-center"><i class="bi bi-tools fs-1 text-primary mb-2 d-block"></i><h5>${title}</h5><p class="text-muted">Este submódulo está planificado en el roadmap corporativo. Se integrará automáticamente con Supabase y el sistema de permisos multi-tenant.</p></div>`
    }).replace(/'/g, '&apos;');

    return {
        render() {
            return `
            <div class="module-page-container fade-in py-2">
                <!-- Header con Breadcrumbs -->
                <div class="glass-surface p-3 p-md-4 rounded-4 border-glass shadow-sm mb-4">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                        <div>
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 small fw-bold">${category}</span>
                                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1 small fw-bold">
                                    <i class="bi bi-cone-striped me-1"></i>En Desarrollo
                                </span>
                            </div>
                            <h1 class="h4 fw-bold text-main mb-1 d-flex align-items-center gap-2">
                                <i class="${icon} text-primary"></i> ${title}
                            </h1>
                            <p class="text-muted small mb-0">${description}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-secondary rounded-pill px-3 py-1.5 small fw-bold" data-action="router:navigate" data-payload='{"path": "/workspace"}'>
                                <i class="bi bi-arrow-left me-1"></i> Volver al Tablero
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Banner de Estado: En Desarrollo -->
                <div class="alert alert-info border border-info-subtle bg-info-subtle text-info-emphasis rounded-4 p-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-xs">
                    <div class="d-flex align-items-center gap-2.5">
                        <div class="rounded-circle bg-info text-white p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                            <i class="bi bi-tools fs-6"></i>
                        </div>
                        <div>
                            <span class="fw-bold small d-block">Submódulo ERP en fase de construcción</span>
                            <span class="x-small opacity-85">La arquitectura y esquema de base de datos están vinculados. Los componentes interactivos finales estarán disponibles en la próxima versión.</span>
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-info text-white rounded-pill px-3 fw-bold" data-action="ui:open_modal" data-payload='${modalPayload}'>
                        Ver Roadmap
                    </button>
                </div>

                <!-- Preview en Escala de Grises (Arquitectura en Maqueta) -->
                <div class="glass-surface p-3 p-md-4 rounded-4 border-glass shadow-sm" style="filter: grayscale(0.85); opacity: 0.85;">
                    <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-eye-fill text-muted"></i>
                            <span class="small fw-bold text-muted text-uppercase">Vista Previa de Interfaz (Boceto Arquitectónico)</span>
                        </div>
                        <span class="badge bg-secondary-subtle text-muted rounded-pill px-2.5 py-0.5 x-small">Modo Demostración</span>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-12 col-sm-4">
                            <div class="p-3 rounded-3 bg-white-5 border border-secondary border-opacity-25">
                                <span class="d-block x-small text-muted text-uppercase fw-bold">Registros Totales</span>
                                <span class="h5 fw-bold text-muted mb-0">---</span>
                            </div>
                        </div>
                        <div class="col-12 col-sm-4">
                            <div class="p-3 rounded-3 bg-white-5 border border-secondary border-opacity-25">
                                <span class="d-block x-small text-muted text-uppercase fw-bold">Transacciones Activas</span>
                                <span class="h5 fw-bold text-muted mb-0">---</span>
                            </div>
                        </div>
                        <div class="col-12 col-sm-4">
                            <div class="p-3 rounded-3 bg-white-5 border border-secondary border-opacity-25">
                                <span class="d-block x-small text-muted text-uppercase fw-bold">Estado de Sincronización</span>
                                <span class="h5 fw-bold text-muted mb-0">Standby</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de muestra maqueta -->
                    <div class="table-responsive">
                        <table class="table table-sm align-middle mb-0 text-muted opacity-75">
                            <thead>
                                <tr class="border-bottom">
                                    <th>CÓDIGO</th>
                                    <th>DESCRIPCIÓN</th>
                                    <th>RESPONSABLE</th>
                                    <th>ESTADO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><code>#BCA-001</code></td>
                                    <td>Registro Operativo Inicial</td>
                                    <td>Root Admin</td>
                                    <td><span class="badge bg-secondary rounded-pill">Pendiente</span></td>
                                </tr>
                                <tr>
                                    <td><code>#BCA-002</code></td>
                                    <td>Integración de Datos Locales</td>
                                    <td>Operador de Caja</td>
                                    <td><span class="badge bg-secondary rounded-pill">Pendiente</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },
    init() {
        console.log(`[ModuleSection] -> Sección cargada: ${title}`);
    }
};
};

export default createModulePage;
