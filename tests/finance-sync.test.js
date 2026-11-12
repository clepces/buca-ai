import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setMockSupabase } from '../src/core/config/supabase.js';
import { createMockSupabaseClient } from './mocks/supabase.mock.js';
import { FinanceRepository } from '../src/modules/finance/services/FinanceRepository.js';
import { NotificationService } from '../src/core/services/NotificationService.js';
import { ActivityLogService } from '../src/core/services/ActivityLogService.js';

// Aislamiento total: Mock en memoria
setMockSupabase(createMockSupabaseClient());

describe('Finance Sync & Dual-Dispatch Notifications Suite (Etapa 6)', () => {
    it('FinanceRepository.calculateGap debe calcular con precisión la brecha porcentual', () => {
        // Ejemplo: Oficial 36.50, Paralelo 40.15 -> ((40.15 - 36.50) / 36.50) * 100 = 10.00%
        const gap = FinanceRepository.calculateGap(36.50, 40.15);
        assert.equal(gap, 10);

        // Tasa paralela menor o igual
        const gapZero = FinanceRepository.calculateGap(50, 50);
        assert.equal(gapZero, 0);

        // Manejo de valores cero o inválidos
        const gapInvalid = FinanceRepository.calculateGap(0, 100);
        assert.equal(gapInvalid, 0);
    });

    it('FinanceRepository.saveRateSnapshot debe persistir cotizaciones con brecha cambiaria en Supabase', async () => {
        const testTenant = `tenant_audit_${Date.now()}`;
        const official = 900.50;
        const parallel = 990.55;

        const saved = await FinanceRepository.saveRateSnapshot(testTenant, {
            rate: official,
            rateParallel: parallel,
            currency: 'USD',
            source: 'Test/Auditoría'
        });

        assert.equal(saved.tenant_id, testTenant);
        assert.equal(saved.rate, official);
        assert.equal(saved.rate_parallel, parallel);
        assert.ok(typeof saved.gap_percentage === 'number');

        const fetched = await FinanceRepository.getTenantRate(testTenant);
        assert.ok(fetched, 'Debe recuperar el registro desde Supabase');
        assert.equal(Number(fetched.rate), official);
    });

    it('NotificationService debe emitir y encolar notificaciones', async () => {
        const initialCount = NotificationService.getNotifications().length;
        await NotificationService.addNotification({
            title: 'Notificación de Prueba Etapa 6',
            message: 'Verificación de sincronización reactiva',
            type: 'info'
        });

        const updated = NotificationService.getNotifications();
        assert.ok(updated.length > initialCount);
        assert.equal(updated[0].title, 'Notificación de Prueba Etapa 6');
    });

    it('ActivityLogService debe estructurar payloads inmutables de auditoría', async () => {
        const result = await ActivityLogService.log({
            action: 'TEST_AUDIT',
            title: 'Acción de prueba de auditoría',
            description: 'Verificación de trazabilidad inmutable',
            category: 'operaciones'
        });

        assert.ok(result);
        assert.equal(result.action, 'TEST_AUDIT');
    });
});
