/**
 * NotificationService - Servicio Unificado de Notificaciones (Supabase Native)
 * =========================================================================
 * Maneja alertas locales en memoria, eventos visuales (HUD / Toasts),
 * y persistencia en la tabla 'public.notifications' con patrón 'read_by: uuid[]'.
 * =========================================================================
 */
import { BaseClient } from '../api/BaseClient.js';
import { ENDPOINTS } from '../api/endpoint.js';
import { sessionState } from '../state/session.js';
import { eventBus } from '../eventBus/index.js';
import { getSupabase, supabase } from '../config/supabase.js';
import { ENV } from '../config/environment.js';
import { Logger } from '../../shared/utils/logger.js';

const EMAIL_CONFIG = {
    SERVICE_ID: ENV.EMAILJS.SERVICE_ID,
    TEMPLATE_ID: ENV.EMAILJS.TEMPLATE_ID,
    PUBLIC_KEY: ENV.EMAILJS.PUBLIC_KEY
};

const emailClient = new BaseClient(ENDPOINTS.SERVICES.NOTIFICATIONS.EMAILJS);

export const NotificationService = {
    _notifications: [],
    _initialized: false,
    _cleanups: [],
    _epoch: 0,

    _getClient() {
        return getSupabase() || supabase;
    },

    init() {
        if (this._initialized) return;
        this._initialized = true;
        this._epoch++;
        const currentEpoch = this._epoch;

        Logger.info({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '🔄', message: 'Sincronización en tiempo real iniciada (Supabase)' });

        this._cleanups.push(
            eventBus.on('notifications:push', (data) => this.addNotification(data)),
            eventBus.on('ui:clear_notifications', () => this.clearNotifications()),
            eventBus.on('notifications:mark_as_read', (payload) => {
                const id = typeof payload === 'object' && payload !== null ? (payload.id || payload.target) : payload;
                if (id) this.markAsRead(id);
            })
        );

        // Cargar notificaciones de Supabase al inicializar
        this.loadRemoteNotifications(currentEpoch);
    },

    destroy() {
        this._epoch++;
        while (this._cleanups.length > 0) {
            try { this._cleanups.pop()(); } catch { /* absorb */ }
        }
        this._notifications = [];
        this._initialized = false;
    },

    /**
     * Carga las notificaciones existentes desde Supabase.
     */
    async loadRemoteNotifications(epoch = this._epoch) {
        try {
            const client = this._getClient();
            const { data, error } = await client
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(30);

            // Prevenir modificaciones o emisiones si el servicio fue destruido o reiniciado
            if (!this._initialized || this._epoch !== epoch) return;

            if (error) {
                Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '⚠️', message: 'Advertencia cargando notificaciones', data: error.message });
                return;
            }

            if (Array.isArray(data) && data.length > 0) {
                this._notifications = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    message: item.message,
                    type: item.type || 'info',
                    time: new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    read_by: Array.isArray(item.read_by) ? item.read_by : [],
                    author_id: item.user_id || 'system',
                    target_tenant: item.tenant_id || null
                }));
                eventBus.emit('notifications:updated', this._notifications);
            }
        } catch (err) {
            if (!this._initialized || this._epoch !== epoch) return;
            Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '⚠️', message: 'Error al conectar con Supabase', data: err.message });
        }
    },

    /**
     * Agrega una notificación con Dual-Dispatch (HUD visual + persistencia remota).
     */
    async addNotification(notification) {
        const user = sessionState.get().user;
        const title = notification.title || 'Alerta del Sistema';
        const message = notification.message || '';
        const type = notification.type || 'info';

        const isDuplicate = this._notifications.some(n => 
            n.title === title && 
            n.message === message && 
            (!user?.uid || !n.read_by?.includes(user.uid))
        );
        if (isDuplicate) return;

        // 1. Despacho Visual Inmediato (HUD Toast)
        eventBus.emit('ui:notification_hud', {
            message,
            type,
            title
        });

        const newNotif = {
            id: 'notif_' + Date.now(),
            title,
            message,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read_by: [],
            author_id: user?.uid || 'system',
            target_tenant: sessionState.get().tenantId || null
        };

        this._notifications.unshift(newNotif);
        eventBus.emit('notifications:updated', this._notifications);

        // 2. Persistencia en Supabase (tabla 'notifications' con read_by array)
        try {
            const client = this._getClient();
            const { data, error } = await client
                .from('notifications')
                .insert({
                    title,
                    message,
                    type,
                    tenant_id: sessionState.get().tenantId || null,
                    user_id: user?.uid || null,
                    read_by: [],
                    metadata: notification.metadata || {}
                })
                .select()
                .single();

            if (!error && data) {
                newNotif.id = data.id; // Asignar el UUID real de PostgreSQL
            }
        } catch (err) {
            Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '⚠️', message: 'Persistencia remota en cola local', data: err.message });
        }
    },

    /**
     * Marca una notificación como leída por el usuario actual en el array 'read_by'.
     */
    async markAsRead(target) {
        const user = sessionState.get().user;
        const currentUid = user?.uid;

        const notifId = typeof target === 'object' && target !== null 
            ? (target.id || target.notificationId || target.target)
            : target;
        
        if (notifId === null || notifId === undefined) return;
        const cleanId = String(notifId).trim();

        const notif = this._notifications.find(n => String(n.id) === cleanId);
        if (notif) {
            if (!Array.isArray(notif.read_by)) notif.read_by = [];
            if (currentUid && !notif.read_by.includes(currentUid)) {
                notif.read_by.push(currentUid);
                eventBus.emit('notifications:updated', this._notifications);

                // Actualizar de forma segura en Supabase mediante RPC de mínimo privilegio
                try {
                    const client = this._getClient();
                    const { error } = await client.rpc('mark_notification_read', {
                        p_notification_id: String(notif.id)
                    });
                    if (error) {
                        Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '⚠️', message: 'Advertencia en RPC mark_notification_read', data: error.message });
                    }
                } catch (e) {
                    Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '⚠️', message: 'Error llamando mark_notification_read en Supabase', data: e.message });
                }
            }
        }
    },

    async sendEmail(templateParams) {
        try {
            await emailClient.post('/email/send', {
                service_id: EMAIL_CONFIG.SERVICE_ID,
                template_id: EMAIL_CONFIG.TEMPLATE_ID,
                user_id: EMAIL_CONFIG.PUBLIC_KEY,
                template_params: templateParams
            }, { silent: true });
            return true;
        } catch {
            return false;
        }
    },

    async sendOTP(email, name, otpCode) {
        Logger.info({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '🔌', message: `Enviando código OTP a ${email}` });
        try {
            await this.sendEmail({
                to_email: email,
                to_name: name || 'Usuario',
                otp_code: otpCode,
                message: `Su código de verificación BUSA-I es: ${otpCode}`
            });
        } catch (e) {
            Logger.warn({ layer: 'SERVICE', role: 'CLASS', target: 'Notification', icon: '⚠️', message: 'Aviso en entrega de correo OTP', data: e?.message || e });
        }
        eventBus.emit('notifications:push', {
            title: 'Código OTP Generado',
            message: `Código de acceso para ${email}: ${otpCode}`,
            type: 'info'
        });
        return true;
    },

    getNotifications() {
        return this._notifications;
    },

    async clearNotifications() {
        const user = sessionState.get().user;
        const currentUid = user?.uid;
        if (!currentUid) return;

        const unread = this._notifications.filter(n => !n.read_by?.includes(currentUid));
        await Promise.all(unread.map(n => this.markAsRead(n.id)));
    }
};

export default NotificationService;
