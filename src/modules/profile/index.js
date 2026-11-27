/**
 * Módulo de Perfil & Identidad BUSA-I
 * =========================================================================
 * Responsable de la gestión del perfil del operador, ficha laboral,
 * configuración de seguridad, PIN universal y dispositivos confiables.
 */
import { eventBus } from '@/core/eventBus/index.js';
import { Logger } from '@/shared/utils/logger.js';
import ProfileController from './ProfileController.js';
import { userProfileFullTemplate } from './templates/_user_profile.js';

export const ProfileModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        Logger.info({ layer: 'MODULE', role: 'CLASS', target: 'Profile', message: 'Módulo de perfil inicializado.' });

        const openProfileTab = async (tab = 'general') => {
            const { ProfileModal } = await import('./components/profile-modal.js');
            ProfileModal.show(tab);
        };

        // Escuchar eventos de apertura del perfil
        eventBus.on('profile:open_modal', (data) => {
            const tab = data?.tab || 'general';
            ProfileController.init(tab);
        });
        eventBus.on('profile:open', (p) => openProfileTab(p?.tab || 'general'));
    },

    ProfileController,
    userProfileFullTemplate
};

export default ProfileModule;
