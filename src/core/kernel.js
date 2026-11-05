/**
 * @fileoverview Kernel Central del Ecosistema Operativo BUCA (Refactorizado)
 * @module core/kernel
 */

import { eventBus } from './eventBus/index.js';
import { uiState } from '@/core/state/ui.js';
import { Header } from '@/shared/ui/layouts/components/TopBar.js';
import { Dock } from '@/shared/ui/layouts/components/DockableNavbar.js';
import { MainLayout } from '@/shared/ui/layouts/MainLayout.js';
import GraphicsEngine from '@/core/engine/engine.js';
import { initFirebase } from '@/core/config/firebase.js';
import EmulatorModal from '@/shared/ui/overlays/EmulatorModal.js';
import { Logger } from '@/shared/utils/logger.js';
import { ThemeManager } from '@/core/services/ThemeManager.js';
import { NotificationService } from '@/core/services/NotificationService.js';
import { ActionDispatcher } from '@/core/services/ActionDispatcher.js';
import ModuleLoader from '@/core/ModuleLoader.js';
import { router } from '@/core/router/router.js';
import { routes } from '@/core/router/routes.js';
import { storage } from '@/core/storage/StorageAdapter.js';
import ModalService from '@/shared/ui/overlays/ModalService.js';
import { PerformanceStorage } from '@/core/storage/PerformanceStorage.js';
import { DolarVzlaService } from './services/DolarVzlaService.js';
import { FinanceRepository } from '@/modules/finance/services/FinanceRepository.js';
import { sessionState } from '@/core/state/session.js';
import { SearchService } from '@/core/services/SearchService.js';

class BucaKernel {
    constructor() {
        this.isInitialized = false;
        this.currentLayoutMode = null;
    }

    async boot() {
        if (this.isInitialized) return;

        const bootTimeout = setTimeout(() => {
            if (!this.isInitialized) this._finalizeBoot();
        }, 10000);

        const updateStatus = (pct, text) => {
            this.updateSplashProgress(pct);
            const statusEl = document.getElementById('splash-status');
            if (statusEl) statusEl.textContent = text;
        };

        try {
            updateStatus(10, 'Inicializando Motor de Interfaz & Esqueleto SPA...');

            // 1. Base UI
            await this._renderMainLayout();
            updateStatus(25, 'Calibrando Motor Gráfico & Grados de Rendimiento...');

            // 2. Engines
            let engineResponse;
            try {
                engineResponse = await GraphicsEngine.init();
            } catch (engineErr) {
                Logger.warn('[Kernel] GraphicsEngine fallback init:', engineErr);
                engineResponse = { tier: 'L2', profile: 'balanced' };
            }
            storage.init(engineResponse?.tier || 'L2');
            GraphicsEngine.scan();
            updateStatus(45, 'Estableciendo Conexión con la Base de Datos (Segundo Plano)...');

            // 3. Cloud & Services (Non-blocking background sync)
            try { initFirebase(); } catch (e) {
                Logger.warn('[Kernel] Firebase initialization deferred:', e.message);
            }
            updateStatus(60, 'Cargando Preferencias de Usuario & Tema...');

            // 4. Preferences & UI Init
            await ThemeManager.init();
            NotificationService.init();
            const isAuthRoute = window.location.pathname.startsWith('/auth');
            
            if (!isAuthRoute) {
                Header.init('topbar-slot');
                Dock.init('dock-slot');
            }
            
            document.body.setAttribute('data-layout-mode', isAuthRoute ? 'auth' : 'workspace');
            updateStatus(80, 'Cargando Módulos del Sistema & Enrutador...');

            // 5. Modules
            const modulesToLoad = isAuthRoute ? ['auth'] : ['auth', 'workspace', 'finance', 'business', 'profile'];
            await Promise.allSettled(modulesToLoad.map(m => ModuleLoader.load(m)));

            // 6. Navigation & Logic
            ModalService.init();
            ActionDispatcher.init();
            SearchService.init();

            // Background live rate sync (Prioritize Anchored Rate from Finance Module)
            const syncGlobalRate = async () => {
                try {
                    const tenantId = sessionState.get().tenantId || 'default';
                    const anchoredData = await FinanceRepository.getTenantRate(tenantId);
                    
                    if (anchoredData && anchoredData.rate) {
                        console.log('[Kernel] Using Anchored ERP Rate:', anchoredData.rate);
                        eventBus.emit('buca:rate_change', { rate: anchoredData.rate, isAnchored: true });
                        return;
                    }

                    // Fallback to API if no anchored rate
                    const data = await DolarVzlaService.getBCVCurrent();
                    if (data?.current?.usd) {
                        eventBus.emit('buca:rate_change', { rate: data.current.usd, isAnchored: false });
                    }
                } catch (e) {
                    Logger.warn('[Kernel] Live rate sync fallback:', e?.message || e);
                }
            };
            syncGlobalRate();

            eventBus.on('ui:toggle_theme', () => ThemeManager.toggle());
            eventBus.on('engine:recalibrate', () => GraphicsEngine.calibrate());
            
            eventBus.on('router:layout-sync-required', async ({ path }) => {
                await this.handleLayoutSync(path);
            });

            updateStatus(95, 'Sincronizando Rutas & Destino Final...');
            await router.init(routes);
            this.startTelemetry();
            this.handleEmulatorWarning();

            this.isInitialized = true;
            PerformanceStorage.recordLoadTime(performance.now(), GraphicsEngine.profile);
            updateStatus(100, '¡Sistema Operativo Listo!');
        } catch (err) {
            Logger.error('[Kernel] FATAL BOOT:', err);
        } finally {
            clearTimeout(bootTimeout);
            this._finalizeBoot();
        }
    }

    async _renderMainLayout(targetPath) {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        const path = targetPath || window.location.pathname;
        const isAuth = path.startsWith('/auth');
        const mode = isAuth ? 'auth' : 'workspace';

        if (this.currentLayoutMode === mode && document.getElementById(isAuth ? 'auth-content-slot' : 'workspace-dynamic-content')) return;
        this.currentLayoutMode = mode;
        document.body.setAttribute('data-layout-mode', mode);

        if (isAuth) {
            const { AuthLayout } = await import('@/shared/ui/layouts/AuthLayout.js');
            appContainer.innerHTML = AuthLayout.render();
            if (AuthLayout.init) AuthLayout.init();
        } else {
            appContainer.innerHTML = MainLayout.render();
            if (MainLayout.init) MainLayout.init();
        }
    }

    async handleLayoutSync(path) {
        await this._renderMainLayout(path);
        if (this.currentLayoutMode === 'workspace') {
            Header.init('topbar-slot');
            Dock.init('dock-slot');
        }
        eventBus.emit('kernel:layout-ready', { path, mode: this.currentLayoutMode });
    }

    hideSplash() {
        const preloader = document.getElementById('global-preloader');
        if (!preloader || preloader._isExiting) return;
        preloader._isExiting = true;

        preloader.classList.add('preloader--fade-out');

        const cleanUp = () => {
            if (preloader.parentNode) preloader.remove();
        };

        preloader.addEventListener('animationend', cleanUp, { once: true });
        // Fallback de seguridad en caso de que la animación se cancele o no se dispare
        setTimeout(cleanUp, 550);
    }

    _finalizeBoot() {
        requestAnimationFrame(() => {
            document.body.classList.add('app-ready');
            this.hideSplash();
            eventBus.emit('kernel:ready', { timestamp: Date.now() });
        });
    }

    startTelemetry() {
        uiState.subscribe((state) => {
            if (state.graphics) {
                document.querySelectorAll('[data-perf="profile-badge"]').forEach(b => {
                    b.textContent = state.graphics.id;
                    b.className = `badge badge--${state.graphics.tier}`;
                });
            }
        });
    }

    updateSplashProgress(percent) {
        const bar = document.getElementById('splash-progress');
        if (bar) bar.style.setProperty('--buca-progress', `${percent}%`);
        const pct = document.getElementById('splash-percentage');
        if (pct) pct.textContent = `${percent}%`;
        eventBus.emit('kernel:boot:progress', percent);
    }

    handleEmulatorWarning() {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
        storage.get('emulator_warning_accepted').then(accepted => {
            if (!accepted) eventBus.on('kernel:ready', () => setTimeout(() => EmulatorModal.show(), 1500));
        });
    }

    destroy() {
        this.isInitialized = false;
        try {
            if (GraphicsEngine && typeof GraphicsEngine.destroy === 'function') {
                GraphicsEngine.destroy();
            }
            if (router && typeof router.destroy === 'function') {
                router.destroy();
            }
        } catch (e) {
            Logger.warn('[Kernel] Error during teardown:', e);
        }
    }
}

export const kernel = new BucaKernel();
export default kernel;
