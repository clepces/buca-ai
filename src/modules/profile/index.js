/**
 * Módulo de Perfil & Identidad BUSA-I
 * =========================================================================
 * Responsable de la gestión del perfil del operador, ficha laboral,
 * configuración de seguridad, PIN universal y dispositivos confiables.
 */
import { eventBus } from '@/core/eventBus/index.js';
import ProfileController from './ProfileController.js';
import { userProfileFullTemplate } from './templates/_user_profile.js';

export const ProfileModule = {
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        console.log('[ProfileModule] -> Inicializado módulo de perfil');

        // Escuchar eventos de apertura del perfil
        eventBus.on('profile:open_modal', (data) => {
            const tab = data?.tab || 'general';
            ProfileController.init(tab);
        });
    },

    ProfileController,
    userProfileFullTemplate
};

export default ProfileModule;
