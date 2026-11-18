/**
 * RegisterPage - Contenedor de Registro de Usuarios
 */
import { router } from '@/core/router/router.js';
import { $id, $on, $mount, $className, $hide, $show, $val } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';

export const RegisterPage = {
    render() {
        return `
            <div class="auth-view-content">
                <main class="auth-body">
                    <h2 class="auth-title h5 fw-semibold mb-4 text-center">Crear Cuenta</h2>
                    
                    <div id="register-feedback" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                    <form class="glass-form" id="register-form">
                        <div class="form-group mb-3">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Nombre Completo</label>
                            <div class="input-wrapper">
                                <i class="bi bi-person"></i>
                                <input type="text" id="reg-name" class="glass-input" placeholder="Ej. Juan Pérez" required>
                            </div>
                        </div>

                        <div class="form-group mb-3">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Correo Corporativo</label>
                            <div class="input-wrapper">
                                <i class="bi bi-envelope"></i>
                                <input type="email" id="reg-email" class="glass-input" placeholder="admin@empresa.com" required>
                            </div>
                        </div>

                        <div class="form-group mb-4">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Contraseña</label>
                            <div class="input-wrapper">
                                <i class="bi bi-lock"></i>
                                <input type="password" id="reg-password" class="glass-input" placeholder="••••••••" required>
                                <button class="btn-toggle-password" type="button" id="reg-toggle-password">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>

                        <button type="submit" id="btn-register-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                            <span>REGISTRAR MI EMPRESA</span>
                            <i class="bi bi-person-plus-fill"></i>
                        </button>
                    </form>
                </main>

                <footer class="text-center mt-4 border-top pt-3">
                    <p class="small text-muted mb-0">
                        ¿Ya tienes una cuenta? <a href="/auth/login" class="fw-semibold text-decoration-none">Ingresa aquí</a>
                    </p>
                </footer>
            </div>
        `;
    },

    init() {
        import('../services/AuthService.js').then(({ AuthService }) => {
            const form = $id('register-form');
            const togglePwd = $id('reg-toggle-password');
            const pwdInput = $id('reg-password');
            const btnSubmit = $id('btn-register-submit');
            const feedback = $id('register-feedback');

            if (togglePwd && pwdInput) {
                $on(togglePwd, 'click', () => {
                    const isPassword = pwdInput.type === 'password';
                    pwdInput.type = isPassword ? 'text' : 'password';
                    setButtonContent(togglePwd, '', `bi bi-eye${isPassword ? '-slash' : ''}`);
                });
            }

            if (form) {
                $on(form, 'submit', async (e) => {
                    e.preventDefault();
                    const name = $val('reg-name');
                    const email = $val('reg-email');
                    const password = pwdInput.value;

                    btnSubmit.disabled = true;
                    setButtonLoading(btnSubmit, true, 'REGISTRANDO...');
                    $hide(feedback);

                    try {
                        const result = await AuthService.register(email, password, name);
                        if (!result.success) {
                            throw new Error(result.error === 'auth/email-already-in-use'
                                ? 'El correo ya está registrado.'
                                : 'Error al crear la cuenta. Intente de nuevo.');
                        }

                        $mount(feedback, '<span>Cuenta creada con éxito. Redirigiendo...</span>');
                        $className(feedback, 'alert alert-success animate__animated animate__fadeIn py-2 small mb-4');
                        $show(feedback);
                        setTimeout(() => router.navigate('/workspace'), 1200);
                    } catch (error) {
                        $mount(feedback, `<span>${error.message}</span>`);
                        $className(feedback, 'alert alert-danger animate__animated animate__headShake py-2 small mb-4');
                        $show(feedback);
                        btnSubmit.disabled = false;
                        setButtonContent(btnSubmit, 'REGISTRAR MI EMPRESA', 'bi bi-person-plus-fill');
                    }
                });
            }
        });
    }
};
export default RegisterPage;
