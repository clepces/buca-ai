/**
 * @fileoverview touchGestures - Sistema de gestos táctiles para componentes de interfaz (Bottom Sheets)
 * @module shared/utils/touchGestures
 */

export const initTouchGestures = (onClose) => {
    const THRESHOLD_RICH = 140;
    const THRESHOLD_SM = 110;
    const VELOCITY_THRESHOLD = 0.55;

    let startY = 0;
    let currentY = 0;
    let startTime = 0;
    let isDragging = false;
    let activePanel = null;
    let touchStartedInScrollable = false;

    const onTouchStart = (e) => {
        if (window.innerWidth > 767) return;

        // No interceptar clics en elementos interactivos (botones, pestañas, links)
        if (e.target.closest('button, a, input, select, textarea, [data-action], .notif-action-btn, .tray-tab-btn')) {
            return;
        }

        const panel = e.target.closest('.glass-panel.active, .notification-tray-panel.active');
        if (!panel) return;

        const scrollArea = panel.querySelector('.buca-scroll-area, .panel-scroll-area, [class*="scroll-area"]');
        const touchInsideScrollArea = scrollArea && (scrollArea === e.target || scrollArea.contains(e.target));

        // Si el usuario toca dentro del área con scroll y ya bajó en el contenido, NO arrastrar el panel
        if (touchInsideScrollArea && scrollArea.scrollTop > 2) {
            return;
        }

        startY = e.touches[0].clientY;
        currentY = startY;
        startTime = Date.now();
        isDragging = false;
        touchStartedInScrollable = Boolean(touchInsideScrollArea);
        activePanel = panel;
    };

    const onTouchMove = (e) => {
        if (!activePanel) return;

        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;

        // Si inició en área de scroll y hay desplazamiento interno, cancelar arrastre
        if (touchStartedInScrollable) {
            const scrollArea = activePanel.querySelector('.buca-scroll-area, .panel-scroll-area, [class*="scroll-area"]');
            if (scrollArea && scrollArea.scrollTop > 2) {
                if (isDragging) {
                    activePanel.style.transition = '';
                    activePanel.style.transform = 'translateY(0)';
                }
                activePanel = null;
                isDragging = false;
                return;
            }
        }

        // Zona muerta de 16px para evitar activación accidental al hacer tap o scroll leve
        if (deltaY > 16) {
            isDragging = true;
            activePanel.style.transition = 'none';
            const drag = (deltaY - 16) * 0.6;
            activePanel.style.transform = `translateY(${drag}px)`;
            if (e.cancelable) e.preventDefault();
        } else if (deltaY < -10) {
            if (isDragging) {
                activePanel.style.transition = '';
                activePanel.style.transform = 'translateY(0)';
            }
            isDragging = false;
        }
    };

    const onTouchEnd = () => {
        if (!activePanel) return;

        if (!isDragging) {
            activePanel = null;
            return;
        }

        const deltaY = currentY - startY;
        const elapsed = Date.now() - startTime;
        const velocity = elapsed > 0 ? deltaY / elapsed : 0;

        const isRich = activePanel.classList.contains('glass-panel--rich');
        const threshold = isRich ? THRESHOLD_RICH : THRESHOLD_SM;
        const shouldClose = deltaY >= threshold || velocity >= VELOCITY_THRESHOLD;

        activePanel.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';
        const panelRef = activePanel;

        if (shouldClose) {
            panelRef.style.transform = 'translateY(100%)';
            setTimeout(() => {
                panelRef.style.transform = '';
                if (onClose) onClose();
            }, 300);
        } else {
            panelRef.style.transform = 'translateY(0)';
            setTimeout(() => {
                if (panelRef) panelRef.style.transition = '';
            }, 300);
        }

        isDragging = false;
        activePanel = null;
    };

    const onTouchCancel = () => {
        if (activePanel) {
            activePanel.style.transition = '';
            activePanel.style.transform = 'translateY(0)';
        }
        isDragging = false;
        activePanel = null;
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
        document.removeEventListener('touchstart', onTouchStart);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('touchcancel', onTouchCancel);
    };
};
