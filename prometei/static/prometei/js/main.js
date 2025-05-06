/**
 * Main JavaScript for Prometey Labs
 * Handles theme switching and mobile menu
 */

document.addEventListener('DOMContentLoaded', function () {
    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const currentTheme = bodyElement.getAttribute('data-theme') || 'light';

    // Initialize theme
    htmlElement.setAttribute('data-theme', currentTheme);

    themeToggle.addEventListener('click', function () {
        const currentTheme = bodyElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        bodyElement.setAttribute('data-theme', newTheme);
        htmlElement.setAttribute('data-theme', newTheme);

        // Save theme preference in cookie
        document.cookie = `theme=${newTheme};path=/;max-age=31536000`;
    });

    // Mobile Menu Toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const header = document.querySelector('.header'); // Отримуємо хедер

    function updateMobileMenuPositionAndHeight() {
        const headerHeight = header.offsetHeight;
        mobileMenu.style.top = `${headerHeight}px`;

        if (mobileMenu.classList.contains('active')) {
            mobileMenu.style.height = `${window.innerHeight - headerHeight}px`;
        } else {
            mobileMenu.style.height = '0px';
        }
    }

    mobileMenuToggle.addEventListener('click', function () {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');

        if (mobileMenu.classList.contains('active')) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
        updateMobileMenuPositionAndHeight(); // Оновлюємо позицію та висоту
    });

    mobileMenuToggle.addEventListener('touchstart', function (e) {
        e.preventDefault();
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');

        if (mobileMenu.classList.contains('active')) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
        updateMobileMenuPositionAndHeight(); // Оновлюємо позицію та висоту
    });

    const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
    mobileNavLinks.forEach(link => {
        function closeMenuAction() {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            updateMobileMenuPositionAndHeight(); // Оновлюємо позицію та висоту
        }
        link.addEventListener('click', closeMenuAction);
        link.addEventListener('touchstart', closeMenuAction);
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
        updateMobileMenuPositionAndHeight(); // Оновлюємо позицію та висоту при ресайзі
    });

    // Запускаємо оновлення позиції при завантаженні сторінки
    updateMobileMenuPositionAndHeight();

    // Add active class to current page nav link
    const currentUrl = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentUrl ||
            (currentUrl === '/' && link.getAttribute('href') === '{% url "prometei:home" %}')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
});
