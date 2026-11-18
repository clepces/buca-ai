/**
 * AuthLayout - Entorno de Autenticación Distracción-Zero
 * =========================================================================
 * Proporciona una atmósfera inmersiva de cristal para login y seguridad.
 * Independiente del MainLayout para evitar conflictos de scroll y UI.
 * SessionDashboard se inyecta desacoplado vía EventBus desde el módulo auth.
 */
import { $id, $, $on, $mount, $addClass } from '@/shared/utils/dom.js';
import { eventBus } from '@/core/eventBus/index.js';

export const AuthLayout = {
    render: (content = '') => {
        // ... (contenido anterior se mantiene igual)
        return `
            <div class="auth-shell min-vh-100 d-flex flex-column">
                <!-- Atmósfera Neural (Fondo Dinámico) -->
                <div class="auth-background position-fixed top-0 start-0 w-100 h-100 u-z-under">
                    <div class="gradient-orb orb-1"></div>
                    <div class="gradient-orb orb-2"></div>
                </div>

                <!-- Contenedor de Flotantes (Solo visible en Desktop/Tablet) -->
                <div class="auth-floating-ecosystem d-none d-md-block">
                    <div class="floating-icon google" title="Acceso Google">
                        <i class="bi bi-google"></i>
                    </div>
                    <div class="floating-icon microsoft" title="Acceso Microsoft">
                        <i class="bi bi-microsoft"></i>
                    </div>
                    <div class="floating-icon apple" title="Acceso Apple">
                        <i class="bi bi-apple"></i>
                    </div>
                    <div class="floating-icon extra" title="Acceso Corporativo Adicional">
                        <i class="bi bi-shield-lock-fill"></i>
                    </div>
                </div>

                <!-- Dashboard de Sesión (Flotante Secundario) -->
                <div id="auth-session-dashboard-slot" data-bne-ignore="true"></div>

                <!-- Slot de Contenido Principal -->
                <main class="flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-4 u-z-content">
                    <div class="auth-card w-100 u-max-w-420 position-relative">
                        <header class="text-center mb-4">
                            <div class="logo-box-auth mb-3 mx-auto shadow-sm">
                                <img id="auth-theme-logo" src="/assets/icons/logo-dark.svg" alt="BUCA" class="logo-img">
                            </div>
                            <div class="auth-brand">
                                <h1 class="h3 fw-bold mb-0 text-primary">BUCA <span class="text-accent-neural">AI</span></h1>
                                <p class="text-muted small mb-0">INTELIGENCIA EMPRESARIAL</p>
                            </div>
                        </header>

                        <!-- Slot para transiciones dinámicas (Router inyecta aquí) -->
                        <div id="auth-content-slot" class="auth-body-container position-relative">
                            ${content}
                        </div>
                    </div>
                </main>

                <!-- Footer Minimalista -->
                <footer class="auth-minimal-footer p-3 text-center">
                    <div class="footer-legal small opacity-75">
                        <span>v15.2 Corporate</span>
                        <span class="mx-2 text-primary">•</span>
                        <a href="#" class="text-decoration-none">Privacidad</a>
                        <span class="mx-2 text-primary">•</span>
                        <a href="#" class="text-decoration-none">Soporte IT</a>
                    </div>
                </footer>
            </div>
        `;
    },

    init() {
        // Emitir evento para que el módulo auth inyecte SessionDashboard desacoplado
        eventBus.emit('auth-layout:mounted');

        // Vincular el icono "extra" (escudo) para toggle del dashboard
        const extraIcon = $('.floating-icon.extra');
        if (extraIcon) {
            $addClass(extraIcon, 'u-cursor-pointer');
            $on(extraIcon, 'click', () => eventBus.emit('auth:toggle-session-dashboard'));
        }
    }
};
