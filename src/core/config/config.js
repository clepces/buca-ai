/**
 * BUCA Modular - Central Application Configuration
 * Sigue el estándar de buca-app-modular para asegurar compatibilidad de lógica y datos.
 */
import { ENV } from './environment.js';

export const CONFIG = {
    APP: {
        NAME: 'BUCA AI',
        DESCRIPTION: 'Buca Neural Engine (BENE)',
        VERSION: ENV.APP_VERSION,
        SUPPORT_EMAIL: 'support@buca.com.ve',
        WEBSITE: 'https://buca.com.ve'
    },

    /**
     * Variables de Entorno y Control de Despliegue (derivadas de environment.js)
     */
    ENV: {
        MODE: ENV.MODE,
        IS_DEVELOPMENT: ENV.IS_DEV,
        IS_PRODUCTION: ENV.IS_PROD,
        SHOW_DEMO_ACCOUNTS: false
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
