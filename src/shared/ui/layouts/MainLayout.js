/**
 * MainLayout - Estructura Base de la Aplicación
 * =========================================================================
 * Define los slots donde se inyectarán los componentes dinámicos.
 * Mantiene la paridad con el proyecto modular pero simplificado para diseño.
 */
export const MainLayout = {
    render: () => {
        return `
            <!-- Capa de desenfoque de fondo -->
            <div class="bg-overlay" aria-hidden="true"></div>

            <!-- Header Stack -->
            <div id="header-stack" class="layout-header-container">
                <div id="topbar-slot"></div>
                <div id="workspace-nav-slot"></div>
            </div>

            <!-- Workspace Principal -->
            <main class="workspace-area">
                <div class="workspace-fade top"></div>
                <div class="workspace-internal container-max">
                    <div id="workspace-dynamic-content"></div>
                    <div class="bottom-spacer"></div>
                </div>
            </main>

            <!-- Dock y Footer Slots -->
            <div id="dock-slot"></div>
            <div id="footer-slot"></div>

            <!-- Modal Base: Eliminado de aquí y movido a index.html para permanencia global -->
        `;
    }
};
