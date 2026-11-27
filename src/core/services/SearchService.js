import { eventBus } from '@/core/eventBus/index.js';
import { Logger } from '../../shared/utils/logger.js';

/**
 * SearchService - Orquestador de búsqueda global en BUCA AI
 */
export const SearchService = {
    _registry: [],
    _initialized: false,
    _cleanups: [],

    init() {
        if (this._initialized) return;
        this._initialized = true;

        this._cleanups.push(
            eventBus.on('ui:global_search', ({ term }) => this.performSearch(term))
        );
    },

    destroy() {
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this._registry = [];
        this._initialized = false;
    },

    /**
     * Registra un proveedor de búsqueda (ej. el módulo de Finanzas o Workspace)
     * @param {Object} provider { name: string, search: (term) => Promise<Array> }
     */
    registerProvider(provider) {
        if (!this._registry.find(p => p.name === provider.name)) {
            this._registry.push(provider);
        }
    },

    async performSearch(term) {
        if (!term || term.length < 3) return;

        Logger.debug({ layer: 'SERVICE', role: 'SERVICE', target: 'SearchService', message: `Ejecutando búsqueda global: "${term}".` });

        const results = [];
        for (const provider of this._registry) {
            try {
                const providerResults = await provider.search(term);
                results.push(...providerResults.map(r => ({ ...r, source: provider.name })));
            } catch (err) {
                Logger.error({ layer: 'SERVICE', role: 'SERVICE', target: 'SearchService', message: `Error consultando proveedor de búsqueda "${provider.name}".`, data: err?.message || err });
            }
        }

        eventBus.emit('ui:search_results_ready', { term, results });
    }
};

export default SearchService;
