/**
 * @fileoverview RouteConfig - Configuración centralizada de componentes especiales del router
 * @module core/router/RouteConfig
 */

export const RouteConfig = {
    errorPages: {
        '404': () => import('@/shared/pages/Error404.js'),
        '401': () => import('@/shared/pages/Error401.js'),
        '500': () => import('@/shared/pages/Error500.js')
    },
    
    layouts: {
        auth: {
            pathPrefix: '/auth',
            slotId: 'auth-content-slot'
        },
        workspace: {
            pathPrefix: '/',
            slotId: 'workspace-dynamic-content'
        }
    }
};

export default RouteConfig;
