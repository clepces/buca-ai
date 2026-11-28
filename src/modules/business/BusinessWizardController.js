/**
 * BusinessWizardController - Controlador del Asistente de Negocios & Unidades BUCA-I
 * =========================================================================
 * Wizard con navegación secuencial estricta: NO se puede saltar pasos.
 * Botones Anterior/Siguiente en footer; steps pills en header-center.
 * Validación de campos requeridos antes de avanzar.
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
    $addClass,
    $removeClass,
    setButtonLoading,
    setButtonContent
} from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

const TOTAL_STEPS = 3;

const STEP_VALIDATORS = {
    1: () => {
        const name = $val('wizard-biz-name');
        const rif = $val('wizard-biz-rif-num');
        const errors = [];
        if (!name || name.trim().length < 3) errors.push('La Razón Social debe tener al menos 3 caracteres.');
        if (!rif || !/^[0-9]{6,10}-?[0-9]$/.test(rif.trim())) errors.push('El RIF debe tener formato numérico válido (ej: 12345678-9).');
        return errors;
    },
    2: () => {
        const line1 = $val('wizard-biz-line1');
        const city = $val('wizard-biz-city');
        const email = $val('wizard-biz-email');
        const errors = [];
        if (!line1 || line1.trim().length < 5) errors.push('La dirección de sede debe tener al menos 5 caracteres.');
        if (!city || city.trim().length < 2) errors.push('Indique la ciudad o municipio.');
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('El correo de facturación no tiene formato válido.');
        return errors;
    },
    3: () => []
};

export const BusinessWizardController = {
    currentStep: 1,
    _maxReached: 1,

    init() {
        this.currentStep = 1;
        this._maxReached = 1;
        this._syncUI();
        this._bindFooterEvents();
        this._bindHeaderSteps();
    },

    _bindFooterEvents() {
        $on('wizard-btn-prev', 'click', () => {
            if (this.currentStep > 1) this.goToStep(this.currentStep - 1);
        });

        $on('wizard-btn-next', 'click', () => {
            if (this.currentStep < TOTAL_STEPS) this._attemptNext();
        });

        $on('btn-submit-business-wizard', 'click', () => this.handleSubmit());
    },

    _bindHeaderSteps() {
        $$('#wizard-header-steps .wizard-step-pill').forEach(pill => {
            $on(pill, 'click', (e) => {
                const stepNum = parseInt(e.currentTarget.getAttribute('data-step'), 10);
                if (!stepNum || stepNum > this._maxReached) return;
                if (stepNum > this.currentStep) {
                    const errors = STEP_VALIDATORS[this.currentStep]?.() || [];
                    if (errors.length > 0) {
                        this.showFeedback(errors.join(' '), 'error');
                        return;
                    }
                }
                this.goToStep(stepNum);
            });
        });
    },

    _attemptNext() {
        const errors = STEP_VALIDATORS[this.currentStep]?.() || [];
        if (errors.length > 0) {
            this.showFeedback(errors.join(' '), 'error');
            this._markInvalidFields();
            return;
        }
        this._clearInvalidFields();
        this.hideFeedback();
        const next = this.currentStep + 1;
        if (next > this._maxReached) this._maxReached = next;
        this.goToStep(next);
    },

    goToStep(stepNum) {
        this.currentStep = stepNum;
        this._syncUI();
    },

    _syncUI() {
        const step = this.currentStep;

        // Sync panes
        [1, 2, 3].forEach(n => {
            const pane = $id(`wizard-step-${n}-pane`);
            if (pane) pane.classList.toggle('active', n === step);
        });

        // Sync header pills
        $$('#wizard-header-steps .wizard-step-pill').forEach(pill => {
            const s = parseInt(pill.getAttribute('data-step'), 10);
            pill.classList.remove('active', 'completed');
            pill.setAttribute('aria-selected', String(s === step));
            if (s === step) pill.classList.add('active');
            else if (s < step) pill.classList.add('completed');
            pill.disabled = s > this._maxReached;
            pill.style.cursor = s > this._maxReached ? 'not-allowed' : 'pointer';
            pill.style.opacity = s > this._maxReached ? '0.5' : '1';
        });

        // Sync footer buttons
        const prevBtn = $id('wizard-btn-prev');
        const nextBtn = $id('wizard-btn-next');
        const submitBtn = $id('btn-submit-business-wizard');

        if (prevBtn) prevBtn.disabled = step === 1;
        if (nextBtn) nextBtn.style.display = step < TOTAL_STEPS ? '' : 'none';
        if (submitBtn) submitBtn.style.display = step === TOTAL_STEPS ? '' : 'none';

        this.hideFeedback();
    },

    _markInvalidFields() {
        const pane = $id(`wizard-step-${this.currentStep}-pane`);
        if (!pane) return;
        pane.querySelectorAll('[required]').forEach(field => {
            if (!field.value || !field.value.trim()) $addClass(field, 'is-invalid');
            else $removeClass(field, 'is-invalid');
        });
    },

    _clearInvalidFields() {
        const pane = $id(`wizard-step-${this.currentStep}-pane`);
        if (pane) pane.querySelectorAll('.is-invalid').forEach(el => $removeClass(el, 'is-invalid'));
    },

    showFeedback(msg, type = 'success') {
        const fb = $id('wizard-biz-feedback');
        if (!fb) return;
        fb.textContent = msg;
        fb.className = `alert ${type === 'error' ? 'alert-danger' : 'alert-success'} py-2 px-3 small rounded-3 mb-3`;
        $show(fb);
    },

    hideFeedback() {
        const fb = $id('wizard-biz-feedback');
        if (fb) $hide(fb);
    },

    async handleSubmit() {
        // Re-validate all steps before submitting
        for (let s = 1; s <= TOTAL_STEPS; s++) {
            const errors = STEP_VALIDATORS[s]?.() || [];
            if (errors.length > 0) {
                this.goToStep(s);
                this.showFeedback(errors.join(' '), 'error');
                this._markInvalidFields();
                return;
            }
        }

        const session = sessionState.get();
        const uid = session?.user?.uid || 'guest_user';
        const prefix = $val('wizard-biz-rif-prefix', 'J-');

        const data = {
            name: $val('wizard-biz-name') || 'Comercio BUCA',
            rif: prefix + $val('wizard-biz-rif-num'),
            commercial_name: $val('wizard-biz-commercial-name') || null,
            category: $val('wizard-biz-category', 'Retail / Alimentos'),
            description: $val('wizard-biz-description') || null,
            state: $val('wizard-biz-state', 'Carabobo'),
            city: $val('wizard-biz-city', 'Valencia'),
            address: $val('wizard-biz-line1'),
            reference: $val('wizard-biz-reference') || null,
            zip: $val('wizard-biz-zip', '2001') || null,
            phone: $val('wizard-biz-phone') || null,
            email: $val('wizard-biz-email') || null,
            iva_apply: $checked('wizard-biz-iva-apply', true),
            igtf_apply: $checked('wizard-biz-igtf-apply', true),
            igtf_absorb: $checked('wizard-biz-igtf-absorb', false)
        };

        const submitBtn = $id('btn-submit-business-wizard');
        setButtonLoading(submitBtn, true, 'Registrando...');

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

            setTimeout(() => eventBus.emit('ui:close_modal'), 1200);

        } catch (err) {
            Logger.error({ layer: 'MODULE', role: 'CLASS', target: 'BusinessWizard', message: 'Error registrando negocio en Supabase.', data: err?.message || err });
            this.showFeedback('Error al registrar el negocio en Supabase. Verifique su conexión.', 'error');
            setButtonLoading(submitBtn, false);
            setButtonContent(submitBtn, 'Registrar Comercio', 'bi bi-check2-circle');
        }
    }
};

export default BusinessWizardController;
