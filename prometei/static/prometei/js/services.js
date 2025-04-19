/**
 * JavaScript for Services Page
 * Handles modal window interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
    const modalOverlay = document.getElementById('modalOverlay');

    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal && modalOverlay) {
            modal.classList.add('active');
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    };

    const closeModal = () => {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal && modalOverlay) {
            activeModal.classList.remove('active');
            modalOverlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore background scrolling
        }
    };

    // Event listeners for opening modals
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = event.currentTarget.getAttribute('data-modal-trigger');
            openModal(modalId);
        });
    });

    // Event listeners for closing modals
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Close modal when clicking on the overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && document.querySelector('.modal.active')) {
            closeModal();
        }
    });
});
