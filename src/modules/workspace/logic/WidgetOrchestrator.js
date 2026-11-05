/**
 * WidgetOrchestrator - Orquestador de Interfaz Neural
 * =========================================================================
 * Determina qué widgets inyectar en el Workspace basándose en el
 * perfil de rendimiento (L0-L3) y el rol del usuario.
 * =========================================================================
 */
export const WidgetOrchestrator = {
    /**
     * Define la configuración de widgets por perfil de hardware.
     */
    getLayoutConfig(perfTier = 'balanced') {
        const layouts = {
            'eco': ['stats-strip', 'business-list'], // L0: Solo lo esencial manteniendo tasas y telemetría crítica
            'balanced': ['stats-strip', 'business-carousel'], // L1
            'pro': ['stats-strip', 'business-carousel', 'ai-insights'], // L2
            'ultra': ['all'] // L3: Todo activo
        };

        return layouts[perfTier] || layouts['balanced'];
    },

    /**
     * Filtra la lista de negocios para la vista rápida.
     * @param {Array} businesses 
     * @returns {Array} Negocios activos o con alertas.
     */
    filterPriorityBusiness(businesses) {
        return businesses.sort((a, b) => b.performance - a.performance).slice(0, 5);
    }
};

export default WidgetOrchestrator;
