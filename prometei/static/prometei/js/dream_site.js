// Dream Site Quiz Logic
document.addEventListener('DOMContentLoaded', function () {
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
        clientSource: '',
        specialFeatures: '',
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

    // Get elements
    const startTestBtn = document.getElementById('startTestBtn');
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');
    const calculatedPrice = document.getElementById('calculatedPrice');
    const featuresList = document.getElementById('featuresList');

    // Loading texts for animation
    const loadingTexts = [
        'Шукаємо технології',
        'Прораховуємо кількість роботи',
        'Формуємо пропозицію'
    ];

    // Price calculation based on website type and features
    function calculatePrice() {
        const basePrices = {
            'landing': 200,
            'online-store': 350,
            'corporate': 300,
            'webapp': 650
        };

        const featureModifiers = {
            'basic': 0,
            'online-booking': 100,
            'payment': 150,
            'automation': 200,
            'advanced': 300
        };

        const timelineModifiers = {
            'asap': 150,     // Експрес надбавка
            'week': 0,       // Стандартна ціна
            'month': -50,    // Знижка за неспішність
            'no-rush': -100  // Максимальна знижка
        };

        let basePrice = basePrices[quizData.websiteType] || 300;
        let featureModifier = featureModifiers[quizData.specialFeatures] || 0;
        let timelineModifier = timelineModifiers[quizData.timeline] || 0;

        let totalPrice = basePrice + featureModifier + timelineModifier;

        // Ensure minimum price
        totalPrice = Math.max(totalPrice, 150);

        // Create price range
        let minPrice = totalPrice - 50;
        let maxPrice = totalPrice + 50;

        return `$${minPrice}-${maxPrice}`;
    }

    // Start test button click
    startTestBtn.addEventListener('click', function () {
        showModal('quiz1');
        currentStep = 1;
    });

    // Show modal function
    function showModal(modalName) {
        // Hide all modals
        Object.values(modals).forEach(modal => {
            if (modal) modal.classList.remove('active');
        });

        // Show specific modal
        if (modals[modalName]) {
            modals[modalName].classList.add('active');

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
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
        const quizModals = ['quiz1', 'quiz2', 'quiz3', 'quiz4'];

        quizModals.forEach((modalName, index) => {
            const modal = modals[modalName];
            if (!modal) return;

            const options = modal.querySelectorAll('.quiz-option');

            // Option selection with automatic progression
            options.forEach(option => {
                option.addEventListener('click', function () {
                    // Remove selected class from all options
                    options.forEach(opt => opt.classList.remove('selected'));

                    // Add selected class to clicked option
                    this.classList.add('selected');

                    // Store the value
                    const value = this.getAttribute('data-value');
                    if (modalName === 'quiz1') {
                        quizData.websiteType = value;
                    } else if (modalName === 'quiz2') {
                        quizData.clientSource = value;
                    } else if (modalName === 'quiz3') {
                        quizData.specialFeatures = value;
                    } else if (modalName === 'quiz4') {
                        quizData.designStyle = value;
                    }

                    // Add slight delay for visual feedback, then proceed
                    setTimeout(() => {
                        if (modalName === 'quiz1') {
                            showModal('quiz2');
                            currentStep = 2;
                        } else if (modalName === 'quiz2') {
                            showModal('quiz3');
                            currentStep = 3;
                        } else if (modalName === 'quiz3') {
                            showModal('quiz4');
                            currentStep = 4;
                        } else if (modalName === 'quiz4') {
                            showModal('quiz5');
                            currentStep = 5;
                        }
                    }, 300);
                });
            });
        });
    }

    // Setup quiz5 (timeline)
    function setupQuiz5() {
        const modal = modals.quiz5;
        if (!modal) return;

        const options = modal.querySelectorAll('.quiz-option');
        const submitBtn = modal.querySelector('.submit-btn');

        // Option selection for quiz5
        options.forEach(option => {
            option.addEventListener('click', function () {
                // Remove selected class from all options
                options.forEach(opt => opt.classList.remove('selected'));

                // Add selected class to clicked option
                this.classList.add('selected');

                // Store the value
                const value = this.getAttribute('data-value');
                quizData.timeline = value;
            });
        });

        if (submitBtn) {
            submitBtn.addEventListener('click', function () {
                if (!quizData.timeline) {
                    alert('Будь ласка, оберіть термін виконання');
                    return;
                }
                startLoadingProcess();
            });
        }
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
        const price = calculatePrice();
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
            'SEO-оптимізація',
            'Інтеграція з соціальними мережами'
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

        // Remove duplicates and limit to 8 features max
        features = [...new Set(features)].slice(0, 8);

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
    function getClientSourceText(source) {
        const sources = {
            'instagram': 'Instagram',
            'tiktok': 'TikTok',
            'google': 'Google',
            'other-ads': 'Інша реклама',
            'no-matter': 'Не має значення'
        };
        return sources[source] || source;
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
            websiteType: '',
            clientSource: '',
            specialFeatures: '',
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

    // Initialize all components
    setupQuizOptions();
    setupQuiz5();
    setupProposalModal();
    setupContactForm();
    setupSuccessModal();

    // Prevent form submission on Enter in text inputs (but allow in textareas)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
        }
    });
}); 