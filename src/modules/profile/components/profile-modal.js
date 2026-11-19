/**
 * ProfileModal - Orquestador modular del modal de perfil de usuario
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo de perfil.
 */
import ModalService from '@/shared/ui/services/ModalService.js';
import { userProfileFullTemplate } from '../templates/_user_profile.js';
import ProfileController from '../ProfileController.js';
import { sessionState } from '@/core/state/session.js';
import { ProfileService } from '../services/ProfileService.js';

export const ProfileModal = {
    async show(initialTab = 'general') {
        const sessionUser = sessionState.get().user || {};
        let profileData = null;
        if (sessionUser.uid) {
            profileData = await ProfileService.getProfile(sessionUser.uid);
        }

        const userData = {
            uid: sessionUser.uid || '',
            email: sessionUser.email || '',
            displayName: sessionUser.displayName || '',
            profile: profileData || {},
            security: {
                two_factor_enabled: sessionUser.two_factor_enabled || false
            }
        };

        ModalService.showModal({
            size: 'lg',
            header: ModalService.buildHeader({
                icon: 'bi-person-badge',
                title: 'Perfil de Operador & Identidad',
                subtitle: 'CONFIGURACIÓN DE CUENTA Y SEGURIDAD BUCA AI'
            }),
            body: userProfileFullTemplate(userData),
            footer: {
                right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Cerrar</button>'
            },
            onOpen: () => {
                if (ProfileController && typeof ProfileController.init === 'function') {
                    ProfileController.init(initialTab);
                }
            }
        });
    }
};

export default ProfileModal;
