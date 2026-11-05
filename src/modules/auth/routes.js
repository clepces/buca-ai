/**
 * Auth Routes - Definición de Rutas del Módulo
 */
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import RecoveryPage from './pages/RecoveryPage.js';
import ProfilePage from './pages/ProfilePage.js';
import SettingsPage from './pages/SettingsPage.js';

export const authRoutes = [
    {
        path: '/auth/login',
        component: LoginPage,
        title: 'Iniciar Sesión'
    },
    {
        path: '/auth/register',
        component: RegisterPage,
        title: 'Crear Cuenta'
    },
    {
        path: '/auth/recovery',
        component: RecoveryPage,
        title: 'Recuperar Acceso'
    },
    {
        path: '/auth/profile',
        component: ProfilePage,
        title: 'Perfil de Usuario',
        requiresAuth: true
    },
    {
        path: '/auth/settings',
        component: SettingsPage,
        title: 'Configuración',
        requiresAuth: true
    }
];

export default authRoutes;
