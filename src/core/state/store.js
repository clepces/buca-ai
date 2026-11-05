import { uiState } from './ui.js';
import { globalState } from './global.js';
import { sessionState } from './session.js';

/**
 * BUCA Store - Punto de acceso unificado al estado
 * =========================================================================
 * Proporciona acceso a todos los sub-estados de la aplicación.
 */
export const store = {
    ui: uiState,
    global: globalState,
    session: sessionState
};

export default store;
