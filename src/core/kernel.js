/**
 * @fileoverview Kernel Central del Ecosistema Operativo BUCA
 * @module core/kernel
 * @description Orquestador central de arranque, estado de sesión, sincronización reactiva
 * de layouts y ciclo de vida del sistema sin dependencias circulares ni acoplamientos a módulos de negocio.
 */

import { eventBus } from './eventBus/index.js';
import { uiState } from '@/core/state/ui.js';
import { Header } from '@/shared/ui/layouts/components/TopBar.js';
import { Dock } from '@/shared/ui/layouts/components/DockableNavbar.js';
import { MainLayout } from '@/shared/ui/layouts/MainLayout.js';
import GraphicsEngine from '@/core/engine/engine.js';
import { initSupabase } from '@/core/config/supabase.js';
import { Logger } from '@/shared/utils/logger.js';
import { ThemeManager } from '@/core/services/ThemeManager.js';
import { NotificationService } from '@/core/services/NotificationService.js';
import { ActivityLogService } from '@/core/services/ActivityLogService.js';
import { ActionDispatcher } from '@/core/services/ActionDispatcher.js';
import ModuleLoader from '@/core/ModuleLoader.js';
import { router } from '@/core/router/router.js';
import { RouterGuards } from '@/core/router/guards.js';
import { routes } from '@/core/router/routes.js';
import { AuthService } from '@/modules/auth/services/AuthService.js';
import { storage } from '@/core/storage/StorageAdapter.js';
import ModalService from '@/shared/ui/services/ModalService.js';
import SharedActions from '@/shared/ui/services/shared-actions.js';
import TooltipService from '@/shared/ui/services/tooltip-service.js';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import { SearchService } from '@/core/services/SearchService.js';
import { KeyboardShortcuts } from '@/core/services/KeyboardShortcuts.js';
import { getPath, replaceHistory, isBrowser } from '@/core/utils/index.js';
import { $id, $mount, $attr, $addClass, $$, $text, $className, $on } from '@/shared/utils/dom.js';
import preloaderController from '@/shared/ui/overlays/preloader-controller.js';

const AUTH_SHELL_PATHS = new Set([
    '/auth/login', '/auth/register', '/auth/recovery',
    '/auth/recovery/reset-password', '/auth/two-factor',
    '/auth/verify-email', '/auth/callback', '/auth/logout', '/auth/unauthorized'
]);

class Kernel {
    constructor() {
        this.isInitialized = false;
        this.currentLayoutMode = null;
        this._cleanups = [];
        this._hideSplashTimer = null;
        this._splashCleanTimer = null;
    }

    /**
     * Orquesta el arranque integral del Kernel y sus subsistemas.
     * @returns {Promise<void>}
     */
    async boot() {
        if (this.isInitialized) return;

        const updatePhase = (pct, phaseId, title, description, state = phaseId) => {
            eventBus.emit('kernel:boot:progress', pct);
            preloaderController.updateStatus({ phaseId, state, title, description, progress: pct });
        };

        try {
            updatePhase(10, 'engine', 'Motor Gráfico', 'Calibrando hardware y perfil BENE...');

            // 1. Motores Gráficos y Almacenamiento Local
            let engineResponse;
            try {
                engineResponse = await GraphicsEngine.init();
            } catch (engineErr) {
                Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: 'Fallo al inicializar GraphicsEngine; usando perfil L2 por defecto.', data: engineErr });
                engineResponse = { tier: 'L2', profile: 'balanced' };
            }
            storage.init(engineResponse?.tier || 'L2');
            updatePhase(20, 'engine', 'Motor Gráfico', 'Aplicando nivel de renderizado BENE...');
            GraphicsEngine.scan();

            updatePhase(30, 'database', 'Base de Datos', 'Estableciendo conexión con Supabase Cloud...');

            // 2. Conectividad Cloud y Servicios Base
            try {
                await initSupabase();
            } catch (e) {
                Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: 'Inicialización de Supabase diferida durante el arranque.', data: e?.message || e });
            }

            updatePhase(40, 'database', 'Base de Datos', 'Sincronizando telemetría y notificaciones...');
            await ThemeManager.init();
            NotificationService.init();
            ActivityLogService.init();

            updatePhase(50, 'auth', 'Sesión', 'Verificando credenciales y estado de sesión...');

            // 3. Auth-First Gate: Validar sesión de Supabase ANTES de pintar cualquier Layout
            await ModuleLoader.load('auth');
            const sessionCheck = await AuthService.checkSession();
            const isAuthenticated = Boolean(sessionCheck?.isAuthenticated);

            let initialPath = getPath();
            const isExplicitAuthPath = AUTH_SHELL_PATHS.has(initialPath);

            // Gate Estricto: Si la ruta requiere autenticación y no hay sesión, guardar returnUrl y forzar /auth/login
            if (!isAuthenticated && !isExplicitAuthPath) {
                RouterGuards.setReturnUrl(initialPath);
                initialPath = '/auth/login';
                replaceHistory('/auth/login');
            }

            updatePhase(70, 'layout', 'Interfaz', 'Construyendo estructura de interfaz autorizada...');

            // 4. Renderizar ÚNICAMENTE el Layout que corresponde al estado de sesión verificado
            await this._renderMainLayout(initialPath, isExplicitAuthPath ? 'auth' : 'workspace');

            if (isAuthenticated && !isExplicitAuthPath) {
                Header.init('topbar-slot');
                Dock.init('dock-slot');
            }

            updatePhase(85, 'modules', 'Módulos', 'Cargando módulos del sistema y enrutador...');

            // 5. Carga de módulos según el contexto de sesión
            const modulesToLoad = isAuthenticated 
                ? ['workspace', 'finance', 'business', 'profile']
                : [];
            if (modulesToLoad.length > 0) {
                await Promise.allSettled(modulesToLoad.map(m => ModuleLoader.load(m)));
            }

            // 6. Servicios de Interfaz y Enrutamiento
            ModalService.init();
            SharedActions.init();
            ActionDispatcher.init();
            SearchService.init();
            TooltipService.init();

            // Sincronización desacoplada de tasas mediante EventBus (cero importación de finance)
            if (isAuthenticated) {
                eventBus.emit('finance:sync-rates');
            }

            const offTheme = eventBus.on('ui:toggle_theme', () => ThemeManager.toggle());
            const offRecalibrate = eventBus.on('engine:recalibrate', () => GraphicsEngine.calibrate());
            const offLayoutSync = eventBus.on('router:layout-sync-required', async ({ path, layout }) => {
                await this.handleLayoutSync(path, layout);
            });
            this._cleanups.push(offTheme, offRecalibrate, offLayoutSync);

            updatePhase(95, 'router', 'Enrutador', 'Montando vista final y componente de ruta...');

            // 7. Inicializar Router (Monta el componente en el slot correspondiente)
            await router.init(routes);
            this.startTelemetry();

            this.isInitialized = true;
            PerformanceStorage.recordLoadTime(performance.now(), GraphicsEngine.profile);
            updatePhase(100, 'ready', 'Sistema', '¡Sistema Operativo Listo!', 'success');

            this._finalizeBoot();
        } catch (err) {
            Logger.critical({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '🚨', message: 'Fallo crítico durante el arranque del sistema.', data: err });
            try {
                this.destroy();
            } catch (cleanupErr) {
                Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: 'Error limpiando recursos tras fallo de arranque.', data: cleanupErr });
            }
            throw err;
        }
    }

    /**
     * Renderiza de forma segura el layout base sin utilizar innerHTML directo.
     * @param {string} [targetPath]
     */
    async _renderMainLayout(targetPath, explicitLayout = null) {
        const appContainer = $id('app');
        if (!appContainer) return;

        const path = targetPath || getPath();
        const isAuth = explicitLayout ? explicitLayout === 'auth' : path.startsWith('/auth');
        const mode = isAuth ? 'auth' : 'workspace';

        if (this.currentLayoutMode === mode && $id(isAuth ? 'auth-content-slot' : 'workspace-dynamic-content')) return;
        this.currentLayoutMode = mode;
        $attr(document.body, 'data-layout-mode', mode);

        if (isAuth) {
            const { AuthLayout } = await import('@/shared/ui/layouts/AuthLayout.js');
            $mount(appContainer, AuthLayout.render());
            if (AuthLayout.init) AuthLayout.init();
        } else {
            $mount(appContainer, MainLayout.render());
            if (MainLayout.init) MainLayout.init();
        }
    }

    /**
     * Sincroniza el layout ante transiciones de ruta que demandan cambio estructural.
     * @param {string} path 
     */
    async handleLayoutSync(path, layout = null) {
        await this._renderMainLayout(path, layout);
        if (this.currentLayoutMode === 'workspace') {
            await Promise.allSettled(['workspace', 'finance', 'business', 'profile'].map(m => ModuleLoader.load(m)));
            Header.init('topbar-slot');
            Dock.init('dock-slot');
        }
        eventBus.emit('kernel:layout-ready', { path, mode: this.currentLayoutMode });
    }

    /**
     * Oculta el Preloader global con animación de disolución y limpieza de DOM.
     */
    hideSplash() {
        const preloader = $id('global-preloader');
        preloaderController.destroy();
        if (!preloader || preloader._isExiting) return;
        preloader._isExiting = true;

        $addClass(preloader, 'preloader--fade-out');

        const cleanUp = () => {
            if (this._splashCleanTimer) {
                clearTimeout(this._splashCleanTimer);
                this._splashCleanTimer = null;
            }
            if (preloader.parentNode) preloader.remove();
        };

        $on(preloader, 'animationend', cleanUp, { once: true });
        this._splashCleanTimer = setTimeout(cleanUp, 450);
    }

    async _finalizeBoot() {
        if (isBrowser()) {
            document.dispatchEvent(new CustomEvent('buca:app-ready'));
        }
        await preloaderController.whenIdle();
        requestAnimationFrame(() => {
            $addClass(document.body, 'app-ready');
            this._hideSplashTimer = setTimeout(() => {
                this._hideSplashTimer = null;
                this.hideSplash();
            }, 220);
            eventBus.emit('kernel:ready', { timestamp: Date.now() });
        });
    }

    startTelemetry() {
        const offTelemetry = uiState.subscribe((state) => {
            if (state.graphics) {
                $$('[data-perf="profile-badge"]').forEach(b => {
                    $text(b, state.graphics.id);
                    $className(b, `badge badge--${state.graphics.tier}`);
                });
            }
        });
        if (typeof offTelemetry === 'function') {
            this._cleanups.push(offTelemetry);
        }
    }

    updateSplashProgress(percent) {
        preloaderController.setProgress(percent);
        eventBus.emit('kernel:boot:progress', percent);
    }

    destroy() {
        this.isInitialized = false;
        this.currentLayoutMode = null;
        if (this._hideSplashTimer) {
            clearTimeout(this._hideSplashTimer);
            this._hideSplashTimer = null;
        }
        if (this._splashCleanTimer) {
            clearTimeout(this._splashCleanTimer);
            this._splashCleanTimer = null;
        }
        preloaderController.destroy();

        while (this._cleanups.length > 0) {
            const cleanupFn = this._cleanups.pop();
            try {
                if (typeof cleanupFn === 'function') cleanupFn();
            } catch (err) {
                Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: 'Error liberando suscripción registrada en Kernel.', data: err });
            }
        }

        const services = [
            ['NotificationService', NotificationService], ['ActivityLogService', ActivityLogService],
            ['SearchService', SearchService], ['KeyboardShortcuts', KeyboardShortcuts],
            ['ActionDispatcher', ActionDispatcher], ['SharedActions', SharedActions],
            ['ModalService', ModalService], ['TooltipService', TooltipService], ['ThemeManager', ThemeManager],
        ];
        for (const [name, svc] of services) {
            try {
                if (svc && typeof svc.destroy === 'function') svc.destroy();
            } catch (e) {
                Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: `Error al desmontar el servicio ${name}.`, data: e });
            }
        }

        try { router?.destroy?.(); } catch (e) {
            Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: 'Error al desmontar el enrutador SPA.', data: e });
        }
        try { GraphicsEngine?.destroy?.(); } catch (e) {
            Logger.warn({ layer: 'KERNEL', role: 'CLASS', target: 'Kernel', icon: '⚠️', message: 'Error al desmontar GraphicsEngine.', data: e });
        }
    }
}

export const kernel = new Kernel();
export default kernel;
