/**
 * ProfileController - Controlador interactivo para el perfil de usuario.
 * =========================================================================
 * Maneja pestañas modulares, actualización en Firestore y vinculación de
 * Google Authenticator (TOTP) 100% nativa y gratuita ($0).
 * =========================================================================
 */
import userService from '@/modules/auth/services/UserService.js';
import { TOTPService } from '@/core/security/TOTPService.js';
import { sessionState } from '@/core/state/session.js';
import { MFAEnrollmentModal } from './components/MFAEnrollmentModal.js';
import { eventBus } from '@/core/eventBus/index.js';

export const ProfileController = {
    _generatedSecret: null,

    init(initialTab = 'general') {
        console.log('[ProfileController] Initialized with tab:', initialTab);
        
        this._bindTabs(initialTab);
        this._bindGeneralForm();
        this._bindSecurityTab();
    },

    _bindTabs(initialTab) {
        const tabsContainer = document.getElementById('profile-modal-tabs');
        if (!tabsContainer) return;

        const switchTab = (tabId) => {
            tabsContainer.querySelectorAll('.modal-nav-tab').forEach(b => {
                b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
            });
            document.querySelectorAll('.tab-content-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            const targetPane = document.getElementById(`tab-profile-${tabId}`);
            if (targetPane) targetPane.classList.add('active');
        };

        tabsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-tab]');
            if (!btn) return;
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });

        // Activar tab inicial
        switchTab(initialTab);
    },

    _bindGeneralForm() {
        const feedbackEl = document.getElementById('profile-feedback-alert');
        const showProfileFeedback = (msg, isError = false) => {
            if (!feedbackEl) return;
            feedbackEl.className = `alert alert-${isError ? 'danger' : 'success'} py-2 px-3 small mb-3 rounded-3 animate__animated animate__fadeIn`;
            feedbackEl.innerHTML = `<i class="bi bi-${isError ? 'exclamation-circle' : 'check-circle'}-fill me-1"></i> ${msg}`;
            feedbackEl.classList.remove('d-none');
            feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };

        const formGeneral = document.getElementById('form-profile-general');
        if (formGeneral) {
            formGeneral.onsubmit = async (e) => {
                e.preventDefault();
                
                const submitBtn = document.getElementById('btn-save-profile-general');
                const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Guardando en Supabase...';
                }

                const username = document.getElementById('prof-username')?.value?.trim() || '';
                const emailInput = document.getElementById('prof-email')?.value?.trim();
                const sessionEmail = sessionState.get().user?.email || 'usuario@buca.com';
                const mail = emailInput || sessionEmail;
                const firstName = document.getElementById('prof-firstname')?.value?.trim() || '';
                const lastName = document.getElementById('prof-lastname')?.value?.trim() || '';
                const tax_id = document.getElementById('prof-tax-id')?.value?.trim() || '';
                const phone = document.getElementById('prof-phone')?.value?.trim() || '';
                const timezone = document.getElementById('prof-timezone')?.value || 'America/Caracas';
                const preferred_currency = document.getElementById('prof-currency')?.value || 'VES_BCV';
                const language = document.getElementById('prof-language')?.value || 'es_VE';
                const active_mode = document.getElementById('prof-active-mode')?.value || 'owner';
                const timeoutRaw = document.getElementById('prof-timeout')?.value;
                const session_timeout_mins = timeoutRaw !== undefined ? parseInt(timeoutRaw, 10) : 30;
                const fiscal_address = document.getElementById('prof-fiscal-address')?.value?.trim() || '';
                const city_state = document.getElementById('prof-city-state')?.value?.trim() || '';

                if (!username) {
                    showProfileFeedback('El alias / nombre de usuario es obligatorio.', true);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    return;
                }

                if (!firstName || !lastName) {
                    showProfileFeedback('Nombres y Apellidos son obligatorios.', true);
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    return;
                }

                try {
                    const profilePayload = {
                        username,
                        mail,
                        firstName,
                        lastName,
                        tax_id,
                        phone,
                        timezone,
                        preferred_currency,
                        language,
                        active_mode,
                        session_timeout_mins: isNaN(session_timeout_mins) ? 30 : session_timeout_mins,
                        fiscal_address,
                        city_state
                    };

                    const res = await userService.updateProfile(profilePayload);
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
                        submitBtn.innerHTML = originalBtnText;
                    }
                }
            };
        }
    },

    _bindSecurityTab() {
        const btnSetupTotp = document.getElementById('btn-setup-totp');
        const setupBox = document.getElementById('totp-setup-box');
        const qrSlot = document.getElementById('totp-qr-slot');
        const secretDisplay = document.getElementById('totp-secret-key-display');
        const testCodeInput = document.getElementById('totp-test-code');
        const btnConfirm = document.getElementById('btn-confirm-totp');
        const feedbackEl = document.getElementById('totp-setup-feedback');
        const toggle2FA = document.getElementById('profile-2fa-toggle');

        const sessionUser = sessionState.get().user || {};
        const userEmail = sessionUser.email || 'usuario@buca.com';

        // 1. Desplegar Modal de Enrolamiento MFA Nativo con Canvas QR
        if (btnSetupTotp) {
            btnSetupTotp.onclick = () => {
                MFAEnrollmentModal.show();
            };
        }

        // 2. Escuchar evento de enrolamiento completado
        eventBus.on('profile:mfa-enrolled', () => {
            if (toggle2FA) toggle2FA.checked = true;
            if (btnSetupTotp) {
                btnSetupTotp.classList.remove('btn-outline-primary');
                btnSetupTotp.classList.add('btn-outline-success');
                btnSetupTotp.innerHTML = '<i class="bi bi-shield-check"></i> <span>Google Authenticator Activo (AAL2)</span>';
            }
        });

        // 3. Switch general de 2FA
        if (toggle2FA) {
            toggle2FA.onchange = async () => {
                try {
                    await userService.updateSecurity({ two_factor_enabled: toggle2FA.checked });
                } catch (e) {
                    console.warn('[ProfileController] Error guardando estado 2FA:', e);
                }
            };
        }
    },

    _showTotpFeedback(msg, isError) {
        const el = document.getElementById('totp-setup-feedback');
        if (!el) return;
        el.className = `x-small text-center py-1.5 px-2 rounded mt-2 ${isError ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'}`;
        el.textContent = msg;
        el.classList.remove('d-none');
    }
};

export default ProfileController;
