/**
 * JavaScript for Promin Page
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Promin page loaded');

    const form = document.getElementById('promin-application-form');

    // Перевірка, чи форму знайдено
    if (!form) {
        console.error('Form with ID "promin-application-form" not found!');
        return; // Зупиняємо виконання, якщо форми немає
    }

    // Обробка відправки форми
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Запобігаємо стандартній відправці

        const formStatus = document.getElementById('prominFormStatus') || createFormStatusDiv(form);
        clearProminFormErrors(form); // Очищаємо попередні помилки

        formStatus.textContent = 'Надсилання заявки...';
        formStatus.className = 'form-status visible';

        // Збираємо дані з форми
        const nameInput = document.getElementById('contact-name');
        const contactMethodInput = document.getElementById('contact-email');
        const projectNameInput = document.getElementById('project-name');
        const projectTypeInput = document.getElementById('project-type');
        const projectDescriptionInput = document.getElementById('project-description');
        const projectBudgetInput = document.getElementById('project-budget');
        const projectDeadlineInput = document.getElementById('project-deadline');

        const formData = {
            name: nameInput ? nameInput.value.trim() : '',
            contact_method: contactMethodInput ? contactMethodInput.value.trim() : '',
            project_name: projectNameInput ? projectNameInput.value.trim() : '',
            project_type: projectTypeInput ? projectTypeInput.value : '',
            project_description: projectDescriptionInput ? projectDescriptionInput.value.trim() : '',
            project_budget: projectBudgetInput ? projectBudgetInput.value : null,
            project_deadline: projectDeadlineInput ? projectDeadlineInput.value : null,
            message: projectDescriptionInput ? projectDescriptionInput.value.trim() : '' // Використовуємо опис як повідомлення
        };

        // --- Базова валідація на фронтенді (можна розширити) ---
        let isValid = true;
        let errorMessages = [];
        if (!formData.name) { isValid = false; errorMessages.push('Ім\'я обов\'язкове.'); nameInput?.classList.add('input-error'); }
        if (!formData.contact_method) { isValid = false; errorMessages.push('Контактний метод обов\'язковий.'); contactMethodInput?.classList.add('input-error'); }
        if (!formData.project_name) { isValid = false; errorMessages.push('Назва проєкту обов\'язкова.'); projectNameInput?.classList.add('input-error'); }
        if (!formData.project_type) { isValid = false; errorMessages.push('Тип проєкту обов\'язковий.'); projectTypeInput?.classList.add('input-error'); }
        if (!formData.project_description) { isValid = false; errorMessages.push('Опис проєкту обов\'язковий.'); projectDescriptionInput?.classList.add('input-error'); }
        // Додайте перевірку для contact_method (email/telegram) якщо потрібно

        if (!isValid) {
            formStatus.textContent = errorMessages[0] || 'Будь ласка, виправте помилки.';
            formStatus.classList.add('error');
            // Фокус на першому полі з помилкою
            const firstErrorInput = form.querySelector('.input-error');
            if (firstErrorInput) firstErrorInput.focus();
            return;
        }
        // --- Кінець валідації --- 

        // Отримуємо CSRF token
        const csrfToken = form.querySelector('input[name="csrfmiddlewaretoken"]').value;
        const submitButton = form.querySelector('button[type="submit"]');

        // Вимикаємо кнопку
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Надсилаємо...';
        }

        // Відправляємо дані AJAX запитом
        fetch(form.action || window.location.href, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', // ВАЖЛИВО: Цей заголовок!
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                // Перевіряємо статус відповіді
                if (!response.ok) {
                    // Якщо статус не 2xx, намагаємось прочитати помилку з JSON
                    return response.json().then(errData => {
                        throw { status: response.status, data: errData };
                    }).catch(() => {
                        // Якщо тіло відповіді не JSON або порожнє
                        throw { status: response.status, data: { message: `HTTP помилка ${response.status}` } };
                    });
                }
                return response.json(); // Якщо відповідь OK
            })
            .then(data => {
                if (data.success) {
                    formStatus.textContent = data.message || 'Заявку успішно надіслано!';
                    formStatus.classList.remove('error');
                    formStatus.classList.add('success');
                    form.reset(); // Очищуємо форму
                } else {
                    formStatus.textContent = data.message || 'Помилка валідації на сервері.';
                    formStatus.classList.remove('success');
                    formStatus.classList.add('error');
                    // Можна додати підсвітку полів з помилками з data.errors
                    if (data.errors) {
                        highlightServerErrors(form, data.errors);
                    }
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                // Показуємо повідомлення з помилки, якщо є, або загальне
                let errorMessage = 'Виникла помилка при надсиланні. Спробуйте пізніше.';
                if (error && error.data && error.data.message) {
                    errorMessage = error.data.message;
                } else if (error && error.status) {
                    errorMessage = `Помилка сервера (${error.status}). Спробуйте пізніше.`;
                }
                formStatus.textContent = errorMessage;
                formStatus.classList.remove('success');
                formStatus.classList.add('error');
            })
            .finally(() => {
                // Вмикаємо кнопку назад
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Надіслати заявку'; // Повертаємо оригінальний текст кнопки
                }
                // Ховаємо повідомлення про успіх через деякий час
                if (formStatus.classList.contains('success')) {
                    setTimeout(() => {
                        formStatus.classList.remove('visible');
                    }, 5000);
                }
            });
    });

    // --- Допоміжні функції --- 
    function createFormStatusDiv(formElement) {
        let statusDiv = document.getElementById('prominFormStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'prominFormStatus';
            statusDiv.className = 'form-status';
            // Вставляємо перед кнопкою або в кінці форми
            const submitBtn = formElement.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.parentNode.insertBefore(statusDiv, submitBtn.nextSibling);
            } else {
                formElement.appendChild(statusDiv);
            }
        }
        return statusDiv;
    }

    function clearProminFormErrors(formElement) {
        const errorElements = formElement.querySelectorAll('.input-error');
        errorElements.forEach(el => el.classList.remove('input-error'));
        const statusDiv = document.getElementById('prominFormStatus');
        if (statusDiv) {
            statusDiv.textContent = '';
            statusDiv.className = 'form-status';
        }
    }

    function highlightServerErrors(formElement, errors) {
        for (const field in errors) {
            // Спробуємо знайти поле за name або id
            let input = formElement.querySelector(`[name="${field}"]`);
            if (!input) {
                // ID полів у формі ProminRequestForm специфічні
                const idMap = {
                    'name': 'contact-name',
                    'contact_method': 'contact-email',
                    'project_name': 'project-name',
                    'project_type': 'project-type',
                    'project_description': 'project-description',
                    'project_budget': 'project-budget',
                    'project_deadline': 'project-deadline'
                };
                if (idMap[field]) {
                    input = document.getElementById(idMap[field]);
                }
            }

            if (input) {
                input.classList.add('input-error');
                // Можна додати показ повідомлення про помилку поруч з полем
                console.warn(`Server validation error for ${field}: ${errors[field]}`);
            }
        }
    }
}); 