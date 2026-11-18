/**
 * ProfileController - Controlador interactivo para el perfil de usuario.
 * =========================================================================
 * Maneja pestañas modulares, actualización en Supabase y vinculación de
 * Google Authenticator (TOTP) 100% nativa y gratuita ($0).
 * =========================================================================
 */
import userService from '@/modules/auth/services/UserService.js';
import { sessionState } from '@/core/state/session.js';
import { MFAEnrollmentModal } from './components/MFAEnrollmentModal.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $$, $on, $val, $mount, $show, $hide, $className, $addClass, $removeClass } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export const ProfileController = {
    _generatedSecret: null,

    init(initialTab = 'general') {
        Logger.info('ProfileController', `Initialized with tab: ${initialTab}`);
        this._bindTabs(initialTab);
        this._bindGeneralForm();
        this._bindSecurityTab();
        this._bindWorkerTab();
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
        const feedbackEl = $id('profile-feedback-alert');
        const showProfileFeedback = (msg, isError = false) => {
            if (!feedbackEl) return;
            $className(feedbackEl, `alert alert-${isError ? 'danger' : 'success'} py-2 px-3 small mb-3 rounded-3 animate__animated animate__fadeIn`);
            $mount(feedbackEl, `<i class="bi bi-${isError ? 'exclamation-circle' : 'check-circle'}-fill me-1"></i> ${msg}`);
            $show(feedbackEl);
            feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

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
                showProfileFeedback('El alias / nombre de usuario es obligatorio.', true);
                if (submitBtn) { submitBtn.disabled = false; setButtonLoading(submitBtn, false); }
                return;
            }
            if (!firstName || !lastName) {
                showProfileFeedback('Nombres y Apellidos son obligatorios.', true);
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
                    showProfileFeedback(res.error || 'Error al validar datos del perfil.', true);
                } else {
                    showProfileFeedback('¡Perfil corporativo actualizado con éxito en Supabase!', false);
                }
            } catch (err) {
                showProfileFeedback(err.message || 'Error al actualizar perfil.', true);
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

        eventBus.on('profile:mfa-enrolled', () => {
            if (toggle2FA) toggle2FA.checked = true;
            if (btnSetupTotp) {
                $removeClass(btnSetupTotp, 'btn-outline-primary');
                $addClass(btnSetupTotp, 'btn-outline-success');
                setButtonContent(btnSetupTotp, 'Google Authenticator Activo (AAL2)', 'bi bi-shield-check');
            }
        });

        if (toggle2FA) {
            $on(toggle2FA, 'change', async () => {
                try {
                    await userService.updateSecurity({ two_factor_enabled: toggle2FA.checked });
                } catch (e) {
                    Logger.warn('ProfileController', 'Error guardando estado 2FA:', e);
                }
            });
        }
    },

    _bindWorkerTab() {
        const cardsList = $id('experience-cards-list');
        if (!cardsList) return;

        $on(cardsList, 'click', (e) => {
            const toggle = e.target.closest('[data-action="worker:toggle_ficha"]');
            if (!toggle || e.target.closest('button')) return;

            const currentCard = toggle.closest('.experience-card-item');
            if (!currentCard) return;

            $$('.experience-card-item', cardsList).forEach(c => {
                if (c !== currentCard) $addClass(c, 'collapsed');
            });
            currentCard.classList.toggle('collapsed');
        });
    }
};

export default ProfileController;
