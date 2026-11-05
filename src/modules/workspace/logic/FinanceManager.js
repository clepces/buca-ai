/**
 * FinanceManager - El Corazón Financiero de BUCA (BNE v5.2)
 * =========================================================================
 * @module modules/workspace/logic/FinanceManager
 * @description Gestiona conversiones de moneda, tasas de cambio BCV/Paralelo,
 * cálculos de impuestos (IVA/IGTF) y lógica de redondeo neural.
 * =========================================================================
 */
import currency from 'currency.js';

export class FinanceManager {
    static #instance = null;

    constructor() {
        if (FinanceManager.#instance) return FinanceManager.#instance;
        
        this.rates = {
            bcv: 36.50, // Fallback inicial
            parallel: 40.00,
            lastUpdate: null
        };

        FinanceManager.#instance = this;
    }

    /**
     * Calcula el desglose financiero completo de un monto.
     * @param {number} amountUSD - Monto base en USD.
     * @param {Object} options - Configuración de cálculo (iva, igtf, rate).
     * @returns {Object} Desglose detallado.
     */
    calculate(amountUSD, options = {}) {
        const {
            includeIVA = true,
            isForeignCurrency = false,
            customRate = null
        } = options;

        const rate = customRate || this.rates.bcv;
        const taxRate = 0.16; // 16% IVA
        const igtfRate = 0.03; // 3% IGTF

        const base = currency(amountUSD);
        let iva = currency(0);
        let igtf = currency(0);

        if (includeIVA) {
            iva = base.multiply(taxRate);
        }

        const subtotal = base.add(iva);

        if (isForeignCurrency) {
            igtf = subtotal.multiply(igtfRate);
        }

        const totalUSD = subtotal.add(igtf);
        const totalVES = totalUSD.multiply(rate);

        return {
            baseUSD: base.value,
            ivaUSD: iva.value,
            igtfUSD: igtf.value,
            totalUSD: totalUSD.value,
            totalVES: totalVES.value,
            rateApplied: rate,
            formattedUSD: totalUSD.format({ symbol: '$ ', separator: '.', decimal: ',' }),
            formattedVES: totalVES.format({ symbol: 'Bs. ', separator: '.', decimal: ',' })
        };
    }

    /**
     * Sincroniza las tasas de cambio con el estado global.
     * @param {Object} newRates 
     */
    updateRates(newRates) {
        this.rates = { ...this.rates, ...newRates, lastUpdate: Date.now() };
        console.log('[FinanceManager] -> Tasas actualizadas:', this.rates);
    }
}

export const finance = new FinanceManager();
export default finance;
