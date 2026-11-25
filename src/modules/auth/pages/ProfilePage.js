/**
 * ProfilePage - Perfil de Usuario Dinámico
 * =========================================================================
 * Visualización y edición de datos del usuario en sesión.
 * Utiliza el estilo Corporate Hybrid Glass.
 */
import { $id, $on, $text, $attr, $hide, $show, $className } from '@/shared/utils/dom.js';
import { AuthService } from '../services/AuthService.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { safeReload } from '@/core/utils/system-helper.js';
import { Logger } from '@/shared/utils/logger.js';

export const ProfilePage = {
    render() {
        return `
            <div class="auth-view-content profile-view animate__animated animate__fadeIn">
                <header class="text-center mb-4">
                    <div class="profile-avatar-wrapper mb-3 position-relative d-inline-block">
                        <img id="profile-avatar" src="https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&size=96" alt="Avatar" class="rounded-circle shadow-sm profile-avatar-img">
                        <button class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle profile-avatar-btn" id="btn-edit-avatar" aria-label="Editar Avatar">
                            <i class="bi bi-camera-fill"></i>
                        </button>
                    </div>
                    <h2 class="h5 fw-bold text-primary mb-1" id="profile-display-name">Cargando Perfil...</h2>
                    <p class="text-muted small mb-0" id="profile-email">---</p>
                    <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mt-2" id="profile-role-badge">Usuario</span>
                </header>

                <div id="profile-feedback" class="alert alert-success d-none animate__animated py-2 small mb-4 text-center"></div>

                <div class="glass-panel p-3 mb-4 rounded-3 profile-tabs-glass-panel">
                    <ul class="nav nav-pills nav-fill gap-2 mb-3" id="profile-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active rounded-pill glass-input py-1 small fw-bold" id="tab-public" data-bs-toggle="tab" data-bs-target="#content-public" type="button" role="tab">Información</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link rounded-pill glass-input py-1 small fw-bold" id="tab-edit" data-bs-toggle="tab" data-bs-target="#content-edit" type="button" role="tab">Editar</button>
                        </li>
                    </ul>

                    <div class="tab-content" id="profile-tab-content">
                        <div class="tab-pane fade show active" id="content-public" role="tabpanel">
                            <ul class="list-unstyled small mb-0 text-muted">
                                <li class="mb-2 d-flex justify-content-between border-bottom pb-2 border-opacity-10">
                                    <span><i class="bi bi-clock-history me-2"></i>Último Acceso</span>
                                    <span class="fw-semibold text-dark" id="profile-last-login">---</span>
                                </li>
                                <li class="mb-2 d-flex justify-content-between border-bottom pb-2 border-opacity-10">
                                    <span><i class="bi bi-calendar-check me-2"></i>Miembro desde</span>
                                    <span class="fw-semibold text-dark" id="profile-created-at">---</span>
                                </li>
                                <li class="d-flex justify-content-between">
                                    <span><i class="bi bi-shield-check me-2"></i>Estado</span>
                                    <span class="text-success fw-semibold"><i class="bi bi-check-circle-fill me-1"></i>Verificado</span>
                                </li>
                            </ul>
                        </div>

                        <div class="tab-pane fade" id="content-edit" role="tabpanel">
                            <form id="profile-edit-form">
                                <div class="form-group mb-3">
                                    <label class="form-label small fw-bold text-uppercase opacity-75">Nombre de Mostrar</label>
                                    <div class="input-wrapper">
                                        <i class="bi bi-person"></i>
                                        <input type="text" id="edit-display-name" class="glass-input" placeholder="Tu Nombre">
                                    </div>
                                </div>
                                <div class="form-group mb-3">
                                    <label class="form-label small fw-bold text-uppercase opacity-75">URL de Avatar</label>
                                    <div class="input-wrapper">
                                        <i class="bi bi-link"></i>
                                        <input type="url" id="edit-photo-url" class="glass-input" placeholder="https://...">
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2" id="btn-save-profile">
                                    <span>GUARDAR CAMBIOS</span>
                                    <i class="bi bi-check2"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <footer class="text-center mt-4">
                    <button class="btn btn-outline-danger btn-sm rounded-pill px-4" id="btn-logout">
                        <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                    </button>
                    <div class="mt-3">
                        <a href="/workspaces" class="small text-decoration-none d-flex align-items-center justify-content-center gap-2 text-primary">
                            <i class="bi bi-grid"></i> Ir al Workspace
                        </a>
                    </div>
                </footer>
            </div>
        `;
    },

    init() {
        Promise.all([
            import('@/core/state/session.js'),
            import('../services/UserService.js')
        ]).then(([{ sessionState }, { userService }]) => {
            const { user } = sessionState.get();

            if (!user) {
                Logger.warn('ProfilePage', 'No hay usuario en sesión. Redirigiendo a login...');
                safeReload('/auth/login');
                return;
            }

            const displayName = user.displayName || user.email || '';
            const email = user.email || '';
            const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=96`;

            $text('profile-display-name', displayName);
            $text('profile-email', email);
            $attr('profile-avatar', 'src', photoURL);

            const editForm = $id('profile-edit-form');
            const nameInput = $id('edit-display-name');
            const btnSave = $id('btn-save-profile');
            const feedback = $id('profile-feedback');

            if (nameInput) nameInput.value = user.displayName || '';

            if (editForm) {
                $on(editForm, 'submit', async (e) => {
                    e.preventDefault();
                    btnSave.disabled = true;
                    setButtonLoading(btnSave, true, 'Guardando...');
                    $hide(feedback);

                    try {
                        const nameParts = nameInput.value.trim().split(' ');
                        await userService.updateProfile({
                            firstName: nameParts[0] || '',
                            lastName: nameParts.slice(1).join(' ') || '',
                            username: user.email.split('@')[0],
                            mail: user.email
                        });

                        $text('profile-display-name', nameInput.value || user.email || '');
                        feedback.textContent = 'Perfil actualizado exitosamente.';
                        $className(feedback, 'alert alert-success animate__animated animate__fadeIn py-2 small mb-4 text-center');
                        $show(feedback);
                        setTimeout(() => $hide(feedback), 3000);
                    } catch (error) {
                        Logger.error('ProfilePage', 'Error actualizando perfil:', error);
                        feedback.textContent = 'Error al actualizar el perfil.';
                        $className(feedback, 'alert alert-danger animate__animated animate__headShake py-2 small mb-4 text-center');
                        $show(feedback);
                    } finally {
                        btnSave.disabled = false;
                        setButtonContent(btnSave, 'GUARDAR CAMBIOS', 'bi bi-check2');
                    }
                });
            }

            const btnLogout = $id('btn-logout');
            if (btnLogout) {
                $on(btnLogout, 'click', async () => {
                    await AuthService.logout();
                    safeReload('/auth/login');
                });
            }
        });
    }
};

export default ProfilePage;
