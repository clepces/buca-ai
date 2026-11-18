/**
 * @fileoverview feedback-panel - Panel Desplegable de Feedback e Ideas
 * @module shared/ui/components/header/feedback-panel
 */
import { escapeHTML } from '@/shared/utils/security.js';

export const FeedbackPanel = {
    render() {
        const options = [
            {
                id: 'issue',
                icon: 'bi-exclamation-triangle',
                colorClass: 'text-danger',
                title: 'Incidencia',
                desc: 'Problema técnico con mi unidad o datos'
            },
            {
                id: 'idea',
                icon: 'bi-lightbulb',
                colorClass: 'text-warning',
                title: 'Idea',
                desc: 'Sugerencia para mejorar BUCA AI'
            }
        ];

        return `
            <div id="panel-feedback" class="glass-panel solid-dropdown-panel feedback-dropdown-panel">
                <div class="px-3.5 py-3 border-bottom d-flex align-items-center justify-content-between">
                    <span class="fw-bold small text-main">¿Qué te gustaría compartir?</span>
                    <button type="button" class="btn-close-panel btn btn-sm p-0 text-muted" data-action="header:close_all_panels">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                
                <div class="feedback-grid-container p-3.5">
                    <div class="row g-3">
                        ${options.map(opt => `
                            <div class="col-6">
                                <button type="button" class="feedback-card-btn w-100 p-3.5 rounded-3 text-center border transition-all h-100 d-flex flex-column align-items-center justify-content-center" 
                                        data-action="feedback:select_type" 
                                        data-type="${opt.id}">
                                    <div class="feedback-icon-box mb-2.5 ${opt.colorClass}">
                                        <i class="bi ${opt.icon} fs-2"></i>
                                    </div>
                                    <span class="d-block fw-bold text-main small mb-1.5">${escapeHTML(opt.title)}</span>
                                    <span class="d-block text-muted x-small lh-sm px-1">${escapeHTML(opt.desc)}</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="px-4 py-2.5 bg-subtle border-top text-center">
                    <span class="x-small text-muted d-block lh-base">Tus comentarios alimentan el Roadmap de BUCA AI</span>
                </div>
            </div>
        `;
    }
};

export default FeedbackPanel;
