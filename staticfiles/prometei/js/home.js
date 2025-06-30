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
        // Reduced animation duration for faster speed
        const animationDuration = screenWidth < 768 ? '8s' : '12s';
        animatedTape.style.animationDuration = animationDuration;
    };

    // Call initially and on window resize
    adjustTapeAnimation();
    window.addEventListener('resize', adjustTapeAnimation);

    // Add parallax effect to the hero circles
    /* // Removed: Elements no longer exist
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
    */

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

    // --- Canvas Hero Image Animation ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        // Get image path from data attribute or fallback
        const imagePath = document.body.dataset.prometeyImagePath || '/static/prometei/media/prometey.png'; // Fallback
        img.src = imagePath;

        const particles = [];
        const numParticles = 50; // Number of fire particles
        let canvasWidth, canvasHeight;
        let flameCenterX, flameCenterY, flameRadius;

        img.onload = () => {
            resizeAndDraw();
            createParticles();
            animate();
        };

        img.onerror = () => {
            console.error(`Failed to load image at ${imagePath}`);
            // Optionally draw a placeholder or message on canvas
            canvas.width = 300;
            canvas.height = 300;
            ctx.fillStyle = '#eee';
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = '#555';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Image load failed', 150, 150);
        }

        function resizeAndDraw() {
            const containerWidth = canvas.parentElement.offsetWidth;
            const scaleFactor = 1.888; // Apply scaling programmatically (1.573 * 1.20)
            const originalWidth = img.naturalWidth; // Use naturalWidth/Height for original dimensions
            const originalHeight = img.naturalHeight;
            const targetMaxHeight = 550; // Match increased CSS max-height

            // Calculate height respecting max-height
            let drawHeight = Math.min(targetMaxHeight, originalHeight * scaleFactor);
            let scaleToFitHeight = drawHeight / originalHeight;

            // Calculate width based on height scale
            let drawWidth = originalWidth * scaleToFitHeight;

            // Check if width exceeds container, if so, scale down based on width
            if (drawWidth > containerWidth) {
                drawWidth = containerWidth;
                let scaleToFitWidth = drawWidth / originalWidth;
                drawHeight = originalHeight * scaleToFitWidth;
            }

            // Set canvas dimensions
            canvas.width = drawWidth;
            canvas.height = drawHeight;
            canvasWidth = drawWidth;
            canvasHeight = drawHeight;

            // Define flame area coordinates based on final canvas size
            // These might need fine-tuning!
            flameCenterX = canvasWidth * 0.23;    // Adjusted slightly more left (was 0.25)
            flameCenterY = canvasHeight * 0.22;   // Adjusted higher (was 0.25)
            flameRadius = canvasWidth * 0.08;    // Radius of the flame area

            // Draw the main image first
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

            // Apply rounded corners using clipping path
            applyCanvasRounding(16); // Use a helper function for clarity
        }

        function applyCanvasRounding(radius) {
            ctx.save();
            ctx.beginPath();
            // Create rounded rectangle path
            ctx.moveTo(radius, 0);
            ctx.lineTo(canvasWidth - radius, 0);
            ctx.arcTo(canvasWidth, 0, canvasWidth, radius, radius);
            ctx.lineTo(canvasWidth, canvasHeight - radius);
            ctx.arcTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight, radius);
            ctx.lineTo(radius, canvasHeight);
            ctx.arcTo(0, canvasHeight, 0, canvasHeight - radius, radius);
            ctx.lineTo(0, radius);
            ctx.arcTo(0, 0, radius, 0, radius);
            ctx.closePath();
            // Clip subsequent drawings to this path
            ctx.clip();
            ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight); // Redraw image within the clipped area
            ctx.restore(); // Restore context to remove clipping for particles
        }


        function createParticles() {
            particles.length = 0; // Clear particles on resize
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: flameCenterX + (Math.random() - 0.5) * flameRadius * 3.9,
                    y: flameCenterY + (Math.random() - 0.5) * flameRadius * 2.5,
                    size: Math.random() * 4 + 1.5,
                    speedY: Math.random() * 0.8 + 0.4,
                    opacity: Math.random() * 0.5 + 0.1,
                    life: Math.random() * 60 + 30,
                    initialX: flameCenterX
                });
            }
        }

        function animateParticles() {
            // Apply a subtle glow effect behind the particles - REMOVED
            /*
             ctx.globalCompositeOperation = 'lighter'; // Blend particle colors
             ctx.filter = 'blur(5px)';
             ctx.fillStyle = 'rgba(255, 150, 0, 0.1)'; // Faint orange glow
             ctx.beginPath();
             ctx.arc(flameCenterX, flameCenterY, flameRadius * 1.2, 0, Math.PI * 2);
             ctx.fill();
             ctx.filter = 'none';
             ctx.globalCompositeOperation = 'source-over'; // Reset blending mode
            */

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.y -= p.speedY;
                // Make horizontal movement drift slightly outwards
                p.x += (p.x > p.initialX ? 0.1 : -0.1) * Math.random() * 0.5;
                p.opacity -= 0.01; // Fade out
                p.life--;

                // Reset particle if it's dead or too far up
                if (p.opacity <= 0 || p.life <= 0 || p.y < flameCenterY - flameRadius * 4.5) {
                    particles[i] = {
                        x: flameCenterX + (Math.random() - 0.5) * flameRadius * 1.3,
                        y: flameCenterY + Math.random() * flameRadius * 1.5,
                        size: Math.random() * 4 + 1.5,
                        speedY: Math.random() * 0.8 + 0.4,
                        opacity: Math.random() * 0.5 + 0.1,
                        life: Math.random() * 60 + 30,
                        initialX: flameCenterX
                    };
                } else {
                    // Draw the particle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
                    // Yellow-orange fire color with opacity
                    ctx.fillStyle = `rgba(255, ${Math.floor(Math.random() * 80 + 150)}, 0, ${p.opacity})`;
                    ctx.fill();
                }
            }
        }

        function animate() {
            // Clear the canvas
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw the fire particles first (behind the image)
            animateParticles();

            // Draw the image with rounded corners on top of the particles
            // applyCanvasRounding handles clipping and drawing the image
            applyCanvasRounding(16);

            requestAnimationFrame(animate);
        }

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (img.complete && img.naturalWidth > 0) { // Ensure image is loaded before resizing
                    resizeAndDraw();
                    createParticles(); // Recreate particles for new coordinates
                }
            }, 250); // Debounce resize event
        });

    } // end if(canvas)

    // --- End Canvas Hero Image Animation ---

}); // end DOMContentLoaded
