/**
 * JavaScript for Home Page
 * Enhances the animated tape and adds interactive elements
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get the animated tape
    const animatedTape = document.querySelector('.animated-tape__wrapper');

    // Enhanced Animated Tape - Automatically adjust speed based on screen width
    const adjustTapeAnimation = () => {
        const screenWidth = window.innerWidth;
        const animationDuration = screenWidth < 768 ? '20s' : '30s';
        animatedTape.style.animationDuration = animationDuration;
    };

    // Call initially and on window resize
    adjustTapeAnimation();
    window.addEventListener('resize', adjustTapeAnimation);

    // Pause animation on hover
    animatedTape.addEventListener('mouseenter', () => {
        animatedTape.style.animationPlayState = 'paused';
    });

    animatedTape.addEventListener('mouseleave', () => {
        animatedTape.style.animationPlayState = 'running';
    });

    // Add parallax effect to the hero circles
    const heroImage = document.querySelector('.hero__image-placeholder');
    if (heroImage) {
        document.addEventListener('mousemove', (e) => {
            const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
            const yAxis = (window.innerHeight / 2 - e.pageY) / 25;

            const circle = heroImage.querySelector('.hero__image-circle');
            if (circle) {
                circle.style.transform = `translate(${xAxis}px, ${yAxis}px)`;
            }
        });
    }

    // Add fade-in animation to feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');

    if (featureCards.length && 'IntersectionObserver' in window) {
        const featureObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add animation with staggered delay
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);

                    // Unobserve after animation
                    featureObserver.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: '0px'
        });

        // Set initial state and observe
        featureCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            featureObserver.observe(card);
        });
    }

    // Add a nice effect to CTA section
    const ctaSection = document.querySelector('.cta__wrapper');
    if (ctaSection && 'IntersectionObserver' in window) {
        const ctaObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('cta--visible');
                    ctaObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });

        ctaSection.style.opacity = '0';
        ctaSection.style.transform = 'scale(0.95)';
        ctaSection.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';

        ctaObserver.observe(ctaSection);

        // Add the style for the visible state
        document.head.insertAdjacentHTML('beforeend', `
            <style>
                .cta--visible {
                    opacity: 1 !important;
                    transform: scale(1) !important;
                }
            </style>
        `);
    }
});
