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

    it('Debe bloquear la inserción de perfiles con platform_role distinto de user (autoasignación)', async () => {
        client.auth.setSession({ user: { id: 'new_user_hacker', email: 'hacker@buca.com', platform_role: 'user' } });
        const { error } = await client
            .from('profiles')
            .insert({ id: 'new_user_hacker', platform_role: 'super_admin', first_name: 'Hacker' });

        assert.ok(error, 'Debe rechazar inserción con rol administrativo no autorizado');
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

    it('Debe denegar UPDATE directo sobre la tabla public.notifications (privilegio revocado)', async () => {
        const { error } = await client
            .from('notifications')
            .update({ title: 'Título Modificado Ilegalmente' })
            .eq('id', 'any_id');

        assert.ok(error, 'Debe fallar el UPDATE directo');
        assert.match(error.message, /permission denied/i);
    });

    it('Debe permitir marcar como leída mediante RPC mark_notification_read de forma idempotente', async () => {
        const notifId = `test_notif_${Date.now()}`;
        await client.from('notifications').insert({
            id: notifId,
            title: 'Alerta Importante',
            message: 'Mensaje de prueba',
            user_id: 'mock_uid_1',
            read_by: []
        });

        // 1. Primera invocación
        const res1 = await client.rpc('mark_notification_read', { p_notification_id: notifId });
        assert.equal(res1.error, null);
        assert.equal(res1.data, true);

        // 2. Segunda invocación idempotente (no debe fallar ni duplicar)
        const res2 = await client.rpc('mark_notification_read', { p_notification_id: notifId });
        assert.equal(res2.error, null);
        assert.equal(res2.data, true);

        // Verificar que solo se modificó read_by y no otros campos
        const { data: updatedNotif } = await client.from('notifications').select('*').eq('id', notifId).single();
        assert.equal(updatedNotif.title, 'Alerta Importante');
        assert.deepEqual(updatedNotif.read_by, ['mock_uid_1']);
    });

    it('Debe rechazar mark_notification_read si el usuario no tiene autorización', async () => {
        const alienNotifId = `alien_notif_${Date.now()}`;
        await client.from('notifications').insert({
            id: alienNotifId,
            title: 'Privado',
            message: 'Secreto de otro usuario',
            user_id: 'other_user_uid',
            read_by: []
        });

        client.auth.setSession({ user: { id: 'impostor_uid', email: 'impostor@buca.com', platform_role: 'user' } });
        const { error } = await client.rpc('mark_notification_read', { p_notification_id: alienNotifId });
        assert.ok(error, 'Debe rechazar la operación por falta de autorización');

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
