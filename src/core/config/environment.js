/**
 * BUCA - Environment Wrapper (Supabase Native)
 * =========================================================================
 * Variables de entorno VITE y configuración del backend de Supabase.
 * Cero dependencias ni credenciales residuales de Firebase.
 * =========================================================================
 */

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const DEFAULT_SUPABASE_URL = 'https://rdvezglzxjjcfbodpfzo.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdmV6Z2x6eGpqY2Zib2RwZnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNjQxMTYsImV4cCI6MjEwOTg0MDExNn0.t9AS029XtzB5qQTBEi5hRhqvUs02gUcftzCdWes3RsA';

export const ENV = {
    MODE: viteEnv.MODE || 'development',
    IS_DEV: viteEnv.DEV || (viteEnv.MODE === 'development'),
    IS_PROD: viteEnv.PROD || (viteEnv.MODE === 'production'),

    SUPABASE: {
        URL: viteEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
        ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
    },

    DOLAR_VZLA: {
        KEY: viteEnv.VITE_DOLAR_VZLA_KEY || '1943db913d1267586395dcc855969e4ebcf32ded3b3a3ed150a01a1a7ab02236',
        CDN: viteEnv.VITE_DOLAR_VZLA_CDN || 'https://rates.dolarvzla.com',
        API: viteEnv.VITE_DOLAR_VZLA_API || 'https://api.dolarvzla.com'
    }
};

export default ENV;
