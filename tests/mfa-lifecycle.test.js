import './dom-shim.js';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockDocument } from './dom-shim.js';
import { setMockSupabase } from '../src/core/config/supabase.js';
import { createMockSupabaseClient } from './mocks/supabase.mock.js';
import { AuthService } from '../src/modules/auth/services/AuthService.js';
import { MFAEnrollmentModal } from '../src/modules/profile/components/MFAEnrollmentModal.js';
import { ModalService } from '../src/shared/ui/services/ModalService.js';
import { eventBus } from '../src/core/eventBus/index.js';
import { sessionState } from '../src/core/state/session.js';
import { AuthModule } from '../src/modules/auth/index.js';
import { RouterGuards } from '../src/core/router/guards.js';

if (!mockDocument.documentElement) {
    mockDocument.documentElement = mockDocument.createElement('html');
    mockDocument.documentElement.clientWidth = 1280;
}
const origCreateElement = mockDocument.createElement;
mockDocument.createElement = (tag) => {
    const el = origCreateElement(tag);
    el.querySelector = () => null;
    el.querySelectorAll = () => [];
    return el;
};

const domRegistry = new Map();
mockDocument.getElementById = (id) => {
    if (!domRegistry.has(id)) {
        const el = mockDocument.createElement('div');
        el.id = id;
        domRegistry.set(id, el);
    }
    return domRegistry.get(id);
};

const createDeferred = () => {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
};

describe('MFA Lifecycle, Race Conditions & Selective Revocation Suite', () => {
    let mockClient;
    let unenrolledFactors = [];
    let authStateCallback = null;

    beforeEach(() => {
        domRegistry.clear();
        unenrolledFactors = [];
        mockClient = createMockSupabaseClient();
        mockClient.auth.onAuthStateChange = (cb) => {
            authStateCallback = cb;
            return { data: { subscription: { unsubscribe: () => {} } } };
        };
        mockClient.auth.mfa.unenroll = async ({ factorId }) => {
            unenrolledFactors.push(factorId);
            return { data: { id: factorId }, error: null };
        };
        setMockSupabase(mockClient);

        sessionState.set({
            isAuthenticated: true, isAAL2Verified: false, mfaPending: false,
            user: { uid: 'mock_uid_1', email: 'tester@buca.com', displayName: 'Tester BUCA' },
            currentRole: 'user'
        });

        MFAEnrollmentModal._currentAttempt = null;
        MFAEnrollmentModal._orphanFactorsToPurge.clear();
        MFAEnrollmentModal._purgingFactors.clear();
        ModalService.destroy();
    });

    it('1. confirmTOTPEnrollment NO debe emitir auth:login-success pero sí activar isAAL2Verified', async () => {
        let loginSuccessFired = false;
        const unsubscribe = eventBus.on('auth:login-success', () => { loginSuccessFired = true; });
        const res = await AuthService.confirmTOTPEnrollment('mock_factor_1', '123456');
        unsubscribe();
        assert.equal(res.success, true);
        assert.equal(loginSuccessFired, false);
        assert.equal(sessionState.get().isAAL2Verified, true);
        assert.equal(sessionState.get().mfaPending, false);
    });

    it('2. verifyMFAChallenge SÍ debe emitir auth:login-success durante login real', async () => {
        let loginSuccessPayload = null;
        const unsubscribe = eventBus.on('auth:login-success', (payload) => { loginSuccessPayload = payload; });
        const res = await AuthService.verifyMFAChallenge('mock_factor_1', '123456');
        unsubscribe();
        assert.equal(res.success, true);
        assert.ok(loginSuccessPayload);
        assert.equal(sessionState.get().isAAL2Verified, true);
    });

    it('3. Reautenticación no otorga AAL2 y RouterGuards.requiresAAL2() bloquea navegación en AAL1', async () => {
        await AuthModule.init();
        mockClient.auth.mfa.getAuthenticatorAssuranceLevel = async () => ({
            data: { currentLevel: 'aal1', nextLevel: 'aal2' },
            error: null
        });
        await authStateCallback('SIGNED_IN', {
            user: { id: 'mock_uid_1', email: 'tester@buca.com', user_metadata: { displayName: 'Tester' } }
        });

        const state = sessionState.get();
        assert.equal(state.isAuthenticated, true);
        assert.equal(state.isAAL2Verified, false);
        const aal2Allowed = await RouterGuards.requiresAAL2();
        assert.equal(aal2Allowed, false, 'RouterGuards debe bloquear acceso si sesión permanece en AAL1');
    });

    it('4. Carrera: _showStep2QR con enrollTOTP diferido y modal cerrado en vuelo revoca factor tardío', async () => {
        const deferred = createDeferred();
        const origEnroll = AuthService.enrollTOTP;
        AuthService.enrollTOTP = () => deferred.promise;

        const attempt = { id: Symbol('attempt_race'), ownerUid: 'mock_uid_1', isOpen: true, isConfirmed: false, pendingFactorId: null, verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt;

        const flowPromise = MFAEnrollmentModal._showStep2QR('tester@buca.com', attempt);
        MFAEnrollmentModal._handleModalClose(attempt);

        deferred.resolve({ success: true, factorId: 'factor_tardio_999' });
        await flowPromise;
        AuthService.enrollTOTP = origEnroll;
        assert.ok(unenrolledFactors.includes('factor_tardio_999'));
    });

    it('5. Carrera: verificación pendiente al cerrar modal no revoca si resuelve exitosa', async () => {
        const attempt = { id: Symbol('attempt_v'), ownerUid: 'mock_uid_1', isOpen: true, isConfirmed: false, pendingFactorId: 'factor_v_1', verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt;
        const deferred = createDeferred();
        attempt.verifyPromise = deferred.promise;

        MFAEnrollmentModal._handleModalClose(attempt);
        deferred.resolve({ success: true });
        await new Promise(r => setTimeout(r, 10));

        assert.equal(attempt.isConfirmed, true);
        assert.equal(unenrolledFactors.includes('factor_v_1'), false);
    });

    it('6. Carrera: verificación pendiente al cerrar modal revoca si resuelve con error o rechazo', async () => {
        const attempt = { id: Symbol('attempt_f'), ownerUid: 'mock_uid_1', isOpen: true, isConfirmed: false, pendingFactorId: 'factor_f_2', verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt;
        const deferred = createDeferred();
        attempt.verifyPromise = deferred.promise;

        MFAEnrollmentModal._handleModalClose(attempt);
        deferred.resolve({ success: false, error: 'Código inválido' });
        await new Promise(r => setTimeout(r, 10));

        assert.ok(unenrolledFactors.includes('factor_f_2'));
    });

    it('7. Falla en revocación retiene ID y aisla por UID propietario', async () => {
        mockClient.auth.mfa.unenroll = async () => { throw new Error('Network error'); };
        MFAEnrollmentModal._revokeFactor('factor_err_promise', 'user_A');
        await new Promise(r => setTimeout(r, 10));
        assert.ok(MFAEnrollmentModal._orphanFactorsToPurge.get('user_A')?.has('factor_err_promise'));

        mockClient.auth.mfa.unenroll = async () => ({ data: null, error: { message: 'Supabase error' } });
        MFAEnrollmentModal._revokeFactor('factor_err_obj', 'user_A');
        await new Promise(r => setTimeout(r, 10));
        assert.ok(MFAEnrollmentModal._orphanFactorsToPurge.get('user_A')?.has('factor_err_obj'));

        sessionState.set({ user: { uid: 'user_B' } });
        mockClient.auth.mfa.unenroll = async ({ factorId }) => {
            unenrolledFactors.push(factorId);
            return { data: { id: factorId }, error: null };
        };
        MFAEnrollmentModal._purgeOrphans();
        await new Promise(r => setTimeout(r, 10));

        assert.equal(unenrolledFactors.length, 0, 'No debe purgar factores de user_A bajo sesión de user_B');
        assert.equal(MFAEnrollmentModal._orphanFactorsToPurge.get('user_A')?.size, 2);

        sessionState.set({ user: { uid: 'user_A' } });
        MFAEnrollmentModal._purgeOrphans();
        await new Promise(r => setTimeout(r, 10));

        assert.ok(unenrolledFactors.includes('factor_err_promise'));
        assert.ok(unenrolledFactors.includes('factor_err_obj'));
        assert.equal(MFAEnrollmentModal._orphanFactorsToPurge.has('user_A'), false);
    });

    it('8. Aislamiento por intento: respuesta tardía del intento 1 no contamina intento 2', async () => {
        const deferred1 = createDeferred();
        const origEnroll = AuthService.enrollTOTP;
        AuthService.enrollTOTP = () => deferred1.promise;

        const attempt1 = { id: Symbol('att_1'), ownerUid: 'mock_uid_1', isOpen: true, isConfirmed: false, pendingFactorId: null, verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt1;
        const flow1 = MFAEnrollmentModal._showStep2QR('tester@buca.com', attempt1);

        MFAEnrollmentModal._handleModalClose(attempt1);

        const attempt2 = { id: Symbol('att_2'), ownerUid: 'mock_uid_1', isOpen: true, isConfirmed: false, pendingFactorId: 'factor_intento_2', verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt2;

        deferred1.resolve({ success: true, factorId: 'factor_intento_1' });
        await flow1;
        AuthService.enrollTOTP = origEnroll;

        assert.ok(unenrolledFactors.includes('factor_intento_1'));
        assert.equal(attempt2.pendingFactorId, 'factor_intento_2');
    });

    it('9. Reemplazo de modal en ModalService ejecuta cleanup del modal anterior', () => {
        let prevCleanupCalled = false;
        ModalService.showModal({ body: 'Modal 1', onClose: () => { prevCleanupCalled = true; } });
        ModalService.showModal({ body: 'Modal 2', onClose: () => {} });
        assert.equal(prevCleanupCalled, true);
    });

    it('10. Cancelar elimina sólo el factor no verificado y conserva factores verificados previos', async () => {
        const verifiedFactor = { id: 'factor_previo_verificado_777', status: 'verified' };
        mockClient.auth.mfa.listFactors = async () => ({ data: { totp: [verifiedFactor], all: [verifiedFactor] }, error: null });

        const attempt = { id: Symbol('att_sel'), ownerUid: 'mock_uid_1', isOpen: true, isConfirmed: false, pendingFactorId: 'factor_unverified_nuevo_888', verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt;
        MFAEnrollmentModal._handleModalClose(attempt);

        assert.ok(unenrolledFactors.includes('factor_unverified_nuevo_888'));
        assert.equal(unenrolledFactors.includes('factor_previo_verificado_777'), false);
    });

    it('11. Cambio de usuario mientras enrollTOTP() está en vuelo retiene factor bajo UID creador sin llamar a Supabase', async () => {
        const deferred = createDeferred();
        const origEnroll = AuthService.enrollTOTP;
        AuthService.enrollTOTP = () => deferred.promise;

        const attempt = { id: Symbol('att_switch'), ownerUid: 'user_orig_100', isOpen: true, isConfirmed: false, pendingFactorId: null, verifyPromise: null };
        MFAEnrollmentModal._currentAttempt = attempt;
        sessionState.set({ user: { uid: 'user_orig_100' } });

        const flowPromise = MFAEnrollmentModal._showStep2QR('orig@buca.com', attempt);
        sessionState.set({ user: { uid: 'user_intruder_200' } });

        deferred.resolve({ success: true, factorId: 'factor_flight_switch_555' });
        await flowPromise;
        AuthService.enrollTOTP = origEnroll;

        assert.equal(unenrolledFactors.includes('factor_flight_switch_555'), false);
        assert.ok(MFAEnrollmentModal._orphanFactorsToPurge.get('user_orig_100')?.has('factor_flight_switch_555'));
        assert.equal(MFAEnrollmentModal._orphanFactorsToPurge.has('user_intruder_200'), false);
    });

    it('12. Cambio de usuario antes de que falle mfaUnenroll() conserva encolamiento bajo UID creador y preserva factores verificados', async () => {
        const unenrollDeferred = createDeferred();
        mockClient.auth.mfa.unenroll = () => unenrollDeferred.promise;

        const verifiedFactor = { id: 'factor_verified_preserve_999', status: 'verified' };
        mockClient.auth.mfa.listFactors = async () => ({ data: { totp: [verifiedFactor], all: [verifiedFactor] }, error: null });

        sessionState.set({ user: { uid: 'user_creator_300' } });
        MFAEnrollmentModal._revokeFactor('factor_deferred_unenroll_444', 'user_creator_300');
        sessionState.set({ user: { uid: 'user_other_400' } });

        unenrollDeferred.reject(new Error('Network timeout'));
        await new Promise(r => setTimeout(r, 10));

        assert.ok(MFAEnrollmentModal._orphanFactorsToPurge.get('user_creator_300')?.has('factor_deferred_unenroll_444'));
        assert.equal(MFAEnrollmentModal._orphanFactorsToPurge.has('user_other_400'), false);
        assert.equal(unenrolledFactors.includes('factor_verified_preserve_999'), false);
    });

    it('13. Purga concurrente de huérfanos no duplica llamadas a Supabase', async () => {
        let unenrollCalls = 0;
        const purgeDeferred = createDeferred();
        mockClient.auth.mfa.unenroll = async ({ factorId }) => {
            unenrollCalls++;
            unenrolledFactors.push(factorId);
            return purgeDeferred.promise;
        };

        sessionState.set({ user: { uid: 'user_concurrent_500' } });
        MFAEnrollmentModal._enqueueOrphan('user_concurrent_500', 'factor_orphan_concurrent_1');

        MFAEnrollmentModal._purgeOrphans();
        MFAEnrollmentModal._purgeOrphans();

        assert.equal(unenrollCalls, 1);

        purgeDeferred.resolve({ data: { id: 'factor_orphan_concurrent_1' }, error: null });
        await new Promise(r => setTimeout(r, 10));

        assert.equal(unenrollCalls, 1);
        assert.equal(MFAEnrollmentModal._orphanFactorsToPurge.has('user_concurrent_500'), false);
    });
});
