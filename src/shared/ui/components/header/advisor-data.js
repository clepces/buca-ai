/**
 * @fileoverview advisor-data - Repositorio de hallazgos y auditorías del Advisor Center
 * @module shared/ui/components/header/advisor-data
 */

export const ADVISOR_ITEMS = [
    {
        id: 'adv-auth-1',
        category: 'Autenticación',
        categoryKey: 'Security',
        status: 'unread',
        severity: 'warning',
        severityLabel: 'AUDITORÍA',
        title: 'Protección contra Contraseñas Filtradas',
        entity: 'Supabase Auth',
        entityIcon: 'bi-key',
        issue: 'Supabase Auth previene el uso de contraseñas comprometidas verificando contra HaveIBeenPwned.org. Activa esta verificación para reforzar la seguridad.',
        desc: 'La protección de contraseñas filtradas está actualmente activa en producción.',
        resolveAction: 'ui:open_settings',
        resolveLabel: 'Configuración Auth'
    },
    {
        id: 'adv-auth-2',
        category: 'Autenticación',
        categoryKey: 'Security',
        status: 'unread',
        severity: 'info',
        severityLabel: 'INFORMACIÓN',
        title: 'Protección Multi-Factor AAL2 Activa',
        entity: 'Supabase Auth',
        entityIcon: 'bi-shield-lock',
        issue: 'La verificación TOTP (RFC 6238) está configurada y protegiendo accesos administrativos según el estándar NIST SP 800-63B.',
        desc: 'Protección de dos factores configurada para operadores con rol administrativo.',
        resolveAction: 'ui:open_settings',
        resolveLabel: 'Ajustes de Seguridad'
    },
    {
        id: 'adv-rls-1',
        category: 'Base de Datos',
        categoryKey: 'Security',
        status: 'unread',
        severity: 'warning',
        severityLabel: 'AUDITORÍA',
        title: 'Políticas RLS en public.finance_rates',
        entity: 'PostgreSQL RLS',
        entityIcon: 'bi-database-lock',
        issue: 'Lecturas públicas habilitadas para consulta de cotizaciones, escrituras protegidas mediante evaluación O(1) con subconsulta (SELECT auth.uid()).',
        desc: 'Políticas de seguridad a nivel de fila verificadas y conformes al estándar corporativo.',
        resolveAction: 'ui:open_docs',
        resolveLabel: 'Políticas de RLS'
    },
    {
        id: 'adv-tenant-1',
        category: 'Multi-Tenant',
        categoryKey: 'Health',
        status: 'archived',
        severity: 'success',
        severityLabel: 'ÓPTIMO',
        title: 'Aislamiento Estricto por Unidad Activo',
        entity: 'Tenant Manager',
        entityIcon: 'bi-diagram-3',
        issue: 'El middleware de aislamiento multi-tenant garantiza que ningún inquilino acceda a transacciones o balances foráneos.',
        desc: 'Transacciones y balances anclados de forma inmutable al tenant_id de la sesión.',
        resolveAction: 'ui:open_settings',
        resolveLabel: 'Gestión de Inquilino'
    },
    {
        id: 'adv-perf-1',
        category: 'Rendimiento',
        categoryKey: 'Performance',
        status: 'unread',
        severity: 'info',
        severityLabel: 'RECOMENDACIÓN',
        title: 'Motor Gráfico BNE en Nivel Óptimo',
        entity: 'Buca Neural Engine',
        entityIcon: 'bi-speedometer2',
        issue: 'La frecuencia de fotogramas supera 60 FPS estables con aceleración por GPU y cero bloqueos de DOM en el hilo principal.',
        desc: 'Calibración automática activa con mitigación de calor y degradación sólida L0 disponible.',
        resolveAction: 'ui:open_performance',
        resolveLabel: 'Calibrar Motor BNE'
    }
];
