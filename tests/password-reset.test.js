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
    const stateSlot = mockDocument.getElementById('reset-state-slot');
    const form = mockDocument.getElementById('password-reset-form');
    const feedback = mockDocument.getElementById('reset-feedback');
    const successFeedback = mockDocument.getElementById('reset-success-feedback');
    stateSlot._mountedHtml = '';
    const origCreateRange = mockDocument.createRange;
    mockDocument.createRange = () => ({
        createContextualFragment: (html) => {
            stateSlot._lastFragmentHtml = html;
            return { childNodes: [] };
        }
    });
    stateSlot.replaceChildren = () => {
        stateSlot._mountedHtml = stateSlot._lastFragmentHtml || '';
    };
    feedback.classList.add('d-none');
    successFeedback.classList.add('d-none');
    return { stateSlot, form, feedback, successFeedback, restoreRange: () => { mockDocument.createRange = origCreateRange; } };
};

const activateRecoverySession = (mockClient, overrides = {}) => {
    const session = {
        user: { id: 'uid_r', email: 'r@test.com' },
        access_token: 'rec_token_1',
        session_id: 'sid_rec_1',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        amr: [{ method: 'otp', timestamp: Math.floor(Date.now() / 1000) }],
        ...overrides
    };
    mockClient.auth.setSession(session);
    mockClient.auth._triggerAuth('PASSWORD_RECOVERY', session);
    return session;
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

        it('Debe reconocer sesión recovery con amr otp o recovery SOLO cuando existe evidencia PASSWORD_RECOVERY vinculada', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            activateRecoverySession(mockClient, {
                amr: [{ method: 'otp', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), true);

            activateRecoverySession(mockClient, {
                access_token: 'rec_token_2',
                amr: ['recovery']
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), true);
        });

        it('Debe rechazar AMR otp sin evidencia PASSWORD_RECOVERY aunque existan señales auxiliares', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            globalThis.window.location.search = '?type=recovery';
            mockClient.auth.setSession({
                user: { id: 'uid_otp', email: 'otp@test.com' },
                access_token: 'otp_login_token',
                session_id: 'sid_otp_1',
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                amr: [{ method: 'otp', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
            globalThis.window.location.search = '';
        });

        it('Debe rechazar sesión normal (amr password) en isRecoverySession()', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            mockClient.auth.setSession({
                user: { id: 'uid_n', email: 'n@test.com' },
                amr: [{ method: 'password', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
        });

        it('Debe fallar cerrado (false) si getClaims falla o no existe, sin usar AAL como fallback', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            activateRecoverySession(mockClient);
            let aalCalled = false;
            mockClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => {
                aalCalled = true;
                return { data: { currentLevel: 'aal1', nextLevel: 'aal1', currentAuthenticationMethods: ['recovery'] }, error: null };
            };
            mockClient.auth.getClaims = async () => ({ data: null, error: new Error('Invalid JWT') });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
            assert.equal(aalCalled, false);

            delete mockClient.auth.getClaims;
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
            assert.equal(aalCalled, false);
        });

        it('Debe rechazar evidencia obsoleta o sesión cambiada del mismo usuario y tras expiración/SIGNED_OUT', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            activateRecoverySession(mockClient, { access_token: 'tok_a', session_id: 'sid_a' });
            assert.equal(await SupabaseProvider.isRecoverySession(), true);

            // Cambio de sesión del mismo usuario (nuevo access_token / session_id)
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                access_token: 'tok_b',
                session_id: 'sid_b',
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                amr: [{ method: 'otp', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);

            // Evidencia expirada
            activateRecoverySession(mockClient, {
                access_token: 'tok_exp',
                session_id: 'sid_exp',
                expires_at: Math.floor(Date.now() / 1000) - 10
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);

            // Invalidación tras SIGNED_OUT
            activateRecoverySession(mockClient, { access_token: 'tok_so', session_id: 'sid_so' });
            mockClient.auth._triggerAuth('SIGNED_OUT', null);
            mockClient.auth.setSession({
                user: { id: 'uid_r', email: 'r@test.com' },
                access_token: 'tok_so',
                session_id: 'sid_so',
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                amr: [{ method: 'otp', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
        });

        it('Debe fallar cerrado y bloquear updateUser si falta session_id en la prueba inicial o en TOKEN_REFRESHED', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            let updateCalled = false;
            mockClient.auth.updateUser = async () => {
                updateCalled = true;
                return { data: { user: { id: 'uid_r' } }, error: null };
            };

            // 1. session_id ausente en PASSWORD_RECOVERY inicial
            activateRecoverySession(mockClient, { session_id: null });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
            await assert.rejects(() => SupabaseProvider.updateUserPassword('NewPass123!'), /Sesión de recuperación no válida/);
            assert.equal(updateCalled, false);

            // 2. TOKEN_REFRESHED y SIGNED_IN de visibilidad con mismo userId y session_id conservan evidencia
            const validRec = activateRecoverySession(mockClient, { session_id: 'sid_keep' });
            mockClient.auth._triggerAuth('TOKEN_REFRESHED', { ...validRec });
            mockClient.auth._triggerAuth('SIGNED_IN', { ...validRec });
            assert.equal(await SupabaseProvider.isRecoverySession(), true);

            // 2b. SIGNED_IN de nueva sesión (session_id distinto) invalida la evidencia
            mockClient.auth._triggerAuth('SIGNED_IN', { ...validRec, session_id: 'sid_other' });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);

            // 3. TOKEN_REFRESHED sin session_id invalida la evidencia previa
            mockClient.auth._triggerAuth('TOKEN_REFRESHED', {
                user: { id: 'uid_r', email: 'r@test.com' },
                expires_at: Math.floor(Date.now() / 1000) + 3600,
                amr: [{ method: 'otp', timestamp: 1700000000 }]
            });
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
            await assert.rejects(() => SupabaseProvider.updateUserPassword('NewPass123!'), /Sesión de recuperación no válida/);
            assert.equal(updateCalled, false);
        });
    });

    // =========================================================================
    // 3. SupabaseProvider.updateUserPassword & AuthService.updatePassword
    // =========================================================================
    describe('Protección de updateUserPassword y updatePassword', () => {
        it('Debe rechazar updateUserPassword si la sesión es normal o OTP sin recovery, sin llamar updateUser', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            let updateCalled = false;
            mockClient.auth.updateUser = async () => {
                updateCalled = true;
                return { data: { user: { id: 'mock_uid_1' } }, error: null };
            };
            mockClient.auth.setSession({
                user: { id: 'uid_otp', email: 'otp@test.com' },
                amr: [{ method: 'otp', timestamp: 1700000000 }]
            });
            await assert.rejects(
                () => SupabaseProvider.updateUserPassword('NewPass123!'),
                /Sesión de recuperación no válida/
            );
            assert.equal(updateCalled, false);
        });

        it('Debe ejecutar updateUser con nueva contraseña solo en sesión recovery verificada e invalidar proof', async () => {
            const { SupabaseProvider } = await import('../src/modules/auth/services/SupabaseProvider.js');
            activateRecoverySession(mockClient);
            const result = await SupabaseProvider.updateUserPassword('NewPass123!');
            assert.equal(result.user.id, 'uid_r');
            assert.equal(await SupabaseProvider.isRecoverySession(), false);
        });

        it('AuthService.updatePassword debe retornar error si updateUser falla en SDK', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            activateRecoverySession(mockClient);
            mockClient.auth.updateUser = async () => ({ data: null, error: new Error('Password too short') });
            const result = await AuthService.updatePassword('123');
            assert.equal(result.success, false);
            assert.ok(result.error.includes('Password too short'));
        });

        it('AuthService.updatePassword debe emitir auth:password-updated en éxito', async () => {
            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            activateRecoverySession(mockClient);
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
            activateRecoverySession(mockClient);

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
        it('Debe capturar PASSWORD_RECOVERY emitido antes de AuthModule.init() y aislar INITIAL_SESSION sin retener AAL2', async () => {
            mockClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({
                data: { currentLevel: 'aal1', nextLevel: 'aal2', currentAuthenticationMethods: ['otp'] },
                error: null
            });

            // Evento emitido antes de que AuthModule registre su listener
            const recSession = activateRecoverySession(mockClient);

            const { AuthModule } = await import('../src/modules/auth/index.js');
            await AuthModule.init();
            mockClient.auth._triggerAuth('INITIAL_SESSION', recSession);
            await new Promise(r => setTimeout(r, 30));

            assert.equal(sessionState.get().isPasswordRecovery, true);
            assert.equal(sessionState.get().mfaPending, false);
            assert.equal(sessionState.get().isAuthenticated, false);
        });

        it('Debe aislar MFA_CHALLENGE_VERIFIED durante recovery incluso sin buca_recovery_flow en sessionStorage', async () => {
            const { AuthModule } = await import('../src/modules/auth/index.js');
            await AuthModule.init();

            const recSession = activateRecoverySession(mockClient, { session_id: 'sid_mfa_rec' });
            globalThis.sessionStorage.removeItem('buca_recovery_flow');

            mockClient.auth._triggerAuth('MFA_CHALLENGE_VERIFIED', recSession);
            await new Promise(r => setTimeout(r, 30));

            assert.equal(sessionState.get().isPasswordRecovery, true);
            assert.equal(sessionState.get().isAuthenticated, false);
            assert.equal(await (await import('../src/modules/auth/services/SupabaseProvider.js')).SupabaseProvider.isRecoverySession(), true);
        });

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
            const { stateSlot, restoreRange } = setupResetPageDom();
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            sessionState.set({
                isAuthenticated: true,
                isPasswordRecovery: true,
                user: { uid: 'u1', email: 'user@test.com' },
                currentRole: 'admin'
            });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), false, 'Formulario NO debe montarse para sesión normal');
            assert.equal(stateSlot._mountedHtml.includes('reset-invalid'), true, 'Debe montarse estado inválido');
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isAuthenticated, true, 'Sesión normal NO debe destruirse');
            assert.equal(sessionState.get().isPasswordRecovery, false);
        });

        it('Debe habilitar formulario solo con sesión recovery válida verificada por el SDK', async () => {
            const { stateSlot, restoreRange } = setupResetPageDom();
            activateRecoverySession(mockClient);

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('reset-invalid'), false);
            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), true, 'Formulario debe montarse en sesión recovery válida');
        });

        it('Tras recarga (pérdida de evidencia en memoria) debe bloquear formulario aunque persista buca_recovery_flow', async () => {
            const { stateSlot, restoreRange } = setupResetPageDom();
            activateRecoverySession(mockClient);

            // Simular recarga: nuevo cliente en memoria conservando sesión en storage y flag auxiliar
            const persistedSession = mockClient.auth._session;
            const reloadedClient = createMockSupabaseClient();
            reloadedClient.auth.setSession(persistedSession);
            setMockSupabase(reloadedClient);
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            sessionState.set({ isPasswordRecovery: true });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), false);
            assert.equal(stateSlot._mountedHtml.includes('reset-invalid'), true);
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isPasswordRecovery, false);
        });

        it('Debe mostrar estado inválido y limpiar flags si el token expiró (getUser falla)', async () => {
            const { stateSlot, restoreRange } = setupResetPageDom();
            globalThis.sessionStorage.setItem('buca_recovery_flow', 'true');
            sessionState.set({ isPasswordRecovery: true });
            mockClient.auth.getUser = async () => ({ data: { user: null }, error: new Error('JWT expired') });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), false);
            assert.equal(stateSlot._mountedHtml.includes('reset-invalid'), true);
            assert.equal(globalThis.sessionStorage.getItem('buca_recovery_flow'), null);
            assert.equal(sessionState.get().isPasswordRecovery, false);
        });

        it('Submit con error de updateUser debe mostrar feedback de error y reactivar botón', async () => {
            const { form, feedback, restoreRange } = setupResetPageDom();
            activateRecoverySession(mockClient);
            mockClient.auth.updateUser = async () => ({ data: null, error: new Error('New password should be different') });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();
            restoreRange();

            mockDocument.getElementById('reset-new-password').value = 'SecurePass1!';
            mockDocument.getElementById('reset-confirm-password').value = 'SecurePass1!';
            form.dispatchEvent({ type: 'submit', preventDefault: () => {} });
            await new Promise(r => setTimeout(r, 30));

            assert.equal(feedback.classList.contains('d-none'), false);
            assert.ok(feedback.textContent.includes('different'));
            assert.equal(mockDocument.getElementById('btn-reset-submit').disabled, false);
        });

        it('Con MFA activo (AAL1 -> AAL2) debe mostrar PinForm oficial y habilitar nueva contraseña tras verificar TOTP', async () => {
            const { stateSlot, restoreRange } = setupResetPageDom();
            activateRecoverySession(mockClient, { session_id: 'sid_mfa_1' });
            mockClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({
                data: { currentLevel: 'aal1', nextLevel: 'aal2', currentAuthenticationMethods: [{ method: 'otp' }] },
                error: null
            });
            mockClient.auth.mfa.listFactors = async () => ({
                data: { totp: [{ id: 'totp_unverified', status: 'unverified' }, { id: 'totp_verified', status: 'verified' }], all: [] },
                error: null
            });

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('btn-verify-pin'), true, 'Debe montar PinForm oficial');
            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), false, 'No debe montar password form antes de TOTP');

            const { AuthService } = await import('../src/modules/auth/services/AuthService.js');
            const badRes = await AuthService.verifyRecoveryMFA('totp_verified', '000000');
            assert.equal(badRes.success, false);
            assert.equal(await (await import('../src/modules/auth/services/SupabaseProvider.js')).SupabaseProvider.isRecoverySession(), true);

            const okRes = await AuthService.verifyRecoveryMFA('totp_verified', '123456');
            assert.equal(okRes.success, true);
        });

        it('RouterGuards debe sanitizar returnUrl, validar roles y proteger rutas guestOnly y /auth/two-factor', async () => {
            const { RouterGuards } = await import('../src/core/router/guards.js');
            assert.equal(RouterGuards.sanitizeReturnUrl('https://evil.com'), '/');
            assert.equal(RouterGuards.sanitizeReturnUrl('//evil.com'), '/');
            assert.equal(RouterGuards.sanitizeReturnUrl('/workspace/home'), '/workspace/home');

            // Conserva ruta protegida previa y vuelve a /workspace por defecto cuando no hay returnUrl
            RouterGuards.setReturnUrl('/finance/rates');
            assert.equal(RouterGuards.consumeReturnUrl('/workspace'), '/finance/rates');
            assert.equal(RouterGuards.consumeReturnUrl('/workspace'), '/workspace');
            RouterGuards.setReturnUrl('https://evil.com');
            assert.equal(RouterGuards.consumeReturnUrl('/workspace'), '/workspace');

            // /auth/two-factor bloqueado sin mfaPending antes de renderizar
            sessionState.set({ isPasswordRecovery: false, isAuthenticated: false, mfaPending: false });
            assert.equal(RouterGuards.resolveStateRedirect({ path: '/auth/two-factor' }), '/auth/login');
            sessionState.set({ mfaPending: true });
            assert.equal(RouterGuards.resolveStateRedirect({ path: '/auth/two-factor' }), null);
            assert.equal(RouterGuards.resolveStateRedirect({ path: '/auth/login', guestOnly: true }), '/auth/two-factor');

            sessionState.set({ isPasswordRecovery: true, isAuthenticated: false, mfaPending: false });
            assert.equal(RouterGuards.resolveStateRedirect({ path: '/auth/login', guestOnly: true }), '/auth/recovery/reset-password');
            sessionState.set({ isPasswordRecovery: false, isAuthenticated: true, mfaPending: false, currentRole: 'user' });
            assert.equal(RouterGuards.resolveStateRedirect({ path: '/auth/login', guestOnly: true }), '/workspace');
            assert.equal(RouterGuards.requiresRole(['admin']), false);
            assert.equal(RouterGuards.requiresRole(['user', 'admin']), true);
        });

        it('Submit exitoso debe actualizar contraseña, ejecutar logout y cancelar timer en destroy()', async () => {
            const { stateSlot, form, restoreRange } = setupResetPageDom();
            activateRecoverySession(mockClient);

            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            await PasswordResetPage.init();

            mockDocument.getElementById('reset-new-password').value = 'SecurePass1!';
            mockDocument.getElementById('reset-confirm-password').value = 'SecurePass1!';
            form.dispatchEvent({ type: 'submit', preventDefault: () => {} });
            await new Promise(r => setTimeout(r, 30));
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('reset-completed'), true);
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
            const { stateSlot, restoreRange } = setupResetPageDom();

            sessionState.set({
                isAuthenticated: true,
                user: { uid: 'user_norm', email: 'normal@test.com' },
                currentRole: 'user'
            });

            mockClient.auth.setSession(null);
            globalThis.window.location.hash = '#error=access_denied&error_code=otp_expired';

            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), false);
            assert.equal(stateSlot._mountedHtml.includes('reset-invalid'), true);
            assert.ok(stateSlot._mountedHtml.includes('utilizado o ha expirado'));
            // Sesión normal se conserva porque el usuario no solicitó logout
            assert.equal(sessionState.get().isAuthenticated, true);
            assert.equal(sessionState.get().isPasswordRecovery, false);
            assert.equal(mockClient.auth._lastSignOutCalls.length, 0);
            globalThis.window.location.hash = '';
        });

        it('Sesión normal con claims sin recovery no debe habilitar formulario de recuperación', async () => {
            const { PasswordResetPage } = await import('../src/modules/auth/pages/password-reset-page.js');
            const { stateSlot, restoreRange } = setupResetPageDom();

            mockClient.auth.setSession({
                user: { id: 'user_normal', email: 'normal@test.com' },
                amr: [{ method: 'password', timestamp: 1700000000 }]
            });

            await PasswordResetPage.init();
            restoreRange();

            assert.equal(stateSlot._mountedHtml.includes('password-reset-form'), false);
            assert.equal(stateSlot._mountedHtml.includes('reset-invalid'), true);
        });
    });
});
