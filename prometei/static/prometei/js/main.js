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

    function updateMobileMenuState() {
        const headerHeight = header.offsetHeight;
        // Встановлюємо top для мобільного меню відносно хедера
        // Цей стиль може бути встановлений і в CSS, але для динаміки висоти хедера (якщо вона зміниться) краще тут
        mobileMenu.style.top = `${headerHeight}px`;

        if (mobileMenu.classList.contains('active')) {
            // Встановлюємо висоту активного меню
            mobileMenu.style.height = `${window.innerHeight - headerHeight}px`;
            document.body.classList.add('menu-open');
        } else {
            mobileMenu.style.height = '0px';
            document.body.classList.remove('menu-open');
        }
    }

    mobileMenuToggle.addEventListener('click', function () {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        updateMobileMenuState();
    });

    mobileMenuToggle.addEventListener('touchstart', function (e) {
        e.preventDefault(); // Залишаємо для запобігання подвійного кліку (click + touch)
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        updateMobileMenuState();
    });

    const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
    mobileNavLinks.forEach(link => {
        function closeMenuAction() {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            updateMobileMenuState();
        }
        link.addEventListener('click', closeMenuAction);
        link.addEventListener('touchstart', function (e) {
            // Для посилань не робимо e.preventDefault(), щоб перехід відбувся
            closeMenuAction();
        });
    });

    window.addEventListener('resize', function () {
        // Закриваємо меню на десктопі, якщо воно було відкрите
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) { // Змінено на 768px відповідно до CSS
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
        updateMobileMenuState(); // Оновлюємо стан/висоту/позицію меню при ресайзі
    });

    // Ініціалізація стану меню при завантаженні (важливо для правильного top)
    updateMobileMenuState();

    // Add active class to current page nav link
    const currentUrl = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');

    navLinks.forEach(link => {
        // Порівнюємо повний шлях або тільки '/' для домашньої сторінки
        let linkPath = link.getAttribute('href');
        try {
            // Якщо це Django URL тег, він може бути відносним. Для порівняння потрібен повний шлях.
            // Однак, якщо це зовнішнє посилання, URL об'єкт не спрацює. Тому обережно.
            if (linkPath && !linkPath.startsWith('http') && !linkPath.startsWith('#')) {
                const fullUrl = new URL(linkPath, window.location.origin);
                linkPath = fullUrl.pathname;
            }
        } catch (error) {
            // Залишаємо linkPath як є, якщо не вдалося створити URL
        }

        const isHomePage = currentUrl === '/' && (linkPath === '/' || linkPath === '/uk/' || linkPath === '/en/');
        const isCurrentPage = linkPath === currentUrl;

        if (isHomePage || isCurrentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
});
