/**
 * @fileoverview ui-button - Constructor declarativo de botones reutilizables.
 * Soporta variantes: solo texto, solo icono, icono + texto e icono + texto + icono.
 * Compatible con setButtonLoading y setButtonContent de dom.js.
 * @module shared/ui/primitives/ui-button
 */
import { escapeHTML } from '@/shared/utils/security.js';

const VARIANT_CLASS = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning'
};

const SIZE_CLASS = {
    xs: 'ui-btn--xs',
    sm: 'ui-btn--sm',
    md: 'ui-btn--md',
    lg: 'ui-btn--lg'
};

/**
 * Renderiza el HTML seguro de un botón UI estandarizado.
 * @param {Object} [options]
 * @param {string} [options.id]
 * @param {'button'|'submit'|'reset'} [options.type='button']
 * @param {'primary'|'secondary'|'ghost'|'outline'|'danger'|'success'|'warning'} [options.variant='primary']
 * @param {'xs'|'sm'|'md'|'lg'} [options.size='md']
 * @param {string} [options.label='']
 * @param {string} [options.iconLeft=''] - Clase de icono (ej. 'bi-plus-lg')
 * @param {string} [options.iconRight=''] - Clase de icono derecho (ej. 'bi-chevron-right')
 * @param {string} [options.action=''] - Valor para data-action
 * @param {string} [options.form=''] - ID de formulario externo (ideal para botones en footer)
 * @param {string} [options.title='']
 * @param {string} [options.ariaLabel='']
 * @param {string} [options.className='']
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.pill=false]
 * @param {Object<string, string>} [options.attrs={}]
 * @returns {string}
 */
export function renderButton({
    id = '',
    type = 'button',
    variant = 'primary',
    size = 'md',
    label = '',
    iconLeft = '',
    iconRight = '',
    action = '',
    form = '',
    title = '',
    ariaLabel = '',
    className = '',
    disabled = false,
    pill = false,
    attrs = {}
} = {}) {
    const safeType = ['button', 'submit', 'reset'].includes(type) ? type : 'button';
    const variantCls = VARIANT_CLASS[variant] || VARIANT_CLASS.primary;
    const sizeCls = SIZE_CLASS[size] || SIZE_CLASS.md;
    const iconOnly = !label && (iconLeft || iconRight);

    const classes = [
        'btn',
        'ui-btn',
        variantCls,
        sizeCls,
        pill ? 'rounded-pill' : '',
        iconOnly ? 'ui-btn--icon-only' : '',
        className
    ].filter(Boolean).join(' ');

    const attrParts = [
        `type="${safeType}"`,
        `class="${escapeHTML(classes)}"`
    ];

    if (id) attrParts.push(`id="${escapeHTML(id)}"`);
    if (action) attrParts.push(`data-action="${escapeHTML(action)}"`);
    if (form) attrParts.push(`form="${escapeHTML(form)}"`);
    if (title) attrParts.push(`title="${escapeHTML(title)}"`);

    const resolvedAria = ariaLabel || (iconOnly ? title : '');
    if (resolvedAria) attrParts.push(`aria-label="${escapeHTML(resolvedAria)}"`);
    if (disabled) attrParts.push('disabled');

    Object.entries(attrs || {}).forEach(([k, v]) => {
        if (/^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/.test(k) && v !== undefined && v !== null) {
            attrParts.push(`${k}="${escapeHTML(String(v))}"`);
        }
    });

    const leftHtml = iconLeft ? `<i class="bi ${escapeHTML(iconLeft)} ui-btn__icon" aria-hidden="true"></i>` : '';
    const labelHtml = label ? `<span class="ui-btn__label">${escapeHTML(label)}</span>` : '';
    const rightHtml = iconRight ? `<i class="bi ${escapeHTML(iconRight)} ui-btn__icon ui-btn__icon--end" aria-hidden="true"></i>` : '';

    return `<button ${attrParts.join(' ')}>${leftHtml}${labelHtml}${rightHtml}</button>`;
}

export default { renderButton };
