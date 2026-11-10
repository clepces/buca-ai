import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SupabaseDriver } from '../src/core/storage/drivers/SupabaseDriver.js';
import { storage } from '../src/core/storage/StorageAdapter.js';

describe('SupabaseDriver & StorageAdapter Integration Tests', () => {
    const driver = new SupabaseDriver('app_storage');
    const testKey = `test_key_${Date.now()}`;
    const testValue = { message: 'Hola BUCA AI', timestamp: Date.now() };

    it('Debe instanciar SupabaseDriver con la tabla correcta', () => {
        assert.equal(driver.tableName, 'app_storage');
        assert.ok(driver.getClient(), 'Debe inicializar el cliente de Supabase');
    });

    it('Debe persistir y recuperar datos mediante set y get', async () => {
        const setResult = await driver.set(testKey, testValue);
        assert.ok(setResult, 'set debe retornar true');

        const retrieved = await driver.get(testKey);
        assert.deepEqual(retrieved, testValue, 'El valor recuperado debe coincidir con el almacenado');
    });

    it('Debe listar claves por prefijo mediante list', async () => {
        const items = await driver.list('test_key_');
        assert.ok(Array.isArray(items), 'Debe retornar un arreglo');
        const found = items.some(item => item.key === testKey);
        assert.ok(found, 'La clave de prueba debe figurar en la lista');
    });

    it('Debe eliminar la clave mediante remove', async () => {
        const removeResult = await driver.remove(testKey);
        assert.ok(removeResult, 'remove debe retornar true');

        const retrieved = await driver.get(testKey);
        assert.equal(retrieved, null, 'El valor debe ser null tras ser eliminado');
    });

    it('StorageAdapter debe integrar persistencia remota mediante forModule', async () => {
        const moduleStorage = storage.forModule('audit_test');
        const modKey = `setting_${Date.now()}`;
        const modVal = { active: true, tier: 'L2' };

        const saved = await moduleStorage.setRemote(modKey, modVal);
        assert.ok(saved);

        const fetched = await moduleStorage.getRemote(modKey);
        assert.deepEqual(fetched, modVal);

        await moduleStorage.removeRemote(modKey);
        const afterDelete = await moduleStorage.getRemote(modKey);
        assert.equal(afterDelete, null);
    });
});
