import { sessionState } from '@/core/state/session.js';

export const NotificationsPanel = {
    render: (notifications = []) => {
        const user = sessionState.get().user;
        const currentUid = user?.uid;
        
        // Calcular no leídas para el badge
        const unreadCount = notifications.filter(n => !n.read_by?.includes(currentUid)).length;
        const hasNotifications = notifications && notifications.length > 0;

        return `
            <div id="panel-notifications" class="glass-panel glass-panel--standard">
                <div class="panel-header">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-bell-fill text-primary"></i> 
                        <span>Notificaciones</span>
                    </div>
                    ${unreadCount > 0 ? `<span class="badge bg-primary text-white rounded-pill x-small pulse-notif">${unreadCount}</span>` : ''}
                </div>
                <div class="buca-scroll-area">
                    ${hasNotifications ? `
                        <div class="notifications-list p-2">
                            ${notifications.map(n => {
        const isRead = n.read_by?.includes(currentUid);
        return `
                                    <div class="notification-item p-2 mb-2 rounded-3 border-bottom transition-all ${isRead ? 'item-read' : 'item-unread'}" 
                                         data-action="notifications:mark_as_read" data-id="${n.id}">
                                        <div class="d-flex justify-content-between align-items-start mb-1">
                                            <span class="fw-bold x-small ${isRead ? 'text-muted' : 'text-main'}">${n.title}</span>
                                            <span class="text-muted notif-time">${n.time || 'Ahora'}</span>
                                        </div>
                                        <p class="mb-0 text-muted notif-desc">${n.message}</p>
                                    </div>
                                `;
    }).join('')}
                        </div>
                    ` : `
                        <div class="panel-empty">
                            <i class="bi bi-bell-slash"></i>
                            <span>No hay notificaciones</span>
                            <span class="text-muted small opacity-75">Las alertas del sistema aparecerán aquí</span>
                        </div>
                    `}
                </div>
                ${hasNotifications ? `
                    <div class="panel-footer p-2 border-top text-center">
                        <button type="button" class="btn btn-link btn-sm text-decoration-none x-small fw-bold text-primary" data-action="ui:clear_notifications">Marcar todas como leídas</button>
                    </div>
                ` : ''}
            </div>
        `;
    }
};
