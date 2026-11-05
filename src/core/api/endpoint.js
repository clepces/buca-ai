/**
 * Endpoints - Mapa de rutas de API
 * =========================================================================
 * Centraliza todas las URLs externas y rutas de servicios.
 */
export const ENDPOINTS = {
    EXTERNAL: {
        BCV: 'https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv',
        NETWORK_TEST: 'https://api.ipify.org?format=json'
    },
    SERVICES: {
        AUTH: '/api/auth',
        NEWS: '/api/news',
        NOTIFICATIONS: {
            EMAILJS: 'https://api.emailjs.com/api/v1.0'
        }
    }
};

export default ENDPOINTS;
