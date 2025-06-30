// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // FAQ Accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed nav
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.benefit-card, .plan-card, .testimonial-card, .section-title'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Plan card hover effects
    const planCards = document.querySelectorAll('.plan-card');
    
    planCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            if (card.classList.contains('plan-recommended')) {
                card.style.transform = 'translateY(-5px) scale(1.05)';
            } else {
                card.style.transform = 'translateY(0) scale(1)';
            }
        });
    });
    
    // Testimonials navigation for mobile
    let currentTestimonial = 0;
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialGrid = document.querySelector('.testimonials-grid');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    
    function scrollToTestimonial(index) {
        if (window.innerWidth <= 768 && testimonialGrid) {
            const cardWidth = testimonialGrid.clientWidth;
            testimonialGrid.scrollTo({
                left: cardWidth * index,
                behavior: 'smooth'
            });
        }
    }
    
    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        scrollToTestimonial(currentTestimonial);
    }
    
    function prevTestimonial() {
        currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        scrollToTestimonial(currentTestimonial);
    }
    
    // Add event listeners for navigation buttons
    if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);
    if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);
    
    // Touch/swipe support for testimonials on mobile
    if (testimonialGrid && window.innerWidth <= 768) {
        let startX = 0;
        let scrollLeft = 0;
        let autoScrollInterval;
        let isUserInteracting = false;
        
        // Auto-scroll every 5 seconds on mobile
        function startAutoScroll() {
            autoScrollInterval = setInterval(() => {
                if (!isUserInteracting && window.innerWidth <= 768) {
                    nextTestimonial();
                }
            }, 5000);
        }
        
        function stopAutoScroll() {
            clearInterval(autoScrollInterval);
        }
        
        // Start auto-scroll
        startAutoScroll();
        
        testimonialGrid.addEventListener('touchstart', (e) => {
            isUserInteracting = true;
            stopAutoScroll();
            startX = e.touches[0].clientX;
            scrollLeft = testimonialGrid.scrollLeft;
        });
        
        testimonialGrid.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const x = e.touches[0].clientX;
            const walk = (x - startX) * 2;
            testimonialGrid.scrollLeft = scrollLeft - walk;
        });
        
        testimonialGrid.addEventListener('touchend', () => {
            isUserInteracting = false;
            // Resume auto-scroll after 10 seconds of no interaction
            setTimeout(() => {
                if (!isUserInteracting) {
                    startAutoScroll();
                }
            }, 10000);
        });
        
        // Update current testimonial based on scroll position
        testimonialGrid.addEventListener('scroll', () => {
            if (window.innerWidth <= 768) {
                const cardWidth = testimonialGrid.clientWidth;
                currentTestimonial = Math.round(testimonialGrid.scrollLeft / cardWidth);
            }
        });
        
        // Pause auto-scroll when page is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoScroll();
            } else if (!isUserInteracting && window.innerWidth <= 768) {
                startAutoScroll();
            }
        });
    }
    
    console.log('PrometeyLabs Landing Page initialized successfully! 🚀');
}); 