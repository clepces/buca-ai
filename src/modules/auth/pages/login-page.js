import LoginForm from '../components/login-form.js';
import { renderAuthCardShell } from '../components/auth-card-shell.js';
import { router } from '@/core/router/router.js';
import { RouterGuards } from '@/core/router/guards.js';
import { sessionState } from '@/core/state/session.js';
import { $id, $mount, $text, $styleVar, $addClass } from '@/shared/utils/dom.js';
import { Logger } from '@/shared/utils/logger.js';

export const LoginPage = {
    _timers: new Set(),
    _intervals: new Set(),

    render() {
        return renderAuthCardShell({
            title: 'Acceso Corporativo',
            titleId: 'auth-view-title',
            bodyId: 'auth-body-slot',
            bodyHtml: '<div id="login-form-slot"></div>',
            footerId: 'auth-footer-slot',
            footerHtml: '¿No tiene una cuenta? <a href="/auth/register" class="fw-semibold text-decoration-none">Solicitar acceso</a>'
        });
    },

    init() {
        this.destroy();
        Logger.info({ layer: 'UI', role: 'CLASS', target: 'LoginPage', message: 'Vista de acceso inicializada.' });
        this.showLoginView();
    },

    async _switchView(html, newTitle) {
        const slot = $id('auth-body-slot');
        const titleEl = $id('auth-view-title');

        if (slot) {
            slot.classList.remove('auth-view-active');
            slot.classList.add('auth-view-exit');
            await new Promise((r) => {
                const t = setTimeout(() => { this._timers.delete(t); r(); }, 250);
                this._timers.add(t);
            });
            if (titleEl) $text(titleEl, newTitle);
            $mount(slot, html);
            requestAnimationFrame(() => {
                slot.classList.remove('auth-view-exit');
                slot.classList.add('auth-view-active');
            });
        }
    },

    showLoginView() {
        this._switchView('<div id="login-form-slot"></div>', 'Acceso Corporativo').then(() => {
            const innerSlot = $id('login-form-slot');
            if (innerSlot) {
                $mount(innerSlot, LoginForm.render());
                LoginForm.init((data) => {
                    if (data?.mfaRequired) {
                        router.navigate('/auth/two-factor');
                    } else {
                        this.showWelcomeAndLoading(data?.email);
                    }
                });
            }
        });
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
            const interval = setInterval(() => {
                progress += Math.random() * 8;
                if (progress >= steps[currentStep].p) {
                    $text(statusText, steps[currentStep].t);
                    if (currentStep < steps.length - 1) currentStep++;
                }
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    this._intervals.delete(interval);
                    if (bar) $addClass(bar, 'bg-success');
                    const currentUser = sessionState.get().user;
                    const t = setTimeout(() => {
                        this._timers.delete(t);
                        if (!currentUser) {
                            router.navigate('/auth/login');
                            return;
                        }
                        router.navigate(RouterGuards.consumeReturnUrl('/workspace'));
                    }, 600);
                    this._timers.add(t);
                }
                if (bar) $styleVar(bar, 'width', `${progress}%`);
                if (pct) $text(pct, `${Math.floor(progress)}%`);
            }, 100);
            this._intervals.add(interval);
        });
    },

    destroy() {
        LoginForm.destroy();
        for (const t of this._timers) clearTimeout(t);
        for (const i of this._intervals) clearInterval(i);
        this._timers.clear();
        this._intervals.clear();
    }
};

export default LoginPage;
