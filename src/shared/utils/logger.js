export const Logger = {
    log: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[LOG]: ${message}`, ...args);
        }
    },
    error: (message, ...args) => {
        console.error(`[ERROR]: ${message}`, ...args);
    },
    warn: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN]: ${message}`, ...args);
        }
    }
};
