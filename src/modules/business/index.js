/**
 * Módulo de Negocios & Unidades Comerciales BUSA-I
 * =========================================================================
 * Responsable de la gestión de empresas, sucursales, registro fiscal (RIF) y Business Hub.
 */
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';
import { router } from '@/core/router/router.js';
import { ModalService } from '@/shared/ui/services/ModalService.js';
import { Logger } from '@/shared/utils/logger.js';
import BusinessWizardController from './BusinessWizardController.js';
import { BusinessHub } from './components/BusinessHub.js';
import { BusinessRepository } from './services/BusinessRepository.js';

export const BusinessModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Business', message: 'Módulo de negocios inicializado.' });

        // Escuchar eventos para solicitar apertura del Wizard y entrada a unidad comercial
        eventBus.on('business:open_wizard', () => BusinessWizardController.init());
        eventBus.on('business:open_create', () => {
            import('./components/business-wizard-modal.js').then(m => m.default.show());
        });
        eventBus.on('business:enter', (payload = {}) => {
            const bizId = payload?.id || payload?.businessId;
            if (bizId && bizId !== 'Dashboard') {
                sessionState.set({ tenantId: bizId });
                Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Business', message: `Unidad comercial activa establecida en sesión: ${bizId}` });
                eventBus.emit('business:selected', { id: bizId });
                eventBus.emit('notifications:push', {
                    title: 'Unidad Seleccionada',
                    message: 'Comercio activo establecido en la sesión.',
                    type: 'info'
                });
            }
            ModalService.closeModal();
            router.navigate('/workspace');
        });
    },

    BusinessHub,
    BusinessWizardController,
    BusinessRepository
};

export default BusinessModule;
