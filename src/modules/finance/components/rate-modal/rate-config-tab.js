/**
 * @fileoverview rate-config-tab - Pestaña 5: Configuración de Clave API y Parámetros
 * @module modules/finance/components/rate-modal/rate-config-tab
 */

export function renderRateConfigTab(apiConfig) {
    return `
        <div class="rate-tab-content" id="tab-rate-api-config">
            <div class="modal-setting-card mb-3 p-3">
                <form id="api-config-form" onsubmit="return false;">
                    <div class="mb-3">
                        <label for="cfg-api-key" class="form-label x-small fw-bold text-muted text-uppercase">Clave API</label>
                        <div class="input-group">
                            <input type="${apiConfig?.showKey ? 'text' : 'password'}" id="cfg-api-key" class="form-control glass-input font-monospace small" value="${apiConfig?.apiKey || ''}">
                            <button type="button" class="btn btn-outline-secondary" id="btn-toggle-api-key-vis">
                                <i class="bi ${apiConfig?.showKey ? 'bi-eye-slash-fill' : 'bi-eye-fill'}"></i>
                            </button>
                        </div>
                    </div>
                    <div class="d-flex align-items-center justify-content-between pt-2 border-top flex-wrap gap-2">
                        <button type="button" class="btn btn-sm btn-outline-danger rounded-pill" id="btn-reset-api-cfg">Restablecer</button>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-primary rounded-pill" id="btn-test-api-conn">Probar</button>
                            <button type="button" class="btn btn-sm btn-primary rounded-pill px-3" id="btn-save-api-cfg">Guardar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
}
