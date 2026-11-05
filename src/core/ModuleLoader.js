/**
 * ModuleLoader - Gestor de Carga Bajo Demanda y Resiliencia
 * =========================================================================
 * Carga módulos dinámicamente con reintentos y respaldo estático garantizado
 * para prevenir fallos de red en el navegador ("Failed to fetch dynamically imported module").
 * =========================================================================
 */
const STATIC_REGISTRY = {};

const DYNAMIC_REGISTRY = {
    'workspace': () => import('@/modules/workspace/index.js'),
    'auth': () => import('@/modules/auth/index.js'),
    'finance': () => import('@/modules/finance/index.js'),
    'business': () => import('@/modules/business/index.js'),
    'profile': () => import('@/modules/profile/index.js')
};

export class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }

    /**
     * Carga e inicializa un módulo dinámicamente con respaldo estático.
     * @param {string} moduleName - Nombre del módulo.
     * @param {number} [maxRetries=1] - Reintentos antes del fallback estático.
     * @returns {Promise<any>} Instancia del módulo.
     */
    async load(moduleName, maxRetries = 1) {
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const loadTask = (async () => {
            let instance = null;

            // Intentar carga dinámica
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    let moduleExport;
                    if (DYNAMIC_REGISTRY[moduleName]) {
                        moduleExport = await DYNAMIC_REGISTRY[moduleName]();
                    } else {
                        moduleExport = await import(`../modules/${moduleName}/index.js`);
                    }
                    instance = moduleExport.default || moduleExport;
                    if (instance) break;
                } catch (error) {
                    if (attempt < maxRetries) {
                        console.warn(`[ModuleLoader] Reintentando carga dinámica de "${moduleName}"...`);
                        await new Promise(res => setTimeout(res, 300));
                    } else {
                        console.warn(`[ModuleLoader] Carga dinámica fallida para "${moduleName}", aplicando respaldo estático:`, error);
                    }
                }
            }

            // Fallback estático si la descarga dinámica falló
            if (!instance && STATIC_REGISTRY[moduleName]) {
                instance = STATIC_REGISTRY[moduleName];
            }

            if (instance) {
                try {
                    if (typeof instance.init === 'function') {
                        await instance.init();
                    }
                } catch (initErr) {
                    console.error(`[ModuleLoader] Error en init() del módulo ${moduleName}:`, initErr);
                }
                this.loadedModules.set(moduleName, instance);
            }

            return instance;
        })();

        this.loadingPromises.set(moduleName, loadTask);
        try {
            return await loadTask;
        } finally {
            this.loadingPromises.delete(moduleName);
        }
    }

    /**
     * Verifica si un módulo ya está en memoria.
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * Precarga perezosa (prefetch) de módulos críticos en periodos de inactividad de la CPU.
     * @param {string} moduleName
     */
    prefetch(moduleName) {
        if (this.loadedModules.has(moduleName) || this.loadingPromises.has(moduleName)) return;

        const doPrefetch = () => {
            if (DYNAMIC_REGISTRY[moduleName]) {
                DYNAMIC_REGISTRY[moduleName]().catch(() => {});
            }
        };

        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
            window.requestIdleCallback(doPrefetch, { timeout: 2000 });
        } else {
            setTimeout(doPrefetch, 500);
        }
    }
}

export default new ModuleLoader();
