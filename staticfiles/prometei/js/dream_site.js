// Dream Site Quiz Logic
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dream Site JS loaded');

    // === МОБІЛЬНА ТЕМНА ТЕМА - ПОЧАТОК ===
    // Визначаємо мобільні пристрої та iOS
    function isMobileDevice() {
        return window.innerWidth <= 768 ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    function isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }

    // Функція для встановлення темної теми тільки на мобільних
    function setMobileDarkTheme() {
        if (isMobileDevice() || isIOSDevice()) {
            const htmlElement = document.documentElement;
            const bodyElement = document.body;

            // Встановлюємо темну тему
            htmlElement.setAttribute('data-theme', 'dark');
            bodyElement.setAttribute('data-theme', 'dark');

            // Приховуємо кнопку перемикання теми на мобільних для цієї сторінки
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.style.display = 'none';
            }

            // Додаємо клас для індикації що це мобільна темна тема
            document.body.classList.add('mobile-dark-theme');

            console.log('Mobile/iOS темна тема активована для dream_site');
        }
    }

    // Встановлюємо темну тему одразу при завантаженні
    setMobileDarkTheme();

    // Перевіряємо при зміні розміру вікна
    window.addEventListener('resize', function () {
        setMobileDarkTheme();
    });

    // Перевіряємо при поворотах екрану
    window.addEventListener('orientationchange', function () {
        setTimeout(setMobileDarkTheme, 100);
    });
    // === МОБІЛЬНА ТЕМНА ТЕМА - КІНЕЦЬ ===

    // Quiz state
    let currentStep = 0;
    let quizData = {
        websiteType: '',
        clientSource: [],
        specialFeatures: [],
        designStyle: '',
        timeline: ''
    };

    // Get all modals
    const modals = {
        quiz1: document.getElementById('quizModal1'),
        quiz2: document.getElementById('quizModal2'),
        quiz3: document.getElementById('quizModal3'),
        quiz4: document.getElementById('quizModal4'),
        quiz5: document.getElementById('quizModal5'),
        loading: document.getElementById('loadingModal'),
        proposal: document.getElementById('proposalModal'),
        contact: document.getElementById('contactModal'),
        success: document.getElementById('successModal')
    };

    // Debug: Check if all modals exist
    console.log('Modals found:');
    Object.entries(modals).forEach(([name, modal]) => {
        console.log(`${name}:`, !!modal);
    });

    // Get elements
    const startTestBtn = document.getElementById('startTestBtn');
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const calculatedPrice = document.getElementById('calculatedPrice');
    const featuresList = document.getElementById('featuresList');

    // Loading texts for animation
    const loadingTexts = [
        'Шукаємо технології',
        'Аналізуємо потреби',
        'Підбираємо рішення',
        'Розраховуємо вартість',
        'Формуємо пропозицію'
    ];

    // Базові ціни для різних типів сайтів
    const BASE_PRICES = {
        'landing': { min: 299, max: 399 },
        'online-store': { min: 399, max: 499 },
        'corporate': { min: 349, max: 449 },
        'webapp': { min: 399, max: 499 }
    };

    // Модифікатори цін для різних опцій
    const PRICE_MODIFIERS = {
        // Джерело трафіку
        'instagram': { min: 0, max: 50 },
        'tiktok': { min: 0, max: 50 },
        'google': { min: 50, max: 100 },
        'other-ads': { min: 30, max: 80 },
        'no-matter': { min: 0, max: 0 },

        // Функціонал
        'basic': { min: 0, max: 0 },
        'online-booking': { min: 50, max: 100 },
        'payment': { min: 70, max: 100 },
        'automation': { min: 80, max: 100 },
        'advanced': { min: 100, max: 100 },

        // Дизайн
        'minimalist': { min: 0, max: 0 },
        'modern': { min: 30, max: 50 },
        'classic': { min: 20, max: 40 },
        'creative': { min: 50, max: 70 },

        // Терміновість
        'asap': { min: 100, max: 100 },
        'week': { min: 50, max: 70 },
        'month': { min: 0, max: 0 },
        'no-rush': { min: -50, max: -30 }
    };

    // Функція для розрахунку фінальної ціни
    function calculatePrice(selections) {
        let basePrice = BASE_PRICES[selections.websiteType] || { min: 299, max: 399 };
        let totalMin = basePrice.min;
        let totalMax = basePrice.max;

        // Додаємо модифікатори для масивів
        const processValues = (values) => {
            if (Array.isArray(values)) {
                values.forEach(value => {
                    if (value && PRICE_MODIFIERS[value]) {
                        totalMin += PRICE_MODIFIERS[value].min;
                        totalMax += PRICE_MODIFIERS[value].max;
                    }
                });
            } else if (values && PRICE_MODIFIERS[values]) {
                totalMin += PRICE_MODIFIERS[values].min;
                totalMax += PRICE_MODIFIERS[values].max;
            }
        };

        // Обробляємо всі вибори
        processValues(selections.clientSource);
        processValues(selections.specialFeatures);
        processValues(selections.designStyle);
        processValues(selections.timeline);

        // Обмежуємо максимальну ціну до 499
        totalMin = Math.min(totalMin, 499);
        totalMax = Math.min(totalMax, 499);

        totalMin = Math.max(totalMin, 299);
        totalMax = Math.max(totalMax, totalMin);

        // Create price range
        totalMin = Math.floor(totalMin / 10) * 10 + 9;
        totalMax = Math.floor(totalMax / 10) * 10 + 9;

        return `$${totalMin}-${totalMax}`;
    }

    // Start test button click
    console.log('Start test button:', startTestBtn);

    if (startTestBtn) {
        startTestBtn.addEventListener('click', function () {
            console.log('Start test button clicked');
            showModal('quiz1');
            currentStep = 1;
        });
    } else {
        console.error('Start test button not found!');
    }

    // Show modal function
    function showModal(modalName) {
        console.log('Showing modal:', modalName);
        console.log('Modal exists:', !!modals[modalName]);

        // Hide all modals
        Object.values(modals).forEach(modal => {
            if (modal) modal.classList.remove('active');
        });

        // Show specific modal
        if (modals[modalName]) {
            modals[modalName].classList.add('active');
            console.log('Modal activated:', modalName);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Modal not found:', modalName);
        }
    }

    // Hide all modals function
    function hideAllModals() {
        Object.values(modals).forEach(modal => {
            if (modal) modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }

    // Setup quiz options for all quiz modals
    function setupQuizOptions() {
        // Quiz 1 - single select
        setupSingleSelectQuiz(1);

        // Quiz 2 & 3 - multi select
        setupMultiSelectQuiz(2);
        setupMultiSelectQuiz(3);

        // Quiz 4 - single select
        setupSingleSelectQuiz(4);

        // Quiz 5 - single select with submit
        setupSingleSelectQuiz(5);
    }

    // Single select quiz setup
    function setupSingleSelectQuiz(quizId) {
        const modal = document.getElementById(`quizModal${quizId}`);
        if (!modal) return;

        const options = modal.querySelectorAll('.quiz-option');
        const nextBtn = modal.querySelector('.next-btn');
        const submitBtn = modal.querySelector('.submit-btn');
        const targetBtn = nextBtn || submitBtn;

        options.forEach(option => {
            option.addEventListener('click', function () {
                // Remove previous selections
                options.forEach(opt => opt.classList.remove('selected'));

                // Add selection to clicked option
                this.classList.add('selected');

                // Store the selection
                const value = this.getAttribute('data-value');
                if (quizId === 1) {
                    quizData.businessType = value;
                } else if (quizId === 4) {
                    quizData.designStyle = value;
                } else if (quizId === 5) {
                    quizData.timeline = value;
                    // Add gradient class for submit button
                    if (submitBtn) {
                        submitBtn.classList.add('has-selection');
                    }
                }

                // Enable the button
                if (targetBtn) {
                    targetBtn.disabled = false;
                }

                console.log('Single select - Current quiz data:', quizData);
            });
        });
    }

    // Multi select quiz setup
    function setupMultiSelectQuiz(quizId) {
        const modal = document.getElementById(`quizModal${quizId}`);
        if (!modal) return;

        const options = modal.querySelectorAll('.quiz-option.multi-select');
        const nextBtn = modal.querySelector('.next-btn');

        options.forEach(option => {
            option.addEventListener('click', function () {
                // Toggle selection
                this.classList.toggle('selected');

                // Get all selected values
                const selectedOptions = modal.querySelectorAll('.quiz-option.multi-select.selected');
                const selectedValues = Array.from(selectedOptions).map(opt => opt.getAttribute('data-value'));

                // Store the selections
                if (quizId === 2) {
                    quizData.clientSource = selectedValues;
                } else if (quizId === 3) {
                    quizData.specialFeatures = selectedValues;
                }

                // Enable/disable next button based on selections
                if (nextBtn) {
                    nextBtn.disabled = selectedValues.length === 0;
                }

                console.log('Multi select - Current quiz data:', quizData);
            });
        });
    }

    // Start loading process
    function startLoadingProcess() {
        showModal('loading');

        let textIndex = 0;
        let progress = 0;

        const updateLoading = () => {
            if (textIndex < loadingTexts.length) {
                loadingText.textContent = loadingTexts[textIndex];
                textIndex++;

                // Update progress
                progress += 33.33;
                progressBar.style.width = Math.min(progress, 100) + '%';

                setTimeout(updateLoading, 1300);
            } else {
                // Final progress update
                progressBar.style.width = '100%';
                setTimeout(() => {
                    showProposal();
                }, 500);
            }
        };

        updateLoading();
    }

    // Show proposal
    function showProposal() {
        // Calculate price based on all selections
        const price = calculatePrice(quizData);
        calculatedPrice.textContent = price;

        // Update features list based on selections
        updateFeaturesList();

        showModal('proposal');
    }

    // Update features list
    function updateFeaturesList() {
        const baseFeatures = [
            'Адаптивний дизайн під всі пристрої',
            'Швидкість завантаження менше 3 секунд',
            'SEO-оптимізація'
        ];

        const websiteTypeFeatures = {
            'landing': ['Конверсійний дизайн', 'A/B тестування форм'],
            'online-store': ['Каталог товарів', 'Система оплати', 'Управління замовленнями'],
            'corporate': ['Багатосторінкова структура', 'Корпоративний блог', 'Команда та контакти'],
            'webapp': ['Складна логіка', 'Особливий функціонал', 'API інтеграції']
        };

        const specialFeatures = {
            'basic': ['Контактна форма', 'Галерея зображень'],
            'online-booking': ['Система бронювання', 'Календар записів'],
            'payment': ['Онлайн оплата', 'Корзина покупок'],
            'automation': ['CRM інтеграція', 'Автоматичні розсилки'],
            'advanced': ['Калькулятори', 'API інтеграції', 'Складна логіка']
        };

        const designFeatures = {
            'minimalist': ['Чистий дизайн', 'Фокус на контенті'],
            'modern': ['Сучасні анімації', 'Градієнти та ефекти'],
            'classic': ['Професійний вигляд', 'Корпоративні кольори'],
            'creative': ['Унікальний дизайн', 'Нестандартні рішення']
        };

        let features = [...baseFeatures];

        // Add website type features
        if (websiteTypeFeatures[quizData.websiteType]) {
            features = features.concat(websiteTypeFeatures[quizData.websiteType]);
        }

        // Add special features
        if (specialFeatures[quizData.specialFeatures]) {
            features = features.concat(specialFeatures[quizData.specialFeatures]);
        }

        // Add design features
        if (designFeatures[quizData.designStyle]) {
            features = features.concat(designFeatures[quizData.designStyle]);
        }

        // Remove duplicates and limit to 3 features max
        features = [...new Set(features)].slice(0, 3);

        featuresList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
    }

    // Setup proposal modal
    function setupProposalModal() {
        const modal = modals.proposal;
        if (!modal) return;

        const getVisualizationBtn = modal.querySelector('.get-visualization-btn');

        getVisualizationBtn.addEventListener('click', function () {
            showModal('contact');
        });
    }

    // Setup contact form
    function setupContactForm() {
        const modal = modals.contact;
        if (!modal) return;

        const form = modal.querySelector('#contactForm');
        const submitBtn = modal.querySelector('.submit-form-btn');

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(form);
            const name = formData.get('name').trim();
            const phone = formData.get('phone').trim();
            const telegram = formData.get('telegram').trim();
            const instagram = formData.get('instagram').trim();

            // Validation
            if (!name) {
                alert('Будь ласка, введіть ваше ім\'я');
                return;
            }

            if (!phone && !telegram && !instagram) {
                alert('Будь ласка, вкажіть хоча б один спосіб зв\'язку');
                return;
            }

            // Prepare contact method string
            let contactMethod = '';
            if (phone) contactMethod += `Телефон: ${phone}`;
            if (telegram) contactMethod += (contactMethod ? ', ' : '') + `Telegram: ${telegram}`;
            if (instagram) contactMethod += (contactMethod ? ', ' : '') + `Instagram: ${instagram}`;

            // Prepare full message
            let fullMessage = `Запит з конструктора сайту мрії:\n\n`;
            fullMessage += `Тип сайту: ${getWebsiteTypeText(quizData.websiteType)}\n`;
            fullMessage += `Джерело клієнтів: ${getClientSourceText(quizData.clientSource)}\n`;
            fullMessage += `Особливі функції: ${getSpecialFeaturesText(quizData.specialFeatures)}\n`;
            fullMessage += `Стиль дизайну: ${getDesignStyleText(quizData.designStyle)}\n`;
            fullMessage += `Термін виконання: ${getTimelineText(quizData.timeline)}\n`;

            if (formData.get('message').trim()) {
                fullMessage += `Додаткове повідомлення: ${formData.get('message').trim()}`;
            }

            // Submit form via AJAX
            submitForm(name, contactMethod, fullMessage);
        });
    }

    // Get website type text
    function getWebsiteTypeText(type) {
        const types = {
            'landing': 'Landing page',
            'online-store': 'Інтернет-магазин',
            'corporate': 'Корпоративний сайт',
            'webapp': 'Веб-додаток'
        };
        return types[type] || type;
    }

    // Get client source text
    function getClientSourceText(sources) {
        const sourceMap = {
            'instagram': 'Instagram',
            'tiktok': 'TikTok',
            'google': 'Google',
            'other-ads': 'Інша реклама',
            'no-matter': 'Не має значення'
        };

        if (Array.isArray(sources)) {
            return sources.map(source => sourceMap[source] || source).join(', ');
        }
        return sourceMap[sources] || sources;
    }

    // Get special features text
    function getSpecialFeaturesText(features) {
        const featuresMap = {
            'basic': 'Базовий функціонал',
            'online-booking': 'Онлайн-запис',
            'payment': 'Приймання платежів',
            'automation': 'Автоматизація',
            'advanced': 'Складний функціонал'
        };

        if (Array.isArray(features)) {
            return features.map(feature => featuresMap[feature] || feature).join(', ');
        }
        return featuresMap[features] || features;
    }

    // Get design style text
    function getDesignStyleText(style) {
        const stylesMap = {
            'minimalist': 'Мінімалістичний',
            'modern': 'Сучасний',
            'classic': 'Класичний',
            'creative': 'Креативний'
        };
        return stylesMap[style] || style;
    }

    // Get timeline text
    function getTimelineText(timeline) {
        const timelinesMap = {
            'asap': 'Якнайшвидше (2-3 дні)',
            'week': 'Протягом тижня',
            'month': 'Протягом місяця',
            'no-rush': 'Не поспішаю'
        };
        return timelinesMap[timeline] || timeline;
    }

    // Submit form via AJAX
    function submitForm(name, contactMethod, message) {
        const submitBtn = document.querySelector('.submit-form-btn');
        const originalText = submitBtn.textContent;

        // Show loading state
        submitBtn.textContent = 'Відправляємо...';
        submitBtn.disabled = true;

        // Get CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // Prepare data
        const data = {
            name: name,
            contact_method: contactMethod,
            message: message
        };

        // Send AJAX request
        fetch(window.location.pathname, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showModal('success');
                } else {
                    alert(data.message || 'Виникла помилка при відправці. Спробуйте ще раз.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Виникла помилка при відправці. Спробуйте ще раз.');
            })
            .finally(() => {
                // Restore button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    }

    // Setup success modal
    function setupSuccessModal() {
        const modal = modals.success;
        if (!modal) return;

        const closeBtn = modal.querySelector('.close-success-btn');

        closeBtn.addEventListener('click', function () {
            hideAllModals();
            // Reset quiz
            resetQuiz();
        });
    }

    // Reset quiz
    function resetQuiz() {
        currentStep = 0;
        quizData = {
            businessType: '',
            clientSource: [],
            specialFeatures: [],
            designStyle: '',
            timeline: ''
        };

        // Reset all quiz selections
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Reset textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.value = '';
        });

        // Reset form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.reset();
        }

        // Reset next buttons
        document.querySelectorAll('.next-btn').forEach(btn => {
            btn.disabled = true;
        });

        // Reset submit button
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.classList.remove('has-selection');
        }

        // Reset progress
        progressBar.style.width = '0%';
    }

    // Close modals when clicking outside
    Object.values(modals).forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    hideAllModals();
                }
            });
        }
    });

    // Close modals with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            hideAllModals();
        }
    });

    // Setup navigation between quiz modals
    function setupQuizNavigation() {
        // Next buttons for all quizzes
        const quiz1NextBtn = document.querySelector('#quizModal1 .next-btn');
        const quiz2NextBtn = document.querySelector('#quizModal2 .next-btn');
        const quiz3NextBtn = document.querySelector('#quizModal3 .next-btn');
        const quiz4NextBtn = document.querySelector('#quizModal4 .next-btn');

        if (quiz1NextBtn) {
            quiz1NextBtn.addEventListener('click', function () {
                if (quizData.businessType && !this.disabled) {
                    showModal('quiz2');
                    currentStep = 2;
                }
            });
        }

        if (quiz2NextBtn) {
            quiz2NextBtn.addEventListener('click', function () {
                if (quizData.clientSource && quizData.clientSource.length > 0) {
                    showModal('quiz3');
                    currentStep = 3;
                }
            });
        }

        if (quiz3NextBtn) {
            quiz3NextBtn.addEventListener('click', function () {
                if (quizData.specialFeatures && quizData.specialFeatures.length > 0) {
                    showModal('quiz4');
                    currentStep = 4;
                }
            });
        }

        if (quiz4NextBtn) {
            quiz4NextBtn.addEventListener('click', function () {
                if (quizData.designStyle && !this.disabled) {
                    showModal('quiz5');
                    currentStep = 5;
                }
            });
        }

        // Submit button for final quiz
        const submitBtn = document.querySelector('#quizModal5 .submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', function () {
                if (quizData.timeline && !this.disabled) {
                    startLoadingProcess();
                }
            });
        }
    }

    // Initialize all components
    setupQuizOptions();
    setupProposalModal();
    setupContactForm();
    setupSuccessModal();
    setupQuizNavigation();

    // Prevent form submission on Enter in text inputs (but allow in textareas)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
        }
    });
}); 