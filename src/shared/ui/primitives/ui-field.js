/**
 * @fileoverview ui-field - Constructor declarativo de campos e inputs accesibles.
 * Envuelve controles Bootstrap 5 (.form-control / .form-select) con soporte para:
 * [icono izquierdo] + [control + placeholder] + [tecla .cmd-kbd | badge .badge].
 * @module shared/ui/primitives/ui-field
 */
import { escapeHTML } from '@/shared/utils/security.js';

const SUPPORTED_TYPES = new Set([
    'text', 'email', 'password', 'search', 'number',
    'select', 'textarea', 'checkbox', 'switch', 'date'
]);

/**
 * Renderiza el HTML seguro de un campo de formulario con prevención de desbordamiento.
 * @param {Object} options
 * @param {string} options.id - ID único del control
 * @param {string} [options.name]
 * @param {string} [options.type='text']
 * @param {string} [options.label='']
 * @param {string} [options.placeholder='']
 * @param {string|number} [options.value='']
 * @param {string} [options.icon=''] - Clase Bootstrap Icon izquierda
 * @param {string} [options.kbd=''] - Atajo de teclado derecha (ej. 'Ctrl+K')
 * @param {Object} [options.badge=null] - { text: string, tone?: 'primary'|'success'|'warning'|'danger' }
 * @param {string} [options.hint='']
 * @param {string} [options.error='']
 * @param {boolean} [options.required=false]
 * @param {boolean} [options.disabled=false]
 * @param {boolean} [options.readonly=false]
 * @param {boolean} [options.checked=false]
 * @param {number} [options.rows=3]
 * @param {Array<{value: string, label: string, selected?: boolean}>} [options.options=[]]
 * @param {string} [options.className='']
 * @returns {string}
 */
export function renderField({
    id,
    name = '',
    type = 'text',
    label = '',
    placeholder = '',
    value = '',
    icon = '',
    kbd = '',
    badge = null,
    hint = '',
    error = '',
    required = false,
    disabled = false,
    readonly = false,
    checked = false,
    rows = 3,
    options = [],
    className = ''
} = {}) {
    const safeType = SUPPORTED_TYPES.has(type) ? type : 'text';
    const safeId = escapeHTML(id || `field-${Math.random().toString(36).slice(2, 8)}`);
    const safeName = escapeHTML(name || id || '');
    const hintId = hint ? `${safeId}-hint` : '';
    const errorId = `${safeId}-error`;
    const describedBy = [hintId, errorId].filter(Boolean).join(' ');

    if (safeType === 'checkbox' || safeType === 'switch') {
        const switchCls = safeType === 'switch' ? 'form-switch' : '';
        return `
            <div class="ui-field ui-field--check ${escapeHTML(className)}">
                <div class="form-check ${switchCls}">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        id="${safeId}"
                        name="${safeName}"
                        ${checked ? 'checked' : ''}
                        ${disabled ? 'disabled' : ''}
                        ${required ? 'required' : ''}
                        aria-describedby="${escapeHTML(describedBy)}"
                    >
                    ${label ? `<label class="form-check-label ui-field__label" for="${safeId}">${escapeHTML(label)}</label>` : ''}
                </div>
                ${hint ? `<small id="${hintId}" class="ui-field__hint">${escapeHTML(hint)}</small>` : ''}
                <small id="${errorId}" class="ui-field__error" ${error ? '' : 'hidden'}>${escapeHTML(error)}</small>
            </div>
        `;
    }

    const commonAttrs = [
        `id="${safeId}"`,
        safeName ? `name="${safeName}"` : '',
        placeholder ? `placeholder="${escapeHTML(placeholder)}"` : '',
        describedBy ? `aria-describedby="${escapeHTML(describedBy)}"` : '',
        required ? 'required' : '',
        disabled ? 'disabled' : '',
        readonly ? 'readonly' : '',
        error ? 'aria-invalid="true"' : ''
    ].filter(Boolean).join(' ');

    let controlHtml;
    if (safeType === 'select') {
        const optsHtml = (options || []).map((opt) => {
            const val = escapeHTML(String(opt.value ?? ''));
            const lbl = escapeHTML(String(opt.label ?? opt.value ?? ''));
            const isSelected = opt.selected || String(opt.value) === String(value);
            return `<option value="${val}" ${isSelected ? 'selected' : ''}>${lbl}</option>`;
        }).join('');
        controlHtml = `<select class="form-select ui-field__control" ${commonAttrs}>${optsHtml}</select>`;
    } else if (safeType === 'textarea') {
        controlHtml = `<textarea class="form-control ui-field__control" rows="${Number(rows) || 3}" ${commonAttrs}>${escapeHTML(String(value ?? ''))}</textarea>`;
    } else {
        controlHtml = `<input type="${safeType}" class="form-control ui-field__control" value="${escapeHTML(String(value ?? ''))}" ${commonAttrs}>`;
    }

    const iconHtml = icon
        ? `<span class="ui-field__addon ui-field__addon--start" aria-hidden="true"><i class="bi ${escapeHTML(icon)}"></i></span>`
        : '';

    const kbdHtml = kbd
        ? `<kbd class="cmd-kbd ui-field__kbd">${escapeHTML(kbd)}</kbd>`
        : '';

    const badgeTone = badge?.tone ? `badge--${escapeHTML(badge.tone)}` : 'badge--primary';
    const badgeHtml = badge?.text
        ? `<span class="badge ${badgeTone} ui-field__badge">${escapeHTML(badge.text)}</span>`
        : '';

    const endAddon = (kbdHtml || badgeHtml)
        ? `<span class="ui-field__addon ui-field__addon--end">${badgeHtml}${kbdHtml}</span>`
        : '';

    return `
        <div class="ui-field ${error ? 'ui-field--invalid' : ''} ${escapeHTML(className)}">
            ${label ? `<label class="ui-field__label" for="${safeId}">${escapeHTML(label)}${required ? ' <span class="ui-field__req" aria-hidden="true">*</span>' : ''}</label>` : ''}
            <div class="ui-field__box ${safeType === 'textarea' ? 'ui-field__box--multiline' : ''}">
                ${iconHtml}
                ${controlHtml}
                ${endAddon}
            </div>
            ${hint ? `<small id="${hintId}" class="ui-field__hint">${escapeHTML(hint)}</small>` : ''}
            <small id="${errorId}" class="ui-field__error" ${error ? '' : 'hidden'}>${escapeHTML(error)}</small>
        </div>
    `;
}

export default { renderField };
