/**
 * @fileoverview Zod Schema Validation for User Profile & Worker Profile
 * @module modules/auth/schemas/userProfileSchema
 */

import { z } from 'zod';

export const userProfileGeneralSchema = z.object({
    username: z.string()
        .min(3, { message: 'El nombre de usuario (alias) debe tener al menos 3 caracteres.' })
        .max(30, { message: 'El nombre de usuario no puede exceder los 30 caracteres.' })
        .regex(/^[a-zA-Z0-9._-]+$/, { message: 'El nombre de usuario solo debe contener letras, números, puntos, guiones y guiones bajos.' }),
    firstName: z.string()
        .min(1, { message: 'El nombre es obligatorio.' })
        .max(50, { message: 'El nombre no puede exceder los 50 caracteres.' }),
    lastName: z.string()
        .min(1, { message: 'El apellido es obligatorio.' })
        .max(50, { message: 'El apellido no puede exceder los 50 caracteres.' }),
    mail: z.string()
        .email({ message: 'Ingrese una dirección de correo electrónico válida.' }),
    phone: z.string().optional().default(''),
    tax_id: z.string().optional().default(''),
    fiscal_address: z.string().optional().default(''),
    city_state: z.string().optional().default(''),
    active_mode: z.enum(['owner', 'worker', 'manager'], {
        invalid_type_error: 'El rol operativo no es válido.'
    }).default('owner'),
    pin_code: z.string().optional().default(''),
    session_timeout_mins: z.number().optional().default(30),
    avatar_url: z.string().optional().default(''),
    timezone: z.string().optional().default('America/Caracas'),
    preferred_currency: z.string().optional().default('VES_BCV'),
    language: z.string().optional().default('es_VE')
});

export const experienceCardSchema = z.object({
    id: z.string().optional().default(() => `exp_${Date.now()}`),
    company_name: z.string().default('Comercio Autorizado BUCA'),
    job_role: z.string().default('Operador Comercial ERP'),
    date_range: z.string().default('2024 - Presente'),
    branch_location: z.string().default('Sede Principal'),
    schedule_label: z.string().default('08:00 AM - 05:00 PM (Turno Asignado)'),
    is_verified: z.boolean().default(true)
});

export const skillItemSchema = z.object({
    name: z.string(),
    pts: z.string().optional().default('1,000 Pts'),
    icon: z.string().optional().default('bi-stars')
});

export const userProfileWorkerSchema = z.object({
    job_title: z.string()
        .min(2, { message: 'La ocupación o especialidad debe tener al menos 2 caracteres.' })
        .max(80, { message: 'La ocupación no puede exceder 80 caracteres.' }),
    department: z.string().optional().default(''),
    shift_preference: z.string().optional().default(''),
    bio: z.string()
        .max(500, { message: 'La biografía no puede exceder los 500 caracteres.' })
        .optional()
        .default(''),
    availability_status: z.enum(['available', 'busy', 'offline', 'on_leave'], {
        invalid_type_error: 'Estado de disponibilidad no válido.'
    }).default('available'),
    skills: z.array(z.union([z.string(), skillItemSchema])).default([]),
    branch_name: z.string().optional().default('Sede Principal - Caja Central 01'),
    max_discount_grant_pct: z.number().optional().default(100),
    supervisor_name: z.string().optional().default('Dirección General Root'),
    experience_cards: z.array(experienceCardSchema).optional().default([])
});

/**
 * Valida un objeto de perfil general
 * @param {Object} data 
 * @returns {{ success: boolean, data?: Object, errors?: string[] }}
 */
export function validateGeneralProfile(data) {
    const result = userProfileGeneralSchema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues || result.error.errors || [];
        const errors = issues.map(err => err.message);
        return { success: false, errors };
    }
    return { success: true, data: result.data };
}

/**
 * Valida un objeto de perfil laboral
 * @param {Object} data 
 * @returns {{ success: boolean, data?: Object, errors?: string[] }}
 */
export function validateWorkerProfile(data) {
    const result = userProfileWorkerSchema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues || result.error.errors || [];
        const errors = issues.map(err => err.message);
        return { success: false, errors };
    }
    return { success: true, data: result.data };
}
