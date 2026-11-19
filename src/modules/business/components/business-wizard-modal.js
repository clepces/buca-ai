/**
 * BusinessWizardModal - Orquestador modular del modal de creación de empresa
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo de negocios.
 */
import ModalService from '@/shared/ui/services/ModalService.js';
import { createBusinessWizardTemplate } from '@/shared/ui/templates/modals/_business_wizard.js';
import BusinessWizardController from '../BusinessWizardController.js';

export const BusinessWizardModal = {
    show() {
        ModalService.showModal({
            size: 'lg',
            header: ModalService.buildHeader({
                icon: 'bi-building-add',
                title: 'Asistente de Registro Comercial',
                subtitle: 'NUEVA EMPRESA / COMERCIO EN BUCA AI'
            }),
            body: createBusinessWizardTemplate(),
            footer: {
                right: `
                    <button type="button" class="btn btn-ghost rounded-pill px-4" data-action="ui:close_modal">Cancelar</button>
                    <button type="button" class="btn btn-primary rounded-pill px-4" id="btn-submit-business-wizard">Registrar Comercio</button>
                `
            },
            onOpen: () => {
                if (BusinessWizardController && typeof BusinessWizardController.init === 'function') {
                    BusinessWizardController.init();
                }
            }
        });
    }
};

export default BusinessWizardModal;
