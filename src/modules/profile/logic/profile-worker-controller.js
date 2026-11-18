/**
 * @fileoverview ProfileWorkerController - Lógica interactiva para la pestaña de Talento & Ficha
 * @module modules/profile/logic/profile-worker-controller
 */

import userService from '@/modules/auth/services/UserService.js';
import { eventBus } from '@/core/eventBus/index.js';
import { $id, $, $$, $on, $val, $hide, $className, $addClass, $removeClass, $text } from '@/shared/utils/dom.js';
import { setButtonLoading, setButtonContent } from '@/shared/utils/dom.js';
import { escapeHTML } from '@/shared/utils/security.js';
import { renderFichaCardHtml } from '../components/parts/worker/ficha-card.js';

export const ProfileWorkerController = {
    bind(parent) {
        this.parent = parent;
        this._bindStatusDropdown();
        this._bindSkills();
        this._bindFichas();
        this._bindForm();
    },

    _bindStatusDropdown() {
        const statusTrigger = $id('btn-status-dropdown-trigger');
        const statusMenu = $id('status-dropdown-menu');
        if (!statusTrigger || !statusMenu) return;

        $on(statusTrigger, 'click', (e) => {
            e.stopPropagation();
            statusMenu.classList.toggle('d-none');
        });

        $on(statusMenu, 'click', (e) => {
            const option = e.target.closest('.status-option-item');
            if (!option) return;
            const val = option.getAttribute('data-value');
            const label = option.getAttribute('data-label');
            const dotClass = option.getAttribute('data-dot');

            const hiddenInput = $id('worker-avail-status');
            if (hiddenInput) hiddenInput.value = val;
            const labelEl = $id('status-current-label');
            if (labelEl) $text(labelEl, label);
            const dotEl = $id('status-current-dot');
            if (dotEl) $className(dotEl, `status-dot ${dotClass}`);

            $$('.status-option-item', statusMenu).forEach(opt => $removeClass(opt, 'selected'));
            $addClass(option, 'selected');
            $hide(statusMenu);
        });

        $on(document, 'click', () => {
            if (statusMenu) $hide(statusMenu);
        });
    },

    _bindSkills() {
        const btnAddSkill = $id('btn-add-skill');
        const skillsRow = $id('skills-cards-row');
        if (btnAddSkill && skillsRow) {
            $on(btnAddSkill, 'click', () => {
                const name = prompt('Ingrese el nombre de la habilidad práctica:');
                if (!name || !name.trim()) return;
                const safeName = escapeHTML(name.trim());
                const itemHtml = `
                    <div class="col-12 col-sm-6 skill-card-col">
                        <div class="p-2.5 rounded-3 border bg-surface-subtle d-flex align-items-center justify-content-between skill-card-item">
                            <div class="d-flex align-items-center gap-2 min-w-0">
                                <i class="bi bi-patch-check-fill text-primary fs-6 flex-shrink-0"></i>
                                <span class="fw-semibold small text-main text-truncate skill-name-label">${safeName}</span>
                            </div>
                            <div class="d-flex align-items-center gap-1.5 flex-shrink-0">
                                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle font-monospace profile-badge-micro skill-pts-badge">500 Pts</span>
                                <button type="button" class="btn btn-sm btn-link text-danger p-0 border-0 btn-remove-skill" title="Eliminar"><i class="bi bi-x-circle-fill"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                skillsRow.insertAdjacentHTML('beforeend', itemHtml);
            });

            $on(skillsRow, 'click', (e) => {
                const removeBtn = e.target.closest('.btn-remove-skill');
                if (removeBtn) {
                    const col = removeBtn.closest('.skill-card-col');
                    if (col) col.remove();
                }
            });
        }
    },

    _bindFichas() {
        const cardsList = $id('experience-cards-list');
        const btnAddCard = $id('btn-add-experience-card');

        if (btnAddCard) {
            $on(btnAddCard, 'click', () => this._openFichaModal());
        }

        if (cardsList) {
            $on(cardsList, 'click', (e) => {
                const deleteBtn = e.target.closest('.btn-delete-experience-card');
                if (deleteBtn) {
                    const card = deleteBtn.closest('.experience-card-item');
                    if (card && confirm('¿Desea eliminar esta ficha laboral?')) {
                        card.remove();
                    }
                    return;
                }

                const toggle = e.target.closest('[data-action="worker:toggle_ficha"]');
                if (!toggle || e.target.closest('button')) return;
                const currentCard = toggle.closest('.experience-card-item');
                if (!currentCard) return;

                $$('.experience-card-item', cardsList).forEach(c => {
                    if (c !== currentCard) $addClass(c, 'collapsed');
                });
                currentCard.classList.toggle('collapsed');
            });
        }
    },

    _openFichaModal() {
        const company = prompt('Nombre del comercio / empresa:');
        if (!company || !company.trim()) return;
        const role = prompt('Puesto o roles desempeñados:', 'Operador Comercial ERP');
        const schedule = prompt('Horario asignado:', '08:00 AM - 05:00 PM');
        const days = prompt('Días de jornada:', 'Lunes a Viernes');

        const cardData = {
            id: `exp_${Date.now()}`,
            company_name: company.trim(),
            job_role: (role || 'Operador Comercial').trim(),
            date_range: '2024 - Presente',
            branch_location: 'Sede Principal',
            schedule_label: `${schedule || '08:00 AM - 05:00 PM'} (${days || 'Lun a Vie'})`,
            is_verified: true,
            shifts: [
                { name: 'Turno Principal', time: schedule || '08:00 AM - 05:00 PM', days: days || 'Lunes a Viernes', theme: 'primary' }
            ]
        };

        const cardsList = $id('experience-cards-list');
        if (cardsList) {
            const emptyNotice = $('.bg-body-tertiary', cardsList);
            if (emptyNotice) emptyNotice.remove();
            cardsList.insertAdjacentHTML('afterbegin', renderFichaCardHtml(cardData, Date.now()));
        }
    },

    _bindForm() {
        const formWorker = $id('form-profile-worker');
        if (!formWorker) return;

        $on(formWorker, 'submit', async (e) => {
            e.preventDefault();
            const saveBtn = $id('btn-save-profile-worker');
            if (saveBtn) setButtonLoading(saveBtn, true, 'Guardando en Supabase...');

            const job_title = $val('worker-job-title');
            const bio = $val('worker-bio');
            const availability_status = $val('worker-avail-status', 'available');

            const skills = [];
            $$('.skill-card-item').forEach(item => {
                const name = $('.skill-name-label', item)?.textContent?.trim();
                const pts = $('.skill-pts-badge', item)?.textContent?.trim() || '500 Pts';
                if (name) skills.push({ name, pts, icon: 'bi-patch-check-fill' });
            });

            const experience_cards = [];
            $$('.experience-card-item').forEach(item => {
                const rawJson = item.getAttribute('data-ficha-json');
                if (rawJson) {
                    try { experience_cards.push(JSON.parse(rawJson)); } catch (_e) { /* ignorar error de parseo */ }
                }
            });

            try {
                const res = await userService.updateWorkerProfile({
                    job_title: job_title || 'Operador General',
                    bio: bio || '',
                    availability_status,
                    skills,
                    experience_cards
                });

                if (!res.success) {
                    this.parent.showFeedback(res.error || 'Error al validar datos laborales.', true);
                } else {
                    this.parent.showFeedback('¡Talento y Fichas laborales actualizados con éxito en Supabase!', false);
                    eventBus.emit('notifications:push', {
                        title: 'Talento Actualizado',
                        message: 'Su perfil y fichas de experiencia fueron sincronizados en Supabase.',
                        type: 'success'
                    });
                }
            } catch (err) {
                this.parent.showFeedback(err.message || 'Error guardando en Supabase.', true);
            } finally {
                if (saveBtn) {
                    setButtonLoading(saveBtn, false);
                    setButtonContent(saveBtn, 'Actualizar Talento & Fichas en Supabase', 'bi bi-cloud-arrow-up-fill me-2');
                }
            }
        });
    }
};

export default ProfileWorkerController;
