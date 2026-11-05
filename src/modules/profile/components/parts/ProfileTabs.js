/**
 * ProfileTabs - Navegación modular por pestañas para el perfil de usuario.
 */
export const ProfileTabs = (activeTab = 'general') => {
    const tabs = [
        { id: 'general', icon: 'bi-person-vcard-fill', label: 'Identidad General' },
        { id: 'worker', icon: 'bi-briefcase-fill', label: 'Talento & Ficha' },
        { id: 'monitoring', icon: 'bi-graph-up-arrow', label: 'Monitoreo' },
        { id: 'subscription', icon: 'bi-gem', label: 'Suscripción ERP' },
        { id: 'security', icon: 'bi-shield-lock-fill', label: 'Seguridad & PIN' },
        { id: 'devices', icon: 'bi-laptop-fill', label: 'Dispositivos & Sesiones' }
    ];

    return `
        <div class="modal-nav-tabs mb-4 p-1.5 rounded-4 bg-surface border shadow-xs" id="profile-modal-tabs">
            ${tabs.map(tab => `
                <button type="button" class="modal-nav-tab ${activeTab === tab.id ? 'active' : ''} flex-fill" data-tab="${tab.id}">
                    <i class="bi ${tab.icon} me-1.5"></i>
                    <span>${tab.label}</span>
                </button>
            `).join('')}
        </div>
    `;
};

export default ProfileTabs;
