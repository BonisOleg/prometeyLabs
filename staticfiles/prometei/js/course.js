// Course Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    console.log('Course page loaded');

    const enrollBtn = document.querySelector('.btn-primary');

    if (enrollBtn) {
        enrollBtn.addEventListener('click', function () {
            alert('Форма реєстрації буде додана пізніше');
        });
    }
}); 