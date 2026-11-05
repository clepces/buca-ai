/**
 * BUCA Modular - Central Application Configuration
 * Sigue el estándar de buca-app-modular para asegurar compatibilidad de lógica y datos.
 */

export const CONFIG = {
    APP: {
        NAME: 'BUCA Website',
        DESCRIPTION: 'Buca Neural Engine Presentation',
        VERSION: '5.2.0',
        SUPPORT_EMAIL: 'support@buca.com.ve',
        WEBSITE: 'https://buca.com.ve'
    },

    /**
     * Variables de Entorno y Control de Despliegue
     * - IS_PRODUCTION: false (desarrollo activo) | true (producción - desactiva cuentas demo y accesos temporales)
     * - IS_DEVELOPMENT: true cuando se trabaja localmente o en entornos de prueba
     * - SHOW_DEMO_ACCOUNTS: true muestra el selector de cuentas demo en login; se desactiva automáticamente en producción
     * - USE_EMULATOR: true para desviar tráfico a emuladores locales de Firebase
     */
    ENV: {
        MODE: 'development', // 'development' | 'production'
        IS_DEVELOPMENT: true,
        IS_PRODUCTION: false,
        SHOW_DEMO_ACCOUNTS: true,
        USE_EMULATOR: false
    },

    DATABASE: {
        COLLECTIONS: {
            // Colecciones Raíz Globales
            GLOBAL_CONFIG: 'global_config',
            USERS: 'users',
            BUSINESSES: 'businesses',
            ACTIVITY_LOG: 'activity_log',
            NOTIFICATIONS: 'notifications',

            // Subcolecciones de Usuario
            USER_WORKSPACES: 'workspaces',

            // Subcolecciones de Negocio (Multi-Tenant Scoped)
            STAFF: 'staff',
            ROLES: 'roles',
            CATEGORIES: 'categories',
            WAREHOUSES: 'warehouses',
            PRODUCTS: 'products',
            INVENTORY_LOTS: 'inventory_lots',
            SALES: 'sales',
            CASH_SHIFTS: 'cash_shifts',
            PURCHASES: 'purchases',
            CUSTOMERS: 'customers',
            SUPPLIERS: 'suppliers',
            EXPENSES: 'expenses',
            SEQUENCES: 'sequences',
            CREDIT_NOTES: 'credit_notes',

            // Compatibilidad legacy
            LOGS: 'activity_log'
        }
    },

    UI: {
        DEFAULT_THEME: 'light',
        GLASS_BLUR: '16px',
        ANIMATION_SPEED: 300
    },

    STORAGE: {
        THEME: 'buca-theme',
        PERFORMANCE: 'buca_performance_config',
        SESSION: 'buca_session_context'
    },

    EVENTS: {
        GRAPHICS: {
            TIER_CHANGED: 'graphics:tier-changed',
            PROFILE_UPDATE: 'graphics:profile-update'
        },
        KERNEL: {
            READY: 'kernel:ready',
            BOOT_PROGRESS: 'kernel:boot:progress'
        }
    }
};

export default CONFIG;
