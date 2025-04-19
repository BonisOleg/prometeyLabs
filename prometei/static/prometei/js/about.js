/**
 * JavaScript for About Us Page
 * Handles scroll animations and other interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("About page JavaScript loaded.");

    // TODO: Implement scroll animations for sections/cards
    // Example using IntersectionObserver:
    // const elementsToAnimate = document.querySelectorAll('.team-card, .about-mission__wrapper');
    // if (elementsToAnimate.length && 'IntersectionObserver' in window) {
    //     const observer = new IntersectionObserver((entries) => {
    //         entries.forEach((entry, index) => {
    //             if (entry.isIntersecting) {
    //                 setTimeout(() => {
    //                     entry.target.style.opacity = '1';
    //                     entry.target.style.transform = 'translateY(0)';
    //                 }, index * 150); 
    //                 observer.unobserve(entry.target);
    //             }
    //         });
    //     }, { threshold: 0.1 });

    //     elementsToAnimate.forEach(el => {
    //         el.style.opacity = '0';
    //         el.style.transform = 'translateY(30px)';
    //         el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    //         observer.observe(el);
    //     });
    // }
});
