import { eventBus } from '@/core/eventBus/index.js';
import { rateManagementTemplate } from '@/modules/finance/components/RateManagementModal.js';
import { settingsTemplate } from './modals/_settings.js';
import { createBusinessWizardTemplate } from './modals/_business_wizard.js';
import { userProfileFullTemplate } from '@/modules/profile/templates/_user_profile.js';
import { terminalTemplate, helpTemplate, alertMiniTemplate, notificationsTemplate, comingSoonTemplate } from './modals/_system_modals.js';
import { exportReportTemplate } from '@/modules/workspace/templates/_export_report.js';
import { performanceTemplate } from '@/modules/workspace/templates/_performance.js';

export class ModalTemplate {


    /**
     * Construye la estructura de cabecera estándar para cualquier modal.
     * @param {Object} options
     * @returns {{ left: string, right: string }}
     */
    static buildHeader({ icon = 'bi-window', title = '', subtitle = '', tag = null, actions = '' } = {}) {
        return {
            left: `
                <div class="header-icon-box">
                    <i class="bi ${icon}"></i>
                    <div class="icon-glow"></div>
                </div>
                <div class="modal-title-group">
                    <h3 class="modal-title">${title}</h3>
                    <div class="d-flex align-items-center gap-2">
                        ${subtitle ? `<span class="modal-subtitle">${subtitle}</span>` : ''}
                        ${tag ? `<span class="engine-version-tag">${tag}</span>` : ''}
                    </div>
                </div>
            `,
            right: actions || `
                <div class="header-actions">
                    <button class="action-mini-btn close modal-close-btn" data-action="ui:close_modal" title="Cerrar">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            `
        };
    }

    /**
     * Registro centralizado de plantillas modularizadas.
     */
    static registry = {
        rateManagement: rateManagementTemplate,
        settings: settingsTemplate,
        terminal: terminalTemplate,
        help: helpTemplate,
        createBusiness: createBusinessWizardTemplate,
        createBusinessWizard: createBusinessWizardTemplate,
        userProfileFull: userProfileFullTemplate,
        profile: userProfileFullTemplate,
        alertMini: alertMiniTemplate,
        notifications: notificationsTemplate,
        exportReport: exportReportTemplate,
        performance: performanceTemplate,
        comingSoon: comingSoonTemplate
    };

    /**
     * Renderiza una plantilla registrada por su identificador.
     * @param {string} templateId 
     * @param {Object} data 
     * @returns {string} HTML renderizado
     */
    static render(templateId, data = {}) {
        const renderer = this.registry[templateId];
        
        if (typeof renderer === 'function') {
            try {
                return renderer(data);
            } catch (err) {
                console.error(`[ModalTemplate] Error renderizando "${templateId}":`, err);
                eventBus.emit('notifications:push', {
                    title: 'Error de Interfaz',
                    message: `Fallo crítico al renderizar componente: ${templateId}`,
                    type: 'error'
                });
                return `<div class="alert alert-danger">Error crítico al renderizar la plantilla "${templateId}".</div>`;
            }
        }
        
        console.error(`[ModalTemplate] Plantilla no encontrada en el registro: "${templateId}"`);
        eventBus.emit('notifications:push', {
            title: 'Componente Faltante',
            message: `La plantilla "${templateId}" no está registrada en el sistema.`,
            type: 'warning'
        });
        console.log('[ModalTemplate] Registro actual:', Object.keys(this.registry));
        
        return `<div class="alert alert-danger">Error: La plantilla "${templateId}" no existe en el motor de renderizado.</div>`;
    }
}

export const ModalTemplates = {
    settings: (data) => ModalTemplate.render('settings', data),
    terminal: (data) => ModalTemplate.render('terminal', data),
    help: (data) => ModalTemplate.render('help', data),
    createBusiness: (data) => ModalTemplate.render('createBusiness', data),
    createBusinessWizard: (data) => ModalTemplate.render('createBusinessWizard', data),
    userProfileFull: (data) => ModalTemplate.render('userProfileFull', data),
    alertMini: (data) => ModalTemplate.render('alertMini', data),
    notifications: (data) => ModalTemplate.render('notifications', data),
    rateManagement: (data) => ModalTemplate.render('rateManagement', data),
    exportReport: (data) => ModalTemplate.render('exportReport', data),
    performance: (data) => ModalTemplate.render('performance', data),
    comingSoon: (data) => ModalTemplate.render('comingSoon', data),
    buildHeader: (opts) => ModalTemplate.buildHeader(opts),
    render: (id, data) => ModalTemplate.render(id, data)
};

export default ModalTemplate;
