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
import { getPath, pushHistory, scrollWindowTo, $onWindow } from '@/core/utils/index.js';
import { $id, $mount, $attr, $addClass, $removeClass, $on } from '@/shared/utils/dom.js';

class Router {
    #unlisteners = [];

    constructor() {
        this.routes = [];
        this.currentPath = getPath();
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
            scrollWindowTo({ top: 0, behavior: 'smooth' });
            return;
        }
        pushHistory(path);
        await this.handleRouteChange();
    }

    #setupListeners() {
        const unlisten = $onWindow('popstate', () => this.handleRouteChange());
        if (unlisten) this.#unlisteners.push(unlisten);
    }

    #setupLinkInterceptor() {
        const unlisten = $on(document, 'click', (e) => {
            const link = e.target.closest('a');
            if (!link || e.button !== 0 || e.ctrlKey || e.metaKey) return;

            const href = $attr(link, 'href');
            if (href && href.startsWith('/') && !href.startsWith('//') && $attr(link, 'target') !== '_blank') {
                e.preventDefault();
                this.navigate(href);
            }
        });
        if (unlisten) this.#unlisteners.push(unlisten);
    }

    #setupGlobalErrorCapture() {
        const unlistenErr = $onWindow('error', (event) => {
            Logger.error('GlobalError', { message: event.message, source: event.filename, lineno: event.lineno, error: event.error });
            this.#renderError('500');
        });
        if (unlistenErr) this.#unlisteners.push(unlistenErr);

        const unlistenRej = $onWindow('unhandledrejection', (event) => {
            Logger.error('UnhandledRejection', event.reason);
            this.#renderError('500');
        });
        if (unlistenRej) this.#unlisteners.push(unlistenRej);
    }

    async handleRouteChange() {
        try {
            const path = getPath();
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
            
            const currentLayout = $attr(document.body, 'data-layout-mode');
            const hasExpectedSlot = Boolean($id(config.slotId));
            
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

            const contentSlot = $id(config.slotId) || $id('app');

            if (contentSlot) {
                if (contentSlot.children.length > 0 || contentSlot.textContent?.trim() !== '') {
                    $addClass(contentSlot, 'view-exit');
                    await new Promise(r => setTimeout(r, 200));
                    $removeClass(contentSlot, 'view-exit');
                }

                if (this.currentRoute?.component) {
                    if (typeof this.currentRoute.component.destroy === 'function') this.currentRoute.component.destroy();
                    else if (typeof this.currentRoute.component.unmount === 'function') this.currentRoute.component.unmount();
                }

                this.currentRoute = route;

                if (route.component && typeof route.component.render === 'function') {
                    try {
                        $mount(contentSlot, route.component.render());
                    } catch (renderError) {
                        Logger.error('Router', 'Render Error:', renderError);
                        return this.#renderError('500');
                    }
                    
                    $addClass(contentSlot, 'view-enter');
                    
                    if (typeof route.component.init === 'function') {
                        try {
                            route.component.init();
                        } catch (initError) {
                            Logger.error('Router', 'Init Error:', initError);
                        }
                    }
                }
            }

            this.prevPath = path;
            eventBus.emit('router:changed', { path, route });
        } catch (fatalError) {
            Logger.critical('Router', 'Fatal Route Change Error:', fatalError);
            this.#renderError('500');
        }
    }

    async #renderError(code) {
        try {
            const loadFn = RouteConfig.errorPages[code] || RouteConfig.errorPages['404'];
            const { default: ErrorPage } = await loadFn();
            const app = $id('app');
            if (app) {
                $mount(app, `<div class="full-screen-error-layout">${ErrorPage.render()}</div>`);
                if (ErrorPage.init) ErrorPage.init();
            }
        } catch (err) {
            Logger.critical('Router', 'Error in error view:', err);
        }
    }

    destroy() {
        this.#unlisteners.forEach(unlisten => {
            if (typeof unlisten === 'function') unlisten();
        });
        this.#unlisteners = [];

        if (this.currentRoute?.component) {
            if (typeof this.currentRoute.component.destroy === 'function') this.currentRoute.component.destroy();
            else if (typeof this.currentRoute.component.unmount === 'function') this.currentRoute.component.unmount();
        }
    }
}

export const router = new Router();
export default router;
