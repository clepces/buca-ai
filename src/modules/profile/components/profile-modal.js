/**
 * ProfileModal - Orquestador modular del modal de perfil de usuario
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo de perfil.
 */
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';
import { renderButton } from '@/shared/ui/primitives/ui-button.js';
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

        modalServiceV2.showModal({
            id: 'profile-modal',
            scope: 'module',
            size: 'lg',
            header: {
                left: {
                    icon: 'bi-person-badge',
                    title: 'Perfil de Operador & Identidad',
                    subtitle: 'Configuración de cuenta y seguridad BUCA AI'
                }
            },
            body: {
                html: userProfileFullTemplate(userData)
            },
            footer: {
                right: renderButton({ variant: 'primary', pill: true, label: 'Cerrar', action: 'ui:close_modal' })
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
