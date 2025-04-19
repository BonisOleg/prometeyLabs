/**
 * JavaScript for Builder Page
 * Handles interactive calculations and UI updates
 */

document.addEventListener('DOMContentLoaded', () => {
    const builderForm = document.getElementById('builderForm');
    const pageCountSlider = document.getElementById('pageCountSlider');
    const pageCountValue = document.getElementById('pageCountValue');
    const packageResult = document.getElementById('packageResult');
    const pagesResult = document.getElementById('pagesResult');
    const termResult = document.getElementById('termResult');
    const priceResult = document.getElementById('priceResult');
    const discountHint = document.getElementById('discountHint');
    const browserContent = document.getElementById('browserContent');
    const submitButton = document.getElementById('submitRequest');
    const successMessage = document.getElementById('successMessage');

    // Base prices and factors (can be adjusted)
    const pagePriceFactor = 50; // Price per additional page (approx)
    const baseTerms = { // Base terms in days
        landing: 7,
        corporate: 14,
        store: 21,
        webapp: 30
    };
    const termPageFactor = 0.5; // Days per additional page
    const moduleTermFactor = 2; // Days per module

    const updateTextWithAnimation = (element, newText) => {
        if (element.textContent !== newText) {
            element.style.opacity = '0';
            setTimeout(() => {
                element.textContent = newText;
                element.style.opacity = '1';
            }, 150); // Match half of the transition duration
        }
    };

    const updatePriceWithAnimation = (element, newPrice) => {
        const currentPrice = element.textContent.match(/\d+/);
        const targetPrice = newPrice.match(/\d+/)[0];

        if (!currentPrice) {
            element.textContent = newPrice;
            return;
        }

        const startValue = parseInt(currentPrice[0]);
        const endValue = parseInt(targetPrice);
        const duration = 500; // ms
        const stepTime = 20; // ms
        const steps = duration / stepTime;
        const stepValue = (endValue - startValue) / steps;

        let currentStep = 0;
        let currentValue = startValue;

        element.classList.add('updating');

        const interval = setInterval(() => {
            currentStep++;
            currentValue += stepValue;

            if (currentStep >= steps) {
                clearInterval(interval);
                currentValue = endValue;
                element.textContent = newPrice;
                element.classList.remove('updating');
            } else {
                element.textContent = `від ${Math.round(currentValue)} $`;
            }
        }, stepTime);
    };

    const calculateResults = (event = null) => {
        let basePrice = 0;
        let term = 0;
        let complexityScore = 0;
        let pageCount = parseInt(pageCountSlider.value);

        // Identify the element that triggered the change, if any
        const changedElement = event?.target;

        // List of module values that should NOT trigger a visual update
        const nonVisualModules = [
            'blog',
            'portfolio',
            'calculator',
            'booking',
            'multilingual',
            'forms_email',
            'forms_telegram',
            'theme_switcher',
            'payment_card',
            'payment_apple',
            'ai_support',
            'integrations'
        ];

        // 1. Calculate base price from site type
        const siteTypeElement = builderForm.querySelector('input[name="siteType"]:checked');
        if (siteTypeElement) {
            basePrice += parseInt(siteTypeElement.dataset.price);
            complexityScore += Object.keys(baseTerms).indexOf(siteTypeElement.value) + 1;
            term += baseTerms[siteTypeElement.value];
        }

        // 2. Add price and term for modules
        const selectedModules = builderForm.querySelectorAll('input[name="modules"]:checked');
        selectedModules.forEach(module => {
            basePrice += parseInt(module.dataset.price || 0);
            complexityScore += 1;
            term += parseInt(module.dataset.term || 1);
        });

        // 3. Add price for design
        const designElement = builderForm.querySelector('input[name="design"]:checked');
        if (designElement && designElement.value === 'unique') {
            basePrice += parseInt(designElement.dataset.price);
            complexityScore += 2;
            term += parseInt(designElement.dataset.term || 5);
        }

        // 4. Adjust price and term based on page count
        if (pageCount > 5) {
            basePrice += (pageCount - 5) * pagePriceFactor;
        }
        term += Math.max(0, pageCount - 5) * termPageFactor;
        term = Math.ceil(term); // Round up days

        // Determine Package based on complexity score
        let packageName = 'Econom';
        if (complexityScore >= 10 || basePrice > 2500) {
            packageName = 'Pro';
        } else if (complexityScore >= 6 || basePrice > 1500) {
            packageName = 'Plus';
        } else if (complexityScore >= 3 || basePrice > 800) {
            packageName = 'Standard';
        }

        // Update UI Elements (Price, Term, Package, Hint) - These always update
        updateTextWithAnimation(packageResult, packageName);
        updateTextWithAnimation(pagesResult, pageCount === 1 ? '1 сторінка' : `до ${pageCount} сторінок`);
        updateTextWithAnimation(termResult, `від ${term} днів`);
        updatePriceWithAnimation(priceResult, `від ${basePrice} $`);
        discountHint.classList.toggle('visible', packageName === 'Plus' || packageName === 'Pro');

        // Determine if a visual update is needed
        let needsVisualUpdate = true;
        // If the change event was triggered AND the element was one of the non-visual modules
        if (changedElement && changedElement.name === 'modules' && nonVisualModules.includes(changedElement.value)) {
            needsVisualUpdate = false;
        }

        // Update Browser Window Simulation ONLY if needed
        if (needsVisualUpdate) {
            updateBrowserSimulation({
                siteType: siteTypeElement?.value,
                designType: designElement?.value,
                pages: pageCount,
                // Pass all selected modules, the simulation function decides what to show visually
                selectedModules: Array.from(selectedModules).map(m => m.value)
            });
        }
    };

    // Enhanced Browser Simulation Logic with ultra-realism
    const updateBrowserSimulation = (options) => {
        const { siteType, designType, pages, selectedModules = [] } = options;

        // Get the browser window elements
        const browserWindow = document.querySelector('.browser-window');
        const urlBar = document.querySelector('.browser-window__url');
        const contentContainer = document.querySelector('.sim-content');

        // Update URL based on site type with more realistic domains
        let url = "https://";

        // Generate realistic domains based on site and design type
        switch (siteType) {
            case 'landing':
                url += designType === 'unique' ? "premier-landing.site" : "landing-template.site";
                break;
            case 'corporate':
                url += designType === 'unique' ? "nexuscorp.com" : "business-template.com";
                break;
            case 'store':
                url += designType === 'unique' ? "luxemarket.store" : "ecommerce-template.store";
                break;
            case 'webapp':
                url += designType === 'unique' ? "cloudapp.io" : "apptemplate.io";
                break;
            default:
                url += "mywebsite.com";
        }

        // Add path based on context
        if (selectedModules.includes('blog') && siteType !== 'webapp') {
            url += "/blog";
        } else if (selectedModules.includes('portfolio') && siteType !== 'webapp') {
            url += "/portfolio";
        } else {
            url += "/";
        }

        // Update URL in browser with typing animation effect
        urlBar.textContent = "";
        browserWindow.classList.add('loading-url');

        // Simulate typing in URL bar
        let currentCharIndex = 0;
        const urlTyping = setInterval(() => {
            if (currentCharIndex < url.length) {
                urlBar.textContent += url[currentCharIndex];
                currentCharIndex++;
            } else {
                clearInterval(urlTyping);
                browserWindow.classList.remove('loading-url');

                // Start page loading after URL is typed
                loadBrowserContent();
            }
        }, 20);

        // Function to load content with loading animation
        function loadBrowserContent() {
            // Add loading state to browser
            browserWindow.classList.add('loading-site');
            contentContainer.classList.remove('sim-content-loaded');
            contentContainer.style.opacity = '0';

            // Simulate realistic loading delay (longer for more complex sites)
            const complexity = siteType === 'webapp' ? 4 :
                siteType === 'store' ? 3 :
                    siteType === 'corporate' ? 2 : 1;
            const moduleComplexity = selectedModules.length * 0.5;
            const loadTime = 400 + (complexity * 100) + (moduleComplexity * 100) + (designType === 'unique' ? 200 : 0);

            // Simulate loading delay for realism
            setTimeout(() => {
                // Clear previous content
                contentContainer.innerHTML = '';

                // Remove previous site type classes
                browserWindow.className = 'browser-window';
                browserWindow.classList.add(`site-type--${siteType}`);

                // Add design type class
                if (designType === 'unique') {
                    browserWindow.classList.add('design-type--unique');
                }

                // Generate content based on site type
                let content = '';
                const customClass = designType === 'unique' ? 'custom-design' : '';

                // Generate header
                content += generateHeader(siteType, designType, pages, customClass);

                // Generate main content based on site type
                switch (siteType) {
                    case 'landing':
                        content += generateHero(siteType, customClass);
                        content += generateFeatures(siteType, customClass, 3); // Landing features
                        content += generateSection('sim-cta-section', '<div class="sim-cta-content"></div><div class="sim-cta-button"></div>', customClass); // Simple CTA
                        break;
                    case 'corporate':
                        content += generateHero(siteType, customClass);
                        content += generateSection('sim-about-section', '<div class="sim-about-text"></div><div class="sim-about-image"></div>', customClass); // About Us
                        content += generateFeatures(siteType, customClass, 4); // Corporate services/features
                        content += generateTeam(customClass);
                        content += generateSection('sim-cta-section', '<div class="sim-cta-content"></div><div class="sim-cta-button"></div>', customClass); // Corporate CTA
                        break;
                    case 'store':
                        content += generateHero(siteType, customClass); // E.g., Promotional banner
                        content += generateProductGrid(customClass, 8); // 8 products
                        break;
                    case 'webapp':
                        content += generateWebAppInterface(customClass);
                        break;
                }

                // Generate modules section based on selected modules
                if (selectedModules && selectedModules.length > 0) {
                    content += '<div class="sim-modules-container">';
                    selectedModules.forEach(module => {
                        if (module === 'blog') content += generateBlogModule(customClass);
                        else if (module === 'portfolio') content += generatePortfolioModule(customClass);
                        else if (module === 'calculator') content += generateCalculatorModule(customClass);
                        else if (module === 'booking') content += generateBookingModule(customClass);
                    });
                    content += '</div>';
                }

                // Generate interactive modules simulation (limit to 2 as before)
                createInteractiveModulesElement(selectedModules); // We'll append this *after* setting innerHTML

                // Generate footer
                content += generateFooter(siteType, customClass, pages);

                // Update content
                contentContainer.innerHTML = content;

                // Append interactive modules container *after* main content is set
                const interactiveModulesContainer = createInteractiveModulesElement(selectedModules);
                if (interactiveModulesContainer) {
                    contentContainer.appendChild(interactiveModulesContainer);
                }

                // Remove loading state
                browserWindow.classList.remove('loading-site');

                // Fade in content with slight delay for realism
                setTimeout(() => {
                    contentContainer.classList.add('sim-content-loaded');
                    contentContainer.style.opacity = '1';

                    // Initialize interactions for specific modules if present
                    if (selectedModules.includes('calculator')) {
                        initCalculatorInteraction();
                    }

                    if (selectedModules.includes('booking')) {
                        initBookingInteraction();
                    }
                }, 100);

            }, loadTime); // Loading delay in ms

            // After content is loaded, add this:
            setTimeout(() => {
                simulateScrolling(contentContainer);
            }, loadTime + 1000); // Start scrolling 1 second after content is loaded
        }
    };

    // Generic section generator
    function generateSection(sectionClass, innerHTML, customClass = '') {
        return `<div class="${sectionClass} ${customClass}">${innerHTML}</div>`;
    }

    // Generate header based on site type
    function generateHeader(siteType, designType, pages, customClass) {
        let navItems = '';
        const itemCount = Math.min(pages, 5); // Max 5 visible nav items
        const navLabels = ['Home', 'About', 'Services', 'Products', 'Contact']; // Example labels

        for (let i = 0; i < itemCount; i++) {
            navItems += `<div class="sim-nav-item" title="${navLabels[i]}"></div>`;
        }

        let headerControls = '';
        if (siteType === 'store') {
            headerControls = `<div class="sim-header-control sim-search-icon"></div><div class="sim-header-control sim-cart-icon"></div>`;
        } else if (siteType === 'webapp') {
            headerControls = `<div class="sim-header-control sim-user-profile"></div>`;
        } else {
            headerControls = `<div class="sim-header-control sim-cta-button-small"></div>`;
        }

        return `
            <header class="sim-header ${customClass}">
                <div class="sim-logo ${designType === 'unique' ? 'logo-unique' : ''}"></div>
                <nav class="sim-nav">${navItems}</nav>
                <div class="sim-header-controls">${headerControls}</div>
            </header>`;
    }

    // Helper functions for generating content sections
    function generateHero(siteType, customClass) {
        const isUnique = customClass.includes('custom');
        let heroContent = '';

        switch (siteType) {
            case 'landing':
                heroContent = `
                    <div class="sim-hero-content centered ${isUnique ? 'content-unique' : ''}">
                        <div class="sim-hero-title large"></div>
                        <div class="sim-hero-subtitle medium"></div>
                        <div class="sim-hero-cta large"></div>
                    </div>`; // No image for landing to focus on CTA
                break;
            case 'corporate':
                heroContent = `
                    <div class="sim-hero-content ${isUnique ? 'content-unique' : ''}">
                        <div class="sim-hero-title medium"></div>
                        <div class="sim-hero-subtitle small"></div>
                        <div class="sim-hero-cta medium"></div>
                    </div>
                    <div class="sim-hero-image ${isUnique ? 'image-unique' : ''}"></div>`;
                break;
            case 'store':
                heroContent = `
                    <div class="sim-hero-content banner ${isUnique ? 'content-unique' : ''}">
                        <div class="sim-hero-title medium"></div>
                         <div class="sim-hero-cta medium"></div>
                    </div>`; // Banner-like hero for store
                break;
            case 'webapp': // Webapp might not have a traditional hero
                return ''; // Or a simple welcome message section instead
            default:
                heroContent = `<div class="sim-hero-content"><div class="sim-hero-title"></div></div>`;
        }

        return `<div class="sim-hero ${siteType}-hero ${customClass}">${heroContent}</div>`;
    }

    function generateFeatures(siteType, customClass, count) {
        let featuresHtml = '';
        const cardClass = siteType === 'corporate' ? 'feature-detailed' : 'feature-simple';

        for (let i = 0; i < count; i++) {
            featuresHtml += `
            <div class="sim-feature-card ${cardClass} ${customClass}" style="--animation-order: ${i + 1}">
                <div class="sim-feature-icon"></div>
                <div class="sim-feature-content">
                     <div class="sim-feature-title"></div>
                     <div class="sim-feature-text"></div>
                     ${siteType === 'corporate' ? '<div class="sim-feature-link"></div>' : ''}
                </div>
            </div>`;
        }

        return `
        <div class="sim-features ${siteType}-features">
            <div class="sim-section-title"></div>
            <div class="sim-features-grid cols-${count}">
                ${featuresHtml}
            </div>
        </div>`;
    }

    function generateTeam(customClass) { // Mostly for corporate
        let teamHtml = '';
        for (let i = 0; i < 4; i++) { // Keep 4 for corporate
            teamHtml += `
            <div class="sim-team-member ${customClass}" style="--animation-order: ${i + 1}">
                <div class="sim-team-photo"></div>
                <div class="sim-team-name"></div>
                <div class="sim-team-position"></div>
            </div>`;
        }
        return `
        <div class="sim-team">
            <div class="sim-section-title"></div>
            <div class="sim-team-grid">${teamHtml}</div>
        </div>`;
    }

    function generateProductGrid(customClass, count) {
        let productsHtml = '';
        for (let i = 0; i < count; i++) {
            productsHtml += `
            <div class="sim-product-item ${customClass}" style="--animation-order: ${i + 1}">
                <div class="sim-product-image"></div>
                <div class="sim-product-info">
                    <div class="sim-product-title"></div>
                    <div class="sim-product-price"></div>
                 </div>
                 <div class="sim-product-button"></div>
            </div>`;
        }
        return `
        <div class="sim-store-section">
             <div class="sim-store-header">
                 <div class="sim-section-title"></div>
                 <div class="sim-product-filters"></div>
             </div>
            <div class="sim-products-grid">${productsHtml}</div>
            <div class="sim-pagination"></div>
        </div>`;
    }

    function generateWebAppInterface(customClass) {
        let sidebarItems = '';
        const itemLabels = ['Dashboard', 'Analytics', 'Users', 'Settings'];
        for (let i = 0; i < 4; i++) {
            sidebarItems += `<div class="sim-sidebar-item ${i === 0 ? 'active' : ''}" title="${itemLabels[i]}"></div>`;
        }

        return `
         <div class="sim-webapp-layout ${customClass}">
             <div class="sim-sidebar">
                 <div class="sim-sidebar-logo"></div>
                 <nav class="sim-sidebar-nav">${sidebarItems}</nav>
                 <div class="sim-sidebar-footer"></div>
             </div>
             <div class="sim-webapp-main">
                 <header class="sim-webapp-header">
                     <div class="sim-webapp-search"></div>
                     <div class="sim-webapp-actions">
                         <div class="sim-action-item sim-notification-icon"></div>
                         <div class="sim-action-item sim-user-profile-small"></div>
                      </div>
                 </header>
                 <div class="sim-webapp-content">
                     <div class="sim-webapp-title-bar">
                         <div class="sim-webapp-title"></div>
                         <div class="sim-webapp-breadcrumbs"></div>
                     </div>
                     <div class="sim-dashboard-widgets">
                          <div class="sim-widget"></div>
                          <div class="sim-widget"></div>
                          <div class="sim-widget"></div>
                     </div>
                     <div class="sim-data-table">
                         <div class="sim-table-header"></div>
                         <div class="sim-table-row"></div>
                         <div class="sim-table-row"></div>
                         <div class="sim-table-row"></div>
                     </div>
                 </div>
             </div>
         </div>`;
    }

    // Update Footer generation
    function generateFooter(siteType, customClass, pages) {
        let footerContent = '';
        const isUnique = customClass.includes('custom');

        switch (siteType) {
            case 'landing':
                footerContent = `
                     <div class="sim-footer-simple">
                          <div class="sim-footer-logo small"></div>
                          <div class="sim-footer-copyright small"></div>
                          <div class="sim-social-icons small">${generateSocialIcons(3)}</div>
                     </div>`;
                break;
            case 'corporate':
            case 'store':
                const columns = siteType === 'store' ? 4 : 3;
                footerContent = `
                    <div class="sim-footer-columns">${generateFooterColumns(columns, pages)}</div>
                    <div class="sim-footer-bottom">
                         <div class="sim-footer-copyright"></div>
                         <div class="sim-social-icons">${generateSocialIcons(4)}</div>
                    </div>`;
                break;
            case 'webapp': // Webapp might have minimal/no footer
                return '';
            default:
                footerContent = `<div class="sim-footer-copyright"></div>`;
        }

        return `<footer class="sim-footer ${siteType}-footer ${customClass}">${footerContent}</footer>`;
    }

    // --- Sub-generators ---
    function generateSocialIcons(count) {
        let icons = '';
        for (let i = 0; i < count; i++) { icons += `<div class="sim-social-icon"></div>`; }
        return icons;
    }

    function generateFooterColumns(columnCount, pageCount) {
        let columnsHtml = '';
        const linkCountPerCol = Math.min(3, Math.max(1, Math.floor(pageCount / columnCount)));
        const colLabels = ['Company', 'Links', 'Resources', 'Contact'];

        for (let i = 0; i < columnCount; i++) {
            let linksHtml = '';
            for (let j = 0; j < linkCountPerCol; j++) { linksHtml += `<div class="sim-footer-link"></div>`; }
            columnsHtml += `
                 <div class="sim-footer-column">
                     <div class="sim-footer-heading">${colLabels[i] || 'Links'}</div>
                     ${linksHtml}
                 </div>`;
        }
        return columnsHtml;
    }

    // Updated createInteractiveModules to return element (to append later)
    function createInteractiveModulesElement(selectedModules) {
        if (!selectedModules || selectedModules.length === 0) return null;

        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'browser-interactive-modules';
        let moduleCount = 0;
        const maxModules = 2;

        if (selectedModules.includes('animation') && moduleCount < maxModules) {
            const animationDemo = document.createElement('div');
            animationDemo.className = 'module-animation';
            animationDemo.innerHTML = `
                <div class="animation-element animation-bounce"></div>
                <div class="animation-element animation-fade"></div>
                <div class="animation-element animation-slide"></div>
            `;
            interactiveContainer.appendChild(animationDemo);
            moduleCount++;
        }

        if (selectedModules.includes('forms') && moduleCount < maxModules) {
            const formDemo = document.createElement('div');
            formDemo.className = 'module-form';
            formDemo.innerHTML = `
                <div class="form-header">Contact Form</div>
                <div class="form-field"></div>
                <div class="form-button"></div>
            `;
            interactiveContainer.appendChild(formDemo);

            // Add simple interaction
            formDemo.addEventListener('click', function () {
                this.classList.toggle('form-active');
            });
            moduleCount++;
        }

        if (selectedModules.includes('gallery') && moduleCount < maxModules) {
            const galleryDemo = document.createElement('div');
            galleryDemo.className = 'module-gallery';
            galleryDemo.innerHTML = `
                <div class="gallery-item"></div>
                <div class="gallery-item"></div>
                <div class="gallery-item"></div>
                <div class="gallery-item"></div>
            `;
            interactiveContainer.appendChild(galleryDemo);

            // Add simple interaction
            const galleryItems = galleryDemo.querySelectorAll('.gallery-item');
            galleryItems.forEach(item => {
                item.addEventListener('mouseover', function () {
                    this.classList.add('gallery-item-active');
                });
                item.addEventListener('mouseout', function () {
                    this.classList.remove('gallery-item-active');
                });
            });
            moduleCount++;
        }

        if (selectedModules.includes('chat') && moduleCount < maxModules) {
            const chatDemo = document.createElement('div');
            chatDemo.className = 'module-chat';
            chatDemo.innerHTML = `
                <div class="chat-icon"></div>
                <div class="chat-popup">
                    <div class="chat-header">Live Chat</div>
                    <div class="chat-messages"></div>
                    <div class="chat-input"></div>
                </div>
            `;
            interactiveContainer.appendChild(chatDemo);

            // Add simple interaction
            const chatIcon = chatDemo.querySelector('.chat-icon');
            const chatPopup = chatDemo.querySelector('.chat-popup');
            chatIcon.addEventListener('click', function () {
                chatPopup.classList.toggle('chat-open');
            });
            moduleCount++;
        }

        return moduleCount > 0 ? interactiveContainer : null;
    }

    // Initialize calculator interaction
    function initCalculatorInteraction() {
        const calculator = document.querySelector('.sim-calculator');
        if (calculator) {
            calculator.addEventListener('click', function () {
                const results = this.querySelector('.sim-calculator-results');
                results.style.opacity = '0.6';
                setTimeout(() => {
                    results.style.opacity = '1';
                }, 300);
            });
        }
    }

    // Initialize booking interaction
    function initBookingInteraction() {
        const bookingButton = document.querySelector('.sim-booking-button');
        if (bookingButton) {
            bookingButton.addEventListener('click', function () {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }

    // Event Listeners
    if (builderForm) {
        // Pass the event object to calculateResults
        builderForm.addEventListener('change', calculateResults);
    }

    if (pageCountSlider && pageCountValue) {
        pageCountSlider.addEventListener('input', (event) => {
            pageCountValue.textContent = event.target.value;
            // No need to call calculateResults here, form change event handles it
        });
        // Trigger initial calculation based on default slider value
        pageCountSlider.addEventListener('change', calculateResults); // Ensure recalculation if value changed without input event
    }

    if (submitButton) {
        submitButton.addEventListener('click', () => {
            // Simulate request sending
            submitButton.disabled = true;
            submitButton.textContent = 'Надсилаємо...';

            // In a real application, you would collect data and send it via fetch/AJAX
            console.log("Запит надіслано з наступними опціями:");
            const formData = new FormData(builderForm);
            const selections = {};
            formData.forEach((value, key) => {
                if (selections[key]) {
                    if (Array.isArray(selections[key])) {
                        selections[key].push(value);
                    } else {
                        selections[key] = [selections[key], value];
                    }
                } else {
                    selections[key] = value;
                }
            });
            selections.pageCount = pageCountSlider.value; // Add slider value
            console.log(selections);
            console.log("Розрахований пакет:", packageResult.textContent);
            console.log("Орієнтовна ціна:", priceResult.textContent);

            // Simulate success after a short delay
            setTimeout(() => {
                submitButton.style.display = 'none'; // Hide button
                successMessage.classList.add('visible');

                // Optional: Reset form or redirect after a longer delay
                // setTimeout(() => {
                //    window.location.reload(); 
                // }, 5000);

            }, 1500); // Simulate network delay
        });
    }

    // Initial Calculation on page load (no event object needed here, will trigger visual update)
    calculateResults();
});

// Add this function to simulate smooth scrolling for a more realistic experience
function simulateScrolling(contentElement) {
    // Get the current scroll position
    let currentScrollPosition = 0;
    // Get the maximum scroll position
    const maxScroll = contentElement.scrollHeight - contentElement.clientHeight;

    // Random scrolling simulation
    const scrollInterval = setInterval(() => {
        // Skip if no more scrolling needed
        if (currentScrollPosition >= maxScroll) {
            clearInterval(scrollInterval);
            return;
        }

        // Random scroll amount between 25-75 pixels (reduced for smaller window)
        const scrollAmount = Math.floor(Math.random() * 50) + 25;
        // Calculate new position ensuring we don't exceed maxScroll
        currentScrollPosition = Math.min(currentScrollPosition + scrollAmount, maxScroll);

        // Smooth scroll to new position
        contentElement.scrollTo({
            top: currentScrollPosition,
            behavior: 'smooth'
        });

        // 30% chance to pause scrolling for a moment (simulating reading)
        if (Math.random() < 0.3) {
            clearInterval(scrollInterval);
            // Resume after 0.5-1.5 seconds (reduced for smaller window)
            setTimeout(() => {
                if (currentScrollPosition < maxScroll) {
                    simulateScrolling(contentElement);
                }
            }, Math.floor(Math.random() * 1000) + 500);
        }
    }, 1200); // Scroll every 1.2 seconds
}
