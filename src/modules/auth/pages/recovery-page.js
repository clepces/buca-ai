/**
 * RecoveryPage - Orquestador de Recuperación de Acceso
 */
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import RecoveryForm from '../components/recovery-form.js';

export const RecoveryPage = {
    render() {
        return renderAuthCardShell({
            title: 'Recuperar Acceso',
            subtitle: 'Ingresa tu correo corporativo y te enviaremos instrucciones seguras para restablecer tu contraseña.',
            bodyHtml: RecoveryForm.render(),
            footerHtml: '<a href="/auth/login" class="fw-semibold text-decoration-none d-flex align-items-center justify-content-center gap-2"><i class="bi bi-arrow-left"></i> Volver al Login</a>'
        });
    },

    init() {
        RecoveryForm.init();
    },

    destroy() {
        RecoveryForm.destroy();
    }
};

export default RecoveryPage;
