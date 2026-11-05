/**
 * SettingsPage - Panel de Configuraciones con Control de Roles
 * =========================================================================
 * Panel unificado para configurar cuenta y aplicación según roles
 * (super_admin, admin, owner).
 */

export const SettingsPage = {
    render() {
        return `
            <div class="auth-view-content settings-view animate__animated animate__fadeIn">
                <header class="text-center mb-4">
                    <div class="logo-box-auth mb-3 mx-auto shadow-sm logo-box-auth--settings">
                        <i class="bi bi-gear-fill text-primary"></i>
                    </div>
                    <h2 class="h5 fw-bold text-primary mb-1">Configuración</h2>
                    <p class="text-muted small mb-0">Gestión y Privilegios</p>
                </header>

                <div class="glass-panel p-3 mb-4 rounded-3 glass-panel--settings">
                    <ul class="nav nav-pills nav-fill gap-2 mb-3" id="settings-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active rounded-pill glass-input py-1 small fw-bold" data-bs-toggle="tab" data-bs-target="#settings-general" type="button" role="tab">General</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link rounded-pill glass-input py-1 small fw-bold" id="tab-business" data-bs-toggle="tab" data-bs-target="#settings-business" type="button" role="tab">Negocio</button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link rounded-pill glass-input py-1 small fw-bold text-danger d-none" id="tab-super" data-bs-toggle="tab" data-bs-target="#settings-super" type="button" role="tab">Core</button>
                        </li>
                    </ul>

                    <div class="tab-content">
                        <!-- Configuraciones Generales -->
                        <div class="tab-pane fade show active" id="settings-general" role="tabpanel">
                            <div class="setting-item d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h6 class="mb-0 small fw-bold">Tema Visual</h6>
                                    <span class="text-muted small">Forzar modo claro u oscuro</span>
                                </div>
                                <select class="form-select form-select-sm glass-input w-auto border-0 bg-transparent text-primary fw-bold cursor-pointer">
                                    <option value="auto">Automático</option>
                                    <option value="light">Claro</option>
                                    <option value="dark">Oscuro</option>
                                </select>
                            </div>
                            <div class="setting-item d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-0 small fw-bold">Notificaciones Email</h6>
                                    <span class="text-muted small">Alertas de seguridad al correo</span>
                                </div>
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" role="switch" checked>
                                </div>
                            </div>
                        </div>

                        <!-- Negocio (Admin/Owner) -->
                        <div class="tab-pane fade" id="settings-business" role="tabpanel">
                            <div class="alert alert-info py-2 small mb-3 border-0 bg-info bg-opacity-10 text-info">
                                <i class="bi bi-info-circle me-2"></i>Opciones de sucursal y facturación.
                            </div>
                            <div class="form-group mb-3">
                                <label class="form-label small fw-bold text-uppercase opacity-75">Nombre de la Empresa</label>
                                <div class="input-wrapper">
                                    <i class="bi bi-building"></i>
                                    <input type="text" class="glass-input" placeholder="BUCA Corporate" disabled>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-primary w-100" disabled>Actualizar Datos Fiscales</button>
                        </div>

                        <!-- Super Admin (Core) -->
                        <div class="tab-pane fade" id="settings-super" role="tabpanel">
                            <div class="alert alert-danger py-2 small mb-3 border-0 bg-danger bg-opacity-10 text-danger">
                                <i class="bi bi-shield-lock-fill me-2"></i>Zona de Peligro: Core Settings
                            </div>
                            <button class="btn btn-sm btn-danger w-100 mb-2">Restablecer BBDD (Emulador)</button>
                            <button class="btn btn-sm btn-outline-danger w-100">Ver Logs del Sistema</button>
                        </div>
                    </div>
                </div>

                <footer class="text-center mt-4">
                    <a href="/workspaces" class="small text-decoration-none d-flex align-items-center justify-content-center gap-2 text-primary">
                        <i class="bi bi-arrow-left"></i> Volver al Workspace
                    </a>
                </footer>
            </div>
        `;
    },

    init() {
        import('firebase/auth').then(({ getAuth }) => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (!user) {
                window.location.href = '/auth/login';
                return;
            }

            // Simulamos la verificación de rol basada en claims (hasta que conectemos Firestore profundo)
            user.getIdTokenResult().then(idTokenResult => {
                const claims = idTokenResult.claims;
                
                // Demo: Para pruebas locales si el user es elexdy.publice@gmail.com, simulamos super_admin
                const isSuperAdmin = user.email === 'elexdy.publice@gmail.com' || claims.super_admin;
                const isAdminOrOwner = isSuperAdmin || claims.admin || claims.owner;

                if (isSuperAdmin) {
                    const tabSuper = document.getElementById('tab-super');
                    if (tabSuper) tabSuper.classList.remove('d-none');
                }

                if (!isAdminOrOwner) {
                    const tabBusiness = document.getElementById('tab-business');
                    if (tabBusiness) tabBusiness.classList.add('d-none');
                }
            });
        });
    }
};

export default SettingsPage;
