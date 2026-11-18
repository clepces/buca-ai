/**
 * @fileoverview Logger Profesional a Todo Terreno (B.U.C.A. Enterprise Logger)
 * @module shared/utils/logger
 * @description Sistema unificado de registro estructurado, etiquetado visual,
 * protección de rutas de disco (UUID Safety) y filtrado por entornos.
 */

const isDev = (typeof import.meta !== 'undefined' && import.meta.env)
    ? Boolean(import.meta.env.DEV)
    : (typeof globalThis.process !== 'undefined' && globalThis.process.env?.NODE_ENV !== 'production');

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const BADGE_STYLES = {
    info: 'background: #2563eb; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    warn: 'background: #d97706; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    error: 'background: #dc2626; color: #ffffff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    critical: 'background: #7f1d1d; color: #fecaca; font-weight: 800; padding: 3px 8px; border-radius: 4px; border: 1px solid #ef4444;',
    debug: 'background: #475569; color: #cbd5e1; font-weight: bold; padding: 2px 6px; border-radius: 4px;'
};

const sanitizeError = (err) => {
    if (!err) return '';
    const msg = err.message || String(err);
    // Mitigación de escape: eliminar rutas de disco locales (C:\..., /Users/...)
    return msg.replace(/[a-zA-Z]:\\[^:\n]+/g, '[SECURE_PATH]').replace(/\/(?:Users|home|var|wamp64)[^:\n]+/g, '[SECURE_PATH]');
};

const generateIncidentId = () => {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID().slice(0, 8);
        }
    } catch {
        // Fallback
    }
    return Math.random().toString(36).slice(2, 10);
};

export const Logger = {
    debug(scope, message, ...args) {
        if (!isDev) return;
        if (isBrowser) {
            console.debug(`%cDEBUG%c [${scope}] ${message}`, BADGE_STYLES.debug, '', ...args);
        } else {
            console.debug(`[DEBUG][${scope}] ${message}`, ...args);
        }
    },

    info(scope, message, ...args) {
        if (isBrowser) {
            console.info(`%cINFO%c [${scope}] ${message}`, BADGE_STYLES.info, '', ...args);
        } else {
            console.info(`[INFO][${scope}] ${message}`, ...args);
        }
    },

    warn(scope, message, ...args) {
        if (isBrowser) {
            console.warn(`%cWARN%c [${scope}] ${message}`, BADGE_STYLES.warn, '', ...args);
        } else {
            console.warn(`[WARN][${scope}] ${message}`, ...args);
        }
    },

    error(scope, message, ...args) {
        const sanitized = sanitizeError(args[0] || message);
        if (isBrowser) {
            console.error(`%cERROR%c [${scope}] ${message}`, BADGE_STYLES.error, '', sanitized, ...args.slice(1));
        } else {
            console.error(`[ERROR][${scope}] ${message}`, sanitized, ...args.slice(1));
        }
    },

    critical(scope, message, error) {
        const incidentId = generateIncidentId();
        const safeMsg = sanitizeError(error || message);

        if (isBrowser) {
            console.error(
                `%cCRITICAL BOOT [${incidentId}]%c [${scope}] ${message}`,
                BADGE_STYLES.critical,
                'color: #ef4444; font-weight: bold;',
                safeMsg
            );
        } else {
            console.error(`[CRITICAL][${incidentId}][${scope}] ${message}`, safeMsg);
        }

        return incidentId;
    },

    // Compatibilidad retroactiva
    log(message, ...args) {
        if (isDev) {
            console.log(`[BUCA] ${message}`, ...args);
        }
    }
};

export default Logger;
