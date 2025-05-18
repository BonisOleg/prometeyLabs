/**
 * PROmin Landing Page JavaScript
 * Modern animations with GSAP, ScrollTrigger, and 3D effects
 */

console.log('promin_landing.js loaded');

// Check if GSAP is available
if (typeof gsap === 'undefined') {
    console.error('GSAP library not loaded! Animations will not work.');
}

// Add debug variable to troubleshoot animation issues
let animationsInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');

    // Check if GSAP is loaded
    if (typeof gsap === 'undefined') {
        console.error('GSAP not available at DOMContentLoaded');
        return;
    }

    try {
        // Initialize GSAP and ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);
        console.log('GSAP and ScrollTrigger registered successfully');
    } catch (error) {
        console.error('Error registering GSAP plugins:', error);
    }

    // Fix for iOS Safari 100vh issue
    fixIOSHeight();
    window.addEventListener('resize', fixIOSHeight);
    window.addEventListener('orientationchange', fixIOSHeight);

    // Initialize immediately for better user experience
    initializeAnimations();

    // Also set up on load event as backup
    window.addEventListener('load', () => {
        console.log('Window loaded event fired');
        if (!animationsInitialized) {
            console.log('Initializing animations on window load (backup)');
            initializeAnimations();
        }
    });

    // Initialize form handling
    initFormHandling();

    // Initialize keyword animations immediately
    initKeywordAnimations();

    // Log element count to help debug
    console.log('Animation target elements found:');
    console.log('- Keywords:', document.querySelectorAll('.keyword').length);
    console.log('- Text reveals:', document.querySelectorAll('.text-reveal').length);
    console.log('- Shapes:', document.querySelectorAll('.shape').length);
    console.log('- Buttons:', document.querySelectorAll('.cta-button').length);
});

/**
 * Fix for iOS Safari height issues
 */
function fixIOSHeight() {
    // First we get the viewport height and multiply it by 1% to get a value for a vh unit
    const vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);

    // Apply the height fix to the landing wrapper - allow natural scrolling
    const landingWrapper = document.querySelector('.landing-wrapper');
    if (landingWrapper) {
        // On mobile devices, don't constrain the height to allow scrolling
        if (window.innerWidth <= 768) {
            landingWrapper.style.height = 'auto';
            landingWrapper.style.minHeight = `calc(var(--vh, 1vh) * 100)`;
        } else {
            landingWrapper.style.height = `calc(var(--vh, 1vh) * 100)`;
        }
    }

    // Fix iOS Safari specific scrolling issues
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.body.style.height = 'auto';
        document.documentElement.style.height = 'auto';
    }
}

/**
 * Initialize staggered animations for keywords
 */
function initKeywordAnimations() {
    console.log('Initializing keyword animations');

    const keywords = document.querySelectorAll('.keyword');
    if (keywords.length === 0) {
        console.warn('No keyword elements found for animation');
        return;
    }

    // Manually add class to make them visible if GSAP fails
    keywords.forEach(keyword => {
        keyword.style.opacity = 1;
    });

    try {
        // Add staggered entry animation for keywords
        gsap.from('.keyword', {
            scale: 0.8,
            opacity: 0,
            duration: 0.6, // Faster for mobile
            stagger: 0.08,
            ease: 'elastic.out(1, 0.3)',
            delay: 0.2,
            onStart: () => console.log('Keyword animation started'),
            onComplete: () => console.log('Keyword animation completed')
        });
    } catch (error) {
        console.error('Error animating keywords:', error);
    }
}

/**
 * Initialize all GSAP animations and scroll triggers
 */
function initializeAnimations() {
    console.log('Initializing animations');

    // If already initialized, don't do it again
    if (animationsInitialized) {
        console.log('Animations already initialized, skipping');
        return;
    }

    // Check if GSAP is loaded again
    if (typeof gsap === 'undefined') {
        console.error('GSAP not available during animation initialization');

        // Apply manual failsafe visibility for critical elements
        document.querySelectorAll('.text-reveal, .cta-button, .website-frame, .voucher-card').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
        return;
    }

    // Check if we're on mobile
    const isMobile = window.innerWidth <= 768;

    try {
        // Make sure elements exist before animating
        if (document.querySelectorAll('.shape').length === 0) {
            console.warn('No shape elements found for animation');
        }

        if (document.querySelectorAll('.text-reveal').length === 0) {
            console.warn('No text-reveal elements found for animation');
        }

        // Initial page load animation
        const initialTl = gsap.timeline({
            onStart: () => console.log('Main animation timeline started'),
            onComplete: () => {
                console.log('Main animation timeline completed');

                // After the initial animation is complete, initialize device motion if on mobile
                if (isMobile || 'ontouchstart' in window) {
                    initDeviceMotion();
                } else {
                    // On desktop, use mouse tracking
                    initMouseMovement();
                }
            }
        });

        initialTl
            // Animate background shapes
            .to('.shape', {
                duration: isMobile ? 1 : 1.5,
                opacity: 0.6,
                stagger: isMobile ? 0.05 : 0.1,
                ease: 'power2.out',
                onStart: () => console.log('Shape animation started')
            })
            // Animate intro text
            .to('.intro-section .text-reveal', {
                y: 0,
                opacity: 1,
                duration: isMobile ? 0.5 : 0.7,
                ease: 'power3.out',
                onStart: () => console.log('Intro text animation started')
            }, '-=1')
            // Animate intro CTA button
            .to('.intro-section .cta-button', {
                y: 0,
                opacity: 1,
                duration: isMobile ? 0.5 : 0.7,
                ease: 'elastic.out(1, 0.5)',
                onStart: () => console.log('Intro CTA animation started')
            }, '-=0.4')
            // Animate voucher card
            .to('.voucher-card', {
                y: 0,
                opacity: 1,
                duration: isMobile ? 0.5 : 0.7,
                ease: 'power3.out',
                onStart: () => console.log('Voucher card animation started')
            }, '-=0.6')
            // Animate website frame
            .to('.website-frame', {
                rotateY: 0,
                rotateX: 0,
                scale: 1,
                opacity: 1,
                duration: isMobile ? 0.5 : 0.7,
                ease: 'power3.out',
                onStart: () => console.log('Website frame animation started'),
                onComplete: () => {
                    console.log('Website frame animation completed');
                    // Add enhanced animations for website mockup elements after the frame appears
                    if (isMobile) {
                        animateMockWebsiteElements();
                    }
                }
            }, '-=0.4')
            .to('.website-text .text-reveal', {
                y: 0,
                opacity: 1,
                stagger: 0.08,
                duration: isMobile ? 0.4 : 0.5,
                ease: 'power3.out',
                onStart: () => console.log('Website text animation started')
            }, '-=0.4')
            .to('.website-section .cta-button', {
                y: 0,
                opacity: 1,
                duration: isMobile ? 0.4 : 0.5,
                ease: 'back.out(1.7)',
                onStart: () => console.log('Website CTA animation started')
            }, '-=0.2')
            // Animate close button
            .to('.close-button', {
                opacity: 1,
                scale: 1,
                duration: 0.3,
                ease: 'power2.out',
                onStart: () => console.log('Close button animation started')
            }, '-=0.7');

        // Add subtle floating effect to voucher amount (less movement for compact design)
        gsap.to('.voucher-amount', {
            y: isMobile ? '-3px' : '-5px',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            onStart: () => console.log('Voucher amount floating animation started')
        });

        // Enhance website mockup with subtle animations
        if (!isMobile) {
            // Only on desktop - apply hover effect to website frame
            const websiteFrame = document.querySelector('.website-frame');

            if (websiteFrame) {
                websiteFrame.addEventListener('mouseenter', () => {
                    gsap.to(websiteFrame, {
                        scale: 1.03,
                        rotateY: '-5deg',
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                });

                websiteFrame.addEventListener('mouseleave', () => {
                    gsap.to(websiteFrame, {
                        scale: 1,
                        rotateY: '0deg',
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                });
            }
        }

        // Shine effect on CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-button');
        if (ctaButtons.length === 0) {
            console.warn('No CTA buttons found for hover effects');
        }

        ctaButtons.forEach((button) => {
            const buttonArrow = button.querySelector('.button-arrow');
            let hoverAnimation = null; // To store the GSAP animation instance

            button.addEventListener(isMobile ? 'touchstart' : 'mouseenter', () => {
                // Kill any existing animation on this button to prevent conflicts
                if (hoverAnimation) {
                    hoverAnimation.kill();
                }

                hoverAnimation = gsap.timeline();

                hoverAnimation.to(button, {
                    // Use a slightly different background color on hover, e.g., theme-accent-alt
                    // This should ideally be handled by CSS :hover for simplicity, but if JS is needed:
                    // backgroundColor: "var(--theme-accent-alt)", // Example, ensure this variable is defined
                    scale: 1.05, // Slight zoom effect
                    duration: 0.3,
                    ease: 'power2.out'
                });

                if (buttonArrow) {
                    hoverAnimation.to(buttonArrow, {
                        x: 5,
                        duration: 0.2,
                        ease: 'power2.out'
                    }, "-=0.2"); // Start slightly before button animation finishes
                }
            });

            button.addEventListener(isMobile ? 'touchend' : 'mouseleave', () => {
                // Kill any existing animation on this button
                if (hoverAnimation) {
                    hoverAnimation.kill();
                }

                hoverAnimation = gsap.timeline();

                hoverAnimation.to(button, {
                    // Revert to original background color
                    // backgroundColor: "var(--theme-accent)", // Example
                    scale: 1, // Revert zoom
                    duration: 0.3,
                    ease: 'power2.out'
                });

                if (buttonArrow) {
                    hoverAnimation.to(buttonArrow, {
                        x: 0,
                        duration: 0.2,
                        ease: 'power2.out'
                    }, "-=0.2");
                }
            });
        });

        // Mark as initialized
        animationsInitialized = true;
    } catch (error) {
        console.error('Error initializing animations:', error);

        // Apply failsafe visibility for critical elements if animations fail
        document.querySelectorAll('.text-reveal, .cta-button, .website-frame, .voucher-card').forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'none';
        });
    }
}

/**
 * Animate website mockup elements with staggered and sequenced animations
 * For enhanced mobile experience
 */
function animateMockWebsiteElements() {
    const isMobile = window.innerWidth <= 768;

    // Sequence for the mockup elements
    const mockupTl = gsap.timeline();

    // Header elements animation
    mockupTl.from('.mock-logo', {
        y: -10,
        opacity: 0,
        duration: 0.4,
        ease: 'back.out(1.7)'
    })
        .from('.mock-nav-item', {
            width: 0,
            opacity: 0,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.2')

        // Hero section animation
        .from('.mock-title', {
            width: 0,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out'
        }, '-=0.1')
        .from('.mock-subtitle', {
            width: 0,
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        }, '-=0.2')
        .from('.mock-button', {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        }, '-=0.1')
        .from('.mock-hero-image', {
            height: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out'
        }, '-=0.3')

        // Features animation
        .from('.mock-feature', {
            y: 15,
            opacity: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'back.out(1.7)'
        }, '-=0.3');

    // On mobile, add the floating animation to the entire frame
    if (isMobile) {
        gsap.to('.website-frame', {
            y: '-8px',
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

/**
 * Mouse movement effect for 3D elements
 */
function initMouseMovement() {
    const landingWrapper = document.querySelector('.landing-wrapper');

    if (!landingWrapper) return;

    // For website frame 3D effect
    const websiteFrame = document.querySelector('.website-frame');
    const websiteContent = document.querySelector('.website-content');

    // Track mouse position for smoother transitions
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    // Increase sensitivity
    const sensitivity = {
        rotate: 7,     // Higher for more rotation
        translate: 8,  // Higher for more movement
        parallax: 15   // Higher for more parallax depth
    };

    // Watch for mouse movement over the entire wrapper
    if (websiteContent) {
        // Add a slight hover effect even before mousemove
        websiteContent.addEventListener('mouseenter', () => {
            if (websiteFrame) {
                gsap.to(websiteFrame, {
                    rotateY: -2,
                    rotateX: -2,
                    scale: 1.02,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });

        websiteContent.addEventListener('mouseleave', () => {
            if (websiteFrame) {
                gsap.to(websiteFrame, {
                    rotateY: 0,
                    rotateX: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: 'power2.out'
                });

                // Reset parallax elements
                gsap.to('.mock-hero-image', {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });

                gsap.to('.mock-feature-icon', {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });
    }

    landingWrapper.addEventListener('mousemove', (e) => {
        // Calculate mouse position relative to center of screen
        const xPos = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
        const yPos = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1

        // Set target positions with increased sensitivity
        targetX = xPos;
        targetY = yPos;

        // Subtle parallax effect for shapes (reduced for compact layout)
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const factor = 0.015 * (index + 1); // Even smaller for better performance
            gsap.to(shape, {
                x: `+=${xPos * 10 * factor}`,
                y: `+=${yPos * 10 * factor}`,
                duration: 1,
                ease: 'power1.out'
            });
        });

        // Enhanced 3D effect for website frame with better depth perception
        if (websiteFrame) {
            gsap.to(websiteFrame, {
                rotateY: xPos * sensitivity.rotate, // Increase rotation for more dramatic effect
                rotateX: -yPos * sensitivity.rotate,
                transformOrigin: 'center center',
                duration: 0.3, // Faster for smoother tracking
                ease: 'power1.out',
                overwrite: 'auto' // Prevent animation queue buildup
            });

            // Add layered parallax effect to elements inside the frame
            gsap.to('.mock-hero-image', {
                x: xPos * sensitivity.parallax,
                y: yPos * sensitivity.parallax,
                duration: 0.3,
                ease: 'power1.out',
                overwrite: 'auto'
            });

            gsap.to('.mock-feature-icon', {
                x: xPos * sensitivity.parallax * 0.7,
                y: yPos * sensitivity.parallax * 0.7,
                stagger: 0.05, // Slightly staggered for more depth feel
                duration: 0.3,
                ease: 'power1.out',
                overwrite: 'auto'
            });

            // Add subtle movement to other elements for extra depth
            gsap.to('.mock-logo', {
                x: xPos * 3,
                y: yPos * 3,
                duration: 0.3,
                ease: 'power1.out',
                overwrite: 'auto'
            });
        }
    });

    // Optional: Add requestAnimationFrame for ultra-smooth animation
    // This creates smoother transitions between mouse positions
    function animate() {
        // Only apply if the difference is significant
        const diffX = targetX - mouseX;
        const diffY = targetY - mouseY;

        if (Math.abs(diffX) > 0.001 || Math.abs(diffY) > 0.001) {
            mouseX += diffX * 0.05; // Easing factor - lower = smoother
            mouseY += diffY * 0.05;

            if (websiteFrame) {
                // Apply super smooth transforms for high-end devices
                websiteFrame.style.transform = `
                    perspective(1000px) 
                    rotateY(${mouseX * sensitivity.rotate}deg) 
                    rotateX(${-mouseY * sensitivity.rotate}deg)
                    translateZ(10px)
                    scale(1.02)
                `;
            }
        }

        requestAnimationFrame(animate);
    }

    // Only use RAF for high-end devices
    if (window.innerWidth > 1200 && !('ontouchstart' in window)) {
        animate();
    }
}

/**
 * Initialize device motion tracking for mobile devices
 */
function initDeviceMotion() {
    const websiteFrame = document.querySelector('.website-frame');
    if (!websiteFrame) return;

    // Variables to store initial/neutral device position
    let initialBeta = null;
    let initialGamma = null;

    // Touch tracking variables
    let touchStartX = 0;
    let touchStartY = 0;
    let isTracking = false;

    // Sensitivity configuration for tilt effect
    const sensitivity = {
        rotate: 0.5,    // Lower for mobile to avoid extreme angles
        parallax: 8,    // Parallax movement amount
        touch: 0.15     // Touch sensitivity factor
    };

    // Max tilt angles (degrees)
    const maxTilt = 15;

    // Function to handle device orientation data
    function handleOrientation(event) {
        // Only use orientation detection for Android devices
        // iOS will use touch tracking instead
        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
            return;
        }

        // Get beta (x-axis) and gamma (y-axis) angles in degrees
        const beta = event.beta;  // -180 to 180 (front/back tilt)
        const gamma = event.gamma; // -90 to 90 (left/right tilt)

        // Set initial position on first reading
        if (initialBeta === null || initialGamma === null) {
            initialBeta = beta;
            initialGamma = gamma;
            return;
        }

        // Calculate relative tilt from initial position
        let relativeBeta = (beta - initialBeta) * sensitivity.rotate;
        let relativeGamma = (gamma - initialGamma) * sensitivity.rotate;

        // Limit tilt range
        relativeBeta = Math.max(Math.min(relativeBeta, maxTilt), -maxTilt);
        relativeGamma = Math.max(Math.min(relativeGamma, maxTilt), -maxTilt);

        // Apply transformations through applyFrameEffects function
        applyFrameEffects(-relativeBeta, relativeGamma);
    }

    // Touch event handlers for iOS devices
    function handleTouchStart(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isTracking = true;
    }

    function handleTouchMove(e) {
        if (!isTracking) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Calculate tilt based on touch movement
        // Map touch movement to tilt angles based on screen dimensions
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const tiltY = (deltaX / screenWidth) * maxTilt * 2 * sensitivity.touch;
        const tiltX = (deltaY / screenHeight) * maxTilt * 2 * sensitivity.touch;

        // Apply transformations
        applyFrameEffects(tiltX, tiltY);
    }

    function handleTouchEnd() {
        if (!isTracking) return;

        // Reset the frame position smoothly
        gsap.to(websiteFrame, {
            rotateX: 0,
            rotateY: 0,
            transformOrigin: 'center center',
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
        });

        // Reset inner elements
        gsap.to(['.mock-hero-image', '.mock-feature-icon', '.mock-logo'], {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto'
        });

        isTracking = false;
    }

    // Apply frame effects (shared between touch and orientation)
    function applyFrameEffects(tiltX, tiltY) {
        // Apply tilt to website frame
        gsap.to(websiteFrame, {
            rotateX: tiltX,
            rotateY: tiltY,
            transformOrigin: 'center center',
            duration: 0.3,
            ease: 'power1.out',
            overwrite: 'auto'
        });

        // Calculate parallax factors
        const betaFactor = tiltX / maxTilt; // -1 to 1
        const gammaFactor = tiltY / maxTilt; // -1 to 1

        // Apply to hero image
        gsap.to('.mock-hero-image', {
            x: gammaFactor * sensitivity.parallax,
            y: betaFactor * sensitivity.parallax,
            duration: 0.3,
            ease: 'power1.out',
            overwrite: 'auto'
        });

        // Apply to feature icons with staggered effect
        gsap.to('.mock-feature-icon', {
            x: gammaFactor * sensitivity.parallax * 0.7,
            y: betaFactor * sensitivity.parallax * 0.7,
            stagger: 0.05,
            duration: 0.3,
            ease: 'power1.out',
            overwrite: 'auto'
        });

        // Apply to other elements
        gsap.to('.mock-logo', {
            x: gammaFactor * 3,
            y: betaFactor * 3,
            duration: 0.3,
            ease: 'power1.out',
            overwrite: 'auto'
        });
    }

    // Function to request device motion/orientation permission on iOS 13+
    function requestPermission() {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission request
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        // For iOS, we prefer touch tracking
                        if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                            initTouchTracking();
                        } else {
                            window.addEventListener('deviceorientation', handleOrientation);
                        }
                    } else {
                        console.log('Device orientation permission denied');
                    }
                })
                .catch(console.error);
        } else {
            // Non iOS 13+ devices don't need permission
            if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                // Use touch tracking for all iOS devices
                initTouchTracking();
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
            }
        }
    }

    // Initialize touch tracking for iOS
    function initTouchTracking() {
        // Add touch event listeners to the frame
        const frame = document.querySelector('.website-frame');
        if (frame) {
            frame.addEventListener('touchstart', handleTouchStart, { passive: true });
            frame.addEventListener('touchmove', handleTouchMove, { passive: true });
            frame.addEventListener('touchend', handleTouchEnd);

            // Make it visually clear the element is interactive
            frame.style.cursor = 'grab';

            // Add instructions if needed
            const frameContent = document.querySelector('.frame-content');
            if (frameContent && !document.querySelector('.touch-hint')) {
                const touchHint = document.createElement('div');
                touchHint.className = 'touch-hint';
                touchHint.textContent = 'Торкніться для 3D ефекту';
                touchHint.style.position = 'absolute';
                touchHint.style.bottom = '10px';
                touchHint.style.left = '50%';
                touchHint.style.transform = 'translateX(-50%)';
                touchHint.style.fontSize = '10px';
                touchHint.style.color = 'rgba(0,0,0,0.5)';
                touchHint.style.padding = '4px 8px';
                touchHint.style.borderRadius = '12px';
                touchHint.style.background = 'rgba(255,255,255,0.7)';
                touchHint.style.pointerEvents = 'none';
                touchHint.style.opacity = '0.8';
                touchHint.style.zIndex = '10';
                frameContent.appendChild(touchHint);

                // Hide hint after 3 seconds
                setTimeout(() => {
                    touchHint.style.opacity = '0';
                    setTimeout(() => touchHint.remove(), 500);
                }, 3000);
            }
        }

        // Also add tracking to the whole window to ensure tracking continues if finger moves outside frame
        window.addEventListener('touchend', handleTouchEnd);
    }

    // Function to handle device motion for Android/older devices
    function handleMotion(event) {
        // Only use motion events if orientation isn't working
        if (initialBeta !== null && initialGamma !== null) return;

        // Get acceleration data
        const accelerationX = event.accelerationIncludingGravity.x;
        const accelerationY = event.accelerationIncludingGravity.y;

        // Some Android devices might use different coordinate systems
        // We'll use acceleration data as a fallback if orientation isn't working
        if (initialBeta === null || initialGamma === null) {
            // Just set some defaults as we don't have orientation data
            const tiltX = accelerationY * sensitivity.rotate;
            const tiltY = accelerationX * sensitivity.rotate;

            // Limit tilt range
            const limitedTiltX = Math.max(Math.min(tiltX, maxTilt), -maxTilt);
            const limitedTiltY = Math.max(Math.min(tiltY, maxTilt), -maxTilt);

            // Apply transformations
            applyFrameEffects(-limitedTiltX, limitedTiltY);
        }
    }

    // Create a button to request permission on iOS (required by Apple)
    const createPermissionButton = () => {
        // Check if permission button already exists
        if (document.getElementById('motion-permission-btn')) return;

        const permissionBtn = document.createElement('button');
        permissionBtn.id = 'motion-permission-btn';
        permissionBtn.className = 'motion-permission-btn';
        permissionBtn.innerText = /iPhone|iPad|iPod/.test(navigator.userAgent) ?
            'Увімкнути 3D ефект' : 'Enable 3D Tilt Effect';

        permissionBtn.style.position = 'fixed';
        permissionBtn.style.bottom = '20px';
        permissionBtn.style.left = '50%';
        permissionBtn.style.transform = 'translateX(-50%)';
        permissionBtn.style.padding = '10px 20px';
        permissionBtn.style.backgroundColor = 'var(--theme-accent, #ff6500)';
        permissionBtn.style.color = 'white';
        permissionBtn.style.border = 'none';
        permissionBtn.style.borderRadius = '30px';
        permissionBtn.style.fontWeight = 'bold';
        permissionBtn.style.zIndex = '9999';

        permissionBtn.addEventListener('click', () => {
            requestPermission();
            permissionBtn.style.display = 'none';
        });

        document.body.appendChild(permissionBtn);
    };

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isMobile = window.innerWidth <= 768; // Ensure isMobile is defined or accessible here

    if (!isMobile && iOS && typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ requires permission button
        createPermissionButton();
    } else if (!isMobile) { // Also ensure other conditions for showing buttons are not on mobile
        // For Android and older iOS
        if (iOS) {
            // For all iOS devices - use touch tracking
            initTouchTracking();
        } else if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation);
        } else if (window.DeviceMotionEvent) {
            // Fallback to device motion for some Android devices
            window.addEventListener('devicemotion', handleMotion);
        }
    } else if (isMobile && iOS) { // If mobile and iOS, still init touch tracking without permission button
        initTouchTracking();
    }

    // Add reset button to recalibrate the neutral position
    const createResetButton = () => {
        // Check if reset button already exists
        if (document.getElementById('motion-reset-btn')) return;

        const resetBtn = document.createElement('button');
        resetBtn.id = 'motion-reset-btn';
        resetBtn.className = 'motion-reset-btn';
        resetBtn.innerText = 'Reset Position';

        resetBtn.style.position = 'fixed';
        resetBtn.style.top = '20px';
        resetBtn.style.right = '20px';
        resetBtn.style.padding = '8px 15px';
        resetBtn.style.backgroundColor = 'rgba(0,0,0,0.2)';
        resetBtn.style.color = 'white';
        resetBtn.style.border = 'none';
        resetBtn.style.borderRadius = '20px';
        resetBtn.style.fontSize = '12px';
        resetBtn.style.zIndex = '9999';

        resetBtn.addEventListener('click', () => {
            // Reset the neutral position values
            initialBeta = null;
            initialGamma = null;

            // Reset all transforms
            gsap.to(websiteFrame, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power2.out'
            });

            // Remove mock-button from the reset animation to prevent blinking
            gsap.to(['.mock-hero-image', '.mock-feature-icon', '.mock-logo'], {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });

        document.body.appendChild(resetBtn);
    };

    // Add reset button if device has orientation support AND is not mobile
    if (!isMobile && (window.DeviceOrientationEvent || window.DeviceMotionEvent)) {
        createResetButton();
    }
}

/**
 * Initialize form handling and validation
 */
function initFormHandling() {
    const voucherForm = document.getElementById('voucherForm');
    const formStatus = document.getElementById('formStatus');

    if (!voucherForm || !formStatus) return;

    // Add touch events for mobile input focus
    const inputField = document.getElementById('contact_handle');
    if (inputField) {
        inputField.addEventListener('focus', () => {
            // Mobile scroll fix for iOS keyboard
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 300);
        });
    }

    // Function for telegram/instagram handle or email validation
    const isValidContactHandle = (handle) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telegramRegex = /^@\w{5,32}$/;
        const instagramRegex = /^@[a-zA-Z0-9._]{1,30}$/;

        return emailRegex.test(handle) || telegramRegex.test(handle) || instagramRegex.test(handle);
    };

    voucherForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Get input value
        const contactHandleInput = document.getElementById('contact_handle');
        const contactHandle = contactHandleInput.value.trim();

        // Validate the input
        if (!contactHandle) {
            showFormStatus('Будь ласка, введіть ваш контакт', 'error');
            contactHandleInput.focus();
            return;
        }

        if (!isValidContactHandle(contactHandle)) {
            showFormStatus('Введіть коректний email або @username', 'error');
            contactHandleInput.focus();
            return;
        }

        // Get CSRF token
        const csrfToken = voucherForm.querySelector('input[name="csrfmiddlewaretoken"]').value;

        // Show loading state
        const submitButton = voucherForm.querySelector('.submit-button');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span>Відправляємо...</span>';
        showFormStatus('Відправка...', '');

        // Prepare form data for submission
        const formData = {
            contact_handle: contactHandle,
            form_type: 'promin_voucher', // Add form type to differentiate between forms
            message: 'Запит на voucher $100 з лендінгу PROmin'
        };

        // Send data to server
        fetch('/contact/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(formData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Handle response
                if (data.success) {
                    showFormStatus('Voucher відправлено! Очікуйте на повідомлення.', 'success');
                    voucherForm.reset();

                    // Animate success (reduced animation for compact layout)
                    gsap.to('.voucher-card', {
                        y: -3,
                        duration: 0.15,
                        repeat: 1,
                        yoyo: true,
                        ease: 'power2.inOut'
                    });
                } else {
                    showFormStatus(data.message || 'Виникла помилка. Спробуйте пізніше.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showFormStatus('Помилка при відправці. Спробуйте пізніше.', 'error');
            })
            .finally(() => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = '<span>Отримати</span><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

                // Hide success message after a few seconds
                if (formStatus.classList.contains('success')) {
                    setTimeout(() => {
                        gsap.to(formStatus, {
                            opacity: 0,
                            height: 0,
                            duration: 0.3,
                            ease: 'power2.out'
                        });
                    }, 2000); // Shorter timeout for mobile
                }
            });
    });

    // Input validation on focus out
    const contactHandleInput = document.getElementById('contact_handle');
    if (contactHandleInput) {
        contactHandleInput.addEventListener('blur', () => {
            const value = contactHandleInput.value.trim();
            if (value && !isValidContactHandle(value)) {
                gsap.to(contactHandleInput, {
                    x: 3, // Less movement for mobile
                    duration: 0.1,
                    repeat: 2,
                    yoyo: true,
                    ease: 'power1.inOut'
                });
            }
        });
    }

    // Function to show form status messages
    function showFormStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = 'form-status visible';

        if (type) {
            formStatus.classList.add(type);
        }

        gsap.to(formStatus, {
            opacity: 1,
            height: 'auto',
            duration: 0.3,
            ease: 'power2.out'
        });
    }
}

// Add intersection observer to enhance animations based on visibility
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// All animations now happen at page load since we're fitting everything on one screen
// No need to observe elements separately 