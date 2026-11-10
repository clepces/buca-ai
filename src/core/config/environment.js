/**
 * BUCA - Environment Wrapper
 * Handles VITE env variables and Supabase cloud configuration.
 */

const viteEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

export const ENV = {
    MODE: viteEnv.MODE || 'development',
    IS_DEV: viteEnv.DEV || (viteEnv.MODE === 'development'),
    IS_PROD: viteEnv.PROD || (viteEnv.MODE === 'production'),

    SUPABASE: {
        URL: viteEnv.VITE_SUPABASE_URL || 'https://rdvezglzxjjcfbodpfzo.supabase.co',
        ANON_KEY: viteEnv.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdmV6Z2x6eGpqY2Zib2RwZnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyNjQxMTYsImV4cCI6MjEwOTg0MDExNn0.t9AS029XtzB5qQTBEi5hRhqvUs02gUcftzCdWes3RsA'
    }
};

export default ENV;
