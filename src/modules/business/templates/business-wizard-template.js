/**
 * Business Wizard Template - Asistente de Registro de Empresas (3 Pasos)
 * Estilo BNE Corporate Hybrid Glass (Bootstrap 5 + Semantic Tokens)
 * =========================================================================
 * Navegación (Anterior / Siguiente) ahora en el modal-footer.
 * Steps pills en el modal-header-center.
 * Validaciones nativas + atributos required + minlength + pattern.
 */
export const createBusinessWizardTemplate = () => `
    <div id="wizard-create-business" class="business-wizard-modal p-1">
        <div id="wizard-biz-feedback" class="alert alert-danger d-none py-2 px-3 small rounded-3 mb-3" role="alert"></div>

        <!-- PASO 1: Identidad Fiscal & Comercial -->
        <div class="wizard-step-pane active" id="wizard-step-1-pane" role="tabpanel" aria-labelledby="wizard-step-1-tab">
            <div class="wizard-info-card d-flex align-items-center gap-3">
                <div class="p-2 rounded-3 bg-primary-subtle text-primary">
                    <i class="bi bi-file-earmark-person-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-0 text-main">Paso 1: Identidad Fiscal & Comercial</h6>
                    <span class="small text-muted">Defina la razón jurídica y datos de registro del comercio.</span>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-8">
                    <label for="wizard-biz-name" class="form-label">Razón Social Jurídica *</label>
                    <input type="text" id="wizard-biz-name" class="form-control" placeholder="Ej: Inversiones Los Samanes C.A." required minlength="3" maxlength="120" autocomplete="organization">
                    <div class="invalid-feedback">Mínimo 3 caracteres.</div>
                </div>
                <div class="col-md-4">
                    <label for="wizard-biz-rif-num" class="form-label">RIF / Cédula Fiscal *</label>
                    <div class="input-group">
                        <select id="wizard-biz-rif-prefix" class="form-select bg-light-subtle flex-grow-0 w-auto" aria-label="Prefijo RIF">
                            <option value="J-" selected>J-</option>
                            <option value="G-">G-</option>
                            <option value="V-">V-</option>
                            <option value="E-">E-</option>
                        </select>
                        <input type="text" id="wizard-biz-rif-num" class="form-control" placeholder="12345678-9" required pattern="^[0-9]{6,10}-?[0-9]$" maxlength="12" inputmode="numeric">
                    </div>
                    <div class="invalid-feedback">Formato: 12345678-9</div>
                </div>

                <div class="col-md-6">
                    <label for="wizard-biz-commercial-name" class="form-label">Nombre Comercial / Sucursal <span class="text-muted fw-normal">(opcional)</span></label>
                    <input type="text" id="wizard-biz-commercial-name" class="form-control" placeholder="Ej: Mini Market Los Samanes" maxlength="100">
                </div>
                <div class="col-md-6">
                    <label for="wizard-biz-category" class="form-label">Rubro / Categoría Principal *</label>
                    <select id="wizard-biz-category" class="form-select" required>
                        <option value="Retail / Alimentos" selected>Retail / Alimentos y Bebidas</option>
                        <option value="Farmacia & Salud">Farmacia & Artículos de Salud</option>
                        <option value="Mayorista & Distribución">Mayorista & Distribución</option>
                        <option value="Manufactura & Taller">Manufactura & Transformación</option>
                        <option value="Gastronomía & Restaurante">Gastronomía, Café & Restaurante</option>
                        <option value="Servicios Profesionales">Servicios Profesionales & Asesoría</option>
                        <option value="Tecnología & Ferretería">Tecnología, Repuestos & Ferretería</option>
                        <option value="Transporte & Logística">Transporte & Envíos</option>
                    </select>
                </div>

                <div class="col-12">
                    <label for="wizard-biz-description" class="form-label">Objeto o Descripción Comercial <span class="text-muted fw-normal">(opcional)</span></label>
                    <textarea id="wizard-biz-description" class="form-control" rows="2" placeholder="Breve descripción de actividades, productos estrella o servicios ofrecidos..." maxlength="500"></textarea>
                </div>
            </div>
        </div>

        <!-- PASO 2: Sede, Ubicación & Contacto -->
        <div class="wizard-step-pane" id="wizard-step-2-pane" role="tabpanel" aria-labelledby="wizard-step-2-tab">
            <div class="wizard-info-card d-flex align-items-center gap-3">
                <div class="p-2 rounded-3 bg-success-subtle text-success">
                    <i class="bi bi-geo-alt-fill fs-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-0 text-main">Paso 2: Sede, Ubicación & Contacto</h6>
                    <span class="small text-muted">Indique la ubicación física para control territorial e inventario multialmacén.</span>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <label for="wizard-biz-state" class="form-label">Estado Federal *</label>
                    <select id="wizard-biz-state" class="form-select" required>
                        <option value="Carabobo" selected>Carabobo</option>
                        <option value="Distrito Capital">Distrito Capital (Caracas)</option>
                        <option value="Miranda">Miranda</option>
                        <option value="Zulia">Zulia</option>
                        <option value="Aragua">Aragua</option>
                        <option value="Lara">Lara</option>
                        <option value="Anzoátegui">Anzoátegui</option>
                        <option value="Bolívar">Bolívar</option>
                        <option value="Táchira">Táchira</option>
                        <option value="Nueva Esparta">Nueva Esparta</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="wizard-biz-city" class="form-label">Ciudad o Municipio *</label>
                    <input type="text" id="wizard-biz-city" class="form-control" value="Valencia" required minlength="2" maxlength="80">
                </div>

                <div class="col-12">
                    <label for="wizard-biz-line1" class="form-label">Dirección de Sede (Línea 1) *</label>
                    <input type="text" id="wizard-biz-line1" class="form-control" placeholder="Ej: Av. Bolívar Norte, CC Cristal, Nivel 1, Local 4" required minlength="5" maxlength="200">
                </div>

                <div class="col-md-6">
                    <label for="wizard-biz-reference" class="form-label">Punto de Referencia <span class="text-muted fw-normal">(opcional)</span></label>
                    <input type="text" id="wizard-biz-reference" class="form-control" placeholder="Ej: Frente a estación del metro" maxlength="150">
                </div>
                <div class="col-md-6">
                    <label for="wizard-biz-zip" class="form-label">Código Postal <span class="text-muted fw-normal">(opcional)</span></label>
                    <input type="text" id="wizard-biz-zip" class="form-control" value="2001" maxlength="10" inputmode="numeric">
                </div>

                <div class="col-md-6">
                    <label for="wizard-biz-phone" class="form-label">Teléfono / WhatsApp <span class="text-muted fw-normal">(opcional)</span></label>
                    <input type="tel" id="wizard-biz-phone" class="form-control" placeholder="+58 412-1234567" maxlength="20">
                </div>
                <div class="col-md-6">
                    <label for="wizard-biz-email" class="form-label">Correo de Facturación <span class="text-muted fw-normal">(opcional)</span></label>
                    <input type="email" id="wizard-biz-email" class="form-control" placeholder="facturacion@empresa.com" maxlength="120">
                </div>
            </div>
        </div>

        <!-- PASO 3: Régimen Cambiario, Impuestos & Finanzas -->
        <div class="wizard-step-pane" id="wizard-step-3-pane" role="tabpanel" aria-labelledby="wizard-step-3-tab">
            <div class="wizard-info-card d-flex align-items-center gap-3">
                <div class="p-2 rounded-3 bg-warning-subtle text-warning">
                    <i class="bi bi-cash-coin fs-5"></i>
                </div>
                <div>
                    <h6 class="fw-bold mb-0 text-main">Paso 3: Operación, Impuestos & Medios de Pago</h6>
                    <span class="small text-muted">Configure las monedas oficiales, retenciones tributarias y canales POS.</span>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <div class="p-3 rounded-3 border border-glass bg-surface-glass h-100">
                        <span class="form-label d-block mb-2">Moneda Base Contable</span>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1.5">USD ($)</span>
                            <span class="small text-muted">Dólar Estadounidense</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="p-3 rounded-3 border border-glass bg-surface-glass h-100">
                        <span class="form-label d-block mb-2">Moneda Transacción POS</span>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-success-subtle text-success fw-bold px-2.5 py-1.5">VES (Bs.)</span>
                            <span class="small text-muted">Tasa Oficial BCV</span>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="p-3 rounded-3 border border-glass bg-surface-glass h-100">
                        <div class="form-check form-switch mb-1">
                            <input class="form-check-input" type="checkbox" id="wizard-biz-iva-apply" checked>
                            <label class="form-check-label fw-bold small text-main" for="wizard-biz-iva-apply">Aplicar IVA General (16%)</label>
                        </div>
                        <p class="text-muted small mb-0">Calcula automáticamente el 16% sobre bienes no exentos en cada factura.</p>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="p-3 rounded-3 border border-glass bg-surface-glass h-100">
                        <div class="form-check form-switch mb-2">
                            <input class="form-check-input" type="checkbox" id="wizard-biz-igtf-apply" checked>
                            <label class="form-check-label fw-bold small text-main" for="wizard-biz-igtf-apply">Aplicar IGTF Divisas (3%)</label>
                        </div>
                        <div class="form-check form-switch pt-2 border-top border-glass">
                            <input class="form-check-input" type="checkbox" id="wizard-biz-igtf-absorb">
                            <label class="form-check-label small text-muted" for="wizard-biz-igtf-absorb">Absorber 3% por el comercio</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
