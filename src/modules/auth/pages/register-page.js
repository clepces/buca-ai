/**
 * RegisterPage - Orquestador de Registro de Usuarios
 */
import { router } from '@/core/router/router.js';
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import RegisterForm from '../components/register-form.js';

export const RegisterPage = {
    _redirectTimer: null,

    render() {
        return renderAuthCardShell({
            title: 'Crear Cuenta',
            bodyHtml: RegisterForm.render(),
            footerHtml: '¿Ya tienes una cuenta? <a href="/auth/login" class="fw-semibold text-decoration-none">Ingresa aquí</a>'
        });
    },

    init() {
        this.destroy();
        RegisterForm.init(() => {
            this._redirectTimer = setTimeout(() => {
                this._redirectTimer = null;
                router.navigate('/workspace');
            }, 1200);
        });
    },

    destroy() {
        RegisterForm.destroy();
        if (this._redirectTimer) {
            clearTimeout(this._redirectTimer);
            this._redirectTimer = null;
        }
    }
};

export default RegisterPage;
