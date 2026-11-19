/**
 * Módulo de Negocios & Unidades Comerciales BUSA-I
 * =========================================================================
 * Responsable de la gestión de empresas, sucursales, registro fiscal (RIF) y Business Hub.
 */
import { eventBus } from '@/core/eventBus/index.js';
import { Logger } from '@/shared/utils/logger.js';
import BusinessWizardController from './BusinessWizardController.js';
import { BusinessHub } from './components/BusinessHub.js';
import { BusinessRepository } from './services/BusinessRepository.js';

export const BusinessModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        Logger.info('BusinessModule', 'Inicializado módulo de negocios');

        // Escuchar eventos para solicitar apertura del Wizard
        eventBus.on('business:open_wizard', () => BusinessWizardController.init());
        eventBus.on('ui:open_create_business', () => {
            import('./components/business-wizard-modal.js').then(m => m.default.show());
        });
    },

    BusinessHub,
    BusinessWizardController,
    BusinessRepository
};

export default BusinessModule;
