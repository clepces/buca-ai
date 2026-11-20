/**
 * ProfileController - Controlador interactivo para el perfil de usuario.
 * =========================================================================
 * Maneja pestañas modulares, actualización en Supabase, vinculación MFA TOTP
 * y orquesta los subcontroladores de perfil.
 * =========================================================================
 */
import userService from '@/modules/auth/services/UserService.js';
import { SupabaseProvider } from '@/modules/auth/services/SupabaseProvider.js';
import { sessionState } from '@/core/state/session.js';
import { MFAEnrollmentModal } from './components/MFAEnrollmentModal.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $$, $on, $val, $mount, $show, $className, $addClass, $removeClass } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { ProfileWorkerController } from './logic/profile-worker-controller.js';

export const ProfileController = {
    _generatedSecret: null,

    init(initialTab = 'general') {
        Logger.info('ProfileController', `Initialized with tab: ${initialTab}`);
        this._bindTabs(initialTab);
        this._bindGeneralForm();
        this._bindSecurityTab();
        ProfileWorkerController.bind(this);
    },

    showFeedback(msg, isError = false) {
        const feedbackEl = $id('profile-feedback-alert');
        if (!feedbackEl) return;
        $className(feedbackEl, `alert alert-${isError ? 'danger' : 'success'} py-2 px-3 small mb-3 rounded-3 animate__animated animate__fadeIn`);
        $mount(feedbackEl, `<i class="bi bi-${isError ? 'exclamation-circle' : 'check-circle'}-fill me-1"></i> ${escapeHTML(msg)}`);
        $show(feedbackEl);
        feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    _bindTabs(initialTab) {
        const tabsContainer = $id('profile-modal-tabs');
        if (!tabsContainer) return;

        const switchTab = (tabId) => {
            $$('.modal-nav-tab', tabsContainer).forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
            });
            $$('.tab-content-pane').forEach(pane => $removeClass(pane, 'active'));
            const targetPane = $id(`tab-profile-${tabId}`);
            if (targetPane) $addClass(targetPane, 'active');
        };

        $on(tabsContainer, 'click', (e) => {
            const btn = e.target.closest('[data-tab]');
            if (!btn) return;
            switchTab(btn.getAttribute('data-tab'));
        });

        switchTab(initialTab);
    },

    _bindGeneralForm() {
        const formGeneral = $id('form-profile-general');
        if (!formGeneral) return;

        $on(formGeneral, 'submit', async (e) => {
            e.preventDefault();
            const submitBtn = $id('btn-save-profile-general');
            if (submitBtn) {
                submitBtn.disabled = true;
                setButtonLoading(submitBtn, true, 'Guardando en Supabase...');
            }

            const username = $val('prof-username');
            const emailInput = $val('prof-email');
            const sessionEmail = sessionState.get().user?.email || '';
            const mail = emailInput || sessionEmail;
            const firstName = $val('prof-firstname');
            const lastName = $val('prof-lastname');
            const tax_id = $val('prof-tax-id');
            const phone = $val('prof-phone');
            const timezone = $val('prof-timezone') || 'America/Caracas';
            const preferred_currency = $val('prof-currency') || 'VES_BCV';
            const language = $val('prof-language') || 'es_VE';
            const active_mode = $val('prof-active-mode') || 'owner';
            const timeoutRaw = $val('prof-timeout');
            const session_timeout_mins = timeoutRaw ? parseInt(timeoutRaw, 10) : 30;
            const fiscal_address = $val('prof-fiscal-address');
            const city_state = $val('prof-city-state');

            if (!username) {
                this.showFeedback('El alias / nombre de usuario es obligatorio.', true);
                if (submitBtn) { submitBtn.disabled = false; setButtonLoading(submitBtn, false); }
                return;
            }
            if (!firstName || !lastName) {
                this.showFeedback('Nombres y Apellidos son obligatorios.', true);
                if (submitBtn) { submitBtn.disabled = false; setButtonLoading(submitBtn, false); }
                return;
            }

            try {
                const res = await userService.updateProfile({
                    username, mail, firstName, lastName, tax_id, phone,
                    timezone, preferred_currency, language, active_mode,
                    session_timeout_mins: isNaN(session_timeout_mins) ? 30 : session_timeout_mins,
                    fiscal_address, city_state
                });
                if (!res.success) {
                    this.showFeedback(res.error || 'Error al validar datos del perfil.', true);
                } else {
                    this.showFeedback('¡Perfil corporativo actualizado con éxito en Supabase!', false);
                }
            } catch (err) {
                this.showFeedback(err.message || 'Error al actualizar perfil.', true);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    setButtonLoading(submitBtn, false);
                }
            }
        });
    },

    _bindSecurityTab() {
        const btnSetupTotp = $id('btn-setup-totp');
        const toggle2FA = $id('profile-2fa-toggle');

        if (btnSetupTotp) {
            $on(btnSetupTotp, 'click', () => MFAEnrollmentModal.show());
        }

        const markMFAActive = () => {
            if (toggle2FA) {
                toggle2FA.checked = true;
                toggle2FA.disabled = true;
            }
            if (btnSetupTotp) {
                $removeClass(btnSetupTotp, 'btn-outline-primary');
                $addClass(btnSetupTotp, 'btn-outline-success');
                setButtonContent(btnSetupTotp, 'Google Authenticator Activo (AAL2)', 'bi bi-shield-check');
            }
        };

        eventBus.on('profile:mfa-enrolled', markMFAActive);

        // Validar estado real de factores en Supabase al cargar
        SupabaseProvider.mfaListFactors()
            .then(factors => {
                const verified = (factors?.totp || factors?.all || []).some(f => f.status === 'verified');
                if (verified) {
                    markMFAActive();
                } else if (toggle2FA) {
                    toggle2FA.checked = false;
                    toggle2FA.disabled = true;
                }
            })
            .catch(err => {
                Logger.warn('ProfileController', 'Error consultando factores MFA:', err);
                if (toggle2FA) toggle2FA.disabled = true;
            });
    }
};

export default ProfileController;
