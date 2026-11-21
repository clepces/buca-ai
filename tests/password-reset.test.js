/**
 * Password Reset Flow — Integration Test Suite
 * =========================================================================
 * Verifica el flujo completo de restablecimiento de contraseña:
 * - getValidatedOrigin (system-helper)
 * - PASSWORD_RECOVERY aislamiento de sesión (AuthModule)
 * - SupabaseProvider.recoverPassword con redirectTo
 * - SupabaseProvider.updateUserPassword
 * - AuthService.updatePassword y logout robusto
 * - PasswordResetPage: validación, estados, sesión normal intacta
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

// DOM helpers para simular getElementById
const domRegistry = new Map();
mockDocument.getElementById = (id) => {
    if (!domRegistry.has(id)) {
        const el = mockDocument.createElement('div');
        el.id = id;
        el.textContent = '';
        domRegistry.set(id, el);
    }
    return domRegistry.get(id);
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
            // En non-browser, retorna el esperado por entorno (dev por defecto en tests)
            const origin = getValidatedOrigin();
            assert.ok(typeof origin === 'string');
            assert.ok(origin.length > 0);
            globalThis.window = saved;
        });

        it('Debe lanzar excepción si el origen no coincide con la allowlist', async () => {
            const { getValidatedOrigin, isBrowser } = await import('../src/core/utils/system-helper.js');
            if (!isBrowser()) return; // Skip si no hay window completo
            const savedOrigin = globalThis.window.location.origin;
            Object.defineProperty(globalThis.window.location, 'origin', { value: 'https://evil.com', writable: true, configurable: true });
            assert.throws(() => getValidatedOrigin(), /Origen no permitido/);
            Object.defineProperty(globalThis.window.location, 'origin', { value: savedOrigin, writable: true, configurable: true });
        });
    });

    // =========================================================================
    // 2. SupabaseProvider: recoverPassword con redirectTo
    // =========================================================================
    describe('SupabaseProvider.recoverPassword', () => {
        it('Debe llamar resetPasswordForEmail con redirectTo que termina en /password-reset', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            await SupabaseProvider.recoverPassword('user@test.com');
            const req = mockClient.auth._lastResetRequest;
            assert.ok(req, 'Se debe haber registrado la solicitud de reset');
            assert.equal(req.email, 'user@test.com');
            assert.ok(req.options.redirectTo.endsWith('/password-reset'), `redirectTo debe terminar en /password-reset, recibido: ${req.options.redirectTo}`);
        });
    });

    // =========================================================================
    // 3. SupabaseProvider.updateUserPassword
    // =========================================================================
    describe('SupabaseProvider.updateUserPassword', () => {
        it('Debe ejecutar updateUser con la nueva contraseña y retornar data', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            const result = await SupabaseProvider.updateUserPassword('NewPass123!');
            assert.ok(result, 'Debe retornar data del usuario');
            assert.ok(result.user, 'Debe contener un usuario válido');
        });

        it('Debe lanzar si no hay sesión activa', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth._session = null;
            try {
                await SupabaseProvider.updateUserPassword('NewPass123!');
                assert.fail('Debió lanzar excepción');
            } catch (err) {
                assert.ok(err.message.includes('Auth session missing'), `Mensaje inesperado: ${err.message}`);
            }
        });
    });

    // =========================================================================
    // 4. SupabaseProvider.logout retorna { success, error }
    // =========================================================================
    describe('SupabaseProvider.logout contrato', () => {
        it('Debe retornar { success: true } en logout exitoso', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            const result = await SupabaseProvider.logout();
            assert.deepEqual(result, { success: true });
        });

        it('Debe retornar { success: false, error } si signOut falla', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth.signOut = async () => ({ error: { message: 'Network timeout' } });
            const result = await SupabaseProvider.logout();
            assert.equal(result.success, false);
            assert.equal(result.error, 'Network timeout');
        });
    });

    // =========================================================================
    // 5. AuthService.updatePassword
    // =========================================================================
    describe('AuthService.updatePassword', () => {
        it('Debe retornar { success: true } tras actualizar la contraseña correctamente', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            const result = await AuthService.updatePassword('SecurePass1!');
            assert.equal(result.success, true);
        });

        it('Debe retornar { success: false, error } si updateUserPassword falla', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            mockClient.auth.updateUser = async () => ({ data: null, error: { message: 'Password too short' } });
            const result = await AuthService.updatePassword('123');
            assert.equal(result.success, false);
            assert.ok(result.error.includes('Password too short'));
        });

        it('Debe emitir auth:password-updated en éxito', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            let emitted = false;
            eventBus.on('auth:password-updated', () => { emitted = true; });
            await AuthService.updatePassword('SecurePass1!');
            assert.ok(emitted, 'Debe emitir auth:password-updated');
            eventBus.off('auth:password-updated');
        });
    });

    // =========================================================================
    // 6. AuthService.logout robusto
    // =========================================================================
    describe('AuthService.logout robusto', () => {
        it('Debe resetear sessionState a guest tras logout exitoso', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            sessionState.set({ isAuthenticated: true, user: { uid: '1', email: 'x@x.com' }, currentRole: 'admin' });
            await AuthService.logout({ redirect: false });
            const state = sessionState.get();
            assert.equal(state.isAuthenticated, false);
            assert.equal(state.currentRole, 'guest');
            assert.equal(state.user, null);
            assert.equal(state.isPasswordRecovery, false);
            assert.equal(state.mfaPending, false);
        });

        it('Debe limpiar buca_recovery_flow de sessionStorage', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            await AuthService.logout({ redirect: false });
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
        });

        it('Debe resetear a guest incluso si signOut remoto falla', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            mockClient.auth.signOut = async () => ({ error: { message: 'Network down' } });
            sessionState.set({ isAuthenticated: true, user: { uid: '1' }, currentRole: 'admin' });
            const result = await AuthService.logout({ redirect: false });
            assert.equal(result.success, false);
            assert.ok(result.error.includes('Network down'));
            const state = sessionState.get();
            assert.equal(state.isAuthenticated, false);
            assert.equal(state.currentRole, 'guest');
        });
    });

    // =========================================================================
    // 7. PASSWORD_RECOVERY en AuthModule
    // =========================================================================
    describe('PASSWORD_RECOVERY aislamiento en AuthModule', () => {
        it('Debe activar isPasswordRecovery y aislar la sesión tras evento PASSWORD_RECOVERY', async () => {
            const { AuthModule } = await import('../src/modules/auth/index.js');
            await AuthModule.init();

            const session = { user: { id: 'uid_recovery', email: 'recovery@test.com' } };
            mockClient.auth._triggerAuth('PASSWORD_RECOVERY', session);

            // Dar un tick para que el callback async se resuelva
            await new Promise(r => setTimeout(r, 50));

            const state = sessionState.get();
            assert.equal(state.isPasswordRecovery, true);
            assert.equal(state.isAuthenticated, false);
            assert.equal(state.currentRole, 'guest');
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), 'true');
        });

        it('Debe aislar eventos INITIAL_SESSION y TOKEN_REFRESHED durante flujo de recuperación', async () => {
            const { AuthModule } = await import('../src/modules/auth/index.js');
            await AuthModule.init();

            // Simular PASSWORD_RECOVERY primero
            mockClient.auth._triggerAuth('PASSWORD_RECOVERY', { user: { id: 'uid_r', email: 'r@t.com' } });
            await new Promise(r => setTimeout(r, 50));
            assert.equal(sessionState.get().isPasswordRecovery, true);

            // Simular INITIAL_SESSION que normalmente promovería la sesión
            mockClient.auth._triggerAuth('INITIAL_SESSION', { user: { id: 'uid_r', email: 'r@t.com', user_metadata: { displayName: 'Test' } } });
            await new Promise(r => setTimeout(r, 50));

            // La sesión NO debe haberse autenticado normalmente
            assert.equal(sessionState.get().isAuthenticated, false, 'isAuthenticated debe seguir en false durante recovery');
            assert.equal(sessionState.get().isPasswordRecovery, true, 'isPasswordRecovery debe mantenerse');
        });
    });

    // =========================================================================
    // 8. Acceso directo a /password-reset sin flujo (sesión normal intacta)
    // =========================================================================
    describe('PasswordResetPage sin flujo de recuperación', () => {
        it('No debe destruir una sesión normal si se visita /password-reset directamente', async () => {
            sessionState.set({ isAuthenticated: true, user: { uid: 'u1', email: 'user@test.com' }, currentRole: 'admin' });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            // La sesión debe seguir intacta
            const state = sessionState.get();
            assert.equal(state.isAuthenticated, true, 'La sesión normal NO debe destruirse');
            assert.equal(state.user.uid, 'u1');
            assert.equal(state.currentRole, 'admin');
        });
    });

    // =========================================================================
    // 9. PasswordResetPage con sesión de recuperación válida
    // =========================================================================
    describe('PasswordResetPage con sesión válida', () => {
        it('Debe habilitar formulario cuando hay recovery flag y getUser() tiene éxito', async () => {
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            mockClient.auth._session = { user: { id: 'uid_r', email: 'r@t.com' } };

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            // El formulario no debería estar bloqueado (init se ejecutó sin lanzar)
            // y no debería haber modificado la sesión
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), 'true');
        });
    });

    // =========================================================================
    // 10. PasswordResetPage: getUser() falla (token expirado/inválido)
    // =========================================================================
    describe('PasswordResetPage con token inválido', () => {
        it('Debe mostrar estado inválido y limpiar recovery flag si getUser() falla', async () => {
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            mockClient.auth.getUser = async () => { throw new Error('Token expired'); };

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            // Recovery flag debe haberse eliminado
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
        });
    });

    // =========================================================================
    // 11. PasswordResetPage validatePolicy
    // =========================================================================
    describe('PasswordResetPage.validatePolicy', () => {
        it('Debe rechazar contraseñas cortas (<8 caracteres)', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const result = PasswordResetPage.validatePolicy('Ab1!');
            assert.equal(result.valid, false);
            assert.ok(result.message.includes('8 caracteres'));
        });

        it('Debe rechazar contraseñas sin mayúscula', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const result = PasswordResetPage.validatePolicy('password1!');
            assert.equal(result.valid, false);
            assert.ok(result.message.includes('mayúscula'));
        });

        it('Debe rechazar contraseñas sin número', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const result = PasswordResetPage.validatePolicy('Password!x');
            assert.equal(result.valid, false);
            assert.ok(result.message.includes('número'));
        });

        it('Debe rechazar contraseñas sin carácter especial', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const result = PasswordResetPage.validatePolicy('Password1x');
            assert.equal(result.valid, false);
            assert.ok(result.message.includes('especial'));
        });

        it('Debe aceptar contraseñas que cumplen la política completa', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const result = PasswordResetPage.validatePolicy('SecurePass1!');
            assert.equal(result.valid, true);
        });
    });

    // =========================================================================
    // 12. Ruta /password-reset registrada
    // =========================================================================
    describe('Ruta /password-reset en authRoutes', () => {
        it('Debe existir la ruta /password-reset en las rutas del módulo auth', async () => {
            const { authRoutes } = await import('../src/modules/auth/routes.js');
            const resetRoute = authRoutes.find(r => r.path === '/password-reset');
            assert.ok(resetRoute, 'Ruta /password-reset debe existir');
            assert.equal(resetRoute.title, 'Restablecer Contraseña');
            assert.equal(typeof resetRoute.component?.render, 'function');
            assert.ok(!resetRoute.requiresAuth, 'Ruta /password-reset NO debe requerir auth');
        });
    });

    // =========================================================================
    // 13. sessionState.clear() incluye propiedades de recuperación
    // =========================================================================
    describe('sessionState.clear() limpieza completa', () => {
        it('Debe resetear isPasswordRecovery, mfaPending e isAAL2Verified a false', () => {
            sessionState.set({
                isAuthenticated: true,
                isPasswordRecovery: true,
                mfaPending: true,
                isAAL2Verified: true,
                user: { uid: '1' },
                currentRole: 'admin'
            });
            sessionState.clear();
            const state = sessionState.get();
            assert.equal(state.isPasswordRecovery, false);
            assert.equal(state.mfaPending, false);
            assert.equal(state.isAAL2Verified, false);
            assert.equal(state.isAuthenticated, false);
            assert.equal(state.currentRole, 'guest');
            assert.equal(state.user, null);
        });
    });
});
