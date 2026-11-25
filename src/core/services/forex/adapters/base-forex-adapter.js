/**
 * @fileoverview base-forex-adapter - Contrato base extensible para adaptadores monetarios
 * @module core/services/forex/adapters/base-forex-adapter
 */

export class BaseForexAdapter {
    /**
     * @param {string} name - Nombre identificador del proveedor
     * @param {number} priority - Orden de prioridad en la cascada (menor número = mayor prioridad)
     */
    constructor(name, priority = 10) {
        this.name = name;
        this.priority = priority;
    }

    /**
     * Verifica si el adaptador tiene la configuración requerida para operar.
     * @returns {Promise<boolean>|boolean}
     */
    isAvailable() {
        return true;
    }

    /**
     * Consulta las tasas oficiales BCV (USD y EUR).
     * @returns {Promise<Object>}
     */
    async fetchBCV() {
        throw new Error(`[${this.name}] Método fetchBCV() no implementado.`);
    }

    /**
     * Consulta la tasa de referencia paralela o cripto (USDT/VES).
     * @returns {Promise<Object>}
     */
    async fetchParallel() {
        throw new Error(`[${this.name}] Método fetchParallel() no implementado.`);
    }

    /**
     * Consulta las intervenciones cambiarias del BCV (opcional).
     * @returns {Promise<{ current: Object|null, list: Array }>}
     */
    async fetchInterventions() {
        return { current: null, list: [] };
    }

    /**
     * Consulta el histórico de tasas BCV por año (opcional).
     * @param {number} year
     * @returns {Promise<Array>}
     */
    async fetchHistory(_year) {
        return [];
    }
}

export default BaseForexAdapter;
