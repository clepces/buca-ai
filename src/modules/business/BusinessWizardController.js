/**
 * BusinessWizardController - Controlador del Asistente de Negocios & Unidades BUSA-I
 * =========================================================================
 * Refactorizado con utilidades DOM nativas seguras (Cero innerHTML / Cero .style)
 * =========================================================================
 */
import { BusinessRepository } from './services/BusinessRepository.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';
import {
    $id,
    $val,
    $checked,
    $show,
    $hide,
    $$,
    $on,
    $removeClass,
    setButtonLoading,
    setButtonContent
} from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export const BusinessWizardController = {
    currentStep: 1,

    init() {
        this.currentStep = 1;
        this.goToStep(1);
        this.bindEvents();
    },

    bindEvents() {
        // Tab navigation
        $$('#wizard-steps-tabs .modal-nav-tab').forEach(tab => {
            $on(tab, 'click', (e) => {
                const stepNum = parseInt(e.currentTarget.getAttribute('data-step'), 10);
                if (stepNum) this.goToStep(stepNum);
            });
        });

        // Next buttons
        $on('wizard-next-1', 'click', () => {
            const name = $val('wizard-biz-name');
            const rif = $val('wizard-biz-rif-num');
            if (!name || !rif) {
                this.showFeedback('Por favor complete la Razón Social y el RIF antes de continuar.', 'error');
                return;
            }
            this.goToStep(2);
        });

        $on('wizard-next-2', 'click', () => {
            const line1 = $val('wizard-biz-line1');
            const city = $val('wizard-biz-city');
            if (!line1 || !city) {
                this.showFeedback('Por favor indique la dirección de sede y la ciudad.', 'error');
                return;
            }
            this.goToStep(3);
        });

        // Prev buttons
        $on('wizard-prev-2', 'click', () => this.goToStep(1));
        $on('wizard-prev-3', 'click', () => this.goToStep(2));

        // Submit buttons
        $on('wizard-finish-step3', 'click', () => this.handleSubmit());
        $on('btn-submit-business-wizard', 'click', () => this.handleSubmit());
    },

    goToStep(stepNum) {
        this.currentStep = stepNum;

        // Panes
        [1, 2, 3].forEach(n => {
            const pane = $id(`wizard-step-${n}-pane`);
            if (pane) {
                pane.classList.toggle('active', n === stepNum);
            }
        });

        // Tabs
        $$('#wizard-steps-tabs .modal-nav-tab').forEach(tab => {
            const s = parseInt(tab.getAttribute('data-step'), 10);
            tab.classList.toggle('active', s === stepNum);
        });
    },

    showFeedback(msg, type = 'success') {
        const fb = $id('wizard-biz-feedback');
        if (!fb) return;
        fb.textContent = msg;
        fb.className = `alert ${type === 'error' ? 'alert-danger' : 'alert-success'} py-2 px-3 small rounded-3 mb-3`;
        $show(fb);
    },

    async handleSubmit() {
        const name = $val('wizard-biz-name');
        const rifNum = $val('wizard-biz-rif-num');
        if (!name || !rifNum) {
            this.goToStep(1);
            this.showFeedback('La Razón Social y el RIF son obligatorios.', 'error');
            return;
        }

        const session = sessionState.get();
        const uid = session?.user?.uid || 'guest_user';
        const prefix = $val('wizard-biz-rif-prefix', 'J-');

        const data = {
            name: name || 'Comercio BUSA',
            rif: prefix + rifNum,
            commercialName: $val('wizard-biz-commercial-name'),
            category: $val('wizard-biz-category', 'Retail'),
            description: $val('wizard-biz-description'),
            state: $val('wizard-biz-state', 'Carabobo'),
            city: $val('wizard-biz-city', 'Valencia'),
            address: $val('wizard-biz-line1'),
            reference: $val('wizard-biz-reference'),
            zip: $val('wizard-biz-zip', '2001'),
            phone: $val('wizard-biz-phone'),
            email: $val('wizard-biz-email'),
            ivaApply: $checked('wizard-biz-iva-apply', true),
            igtfApply: $checked('wizard-biz-igtf-apply', true),
            igtfAbsorb: $checked('wizard-biz-igtf-absorb', false)
        };

        const submitBtn = $id('btn-submit-business-wizard');
        const finishBtn = $id('wizard-finish-step3');

        setButtonLoading(submitBtn, true, 'Registrando...');
        setButtonLoading(finishBtn, true, 'Registrando...');

        try {
            const created = await BusinessRepository.registerBusiness(uid, data);
            this.showFeedback('¡Negocio registrado y sincronizado exitosamente con Supabase!', 'success');

            eventBus.emit('notifications:push', {
                title: 'Comercio Registrado',
                message: `La unidad "${created.name}" fue creada correctamente.`,
                type: 'success'
            });

            eventBus.emit('business:registered', created);
            eventBus.emit('workspace:business_created', created);
            eventBus.emit('workspace:refresh_data');

            setTimeout(() => {
                const modalEl = $id('buca-global-modal');
                if (modalEl && window.bootstrap?.Modal) {
                    const bsModal = window.bootstrap.Modal.getInstance(modalEl);
                    if (bsModal) bsModal.hide();
                } else if (modalEl) {
                    $removeClass(modalEl, 'show');
                    $hide(modalEl);
                    $removeClass(document.body, 'modal-open', 'buca-modal-open');
                }
            }, 1200);

        } catch (err) {
            Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'BusinessWizard', message: 'Error registrando negocio en Supabase.', data: err?.message || err });
            this.showFeedback('Error al registrar el negocio en Supabase. Verifique su conexión.', 'error');

            setButtonLoading(submitBtn, false);
            setButtonContent(submitBtn, 'Registrar Comercio');

            setButtonLoading(finishBtn, false);
            setButtonContent(finishBtn, 'Registrar Comercio', 'bi bi-check-circle-fill');
        }
    }
};

export default BusinessWizardController;
