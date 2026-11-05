import { eventBus } from '@/core/eventBus/index.js';
import { ModuleLoader } from '@/core/ModuleLoader.js';

/**
 * SearchService - Orquestador de búsqueda global en BUCA OS
 */
export const SearchService = {
    _registry: [],

    init() {
        eventBus.on('ui:global_search', ({ term }) => this.performSearch(term));
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

        console.log(`[SearchService] Buscando: ${term}`);
        
        const results = [];
        for (const provider of this._registry) {
            try {
                const providerResults = await provider.search(term);
                results.push(...providerResults.map(r => ({ ...r, source: provider.name })));
            } catch (err) {
                console.error(`[SearchService] Error en proveedor ${provider.name}:`, err);
            }
        }

        eventBus.emit('ui:search_results_ready', { term, results });
    }
};

export default SearchService;
