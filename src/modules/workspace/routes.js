/**
 * Workspace Routes - Navegación del Área de Trabajo
 */
import WorkspacePage from './pages/WorkspacePage.js';
import { createModulePage } from './pages/module-placeholder-page.js';

export const workspaceRoutes = [
    {
        path: '/',
        component: WorkspacePage,
        title: 'Inicio',
        requiresAuth: true
    },
    {
        path: '/workspace',
        component: WorkspacePage,
        title: 'Tablero de Control',
        requiresAuth: true
    },
    {
        path: '/workspaces',
        component: WorkspacePage,
        title: 'Directorio de Espacios',
        requiresAuth: true
    },
    {
        path: '/workspace/settings',
        component: createModulePage({
            title: 'Ajustes del Sistema',
            category: 'Configuración',
            icon: 'bi-gear-fill',
            description: 'Parámetros del entorno, conectividad y seguridad de la instancia.'
        }),
        title: 'Ajustes',
        requiresAuth: true
    },
    // Rutas operativas del Dock - Módulo Operativo
    {
        path: '/clients',
        component: createModulePage({
            title: 'Gestión de Clientes',
            category: 'Comercial / CRM',
            icon: 'bi-person-badge',
            description: 'Administración de cartera comercial, historial de facturación y crédito.'
        }),
        title: 'Clientes',
        requiresAuth: true
    },
    {
        path: '/providers',
        component: createModulePage({
            title: 'Proveedores y Suministros',
            category: 'Abastecimiento',
            icon: 'bi-truck',
            description: 'Control de órdenes de compra, catálogo de suministros y pagos a terceros.'
        }),
        title: 'Proveedores',
        requiresAuth: true
    },
    {
        path: '/inventory',
        component: createModulePage({
            title: 'Inventario y Almacenes',
            category: 'Logística',
            icon: 'bi-box-seam',
            description: 'Supervisión de stock crítico, entradas y salidas de mercancía multimoda.'
        }),
        title: 'Inventario',
        requiresAuth: true
    },
    {
        path: '/pos',
        component: createModulePage({
            title: 'Punto de Venta (POS)',
            category: 'Caja & Facturación',
            icon: 'bi-pc-display-horizontal',
            description: 'Emisión rápida de comprobantes, cobro en divisas y control de caja.'
        }),
        title: 'Punto de Venta',
        requiresAuth: true
    },
    // Rutas operativas del Dock - Módulo de Personas
    {
        path: '/users',
        component: createModulePage({
            title: 'Usuarios y Accesos',
            category: 'Seguridad & RRHH',
            icon: 'bi-people',
            description: 'Control de usuarios registrados, estados de cuenta y sesiones activas.'
        }),
        title: 'Usuarios',
        requiresAuth: true
    },
    {
        path: '/roles',
        component: createModulePage({
            title: 'Roles y Privilegios',
            category: 'Seguridad & RRHH',
            icon: 'bi-shield-lock',
            description: 'Matriz de permisos granulares: Super Admin, Admin y Operadores.'
        }),
        title: 'Roles',
        requiresAuth: true
    },
    {
        path: '/teams',
        component: createModulePage({
            title: 'Equipos y Sucursales',
            category: 'Organización',
            icon: 'bi-diagram-3',
            description: 'Estructura jerárquica corporativa, asignación de turnos y dependencias.'
        }),
        title: 'Equipos',
        requiresAuth: true
    }
];

export default workspaceRoutes;
