import { CONFIG } from '@/core/config/config.js';

/**
 * LoginForm - Componente de Entrada de Credenciales
 */
export const LoginForm = {
    render() {
        return `
            <form id="login-form" class="glass-form">
                <!-- Área de Feedback Dinámico -->
                <div id="login-feedback" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                <div class="mb-3 form-group">
                    <label for="email" class="form-label small fw-bold text-uppercase opacity-75">Correo Corporativo</label>
                    <div class="input-wrapper">
                        <i class="bi bi-envelope"></i>
                        <input type="email" id="email" name="email" 
                               autocomplete="username email"
                               placeholder="usuario@empresa.com" 
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

                        if (result.mfaRequired) {
                            this.showFeedback('Verificación MFA (TOTP) requerida...', 'success');
                            setTimeout(() => onSubmit({ email, mfaRequired: true, factorId: result.factorId }), 500);
                            return;
                        }
                        
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
                            } else if (result.error) {
                                errorMsg = result.error;
                            }
                            throw new Error(errorMsg);
                        }

                        this.showFeedback('Acceso Aprobado. Iniciando sesión...', 'success');
                        setTimeout(() => onSubmit({ email, mfaRequired: false }), 500);

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
