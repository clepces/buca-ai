/**
 * BUCA - Environment Wrapper (Supabase Native)
 * =========================================================================
 * Envoltura centralizada y segura de variables de entorno Vite.
 * Prohibido quemar o hardcodear credenciales en el código fuente.
 * =========================================================================
 */

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// Validación Fail-Fast en producción si faltan credenciales requeridas
if (!viteEnv.VITE_SUPABASE_URL || !viteEnv.VITE_SUPABASE_ANON_KEY) {
    if (viteEnv.PROD || viteEnv.MODE === 'production') {
        console.error('[Environment] ERROR CRÍTICO: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas en .env.');
    } else {
        console.warn('[Environment] ADVERTENCIA: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas en .env.');
    }
}

export const ENV = {
    MODE: viteEnv.MODE || 'development',
    IS_DEV: viteEnv.DEV || (viteEnv.MODE === 'development'),
    IS_PROD: viteEnv.PROD || (viteEnv.MODE === 'production'),

    SUPABASE: {
        URL: viteEnv.VITE_SUPABASE_URL || '',
        ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY || ''
    },

    EMAILJS: {
        SERVICE_ID: viteEnv.VITE_EMAILJS_SERVICE_ID || '',
        TEMPLATE_ID: viteEnv.VITE_EMAILJS_TEMPLATE_ID || '',
        PUBLIC_KEY: viteEnv.VITE_EMAILJS_PUBLIC_KEY || ''
    },

    FOREX: {
        DOLAR_API: {
            BASE: viteEnv.VITE_DOLAR_API_BASE || 'https://ve.dolarapi.com/v1'
        },
        DOLAR_VZLA: {
            KEY: viteEnv.VITE_DOLAR_VZLA_KEY || '',
            CDN: viteEnv.VITE_DOLAR_VZLA_CDN || 'https://rates.dolarvzla.com',
            API: viteEnv.VITE_DOLAR_VZLA_API || 'https://api.dolarvzla.com'
        },
        MONTOS_VE: {
            KEY: viteEnv.VITE_MONTOS_VE_KEY || '',
            API: viteEnv.VITE_MONTOS_VE_API || 'https://montosve.com/v1'
        }
    }
};

export default ENV;
