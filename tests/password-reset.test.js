/**
 * Password Reset Flow — Integration Test Suite
 * =========================================================================
 * Verifica el flujo completo de restablecimiento de contraseña:
 * - getValidatedOrigin (system-helper)
 * - SupabaseProvider.isRecoverySession (claims SDK amr: AMREntry[] / string[])
 * - Arranque y checkSession en /password-reset (aislamiento de recovery)
 * - Rechazo estricto de sesión normal incluso con flags residuales
 * - PASSWORD_RECOVERY, INITIAL_SESSION, TOKEN_REFRESHED y SIGNED_OUT (AuthModule)
 * - Login posterior tras recovery abortado
 * - PasswordResetPage: DOM real (d-none), submit, errores de updateUser y logout
 * - SessionState.clear(): eliminación de propiedades residuales y notificaciones
 * - Layout 'auth' en /password-reset sin afectar otras rutas
 * =========================================================================
 */
import './dom-shim.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockDocument } from './dom-shim.js';
import { setMockSupabase } from '../src/core/config/supabase.js';
import { createMockSupabaseClient } from './mocks/supabase.mock.js';
import { sessionState } from '../src/core/state/session.js';
import { eventBus } from '../src/core/eventBus/index.js';

const domRegistry = new Map();
mockDocument.getElementById = (id) => {
    if (!domRegistry.has(id)) {
        const el = mockDocument.createElement('div');
        el.id = id;
        el.textContent = '';
        el.value = '';
        el.disabled = false;
        domRegistry.set(id, el);
    }
    return domRegistry.get(id);
};

const setupResetPageDom = () => {
    const validating = mockDocument.getElementById('reset-validating');
    const invalid = mockDocument.getElementById('reset-invalid');
    const form = mockDocument.getElementById('password-reset-form');
    const feedback = mockDocument.getElementById('reset-feedback');
    const successFeedback = mockDocument.getElementById('reset-success-feedback');
    invalid.classList.add('d-none');
    form.classList.add('d-none');
    feedback.classList.add('d-none');
    successFeedback.classList.add('d-none');
    return { validating, invalid, form, feedback, successFeedback };
};

describe('Password Reset Flow Suite', () => {
    let mockClient;

    beforeEach(() => {
        domRegistry.clear();
        mockClient = createMockSupabaseClient();
        setMockSupabase(mockClient);
        sessionState.clear();
        globalThis.sessionStorage = {
            _store: new Map(),
            getItem(k) { return this._store.get(k) ?? null; },
            setItem(k, v) { this._store.set(k, String(v)); },
            removeItem(k) { this._store.delete(k); },
            clear() { this._store.clear(); }
        };
    });

    // =========================================================================
    // 1. getValidatedOrigin
    // =========================================================================
    describe('getValidatedOrigin', () => {
        it('Debe retornar el origen en entorno no-browser sin lanzar excepción', async () => {
            const saved = globalThis.window;
            globalThis.window = undefined;
            const { getValidatedOrigin } = await import('../src/core/utils/system-helper.js');
            const origin = getValidatedOrigin();
            assert.ok(typeof origin === 'string' && origin.length > 0);
            globalThis.window = saved;
        });

        it('Debe lanzar excepción si el origen no coincide con la allowlist', async () => {
            const { getValidatedOrigin, isBrowser } = await import('../src/core/utils/system-helper.js');
            if (!isBrowser()) return;
            const savedOrigin = globalThis.window.location.origin;
            Object.defineProperty(globalThis.window.location, 'origin', { value: 'https://evil.com', writable: true, configurable: true });
            assert.throws(() => getValidatedOrigin(), /Origen no permitido/);
            Object.defineProperty(globalThis.window.location, 'origin', { value: savedOrigin, writable: true, configurable: true });
        });
    });

    // =========================================================================
    // 2. SupabaseProvider: recoverPassword e isRecoverySession
    // =========================================================================
    describe('SupabaseProvider recovery claims', () => {
        it('Debe llamar resetPasswordForEmail con redirectTo que termina en /auth/recovery/reset-password', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            await SupabaseProvider.recoverPassword('user@test.com');
            const req = mockClient.auth._lastResetRequest;
            assert.ok(req);
            assert.equal(req.email, 'user@test.com');
            assert.ok(req.options.redirectTo.endsWith('/auth/recovery/reset-password'));
        });

        it('Debe reconocer sesión recovery con amr en formato AMREntry[] y string[]', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), true);

            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                amr: ['recovery']
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), true);
        });

        it('Debe rechazar sesión normal (amr password) en isRecoverySession()', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth.setSession({
                user: { id: 'uid_n', email: 'n@test.com' },
                amr: [{ method: 'password', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
        });

        it('Debe fallar cerrado (false) si getClaims y getAuthenticatorAssuranceLevel fallan', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth.getClaims = async () => ({ data: null, error: new Error('Invalid JWT') });
            mockClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({ data: null, error: new Error('AAL error') });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
        });
    });

    // =========================================================================
    // 3. SupabaseProvider.updateUserPassword & AuthService.updatePassword
    // =========================================================================
    describe('Protección de updateUserPassword y updatePassword', () => {
        it('Debe rechazar updateUserPassword si la sesión es normal (no recovery)', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            await assert.rejects(
                () => SupabaseProvider.updateUserPassword('NewPass123!'),
                /Sesión de recuperación no válida/
            );
        });

        it('Debe ejecutar updateUser con nueva contraseña solo en sesión recovery verificada', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });
            const result = await SupabaseProvider.updateUserPassword('NewPass123!');
            assert.equal(result.user.id, 'uid_r');
        });

        it('AuthService.updatePassword debe retornar error si updateUser falla en SDK', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });
            mockClient.auth.updateUser = async () => ({ data: null, error: new Error('Password too short') });
            const result = await AuthService.updatePassword('123');
            assert.equal(result.success, false);
            assert.ok(result.error.includes('Password too short'));
        });

        it('AuthService.updatePassword debe emitir auth:password-updated en éxito', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });
            let emitted = false;
            eventBus.on('auth:password-updated', () => { emitted = true; });
            const res = await AuthService.updatePassword('SecurePass1!');
            assert.equal(res.success, true);
            assert.ok(emitted);
            eventBus.off('auth:password-updated');
        });
    });

    // =========================================================================
    // 4. Arranque en /auth/recovery/reset-password y AuthService.checkSession()
    // =========================================================================
    describe('Arranque y checkSession en /auth/recovery/reset-password', () => {
        it('checkSession() no debe promover una sesión recovery a isAuthenticated: true', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });

            const check = await AuthService.checkSession();
            assert.equal(check.isAuthenticated, false);
            assert.equal(check.isPasswordRecovery, true);
            const state = sessionState.get();
            assert.equal(state.isAuthenticated, false);
            assert.equal(state.isPasswordRecovery, true);
            assert.equal(state.currentRole, 'guest');
            assert.equal(state.user, null);
        });

        it('Kernel.boot() en /auth/recovery/reset-password no debe redirigir a /auth/login ni cargar módulos workspace', async () => {
            mockClient.auth.setSession(null);
            mockDocument.documentElement = mockDocument.createElement('html');
            const prevIdb = globalThis.indexedDB;
            const prevRaf = globalThis.requestAnimationFrame;
            const prevCancelRaf = globalThis.cancelAnimationFrame;
            const rafTimers = new Set();
            globalThis.requestAnimationFrame = (fn) => {
                const id = setTimeout(() => { rafTimers.delete(id); fn(); }, 0);
                rafTimers.add(id);
                return id;
            };
            globalThis.cancelAnimationFrame = (id) => {
                rafTimers.delete(id);
                clearTimeout(id);
            };
            globalThis.indexedDB = {
                open: () => {
                    const req = { result: { objectStoreNames: { contains: () => true }, transaction: () => ({ objectStore: () => ({ get: () => { const r = {}; queueMicrotask(() => r.onsuccess?.()); return r; } }) }) } };
                    queueMicrotask(() => req.onsuccess?.({ target: req }));
                    return req;
                }
            };
            globalThis.window.location.pathname = '/auth/recovery/reset-password';
            const { default: kernel } = await import('../src/core/kernel.js');
            try {
                kernel.destroy();
                await kernel.boot();
                assert.equal(globalThis.window.location.pathname, '/auth/recovery/reset-password');
                assert.equal(kernel.currentLayoutMode, 'auth');
            } finally {
                kernel.destroy();
                for (const id of rafTimers) clearTimeout(id);
                rafTimers.clear();
                globalThis.window.location.pathname = '/';
                globalThis.indexedDB = prevIdb;
                globalThis.requestAnimationFrame = prevRaf;
                globalThis.cancelAnimationFrame = prevCancelRaf;
            }
        });
    });

    // =========================================================================
    // 5. Logout robusto y limpieza de SessionState
    // =========================================================================
    describe('AuthService.logout y SessionState.clear()', () => {
        it('Debe intentar signOut({ scope: "local" }) cuando falla el cierre remoto y resetear a guest', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            let calls = [];
            mockClient.auth.signOut = async (opts = {}) => {
                calls.push(opts);
                if (opts.scope === 'local') {
                    mockClient.auth._session = null;
                    return { error: null };
                }
                return { error: new Error('Network down') };
            };
            sessionState.set({ isAuthenticated: true, user: { uid: '1' }, currentRole: 'admin' });

            const result = await AuthService.logout({ redirect: false });
            assert.equal(result.success, false);
            assert.ok(result.error.includes('Network down'));
            assert.equal(calls.length, 2);
            assert.equal(calls[1].scope, 'local');
            assert.equal(sessionState.get().isAuthenticated, false);
            assert.equal(sessionState.get().currentRole, 'guest');
        });

        it('SessionState.clear() debe eliminar propiedades residuales y conservar notificaciones', async () => {
            let notifiedStates = [];
            const unsub = sessionState.subscribe((s) => notifiedStates.push(s));
            sessionState.set({
                isAuthenticated: true,
                isPasswordRecovery: true,
                mfaPending: true,
                isAAL2Verified: true,
                user: { uid: '1' },
                currentRole: 'admin',
                residualCustomKey: 'should_be_removed'
            });

            sessionState.clear();
            await new Promise(r => setTimeout(r, 10));
            unsub();

            const state = sessionState.get();
            assert.equal(state.isPasswordRecovery, false);
            assert.equal(state.mfaPending, false);
            assert.equal(state.isAAL2Verified, false);
            assert.equal(state.isAuthenticated, false);
            assert.equal(state.currentRole, 'guest');
            assert.equal(state.user, null);
            assert.equal('residualCustomKey' in state, false);
            assert.ok(notifiedStates.length >= 2, 'Debe notificar a suscriptores al limpiar');
            assert.equal(notifiedStates[notifiedStates.length - 1].currentRole, 'guest');
        });
    });

    // =========================================================================
    // 6. Ciclo de Eventos en AuthModule (PASSWORD_RECOVERY, TOKEN_REFRESHED, SIGNED_OUT, Login)
    // =========================================================================
    describe('AuthModule ciclo de eventos de recuperación', () => {
        it('Debe aislar INITIAL_SESSION y TOKEN_REFRESHED durante PASSWORD_RECOVERY', async () => {
            const { AuthModule } = await import('../src/modules/auth/index.js');
            await AuthModule.init();

            const recSession = { user: { id: 'uid_r', email: 'r@t.com' }, amr: [{ method: 'recovery' }] };
            mockClient.auth._triggerAuth('PASSWORD_RECOVERY', recSession);
            await new Promise(r => setTimeout(r, 30));

            assert.equal(sessionState.get().isPasswordRecovery, true);
            assert.equal(sessionState.get().isAuthenticated, false);

            mockClient.auth._triggerAuth('INITIAL_SESSION', recSession);
            mockClient.auth._triggerAuth('TOKEN_REFRESHED', recSession);
            await new Promise(r => setTimeout(r, 30));

            assert.equal(sessionState.get().isAuthenticated, false);
            assert.equal(sessionState.get().isPasswordRecovery, true);
        });

        it('Debe limpiar flujo de recuperación en SIGNED_OUT incluso si buca_recovery_flow está activo', async () => {
            const { AuthModule } = await import('../src/modules/auth/index.js');
            await AuthModule.init();

            mockClient.auth._triggerAuth('PASSWORD_RECOVERY', { user: { id: 'uid_r', email: 'r@t.com' } });
            await new Promise(r => setTimeout(r, 30));
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), 'true');

            mockClient.auth._triggerAuth('SIGNED_OUT', null);
            await new Promise(r => setTimeout(r, 30));

            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isPasswordRecovery, false);
            assert.equal(sessionState.get().isAuthenticated, false);
        });

        it('Login posterior tras recovery abortado debe limpiar flags y permitir sesión normal', async () => {
            const { AuthModule } = await import('../src/modules/auth/index.js');
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            await AuthModule.init();

            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            sessionState.set({ isPasswordRecovery: true });

            const loginRes = await AuthService.login('user@buca.com', 'ValidPass1!');
            assert.equal(loginRes.success, true);
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isPasswordRecovery, false);
            assert.equal(sessionState.get().isAuthenticated, true);
        });
    });

    // =========================================================================
    // 7. PasswordResetPage: DOM real, sesión normal rechazada, expiración y submit
    // =========================================================================
    describe('PasswordResetPage comportamiento real DOM y seguridad', () => {
        it('Debe rechazar sesión normal aunque buca_recovery_flow e isPasswordRecovery estén en true, conservando sesión normal', async () => {
            const { validating, invalid, form } = setupResetPageDom();
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            sessionState.set({
                isAuthenticated: true,
                isPasswordRecovery: true,
                user: { uid: 'u1', email: 'user@test.com' },
                currentRole: 'admin'
            });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            assert.equal(validating.classList.contains('d-none'), true);
            assert.equal(form.classList.contains('d-none'), true, 'Formulario NO debe mostrarse para sesión normal');
            assert.equal(invalid.classList.contains('d-none'), false, 'Debe mostrarse estado inválido');
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isAuthenticated, true, 'Sesión normal NO debe destruirse');
            assert.equal(sessionState.get().isPasswordRecovery, false);
        });

        it('Debe habilitar formulario solo con sesión recovery válida verificada por el SDK', async () => {
            const { validating, invalid, form } = setupResetPageDom();
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@t.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            assert.equal(validating.classList.contains('d-none'), true);
            assert.equal(invalid.classList.contains('d-none'), true);
            assert.equal(form.classList.contains('d-none'), false, 'Formulario debe mostrarse en sesión recovery válida');
        });

        it('Debe mostrar estado inválido y limpiar flags si el token expiró (getUser falla)', async () => {
            const { validating, invalid, form } = setupResetPageDom();
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            sessionState.set({ isPasswordRecovery: true });
            mockClient.auth.getUser = async () => ({ data: { user: null }, error: new Error('JWT expired') });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            assert.equal(validating.classList.contains('d-none'), true);
            assert.equal(form.classList.contains('d-none'), true);
            assert.equal(invalid.classList.contains('d-none'), false);
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isPasswordRecovery, false);
        });

        it('Submit con error de updateUser debe mostrar feedback de error y reactivar botón', async () => {
            const { form, feedback } = setupResetPageDom();
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@t.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });
            mockClient.auth.updateUser = async () => ({ data: null, error: new Error('New password should be different') });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            mockDocument.getElementById('reset-new-password').value = 'SecurePass1!';
            mockDocument.getElementById('reset-confirm-password').value = 'SecurePass1!';
            form.dispatchEvent({ type: 'submit', preventDefault: () => {} });
            await new Promise(r => setTimeout(r, 30));

            assert.equal(feedback.classList.contains('d-none'), false);
            assert.ok(feedback.textContent.includes('different'));
            assert.equal(mockDocument.getElementById('btn-reset-submit').disabled, false);
        });

        it('Submit exitoso debe actualizar contraseña, ejecutar logout y cancelar timer en destroy()', async () => {
            const { form, successFeedback } = setupResetPageDom();
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@t.com' },
                amr: [{ method: 'recovery', timestamp: 1700000000 }]
            });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            mockDocument.getElementById('reset-new-password').value = 'SecurePass1!';
            mockDocument.getElementById('reset-confirm-password').value = 'SecurePass1!';
            form.dispatchEvent({ type: 'submit', preventDefault: () => {} });
            await new Promise(r => setTimeout(r, 30));

            assert.equal(form.classList.contains('d-none'), true);
            assert.equal(successFeedback.classList.contains('d-none'), false);
            assert.equal(sessionState.get().isAuthenticated, false);
            assert.ok(PasswordResetPage._redirectTimer !== null);
            PasswordResetPage.destroy();
            assert.equal(PasswordResetPage._redirectTimer, null);
        });
    });

    // =========================================================================
    // 8. Ruta y Layout explícito de /auth/recovery/reset-password
    // =========================================================================
    describe('Ruta /auth/recovery/reset-password y selección de layout', () => {
        it('Debe definir layout: "auth" sin afectar otras rutas', async () => {
            const { authRoutes } = await import('../src/modules/auth/routes.js');
            const { routes: coreRoutes } = await import('../src/core/router/routes.js');
            const resetRoute = authRoutes.find(r => r.path === '/auth/recovery/reset-password');
            assert.ok(resetRoute);
            assert.equal(resetRoute.layout, 'auth');
            assert.ok(!resetRoute.requiresAuth);
            const homeRoute = coreRoutes.find(r => r.path === '/');
            assert.ok(!homeRoute?.layout || homeRoute.layout !== 'auth');
        });

        it('Router debe resolver /auth/recovery/reset-password en AuthLayout sin cargar workspace ni 404', async () => {
            const { router } = await import('../src/core/router/router.js');
            const { routes: coreRoutes } = await import('../src/core/router/routes.js');
            const { default: ModuleLoader } = await import('../src/core/ModuleLoader.js');
            globalThis.window.location.pathname = '/auth/recovery/reset-password';
            await router.init(coreRoutes);
            assert.equal(router.currentPath, '/auth/recovery/reset-password');
            assert.ok(router.currentRoute);
            assert.equal(router.currentRoute.path, '/auth/recovery/reset-password');
            assert.equal(ModuleLoader.isLoaded('workspace'), false);
        });
    });

    // =========================================================================
    // 9. Política de contraseñas
    // =========================================================================
    describe('PasswordResetPage.validatePolicy', () => {
        it('Debe rechazar contraseñas inválidas y aceptar política completa', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            assert.equal(PasswordResetPage.validatePolicy('Ab1!').valid, false);
            assert.equal(PasswordResetPage.validatePolicy('password1!').valid, false);
            assert.equal(PasswordResetPage.validatePolicy('Password!x').valid, false);
            assert.equal(PasswordResetPage.validatePolicy('Password1x').valid, false);
            assert.equal(PasswordResetPage.validatePolicy('SecurePass1!').valid, true);
        });
    });

    // =========================================================================
    // 10. Protección de sesión normal y enlace expirado en navegación directa
    // =========================================================================
    describe('Navegación directa con enlace expirado o sesión normal', () => {
        it('Enlace expirado (otp_expired) debe mostrar feedback sin alterar sesión normal preexistente', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const { form, invalid } = setupResetPageDom();
            const invalidMsg = mockDocument.getElementById('reset-invalid-message');

            sessionState.set({
                isAuthenticated: true,
                user: { uid: 'user_norm', email: 'normal@test.com' },
                currentRole: 'user'
            });

            mockClient.auth.setSession(null);
            globalThis.window.location.hash = '#error=access_denied&error_code=otp_expired';

            await PasswordResetPage.init();

            assert.equal(form.classList.contains('d-none'), true);
            assert.equal(invalid.classList.contains('d-none'), false);
            assert.ok(invalidMsg.textContent.includes('utilizado o ha expirado'));
            // Sesión normal se conserva porque el usuario no solicitó logout
            assert.equal(sessionState.get().isAuthenticated, true);
            assert.equal(sessionState.get().isPasswordRecovery, false);
        });

        it('Sesión normal con claims sin recovery no debe habilitar formulario de recuperación', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const { form, invalid } = setupResetPageDom();

            mockClient.auth.setSession({
                user: { id: 'user_normal', email: 'normal@test.com' },
                amr: [{ method: 'password', timestamp: 1700000000 }]
            });

            await PasswordResetPage.init();

            assert.equal(form.classList.contains('d-none'), true);
            assert.equal(invalid.classList.contains('d-none'), false);
        });
    });
});
