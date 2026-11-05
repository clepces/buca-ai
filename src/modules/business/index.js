/**
 * Módulo de Negocios & Unidades Comerciales BUSA-I
 * =========================================================================
 * Responsable de la gestión de empresas, sucursales, registro fiscal (RIF) y Business Hub.
 */
import { eventBus } from '@/core/eventBus/index.js';
import BusinessWizardController from './BusinessWizardController.js';
import { BusinessHub } from './components/BusinessHub.js';
import { BusinessRepository } from './services/BusinessRepository.js';

export const BusinessModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('[BusinessModule] -> Inicializado módulo de negocios');

        // Escuchar eventos para solicitar apertura del Wizard
        eventBus.on('business:open_wizard', () => BusinessWizardController.init());
        eventBus.on('ui:open_create_business', () => {
            import('@/shared/ui/overlays/ModalService.js').then(m => m.default.showCreateBusinessModal());
        });
    },

    BusinessHub,
    BusinessWizardController,
    BusinessRepository
};

export default BusinessModule;
