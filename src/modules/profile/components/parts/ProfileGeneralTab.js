/**
 * ProfileGeneralTab - Plantilla mejorada en cuadrícula de 2 columnas sin estilos en línea.
 * =====================================================================================
 * Izquierda: Regionalización & Preferencias ERP | Derecha: Rol Operativo & Bloqueo
 * Abajo: Domicilio Fiscal & Dirección de Facturación
 * =====================================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const ProfileGeneralTab = (data = {}) => {
    const username = data.username || '';
    const email = data.email || '';
    const firstName = data.firstName || '';
    const lastName = data.lastName || '';
    const taxId = data.taxId || data.tax_id || '';
    const phone = data.phone || '';
    const activeMode = data.activeMode || data.active_mode || 'owner';
    const fiscalAddress = data.fiscalAddress || data.fiscal_address || '';
    const cityState = data.cityState || data.city_state || '';
    const timeoutMins = Number(data.session_timeout_mins ?? 30);
    const timezone = data.timezone || 'America/Caracas';
    const preferredCurrency = data.preferred_currency || 'VES_BCV';
    const language = data.language || 'es_VE';

    const isProfileIncomplete = !taxId || !fiscalAddress || !phone;

    return `
        <div class="tab-content-pane active" id="tab-profile-general">
            <form id="form-profile-general">
                
                <!-- ALERTA SI FALTAN CAMPOS FISCALES O DE CONTACTO -->
                ${isProfileIncomplete ? `
                    <div class="alert alert-warning border border-warning-subtle bg-warning-subtle text-warning-emphasis p-3 rounded-4 mb-4 d-flex align-items-start gap-3 shadow-xs animate__animated animate__fadeIn">
                        <div class="profile-icon-box-sm rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center flex-shrink-0">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                        </div>
                        <div>
                            <div class="fw-bold small">Atención: Datos Fiscales Incompletos</div>
                            <div class="small opacity-85 profile-subtext-micro">
                                Para emitir facturación electrónica legal, generar reportes contables y firmar cierres de caja, completa tu <strong>Cédula/RIF</strong>, <strong>Dirección Fiscal</strong> y <strong>Teléfono Móvil</strong>.
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- CARD 1: DATOS PERSONALES & CUENTA CORPORATIVA -->
                <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs mb-4">
                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                            <i class="bi bi-person-vcard-fill text-primary"></i> Identidad & Cuenta Corporativa
                        </h5>
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-2.5 py-1 rounded-pill profile-badge-md">
                            <i class="bi bi-cloud-check-fill me-1"></i>Sincronizado Firestore
                        </span>
                    </div>

                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Alias / Nombre de Usuario <span class="text-danger">*</span>
                                <i class="bi bi-info-circle text-primary ms-1" title="Nombre único visible en auditorías y firmas de caja"></i>
                            </label>
                            <input type="text" id="prof-username" class="form-control glass-input fw-semibold" value="${escapeHTML(username)}" required placeholder="ej. asicodia">
                            <div class="form-text text-muted profile-subtext-micro">Identificador único en reportes ERP.</div>
                        </div>
                        
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Correo Electrónico Principal <span class="text-danger">*</span>
                                <i class="bi bi-info-circle text-success ms-1" title="Correo verificado en Supabase Auth"></i>
                            </label>
                            <input type="email" id="prof-email" class="form-control glass-input opacity-75" value="${escapeHTML(email)}" readonly title="Vinculado a Supabase Auth">
                            <div class="form-text text-muted profile-subtext-micro">Vinculado a la cuenta de autenticación.</div>
                        </div>
                        
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Nombres <span class="text-danger">*</span>
                            </label>
                            <input type="text" id="prof-firstname" class="form-control glass-input" value="${escapeHTML(firstName)}" required placeholder="Nombres del titular">
                        </div>
                        
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Apellidos <span class="text-danger">*</span>
                            </label>
                            <input type="text" id="prof-lastname" class="form-control glass-input" value="${escapeHTML(lastName)}" required placeholder="Apellidos del titular">
                        </div>
                        
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Cédula de Identidad / RIF Fiscal <span class="text-danger">*</span>
                                <i class="bi bi-info-circle text-warning ms-1" title="Exigido por el SENIAT para emitir facturación formal"></i>
                            </label>
                            <input type="text" id="prof-tax-id" class="form-control glass-input ${!taxId ? 'border-warning' : ''}" value="${escapeHTML(taxId)}" required placeholder="ej. V-12345678-0 / J-50000000-0">
                            ${!taxId ? '<span class="text-warning small fw-medium d-block mt-0.5 profile-subtext-micro"><i class="bi bi-exclamation-circle me-1"></i>Requerido para facturación legal SENIAT</span>' : ''}
                        </div>
                        
                        <div class="col-12 col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Teléfono Móvil / Whatsapp <span class="text-danger">*</span>
                                <i class="bi bi-info-circle text-info ms-1" title="Para alertas instantáneas de seguridad y cierres de turno"></i>
                            </label>
                            <input type="text" id="prof-phone" class="form-control glass-input ${!phone ? 'border-warning' : ''}" value="${escapeHTML(phone)}" required placeholder="+58 412-0000000">
                            ${!phone ? '<span class="text-warning small fw-medium d-block mt-0.5 profile-subtext-micro"><i class="bi bi-exclamation-circle me-1"></i>Requerido para notificaciones de seguridad</span>' : ''}
                        </div>
                    </div>
                </div>

                <!-- BLOQUE EN 2 COLUMNAS: REGIONALIZACIÓN (IZQUIERDA) Y ROL OPERATIVO (DERECHA) -->
                <div class="row g-3 mb-4">
                    
                    <!-- COLUMNA IZQUIERDA: REGIONALIZACIÓN & PREFERENCIAS DEL ERP -->
                    <div class="col-12 col-lg-6">
                        <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100">
                            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                                    <i class="bi bi-globe-americas text-info"></i> Regionalización & Preferencias
                                </h5>
                                <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle profile-badge-micro">Localización</span>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                        <i class="bi bi-clock-history text-primary me-1"></i>Zona Horaria Oficial <span class="text-danger">*</span>
                                    </label>
                                    <select id="prof-timezone" class="form-select glass-input fw-semibold">
                                        <option value="America/Caracas" ${timezone === 'America/Caracas' ? 'selected' : ''}>🇻🇪 Caracas (UTC-04:00)</option>
                                        <option value="America/Bogota" ${timezone === 'America/Bogota' ? 'selected' : ''}>🇨🇴 Bogotá / Lima (UTC-05:00)</option>
                                        <option value="America/New_York" ${timezone === 'America/New_York' ? 'selected' : ''}>🇺🇸 Nueva York (UTC-05:00)</option>
                                        <option value="Europe/Madrid" ${timezone === 'Europe/Madrid' ? 'selected' : ''}>🇪🇸 Madrid (UTC+01:00)</option>
                                    </select>
                                    <div class="form-text text-muted profile-subtext-micro">Timbrado de facturas y cierres de caja.</div>
                                </div>

                                <div class="col-12">
                                    <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                        <i class="bi bi-coin text-warning me-1"></i>Moneda Preferida de Sesión <span class="text-danger">*</span>
                                    </label>
                                    <select id="prof-currency" class="form-select glass-input fw-semibold">
                                        <option value="VES_BCV" ${preferredCurrency === 'VES_BCV' ? 'selected' : ''}>🇻🇪 Bolívares (Tasa Oficial BCV)</option>
                                        <option value="USD" ${preferredCurrency === 'USD' ? 'selected' : ''}>💵 Dólares Efectivo (USD)</option>
                                        <option value="USDT" ${preferredCurrency === 'USDT' ? 'selected' : ''}>🪙 USDT Crypto (Binance P2P)</option>
                                    </select>
                                    <div class="form-text text-muted profile-subtext-micro">Moneda principal para gráficos e indicadores del Workspace.</div>
                                </div>

                                <div class="col-12">
                                    <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                        <i class="bi bi-translate text-success me-1"></i>Idioma de Interfaz <span class="text-danger">*</span>
                                    </label>
                                    <select id="prof-language" class="form-select glass-input">
                                        <option value="es_VE" ${language === 'es_VE' ? 'selected' : ''}>Español (Venezuela / LATAM)</option>
                                        <option value="en_US" ${language === 'en_US' ? 'selected' : ''}>English (United States)</option>
                                    </select>
                                    <div class="form-text text-muted profile-subtext-micro">Idioma de reportes PDF exportados.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: ROL OPERATIVO & BLOQUEO DE PANTALLA -->
                    <div class="col-12 col-lg-6">
                        <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100">
                            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                                <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                                    <i class="bi bi-sliders text-warning"></i> Rol Operativo & Inactividad
                                </h5>
                                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle profile-badge-micro">Acceso POS</span>
                            </div>

                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                        <i class="bi bi-shield-person-fill text-primary me-1"></i>Modo Operativo Activo <span class="text-danger">*</span>
                                    </label>
                                    <select id="prof-active-mode" class="form-select glass-input fw-semibold">
                                        <option value="owner" ${activeMode === 'owner' ? 'selected' : ''}>👑 Propietario Total (Control Absoluto Root)</option>
                                        <option value="manager" ${activeMode === 'manager' ? 'selected' : ''}>💼 Gerente de Unidad Comercial</option>
                                        <option value="worker" ${activeMode === 'worker' ? 'selected' : ''}>🛠️ Operador Comercial & Cajero POS</option>
                                    </select>
                                    <div class="form-text text-muted profile-subtext-micro">Define nivel de permisos y accesos en el Workspace.</div>
                                </div>

                                <div class="col-12">
                                    <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                        <i class="bi bi-hourglass-split text-info me-1"></i>Bloqueo por Inactividad de Sesión <span class="text-danger">*</span>
                                    </label>
                                    <select id="prof-timeout" class="form-select glass-input">
                                        <option value="15" ${timeoutMins === 15 ? 'selected' : ''}>15 Minutos (Máxima Seguridad)</option>
                                        <option value="30" ${timeoutMins === 30 ? 'selected' : ''}>30 Minutos (Recomendado)</option>
                                        <option value="60" ${timeoutMins === 60 ? 'selected' : ''}>60 Minutos (Sucursal Transitada)</option>
                                        <option value="0" ${timeoutMins === 0 ? 'selected' : ''}>Sin Bloqueo por Inactividad</option>
                                    </select>
                                    <div class="form-text text-muted profile-subtext-micro">Cierre preventivo de pantalla para evitar accesos no autorizados.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <!-- CARD ABAJO: UBICACIÓN GEOGRÁFICA Y DOMICILIO FISCAL -->
                <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs mb-4">
                    <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                            <i class="bi bi-geo-alt-fill text-danger"></i> Domicilio Fiscal & Dirección de Facturación
                        </h5>
                        <span class="badge bg-secondary-subtle text-secondary profile-badge-micro">Requisito Legal</span>
                    </div>
                    <div class="row g-3">
                        <div class="col-12 col-md-8">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Dirección Fiscal Completa <span class="text-danger">*</span>
                            </label>
                            <input type="text" id="prof-fiscal-address" class="form-control glass-input ${!fiscalAddress ? 'border-warning' : ''}" value="${escapeHTML(fiscalAddress)}" required placeholder="Av. Principal, Edificio / Local, Piso, Oficina">
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                Ciudad / Estado <span class="text-danger">*</span>
                            </label>
                            <input type="text" id="prof-city-state" class="form-control glass-input ${!cityState ? 'border-warning' : ''}" value="${escapeHTML(cityState)}" required placeholder="Caracas, Distrito Capital">
                        </div>
                    </div>
                </div>

                <!-- BOTÓN SUBMIT GENERAL -->
                <div class="d-flex justify-content-end">
                    <button type="submit" id="btn-save-profile-general" class="btn btn-primary rounded-pill px-4 py-2.5 fw-bold shadow-sm">
                        <i class="bi bi-cloud-arrow-up-fill me-2"></i> Guardar Identidad General en Firestore
                    </button>
                </div>
            </form>
        </div>
    `;
};

export default ProfileGeneralTab;
