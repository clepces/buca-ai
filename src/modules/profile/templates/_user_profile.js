/**
 * User Profile Template - Modular Version (5 Tabs Architecture)
 * =======================================================================================
 * Identidad General | Talento & Ficha | Suscripción ERP | Seguridad & PIN | Dispositivos & Sesiones
 * Totalmente reactivo con datos reales de la sesión y Supabase.
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

    const nameParts = (userData.displayName || '').split(' ').filter(Boolean);
    const firstName = profile.first_name || profile.firstName || nameParts[0] || 'Operador';
    const lastName = profile.last_name || profile.lastName || nameParts.slice(1).join(' ') || 'BUCA';
    const email = profile.email || profile.mail || userData.email || 'usuario@buca.com.ve';
    const username = profile.username || (email ? email.split('@')[0] : 'operador');
    const platformRole = (profile.platform_role || 'user').toUpperCase();
    const activeMode = profile.active_mode || 'owner';
    const uid = userData.uid || userData.id || profile.id || '';

    const initials = (firstName && lastName) 
        ? `${firstName[0]}${lastName[0]}`.toUpperCase() 
        : 'OP';

    let createdAt = 'Miembro Oficial';
    if (userData.created_at || profile.created_at) {
        const rawDate = userData.created_at || profile.created_at;
        if (typeof rawDate.toDate === 'function') {
            createdAt = rawDate.toDate().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        } else if (typeof rawDate === 'string') {
            createdAt = new Date(rawDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
        }
    }

    const heroData = {
        fullName: `${firstName} ${lastName}`.trim(),
        platformRole,
        username,
        email,
        initials,
        activeMode,
        uid,
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
        shiftsCount: worker.total_shifts_completed || 0,
        jobTitle: worker.job_title || 'Operador de Plataforma ERP',
        availStatus: worker.availability_status || 'available',
        bio: worker.bio || profile.bio || 'Operador activo del ecosistema B.U.C.A. AI.',
        skillsList: Array.isArray(worker.skills) ? worker.skills : [],
        experienceCards: Array.isArray(worker.experience_cards) ? worker.experience_cards : []
    };

    const subscriptionData = {
        planTier: sub.plan_tier || profile.subscription_master || 'PLAN ESTÁNDAR (CAPA GRATUITA)',
        planStatus: sub.status || 'ACTIVO',
        validUntil: sub.valid_until || 'Acceso Continuo',
        maxBiz: sub.max_businesses || '3 Unidades',
        maxUsers: sub.max_users || '5 Operadores'
    };

    const securityData = {
        pinCode: '',
        twoFactor: sec.two_factor_enabled === true,
        recoveryMail: sec.recovery_email || email,
        twoFactorMethod: sec.two_factor_method || 'totp',
        trustedDevices: userData.trusted_devices || profile.trusted_devices || {
            current: {
                name: 'Sesión Activa Supabase Auth',
                fingerprint: 'sha256_verified',
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
