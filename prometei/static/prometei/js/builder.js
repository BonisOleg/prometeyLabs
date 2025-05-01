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
    const builderContainer = document.querySelector('.builder-container');
    const builderOptions = document.querySelector('.builder-options');
    const builderResults = document.querySelector('.builder-results');

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

    // Функція для обробки адаптивності
    const handleResponsiveLayout = () => {
        const windowWidth = window.innerWidth;
        // Якщо ширина вікна менша за 1024px
        if (windowWidth <= 1024) {
            // Застосовуємо мобільний макет
            document.body.classList.add('builder-mobile-view');

            // Видаляємо sticky позицію для результатів
            if (builderResults) {
                builderResults.style.position = 'static';
                builderResults.style.top = 'auto';
                builderResults.style.width = '100%';
                builderResults.style.maxWidth = '100%';
            }

            // Переконуємося, що контейнер має одноколонковий вигляд 
            if (builderContainer) {
                builderContainer.style.display = 'flex';
                builderContainer.style.flexDirection = 'column';
                builderContainer.style.gap = windowWidth <= 768 ? '1.5rem' : '2rem';
            }

            // Змінюємо відступи для опцій та результатів
            if (builderOptions && builderResults) {
                const padding = windowWidth <= 768 ? '1rem' : '1.5rem';
                builderOptions.style.padding = padding;
                builderResults.style.padding = padding;

                if (windowWidth <= 768) {
                    const fieldsets = document.querySelectorAll('.builder-fieldset');
                    fieldsets.forEach(fieldset => {
                        fieldset.style.padding = '1rem 1.2rem 1.2rem';
                    });

                    const legends = document.querySelectorAll('.builder-legend');
                    legends.forEach(legend => {
                        legend.style.fontSize = '1.1rem';
                        legend.style.marginBottom = '0.8rem';
                    });

                    const labels = document.querySelectorAll('.builder-radio-group label, .builder-checkbox-group label');
                    labels.forEach(label => {
                        label.style.marginBottom = '0.8rem';
                        label.style.lineHeight = '1.4';
                    });

                    const inputs = document.querySelectorAll('.builder-radio-group input[type="radio"], .builder-checkbox-group input[type="checkbox"]');
                    inputs.forEach(input => {
                        input.style.marginRight = '0.7rem';
                        input.style.verticalAlign = 'middle';
                    });
                }
            }
        } else {
            // Десктопний макет
            document.body.classList.remove('builder-mobile-view');

            // Повертаємо sticky позицію для результатів
            if (builderResults) {
                builderResults.style.position = 'sticky';
                builderResults.style.top = '110px';
                builderResults.style.width = '';
                builderResults.style.maxWidth = '';
            }

            // Повертаємо двоколонковий вигляд
            if (builderContainer) {
                builderContainer.style.display = 'grid';
                builderContainer.style.gridTemplateColumns = '1fr 1.2fr';
                builderContainer.style.gap = '3rem';
            }

            // Скидаємо стилі для опцій та результатів
            if (builderOptions && builderResults) {
                builderOptions.style.padding = '2rem';
                builderResults.style.padding = '2rem';

                const fieldsets = document.querySelectorAll('.builder-fieldset');
                fieldsets.forEach(fieldset => {
                    fieldset.style.padding = '';
                });

                const legends = document.querySelectorAll('.builder-legend');
                legends.forEach(legend => {
                    legend.style.fontSize = '';
                    legend.style.marginBottom = '';
                });

                const labels = document.querySelectorAll('.builder-radio-group label, .builder-checkbox-group label');
                labels.forEach(label => {
                    label.style.marginBottom = '';
                    label.style.lineHeight = '';
                });

                const inputs = document.querySelectorAll('.builder-radio-group input[type="radio"], .builder-checkbox-group input[type="checkbox"]');
                inputs.forEach(input => {
                    input.style.marginRight = '';
                    input.style.verticalAlign = '';
                });
            }
        }
    };

    // Відстежуємо зміни розміру вікна
    window.addEventListener('resize', handleResponsiveLayout);

    // Викликаємо функцію при завантаженні
    handleResponsiveLayout();

    // Функція для отримання перекладів текстів
    const getTranslation = (text) => {
        // Перевіряємо поточну мову
        const currentLang = document.documentElement.lang || 'uk';

        const translations = {
            'uk': {
                'Package:': 'Пакет:',
                'Pages:': 'Сторінок:',
                'Timeline:': 'Термін:',
                'Price:': 'Ціна:',
                'Send Request': 'Надіслати запит'
            },
            'en': {
                'Package:': 'Package:',
                'Pages:': 'Pages:',
                'Timeline:': 'Timeline:',
                'Price:': 'Price:',
                'Send Request': 'Send Request'
            }
        };

        // Повертаємо переклад або оригінальний текст, якщо переклад відсутній
        return translations[currentLang]?.[text] || text;
    };

    // Функція для оновлення текстів
    const updateLabels = () => {
        // Оновлюємо текст міток
        const summaryLabels = document.querySelectorAll('.summary-label');
        if (summaryLabels.length >= 4) {
            summaryLabels[0].textContent = getTranslation('Package:');
            summaryLabels[1].textContent = getTranslation('Pages:');
            summaryLabels[2].textContent = getTranslation('Timeline:');
            summaryLabels[3].textContent = getTranslation('Price:');
        }

        // Оновлюємо текст кнопки
        if (submitButton) {
            submitButton.textContent = getTranslation('Send Request');
        }
    };

    // Відразу оновлюємо тексти після завантаження сторінки
    updateLabels();

    // Додаємо слухач подій для зміни мови
    const languageSelectors = document.querySelectorAll('.language-switcher select, .language-switcher__button');
    languageSelectors.forEach(selector => {
        selector.addEventListener('change', updateLabels);
        selector.addEventListener('click', () => {
            // Додаємо невелику затримку для зміни мови
            setTimeout(updateLabels, 100);
        });
    });

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

        // Додаємо виклик адаптивності після всіх оновлень DOM
        setTimeout(handleResponsiveLayout, 50);

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

            // Викликаємо ще раз для оновлення після симуляції
            setTimeout(handleResponsiveLayout, 800);
        }

        // Оновлюємо переклад після обчислень
        updateLabels();
    };

    // Enhanced Browser Simulation Logic with ultra-realism
    const updateBrowserSimulation = (options) => {
        const { siteType, designType, pages, selectedModules = [] } = options || {};

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
                    (Array.isArray(selectedModules) ? selectedModules : []).forEach(module => {
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
                    if (selectedModules && Array.isArray(selectedModules)) {
                        if (selectedModules.includes('calculator')) {
                            initCalculatorInteraction();
                        }

                        if (selectedModules.includes('booking')) {
                            initBookingInteraction();
                        }
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

    // Функції генерації модулів
    function generateBlogModule(customClass) {
        return `
        <div class="sim-blog-module ${customClass}">
            <div class="sim-section-title"></div>
            <div class="sim-blog-posts">
                <div class="sim-blog-post">
                    <div class="sim-blog-image"></div>
                    <div class="sim-blog-title"></div>
                    <div class="sim-blog-date"></div>
                    <div class="sim-blog-excerpt"></div>
                </div>
                <div class="sim-blog-post">
                    <div class="sim-blog-image"></div>
                    <div class="sim-blog-title"></div>
                    <div class="sim-blog-date"></div>
                    <div class="sim-blog-excerpt"></div>
                </div>
            </div>
        </div>`;
    }

    function generatePortfolioModule(customClass) {
        return `
        <div class="sim-portfolio-module ${customClass}">
            <div class="sim-section-title"></div>
            <div class="sim-portfolio-filters"></div>
            <div class="sim-portfolio-grid">
                <div class="sim-portfolio-item"></div>
                <div class="sim-portfolio-item"></div>
                <div class="sim-portfolio-item"></div>
                <div class="sim-portfolio-item"></div>
            </div>
        </div>`;
    }

    function generateCalculatorModule(customClass) {
        return `
        <div class="sim-calculator ${customClass}">
            <div class="sim-section-title"></div>
            <div class="sim-calculator-form">
                <div class="sim-calculator-fields">
                    <div class="sim-calculator-field"></div>
                    <div class="sim-calculator-field"></div>
                </div>
                <div class="sim-calculator-button"></div>
                <div class="sim-calculator-results"></div>
            </div>
        </div>`;
    }

    function generateBookingModule(customClass) {
        return `
        <div class="sim-booking-module ${customClass}">
            <div class="sim-section-title"></div>
            <div class="sim-booking-calendar"></div>
            <div class="sim-booking-form">
                <div class="sim-booking-field"></div>
                <div class="sim-booking-field"></div>
                <div class="sim-booking-button"></div>
            </div>
        </div>`;
    }

    // Updated createInteractiveModules to return element (to append later)
    function createInteractiveModulesElement(selectedModules) {
        // Переконаємось, що selectedModules завжди масив
        selectedModules = Array.isArray(selectedModules) ? selectedModules : [];
        if (selectedModules.length === 0) return null;

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
            // Змінюємо стан кнопки
            submitButton.disabled = true;
            submitButton.textContent = 'Надсилаємо...';

            // Збираємо дані для відправки
            const formData = {
                name: '',
                contact_method: '',
                message: 'Запит з конструктора сайту',
                builder_site_type: '',
                builder_modules: '',
                builder_design: '',
                builder_pages: 0,
                builder_package: '',
                builder_price: ''
            };

            // Показуємо модальне вікно для введення контактної інформації
            const modalHTML = `
                <div class="builder-form-modal">
                    <div class="builder-form-modal-content">
                        <span class="builder-form-modal-close">&times;</span>
                        <h3>Залиште свої контактні дані</h3>
                        <div class="builder-form-fields">
                            <div class="builder-form-field">
                                <label for="modal-name">Ваше ім'я*:</label>
                                <input type="text" id="modal-name" required>
                            </div>
                            <div class="builder-form-field">
                                <label for="modal-contact">Email або Telegram*:</label>
                                <input type="text" id="modal-contact" required>
                            </div>
                            <div class="builder-form-field">
                                <label for="modal-message">Додаткові побажання:</label>
                                <textarea id="modal-message" rows="3"></textarea>
                            </div>
                        </div>
                        <button id="modal-submit" class="button cta-button">Надіслати запит</button>
                        <div id="modal-status" class="builder-form-status"></div>
                    </div>
                </div>
            `;

            // Додаємо модальне вікно на сторінку
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);

            // Отримуємо посилання на елементи модального вікна
            const modal = document.querySelector('.builder-form-modal');
            const closeBtn = document.querySelector('.builder-form-modal-close');
            const modalSubmit = document.getElementById('modal-submit');
            const modalStatus = document.getElementById('modal-status');

            // Обробники подій для модального вікна
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                document.body.removeChild(modalContainer);
                submitButton.disabled = false;
                submitButton.textContent = 'Надіслати запит';
            });

            // Кліки поза модальним вікном закривають його
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.removeChild(modalContainer);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Надіслати запит';
                }
            });

            // Обробка відправки форми з модального вікна
            modalSubmit.addEventListener('click', () => {
                const nameInput = document.getElementById('modal-name');
                const contactInput = document.getElementById('modal-contact');
                const messageInput = document.getElementById('modal-message');

                // Базова валідація
                if (!nameInput.value.trim() || !contactInput.value.trim()) {
                    modalStatus.textContent = 'Будь ласка, заповніть обов\'язкові поля';
                    modalStatus.classList.add('error');
                    return;
                }

                // Збираємо всі дані конструктора
                formData.name = nameInput.value.trim();
                formData.contact_method = contactInput.value.trim();

                if (messageInput.value.trim()) {
                    formData.message = messageInput.value.trim();
                }

                // Збираємо дані з конструктора
                const siteTypeElement = builderForm.querySelector('input[name="siteType"]:checked');
                formData.builder_site_type = siteTypeElement ? siteTypeElement.value : '';

                const designElement = builderForm.querySelector('input[name="design"]:checked');
                formData.builder_design = designElement ? designElement.value : '';

                formData.builder_pages = parseInt(pageCountSlider.value);
                formData.builder_package = packageResult.textContent;
                formData.builder_price = priceResult.textContent;

                // Збираємо обрані модулі
                const selectedModules = [];
                builderForm.querySelectorAll('input[name="modules"]:checked').forEach(module => {
                    selectedModules.push(module.value);
                });
                formData.builder_modules = selectedModules.join(', ');

                // Відправляємо дані на сервер
                modalSubmit.disabled = true;
                modalSubmit.textContent = 'Відправка...';
                modalStatus.textContent = 'Відправка запиту...';
                modalStatus.classList.remove('error');
                modalStatus.classList.remove('success');

                // Отримуємо CSRF токен зі сторінки
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                // Визначаємо поточний URL-шлях (для роботи з localization)
                let builderRequestUrl = '/builder/request/';
                // Перевіряємо, чи ми знаходимося в локалізованому шляху (наприклад, /uk/)
                const currentPath = window.location.pathname;
                const langMatch = currentPath.match(/^\/([a-z]{2})\//);
                if (langMatch) {
                    // Якщо ми на локалізованому шляху, додаємо мовний префікс до запиту
                    builderRequestUrl = `/${langMatch[1]}/builder/request/`;
                }

                fetch(builderRequestUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify(formData)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Успішно відправлено
                            modalStatus.textContent = data.message || 'Дякуємо! Ваш запит успішно надіслано.';
                            modalStatus.classList.add('success');

                            // Закриваємо модальне вікно через 2 секунди
                            setTimeout(() => {
                                modal.style.display = 'none';
                                document.body.removeChild(modalContainer);

                                // Показуємо повідомлення про успіх на сторінці
                                submitButton.style.display = 'none';
                                successMessage.classList.add('visible');
                            }, 2000);
                        } else {
                            // Помилка
                            modalStatus.textContent = data.message || 'Виникла помилка. Спробуйте пізніше.';
                            modalStatus.classList.add('error');
                            modalSubmit.disabled = false;
                            modalSubmit.textContent = 'Надіслати запит';
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        modalStatus.textContent = 'Виникла помилка при відправці. Спробуйте пізніше.';
                        modalStatus.classList.add('error');
                        modalSubmit.disabled = false;
                        modalSubmit.textContent = 'Надіслати запит';
                    });
            });

            // Показуємо модальне вікно
            modal.style.display = 'block';
        });
    }

    // Initial Calculation on page load (no event object needed here, will trigger visual update)
    calculateResults();

    // Додаємо класи адаптивності до body
    document.body.classList.add('has-builder');
    handleResponsiveLayout();
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
