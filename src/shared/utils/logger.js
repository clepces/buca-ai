const isDev = (typeof import.meta !== 'undefined' && import.meta.env)
    ? Boolean(import.meta.env.DEV)
    : (typeof globalThis.process !== 'undefined' && globalThis.process.env?.NODE_ENV !== 'production');

export const Logger = {
    log: (message, ...args) => {
        if (isDev) {
            console.log(`[LOG]: ${message}`, ...args);
        }
    },
    error: (message, ...args) => {
        console.error(`[ERROR]: ${message}`, ...args);
    },
    warn: (message, ...args) => {
        if (isDev) {
            console.warn(`[WARN]: ${message}`, ...args);
        }
    }
};
