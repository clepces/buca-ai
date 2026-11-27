/**
 * Auth Routes - Definición de Rutas del Módulo
 */
import LoginPage from './pages/login-page.js';
import RegisterPage from './pages/register-page.js';
import RecoveryPage from './pages/recovery-page.js';
import PasswordResetPage from './pages/password-reset-page.js';
import TwoFactorPage from './pages/two-factor-page.js';
import VerifyEmailPage from './pages/verify-email-page.js';
import CallbackPage from './pages/callback-page.js';
import LogoutPage from './pages/logout-page.js';
import UnauthorizedPage from './pages/unauthorized-page.js';

export const authRoutes = [
    {
        path: '/auth/login',
        component: LoginPage,
        title: 'Iniciar Sesión',
        layout: 'auth',
        guestOnly: true
    },
    {
        path: '/auth/register',
        component: RegisterPage,
        title: 'Crear Cuenta',
        layout: 'auth',
        guestOnly: true
    },
    {
        path: '/auth/recovery',
        component: RecoveryPage,
        title: 'Recuperar Acceso',
        layout: 'auth',
        guestOnly: true
    },
    {
        path: '/auth/recovery/reset-password',
        component: PasswordResetPage,
        title: 'Restablecer Contraseña',
        layout: 'auth'
    },
    {
        path: '/auth/two-factor',
        component: TwoFactorPage,
        title: 'Verificación MFA',
        layout: 'auth'
    },
    {
        path: '/auth/verify-email',
        component: VerifyEmailPage,
        title: 'Verificar Correo',
        layout: 'auth'
    },
    {
        path: '/auth/callback',
        component: CallbackPage,
        title: 'Procesando Acceso',
        layout: 'auth'
    },
    {
        path: '/auth/logout',
        component: LogoutPage,
        title: 'Cerrando Sesión',
        layout: 'auth'
    },
    {
        path: '/auth/unauthorized',
        component: UnauthorizedPage,
        title: 'Acceso Restringido',
        layout: 'auth'
    }
];

export default authRoutes;
