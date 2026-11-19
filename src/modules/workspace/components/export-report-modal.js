/**
 * ExportReportModal - Orquestador modular del modal de exportación de reportes
 * =========================================================================
 * Clean Core Architecture: Componente nativo del módulo Workspace.
 */
import ModalService from '@/shared/ui/services/ModalService.js';
import { exportReportTemplate } from '../templates/_export_report.js';

export const ExportReportModal = {
    show() {
        ModalService.showModal({
            size: 'md',
            header: ModalService.buildHeader({
                icon: 'bi-cloud-arrow-down-fill',
                title: 'Exportar Reporte Maestro',
                subtitle: 'GENERADOR DE DOCUMENTOS ERP'
            }),
            body: exportReportTemplate(),
            footer: {
                right: '<button type="button" class="btn btn-primary rounded-pill px-4" data-action="ui:close_modal">Cerrar</button>'
            }
        });
    }
};

export default ExportReportModal;
