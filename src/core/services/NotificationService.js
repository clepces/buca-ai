import { BaseClient } from '@/core/api/BaseClient.js';
import { ENDPOINTS } from '@/core/api/endpoint.js';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    limit, 
    onSnapshot, 
    serverTimestamp, 
    updateDoc, 
    doc, 
    arrayUnion 
} from 'firebase/firestore';
import { initFirebase } from '@/core/config/firebase.js';
import { sessionState } from '@/core/state/session.js';
import { eventBus } from '@/core/eventBus/index.js';

// Configuración Corporativa de EmailJS
const EMAIL_CONFIG = {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_7tp426h', 
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_uf6oc8e', 
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'zsNADkNE3WBrYJdw1',   
};

const emailClient = new BaseClient(ENDPOINTS.SERVICES.NOTIFICATIONS.EMAILJS);

export const NotificationService = {
    _notifications: [],
    _unsubscribe: null,

    init() {
        console.log('[NotificationService] Initializing Real-Time Sync...');
        
        // 1. Escuchar el EventBus para nuevas notificaciones locales/push
        eventBus.on('notifications:push', (data) => this.addNotification(data));
        eventBus.on('ui:clear_notifications', () => this.clearNotifications());
        eventBus.on('notifications:mark_as_read', (payload) => {
            const id = typeof payload === 'object' && payload !== null ? (payload.id || payload.target) : payload;
            if (id) this.markAsRead(id);
        });

        // 2. Vincular con Firestore si el usuario está autenticado
        sessionState.subscribe((state) => {
            if (state.isAuthenticated && state.user?.uid) {
                this.startFirestoreSync();
            } else {
                this.stopFirestoreSync();
            }
        });
    },

    startFirestoreSync() {
        if (this._unsubscribe) return;

        try {
            const { db } = initFirebase();
            if (!db) return;

            const q = query(
                collection(db, 'notifications'), 
                orderBy('timestamp', 'desc'), 
                limit(20)
            );

            this._unsubscribe = onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    time: doc.data().timestamp?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '...'
                }));

                this._notifications = items;
                eventBus.emit('notifications:updated', items);
            }, (error) => {
                console.error('[NotificationService] Firestore Sync Error:', error);
            });
        } catch (err) {
            console.warn('[NotificationService] Could not start Firestore sync:', err.message);
        }
    },

    stopFirestoreSync() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
    },

    /**
     * Agrega una notificación a Firestore y emite evento visual (Toast).
     */
    async addNotification(notification) {
        const { db } = initFirebase();
        const user = sessionState.get().user;

        const title = notification.title || 'Alerta del Sistema';
        const message = notification.message || '';
        const type = notification.type || 'info';

        // Evitar duplicar alertas idénticas no leídas (ej. flood de errores HTTP o fallos repetitivos)
        const isDuplicate = this._notifications.some(n => 
            n.title === title && 
            n.message === message && 
            (!user?.uid || !n.read_by?.includes(user.uid))
        );
        if (isDuplicate) {
            console.debug('[NotificationService] Alerta idéntica activa; omitiendo duplicación.');
            return;
        }

        const newNotif = {
            title,
            message,
            type,
            timestamp: serverTimestamp(),
            read_by: [], // Patrón 'Read-By Array' para multi-usuario
            author_id: user?.uid || 'system',
            target_tenant: sessionState.get().tenantId || null
        };

        // Disparar Toast visual inmediatamente (HUD)
        eventBus.emit('ui:notification_hud', {
            message: newNotif.message,
            type: newNotif.type,
            title: newNotif.title
        });

        // Guardar en Firestore para persistencia global
        if (db) {
            try {
                await addDoc(collection(db, 'notifications'), newNotif);
            } catch (err) {
                console.error('[NotificationService] Error saving to Firestore:', err);
                // Fallback local si falla la red
                this._notifications.unshift({ ...newNotif, id: Date.now(), time: 'Ahora' });
                eventBus.emit('notifications:updated', this._notifications);
            }
        }
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
        if (!cleanId) return;

        // 1. Actualización inmediata en memoria local
        const notif = this._notifications.find(n => String(n.id) === cleanId);
        if (notif) {
            if (!Array.isArray(notif.read_by)) notif.read_by = [];
            if (!notif.read_by.includes(user.uid)) {
                notif.read_by.push(user.uid);
                eventBus.emit('notifications:updated', this._notifications);
            }
        }

        // 2. Persistencia en Firestore
        const { db } = initFirebase();
        if (!db) return;

        try {
            const notifRef = doc(db, 'notifications', cleanId);
            await updateDoc(notifRef, {
                read_by: arrayUnion(user.uid)
            });
        } catch (err) {
            console.warn('[NotificationService] Firestore markAsRead notice:', err.message);
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
        console.log(`[NotificationService] Sending OTP ${otpCode} to ${email}`);
        try {
            await this.sendEmail({
                to_email: email,
                to_name: name || 'Usuario',
                otp_code: otpCode,
                message: `Su código de verificación BUSA-I es: ${otpCode}`
            });
        } catch (e) {
            console.warn('[NotificationService] Failed to send email via API, OTP logged locally:', otpCode);
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
