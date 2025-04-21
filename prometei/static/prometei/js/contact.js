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

            // Clear previous status
            formStatus.textContent = 'Відправка...';
            formStatus.className = 'form-status visible'; // Show sending message

            // Basic Frontend Validation
            const nameInput = document.getElementById('name');
            const contactMethodInput = document.getElementById('contact_method');
            const messageInput = document.getElementById('message');

            const name = nameInput.value.trim();
            const contactMethod = contactMethodInput.value.trim();
            const message = messageInput.value.trim();

            let isValid = true;
            let errorMessage = '';

            if (!name || !contactMethod || !message) {
                isValid = false;
                errorMessage = 'Будь ласка, заповніть усі обов'язкові поля.';
            } else if (contactMethod.length > 0 && !contactMethod.includes('@') && !contactMethod.startsWith('@')) {
                // Basic check: if it doesn't contain @ and doesn't start with @, assume invalid
                isValid = false;
                errorMessage = 'Будь ласка, введіть дійсний Email або Telegram (@username).';
                contactMethodInput.focus(); // Focus the invalid field
            }

            if (!isValid) {
                formStatus.textContent = errorMessage;
                formStatus.classList.add('error');
                // Keep visible
                return;
            }

            // Simulate sending data (replace with actual fetch/AJAX later)
            console.log('Form submitted:', { name, contactMethod, message });
            // Disable button during simulated sending
            contactForm.querySelector('button[type="submit"]').disabled = true;

            setTimeout(() => {
                // Simulate success
                formStatus.textContent = 'Дякуємо! Ваше повідомлення надіслано.';
                formStatus.classList.remove('error');
                formStatus.classList.add('success');
                formStatus.classList.add('visible');
                contactForm.reset(); // Clear the form

                // Re-enable button
                contactForm.querySelector('button[type="submit"]').disabled = false;

                // Optional: Hide message after a few seconds
                setTimeout(() => {
                    formStatus.classList.remove('visible');
                }, 5000);

            }, 1000); // Simulate network delay
        });
    }
});
