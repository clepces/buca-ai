/**
 * BUCA - Permissions & Roles Configuration
 * =========================================================================
 * Define la jerarquía de roles de PLATAFORMA y los niveles de acceso.
 *
 * IMPORTANTE: Estos roles son de PLATAFORMA (quién eres en el sistema global).
 * NO confundir con el rol de NEGOCIO (owner/worker dentro de un negocio
 * específico, definido en businesses/{id}/staff/{uid}.role).
 *
 * Jerarquía de plataforma: super_admin > admin > user
 */

export const ROLES = {
    SUPER_ADMIN: 'super_admin', // Acceso total al sistema (administrador raíz)
    ADMIN: 'admin',             // Empleado de la plataforma (supervisor / soporte)
    USER: 'user'                // Rol estándar por defecto para cualquier usuario registrado
};

export const PERMISSIONS = {
    SYSTEM_CONFIG: 'system:config',
    MANAGE_USERS: 'users:manage',
    MANAGE_BUSINESS: 'business:manage',
    VIEW_ANALYTICS: 'analytics:view',
    EXECUTE_PAYMENTS: 'payments:execute'
};

/**
 * Mapeo de permisos por rol de plataforma
 */
export const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
    [ROLES.ADMIN]: [
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.VIEW_ANALYTICS
    ],
    [ROLES.USER]: [
        PERMISSIONS.MANAGE_BUSINESS,
        PERMISSIONS.VIEW_ANALYTICS,
        PERMISSIONS.EXECUTE_PAYMENTS
    ]
};

export default { ROLES, PERMISSIONS, ROLE_PERMISSIONS };
