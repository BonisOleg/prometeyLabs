/**
 * JavaScript for Contact Page
 * Handles form validation and submission feedback.
 */

console.log('contact.js loaded'); // DEBUG: Script loaded

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired'); // DEBUG: DOM loaded
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    // Функція для валідації email
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Функція для валідації Telegram username
    const isValidTelegram = (username) => {
        return username.startsWith('@') && username.length > 1;
    };

    // Функція для очищення помилок форми
    const clearFormErrors = () => {
        const errorElements = document.querySelectorAll('.error');
        errorElements.forEach(element => {
            element.classList.remove('visible');
        });

        const inputElements = contactForm.querySelectorAll('input, textarea');
        inputElements.forEach(input => {
            input.classList.remove('input-error');
        });
    };

    if (contactForm) {
        console.log('contactForm found, attaching submit listener'); // DEBUG: Attaching listener
        contactForm.addEventListener('submit', (event) => {
            console.log('Submit event triggered'); // DEBUG: Submit triggered
            event.preventDefault(); // Prevent default form submission
            console.log('preventDefault called'); // DEBUG

            // Clear previous status and errors
            try { // DEBUG: Added try...catch for clearFormErrors
            clearFormErrors();
                console.log('clearFormErrors called successfully'); // DEBUG
            } catch (e) {
                console.error('Error in clearFormErrors:', e); // DEBUG
                return; // Stop execution if error here
            }

            formStatus.textContent = 'Відправка...';
            formStatus.className = 'form-status visible'; // Show sending message
            console.log('formStatus updated'); // DEBUG

            // Basic Frontend Validation
            const nameInput = document.getElementById('name');
            console.log('nameInput retrieved:', nameInput); // DEBUG
            const contactMethodInput = document.getElementById('contact_method');
            console.log('contactMethodInput retrieved:', contactMethodInput); // DEBUG
            const messageInput = document.getElementById('message');
            console.log('messageInput retrieved:', messageInput); // DEBUG

            if (!nameInput || !contactMethodInput || !messageInput) { // DEBUG: Check if elements exist
                console.error('One or more form input elements not found!');
                return;
            }

            const name = nameInput.value.trim();
            const contactMethod = contactMethodInput.value.trim();
            const message = messageInput.value.trim();

            let isValid = true;
            let errorMessages = [];

            // Валідація полів форми
            if (!name) {
                isValid = false;
                nameInput.classList.add('input-error');
                errorMessages.push('Будь ласка, введіть ваше ім\'я.');
            }

            const isEmail = isValidEmail(contactMethod);
            const isTelegram = isValidTelegram(contactMethod);
            if (!contactMethod) {
                isValid = false;
                contactMethodInput.classList.add('input-error');
                errorMessages.push('Будь ласка, введіть Email або Telegram.');
            } else if (!isEmail && !isTelegram) {
                isValid = false;
                contactMethodInput.classList.add('input-error');
                errorMessages.push('Будь ласка, введіть коректний Email або Telegram (@username).');
            }

            if (!message) {
                isValid = false;
                messageInput.classList.add('input-error');
                errorMessages.push('Будь ласка, введіть повідомлення.');
            }

            if (!isValid) {
                formStatus.textContent = errorMessages[0];
                formStatus.classList.add('error');
                if (nameInput.classList.contains('input-error')) nameInput.focus();
                else if (contactMethodInput.classList.contains('input-error')) contactMethodInput.focus();
                else if (messageInput.classList.contains('input-error')) messageInput.focus();
                return;
            }

            // Отримуємо CSRF token з форми
            const csrfToken = contactForm.querySelector('input[name="csrfmiddlewaretoken"]').value;

            // Показуємо візуальну індикацію відправки
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Відправляємо...';

            // Відправляємо дані на сервер
            fetch(contactForm.action || window.location.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    name: name,
                    contact_method: contactMethod,
                    message: message
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Обробляємо відповідь
                    if (data.success) {
                        // Успішно відправлено
                        formStatus.textContent = data.message || 'Дякуємо! Ваше повідомлення надіслано.';
                        formStatus.classList.remove('error');
                        formStatus.classList.add('success');
                        contactForm.reset(); // Очищаємо форму
                    } else {
                        // Помилка
                        formStatus.textContent = data.message || 'Виникла помилка. Спробуйте пізніше.';
                        formStatus.classList.remove('success');
                        formStatus.classList.add('error');

                        // Показуємо помилки валідації, якщо вони є
                        if (data.errors) {
                            for (const field in data.errors) {
                                const input = document.getElementById(field);
                                if (input) {
                                    input.classList.add('input-error');
                                    input.title = data.errors[field].join(', ');
                                }
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    formStatus.textContent = 'Виникла помилка при відправці. Спробуйте пізніше.';
                    formStatus.classList.remove('success');
                    formStatus.classList.add('error');
                })
                .finally(() => {
                    // Re-enable button
                    submitButton.disabled = false;
                    submitButton.textContent = 'Надіслати';

                    // Hide success message after a few seconds
                    if (formStatus.classList.contains('success')) {
                        setTimeout(() => {
                            formStatus.classList.remove('visible');
                        }, 5000);
                    }
                });
        });
    }
});
