/**
 * @fileoverview exportReportTemplate - Plantilla para el modal de exportación de reportes
 * Perteneciente al Módulo Workspace.
 */

export const exportReportTemplate = () => {
    return `
        <div class="p-4">
            <div class="row g-3">
                <div class="col-12">
                    <label class="form-label text-muted small fw-bold mb-1">RANGO DE FECHAS</label>
                    <div class="d-flex gap-2">
                        <input type="date" class="form-control rounded-3 bg-transparent border-glass" value="${new Date().toISOString().split('T')[0]}">
                        <input type="date" class="form-control rounded-3 bg-transparent border-glass" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col-12">
                    <label class="form-label text-muted small fw-bold mb-1">FORMATO DE ARCHIVO</label>
                    <div class="d-flex gap-2">
                        <div class="form-check card p-2 flex-fill text-center border-glass-bright">
                            <input class="form-check-input d-none" type="radio" name="format" id="fmt-pdf" checked>
                            <label class="form-check-label w-100 clickable" for="fmt-pdf">
                                <i class="bi bi-file-earmark-pdf text-danger fs-4 d-block mb-1"></i>
                                <span class="small fw-bold">PDF</span>
                            </label>
                        </div>
                        <div class="form-check card p-2 flex-fill text-center border-glass-bright">
                            <input class="form-check-input d-none" type="radio" name="format" id="fmt-excel">
                            <label class="form-check-label w-100 clickable" for="fmt-excel">
                                <i class="bi bi-file-earmark-excel text-success fs-4 d-block mb-1"></i>
                                <span class="small fw-bold">EXCEL</span>
                            </label>
                        </div>
                        <div class="form-check card p-2 flex-fill text-center border-glass-bright">
                            <input class="form-check-input d-none" type="radio" name="format" id="fmt-csv">
                            <label class="form-check-label w-100 clickable" for="fmt-csv">
                                <i class="bi bi-file-earmark-spreadsheet text-primary fs-4 d-block mb-1"></i>
                                <span class="small fw-bold">CSV</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="col-12">
                    <label class="form-label text-muted small fw-bold mb-1">MÓDULOS A INCLUIR</label>
                    <div class="list-group rounded-3 border-glass">
                        <label class="list-group-item d-flex align-items-center gap-3 bg-transparent text-main border-0 py-2">
                            <input class="form-check-input mt-0" type="checkbox" checked>
                            <div class="d-flex flex-column">
                                <span class="small fw-bold">Inventario & Stock</span>
                                <span class="text-muted profile-subtext-micro">Valuación de existencias y movimientos</span>
                            </div>
                        </label>
                        <label class="list-group-item d-flex align-items-center gap-3 bg-transparent text-main border-0 py-2">
                            <input class="form-check-input mt-0" type="checkbox" checked>
                            <div class="d-flex flex-column">
                                <span class="small fw-bold">Ventas & POS</span>
                                <span class="text-muted profile-subtext-micro">Ingresos, boletas y facturación</span>
                            </div>
                        </label>
                        <label class="list-group-item d-flex align-items-center gap-3 bg-transparent text-main border-0 py-2">
                            <input class="form-check-input mt-0" type="checkbox">
                            <div class="d-flex flex-column">
                                <span class="small fw-bold">Recursos Humanos</span>
                                <span class="text-muted profile-subtext-micro">Asistencia y nómina de personal</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
            <div class="alert alert-info mt-4 rounded-3 border-0 bg-primary-subtle py-2">
                <div class="d-flex align-items-center gap-2 small fw-semibold text-primary">
                    <i class="bi bi-info-circle-fill"></i>
                    <span>El procesamiento puede tardar unos segundos.</span>
                </div>
            </div>
        </div>
    `;
};

export default exportReportTemplate;
