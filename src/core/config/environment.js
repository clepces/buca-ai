/**
 * BUCA - Environment Wrapper (Supabase Native)
 * =========================================================================
 * Variables de entorno VITE y configuración del backend de Supabase.
 * Cero dependencias ni credenciales residuales de Firebase.
 * =========================================================================
 */

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// Validación Fail-Fast de Entorno (.env)
if (!viteEnv.VITE_SUPABASE_URL || !viteEnv.VITE_SUPABASE_ANON_KEY) {
    console.warn('[Environment] ADVERTENCIA: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas en .env.');
}

export const ENV = {
    MODE: viteEnv.MODE || 'development',
    IS_DEV: viteEnv.DEV || (viteEnv.MODE === 'development'),
    IS_PROD: viteEnv.PROD || (viteEnv.MODE === 'production'),

    SUPABASE: {
        URL: viteEnv.VITE_SUPABASE_URL || '',
        ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY || ''
    },

    DOLAR_VZLA: {
        KEY: viteEnv.VITE_DOLAR_VZLA_KEY || '',
        CDN: viteEnv.VITE_DOLAR_VZLA_CDN || '',
        API: viteEnv.VITE_DOLAR_VZLA_API || ''
    }
};

export default ENV;
