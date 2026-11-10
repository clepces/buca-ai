/**
 * User Profile Template - Modular Version (5 Tabs Architecture)
 * =======================================================================================
 * Identidad General | Talento & Ficha | Suscripción ERP | Seguridad & PIN | Dispositivos & Sesiones
 * =======================================================================================
 */
import { ProfileHero } from '../components/parts/ProfileHero.js';
import { ProfileTabs } from '../components/parts/ProfileTabs.js';
import { ProfileGeneralTab } from '../components/parts/ProfileGeneralTab.js';
import { ProfileWorkerTab } from '../components/parts/ProfileWorkerTab.js';
import { ProfileMonitoringTab } from '../components/parts/ProfileMonitoringTab.js';
import { ProfileSubscriptionTab } from '../components/parts/ProfileSubscriptionTab.js';
import { ProfileSecurityTab } from '../components/parts/ProfileSecurityTab.js';
import { ProfileDevicesTab } from '../components/parts/ProfileDevicesTab.js';

export const userProfileFullTemplate = (userData = {}) => {
    const profile = userData.profile || {};
    const worker = userData.worker_profile || {};
    const sub = userData.subscription_master || {};
    const sec = userData.security || {};

    const firstName = profile.firstName || 'Asicodia';
    const lastName = profile.lastName || 'Corp';
    const email = profile.mail || userData.email || 'asicodia@gmail.com';
    const username = profile.username || (email ? email.split('@')[0] : 'asicodia');
    const platformRole = (profile.platform_role || 'user').toUpperCase();
    const activeMode = profile.active_mode || 'user';

    const initials = (firstName && lastName) 
        ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
        : 'AC';

    let createdAt = 'Miembro Oficial';
    if (userData.created_at) {
        if (typeof userData.created_at.toDate === 'function') {
            createdAt = userData.created_at.toDate().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (typeof userData.created_at === 'string') {
            createdAt = userData.created_at;
        }
    }

    const heroData = {
        fullName: `${firstName} ${lastName}`.trim(),
        platformRole,
        username,
        email,
        initials,
        activeMode,
        uid: userData.uid || 'QmojtAorrSORnIR652B2OQrLFnV2',
        avatarUrl: profile.avatar_url || '',
        createdAt
    };

    const generalData = {
        username,
        email,
        firstName,
        lastName,
        taxId: profile.tax_id || '',
        phone: profile.phone || '',
        platformRole,
        activeMode,
        fiscalAddress: profile.fiscal_address || '',
        cityState: profile.city_state || '',
        session_timeout_mins: profile.session_timeout_mins ?? 30,
        timezone: profile.timezone || 'America/Caracas',
        preferred_currency: profile.preferred_currency || 'VES_BCV',
        language: profile.language || 'es_VE'
    };

    const workerData = {
        repScore: worker.reputation_score || 5.0,
        shiftsCount: worker.total_shifts_completed || 350,
        jobTitle: worker.job_title || 'Cajero Comercial & Operador ERP',
        availStatus: worker.availability_status || 'available',
        bio: worker.bio || 'Operador con experiencia en gestión de caja, inventario y facturación bi-monetaria BCV/USDT.',
        skillsList: Array.isArray(worker.skills) && worker.skills.length > 0 
            ? worker.skills 
            : [
                { name: 'Manejo de Caja & Cuadres', icon: 'bi-cash-coin', pts: '1,500 Pts' },
                { name: 'Gestión de Inventario FIFO', icon: 'bi-boxes', pts: '1,280 Pts' },
                { name: 'Operación Multimoneda BCV/USDT', icon: 'bi-currency-exchange', pts: '1,450 Pts' },
                { name: 'Facturación & Ticketera SENIAT', icon: 'bi-receipt', pts: '1,100 Pts' },
                { name: 'Atención al Cliente & POS', icon: 'bi-person-check-fill', pts: '980 Pts' },
                { name: 'Auditoría de Cierres de Turno', icon: 'bi-shield-check', pts: '1,320 Pts' }
            ],
        experienceCards: Array.isArray(worker.experience_cards) && worker.experience_cards.length > 0
            ? worker.experience_cards
            : [
                {
                    id: 'exp_01',
                    company_name: 'BUCA Enterprise Main HQ',
                    job_role: 'Super Administrador & Arquitecto Principal ERP',
                    date_range: '2024 - Presente',
                    branch_location: 'Caracas - Centro Empresarial B.U.C.A.',
                    schedule_label: '08:00 AM - 05:00 PM (Turno Asignado)',
                    is_verified: true
                },
                {
                    id: 'exp_02',
                    company_name: 'Comercializadora Gran Plaza C.A.',
                    job_role: 'Gerente de Caja & Tesorería Multimoneda',
                    date_range: '2022 - 2024',
                    branch_location: 'Sucursal Central Baruta',
                    schedule_label: '08:00 AM - 04:00 PM (Turno Mañana)',
                    is_verified: true
                }
            ]
    };

    const subscriptionData = {
        planTier: sub.plan_tier || 'ENTERPRISE MASTER UNLIMITED',
        planStatus: sub.status || 'ACTIVO (ILIMITADO)',
        validUntil: sub.valid_until || 'Licencia Vitalicia Master',
        maxBiz: sub.max_businesses || 'Ilimitado (999+)',
        maxUsers: sub.max_users || 'Ilimitado'
    };

    const securityData = {
        pinCode: '',
        twoFactor: sec.two_factor_enabled !== false,
        recoveryMail: sec.recovery_email || email,
        twoFactorMethod: sec.two_factor_method || 'email',
        trustedDevices: userData.trusted_devices || {
            current: {
                name: 'Navegador Web Activo (Windows 11 / Chrome 124)',
                fingerprint: 'sha256_browser_identity_verified',
                status: 'approved',
                last_seen: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        }
    };

    return `
        <div class="user-profile-fullscreen-wrapper p-1 p-md-3">
            ${ProfileHero(heroData)}
            ${ProfileTabs('general')}
            <div id="profile-feedback-alert" class="alert d-none py-2 px-3 small mb-3 rounded-3 animate__animated animate__fadeIn"></div>
            <div class="profile-tabs-container">
                ${ProfileGeneralTab(generalData)}
                ${ProfileWorkerTab(workerData)}
                ${ProfileMonitoringTab({})}
                ${ProfileSubscriptionTab(subscriptionData)}
                ${ProfileSecurityTab(securityData)}
                ${ProfileDevicesTab(securityData)}
            </div>
        </div>
    `;
};

export default userProfileFullTemplate;
