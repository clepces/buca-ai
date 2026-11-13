/**
 * BUCA - Environment Wrapper (Supabase Native)
 * =========================================================================
 * Variables de entorno VITE y configuración del backend de Supabase.
 * Cero dependencias ni credenciales residuales de Firebase.
 * =========================================================================
 */

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const ENV = {
    MODE: viteEnv.MODE || 'development',
    IS_DEV: viteEnv.DEV || (viteEnv.MODE === 'development'),
    IS_PROD: viteEnv.PROD || (viteEnv.MODE === 'production'),

    SUPABASE: {
        URL: viteEnv.VITE_SUPABASE_URL || 'https://rdvezglzxjjcfbodpfzo.supabase.co',
        ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdmV6Z2x6eGpqY2Zib2RwZnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNjQxMTYsImV4cCI6MjEwOTg0MDExNn0.t9AS029XtzB5qQTBEi5hRhqvUs02gUcftzCdWes3RsA'
    },

    DOLAR_VZLA: {
        KEY: viteEnv.VITE_DOLAR_VZLA_KEY || '',
        CDN: viteEnv.VITE_DOLAR_VZLA_CDN || 'https://rates.dolarvzla.com',
        API: viteEnv.VITE_DOLAR_VZLA_API || 'https://api.dolarvzla.com'
    }
};

export default ENV;
