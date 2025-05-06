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

    mobileMenuToggle.addEventListener('click', function () {
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');

        // Prevent scrolling when menu is open
        if (mobileMenu.classList.contains('active')) {
            document.body.classList.add('menu-open');
            // Динамічно встановлюємо висоту меню для коректної роботи на iOS
            const headerHeight = document.querySelector('.header').offsetHeight;
            mobileMenu.style.height = `${window.innerHeight - headerHeight}px`;
        } else {
            document.body.classList.remove('menu-open');
            mobileMenu.style.height = '0px';
        }
    });

    // Додаємо підтримку touchstart для кращої реакції на iOS
    mobileMenuToggle.addEventListener('touchstart', function (e) {
        e.preventDefault();
        mobileMenuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');

        // Prevent scrolling when menu is open
        if (mobileMenu.classList.contains('active')) {
            document.body.classList.add('menu-open');
            // Динамічно встановлюємо висоту меню для коректної роботи на iOS
            const headerHeight = document.querySelector('.header').offsetHeight;
            mobileMenu.style.height = `${window.innerHeight - headerHeight}px`;
        } else {
            document.body.classList.remove('menu-open');
            mobileMenu.style.height = '0px';
        }
    });

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function () {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenu.style.height = '0px';
        });
        // Додаємо touchstart для посилань
        link.addEventListener('touchstart', function (e) {
            // Не запобігаємо події, щоб посилання працювали
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenu.style.height = '0px';
        });
    });

    // Close mobile menu when resize to desktop
    window.addEventListener('resize', function () {
        if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.classList.remove('menu-open');
            mobileMenu.style.height = '0px';
        }
        // Оновлюємо висоту меню при зміні розміру вікна, якщо воно відкрите
        if (mobileMenu.classList.contains('active')) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            mobileMenu.style.height = `${window.innerHeight - headerHeight}px`;
            // Оновлюємо позицію для iOS, щоб меню залишалося зверху
            mobileMenu.style.top = `${headerHeight}px`;
        }
    });

    // Оновлюємо позицію меню при прокрутці для коректної роботи на iOS
    window.addEventListener('scroll', function () {
        if (mobileMenu.classList.contains('active')) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            mobileMenu.style.top = `${headerHeight}px`;
        }
    });

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
