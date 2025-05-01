# Prometey Labs

Веб-сайт для Prometey Labs, веб-студії розробки сайтів.

## Встановлення та запуск

1. Клонуйте репозиторій:
```
git clone https://github.com/your-organization/prometeylabs.git
cd prometeylabs
```

2. Встановіть залежності:
```
pip install -r requirements.txt
```

3. Створіть файл `.env` з налаштуваннями середовища:
```
# Основні налаштування Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Налаштування для відправки email
# Для розробки використовуйте консольний бекенд
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Для відправки реальних листів через Gmail
# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password  # Для Gmail: https://myaccount.google.com/apppasswords
```

4. Запустіть міграції:
```
python manage.py migrate
```

5. Запустіть сервер розробки:
```
python manage.py runserver
```

## Email функціональність

У проєкті реалізована відправка електронних листів для:
- Підтвердження отримання запитів від користувачів
- Надсилання сповіщень адміністраторам про нові запити

### Налаштування відправки Email

#### Для розробки (листи виводяться в консоль)
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```

#### Для виробничого середовища через SMTP
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # або інший SMTP сервер
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-password'
```

#### Альтернативно: використання Mailgun
Для використання Mailgun встановіть бібліотеку django-anymail:
```
pip install django-anymail[mailgun]
```

І додайте наступні налаштування:
```python
EMAIL_BACKEND = 'anymail.backends.mailgun.EmailBackend'
ANYMAIL = {
    "MAILGUN_API_KEY": "your-mailgun-key",
    "MAILGUN_SENDER_DOMAIN": "mg.example.com",
}
```

### Шаблони листів
Усі шаблони для email знаходяться в директорії `prometei/templates/email/`:
- `contact_confirmation.html` - підтвердження для користувача після відправки контактної форми
- `contact_request_email.html` - повідомлення адміністратору про новий контактний запит
- `builder_confirmation.html` - підтвердження для користувача після відправки запиту з конструктора
- `builder_request_email.html` - повідомлення адміністратору про новий запит з конструктора
- `promin_confirmation.html` - підтвердження для користувача після відправки заявки на Promin
- `promin_request_email.html` - повідомлення адміністратору про нову заявку на Promin

## Ліцензія
Цей проєкт має власну ліцензію. Всі права належать Prometey Labs.
