/**
 * Main JavaScript for Prometey Labs
 * Handles theme switching and mobile menu
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const htmlElement = document.documentElement;

    // Theme Switching
    const initTheme = () => {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem('prometei-theme');

        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            htmlElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        }
    };

    const toggleTheme = () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('prometei-theme', newTheme);

        // Optional: Add transition animation to body
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    };

    // Mobile Menu
    const toggleMobileMenu = () => {
        mobileMenu.classList.toggle('active');

        // Animate hamburger icon to X
        const lines = mobileMenuToggle.querySelectorAll('.mobile-menu-toggle__line');

        if (mobileMenu.classList.contains('active')) {
            // Transform to X
            lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';

            // Prevent scrolling when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            // Reset to hamburger icon
            lines[0].style.transform = 'none';
            lines[1].style.opacity = '1';
            lines[2].style.transform = 'none';

            // Re-enable scrolling
            document.body.style.overflow = '';
        }
    };

    // Close mobile menu when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav__link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Close mobile menu when resizing to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Set up event listeners
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Initialize theme on page load
    initTheme();

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
