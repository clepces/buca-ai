import { BaseState } from './BaseState.js';

/**
 * GlobalState - Configuración y datos globales de la aplicación
 * =========================================================================
 * Gestiona la empresa activa, tasas de cambio (BCV/Paralelo) y config global.
 */
class GlobalState extends BaseState {
    constructor() {
        super({
            activeBusinessId: null,
            businessName: 'BUCA Enterprise',
            rates: {
                bcv: 0,
                parallel: 0,
                lastUpdate: null
            },
            config: {
                version: '5.0.0',
                environment: 'production'
            }
        });
    }

    /**
     * Actualiza las tasas de cambio
     * @param {Object} rates 
     */
    updateRates(rates) {
        this.set({
            rates: { ...this._state.rates, ...rates, lastUpdate: new Date().toISOString() }
        });
    }
}

export const globalState = new GlobalState();
export default globalState;
