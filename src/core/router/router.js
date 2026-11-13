/**
 * Router - Orquestador de Navegación BNE (Refactorizado)
 * =========================================================================
 * Desacoplado del Kernel mediante eventos y RouteConfig.
 * Manejo de eventos con addEventListener limpio, teardown destroy() y
 * sincronización reactiva por eventos (kernel:layout-ready).
 * =========================================================================
 */
import { eventBus } from '@/core/eventBus/index.js';
import { RouteConfig } from './RouteConfig.js';
import { Logger } from '@/shared/utils/logger.js';
import ModuleLoader from '@/core/ModuleLoader.js';

class Router {
    #popstateHandler = null;
    #linkClickHandler = null;
    #errorHandler = null;
    #unhandledRejectionHandler = null;

    constructor() {
        this.routes = [];
        this.currentPath = window.location.pathname;
        this.prevPath = null;
        this.currentRoute = null;
        
        this.#setupListeners();
        this.#setupLinkInterceptor();
        this.#setupGlobalErrorCapture();
    }

    async init(globalRoutes) {
        this.routes = [...(this.routes || []), ...globalRoutes];
        await this.handleRouteChange();
    }

    addRoutes(newRoutes) {
        this.routes = [...this.routes, ...newRoutes];
    }

    async navigate(path, force = false) {
        if (!force && path === this.currentPath) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        window.history.pushState({}, '', path);
        await this.handleRouteChange();
    }

    #setupListeners() {
        this.#popstateHandler = () => this.handleRouteChange();
        window.addEventListener('popstate', this.#popstateHandler);
    }

    #setupLinkInterceptor() {
        this.#linkClickHandler = (e) => {
            const link = e.target.closest('a');
            if (!link || e.button !== 0 || e.ctrlKey || e.metaKey) return;

            const href = link.getAttribute('href');
            if (href && href.startsWith('/') && !href.startsWith('//') && link.getAttribute('target') !== '_blank') {
                e.preventDefault();
                this.navigate(href);
            }
        };
        document.addEventListener('click', this.#linkClickHandler);
    }

    #setupGlobalErrorCapture() {
        this.#errorHandler = (event) => {
            Logger.error('[Global Error]', { message: event.message, source: event.filename, lineno: event.lineno, error: event.error });
            this.#renderError('500');
        };

        this.#unhandledRejectionHandler = (event) => {
            Logger.error('[Unhandled Rejection]', event.reason);
            this.#renderError('500');
        };

        window.addEventListener('error', this.#errorHandler);
        window.addEventListener('unhandledrejection', this.#unhandledRejectionHandler);
    }

    async handleRouteChange() {
        try {
            const path = window.location.pathname;
            this.currentPath = path;
            
            let route = this.routes.find(r => r.path === path);
            
            if (!route && !path.startsWith('/auth')) {
                if (!ModuleLoader.isLoaded('workspace')) {
                    await ModuleLoader.load('workspace');
                    route = this.routes.find(r => r.path === path);
                }
            }

            if (!route) route = this.routes.find(r => r.path === '*');

            if (route && route.requiresAuth) {
                const { RouterGuards } = await import('./guards.js');
                if (!RouterGuards.requiresAuth()) return this.navigate('/auth/login');
                const hasAAL2 = await RouterGuards.requiresAAL2();
                if (!hasAAL2) {
                    eventBus.emit('auth:mfa-required', { returnUrl: path });
                    return this.navigate('/auth/login');
                }
            }

            if (!route) return this.#renderError('404');

            // Determinar layout y slot
            const isAuth = path.startsWith(RouteConfig.layouts.auth.pathPrefix);
            const layoutKey = isAuth ? 'auth' : 'workspace';
            const config = RouteConfig.layouts[layoutKey];
            
            const currentLayout = document.body.getAttribute('data-layout-mode');
            const hasExpectedSlot = Boolean(document.getElementById(config.slotId));
            
            eventBus.emit('router:before-change', { path, route, layout: layoutKey });

            // Sincronización reactiva por eventos (cero polling)
            if (currentLayout !== layoutKey || !hasExpectedSlot) {
                const layoutReadyPromise = new Promise(resolve => {
                    const off = eventBus.on('kernel:layout-ready', (data) => {
                        if (typeof off === 'function') off();
                        resolve(data);
                    });
                    setTimeout(resolve, 300); // Fallback de seguridad
                });
                eventBus.emit('router:layout-sync-required', { path, layout: layoutKey });
                await layoutReadyPromise;
            }

            const contentSlot = document.getElementById(config.slotId) || document.getElementById('app');

            if (contentSlot) {
                if (contentSlot.innerHTML.trim() !== '') {
                    contentSlot.classList.add('view-exit');
                    await new Promise(r => setTimeout(r, 200));
                    contentSlot.classList.remove('view-exit');
                }

                if (this.currentRoute?.component) {
                    if (typeof this.currentRoute.component.destroy === 'function') this.currentRoute.component.destroy();
                    else if (typeof this.currentRoute.component.unmount === 'function') this.currentRoute.component.unmount();
                }

                this.currentRoute = route;

                if (route.component && typeof route.component.render === 'function') {
                    try {
                        contentSlot.innerHTML = route.component.render();
                    } catch (renderError) {
                        Logger.error('[Router] Render Error:', renderError);
                        return this.#renderError('500');
                    }
                    
                    contentSlot.classList.add('view-enter');
                    
                    if (typeof route.component.init === 'function') {
                        try {
                            route.component.init();
                        } catch (initError) {
                            Logger.error('[Router] Init Error:', initError);
                        }
                    }
                }
            }

            this.prevPath = path;
            eventBus.emit('router:changed', { path, route });
        } catch (fatalError) {
            Logger.error('[Router] Fatal Route Change Error:', fatalError);
            this.#renderError('500');
        }
    }

    async #renderError(code) {
        try {
            const loadFn = RouteConfig.errorPages[code] || RouteConfig.errorPages['404'];
            const { default: ErrorPage } = await loadFn();
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `<div class="full-screen-error-layout">${ErrorPage.render()}</div>`;
                if (ErrorPage.init) ErrorPage.init();
            }
        } catch (err) {
            console.error('[Router] Error critical in error view:', err);
        }
    }

    destroy() {
        if (this.#popstateHandler) {
            window.removeEventListener('popstate', this.#popstateHandler);
            this.#popstateHandler = null;
        }
        if (this.#linkClickHandler) {
            document.removeEventListener('click', this.#linkClickHandler);
            this.#linkClickHandler = null;
        }
        if (this.#errorHandler) {
            window.removeEventListener('error', this.#errorHandler);
            this.#errorHandler = null;
        }
        if (this.#unhandledRejectionHandler) {
            window.removeEventListener('unhandledrejection', this.#unhandledRejectionHandler);
            this.#unhandledRejectionHandler = null;
        }
        if (this.currentRoute?.component) {
            if (typeof this.currentRoute.component.destroy === 'function') this.currentRoute.component.destroy();
            else if (typeof this.currentRoute.component.unmount === 'function') this.currentRoute.component.unmount();
        }
    }
}

export const router = new Router();
export default router;
