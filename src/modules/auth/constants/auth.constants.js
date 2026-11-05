/**
 * Auth Constants - Módulo de Autenticación
 * =========================================================================
 * Define los estados y eventos internos del ciclo de vida de identidad.
 * =========================================================================
 */
export const AUTH_PHASES = {
    IDENTITY: 'IDENTITY',         // Fase 1: Credenciales
    DEVICE_AUTH: 'DEVICE_AUTH',   // Fase 2: Huella de Hardware
    SESSION_CONFIG: 'SESSION_CONFIG' // Fase 3: Perfil y Sesión
};

export const AUTH_EVENTS = {
    LOGIN_START: 'auth:login_start',
    LOGIN_SUCCESS: 'auth:login_success',
    DEVICE_CHALLENGE: 'auth:device_challenge',
    SESSION_READY: 'auth:session_ready',
    LOGOUT: 'auth:logout'
};

export const AUTH_STORAGE_KEYS = {
    TOKEN: 'buca_session_token',
    USER: 'buca_user_profile',
    DEVICE_ID: 'buca_device_fingerprint'
};
