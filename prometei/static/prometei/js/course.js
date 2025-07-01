// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {

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
        link.addEventListener('click', function (e) {
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

    // Form Handling
    const courseForm = document.getElementById('courseForm');
    if (!courseForm) return;

    courseForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
        document.getElementById('form-error').style.display = 'none';
        document.getElementById('form-success').style.display = 'none';

        // Get form data
        const formData = new FormData(courseForm);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const response = await fetch(window.location.pathname, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                courseForm.reset();
                document.getElementById('form-success').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('form-success').style.display = 'none';
                }, 5000);
            } else {
                if (result.errors) {
                    Object.keys(result.errors).forEach(field => {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) {
                            errorElement.textContent = result.errors[field].join(', ');
                            errorElement.style.display = 'block';
                        }
                    });
                } else {
                    document.getElementById('form-error').style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            document.getElementById('form-error').style.display = 'block';
        }
    });

    // Form field validation
    const validateField = (input) => {
        const errorElement = document.getElementById(`${input.name}-error`);
        if (!errorElement) return;

        if (!input.value.trim()) {
            errorElement.textContent = 'Це поле обов\'язкове';
            errorElement.style.display = 'block';
            return false;
        }

        if (input.name === 'contact_method') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            const telegramRegex = /^@?[a-zA-Z0-9_]{5,}$/;

            if (!emailRegex.test(input.value) &&
                !phoneRegex.test(input.value) &&
                !telegramRegex.test(input.value)) {
                errorElement.textContent = 'Введіть коректний email, телефон або Telegram';
                errorElement.style.display = 'block';
                return false;
            }
        }

        errorElement.style.display = 'none';
        return true;
    };

    // Add validation on blur
    courseForm.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            const errorElement = document.getElementById(`${input.name}-error`);
            if (errorElement) errorElement.style.display = 'none';
        });
    });

    // Payment buttons logic
    const paymentButtons = document.querySelectorAll('.payment-btn');
    const paymentModal = document.getElementById('paymentModal');
    const modalClose = document.querySelector('.payment-modal-close');
    const cancelPayment = document.getElementById('cancelPayment');
    const paymentForm = document.getElementById('paymentForm');
    const modalPackageTitle = document.getElementById('modalPackageTitle');
    const modalPackagePrice = document.getElementById('modalPackagePrice');

    console.log('Payment elements found:');
    console.log('- Payment buttons:', paymentButtons.length);
    console.log('- Payment modal:', paymentModal);
    console.log('- Modal close:', modalClose);
    console.log('- Cancel payment:', cancelPayment);
    console.log('- Payment form:', paymentForm);
    console.log('- Modal package title:', modalPackageTitle);
    console.log('- Modal package price:', modalPackagePrice);

    let selectedPackage = null;

    // Open payment modal
    paymentButtons.forEach(button => {
        button.addEventListener('click', function () {
            console.log('Payment button clicked:', this.dataset);

            selectedPackage = {
                type: this.dataset.package,
                title: this.dataset.title,
                price: this.dataset.price
            };

            modalPackageTitle.textContent = selectedPackage.title;
            modalPackagePrice.textContent = `${selectedPackage.price} грн`;

            paymentModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            console.log('Modal opened, package:', selectedPackage);
            console.log('Modal element:', paymentModal);

            // Focus on first input
            setTimeout(() => {
                const nameInput = document.getElementById('clientName');
                if (nameInput) {
                    nameInput.focus();
                    console.log('Input focused, value:', nameInput.value);
                    console.log('Input styles:', getComputedStyle(nameInput));
                } else {
                    console.error('Name input not found');
                }
            }, 200);
        });
    });

    // Close modal functions
    function closePaymentModal() {
        paymentModal.style.display = 'none';
        document.body.style.overflow = '';
        paymentForm.reset();
        selectedPackage = null;
    }

    modalClose.addEventListener('click', closePaymentModal);
    cancelPayment.addEventListener('click', closePaymentModal);

    // Close modal on outside click
    paymentModal.addEventListener('click', function (e) {
        if (e.target === paymentModal) {
            closePaymentModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && paymentModal.style.display === 'flex') {
            closePaymentModal();
        }
    });

    // Payment form submission
    paymentForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!selectedPackage) {
            alert('Помилка: не обрано пакет');
            return;
        }

        const clientName = document.getElementById('clientName').value.trim();
        const clientEmail = document.getElementById('clientEmail').value.trim();

        if (!clientName) {
            alert('Будь ласка, введіть ваше ім\'я');
            return;
        }

        const confirmButton = document.getElementById('confirmPayment');
        const originalText = confirmButton.textContent;

        // Show loading state
        confirmButton.disabled = true;
        confirmButton.textContent = 'Створюємо посилання...';

        try {
            const response = await fetch('/uk/course/create-payment-link/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    package_type: selectedPackage.type,
                    client_name: clientName,
                    client_email: clientEmail
                })
            });

            const result = await response.json();

            if (result.success) {
                // Redirect to payment page
                window.location.href = result.payment_url;
            } else {
                alert(result.message || 'Помилка при створенні платіжного посилання');
                confirmButton.disabled = false;
                confirmButton.textContent = originalText;
            }
        } catch (error) {
            console.error('Error creating payment link:', error);
            alert('Помилка з\'єднання. Спробуйте пізніше.');
            confirmButton.disabled = false;
            confirmButton.textContent = originalText;
        }
    });

    console.log('Course payment system initialized! 💳');
}); 