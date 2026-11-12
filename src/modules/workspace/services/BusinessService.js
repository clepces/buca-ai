/**
 * BusinessService - Gestión Ligera de Unidades de Negocio (Supabase Native)
 * =========================================================================
 * Arquitectura v1.1.0-alpha: Shell ligero para el módulo Workspace.
 * Persistencia en tabla 'businesses' de Supabase con RLS y validación Zod.
 * =========================================================================
 */
import { z } from 'zod';
import { getSupabase } from '@/core/config/supabase.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';

export const BusinessModelSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    commercial_name: z.string().default(''),
    type: z.string().default('Comercio General'),
    location: z.string().default('Sede Central'),
    status: z.string().default('Active'),
    membership_type: z.enum(['owner', 'worker']).default('owner'),
    role: z.string().default('owner'),
    progress: z.string().default('100%'),
    alerts: z.number().default(0),
    invoices: z.number().default(0),
    staff: z.number().default(1)
});

export const CreateBusinessInputSchema = z.object({
    name: z.string().min(1, 'El nombre de la empresa (Razón Social) es obligatorio.'),
    commercial_name: z.string().optional().default(''),
    rif: z.string().optional().default('J-00000000-0'),
    category: z.string().optional().default('Retail / Alimentos'),
    description: z.string().optional().default(''),
    phone: z.string().optional().default(''),
    email: z.string().optional().default(''),
    state: z.string().optional().default('Carabobo'),
    city: z.string().optional().default('Valencia'),
    line1: z.string().optional().default('Sede Principal'),
    reference: z.string().optional().default(''),
    zip_code: z.string().optional().default('2001'),
    currency_base: z.string().optional().default('USD'),
    currency_tx: z.string().optional().default('VES'),
    iva_apply: z.boolean().optional().default(true),
    iva_general: z.number().optional().default(16),
    igtf_apply: z.boolean().optional().default(true),
    igtf_general: z.number().optional().default(3),
    igtf_manual_override: z.boolean().optional().default(false),
    payment_methods: z.record(z.any()).optional()
});

/**
 * @typedef {z.infer<typeof BusinessModelSchema>} BusinessModel
 */

class BusinessService {
    _getClient() {
        return getSupabase();
    }

    _getCurrentUserId() {
        const sessionUser = sessionState.get().user;
        return sessionUser?.uid || null;
    }

    /**
     * Obtiene la lista de empresas del usuario desde Supabase
     */
    async getUserBusinesses(userId = null, filterMode = 'all', options = {}) {
        const { pageSize = 20 } = options;
        const uid = userId || this._getCurrentUserId();

        if (!uid) {
            return { success: true, data: Object.freeze([]) };
        }

        try {
            const client = this._getClient();
            const { data, error } = await client
                .from('businesses')
                .select('*')
                .eq('owner_id', uid)
                .limit(pageSize);

            if (error) {
                console.warn('[BusinessService] Error al consultar negocios en Supabase:', error.message);
                return { success: false, error: error.message, data: Object.freeze([]) };
            }

            let businesses = (data || []).map(b => {
                const loc = `${b.city || ''}, ${b.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
                const raw = {
                    id: b.id,
                    name: b.name || b.commercial_name || '',
                    commercial_name: b.commercial_name || b.name || '',
                    type: b.category || b.type || '',
                    location: loc,
                    status: b.status || 'Active',
                    membership_type: 'owner',
                    role: 'owner',
                    progress: '100%',
                    alerts: 0,
                    invoices: 0,
                    staff: 1
                };
                const parsed = BusinessModelSchema.safeParse(raw);
                return Object.freeze(parsed.success ? parsed.data : raw);
            });

            if (filterMode === 'owner') {
                businesses = businesses.filter(b => b.membership_type === 'owner');
            } else if (filterMode === 'worker') {
                businesses = businesses.filter(b => b.membership_type === 'worker');
            }

            return { success: true, data: Object.freeze(businesses) };
        } catch (error) {
            console.error('[BusinessService] Error obteniendo negocios:', error);
            return { success: false, error: error.message, data: Object.freeze([]) };
        }
    }

    /**
     * Registra una nueva unidad de negocio en Supabase
     */
    async createBusiness(rawData) {
        const uid = this._getCurrentUserId();
        if (!uid) {
            return { success: false, error: 'Debe iniciar sesión para registrar una empresa.' };
        }

        const validation = CreateBusinessInputSchema.safeParse(rawData);
        if (!validation.success) {
            const firstError = validation.error.errors[0]?.message || 'Datos de empresa inválidos.';
            return { success: false, error: firstError };
        }

        const data = validation.data;
        const name = data.name.trim();
        const commercialName = (data.commercial_name || name).trim();
        const rif = (data.rif || '').trim().toUpperCase();
        const category = data.category || '';
        const locationStr = `${data.city || ''}, ${data.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
        const businessId = 'biz_' + Date.now();

        try {
            const client = this._getClient();
            const payload = {
                id: businessId,
                owner_id: uid,
                name,
                commercial_name: commercialName,
                rif,
                category,
                description: data.description || '',
                phone: data.phone || '',
                email: data.email || '',
                state: data.state || 'Carabobo',
                city: data.city || 'Valencia',
                line1: data.line1 || 'Sede Principal',
                reference: data.reference || '',
                zip_code: data.zip_code || '2001',
                currency_base: data.currency_base || 'USD',
                currency_tx: data.currency_tx || 'VES',
                iva_apply: data.iva_apply,
                iva_general: data.iva_general,
                igtf_apply: data.igtf_apply,
                igtf_general: data.igtf_general,
                igtf_manual_override: data.igtf_manual_override,
                payment_methods: data.payment_methods || {},
                status: 'active',
                created_at: new Date().toISOString()
            };

            const { data: inserted, error } = await client
                .from('businesses')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            const newBusiness = Object.freeze(BusinessModelSchema.parse({
                id: businessId,
                name,
                commercial_name: commercialName,
                type: category,
                location: locationStr,
                status: 'Active',
                membership_type: 'owner',
                role: 'owner',
                progress: '100%',
                alerts: 0,
                invoices: 0,
                staff: 1
            }));

            eventBus.emit('workspace:business_created', { business: newBusiness });
            eventBus.emit('workspace:refresh_data');
            return { success: true, data: newBusiness };
        } catch (error) {
            console.error('[BusinessService] Error registrando empresa en Supabase:', error);
            return { success: false, error: error.message };
        }
    }

    clearCache() {
        // Shell ligero sin fuga de memoria
    }
}

export const businessService = new BusinessService();
export default businessService;
