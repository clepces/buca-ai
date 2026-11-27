/**
 * @fileoverview Logger Profesional a Todo Terreno (B.U.C.A. Enterprise Logger v2)
 * @module shared/utils/logger
 * @description Sistema unificado de registro estructurado con jerarquía visual de 3 badges
 * (Nivel, Capa, Rol), etiqueta dinámica (%s), protección de rutas (UUID Safety) y payloads colapsables.
 */

const isDev = (typeof import.meta !== 'undefined' && import.meta.env)
    ? Boolean(import.meta.env.DEV)
    : (typeof globalThis.process !== 'undefined' && globalThis.process.env?.NODE_ENV !== 'production');

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const BASE_BADGE = 'padding: 1px 6px; border-radius: 4px; font-weight: 700; font-size: 10px; letter-spacing: 0.3px;';

const LEVEL_STYLES = {
    INFO: `${BASE_BADGE} background: #1d4ed8; color: #ffffff;`,
    WARN: `${BASE_BADGE} background: #d97706; color: #ffffff;`,
    ERROR: `${BASE_BADGE} background: #dc2626; color: #ffffff;`,
    DEBUG: `${BASE_BADGE} background: #475569; color: #ffffff;`,
    CRITICAL: `${BASE_BADGE} background: #7f1d1d; color: #fecaca; border: 1px solid #ef4444;`
};

const LAYER_STYLES = {
    ENGINE: `${BASE_BADGE} background: #cffafe; color: #0e7490; border: 1px solid #a5f3fc;`,
    STORAGE: `${BASE_BADGE} background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe;`,
    SERVICE: `${BASE_BADGE} background: #d1fae5; color: #047857; border: 1px solid #a7f3d0;`,
    MODULE: `${BASE_BADGE} background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe;`,
    UI: `${BASE_BADGE} background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;`,
    KERNEL: `${BASE_BADGE} background: #ccfbf1; color: #0f766e; border: 1px solid #99f6e4;`
};

const ROLE_STYLE = 'padding: 1px 5px; border-radius: 3px; font-weight: 600; font-size: 10px; border: 1px solid #cbd5e1; background: #f8fafc; color: #475569;';
const TARGET_STYLE = 'color: #0f172a; font-weight: 700;';
const MSG_STYLE = 'color: #334155; font-weight: 400;';
const VALID_ROLES = new Set(['CLASS', 'FN', 'ADAPTER', 'DRIVER', 'SERVICE', 'MODULE', 'HOOK', 'EVENT']);

const LEGACY_SCOPE_MAP = {
    Kernel: { layer: 'KERNEL', role: 'CLASS', target: 'Kernel' },
    Router: { layer: 'KERNEL', role: 'CLASS', target: 'Router' },
    RouterGuard: { layer: 'KERNEL', role: 'FN', target: 'RouterGuard' },
    PWA: { layer: 'KERNEL', role: 'EVENT', target: 'ServiceWorker' },
    ModuleLoader: { layer: 'KERNEL', role: 'CLASS', target: 'ModuleLoader' },
    BENE: { layer: 'ENGINE', role: 'CLASS', target: 'BENE' },
    BNE: { layer: 'ENGINE', role: 'CLASS', target: 'BENE' },
    ResourceThrottler: { layer: 'ENGINE', role: 'CLASS', target: 'ResourceThrottle' },
    StorageAdapter: { layer: 'STORAGE', role: 'ADAPTER', target: 'StorageAdapter' },
    SupabaseDriver: { layer: 'STORAGE', role: 'DRIVER', target: 'SupabaseDriver' },
    NotificationService: { layer: 'SERVICE', role: 'CLASS', target: 'Notification' },
    ActivityLogService: { layer: 'SERVICE', role: 'CLASS', target: 'ActivityLog' },
    AuthService: { layer: 'SERVICE', role: 'CLASS', target: 'Auth' },
    SupabaseProvider: { layer: 'SERVICE', role: 'ADAPTER', target: 'SupabaseProvider' },
    AuthModule: { layer: 'MODULE', role: 'CLASS', target: 'Auth' },
    WorkspaceModule: { layer: 'MODULE', role: 'CLASS', target: 'Workspace' },
    ModalService: { layer: 'UI', role: 'CLASS', target: 'Modal' },
    ActionDispatcher: { layer: 'UI', role: 'EVENT', target: 'ActionDispatcher' },
    PasswordResetPage: { layer: 'UI', role: 'CLASS', target: 'PasswordResetPage' },
    Auth: { layer: 'UI', role: 'CLASS', target: 'Auth' }
};

const sanitizeText = (value) => {
    if (value == null) return '';
    const msg = value instanceof Error ? value.message : String(value);
    return msg
        .replace(/[a-zA-Z]:\\[^:\n]+/g, '[SECURE_PATH]')
        .replace(/\/(?:Users|home|var|wamp64)[^:\n]+/g, '[SECURE_PATH]');
};

const sanitizePayload = (payload, seen = new WeakSet(), depth = 0) => {
    if (isDev || payload == null) return payload;
    if (payload instanceof Error) {
        return { name: payload.name, message: sanitizeText(payload.message) };
    }
    if (typeof payload === 'string') {
        return sanitizeText(payload);
    }
    if (typeof payload === 'object') {
        if (seen.has(payload) || depth > 4) return '[Circular/Truncated]';
        seen.add(payload);
        if (Array.isArray(payload)) {
            return payload.map((item) => sanitizePayload(item, seen, depth + 1));
        }
        const clean = {};
        for (const [k, v] of Object.entries(payload)) {
            clean[k] = sanitizePayload(v, seen, depth + 1);
        }
        return clean;
    }
    return payload;
};

const generateIncidentId = () => {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID().slice(0, 8);
        }
    } catch { /* fallback */ }
    return Math.random().toString(36).slice(2, 10);
};

const normalizeEntry = (level, scopeOrConfig, message, args) => {
    if (scopeOrConfig && typeof scopeOrConfig === 'object' && !Array.isArray(scopeOrConfig)) {
        const layer = LAYER_STYLES[scopeOrConfig.layer] ? scopeOrConfig.layer : 'KERNEL';
        const role = VALID_ROLES.has(scopeOrConfig.role) ? scopeOrConfig.role : 'SERVICE';
        const target = String(scopeOrConfig.target || 'System');
        const icon = scopeOrConfig.icon ? `${scopeOrConfig.icon} ` : '';
        const rawMsg = sanitizeText(scopeOrConfig.message ?? '');
        const payload = scopeOrConfig.data !== undefined ? scopeOrConfig.data : (args.length > 0 ? args : undefined);
        return { level, layer, role, target, text: `${icon}${rawMsg}`.trim(), payload, inlineArgs: [] };
    }

    const rawTarget = String(scopeOrConfig || 'App');
    const inferred = LEGACY_SCOPE_MAP[rawTarget] || { layer: 'SERVICE', role: 'CLASS', target: rawTarget };
    const target = inferred.target || rawTarget;
    const safeMsg = sanitizeText(message);
    const hasObjectPayload = args.some((a) => a !== null && typeof a === 'object');
    const inlineArgs = hasObjectPayload ? [] : args.map((a) => (typeof a === 'string' ? sanitizeText(a) : a));
    const payload = hasObjectPayload ? (args.length === 1 ? args[0] : args) : undefined;
    return { level, layer: inferred.layer, role: inferred.role, target, text: safeMsg, payload, inlineArgs };
};

const emitLog = (method, entry) => {
    const { level, layer, role, target, text, payload, inlineArgs } = entry;

    if (!isBrowser) {
        const extra = inlineArgs.length > 0 ? inlineArgs : (payload !== undefined ? [payload] : []);
        console[method](`[${level}][${layer}][${role}] ${target} › ${text}`, ...extra);
        return;
    }

    const fmt = `%c${level}%c %c${layer}%c %c${role}%c %c%s%c › %c%s`;
    const styles = [
        LEVEL_STYLES[level] || LEVEL_STYLES.INFO, '',
        LAYER_STYLES[layer] || LAYER_STYLES.KERNEL, '',
        ROLE_STYLE, '',
        TARGET_STYLE, target, '',
        MSG_STYLE, text
    ];

    if (payload !== undefined && typeof console.groupCollapsed === 'function') {
        console.groupCollapsed(fmt, ...styles);
        try {
            console[method](sanitizePayload(payload));
        } finally {
            console.groupEnd();
        }
        return;
    }

    if (payload !== undefined) {
        console[method](fmt, ...styles, sanitizePayload(payload));
        return;
    }

    console[method](fmt, ...styles, ...inlineArgs);
};

export const Logger = {
    debug(scopeOrConfig, message, ...args) {
        if (!isDev) return;
        emitLog('debug', normalizeEntry('DEBUG', scopeOrConfig, message, args));
    },

    info(scopeOrConfig, message, ...args) {
        emitLog('info', normalizeEntry('INFO', scopeOrConfig, message, args));
    },

    warn(scopeOrConfig, message, ...args) {
        emitLog('warn', normalizeEntry('WARN', scopeOrConfig, message, args));
    },

    error(scopeOrConfig, message, ...args) {
        const entry = normalizeEntry('ERROR', scopeOrConfig, message, args);
        if (entry.inlineArgs.length > 0 && entry.inlineArgs.every((a) => typeof a === 'string')) {
            entry.text = `${entry.text} ${entry.inlineArgs.join(' ')}`.trim();
            entry.inlineArgs = [];
        }
        emitLog('error', entry);
    },

    critical(scopeOrConfig, message, error) {
        const incidentId = generateIncidentId();
        const isConfig = scopeOrConfig && typeof scopeOrConfig === 'object' && !Array.isArray(scopeOrConfig);
        const base = isConfig
            ? { ...scopeOrConfig, target: `${scopeOrConfig.target || 'System'} [${incidentId}]`, data: scopeOrConfig.data ?? error }
            : { layer: 'KERNEL', role: 'CLASS', target: `${scopeOrConfig} [${incidentId}]`, icon: '🚨', message, data: error };
        emitLog('error', normalizeEntry('CRITICAL', base, undefined, []));
        return incidentId;
    }
};

export default Logger;
