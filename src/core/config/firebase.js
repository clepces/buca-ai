/**
 * Firebase Legacy Shim - BUCA Architecture v1.1.0-alpha
 * =========================================================================
 * Módulo sustituido por Supabase Backend & Auth nativo.
 * Conservado exclusivamente como interfaz segura para llamadas residuales.
 * =========================================================================
 */
import { getSupabase } from './supabase.js';

export const app = null;
export const auth = null;
export const db = null;
export const functions = null;

export const initFirebase = () => {
    // Redirige al inicializador de Supabase
    return {
        app: null,
        auth: null,
        db: null,
        supabase: getSupabase()
    };
};

export default initFirebase;
