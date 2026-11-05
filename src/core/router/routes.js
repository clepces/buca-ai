/**
 * Routes Configuration - Buca Modular
 * =========================================================================
 * Define el mapa de navegación base de la aplicación.
 * Registra las rutas de los módulos principales (Auth, Workspace, etc.).
 */
import { workspaceRoutes } from '@/modules/workspace/routes.js';
import { authRoutes } from '@/modules/auth/routes.js';

export const routes = [
    ...workspaceRoutes,
    ...authRoutes
];

export default routes;

