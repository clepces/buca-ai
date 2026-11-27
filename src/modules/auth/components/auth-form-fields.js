/**
 * AuthFormFields - Builders reutilizables de campos y feedback para formularios de Auth.
 * Garantiza accesibilidad (aria-live, aria-label), autocomplete estricto e higiene de DOM.
 */
import { $on, setButtonContent } from '@/shared/utils/dom.js';

export const renderFeedbackAlert = (id, extraClass = 'mb-4') =>
    `<div id="${id}" role="alert" aria-live="polite" class="alert alert-danger d-none animate__animated animate__fadeIn py-2 small ${extraClass}"></div>`;

export const renderEmailField = ({
    id,
    name = 'email',
    label = 'Correo Corporativo',
    placeholder = 'usuario@empresa.com',
    autocomplete = 'email',
    marginClass = 'mb-3'
}) => `
    <div class="form-group ${marginClass}">
        <label for="${id}" class="form-label small fw-bold text-uppercase opacity-75">${label}</label>
        <div class="input-wrapper">
            <i class="bi bi-envelope"></i>
            <input type="email" id="${id}" name="${name}" class="glass-input" placeholder="${placeholder}" required autocomplete="${autocomplete}">
        </div>
    </div>
`;

export const renderPasswordField = ({
    id,
    name = 'password',
    label = 'Contraseña',
    toggleId,
    toggleAriaLabel = 'Mostrar u ocultar contraseña',
    autocomplete = 'current-password',
    icon = 'bi-lock',
    hint = '',
    marginClass = 'mb-3'
}) => `
    <div class="form-group ${marginClass}">
        <label for="${id}" class="form-label small fw-bold text-uppercase opacity-75">${label}</label>
        <div class="input-wrapper">
            <i class="bi ${icon}"></i>
            <input type="password" id="${id}" name="${name}" class="glass-input" placeholder="••••••••" required autocomplete="${autocomplete}">
            <button class="btn-toggle-password" type="button" id="${toggleId}" aria-label="${toggleAriaLabel}">
                <i class="bi bi-eye"></i>
            </button>
        </div>
        ${hint ? `<div class="form-text small text-muted" style="font-size: 0.75rem;">${hint}</div>` : ''}
    </div>
`;

export const bindPasswordToggle = (toggleBtn, inputEl) => {
    if (!toggleBtn || !inputEl) return;
    $on(toggleBtn, 'click', () => {
        const isPassword = inputEl.type === 'password';
        inputEl.type = isPassword ? 'text' : 'password';
        setButtonContent(toggleBtn, '', `bi bi-eye${isPassword ? '-slash' : ''}`);
    });
};
