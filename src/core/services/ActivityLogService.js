/**
 * ActivityLogService - Servicio de Trazabilidad y Bitácora Inmutable (Supabase Native)
 * =========================================================================
 * Registra eventos sensibles y de auditoría en la tabla 'public.activity_log'
 * garantizando trazabilidad por usuario y tenant sin exponer datos sensibles.
 * =========================================================================
 */
import { getSupabase } from '../config/supabase.js';
import { sessionState } from '../state/session.js';
import { eventBus } from '../eventBus/index.js';

export const ActivityLogService = {
    _getClient() {
        return getSupabase();
    },

    init() {
        console.log('[ActivityLogService] Inicializando auditoría inmutable en Supabase...');

        // Escuchar eventos sensibles para auto-registro
        eventBus.on('buca:rate_change', (data) => {
            this.log({
                action: 'UPDATE_RATE',
                title: 'Tasa cambiaria actualizada',
                description: `Tasa modificada a Bs. ${data?.rate}`,
                category: 'operaciones',
                details: data
            });
        });

        eventBus.on('profile:mfa-enrolled', () => {
            this.log({
                action: 'MFA_ENROLLED',
                title: 'Factor de autenticación MFA TOTP activado',
                description: 'El usuario enroló exitosamente su dispositivo con Google Authenticator.',
                category: 'seguridad'
            });
        });
    },

    /**
     * Registra una acción inmutable en la bitácora de Supabase.
     */
    async log({ action, title, description = '', category = 'operaciones', details = {} }) {
        const user = sessionState.get().user;
        const tenantId = sessionState.get().tenantId || null;

        const payload = {
            action,
            title,
            description,
            category,
            details,
            tenant_id: tenantId,
            user_id: user?.uid || null,
            created_at: new Date().toISOString()
        };

        try {
            const client = this._getClient();
            const { data, error } = await client
                .from('activity_log')
                .insert(payload)
                .select()
                .single();

            if (error) {
                console.warn('[ActivityLogService] Advertencia al persistir log:', error.message);
                return null;
            }

            eventBus.emit('activity:logged', data || payload);
            return data || payload;
        } catch (err) {
            console.warn('[ActivityLogService] Error al registrar actividad:', err.message);
            return null;
        }
    },

    /**
     * Obtiene los registros de actividad más recientes.
     */
    async getRecentActivities(limit = 10, category = null) {
        try {
            const client = this._getClient();
            let query = client
                .from('activity_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            const { data, error } = await query;
            if (error) {
                console.warn('[ActivityLogService] Error al consultar actividades:', error.message);
                return [];
            }
            return data || [];
        } catch (err) {
            console.warn('[ActivityLogService] Error recuperando actividades:', err.message);
            return [];
        }
    }
};

export default ActivityLogService;
