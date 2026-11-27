/**
 * MFAEnrollmentModal - Modal de Enrolamiento y Configuración de MFA (TOTP)
 * Estado y UID encapsulados por intento con máquina de estados segura contra carreras.
 */
import ModalService from '@/shared/ui/services/ModalService.js';
import { AuthService } from '@/modules/auth/services/AuthService.js';
import { SupabaseProvider } from '@/modules/auth/services/SupabaseProvider.js';
import { CanvasQRRenderer } from '@/core/security/CanvasQRRenderer.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $on, $text, $mount, $hide, $show, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export class MFAEnrollmentModal {
    static _currentAttempt = null;
    static _orphanFactorsToPurge = new Map();
    static _purgingFactors = new Set();

    static show() {
        this._purgeOrphans();
        const user = sessionState.get().user || {};
        const email = user.email || '';
        const ownerUid = user.uid || null;

        const attempt = {
            id: Symbol('mfa_attempt'),
            ownerUid,
            isOpen: true,
            isConfirmed: false,
            pendingFactorId: null,
            verifyPromise: null
        };
        this._currentAttempt = attempt;

        ModalService.showModal({
            id: 'mfa-enrollment-modal',
            scope: 'module',
            size: 'md',
            closeOnBackdrop: false,
            lockShortcuts: true,
            initialFocus: '#mfa-reauth-pwd',
            header: {
                left: {
                    icon: 'bi-shield-lock-fill',
                    title: 'Configurar Doble Factor (MFA)',
                    subtitle: 'Verificación de seguridad AAL2',
                    badge: { text: 'Paso 1 de 2', tone: 'primary' }
                }
            },
            body: {
                html: `<div id="mfa-step-container" class="p-2">
                <div class="alert alert-warning d-flex align-items-start gap-2 rounded-3 small mb-3">
                    <i class="bi bi-shield-exclamation text-warning fs-5 flex-shrink-0"></i>
                    <div><strong>Reautenticación:</strong> Ingrese su contraseña actual para configurar TOTP.</div>
                </div>
                <form id="mfa-reauth-form">
                    <div class="mb-3"><label class="form-label small fw-bold text-muted text-uppercase mb-1">Correo</label><input type="email" class="form-control opacity-75" value="${email}" readonly></div>
                    <div class="mb-3"><label class="form-label small fw-bold text-muted text-uppercase mb-1">Contraseña Actual *</label><input type="password" id="mfa-reauth-pwd" class="form-control" placeholder="••••••••" required></div>
                    <div id="mfa-reauth-feedback" class="small text-danger mb-3 d-none"></div>
                </form></div>`
            },
            footer: {
                right: '<button type="button" class="btn btn-ghost rounded-pill px-3" data-action="ui:close_modal">Cancelar</button><button type="submit" id="btn-mfa-reauth" form="mfa-reauth-form" class="btn btn-primary rounded-pill px-4 fw-bold"><span>Verificar Contraseña</span><i class="bi bi-arrow-right ms-1"></i></button>'
            },
            onClose: () => {
                try { this._handleModalClose(attempt); } catch (e) {
                    Logger.warn({ layer: 'UI', role: 'CLASS', target: 'MFAEnrollmentModal', message: 'Error al cerrar modal de inscripción MFA.', data: e?.message || e });
                }
            }
        });
        this._bindReauthForm(email, attempt);
    }

    static _purgeOrphans() {
        const currentUid = sessionState.get().user?.uid;
        if (!currentUid || !this._orphanFactorsToPurge.has(currentUid)) return;
        const factorSet = this._orphanFactorsToPurge.get(currentUid);
        for (const factorId of Array.from(factorSet)) {
            if (this._purgingFactors.has(factorId)) continue;
            this._purgingFactors.add(factorId);

            SupabaseProvider.mfaUnenroll(factorId)
                .then((res) => {
                    if (res?.error) throw res.error;
                    factorSet.delete(factorId);
                    if (factorSet.size === 0) this._orphanFactorsToPurge.delete(currentUid);
                })
                .catch(err => Logger.warn({ layer: 'UI', role: 'CLASS', target: 'MFAEnrollmentModal', message: `Purga de factor huérfano ${factorId} falló.`, data: err?.message || err }))
                .finally(() => { this._purgingFactors.delete(factorId); });
        }
    }

    static _enqueueOrphan(uid, factorId) {
        if (!uid || !factorId) return;
        if (!this._orphanFactorsToPurge.has(uid)) this._orphanFactorsToPurge.set(uid, new Set());
        this._orphanFactorsToPurge.get(uid).add(factorId);
    }

    static _revokeFactor(factorId, ownerUid) {
        if (!factorId || !ownerUid) return;
        const currentUid = sessionState.get().user?.uid;
        if (currentUid !== ownerUid) {
            this._enqueueOrphan(ownerUid, factorId);
            Logger.warn({ layer: 'UI', role: 'CLASS', target: 'MFAEnrollmentModal', message: `Sesión ${currentUid} difiere de creador ${ownerUid}; factor retenido.` });
            return;
        }

        SupabaseProvider.mfaUnenroll(factorId)
            .then((res) => {
                if (res?.error) throw res.error;
                Logger.info({ layer: 'UI', role: 'CLASS', target: 'MFAEnrollmentModal', message: `Factor TOTP no verificado ${factorId} revocado.` });
            })
            .catch(err => {
                this._enqueueOrphan(ownerUid, factorId);
                Logger.warn({ layer: 'UI', role: 'CLASS', target: 'MFAEnrollmentModal', message: `Fallo revocando factor TOTP ${factorId}.`, data: err?.message || err });
            });
    }

    static _handleModalClose(attempt) {
        attempt.isOpen = false;
        if (this._currentAttempt === attempt) this._currentAttempt = null;
        if (attempt.isConfirmed) { attempt.pendingFactorId = null; return; }

        const factorToRevoke = attempt.pendingFactorId;
        attempt.pendingFactorId = null;

        if (attempt.verifyPromise) {
            attempt.verifyPromise.then(res => {
                if (res?.success) { attempt.isConfirmed = true; }
                else if (factorToRevoke) { this._revokeFactor(factorToRevoke, attempt.ownerUid); }
            }).catch(() => {
                if (factorToRevoke) this._revokeFactor(factorToRevoke, attempt.ownerUid);
            });
            return;
        }
        if (factorToRevoke) this._revokeFactor(factorToRevoke, attempt.ownerUid);
    }

    static _bindReauthForm(email, attempt) {
        const form = $id('mfa-reauth-form');
        if (!form) return;

        $on(form, 'submit', async (e) => {
            e.preventDefault();
            if (!attempt.isOpen || this._currentAttempt !== attempt) return;

            const pwdInput = $id('mfa-reauth-pwd');
            const feedback = $id('mfa-reauth-feedback');
            const btn = $id('btn-mfa-reauth');
            const password = pwdInput?.value || '';
            if (!password) return;

            btn.disabled = true;
            setButtonLoading(btn, true, 'Verificando...');
            $hide(feedback);

            try {
                const loginData = await SupabaseProvider.login(email, password);
                const activeUid = sessionState.get().user?.uid || loginData?.user?.id;
                if (activeUid && attempt.ownerUid && activeUid !== attempt.ownerUid) {
                    Logger.warn({ layer: 'UI', role: 'CLASS', target: 'MFAEnrollmentModal', message: 'Cambio de identidad detectado durante reautenticación; cancelando.' });
                    ModalService.hideModal();
                    return;
                }

                if (!attempt.isOpen || this._currentAttempt !== attempt) return;
                await this._showStep2QR(email, attempt);
            } catch {
                if (feedback) {
                    $text(feedback, 'Contraseña incorrecta. Se requiere reautenticación válida.');
                    $show(feedback);
                }
                btn.disabled = false;
                setButtonContent(btn, 'Verificar Contraseña', 'bi bi-arrow-right');
            }
        });
    }

    static async _showStep2QR(_email, attempt) {
        const container = $id('mfa-step-container');
        if (!container || !attempt.isOpen || this._currentAttempt !== attempt) return;

        $mount(container, '<div class="text-center py-2"><div class="buca-spinner mx-auto mb-3"></div><div class="small text-muted">Generando factor TOTP y código QR seguro...</div></div>');

        const enrollment = await AuthService.enrollTOTP();
        const activeUid = sessionState.get().user?.uid;

        if (!attempt.isOpen || this._currentAttempt !== attempt || (activeUid && attempt.ownerUid && activeUid !== attempt.ownerUid)) {
            if (enrollment?.success && enrollment.factorId) {
                this._revokeFactor(enrollment.factorId, attempt.ownerUid);
            }
            if (attempt.isOpen && activeUid && attempt.ownerUid && activeUid !== attempt.ownerUid) {
                ModalService.hideModal();
            }
            return;
        }

        if (!enrollment.success) {
            $mount(container, `<div class="alert alert-danger py-2 small">${enrollment.error || 'Error generando TOTP'}</div>`);
            return;
        }

        attempt.pendingFactorId = enrollment.factorId;

        $mount(container, `<div class="text-center mb-3">
            <p class="small text-muted mb-2">Escanee este código con Google Authenticator o Authy:</p>
            <div class="d-flex justify-content-center p-2 rounded-3 bg-white shadow-xs mx-auto border u-box-220"><canvas id="mfa-canvas-qr" width="220" height="220"></canvas></div>
            <div class="small text-muted mt-2 mb-1">O ingrese esta clave secreta manualmente:</div>
            <div class="p-2 rounded bg-body-tertiary border font-monospace small fw-bold text-primary text-break user-select-all mb-2" id="mfa-secret-text"></div>
        </div>
        <div class="mb-3">
            <label class="form-label small fw-bold text-muted text-uppercase mb-1">Código de 6 dígitos *</label>
            <div class="input-group">
                <input type="text" id="mfa-verify-code" class="form-control text-center font-monospace fw-bold fs-5" maxlength="6" inputmode="numeric" placeholder="000000" autofocus>
                <button class="btn btn-primary fw-bold px-4" id="btn-mfa-confirm-code" type="button">Activar</button>
            </div>
            <div id="mfa-verify-feedback" class="small text-danger mt-1 d-none"></div>
        </div>`);

        $text('mfa-secret-text', enrollment.secret);
        const canvas = $id('mfa-canvas-qr');
        if (canvas && enrollment.qrCode) {
            await CanvasQRRenderer.renderToCanvas(canvas, enrollment.qrCode, { size: 220, padding: 10 });
        }

        const confirmBtn = $id('btn-mfa-confirm-code');
        const codeInput = $id('mfa-verify-code');
        const verifyFeedback = $id('mfa-verify-feedback');

        if (confirmBtn) {
            $on(confirmBtn, 'click', async () => {
                if (!attempt.isOpen || this._currentAttempt !== attempt) return;

                const code = codeInput?.value?.trim() || '';
                if (code.length !== 6) {
                    $text(verifyFeedback, 'Ingrese el código de 6 dígitos generado por la aplicación.');
                    $show(verifyFeedback);
                    return;
                }

                confirmBtn.disabled = true;
                setButtonLoading(confirmBtn, true, 'Verificando...');
                $hide(verifyFeedback);

                attempt.verifyPromise = AuthService.confirmTOTPEnrollment(enrollment.factorId, code);
                const res = await attempt.verifyPromise;
                attempt.verifyPromise = null;
                const postVerifyUid = sessionState.get().user?.uid;

                if (!attempt.isOpen || this._currentAttempt !== attempt || (postVerifyUid && attempt.ownerUid && postVerifyUid !== attempt.ownerUid)) {
                    if (res?.success) {
                        attempt.isConfirmed = true;
                    } else if (attempt.pendingFactorId) {
                        this._revokeFactor(attempt.pendingFactorId, attempt.ownerUid);
                        attempt.pendingFactorId = null;
                    }
                    if (attempt.isOpen && postVerifyUid && attempt.ownerUid && postVerifyUid !== attempt.ownerUid) {
                        ModalService.hideModal();
                    }
                    return;
                }

                if (res?.success) {
                    attempt.isConfirmed = true;
                    attempt.pendingFactorId = null;
                    this._showSuccessStep(attempt);
                } else {
                    $text(verifyFeedback, 'Código inválido o expirado. Compruebe la hora de su teléfono móvil.');
                    $show(verifyFeedback);
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = 'Activar';
                }
            });
        }
    }

    static _showSuccessStep(attempt) {
        const container = $id('mfa-step-container');
        if (!container || !attempt.isOpen || this._currentAttempt !== attempt) return;

        $mount(container, `<div class="text-center py-3">
            <div class="profile-icon-box-sm rounded-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center mb-3"><i class="bi bi-check2-circle fs-2"></i></div>
            <h5 class="fw-bold text-main mb-2">¡Autenticación en Dos Pasos Activada!</h5>
            <p class="small text-muted mb-4">Su factor TOTP ha sido verificado con éxito. El nivel AAL2 está activo.</p>
            <div class="d-flex justify-content-center"><button type="button" id="btn-mfa-finish" class="btn btn-success px-4 rounded-pill fw-bold">Entendido y Finalizar</button></div>
        </div>`);

        const finishBtn = $id('btn-mfa-finish');
        if (finishBtn) {
            $on(finishBtn, 'click', () => {
                ModalService.hideModal();
                eventBus.emit('profile:mfa-enrolled');
                eventBus.emit('ui:notification_hud', {
                    title: 'Seguridad AAL2 Activada',
                    message: 'Autenticación en dos pasos (TOTP) configurada y activa.',
                    type: 'success'
                });
            });
        }
    }
}

export default MFAEnrollmentModal;
