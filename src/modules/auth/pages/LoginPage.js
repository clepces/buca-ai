import LoginForm from '../components/LoginForm.js';
import PINForm from '../components/PINForm.js';
import { router } from '@/core/router/router.js';
import { sessionState } from '@/core/state/session.js';

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
        console.log('[Auth] -> LoginPage inicializada');
        this.showLoginView();
    },

    /**
     * Helper para cambiar vistas con transición suave.
     * @param {string} html - El nuevo contenido HTML
     * @param {string} newTitle - El nuevo título de la vista
     */
    async _switchView(html, newTitle) {
        const slot = document.getElementById('auth-body-slot');
        const titleEl = document.getElementById('auth-view-title');

        if (slot) {
            // Animación de salida
            slot.classList.remove('auth-view-active');
            slot.classList.add('auth-view-exit');
            
            await new Promise(r => setTimeout(r, 250));
            
            if (titleEl) titleEl.textContent = newTitle;
            
            // Inyectar nuevo contenido
            slot.innerHTML = html;
            
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
            const innerSlot = document.getElementById('login-form-slot');
            if (innerSlot) {
                innerSlot.innerHTML = LoginForm.render();
                LoginForm.init((credentials) => {
                    this.showPINView(credentials.email);
                });
            }
        });
    },

    async showPINView(email) {
        const footer = document.getElementById('auth-footer-slot');
        if (footer) footer.classList.add('d-none');

        // Generar OTP temporal
        let currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Verificar si el usuario tiene TOTP configurado en Firestore o almacenamiento
        let userTotpSecret = null;
        try {
            const { sessionState } = await import('@/core/state/session.js');
            const currentUser = sessionState.get().user;
            userTotpSecret = currentUser?.totp_secret || localStorage.getItem(`buca_totp_${email}`);
        } catch (e) {
            console.debug('[LoginPage] No TOTP secret found in session.');
        }

        const pinHTML = PINForm.render(email, { 
            otpCode: currentOtpCode, 
            hasTotp: Boolean(userTotpSecret) 
        });

        await this._switchView(pinHTML, 'Verificación de Identidad');

        // Intentar envío de correo en segundo plano
        import('@/core/services/NotificationService.js').then(({ NotificationService }) => {
            NotificationService.sendOTP(email, 'Usuario', currentOtpCode);
        }).catch(() => {});

        const bindPINVerification = () => {
            PINForm.init(
                async (enteredPin) => {
                    const { TOTPService } = await import('@/core/security/TOTPService.js');
                    
                    let isValid = false;
                    // 1. Código OTP temporal generado en la sesión
                    if (enteredPin === currentOtpCode) {
                        isValid = true;
                    }
                    // 2. Clave maestra de desarrollo (123456)
                    else if (enteredPin === '123456') {
                        isValid = true;
                    }
                    // 3. Verificación matemática TOTP (Google Authenticator)
                    else if (userTotpSecret) {
                        isValid = await TOTPService.verifyCode(userTotpSecret, enteredPin);
                    }

                    if (isValid) {
                        this.showWelcomeAndLoading(email);
                    } else {
                        PINForm.showFeedback('El código ingresado es incorrecto o ha caducado.', 'error');
                        const btnVerify = document.getElementById('btn-verify-pin');
                        if (btnVerify) {
                            btnVerify.disabled = false;
                            btnVerify.innerHTML = '<span>VERIFICAR IDENTIDAD</span><i class="bi bi-shield-check ms-2"></i>';
                        }
                    }
                },
                () => {
                    if (footer) footer.classList.remove('d-none');
                    this.showLoginView();
                },
                () => {
                    // Generar nuevo OTP
                    currentOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
                    const badge = document.getElementById('active-pin-badge');
                    if (badge) badge.textContent = currentOtpCode;
                    const autofillBtn = document.getElementById('btn-autofill-pin');
                    if (autofillBtn) autofillBtn.dataset.code = currentOtpCode;

                    import('@/core/services/NotificationService.js').then(({ NotificationService }) => {
                        NotificationService.sendOTP(email, 'Usuario', currentOtpCode);
                    }).catch(() => {});
                }
            );
        };

        bindPINVerification();
    },

    showWelcomeAndLoading(email = 'superadmin@buca.com') {
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
            const bar = document.getElementById('auth-load-bar');
            const pct = document.getElementById('auth-load-pct');
            const statusText = document.getElementById('auth-status-text');
            
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
                    statusText.textContent = steps[currentStep].t;
                    if (currentStep < steps.length - 1) currentStep++;
                }

                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    bar.style.background = '#22c55e';
                    
                    const { AuthService } = await import('@/modules/auth/services/AuthService.js');
                    const meta = AuthService.getDemoMeta(email);

                    sessionState.set({
                        isAuthenticated: true,
                        user: {
                            email,
                            displayName: meta.displayName || (email ? email.split('@')[0] : 'Super Admin'),
                            role: meta.role || 'user'
                        },
                        currentRole: meta.role || 'user'
                    });
                    setTimeout(() => router.navigate('/workspace'), 800);
                }

                if (bar) bar.style.width = `${progress}%`;
                if (pct) pct.innerText = `${Math.floor(progress)}%`;
            }, 100);
        });
    }
};

export default LoginPage;
