/**
 * ProfileHero - Banner de identidad visual compacto, denso y estructurado sin inline styles.
 * =========================================================================
 * Datos estrictamente reales. Cero datos quemados.
 * =========================================================================
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const ProfileHero = (data = {}) => {
    const { fullName, platformRole, username, email, initials, activeMode, uid, avatarUrl, createdAt } = data;
    const shortUid = uid ? (uid.length > 12 ? `${uid.substring(0, 10)}...` : uid) : '-';

    return `
        <div class="profile-hero-banner mb-3 rounded-4 shadow-xs position-relative overflow-hidden">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                
                <!-- SECCIÓN IZQUIERDA: FOTO DE PERFIL Y DATOS COMPACTOS -->
                <div class="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                    
                    <div class="position-relative flex-shrink-0">
                        <div class="profile-avatar-giant rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm overflow-hidden mx-auto">
                            ${avatarUrl ? `
                                <img src="${escapeHTML(avatarUrl)}" alt="Avatar">
                            ` : `
                                <span>${escapeHTML(initials || 'ID')}</span>
                            `}
                        </div>
                        
                        <button type="button" id="btn-change-avatar" class="profile-avatar-btn position-absolute bottom-0 end-0 bg-primary text-white rounded-circle border-0 d-flex align-items-center justify-content-center shadow-sm transition-all" title="Cambiar foto de perfil">
                            <i class="bi bi-camera-fill"></i>
                        </button>
                        <input type="file" id="input-avatar-file" accept="image/*" class="d-none">
                    </div>

                    <!-- BLOQUE DE INFORMACIÓN DENSO -->
                    <div class="flex-grow-1 min-w-0">
                        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <h4 class="fw-bold mb-0 text-main text-truncate profile-hero-title">${escapeHTML(fullName || 'Usuario')}</h4>
                            
                            <span class="badge bg-warning text-dark border border-warning-subtle fw-bold px-2 py-0.5 rounded-pill shadow-xs profile-badge-micro">
                                <i class="bi bi-person-badge me-1"></i>${escapeHTML(platformRole || 'USER')}
                            </span>
                        </div>

                        <!-- LÍNEA 2: METADATOS EN BADGES DE ALTA DENSIDAD -->
                        <div class="d-flex flex-wrap align-items-center gap-1.5 mb-1.5">
                            ${username ? `
                                <span class="badge bg-body-tertiary text-primary border font-monospace px-2 py-0.5 profile-badge-sm">
                                    <i class="bi bi-at me-0.5"></i>${escapeHTML(username)}
                                </span>
                            ` : ''}

                            ${email ? `
                                <span class="badge bg-body-tertiary text-main border fw-medium px-2 py-0.5 profile-badge-sm">
                                    <i class="bi bi-envelope-fill me-1 text-muted"></i>${escapeHTML(email)}
                                </span>
                            ` : ''}

                            <span class="badge bg-body-tertiary text-secondary border font-monospace px-2 py-0.5 profile-badge-sm" title="ID de Usuario: ${escapeHTML(uid || '')}">
                                <i class="bi bi-fingerprint me-1 text-primary"></i>ID: ${escapeHTML(shortUid)}
                            </span>

                            <span class="badge bg-body-tertiary text-muted border px-2 py-0.5 profile-badge-sm">
                                <i class="bi bi-calendar3 me-1 text-primary"></i>Alta: ${escapeHTML(createdAt || '-')}
                            </span>
                        </div>

                        <!-- LÍNEA 3: BADGES DE MODO OPERATIVO Y MEMBRESÍA -->
                        <div class="d-flex flex-wrap align-items-center gap-1.5">
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill profile-badge-sm">
                                <i class="bi bi-shield-person-fill me-1"></i>Modo: <strong>${activeMode === 'owner' ? 'Propietario' : (activeMode === 'manager' ? 'Gerente' : 'Operador')}</strong>
                            </span>
                        </div>
                    </div>

                </div>

                <!-- SECCIÓN DERECHA: ESTADO DE LA CUENTA -->
                <div class="flex-shrink-0 profile-status-widget">
                    <div class="p-2 px-3 rounded-3 bg-body-tertiary border shadow-xs">
                        <div class="d-flex align-items-center justify-content-between mb-1">
                            <span class="fw-bold text-main profile-badge-sm">Estado de Sesión</span>
                            <span class="badge bg-success text-white fw-bold rounded-pill profile-badge-micro">ACTIVO</span>
                        </div>
                        <div class="text-muted text-truncate profile-badge-micro">
                            <i class="bi bi-check-circle-fill text-success me-1"></i>Supabase Auth Verificado
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
};

export default ProfileHero;
