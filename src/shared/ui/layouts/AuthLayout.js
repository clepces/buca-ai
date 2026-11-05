/**
 * AuthLayout - Entorno de Autenticación Distracción-Zero
 * =========================================================================
 * Proporciona una atmósfera inmersiva de cristal para login y seguridad.
 * Independiente del MainLayout para evitar conflictos de scroll y UI.
 */
import SessionDashboard from '../../../modules/auth/components/SessionDashboard.js';

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
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
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
        const dashboardSlot = document.getElementById('auth-session-dashboard-slot');
        if (dashboardSlot) {
            dashboardSlot.innerHTML = SessionDashboard.render();
            if (typeof SessionDashboard.init === 'function') SessionDashboard.init();
        }

        // Vincular el icono "extra" (escudo) para abrir el dashboard
        const extraIcon = document.querySelector('.floating-icon.extra');
        if (extraIcon) {
            extraIcon.style.cursor = 'pointer';
            extraIcon.onclick = () => SessionDashboard.toggle();
        }
    }
};
