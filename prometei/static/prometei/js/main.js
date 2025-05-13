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
    const header = document.querySelector('.header');

    // Функція для встановлення стану мобільного меню
    function updateMobileMenuState() {
        if (!mobileMenu || !header) return;

        const headerHeight = header.offsetHeight;
        // Встановлюємо CSS змінну для доступу в стилях
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

        mobileMenu.style.top = `${headerHeight}px`;

        if (mobileMenu.classList.contains('active')) {
            // Не встановлюємо фіксовану висоту, а дозволяємо CSS правилам керувати цим
            document.body.classList.add('menu-open');
        } else {
            mobileMenu.style.height = '0';
            document.body.classList.remove('menu-open');
        }
    }

    // Функція для перемикання мобільного меню (уникаємо дублювання)
    function toggleMobileMenu(event) {
        // Запобігаємо спрацюванню події за замовчуванням тільки для touchstart
        if (event.type === 'touchstart') {
            event.preventDefault();
        }

        if (mobileMenuToggle && mobileMenu) {
            const isActive = mobileMenu.classList.contains('active');

            mobileMenuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            // Оновлюємо ARIA атрибути
            mobileMenuToggle.setAttribute('aria-expanded', isActive ? 'false' : 'true');
            mobileMenu.setAttribute('aria-hidden', isActive ? 'true' : 'false');

            updateMobileMenuState();
        }
    }

    // Функція для закриття мобільного меню
    function closeMobileMenu() {
        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');

            // Оновлюємо ARIA атрибути
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');

            updateMobileMenuState();
        }
    }

    // Додаємо обробники подій до кнопки
    if (mobileMenuToggle) {
        // Використовуємо єдиний обробник для click, що добре працює на більшості пристроїв
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);

        // Додаємо touchstart спеціально для iOS щоб уникнути затримки
        mobileMenuToggle.addEventListener('touchstart', toggleMobileMenu, { passive: false });
    }

    // Додаємо обробник для закриття меню при кліку на посилання
    if (mobileMenu) {
        const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav__link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // Закриваємо меню при ресайзі вікна, якщо ширина більша за точку перелому
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        }
        updateMobileMenuState();
    });

    // Ініціалізуємо початковий стан
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
