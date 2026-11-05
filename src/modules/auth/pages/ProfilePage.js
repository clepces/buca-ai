/**
 * ProfilePage - Perfil de Usuario Dinámico
 * =========================================================================
 * Visualización y edición de datos del usuario en sesión.
 * Utiliza el estilo Corporate Hybrid Glass.
 */

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
                        <!-- Vista Pública -->
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

                        <!-- Vista de Edición -->
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
        import('../services/AuthService.js').then(({ AuthService }) => {
            import('firebase/auth').then(({ getAuth, updateProfile }) => {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    console.warn('[ProfilePage] No hay usuario en sesión. Redirigiendo a login...');
                    window.location.href = '/auth/login';
                    return;
                }

                // Cargar datos actuales
                const displayName = user.displayName || 'Usuario Corporativo';
                const email = user.email || '---';
                const photoURL = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff&size=96`;
                
                document.getElementById('profile-display-name').textContent = displayName;
                document.getElementById('profile-email').textContent = email;
                document.getElementById('profile-avatar').src = photoURL;

                // Cargar metadatos
                const lastLogin = user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Desconocido';
                const createdAt = user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Desconocido';
                document.getElementById('profile-last-login').textContent = lastLogin;
                document.getElementById('profile-created-at').textContent = createdAt;

                // Lógica del form de edición
                const editForm = document.getElementById('profile-edit-form');
                const nameInput = document.getElementById('edit-display-name');
                const photoInput = document.getElementById('edit-photo-url');
                const btnSave = document.getElementById('btn-save-profile');
                const feedback = document.getElementById('profile-feedback');

                nameInput.value = user.displayName || '';
                photoInput.value = user.photoURL || '';

                if (editForm) {
                    editForm.onsubmit = async (e) => {
                        e.preventDefault();
                        btnSave.disabled = true;
                        btnSave.innerHTML = '<div class="buca-spinner sm"></div>';
                        feedback.classList.add('d-none');

                        try {
                            await updateProfile(user, {
                                displayName: nameInput.value,
                                photoURL: photoInput.value
                            });

                            // Actualizar UI visual
                            document.getElementById('profile-display-name').textContent = nameInput.value || 'Usuario Corporativo';
                            if (photoInput.value) {
                                document.getElementById('profile-avatar').src = photoInput.value;
                            }

                            feedback.textContent = 'Perfil actualizado exitosamente.';
                            feedback.className = 'alert alert-success animate__animated animate__fadeIn py-2 small mb-4 text-center';
                            feedback.classList.remove('d-none');

                            setTimeout(() => feedback.classList.add('d-none'), 3000);

                        } catch (error) {
                            console.error('[ProfilePage] Error actualizando perfil:', error);
                            feedback.textContent = 'Error al actualizar el perfil.';
                            feedback.className = 'alert alert-danger animate__animated animate__headShake py-2 small mb-4 text-center';
                            feedback.classList.remove('d-none');
                        } finally {
                            btnSave.disabled = false;
                            btnSave.innerHTML = '<span>GUARDAR CAMBIOS</span><i class="bi bi-check2"></i>';
                        }
                    };
                }

                // Manejar Cerrar Sesión
                const btnLogout = document.getElementById('btn-logout');
                if (btnLogout) {
                    btnLogout.onclick = async () => {
                        await AuthService.logout();
                        window.location.href = '/auth/login';
                    };
                }
            });
        });
    }
};

export default ProfilePage;
