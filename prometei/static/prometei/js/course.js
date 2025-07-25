// Course Page JavaScript

document.addEventListener('DOMContentLoaded', function () {
    console.log('Course page loaded');

    // Initialize course page functionality
    initCourse();

    // iOS Safari viewport height fix
    initIOSViewportFix();
});

function initCourse() {
    // Course-specific initialization code will go here

    // Smooth scrolling for course navigation
    initSmoothScrolling();

    // Course form handling
    initCourseForm();
}

function initSmoothScrolling() {
    // Add smooth scrolling behavior
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initCourseForm() {
    // Course form initialization will go here
    const forms = document.querySelectorAll('.course-form');

    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            // Form handling logic will be added here
        });
    });
}

function initIOSViewportFix() {
    // Fix for iOS Safari dynamic viewport
    function setVHProperty() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Set on load
    setVHProperty();

    // Update on resize and orientation change
    window.addEventListener('resize', setVHProperty);
    window.addEventListener('orientationchange', function () {
        setTimeout(setVHProperty, 100);
    });

    // iOS Safari and mobile specific fixes
    if (navigator.userAgent.includes('Safari') || /Mobi|Android/i.test(navigator.userAgent)) {
        // Prevent zoom on input focus
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);

        // Optimize GIF loading and performance
        const video = document.querySelector('.hero-video');
        if (video) {
            video.style.webkitTransform = 'translate3d(0, 0, 0)';
            video.style.transform = 'translate3d(0, 0, 0)';
            video.style.willChange = 'transform';

            // Ensure GIF maintains aspect ratio
            video.style.objectFit = 'contain';
            video.style.objectPosition = 'center';

            // Optimize for GIF animation
            video.style.imageRendering = 'auto';

            // Add intersection observer for performance
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.willChange = 'auto';
                            // Ensure smooth GIF playback
                            entry.target.style.animationPlayState = 'running';
                        } else {
                            entry.target.style.willChange = 'transform';
                        }
                    });
                });
                observer.observe(video);
            }

            // Handle orientation change for better scaling
            window.addEventListener('orientationchange', function () {
                setTimeout(() => {
                    video.style.objectFit = 'contain';
                    video.style.width = '100%';
                    video.style.height = '100%';
                }, 200);
            });

            // Prevent GIF zoom on iOS
            video.addEventListener('touchstart', function (e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });

            video.addEventListener('gesturestart', function (e) {
                e.preventDefault();
            }, { passive: false });
        }
    }
} 