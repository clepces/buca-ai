/**
 * RecoveryPage - Recuperación de Acceso
 */
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
            const form = document.getElementById('recovery-form');
            if (form) {
                form.onsubmit = async (e) => {
                    e.preventDefault();
                    const btn = document.getElementById('btn-recovery-submit');
                    const email = document.getElementById('recovery-email').value;
                    const feedback = document.getElementById('recovery-feedback');
                    
                    btn.disabled = true;
                    btn.innerHTML = '<div class="buca-spinner sm" data-buca-perf="ignore"></div> <span class="ms-2">ENVIANDO...</span>';
                    feedback.classList.add('d-none');

                    console.log('[Auth] -> Solicitud de recuperación enviada');
                    
                    try {
                        const result = await AuthService.recoverPassword(email);
                        if (!result.success) throw new Error(result.error === 'auth/user-not-found' ? 'No se encontró una cuenta con este correo.' : 'Ocurrió un error. Por favor intente más tarde.');
                        
                        btn.innerHTML = '<i class="bi bi-check-circle"></i> <span class="ms-2">ENLACE ENVIADO</span>';
                        btn.style.background = 'linear-gradient(to bottom, #10b981, #059669)';
                        
                        feedback.innerHTML = '<span>Se ha enviado un enlace de recuperación a su correo corporativo.</span>';
                        feedback.className = 'alert alert-success animate__animated animate__fadeIn py-2 small mt-3';
                        feedback.classList.remove('d-none');
                    } catch (error) {
                        feedback.innerHTML = `<span>${error.message}</span>`;
                        feedback.className = 'alert alert-danger animate__animated animate__headShake py-2 small mb-4';
                        feedback.classList.remove('d-none');
                        
                        btn.disabled = false;
                        btn.innerHTML = '<span>ENVIAR ENLACE</span> <i class="bi bi-send-fill ms-2"></i>';
                    }
                };
            }
        });
    }
};
export default RecoveryPage;
