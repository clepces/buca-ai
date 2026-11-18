import LoginForm from '../components/LoginForm.js';
import PINForm from '../components/PINForm.js';
import { router } from '@/core/router/router.js';
import { sessionState } from '@/core/state/session.js';
import { $id, $mount, $show, $hide, $text, $styleVar, $addClass, setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export const LoginPage = {
    render() {
        return `
            <div class="auth-view-content">
                <main class="auth-body" id="auth-body-slot">
                    <h2 class="h5 fw-semibold mb-4 text-center" id="auth-view-title">Acceso Corporativo</h2>
                    <div id="login-form-slot"></div>
                </main>

                <footer class="text-center mt-4 border-top pt-3" id="auth-footer-slot">
                    <p class="small text-muted mb-0">
                        ¿No tiene una cuenta? <a href="/auth/register" class="fw-semibold text-decoration-none">Solicitar acceso</a>
                    </p>
                </footer>
            </div>
        `;
    },

    init() {
        Logger.info('Auth', 'LoginPage inicializada');
        this.showLoginView();
    },

    /**
     * Helper para cambiar vistas con transición suave.
     * @param {string} html - El nuevo contenido HTML
     * @param {string} newTitle - El nuevo título de la vista
     */
    async _switchView(html, newTitle) {
        const slot = $id('auth-body-slot');
        const titleEl = $id('auth-view-title');

        if (slot) {
            // Animación de salida
            slot.classList.remove('auth-view-active');
            slot.classList.add('auth-view-exit');
            
            await new Promise(r => setTimeout(r, 250));
            
            if (titleEl) $text(titleEl, newTitle);
            
            // Inyectar nuevo contenido
            $mount(slot, html);
            
            // Animación de entrada
            requestAnimationFrame(() => {
                slot.classList.remove('auth-view-exit');
                slot.classList.add('auth-view-active');
            });
        }
    },

    showLoginView() {
        const loginHTML = '<div id="login-form-slot"></div>';
        this._switchView(loginHTML, 'Acceso Corporativo').then(() => {
            const innerSlot = $id('login-form-slot');
            if (innerSlot) {
                $mount(innerSlot, LoginForm.render());
                LoginForm.init((data) => {
                    if (data?.mfaRequired) {
                        this.showPINView(data.email, data.factorId);
                    } else {
                        this.showWelcomeAndLoading(data?.email);
                    }
                });
            }
        });
    },

    async showPINView(email, factorId = null) {
        const footer = $id('auth-footer-slot');
        if (footer) $hide(footer);

        const pinHTML = PINForm.render(email, { 
            hasTotp: true 
        });

        await this._switchView(pinHTML, 'Verificación de Identidad (AAL2)');

        const bindPINVerification = () => {
            PINForm.init(
                async (enteredPin) => {
                    const cleanPin = String(enteredPin || '').trim();
                    if (cleanPin.length !== 6) {
                        PINForm.showFeedback('Por favor, ingrese un código válido de 6 dígitos.', 'error');
                        return;
                    }

                    const btnVerify = $id('btn-verify-pin');
                    if (btnVerify) {
                        setButtonLoading(btnVerify, true, 'Verificando TOTP...');
                    }

                    try {
                        const { AuthService } = await import('../services/AuthService.js');
                        let currentFactorId = factorId;

                        if (!currentFactorId) {
                            const { SupabaseProvider } = await import('../services/SupabaseProvider.js');
                            const factors = await SupabaseProvider.mfaListFactors();
                            currentFactorId = factors?.totp?.[0]?.id;
                        }

                        if (!currentFactorId) {
                            throw new Error('No se encontró un factor TOTP registrado para esta cuenta.');
                        }

                        const verifyRes = await AuthService.verifyMFAChallenge(currentFactorId, cleanPin);
                        if (verifyRes.success) {
                            this.showWelcomeAndLoading(email);
                        } else {
                            throw new Error(verifyRes.error || 'Código TOTP incorrecto o expirado.');
                        }
                    } catch (err) {
                        PINForm.showFeedback(err.message || 'Fallo en la verificación MFA.', 'error');
                        if (btnVerify) {
                            setButtonLoading(btnVerify, false);
                            setButtonContent(btnVerify, 'VERIFICAR IDENTIDAD', 'bi bi-shield-check ms-2');
                        }
                    }
                },
                () => {
                    if (footer) $show(footer);
                    this.showLoginView();
                },
                () => {
                    PINForm.showFeedback('Consulte su aplicación Google Authenticator para ver el código actual.', 'success');
                }
            );
        };

        bindPINVerification();
    },

    showWelcomeAndLoading(_email = '') {
        const welcomeHTML = `
            <div class="welcome-container text-center animate__animated animate__fadeIn">
                <div class="welcome-badge mb-3">
                    <div class="pulse-ring"></div>
                    <i class="bi bi-shield-lock-fill"></i>
                </div>
                <h2 class="auth-title">Sincronizando Identidad</h2>
                <p class="auth-subtitle mb-4">Cargando perfiles corporativos...</p>
                
                <div class="loading-ecosystem mt-4">
                    <div class="progress-bar-container-login">
                        <div class="success-progress-bar" id="auth-load-bar"></div>
                    </div>
                    <div class="d-flex justify-content-between mt-3">
                        <span class="status-text-loading" id="auth-status-text">Iniciando sesión segura...</span>
                        <span class="pct-text" id="auth-load-pct">0%</span>
                    </div>
                </div>
            </div>
        `;

        this._switchView(welcomeHTML, 'Acceso Concedido').then(() => {
            const bar = $id('auth-load-bar');
            const pct = $id('auth-load-pct');
            const statusText = $id('auth-status-text');
            
            const steps = [
                { p: 20, t: 'Verificando tokens...' },
                { p: 45, t: 'Sincronizando bases de datos...' },
                { p: 75, t: 'Cargando preferencias...' },
                { p: 100, t: '¡Bienvenido a BUCA!' }
            ];

            let currentStep = 0;
            let progress = 0;
            
            const interval = setInterval(async () => {
                progress += Math.random() * 8;
                
                if (progress >= steps[currentStep].p) {
                    $text(statusText, steps[currentStep].t);
                    if (currentStep < steps.length - 1) currentStep++;
                }

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    if (bar) $addClass(bar, 'bg-success');
                    
                    const currentUser = sessionState.get().user;
                    if (!currentUser) {
                        // Si no hay sesión válida, redirigir a login
                        setTimeout(() => router.navigate('/auth/login'), 500);
                        return;
                    }
                    setTimeout(() => router.navigate('/workspace'), 800);
                }

                if (bar) $styleVar(bar, 'width', `${progress}%`);
                if (pct) $text(pct, `${Math.floor(progress)}%`);
            }, 100);
        });
    }
};

export default LoginPage;
