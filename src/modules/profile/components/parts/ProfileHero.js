/**
 * ProfileHero - Banner de identidad visual compacto, denso y estructurado sin inline styles.
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const ProfileHero = (data = {}) => {
    const { fullName, platformRole, username, email, initials, activeMode, uid, avatarUrl, createdAt } = data;

    const shortUid = uid ? (uid.length > 12 ? `${uid.substring(0, 10)}...` : uid) : 'USR-ROOT-001';

    return `
        <div class="profile-hero-banner mb-3 rounded-4 shadow-xs position-relative overflow-hidden">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                
                <!-- SECCIÓN IZQUIERDA: FOTO DE PERFIL Y DATOS COMPACTOS -->
                <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                    
                    <!-- FOTO AVATAR (SIEMPRE A LA IZQUIERDA DEL NOMBRE) -->
                    <div class="position-relative flex-shrink-0">
                        <div class="profile-avatar-giant rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm overflow-hidden mx-auto">
                            ${avatarUrl ? `
                                <img src="${escapeHTML(avatarUrl)}" alt="Avatar">
                            ` : `
                                <span>${escapeHTML(initials)}</span>
                            `}
                        </div>
                        
                        <!-- BOTÓN DE CÁMARA PARA CAMBIAR FOTO -->
                        <button type="button" id="btn-change-avatar" class="profile-avatar-btn position-absolute bottom-0 end-0 bg-primary text-white rounded-circle border-0 d-flex align-items-center justify-content-center shadow-sm transition-all" title="Cambiar foto de perfil">
                            <i class="bi bi-camera-fill"></i>
                        </button>
                        <input type="file" id="input-avatar-file" accept="image/*" class="d-none">
                    </div>

                    <!-- BLOQUE DE INFORMACIÓN DENSO -->
                    <div class="flex-grow-1 min-w-0">
                        <!-- LÍNEA 1: NOMBRE PRINCIPAL Y BADGES PRINCIPALES -->
                        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <h4 class="fw-bold mb-0 text-main text-truncate profile-hero-title">${escapeHTML(fullName)}</h4>
                            
                            <span class="badge bg-warning text-dark border border-warning-subtle fw-bold px-2 py-0.5 rounded-pill shadow-xs profile-badge-micro">
                                <i class="bi bi-crown-fill me-1"></i>${escapeHTML(platformRole)}
                            </span>
                            
                            <span class="badge bg-success-subtle text-success border border-success-subtle fw-bold px-2 py-0.5 rounded-pill profile-badge-micro">
                                <i class="bi bi-patch-check-fill me-1"></i>VERIFICADO ROOT
                            </span>

                            <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-0.5 rounded-pill profile-badge-micro">
                                <i class="bi bi-activity me-1"></i>ACTIVO 24/7
                            </span>
                        </div>

                        <!-- LÍNEA 2: METADATOS EN BADGES DE ALTA DENSIDAD -->
                        <div class="d-flex flex-wrap align-items-center gap-1.5 mb-1.5">
                            <span class="badge bg-body-tertiary text-primary border font-monospace px-2 py-0.5 profile-badge-sm">
                                <i class="bi bi-at me-0.5"></i>${escapeHTML(username)}
                            </span>

                            <span class="badge bg-body-tertiary text-main border fw-medium px-2 py-0.5 profile-badge-sm">
                                <i class="bi bi-envelope-fill me-1 text-muted"></i>${escapeHTML(email)}
                            </span>

                            <span class="badge bg-body-tertiary text-secondary border font-monospace px-2 py-0.5 profile-badge-sm" title="ID Único en Firestore: ${escapeHTML(uid)}">
                                <i class="bi bi-fingerprint me-1 text-primary"></i>ID: ${escapeHTML(shortUid)}
                            </span>

                            <span class="badge bg-body-tertiary text-muted border px-2 py-0.5 profile-badge-sm">
                                <i class="bi bi-calendar3 me-1 text-primary"></i>Reg: ${escapeHTML(createdAt)}
                            </span>
                        </div>

                        <!-- LÍNEA 3: BADGES DE MODO OPERATIVO Y MEMBRESÍA -->
                        <div class="d-flex flex-wrap align-items-center gap-1.5">
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill profile-badge-sm">
                                <i class="bi bi-shield-person-fill me-1"></i>Modo: <strong>${activeMode === 'owner' ? 'Propietario Total' : (activeMode === 'manager' ? 'Gerente' : 'Operador')}</strong>
                            </span>
                            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1 rounded-pill profile-badge-sm">
                                <i class="bi bi-star-fill me-1 text-warning"></i><strong>Enterprise Master Unlimited</strong>
                            </span>
                        </div>
                    </div>

                </div>

                <!-- SECCIÓN DERECHA: COMPLETITUD DE PERFIL CORPORATIVO -->
                <div class="flex-shrink-0 profile-status-widget">
                    <div class="p-2 px-3 rounded-3 bg-body-tertiary border shadow-xs">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <span class="fw-bold text-main profile-badge-sm">Perfil Corporativo</span>
                            <span class="badge bg-primary text-white fw-bold rounded-pill profile-badge-micro">100% OK</span>
                        </div>
                        <div class="progress mb-1 profile-progress-bar-sm">
                            <div class="progress-bar bg-primary rounded-pill w-100" role="progressbar"></div>
                        </div>
                        <div class="text-muted text-truncate profile-badge-micro">
                            <i class="bi bi-check-circle-fill text-success me-1"></i>Datos fiscales & PIN listos
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
};

export default ProfileHero;
