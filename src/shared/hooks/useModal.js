import { eventBus } from '@/core/eventBus/index.js';

export const useModal = () => {
    
    /**
     * Abre el modal base con contenido dinámico.
     * @param {Object} config - { title, subtitle, description, body, content }
     */
    const open = ({ title, subtitle, description, body, content }) => {
        eventBus.emit('ui:open_modal', {
            title,
            subtitle,
            description,
            content: body || content
        });
    };

    /**
     * Cierra el modal activo.
     */
    const close = () => {
        eventBus.emit('ui:close_modal');
    };

    return { open, close };
};

export default useModal;
