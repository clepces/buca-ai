/**
 * BusinessWizardModal - Orquestador modular del modal de creación de empresa
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo de negocios.
 */
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';
import { renderButton } from '@/shared/ui/primitives/ui-button.js';
import { createBusinessWizardTemplate } from '../templates/business-wizard-template.js';
import BusinessWizardController from '../BusinessWizardController.js';

export const BusinessWizardModal = {
    show() {
        modalServiceV2.showModal({
            id: 'business-wizard-modal',
            scope: 'module',
            size: 'lg',
            closeOnBackdrop: false,
            header: {
                left: {
                    icon: 'bi-building-add',
                    title: 'Asistente de Registro Comercial',
                    subtitle: 'Nueva empresa / comercio en BUCA AI'
                }
            },
            body: {
                html: createBusinessWizardTemplate()
            },
            footer: {
                right: [
                    renderButton({ variant: 'ghost', pill: true, label: 'Cancelar', action: 'ui:close_modal' }),
                    renderButton({ id: 'btn-submit-business-wizard', variant: 'primary', pill: true, iconLeft: 'bi-check2-circle', label: 'Registrar Comercio' })
                ].join('')
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
