import { CONFIG } from '@/core/config/config.js';

/**
 * LoginForm - Componente de Entrada de Credenciales
 */
export const LoginForm = {
    render() {
        const isProd = CONFIG?.ENV?.IS_PRODUCTION || CONFIG?.ENV?.MODE === 'production';
        const showDemoAccounts = !isProd && Boolean(CONFIG?.ENV?.SHOW_DEMO_ACCOUNTS);

        return `
            <form id="login-form" class="glass-form">
                <!-- Área de Feedback Dinámico -->
                <div id="login-feedback" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                <!-- Selector de Cuentas del Sistema (Acceso Rápido para Desarrollo) -->
                ${showDemoAccounts ? `
                <div class="mb-3 p-2 rounded-3 demo-accounts-panel" id="demo-accounts-wrapper">
                    <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                        <span class="small fw-bold text-uppercase demo-title-text">
                            <i class="bi bi-shield-lock-fill me-1 text-primary"></i> Roles del Sistema (Pruebas)
                        </span>
                        <span class="badge demo-badge-micro">3 Cuentas</span>
                    </div>
                    <div class="d-flex gap-1 flex-wrap" id="demo-accounts-group">
                        <button type="button" class="btn btn-sm flex-fill demo-acc-btn demo-acc-btn-styled active" data-email="admin@buca.com.ve" data-pwd="admin123">
                            <i class="bi bi-shield-shaded me-1"></i> Super Admin
                        </button>
                        <button type="button" class="btn btn-sm flex-fill demo-acc-btn demo-acc-btn-styled" data-email="asicodia@gmail.com" data-pwd="soporte123">
                            <i class="bi bi-person-gear me-1"></i> Admin
                        </button>
                        <button type="button" class="btn btn-sm flex-fill demo-acc-btn demo-acc-btn-styled" data-email="elexdy.publice@gmail.com" data-pwd="owner123">
                            <i class="bi bi-person-badge me-1"></i> Usuario
                        </button>
                    </div>
                </div>
                ` : ''}

                <div class="mb-3 form-group">
                    <label for="email" class="form-label small fw-bold text-uppercase opacity-75">Correo Corporativo</label>
                    <div class="input-wrapper">
                        <i class="bi bi-envelope"></i>
                        <input type="email" id="email" name="email" 
                               autocomplete="username email"
                               placeholder="${showDemoAccounts ? 'elexdy.publice@gmail.com' : 'usuario@empresa.com'}" 
                               value="${showDemoAccounts ? 'elexdy.publice@gmail.com' : ''}"
                               class="glass-input" required>
                    </div>
                </div>

                <div class="mb-3 form-group">
                    <label for="password" class="form-label small fw-bold text-uppercase opacity-75">Contraseña</label>
                    <div class="input-wrapper">
                        <i class="bi bi-lock"></i>
                        <input type="password" id="password" name="password" 
                               autocomplete="current-password"
                               placeholder="••••••••" 
                               value="${showDemoAccounts ? 'owner123' : ''}"
                               class="glass-input" required>
                        <button class="btn-toggle-password" type="button" id="toggle-password" aria-label="Mostrar u ocultar contraseña">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4 px-2 form-options">
                    <label class="checkbox-container">
                        <input type="checkbox" name="remember" id="remember">
                        <div class="checkmark"></div>
                        Recordarme
                    </label>
                    <a href="/auth/recovery" class="forgot-link">¿Olvidó su contraseña?</a>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" id="btn-login-submit">
                    <span class="btn-text">ACCEDER AL PORTAL</span>
                    <i class="bi bi-arrow-right-short ms-2"></i>
                </button>
            </form>
        `;
    },

    init(onSubmit) {
        // Carga dinámica del AuthService para no inflar el bundle inicial si no se usa
        import('../services/AuthService.js').then(({ AuthService }) => {
            const form = document.getElementById('login-form');
            const togglePwd = document.getElementById('toggle-password');
            const emailInput = document.getElementById('email');
            const pwdInput = document.getElementById('password');
            const btnSubmit = document.getElementById('btn-login-submit');

            // Configurar botones de acceso demo si están presentes en el DOM
            const demoButtons = document.querySelectorAll('.demo-acc-btn');
            if (demoButtons && demoButtons.length > 0) {
                demoButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        demoButtons.forEach(b => b.classList.remove('active', 'btn-primary'));
                        btn.classList.add('active');
                        if (emailInput && btn.dataset.email) emailInput.value = btn.dataset.email;
                        if (pwdInput && btn.dataset.pwd) pwdInput.value = btn.dataset.pwd;
                    });
                });
            }

            // Toggle Password Visibility
            if (togglePwd && pwdInput) {
                togglePwd.onclick = () => {
                    const isPassword = pwdInput.type === 'password';
                    pwdInput.type = isPassword ? 'text' : 'password';
                    togglePwd.innerHTML = `<i class="bi bi-eye${isPassword ? '-slash' : ''}"></i>`;
                };
            }

            // Form Submission
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = pwdInput.value;
                    const remember = document.getElementById('remember').checked;

                    // Estado de carga
                    btnSubmit.disabled = true;
                    btnSubmit.innerHTML = '<span>VERIFICANDO...</span> <i class="bi bi-arrow-repeat spin"></i>';
                    this.hideFeedback();

                    try {
                        const result = await AuthService.login(email, password);
                        
                        if (!result.success) {
                            let errorMsg = 'Credenciales inválidas. Verifique sus datos.';
                            if (result.error === 'auth/user-not-found' || result.error === 'auth/wrong-password' || result.error === 'auth/invalid-credential') {
                                errorMsg = 'Usuario o contraseña incorrectos.';
                            } else if (result.error === 'auth/too-many-requests') {
                                errorMsg = 'Demasiados intentos fallidos. Intente más tarde.';
                            } else if (result.error === 'auth/network-request-failed') {
                                errorMsg = 'Error de conexión con el servidor. Verifique su red.';
                            } else if (result.error === 'auth/user-disabled') {
                                errorMsg = 'Esta cuenta corporativa ha sido inhabilitada.';
                            } else if (result.error === 'auth/invalid-email') {
                                errorMsg = 'El formato del correo corporativo no es válido.';
                            }
                            throw new Error(errorMsg);
                        }

                        this.showFeedback('Acceso Aprobado. Iniciando verificación...', 'success');
                        setTimeout(() => onSubmit({ email, password, remember }), 800);

                    } catch (error) {
                        this.showFeedback(error.message, 'error');
                        btnSubmit.disabled = false;
                        btnSubmit.innerHTML = '<span class="btn-text">ACCEDER AL PORTAL</span> <i class="bi bi-arrow-right-short"></i>';
                    }
                };
            }
        });
    },

    showFeedback(message, type = 'error') {
        const area = document.getElementById('login-feedback');
        if (!area) return;
        area.innerHTML = `<span>${message}</span>`;
        area.className = `alert alert-${type === 'error' ? 'danger' : 'success'} animate__animated animate__headShake py-2 small mb-4`;
        area.classList.remove('d-none');
    },

    hideFeedback() {
        const area = document.getElementById('login-feedback');
        if (area) area.classList.add('d-none');
    }
};

export default LoginForm;
