import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setMockSupabase, getSupabase } from '../src/core/config/supabase.js';
import { createMockSupabaseClient } from './mocks/supabase.mock.js';
import { SupabaseDriver } from '../src/core/storage/drivers/SupabaseDriver.js';

// Aislamiento total: Mock en memoria
setMockSupabase(createMockSupabaseClient());

describe('Database Security & RLS Hardening Suite (Etapa 5 y 8)', () => {
    const driver = new SupabaseDriver('app_storage');
    const client = getSupabase();

    it('Debe inicializar el cliente y el driver de app_storage', () => {
        assert.ok(driver, 'Driver debe estar instanciado');
        assert.ok(client, 'Cliente de Supabase debe estar activo');
    });

    it('Debe permitir lecturas públicas sobre finance_rates con RLS activo', async () => {
        const { data, error } = await client
            .from('finance_rates')
            .select('*')
            .limit(5);

        assert.equal(error, null, 'Lectura pública no debe arrojar error RLS');
        assert.ok(Array.isArray(data), 'Resultado debe ser un arreglo');
    });

    it('Debe proteger public.profiles de accesos no autenticados', async () => {
        client.auth.setSession(null);
        const { data, error } = await client
            .from('profiles')
            .select('*');

        assert.equal(error, null);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 0, 'Usuario anónimo no debe ver perfiles privados');
        client.auth.setSession({ user: { id: 'mock_uid_1', email: 'tester@buca.com', platform_role: 'super_admin' } });
    });

    it('Debe proteger public.businesses de accesos no autorizados', async () => {
        client.auth.setSession(null);
        const { data, error } = await client
            .from('businesses')
            .select('*');

        assert.equal(error, null);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 0, 'Usuario anónimo no debe ver negocios privados');
        client.auth.setSession({ user: { id: 'mock_uid_1', email: 'tester@buca.com', platform_role: 'super_admin' } });
    });

    it('Debe bloquear la auto-asignación de platform_role para usuarios no autorizados', async () => {
        client.auth.setSession({ user: { id: 'user_regular_1', email: 'user@buca.com', platform_role: 'user' } });
        const { error } = await client
            .from('profiles')
            .update({ platform_role: 'super_admin' })
            .eq('id', 'user_regular_1');

        assert.ok(error, 'Debe retornar error de violación RLS / trigger de seguridad');
        assert.match(error.message, /platform_role/);
        client.auth.setSession({ user: { id: 'mock_uid_1', email: 'tester@buca.com', platform_role: 'super_admin' } });
    });

    it('Debe impedir el registro de logs anónimos en activity_log', async () => {
        client.auth.setSession(null);
        const { error } = await client
            .from('activity_log')
            .insert({ action: 'ANON_ATTEMPT', title: 'Intento anónimo' });

        assert.ok(error, 'Debe rechazar inserciones sin usuario autenticado');
        client.auth.setSession({ user: { id: 'mock_uid_1', email: 'tester@buca.com', platform_role: 'super_admin' } });
    });

    it('SupabaseDriver.set debe manejar payload de app_storage con timestamps y claves', async () => {
        const testKey = `audit_sec_${Date.now()}`;
        const testPayload = { secure: true, timestamp: Date.now() };

        const saved = await driver.set(testKey, testPayload);
        assert.ok(saved, 'Debe guardar en app_storage');

        const fetched = await driver.get(testKey);
        assert.deepEqual(fetched, testPayload, 'Debe recuperar el valor guardado');

        await driver.remove(testKey);
    });
});
