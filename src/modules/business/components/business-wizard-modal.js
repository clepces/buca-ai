/**
 * BusinessWizardModal - Orquestador modular del modal de creación de empresa
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo de negocios.
 * Wizard steps en header-center, navegación (Anterior/Siguiente) en footer.
 */
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';
import { renderButton } from '@/shared/ui/primitives/ui-button.js';
import { createBusinessWizardTemplate } from '../templates/business-wizard-template.js';
import BusinessWizardController from '../BusinessWizardController.js';

export const BusinessWizardModal = {
    show() {
        const stepsHtml = `
            <div class="wizard-steps-container" id="wizard-header-steps" role="tablist" aria-label="Pasos del asistente">
                <button type="button" class="wizard-step-pill active" data-step="1" role="tab" aria-selected="true" aria-controls="wizard-step-1-pane">
                    <span class="step-number">1</span>
                    <span class="step-text">Identidad</span>
                </button>
                <i class="bi bi-chevron-right wizard-step-separator" aria-hidden="true"></i>
                <button type="button" class="wizard-step-pill" data-step="2" role="tab" aria-selected="false" aria-controls="wizard-step-2-pane">
                    <span class="step-number">2</span>
                    <span class="step-text">Ubicación</span>
                </button>
                <i class="bi bi-chevron-right wizard-step-separator" aria-hidden="true"></i>
                <button type="button" class="wizard-step-pill" data-step="3" role="tab" aria-selected="false" aria-controls="wizard-step-3-pane">
                    <span class="step-number">3</span>
                    <span class="step-text">Finanzas</span>
                </button>
            </div>
        `;

        modalServiceV2.showModal({
            id: 'business-wizard-modal',
            scope: 'module',
            size: 'lg',
            closeOnBackdrop: false,
            closeOnEsc: false,
            header: {
                left: {
                    icon: 'bi-building-add',
                    title: 'Asistente de Registro Comercial',
                    subtitle: 'Nueva empresa / comercio en BUCA AI'
                },
                center: { html: stepsHtml },
                right: { showGlobalControls: { ai: false, resize: false, help: true } }
            },
            body: {
                html: createBusinessWizardTemplate()
            },
            footer: {
                left: renderButton({ id: 'wizard-btn-help', variant: 'ghost', size: 'sm', iconLeft: 'bi-question-circle', label: 'Ayuda', attrs: { 'data-action': 'ui:modal_help' } }),
                right: [
                    renderButton({ id: 'wizard-btn-prev', variant: 'ghost', pill: true, iconLeft: 'bi-arrow-left', label: 'Anterior', attrs: { disabled: 'true' } }),
                    renderButton({ id: 'wizard-btn-next', variant: 'primary', pill: true, label: 'Siguiente', iconRight: 'bi-arrow-right' }),
                    renderButton({ id: 'btn-submit-business-wizard', variant: 'primary', pill: true, iconLeft: 'bi-check2-circle', label: 'Registrar Comercio', attrs: { style: 'display:none;' } })
                ].join('')
            },
            onHelp: () => {
                modalServiceV2.notifyHeader('info', 'Complete cada paso secuencialmente. Campos con * son obligatorios.', 5000);
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
