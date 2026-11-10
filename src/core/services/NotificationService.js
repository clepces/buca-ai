/**
 * NotificationService - Servicio Unificado de Notificaciones (Supabase Native)
 * =========================================================================
 * Maneja alertas locales en memoria, eventos visuales (HUD / Toasts),
 * y sincronización de notificaciones.
 * =========================================================================
 */
import { BaseClient } from '@/core/api/BaseClient.js';
import { ENDPOINTS } from '@/core/api/endpoint.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';
import { getSupabase } from '@/core/config/supabase.js';

const EMAIL_CONFIG = {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_7tp426h', 
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_uf6oc8e', 
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'zsNADkNE3WBrYJdw1',   
};

const emailClient = new BaseClient(ENDPOINTS.SERVICES.NOTIFICATIONS.EMAILJS);

export const NotificationService = {
    _notifications: [],

    init() {
        console.log('[NotificationService] Initializing Real-Time Sync (Supabase)...');
        
        eventBus.on('notifications:push', (data) => this.addNotification(data));
        eventBus.on('ui:clear_notifications', () => this.clearNotifications());
        eventBus.on('notifications:mark_as_read', (payload) => {
            const id = typeof payload === 'object' && payload !== null ? (payload.id || payload.target) : payload;
            if (id) this.markAsRead(id);
        });
    },

    /**
     * Agrega una notificación y emite evento visual (Toast / HUD).
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

        // Disparar Toast visual inmediatamente (HUD)
        eventBus.emit('ui:notification_hud', {
            message: newNotif.message,
            type: newNotif.type,
            title: newNotif.title
        });

        eventBus.emit('notifications:updated', this._notifications);
    },

    /**
     * Marca una notificación como leída por el usuario actual.
     */
    async markAsRead(target) {
        const user = sessionState.get().user;
        if (!user?.uid) return;

        const notifId = typeof target === 'object' && target !== null 
            ? (target.id || target.notificationId || target.target)
            : target;
        
        if (notifId == null) return;
        const cleanId = String(notifId).trim();

        const notif = this._notifications.find(n => String(n.id) === cleanId);
        if (notif) {
            if (!Array.isArray(notif.read_by)) notif.read_by = [];
            if (!notif.read_by.includes(user.uid)) {
                notif.read_by.push(user.uid);
                eventBus.emit('notifications:updated', this._notifications);
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
        console.log(`[NotificationService] Sending OTP to ${email}`);
        try {
            await this.sendEmail({
                to_email: email,
                to_name: name || 'Usuario',
                otp_code: otpCode,
                message: `Su código de verificación BUSA-I es: ${otpCode}`
            });
        } catch (e) {
            console.warn('[NotificationService] Email delivery notice:', e?.message || e);
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
