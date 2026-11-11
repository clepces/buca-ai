/**
 * ProfileSecurityTab - Plantilla sin estilos en línea para credenciales maestras y PIN Universal.
 * =========================================================================================
 * Fila de 2 Columnas: Izquierda: PIN Universal de Negocio | Derecha: Doble Factor 2FA
 * Abajo: Cambiar Contraseña Maestra con Requisitos Calibrados (Padding & Margin Perfectos)
 * =========================================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const ProfileSecurityTab = (data = {}) => {
    const { twoFactor = true, recoveryMail = '', pinCode = '' } = data;

    return `
        <div class="tab-content-pane" id="tab-profile-security">
            
            <!-- AVISO DE ZONA DE SEGURIDAD CRÍTICA Y PRUDENCIA -->
            <div class="alert alert-danger border border-danger-subtle bg-danger-subtle text-danger-emphasis p-3 rounded-4 mb-4 d-flex align-items-start gap-3 shadow-xs">
                <div class="profile-icon-box-sm rounded-circle bg-danger text-white d-flex align-items-center justify-content-center flex-shrink-0">
                    <i class="bi bi-shield-exclamation"></i>
                </div>
                <div>
                    <div class="fw-bold small">Zona de Seguridad, PIN Operativo & Control Estricto</div>
                    <div class="small opacity-85 profile-subtext-micro">
                        Las credenciales maestras, el PIN Universal y los factores de autenticación 2FA protegen los cierres de caja, anulaciones y auditorías. Mantén un correo de emergencia verificado.
                    </div>
                </div>
            </div>

            <!-- FILA DE 2 COLUMNAS: PIN UNIVERSAL (IZQUIERDA) Y 2FA / RECUPERACIÓN (DERECHA) -->
            <div class="row g-3 mb-4">
                
                <!-- COLUMNA IZQUIERDA: PIN UNIVERSAL DE NEGOCIO -->
                <div class="col-12 col-lg-6">
                    <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100">
                        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                            <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                                <i class="bi bi-key-fill text-warning"></i> PIN Universal de Operación (4-6 Dígitos)
                            </h5>
                            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold profile-badge-micro">
                                POS & Caja
                            </span>
                        </div>

                        <!-- NOTA DE PRUDENCIA SOBRE ÁMBITO DEL PIN -->
                        <div class="alert alert-warning border-0 bg-warning-subtle text-warning-emphasis p-2.5 rounded-3 mb-3 d-flex align-items-start gap-2 profile-subtext-micro">
                            <i class="bi bi-info-circle-fill text-warning fs-6 flex-shrink-0 mt-0.5"></i>
                            <div>
                                <strong>Nota de Seguridad:</strong> Este PIN funciona exclusivamente en los negocios y puntos de venta asociados a tu cuenta. Se exige para desbloquear cajas, autorizar anulaciones y firmar arqueos.
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">
                                PIN Universal del Negocio <span class="text-danger">*</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text bg-body-tertiary border text-warning"><i class="bi bi-shield-lock"></i></span>
                                <input type="password" id="prof-pin-code" class="form-control glass-input fw-bold font-monospace ${!pinCode ? 'border-warning' : ''}" value="${escapeHTML(pinCode)}" placeholder="••••" maxlength="6">
                                <button class="btn btn-outline-secondary" type="button" id="btn-toggle-pin" title="Mostrar/Ocultar PIN">
                                    <i class="bi bi-eye-fill"></i>
                                </button>
                            </div>
                            <div class="form-text text-muted profile-subtext-micro">Ingresa 4 a 6 dígitos numéricos autorizados.</div>
                        </div>
                    </div>
                </div>

                <!-- COLUMNA DERECHA: DOBLE FACTOR 2FA & CORREO DE RECUPERACIÓN -->
                <div class="col-12 col-lg-6">
                    <div class="card border rounded-4 p-3 p-md-4 bg-surface shadow-xs h-100">
                        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                            <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                                <i class="bi bi-shield-check text-success"></i> Doble Factor 2FA & Recuperación
                            </h5>
                            <span class="badge bg-success-subtle text-success border border-success-subtle fw-bold profile-badge-micro">
                                Activo
                            </span>
                        </div>

                        <!-- DOBLE FACTOR 2FA -->
                        <div class="card border rounded-4 p-3 bg-body-tertiary mb-3 shadow-xs">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-2">
                                <i class="bi bi-shield-check text-success me-1"></i>Doble Factor 2FA (Google Authenticator)
                            </label>
                            <div class="form-check form-switch p-2 rounded-3 bg-body border d-flex align-items-center justify-content-between shadow-xs mb-2">
                                <div>
                                    <label class="form-check-label fw-bold text-main d-block" for="profile-2fa-toggle">
                                        Exigir Doble Factor al Iniciar Sesión
                                    </label>
                                    <span class="small text-muted profile-subtext-micro">Autenticación por aplicación RFC 6238 ($0 costo).</span>
                                </div>
                                <input class="form-check-input ms-2" type="checkbox" id="profile-2fa-toggle" ${twoFactor ? 'checked' : ''}>
                            </div>

                            <!-- Botón para Vincular Google Authenticator -->
                            <button type="button" class="btn btn-sm btn-outline-primary w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5 mt-2" id="btn-setup-totp">
                                <i class="bi bi-qr-code-scan"></i>
                                <span>Configurar Google Authenticator (MFA)</span>
                            </button>
                        </div>

                        <!-- CORREO DE RECUPERACIÓN -->
                        <div class="card border rounded-4 p-3 bg-body-tertiary shadow-xs">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-2">
                                <i class="bi bi-envelope-at-fill text-warning me-1"></i>Correo de Recuperación
                            </label>
                            <input type="email" id="prof-recovery-email" class="form-control glass-input" value="${escapeHTML(recoveryMail)}" placeholder="emergencia@empresa.com">
                            <div class="form-text text-muted profile-subtext-micro">Restablecimiento inmediato en caso de extravío.</div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- CARD 3: CAMBIAR CONTRASEÑA MAESTRA CON CALIBRACIÓN DE REQUISITOS -->
            <div class="card border rounded-4 p-3 p-md-4 profile-security-dark-card shadow-xs mb-4">
                <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-danger-subtle">
                    <h5 class="fw-bold mb-0 text-main d-flex align-items-center gap-2 profile-card-title">
                        <i class="bi bi-shield-lock-fill text-danger fs-5"></i> Cambiar Contraseña Maestra (Control Estricto)
                    </h5>
                    <span class="badge bg-danger text-white font-monospace profile-badge-micro">
                        <i class="bi bi-exclamation-octagon-fill me-1"></i>ZONA PROTEGIDA
                    </span>
                </div>

                <form id="form-profile-password">
                    <div class="row g-3 mb-3">
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">Contraseña Actual <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-body-tertiary border"><i class="bi bi-key text-secondary"></i></span>
                                <input type="password" id="pwd-current" class="form-control glass-input" placeholder="••••••••">
                            </div>
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">Nueva Contraseña <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-body-tertiary border"><i class="bi bi-lock text-primary"></i></span>
                                <input type="password" id="pwd-new" class="form-control glass-input" placeholder="••••••••">
                            </div>
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label small fw-bold text-muted text-uppercase mb-1">Confirmar Contraseña <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <span class="input-group-text bg-body-tertiary border"><i class="bi bi-check2-circle text-success"></i></span>
                                <input type="password" id="pwd-confirm" class="form-control glass-input" placeholder="••••••••">
                            </div>
                        </div>
                    </div>

                    <!-- COMPONENTE: REQUISITOS DE COMPLEJIDAD CON PADDING Y MARGINS PERFECTAMENTE CALIBRADOS -->
                    <div class="profile-pwd-complexity-box">
                        <div class="fw-bold small text-main mb-2 profile-subtext-micro d-flex align-items-center gap-1.5">
                            <i class="bi bi-shield-check text-success fs-6"></i>Requisitos de Complejidad de Contraseña Maestra:
                        </div>
                        <div class="row g-2 text-muted profile-subtext-micro">
                            <div class="col-12 col-sm-6 col-md-3 d-flex align-items-center gap-1.5">
                                <i class="bi bi-check-circle-fill text-success"></i><span>Mínimo 8 caracteres</span>
                            </div>
                            <div class="col-12 col-sm-6 col-md-3 d-flex align-items-center gap-1.5">
                                <i class="bi bi-check-circle-fill text-success"></i><span>Una letra mayúscula (A-Z)</span>
                            </div>
                            <div class="col-12 col-sm-6 col-md-3 d-flex align-items-center gap-1.5">
                                <i class="bi bi-check-circle-fill text-success"></i><span>Un número (0-9)</span>
                            </div>
                            <div class="col-12 col-sm-6 col-md-3 d-flex align-items-center gap-1.5">
                                <i class="bi bi-check-circle-fill text-success"></i><span>Un símbolo especial (!@#$)</span>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end">
                        <button type="submit" class="btn btn-warning text-dark rounded-pill px-4 py-2.5 fw-bold shadow-sm">
                            <i class="bi bi-shield-lock-fill me-2"></i> Actualizar Credenciales & PIN de Seguridad
                        </button>
                    </div>
                </form>
            </div>

        </div>
    `;
};

export default ProfileSecurityTab;
