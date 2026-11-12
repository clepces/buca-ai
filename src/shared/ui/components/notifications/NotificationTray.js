/**
 * NotificationTray - Bandeja de Notificaciones Desplegable
 * =========================================================================
 * Clean, semantic Sass architecture with unified global scroll (.buca-scroll-area)
 * Zero inline styles, fully compliant with CSS architecture standards
 * =========================================================================
 */
import { sessionState } from '@/core/state/session.js';
import { escapeHTML } from '@/shared/utils/security.js';

// Configuración visual por tipo de notificación
const TYPE_CONFIG = {
    info: {
        icon: 'bi-info-circle-fill',
        color: '#2563eb',
        bg: 'rgba(37, 99, 235, 0.12)',
        badgeText: 'Info'
    },
    success: {
        icon: 'bi-check-circle-fill',
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.12)',
        badgeText: 'Éxito'
    },
    warning: {
        icon: 'bi-exclamation-triangle-fill',
        color: '#d97706',
        bg: 'rgba(217, 119, 6, 0.12)',
        badgeText: 'Alerta'
    },
    error: {
        icon: 'bi-x-circle-fill',
        color: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.12)',
        badgeText: 'Crítico'
    }
};

function getTypeConfig(type) {
    return TYPE_CONFIG[type] || TYPE_CONFIG.info;
}

function formatTime(notification) {
    if (!notification.timestamp) return 'Reciente';
    const date = notification.timestamp.toDate ? notification.timestamp.toDate() : new Date(notification.timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
}

let _activeTab = 'all';

export const NotificationTray = {
    getActiveTab() {
        return _activeTab;
    },

    setActiveTab(tab) {
        _activeTab = tab;
    },

    /**
     * Renderiza una única notificación
     */
    _renderNotification(n, currentUid) {
        const isRead = n.read_by?.includes(currentUid);
        const cfg = getTypeConfig(n.type);
        const timeStr = formatTime(n);
        const safeTitle = escapeHTML(n.title || 'Alerta del Sistema');
        const safeMessage = escapeHTML(n.message || '');
        const safeId = escapeHTML(String(n.id || ''));

        return `
            <div class="notification-item position-relative p-2.5 mb-2 rounded-3 ${isRead ? 'item-read' : 'item-unread'}" 
                 data-id="${safeId}"
                 style="--notif-accent: ${cfg.color}; --notif-color: ${cfg.color}; --notif-bg: ${cfg.bg};">
                <div class="d-flex align-items-start gap-2.5">
                    <div class="notif-type-icon d-flex align-items-center justify-content-center rounded-2 flex-shrink-0 mt-0.5">
                        <i class="bi ${cfg.icon}"></i>
                    </div>

                    <div class="d-flex flex-column flex-grow-1 min-w-0">
                        <div class="d-flex align-items-center justify-content-between gap-1 mb-1">
                            <span class="fw-bold text-main text-truncate notif-title">${safeTitle}</span>
                            <span class="text-muted flex-shrink-0 notif-time">${timeStr}</span>
                        </div>
                        <p class="mb-1 text-muted notif-desc">${safeMessage}</p>
                        
                        <div class="d-flex align-items-center justify-content-between pt-1">
                            <span class="badge rounded-pill notif-badge">${cfg.badgeText}</span>
                            ${!isRead ? `
                                <button type="button" class="btn btn-sm btn-link p-0 text-decoration-none d-flex align-items-center gap-1 text-primary fw-semibold notif-action-btn" data-action="notifications:mark_as_read" data-id="${safeId}">
                                    <i class="bi bi-check2"></i> Marcar leída
                                </button>
                            ` : `
                                <span class="text-muted d-flex align-items-center gap-1 notif-read-indicator">
                                    <i class="bi bi-check2-all text-success"></i> Leída
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza la estructura HTML de la bandeja de notificaciones
     */
    render(notifications = [], tabOverride = null) {
        const user = sessionState.get().user;
        const currentUid = user?.uid;
        const activeTab = tabOverride || _activeTab;

        const totalNotifications = Array.isArray(notifications) ? notifications : [];
        
        const unreadCount = totalNotifications.filter(n => !n.read_by?.includes(currentUid)).length;
        const systemCount = totalNotifications.filter(n => n.type === 'error' || n.type === 'warning' || n.author_id === 'system').length;

        let filtered = totalNotifications;
        if (activeTab === 'unread') filtered = totalNotifications.filter(n => !n.read_by?.includes(currentUid));
        else if (activeTab === 'system') filtered = totalNotifications.filter(n => n.type === 'error' || n.type === 'warning' || n.author_id === 'system');

        // Agrupación por Área (target_tenant)
        const grouped = filtered.reduce((acc, n) => {
            const area = n.target_tenant || 'General';
            if (!acc[area]) acc[area] = [];
            acc[area].push(n);
            return acc;
        }, {});

        const hasItems = filtered.length > 0;

        return `
            <div id="panel-notifications" class="glass-panel glass-panel--standard notification-tray-panel">
                <div class="sheet-drag-handle d-md-none mx-auto my-1 rounded-pill" style="width: 40px; height: 4px; background: rgba(148, 163, 184, 0.4);"></div>
                <div class="panel-header d-flex align-items-center justify-content-between pb-2">
                    <div class="d-flex align-items-center gap-2">
                        <div class="notif-header-icon-box d-flex align-items-center justify-content-center rounded-circle">
                            <i class="bi bi-bell-fill"></i>
                        </div>
                        <span class="fw-bold text-main notif-header-title">Notificaciones</span>
                    </div>
                    ${unreadCount > 0 ? `<span class="badge bg-primary text-white rounded-pill px-2 py-1 x-small fw-bold pulse-notif notif-badge-pill">${unreadCount} ${unreadCount === 1 ? 'nueva' : 'nuevas'}</span>` : '<span class="badge bg-secondary-subtle text-muted rounded-pill px-2 py-0.5 notif-badge-pill">Al día</span>'}
                </div>

                <div class="tray-filter-tabs px-3 py-2 d-flex align-items-center gap-1 border-bottom">
                    <button type="button" class="tray-tab-btn btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${activeTab === 'all' ? 'active-tab' : 'text-muted'}" data-action="tray:filter_tab" data-tab="all">Todas (${totalNotifications.length})</button>
                    <button type="button" class="tray-tab-btn btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${activeTab === 'unread' ? 'active-tab' : 'text-muted'}" data-action="tray:filter_tab" data-tab="unread">No leídas ${unreadCount > 0 ? `(${unreadCount})` : ''}</button>
                    <button type="button" class="tray-tab-btn btn btn-sm rounded-pill px-2.5 py-0.5 border-0 ${activeTab === 'system' ? 'active-tab' : 'text-muted'}" data-action="tray:filter_tab" data-tab="system">Sistema ${systemCount > 0 ? `(${systemCount})` : ''}</button>
                </div>

                <!-- CONTENEDOR SCROLL GLOBAL UNIFICADO -->
                <div class="buca-scroll-area buca-scroll-area--md">
                    ${hasItems ? Object.entries(grouped).map(([area, items]) => `
                        <div class="notification-group mb-3">
                            <div class="area-header px-3 py-1 text-muted d-flex align-items-center justify-content-between">
                                <span class="fw-bold">${area}</span>
                                <span>${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
                            </div>
                            <div class="notifications-list p-2">
                                ${items.map(n => this._renderNotification(n, currentUid)).join('')}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="panel-empty py-5 text-center">
                            <i class="bi bi-bell-slash fs-2 text-muted opacity-50"></i>
                            <p class="text-muted small mt-2">No hay notificaciones</p>
                        </div>
                    `}
                </div>

                <div class="panel-footer panel-footer-clean p-2 border-top d-flex align-items-center justify-content-between">
                    ${unreadCount > 0 ? `
                        <button type="button" class="btn btn-link btn-sm text-decoration-none x-small fw-bold text-primary p-0" data-action="ui:clear_notifications">
                            <i class="bi bi-check2-all me-1"></i> Marcar todas leídas
                        </button>
                    ` : '<span class="text-muted x-small">Todas revisadas</span>'}
                    <button type="button" class="btn btn-link btn-sm text-decoration-none x-small text-muted p-0" data-action="ui:open_activity_log">
                        <i class="bi bi-clock-history me-1"></i> Historial
                    </button>
                </div>
            </div>
        `;
    }
};

export default NotificationTray;
