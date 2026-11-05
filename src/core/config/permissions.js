/**
 * BUCA - Permissions & Roles Configuration
 * =========================================================================
 * Define la jerarquía de usuarios y los niveles de acceso.
 * Sigue la Regla 3 de la lógica de negocio (super_admin, admin, owner).
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin', // Acceso total al sistema (dueño absoluto)
    ADMIN: 'admin',             // Empleado de la plataforma (supervisor / alquilable)
    OWNER: 'owner'              // Rol estándar por defecto para cualquier usuario registrado
};

export const PERMISSIONS = {
    SYSTEM_CONFIG: 'system:config',
    MANAGE_USERS: 'users:manage',
    MANAGE_BUSINESS: 'business:manage',
    VIEW_ANALYTICS: 'analytics:view',
    EXECUTE_PAYMENTS: 'payments:execute'
};

/**
 * Mapeo de permisos por rol
 */
export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
    [ROLES.ADMIN]: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.OWNER]: [
        PERMISSIONS.MANAGE_BUSINESS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXECUTE_PAYMENTS
    ]
};

export default { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
