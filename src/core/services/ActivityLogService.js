/**
 * ActivityLogService - Servicio de Trazabilidad y Bitácora Inmutable (Supabase Native)
 * =========================================================================
 * Registra eventos sensibles y de auditoría en la tabla 'public.activity_log'
 * garantizando trazabilidad por usuario y tenant sin exponer datos sensibles.
 * =========================================================================
 */
import { getSupabase, supabase } from '../config/supabase.js';
import { sessionState } from '../state/session.js';
import { eventBus } from '../eventBus/index.js';
import { Logger } from '../../shared/utils/logger.js';

export const ActivityLogService = {
    _initialized: false,
    _cleanups: [],

    _getClient() {
        return getSupabase() || supabase;
    },

    init() {
        if (this._initialized) return;
        this._initialized = true;

        Logger.info({ layer: 'SERVICE', role: 'CLASS', target: 'ActivityLog', icon: '🛡️', message: 'Auditoría inmutable inicializada (Supabase)' });

        // Escuchar eventos sensibles para auto-registro
        this._cleanups.push(
            eventBus.on('finance:rate_updated', (data) => {
                this.log({
                    action: 'UPDATE_RATE',
                    title: 'Tasa cambiaria actualizada',
                    description: `Tasa modificada a Bs. ${data?.rate}`,
                    category: 'operaciones',
                    details: data
                });
            }),

            eventBus.on('profile:mfa-enrolled', () => {
                this.log({
                    action: 'MFA_ENROLLED',
                    title: 'Factor de autenticación MFA TOTP activado',
                    description: 'El usuario enroló exitosamente su dispositivo con Google Authenticator.',
                    category: 'seguridad'
                });
            })
        );
    },

    destroy() {
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this._initialized = false;
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
                Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'ActivityLog', icon: '⚠️', message: 'Advertencia al persistir log', data: error.message });
                return null;
            }

            eventBus.emit('activity:logged', data || payload);
            return data || payload;
        } catch (err) {
            Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'ActivityLog', icon: '⚠️', message: 'Error al registrar actividad', data: err.message });
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
                Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'ActivityLog', icon: '⚠️', message: 'Error al consultar actividades', data: error.message });
                return [];
            }
            return data || [];
        } catch (err) {
            Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'ActivityLog', icon: '⚠️', message: 'Error recuperando actividades', data: err.message });
            return [];
        }
    }
};

export default ActivityLogService;
