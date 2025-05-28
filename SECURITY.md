# Безпека проекту

## Критичні виправлення

У проекті були виявлені та виправлені наступні проблеми безпеки:

### 1. Відкриті токени Monobank
- **Проблема**: Токен `***REMOVED***` був жорстко прописаний у коді
- **Виправлення**: Замінено на читання зі змінних середовища
- **Файли**: `config/settings.py`, `prometeylabs-payment/myproject/myproject/settings.py`

### 2. Відкритий SECRET_KEY
- **Проблема**: Django SECRET_KEY був жорстко прописаний у коді
- **Виправлення**: Замінено на читання зі змінних середовища
- **Файли**: `prometeylabs-payment/myproject/myproject/settings.py`

## Рекомендації по безпеці

### Змінні середовища
Всі секретні ключі та токени мають зберігатися в змінних середовища:

```bash
# .env файл (НЕ додавайте до Git!)
SECRET_KEY=your-unique-secret-key
MONOBANK_TOKEN=your-real-monobank-token
EMAIL_HOST_PASSWORD=your-email-password
```

### Для продакшену
1. **Render.com**: Додайте змінні в Environment Variables
2. **Heroku**: Використовуйте `heroku config:set KEY=value`
3. **VPS**: Експортуйте змінні в `.bashrc` або використовуйте systemd

### Генерація SECRET_KEY
Для генерації нового Django SECRET_KEY:

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### Перевірка безпеки
Регулярно перевіряйте код на предмет відкритих секретів:

```bash
# Пошук потенційних токенів
grep -r "token\|secret\|password\|key" --include="*.py" .
```

## Що НЕ треба робити

❌ **Ніколи не робіть так:**
```python
SECRET_KEY = 'django-insecure-hardcoded-key'
MONOBANK_TOKEN = 'hardcoded-token'
```

✅ **Правильно:**
```python
SECRET_KEY = os.environ.get('SECRET_KEY')
MONOBANK_TOKEN = os.environ.get('MONOBANK_TOKEN')
```

## Контрольний список безпеки

- [ ] Всі секретні ключі винесені в змінні середовища
- [ ] `.env` файл додано до `.gitignore`
- [ ] Створено `env.example` з прикладами
- [ ] DEBUG=False на продакшені
- [ ] ALLOWED_HOSTS налаштовано правильно
- [ ] База даних використовує безпечні паролі
- [ ] SSL/HTTPS увімкнено на продакшені

## Звітування про проблеми безпеки

Якщо знайшли проблему безпеки, зверніться до адміністратора проекту приватно. 