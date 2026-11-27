/**
 * ExportReportModal - Orquestador modular del modal de exportación de reportes
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo Workspace.
 */
import { modalServiceV2 } from '@/shared/ui/services/modal/modal-service-v2.js';
import { renderButton } from '@/shared/ui/primitives/ui-button.js';
import { exportReportTemplate } from '../templates/_export_report.js';

export const ExportReportModal = {
    show() {
        modalServiceV2.showModal({
            id: 'export-report-modal',
            scope: 'module',
            size: 'md',
            header: {
                left: {
                    icon: 'bi-cloud-arrow-down-fill',
                    title: 'Exportar Reporte Maestro',
                    subtitle: 'Generador de documentos ERP'
                }
            },
            body: {
                html: exportReportTemplate()
            },
            footer: {
                right: renderButton({ variant: 'primary', pill: true, label: 'Cerrar', action: 'ui:close_modal' })
            }
        });
    }
};

export default ExportReportModal;
