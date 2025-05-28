# Вирішення проблем з платіжною системою

## 🔍 Діагностика проблем

### 1. **Договір не завантажується**

**Симптоми:** При натисканні на посилання договору - 404 помилка

**Рішення:**
```bash
# 1. Перевірте чи налаштовані медіа файли в urls.py
python3 manage.py shell -c "
from django.conf import settings
print(f'MEDIA_URL: {settings.MEDIA_URL}')
print(f'MEDIA_ROOT: {settings.MEDIA_ROOT}')
"

# 2. Перевірте чи існує файл договору
python3 manage.py shell -c "
from payment.models import PaymentSettings
settings = PaymentSettings.get_settings()
print(f'Contract file: {settings.default_contract_file}')
print(f'File exists: {settings.default_contract_file and settings.default_contract_file.name}')
"

# 3. Тестуйте URL
curl -I http://localhost:8001/media/contracts/default/filename.pdf
```

### 2. **Кнопка оплати перекидає назад**

**Симптоми:** Після натискання "Оплатити карткою" повертає на ту ж сторінку

**Можливі причини:**

#### A. Дуже велика сума платежу
```bash
# Перевірте суму платежу
python3 manage.py shell -c "
from payment.models import PaymentLink
payment = PaymentLink.objects.latest('created_at')
print(f'UAH amount: {payment.final_amount_uah}')
print(f'Kopecks: {int(payment.final_amount_uah * 100)}')
# Monobank має ліміти на суму платежу
"
```

**Рішення:** Створіть тестовий платіж з меншою сумою (наприклад, 100-1000 грн)

#### B. Проблеми з Monobank API
```bash
# Тестуйте Monobank API
python3 manage.py shell -c "
from payment.models import PaymentLink
from payment.monobank_service import MonobankAcquiringService

# Створіть тестовий платіж
test_payment = PaymentLink.objects.create(
    client_name='Тест API',
    client_email='test@example.com',
    amount_usd=10.00,
    exchange_rate_usd_to_uah=41.50,
    description='Тест Monobank API'
)

# Тестуйте API
service = MonobankAcquiringService()
result = service.create_invoice(test_payment)
print(f'API Result: {result is not None}')
"
```

#### C. Неправильні налаштування
```bash
# Перевірте налаштування
python3 manage.py shell -c "
from django.conf import settings
print(f'MONOBANK_TOKEN set: {bool(getattr(settings, \"MONOBANK_TOKEN\", None))}')
print(f'SITE_URL: {getattr(settings, \"SITE_URL\", \"Not set\")}')
print(f'DEBUG: {settings.DEBUG}')
"
```

### 3. **CSRF помилки**

**Симптоми:** 403 Forbidden CSRF verification failed

**Рішення:** Переконайтесь що:
- У формі є `{% csrf_token %}`
- Cookies увімкнені в браузері
- Сторінка завантажується через GET перед POST

### 4. **Логи для діагностики**

```bash
# Дивіться логи в реальному часі
tail -f logs/prometei.log

# Перевірте останні помилки
grep -i error logs/prometei.log | tail -10

# Перевірте Monobank запити
grep -i monobank logs/prometei.log | tail -10
```

## ✅ **Швидкі тести**

### Тест медіа файлів
```bash
curl -I http://localhost:8001/media/contracts/default/FILENAME.pdf
# Має повернути 200 OK
```

### Тест сторінки оплати
```bash
curl -s http://localhost:8001/payment/pay/UUID/ | grep -i "договір"
# Має знайти секцію з договором
```

### Тест створення платежу
```python
from payment.models import PaymentLink
payment = PaymentLink.objects.create(
    client_name='Тест',
    amount_usd=10.00,
    exchange_rate_usd_to_uah=41.50,
    description='Тестовий платіж'
)
print(f'URL: http://localhost:8001{payment.get_absolute_url()}')
```

## 🚨 **Поширені помилки**

1. **Сума > 1,000,000 копійок** - Monobank відхиляє
2. **SITE_URL не відповідає порту** - Перенаправлення не працює  
3. **Медіа файли не налаштовані** - 404 на договір
4. **Токен Monobank недійсний** - API помилки

## 📞 **Контакти для підтримки**

- Документація Monobank: https://monobank.ua/api-docs/acquiring/
- Логи Django: `logs/prometei.log`
- Тестування API: `/payment/test/monobank-api/` 