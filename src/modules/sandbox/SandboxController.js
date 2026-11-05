/**
 * @fileoverview SandboxController - Gestor del Módulo de Pruebas
 */

import { ExperimentalDock } from './components/ExperimentalDock.js';

export class SandboxController {
    static async show() {
        const { ModalService } = await import('@/shared/ui/overlays/ModalService.js');
        const dock = new ExperimentalDock();

        ModalService.showModal({
            size: 'full',
            header: {
                left: `
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-bug-fill text-danger fs-5"></i>
                        <div>
                            <h2 class="h6 fw-bold mb-0">MODO SANDBOX / TEST AREA</h2>
                            <span class="text-muted small">PRUEBAS DE COMPONENTES EXPERIMENTALES</span>
                        </div>
                    </div>
                `
            },
            body: `
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
            `,
            lifecycleId: 'sandbox-test-area',
            destroyCallback: () => {
                dock.destroy();
            }
        });

        // Inicializar lógica después de inyectar al DOM
        setTimeout(() => dock.init(), 100);
    }
}
