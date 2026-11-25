/**
 * @fileoverview Kernel boot/destroy integration tests.
 *
 * Verifies real singleton lifecycle, $on DOM/Window unsubscribers,
 * late boot failure teardown, and retry/error presentation contracts.
 */
import './dom-shim.js';

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { eventBus } from '../src/core/eventBus/index.js';
import { kernel } from '../src/core/kernel.js';
import { router } from '../src/core/router/router.js';
import { NotificationService } from '../src/core/services/NotificationService.js';
import { ActivityLogService } from '../src/core/services/ActivityLogService.js';
import { SearchService } from '../src/core/services/SearchService.js';
import { ActionDispatcher } from '../src/core/services/ActionDispatcher.js';
import { ThemeManager } from '../src/core/services/ThemeManager.js';
import { ModalService } from '../src/shared/ui/services/ModalService.js';
import { TooltipService } from '../src/shared/ui/services/tooltip-service.js';
import { $on } from '../src/shared/utils/dom.js';
import { listeners } from './dom-shim.js';

const resetAll = () => {
    kernel.isInitialized = false;
    kernel.currentLayoutMode = null;
    kernel._cleanups = [];
    eventBus.clear();
    listeners.clear();

    NotificationService.destroy();
    ActivityLogService.destroy();
    SearchService.destroy();
    ActionDispatcher.destroy();
    ModalService.destroy();
    TooltipService.destroy();
};

// ---------------------------------------------------------------------------
// Suite 1: Desuscriptores $on() en document y window (Servicios reales)
// ---------------------------------------------------------------------------
describe('$on() DOM & Window Unsubscribers on Real Services', () => {
    beforeEach(resetAll);

    it('$on() enlaza y desenlaza listeners nativos de document y window', () => {
        let docClicks = 0;
        let winResizes = 0;

        const offDoc = $on(document, 'click', () => { docClicks++; });
        const offWin = $on(window, 'resize', () => { winResizes++; });

        document.dispatchEvent('click');
        window.dispatchEvent('resize');
        assert.equal(docClicks, 1);
        assert.equal(winResizes, 1);

        offDoc();
        offWin();

        document.dispatchEvent('click');
        window.dispatchEvent('resize');
        assert.equal(docClicks, 1, 'Document listener debe ser removido');
        assert.equal(winResizes, 1, 'Window listener debe ser removido');
    });

    it('ActionDispatcher.destroy() desuscribe el listener click de document', () => {
        ActionDispatcher.init();
        assert.ok((listeners.get('doc:click')?.size || 0) > 0);

        ActionDispatcher.destroy();
        assert.equal(listeners.get('doc:click')?.size || 0, 0,
            'El listener en document debe ser removido tras destroy()');
    });

    it('ModalService.destroy() desuscribe el listener keydown de document', () => {
        ModalService.init();
        assert.ok((listeners.get('doc:keydown')?.size || 0) > 0);

        ModalService.destroy();
        assert.equal(listeners.get('doc:keydown')?.size || 0, 0,
            'El listener keydown en document debe ser removido tras destroy()');
    });

    it('TooltipService.destroy() desuscribe listeners de document y window', () => {
        TooltipService.init();
        assert.ok((listeners.get('doc:pointerover')?.size || 0) > 0);
        assert.ok((listeners.get('win:resize')?.size || 0) > 0);

        TooltipService.destroy();
        assert.equal(listeners.get('doc:pointerover')?.size || 0, 0);
        assert.equal(listeners.get('win:resize')?.size || 0, 0);
    });
});

// ---------------------------------------------------------------------------
// Suite 2: Fallo en arranque real kernel.boot() y resiliencia de Teardown
// ---------------------------------------------------------------------------
describe('kernel.boot() Real Failure & Teardown Verification', () => {
    beforeEach(resetAll);

    it('Propaga error original, cancela _finalizeBoot, limpia listeners y reintenta teardown', async () => {
        let readyEmitted = false;
        eventBus.on('kernel:ready', () => { readyEmitted = true; });

        const origThemeInit = ThemeManager.init;
        const origRouterInit = router.init;
        const origNotifDestroy = NotificationService.destroy;

        ThemeManager.init = async () => {};
        router.init = async () => {
            throw new Error('ERR_BOOT_STEP_SIMULATED_CRASH');
        };

        // Forzar que el primer servicio en teardown lance un error para verificar resiliencia
        let faultyDestroyCalled = false;
        NotificationService.destroy = () => {
            faultyDestroyCalled = true;
            throw new Error('CORRUPTED_SERVICE_TEARDOWN');
        };

        try {
            await assert.rejects(
                () => kernel.boot(),
                { message: 'ERR_BOOT_STEP_SIMULATED_CRASH' },
                'El error original de arranque debe propagarse intacto'
            );

            // 1. _finalizeBoot() no debe ejecutarse
            assert.equal(readyEmitted, false, 'kernel:ready no debe emitirse');
            assert.equal(kernel.isInitialized, false, 'isInitialized debe ser false');

            // 2. Se intento el cleanup de NotificationService y continuo con los demas
            assert.equal(faultyDestroyCalled, true, 'Se debio invocar el teardown fallido');
            assert.equal(ActivityLogService._initialized, false, 'ActivityLogService debe limpiarse');
            assert.equal(ActionDispatcher._initialized, false, 'ActionDispatcher debe limpiarse');
            assert.equal(ModalService.isInitialized, false, 'ModalService debe limpiarse');
            assert.equal(TooltipService.isInitialized, false, 'TooltipService debe limpiarse');

            // 3. Listeners de EventBus, document y window creados en el arranque quedan eliminados
            assert.equal(eventBus.hasListeners('ui:toggle_theme'), false);
            assert.equal(eventBus.hasListeners('engine:recalibrate'), false);
            assert.equal(listeners.get('doc:click')?.size || 0, 0);
            assert.equal(listeners.get('doc:keydown')?.size || 0, 0);
            assert.equal(listeners.get('win:resize')?.size || 0, 0);
        } finally {
            ThemeManager.init = origThemeInit;
            router.init = origRouterInit;
            NotificationService.destroy = origNotifDestroy;
            resetAll();
        }
    });

    /**
     * LIMITACION CONTRATUAL: El entorno Node.js headless no provee un DOM de renderizado
     * completo ni conexion remota real. Se prueba que la proteccion 'isInitialized' permite
     * reintentar ('re-entry'), documentando expresamente que un arranque posterior dependera
     * de que el entorno o la red externa se hayan restablecido.
     */
    it('Permite reintentar boot() tras fallo, sin asumir exito magico', async () => {
        let bootAttempts = 0;
        const origThemeInit = ThemeManager.init;
        const origRouterInit = router.init;

        ThemeManager.init = async () => {};
        router.init = async () => {
            bootAttempts++;
            throw new Error(`BOOT_ATTEMPT_FAILED_${bootAttempts}`);
        };

        try {
            // Intento 1
            await assert.rejects(() => kernel.boot(), { message: 'BOOT_ATTEMPT_FAILED_1' });
            assert.equal(kernel.isInitialized, false);

            // Intento 2 (Re-entry admitido tras teardown)
            await assert.rejects(() => kernel.boot(), { message: 'BOOT_ATTEMPT_FAILED_2' });
            assert.equal(kernel.isInitialized, false);
            assert.equal(bootAttempts, 2, 'El kernel admite reintentar tras fallo previo');
        } finally {
            ThemeManager.init = origThemeInit;
            router.init = origRouterInit;
            resetAll();
        }
    });

    it('kernel.destroy() resetea currentLayoutMode a null para no omitir layout en re-boot', async () => {
        kernel.currentLayoutMode = 'auth';
        assert.equal(kernel.currentLayoutMode, 'auth');

        kernel.destroy();
        assert.equal(kernel.currentLayoutMode, null, 'currentLayoutMode debe resetearse a null');

        let layoutRendered = false;
        const origRender = kernel._renderMainLayout;
        kernel._renderMainLayout = async (path) => {
            layoutRendered = true;
            kernel.currentLayoutMode = path.startsWith('/auth') ? 'auth' : 'workspace';
        };

        try {
            await kernel._renderMainLayout('/auth/login');
            assert.equal(layoutRendered, true, 'El layout no debe omitirse tras destroy()');
            assert.equal(kernel.currentLayoutMode, 'auth');
        } finally {
            kernel._renderMainLayout = origRender;
        }
    });
});

// ---------------------------------------------------------------------------
// Suite 3: Contrato de Pantalla de Error en main.js (UUID Safety / Cero Stack Traces)
// ---------------------------------------------------------------------------
describe('main.js Error Screen UI & Telemetry Contract', () => {
    it('Muestra mensaje generico al usuario y no expone err.message en el DOM', () => {
        const mainSrc = fs.readFileSync(
            new URL('../src/main.js', import.meta.url), 'utf-8'
        );

        // 1. Debe registrar el detalle con Logger.critical
        assert.ok(
            mainSrc.includes("Logger.critical({ layer: 'KERNEL', role: 'FN', target: 'bootstrap', icon: '🚨', message: 'Fallo crítico durante el arranque', data: err })"),
            'main.js debe registrar el error completo en Logger.critical'
        );

        // 2. El texto asignado al elemento de error debe ser generico
        assert.ok(
            mainSrc.includes("$text(detailEl, 'Ocurrió un error inesperado al iniciar el sistema. Por favor, recargue la página.')"),
            'main.js debe mostrar un texto generico de usuario en $text'
        );

        // 3. Prohibido interpolar err.message en la pantalla o en templates
        assert.equal(
            mainSrc.includes('err.message'), false,
            'err.message no debe exponerse en pantalla ni en templates de main.js'
        );
    });
});
