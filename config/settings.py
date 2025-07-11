"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 5.2.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.2/ref/settings/
"""

from pathlib import Path
import os # Додаємо імпорт os для роботи зі шляхами
import dj_database_url # Додано для Render

# Завантаження змінних середовища з .env файлу
from dotenv import load_dotenv
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-!!!ЗАМІНИТИ_ЦЕ_У_ПРОДАКШЕНІ!!!') # Змінено для Render

# SECURITY WARNING: don't run with debug turned on in production!
# DEBUG = True # Оригінальне значення
DEBUG = 'RENDER' not in os.environ # Змінено для Render (False, якщо є змінна RENDER)

# ALLOWED_HOSTS = [] # Оригінальне значення
ALLOWED_HOSTS = [
    'www.prometeylabs.com', # Жорстко додано для тесту
    '0.0.0.0', # Додано для розробки з використанням 0.0.0.0
]

RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)
    # Наступний рядок тепер дублює жорстко прописаний, але залишимо для чистоти експерименту
    ALLOWED_HOSTS.append(f'www.{RENDER_EXTERNAL_HOSTNAME}') # Додаємо версію з www.

# Дозволити localhost для локальних тестів prod налаштувань
if not RENDER_EXTERNAL_HOSTNAME: # Або інша логіка визначення локального середовища
    ALLOWED_HOSTS.extend(['localhost', '127.0.0.1', 'testserver'])


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'prometei.apps.PrometeiConfig', # Залишаємо цей
    'payment.apps.PaymentConfig', # Додаємо payment додаток
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', # Додано для Render (після SecurityMiddleware)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'], # Перевір цей шлях, якщо шаблони лежать деінде
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',  # Додаємо контекстний процесор i18n
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application' # Додано, якщо використовуєш ASGI


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# Оригінальна конфігурація SQLite:
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

# Конфігурація бази даних - тимчасово використовуємо SQLite
# DATABASE_URL = os.environ.get('DATABASE_URL')

# Тимчасово використовуємо SQLite навіть на продакшені для запуску сайту
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Закоментовано PostgreSQL конфігурацію:
# if DATABASE_URL:
#     # Використовуємо PostgreSQL на продакшені
#     DATABASES = {
#         'default': dj_database_url.config(
#             default=DATABASE_URL,
#             conn_max_age=600,
#             ssl_require=True
#         )
#     }
#     # Додаткові налаштування SSL для PostgreSQL на Render
#     DATABASES['default']['OPTIONS'] = {
#         'sslmode': 'require',
#     }
# else:
#     # Використовуємо SQLite для локальної розробки
#     DATABASES = {
#         'default': {
#             'ENGINE': 'django.db.backends.sqlite3',
#             'NAME': BASE_DIR / 'db.sqlite3',
#         }
#     }


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'uk'

LANGUAGES = [
    ('uk', 'Українська'),
    ('en', 'English'),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

TIME_ZONE = 'Europe/Kyiv'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
MEDIA_URL = 'media/' # Якщо використовуєш медіа файли

# STATICFILES_DIRS визначає, де шукати статику в розробці
STATICFILES_DIRS = [
    BASE_DIR / 'prometei' / 'static', # Перевір цей шлях
    BASE_DIR / 'payment' / 'static', # Додаємо статичні файли payment додатку
]

# Налаштування для WhiteNoise у продакшені
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
if not DEBUG:
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_ROOT = BASE_DIR / 'mediafiles' # Якщо використовуєш медіа файли

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Email configuration
# Налаштування для відправки електронної пошти

# Змінено: Увімкнено SMTP бекенд для реальної відправки
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Закоментовано: Старий варіант з консольним бекендом
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Закоментовано: Варіант вибору бекенду залежно від режиму (DEV/PROD)
# if not DEBUG:
#     EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
#     # Або можна використовувати Mailgun:
#     # EMAIL_BACKEND = 'anymail.backends.mailgun.EmailBackend'

# Налаштування для SMTP
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', 'your-email@gmail.com')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', 'your-password')

# Налаштування для Mailgun
ANYMAIL = {
    "MAILGUN_API_KEY": os.environ.get('MAILGUN_API_KEY', ''),
    "MAILGUN_SENDER_DOMAIN": os.environ.get('MAILGUN_DOMAIN', 'mg.prometeylabs.com'),
}

# Для Gmail потрібно створити пароль додатку: 
# https://myaccount.google.com/apppasswords

# Адреса, з якої будуть надсилатися листи
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'Prometey Labs <info@prometeylabs.com>')

# Адреса, на яку будуть надходити контактні запити
CONTACT_EMAIL = os.environ.get('CONTACT_EMAIL', 'info@prometeylabs.com')

# Налаштування Monobank Acquiring
MONOBANK_TOKEN = os.environ.get('MONOBANK_TOKEN', '***REMOVED***')
SITE_URL = os.environ.get('SITE_URL', 'https://www.prometeylabs.com')

# Для локальної розробки
if DEBUG:
    SITE_URL = 'http://localhost:8001'

# Налаштування логування
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': { # Завжди використовуємо консоль
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        # Визначення 'file' та 'mail_admins' перенесено нижче
    },
    'loggers': {
        'django': {
            'handlers': ['console'], # Базово - лише консоль
            'level': 'INFO',
            'propagate': True,
        },
        'prometei': { # Якщо ти використовуєш логування в своєму додатку
            'handlers': ['console'], # Базово - лише консоль
            'level': 'INFO', # Базово INFO
            'propagate': False,
        },
        'payment': { # Логування для payment додатку
            'handlers': ['console'], # Базово - лише консоль
            'level': 'INFO', # Базово INFO
            'propagate': False,
        },
    }
}

# Додаткові налаштування логування для DEBUG режиму (локально)
if DEBUG:
    # Додаємо файловий обробник
    LOGGING['handlers']['file'] = {
        'level': 'INFO',
        'class': 'logging.FileHandler',
        'filename': os.path.join(BASE_DIR, 'logs/prometei.log'), # Переконайся, що папка logs існує локально
        'formatter': 'verbose',
}
    # Додаємо обробник для пошти адмінам
    LOGGING['handlers']['mail_admins'] = {
        'level': 'ERROR',
        'class': 'django.utils.log.AdminEmailHandler',
    }
    # Додаємо 'file' до обробників логерів
    LOGGING['loggers']['django']['handlers'].append('file')
    LOGGING['loggers']['django']['handlers'].append('mail_admins') # Якщо потрібно надсилати помилки Django адмінам
    LOGGING['loggers']['prometei']['handlers'].append('file')
    LOGGING['loggers']['prometei']['level'] = 'DEBUG' # Більш детальні логи локально
    LOGGING['loggers']['payment']['handlers'].append('file')
    LOGGING['loggers']['payment']['level'] = 'DEBUG' # Більш детальні логи локально

# Примусово вимикаємо файлове логування на Render (цей блок тепер не потрібен, але залишу про всяк випадок, якщо DEBUG визначиться неправильно)
# if 'RENDER' in os.environ:
#     LOGGING['loggers']['django']['handlers'] = ['console']
#     if 'prometei' in LOGGING['loggers']:
#         LOGGING['loggers']['prometei']['handlers'] = ['console']
#     if 'file' in LOGGING['handlers']:
#         del LOGGING['handlers']['file']
