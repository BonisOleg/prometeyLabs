// Dream Site Quiz Logic
document.addEventListener('DOMContentLoaded', function () {
    // Quiz state
    let currentStep = 0;
    let quizData = {
        websiteType: '',
        clientSource: '',
        specialFeatures: '',
        personalWishes: ''
    };

    // Get all modals
    const modals = {
        quiz1: document.getElementById('quizModal1'),
        quiz2: document.getElementById('quizModal2'),
        quiz3: document.getElementById('quizModal3'),
        quiz4: document.getElementById('quizModal4'),
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

    // Price calculation based on website type
    const priceRanges = {
        'landing': '$160-250',
        'online-store': '$300-499',
        'corporate': '$300-499',
        'webapp': '$600-799'
    };

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
        const quizModals = ['quiz1', 'quiz2'];

        quizModals.forEach((modalName, index) => {
            const modal = modals[modalName];
            if (!modal) return;

            const options = modal.querySelectorAll('.quiz-option');
            const nextBtn = modal.querySelector('.next-btn');
            const backBtn = modal.querySelector('.back-btn');

            // Option selection
            options.forEach(option => {
                option.addEventListener('click', function () {
                    // Remove selected class from all options
                    options.forEach(opt => opt.classList.remove('selected'));

                    // Add selected class to clicked option
                    this.classList.add('selected');

                    // Enable next button
                    nextBtn.disabled = false;

                    // Store the value
                    const value = this.getAttribute('data-value');
                    if (modalName === 'quiz1') {
                        quizData.websiteType = value;
                    } else if (modalName === 'quiz2') {
                        quizData.clientSource = value;
                    }
                });
            });

            // Next button
            nextBtn.addEventListener('click', function () {
                if (modalName === 'quiz1') {
                    showModal('quiz2');
                    currentStep = 2;
                } else if (modalName === 'quiz2') {
                    showModal('quiz3');
                    currentStep = 3;
                }
            });

            // Back button
            if (backBtn) {
                backBtn.addEventListener('click', function () {
                    if (modalName === 'quiz2') {
                        showModal('quiz1');
                        currentStep = 1;
                    }
                });
            }
        });
    }

    // Setup quiz3 (special features)
    function setupQuiz3() {
        const modal = modals.quiz3;
        if (!modal) return;

        const textarea = modal.querySelector('#specialFeatures');
        const nextBtn = modal.querySelector('.next-btn');
        const backBtn = modal.querySelector('.back-btn');

        nextBtn.addEventListener('click', function () {
            quizData.specialFeatures = textarea.value.trim();
            showModal('quiz4');
            currentStep = 4;
        });

        backBtn.addEventListener('click', function () {
            showModal('quiz2');
            currentStep = 2;
        });
    }

    // Setup quiz4 (personal wishes)
    function setupQuiz4() {
        const modal = modals.quiz4;
        if (!modal) return;

        const textarea = modal.querySelector('#personalWishes');
        const submitBtn = modal.querySelector('.submit-btn');
        const backBtn = modal.querySelector('.back-btn');

        submitBtn.addEventListener('click', function () {
            quizData.personalWishes = textarea.value.trim();
            startLoadingProcess();
        });

        backBtn.addEventListener('click', function () {
            showModal('quiz3');
            currentStep = 3;
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
        // Calculate price based on website type
        const price = priceRanges[quizData.websiteType] || '$300-499';
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

        const additionalFeatures = {
            'landing': ['Конверсійний дизайн', 'A/B тестування форм'],
            'online-store': ['Каталог товарів', 'Система оплати', 'Управління замовленнями'],
            'corporate': ['Багатосторінкова структура', 'Корпоративний блог', 'Команда та контакти'],
            'webapp': ['Складна логіка', 'Особливий функціонал', 'API інтеграції']
        };

        let features = [...baseFeatures];
        if (additionalFeatures[quizData.websiteType]) {
            features = features.concat(additionalFeatures[quizData.websiteType]);
        }

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

            if (quizData.specialFeatures) {
                fullMessage += `Особливі функції: ${quizData.specialFeatures}\n`;
            }

            if (quizData.personalWishes) {
                fullMessage += `Особисті побажання: ${quizData.personalWishes}\n`;
            }

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
            personalWishes: ''
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
    setupQuiz3();
    setupQuiz4();
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