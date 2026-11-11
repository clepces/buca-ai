import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BackupKeyService } from '../src/core/security/BackupKeyService.js';
import { RouterGuards } from '../src/core/router/guards.js';
import { sessionState } from '../src/core/state/session.js';

describe('ETAPA 4: MFA Enrollment, Canvas QR & Backup Keys Tests', () => {
    describe('1. BackupKeyService - Claves de Emergencia', () => {
        it('Debe generar exactamente 8 claves con formato BUCA-XXXX-XXXX', () => {
            const keys = BackupKeyService.generateKeys(8);
            assert.equal(keys.length, 8);
            for (const key of keys) {
                assert.match(key, /^BUCA-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/);
            }
        });

        it('Debe formatear el comprobante imprimible con metadatos de seguridad', () => {
            const keys = BackupKeyService.generateKeys(8);
            const slip = BackupKeyService.formatSlip(keys, 'seguridad@buca.com.ve');

            assert.ok(slip.includes('CLAVES DE RESPALDO DE EMERGENCIA (MFA)'));
            assert.ok(slip.includes('seguridad@buca.com.ve'));
            assert.ok(slip.includes(keys[0]));
            assert.ok(slip.includes(keys[7]));
        });
    });

    describe('2. RouterGuards - Control de Acceso AAL2', () => {
        it('requiresAuth debe rechazar usuarios no autenticados', () => {
            sessionState.set({ isAuthenticated: false, user: null });
            assert.equal(RouterGuards.requiresAuth(), false);
        });

        it('requiresAuth debe permitir usuarios autenticados', () => {
            sessionState.set({
                isAuthenticated: true,
                user: { uid: 'user_123', email: 'test@buca.com' },
                currentRole: 'user'
            });
            assert.equal(RouterGuards.requiresAuth(), true);
        });
    });
});
