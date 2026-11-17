/**
 * BusinessWizardController - Controlador del Asistente de Negocios & Unidades BUSA-I
 * =========================================================================
 */
import { BusinessRepository } from './services/BusinessRepository.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';

export const BusinessWizardController = {
    currentStep: 1,

    init() {
        this.currentStep = 1;
        this.goToStep(1);
        this.bindEvents();
    },

    bindEvents() {
        // Tab navigation
        const tabs = document.querySelectorAll('#wizard-steps-tabs .modal-nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const stepNum = parseInt(e.currentTarget.getAttribute('data-step'), 10);
                if (stepNum) this.goToStep(stepNum);
            });
        });

        // Next buttons
        const next1 = document.getElementById('wizard-next-1');
        if (next1) {
            next1.onclick = () => {
                const name = document.getElementById('wizard-biz-name')?.value?.trim();
                const rif = document.getElementById('wizard-biz-rif-num')?.value?.trim();
                if (!name || !rif) {
                    this.showFeedback('Por favor complete la Razón Social y el RIF antes de continuar.', 'error');
                    return;
                }
                this.goToStep(2);
            };
        }

        const next2 = document.getElementById('wizard-next-2');
        if (next2) {
            next2.onclick = () => {
                const line1 = document.getElementById('wizard-biz-line1')?.value?.trim();
                const city = document.getElementById('wizard-biz-city')?.value?.trim();
                if (!line1 || !city) {
                    this.showFeedback('Por favor indique la dirección de sede y la ciudad.', 'error');
                    return;
                }
                this.goToStep(3);
            };
        }

        // Prev buttons
        const prev2 = document.getElementById('wizard-prev-2');
        if (prev2) prev2.onclick = () => this.goToStep(1);

        const prev3 = document.getElementById('wizard-prev-3');
        if (prev3) prev3.onclick = () => this.goToStep(2);

        // Submit buttons (both Step 3 finish button and Modal footer button)
        const finishBtn = document.getElementById('wizard-finish-step3');
        if (finishBtn) finishBtn.onclick = () => this.handleSubmit();

        const submitBtn = document.getElementById('btn-submit-business-wizard');
        if (submitBtn) submitBtn.onclick = () => this.handleSubmit();
    },

    goToStep(stepNum) {
        this.currentStep = stepNum;
        
        // Panes
        [1, 2, 3].forEach(n => {
            const pane = document.getElementById(`wizard-step-${n}-pane`);
            if (pane) {
                pane.classList.toggle('active', n === stepNum);
            }
        });

        // Tabs
        const tabs = document.querySelectorAll('#wizard-steps-tabs .modal-nav-tab');
        tabs.forEach(tab => {
            const s = parseInt(tab.getAttribute('data-step'), 10);
            tab.classList.toggle('active', s === stepNum);
        });
    },

    showFeedback(msg, type = 'success') {
        const fb = document.getElementById('wizard-biz-feedback');
        if (!fb) return;
        fb.textContent = msg;
        fb.className = `alert ${type === 'error' ? 'alert-danger' : 'alert-success'} py-2 px-3 small rounded-3 mb-3`;
        fb.classList.remove('d-none');
    },

    async handleSubmit() {
        const name = document.getElementById('wizard-biz-name')?.value?.trim();
        const rifNum = document.getElementById('wizard-biz-rif-num')?.value?.trim();
        if (!name || !rifNum) {
            this.goToStep(1);
            this.showFeedback('La Razón Social y el RIF son obligatorios.', 'error');
            return;
        }

        const session = sessionState.get();
        const uid = session?.user?.uid || 'guest_user';
        const prefix = document.getElementById('wizard-biz-rif-prefix')?.value || 'J-';

        const data = {
            name: name || 'Comercio BUSA',
            rif: prefix + rifNum,
            commercialName: document.getElementById('wizard-biz-commercial-name')?.value?.trim() || '',
            category: document.getElementById('wizard-biz-category')?.value || 'Retail',
            description: document.getElementById('wizard-biz-description')?.value?.trim() || '',
            state: document.getElementById('wizard-biz-state')?.value || 'Carabobo',
            city: document.getElementById('wizard-biz-city')?.value || 'Valencia',
            address: document.getElementById('wizard-biz-line1')?.value?.trim() || '',
            reference: document.getElementById('wizard-biz-reference')?.value?.trim() || '',
            zip: document.getElementById('wizard-biz-zip')?.value || '2001',
            phone: document.getElementById('wizard-biz-phone')?.value?.trim() || '',
            email: document.getElementById('wizard-biz-email')?.value?.trim() || '',
            ivaApply: document.getElementById('wizard-biz-iva-apply')?.checked ?? true,
            igtfApply: document.getElementById('wizard-biz-igtf-apply')?.checked ?? true,
            igtfAbsorb: document.getElementById('wizard-biz-igtf-absorb')?.checked ?? false
        };

        const submitBtn = document.getElementById('btn-submit-business-wizard');
        const finishBtn = document.getElementById('wizard-finish-step3');
        const spinner = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Registrando...';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = spinner;
        }
        if (finishBtn) {
            finishBtn.disabled = true;
            finishBtn.innerHTML = spinner;
        }

        try {
            const created = await BusinessRepository.registerBusiness(uid, data);
            this.showFeedback('¡Negocio registrado y sincronizado exitosamente con Supabase!', 'success');
            
            eventBus.emit('notifications:push', {
                title: 'Comercio Registrado',
                message: `La unidad "${created.name}" fue creada correctamente.`,
                type: 'success'
            });

            eventBus.emit('business:registered', created);

            setTimeout(() => {
                const modalEl = document.getElementById('buca-global-modal');
                if (modalEl && window.bootstrap?.Modal) {
                    const bsModal = window.bootstrap.Modal.getInstance(modalEl);
                    if (bsModal) bsModal.hide();
                } else if (modalEl) {
                    modalEl.classList.remove('show');
                    modalEl.style.display = 'none';
                    document.body.classList.remove('modal-open', 'buca-modal-open');
                }
            }, 1200);

        } catch (err) {
            console.error('[BusinessWizardController] Registration error:', err);
            this.showFeedback('Error al registrar el negocio en Supabase. Verifique su conexión.', 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Registrar Comercio';
            }
            if (finishBtn) {
                finishBtn.disabled = false;
                finishBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Registrar Comercio';
            }
        }
    }
};

export default BusinessWizardController;
