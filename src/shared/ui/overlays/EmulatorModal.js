import { storage } from '@/core/storage/StorageAdapter.js';
import ModalService from './ModalService.js';

/**
 * EmulatorModal - Aviso de Seguridad para Entornos de Desarrollo
 * =========================================================================
 * Muestra una advertencia persistente cuando el sistema detecta que está
 * corriendo sobre los Firebase Emulators.
 */
class EmulatorModal {
    constructor() {
        this.overlay = null;
    }

    /**
     * Muestra el modal si no ha sido aceptado permanentemente.
     */
    show() {
        ModalService.showModal({
            size: 'sm',
            header: { left: '<h3><i class="bi bi-shield-exclamation text-warning"></i> Modo Emulador</h3>' },
            body: `
                <p class="mb-0 text-main">
                    Se ha detectado que <strong>BUCA ERP</strong> está operando en un entorno local con 
                    <strong>Firebase Emulators</strong>. 
                </p>
                <div class="alert alert-warning mt-3 p-3 small text-main">
                    <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                    <span>No utilice credenciales de producción. Los datos son volátiles y locales.</span>
                </div>
            `,
            footer: {
                left: '<button class="btn btn-ghost" data-action="ui:close_modal">Ignorar</button>',
                right: '<button class="btn btn-primary px-4" id="emu-ok-btn">Entendido</button>'
            }
        });
        
        // Bind events
        document.getElementById('emu-ok-btn').onclick = async () => {
            await storage.set('emulator_warning_accepted', true);
            ModalService.hideModal();
        };
    }

}

export default new EmulatorModal();
