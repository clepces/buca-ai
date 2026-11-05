/**
 * ModalBase - Estructura HTML global para el sistema de modales BUSA-I
 */
export const ModalBase = {
    render: () => `
        <div id="modal-base" class="glass-modal-overlay" aria-hidden="true">
            <div class="glass-modal" id="modal-container">
                <div class="modal-header">
                    <div class="header-left" id="modal-header-left"></div>
                    <div class="header-center" id="modal-header-center"></div>
                    <div class="header-right" id="modal-header-right"></div>
                </div>
                <div class="modal-body" id="modal-body-content"></div>
                <div class="modal-footer">
                    <div class="footer-left" id="modal-footer-left"></div>
                    <div class="footer-center" id="modal-footer-center"></div>
                    <div class="footer-right" id="modal-footer-right"></div>
                </div>
            </div>
        </div>
    `
};

export default ModalBase;
