/**
 * RecoveryPage - Recuperación de Acceso
 */
import { $id, $on, $mount, $className, $addClass, $hide, $show } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export const RecoveryPage = {
    render() {
        return `
            <div class="auth-view-content">
                <main class="auth-body">
                    <h2 class="auth-title h5 fw-semibold mb-4 text-center">Recuperar Acceso</h2>
                    <p class="auth-subtitle text-muted small text-center mb-4">
                        Ingresa tu correo corporativo y te enviaremos instrucciones seguras para restablecer tu contraseña.
                    </p>
                    
                    <div id="recovery-feedback" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small mb-4"></div>

                    <form class="glass-form" id="recovery-form">
                        <div class="form-group mb-4">
                            <label class="form-label small fw-bold text-uppercase opacity-75">Correo Corporativo</label>
                            <div class="input-wrapper">
                                <i class="bi bi-envelope"></i>
                                <input type="email" id="recovery-email" class="glass-input" placeholder="admin@empresa.com" required>
                            </div>
                        </div>

                        <button type="submit" id="btn-recovery-submit" class="btn btn-primary w-100 py-2 d-flex justify-content-center align-items-center gap-2">
                            <span>ENVIAR ENLACE</span>
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </form>
                </main>

                <footer class="text-center mt-4 border-top pt-3">
                    <p class="small text-muted mb-0">
                        <a href="/auth/login" class="fw-semibold text-decoration-none d-flex align-items-center justify-content-center gap-2">
                            <i class="bi bi-arrow-left"></i> Volver al Login
                        </a>
                    </p>
                </footer>
            </div>
        `;
    },
    init() {
        import('../services/AuthService.js').then(({ AuthService }) => {
            const form = $id('recovery-form');
            if (!form) return;

            $on(form, 'submit', async (e) => {
                e.preventDefault();
                const btn = $id('btn-recovery-submit');
                const email = $id('recovery-email')?.value;
                const feedback = $id('recovery-feedback');

                btn.disabled = true;
                setButtonLoading(btn, true, 'ENVIANDO...');
                $hide(feedback);

                Logger.info('Auth', 'Solicitud de recuperación enviada');

                try {
                    const result = await AuthService.recoverPassword(email);
                    if (!result.success) {
                        throw new Error(result.error === 'auth/user-not-found'
                            ? 'No se encontró una cuenta con este correo.'
                            : 'Ocurrió un error. Por favor intente más tarde.');
                    }

                    setButtonContent(btn, 'ENLACE ENVIADO', 'bi bi-check-circle');
                    $addClass(btn, 'btn-success');

                    $mount(feedback, '<span>Se ha enviado un enlace de recuperación a su correo corporativo.</span>');
                    $className(feedback, 'alert alert-success animate__animated animate__fadeIn py-2 small mt-3');
                    $show(feedback);
                } catch (error) {
                    $mount(feedback, `<span>${error.message}</span>`);
                    $className(feedback, 'alert alert-danger animate__animated animate__headShake py-2 small mb-4');
                    $show(feedback);

                    btn.disabled = false;
                    setButtonContent(btn, 'ENVIAR ENLACE', 'bi bi-send-fill');
                }
            });
        });
    }
};
export default RecoveryPage;
