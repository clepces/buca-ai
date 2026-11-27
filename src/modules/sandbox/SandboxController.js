/**
 * @fileoverview SandboxController - Gestor del Módulo de Pruebas
 */

import { ExperimentalDock } from './components/ExperimentalDock.js';
import ModalService from '@/shared/ui/services/ModalService.js';

export class SandboxController {
    static async show() {
        const dock = new ExperimentalDock();

        ModalService.showModal({
            id: 'sandbox-test-area',
            scope: 'module',
            size: 'full',
            header: {
                left: {
                    icon: 'bi-bug-fill',
                    title: 'MODO SANDBOX / TEST AREA',
                    subtitle: 'Pruebas de componentes experimentales',
                    badge: { text: 'LAB', tone: 'warning' }
                }
            },
            body: {
                html: `
                <div class="sandbox-workspace h-100 d-flex flex-column align-items-center justify-content-center position-relative">
                    <div class="test-label text-white-50 mb-5 text-center">
                        <h3 class="h4">Laboratorio de UI</h3>
                        <p>Prueba el nuevo Dock Magnético debajo. Mueve el ratón sobre los iconos.</p>
                    </div>
                    
                    ${dock.render()}

                    <div class="sandbox-stats position-absolute top-0 end-0 p-4 text-white-50 small">
                        <div>Versión: v1.0-alpha</div>
                        <div>Física: Magnética (Radial)</div>
                    </div>
                </div>
            `
            },
            destroyCallback: () => {
                dock.destroy();
            }
        });

        // Inicializar lógica después de inyectar al DOM
        setTimeout(() => dock.init(), 100);
    }
}
