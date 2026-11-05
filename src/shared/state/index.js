/**
 * Central State Store — Buca Reactive Architecture
 * =========================================================================
 * Punto de acceso centralizado a los almacenes de estado reactivos
 * compartidos entre módulos, conforme a la arquitectura oficial de BUCA.
 * =========================================================================
 */

export { BaseState } from '@/core/state/BaseState.js';
export { globalState } from '@/core/state/global.js';
export { sessionState } from '@/core/state/session.js';
export { uiState } from '@/core/state/ui.js';
export { default as store } from '@/core/state/store.js';
