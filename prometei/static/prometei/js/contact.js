/**
 * JavaScript for Contact Page
 * Handles form validation and submission feedback.
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            formStatus.textContent = 'Відправка...';
            formStatus.className = 'form-status'; // Reset classes

            // Basic Frontend Validation (Example)
            const name = document.getElementById('name').value.trim();
            const contactMethod = document.getElementById('contact_method').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !contactMethod || !message) {
                formStatus.textContent = 'Будь ласка, заповніть усі поля.';
                formStatus.classList.add('error');
                return;
            }

            // Simulate sending data (replace with actual fetch/AJAX later)
            console.log('Form submitted:', { name, contactMethod, message });

            setTimeout(() => {
                // Simulate success
                formStatus.textContent = 'Дякуємо! Ваше повідомлення надіслано.';
                formStatus.classList.add('success');
                contactForm.reset(); // Clear the form

                // Optional: Clear message after a few seconds
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);

            }, 1000); // Simulate network delay
        });
    }
});
