import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { setMockSupabase, getSupabase } from '../src/core/config/supabase.js';
import { createMockSupabaseClient } from './mocks/supabase.mock.js';
import { SupabaseDriver } from '../src/core/storage/drivers/SupabaseDriver.js';

// Aislamiento total: Mock en memoria
setMockSupabase(createMockSupabaseClient());

describe('Database Security & RLS Hardening Suite (Etapa 5)', () => {
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
        // Sin token de sesión autenticada, profiles no debe filtrar datos de otros usuarios
        const { data, error } = await client
            .from('profiles')
            .select('*');

        // Bajo RLS estricto, o retorna arreglo vacío para anon o no expone filas
        assert.equal(error, null);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 0, 'Usuario anónimo no debe ver perfiles privados');
    });

    it('Debe proteger public.businesses de accesos no autorizados', async () => {
        const { data, error } = await client
            .from('businesses')
            .select('*');

        assert.equal(error, null);
        assert.ok(Array.isArray(data));
        assert.equal(data.length, 0, 'Usuario anónimo no debe ver negocios privados');
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
