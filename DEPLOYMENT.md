# Інструкції для деплою PrometeyLabs

## 🚀 Готовність до деплою

Проект повністю підготовлений до деплою з наступними покращеннями безпеки:

### ✅ Що було зроблено:
- 🔒 Видалено всі hardcoded токени з коду та історії Git
- 🔧 Налаштовано читання всіх секретів зі змінних середовища
- 📋 Створено документацію з безпеки (SECURITY.md)
- 🛡️ Оновлено .gitignore для кращого захисту
- ⚙️ Виправлено сумісність Django з Python 3.9

### 🌍 Налаштування для продакшену (Render.com):

#### Environment Variables які потрібно додати:
```
SECRET_KEY=новий-згенерований-секретний-ключ
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
MONOBANK_TOKEN=новий-токен-з-monobank
EMAIL_HOST_USER=ваш-email@gmail.com
EMAIL_HOST_PASSWORD=пароль-додатку-gmail
SITE_URL=https://yourdomain.com
DEFAULT_FROM_EMAIL=PrometeyLabs <info@prometeylabs.com>
CONTACT_EMAIL=info@prometeylabs.com
RENDER_EXTERNAL_HOSTNAME=ваш-домен.onrender.com
```

#### Важливі зауваження:
1. **Новий Monobank токен**: Старий токен був скомпрометований і видалений
2. **SECRET_KEY**: Згенеруйте новий за допомогою Django utils
3. **DEBUG**: Обов'язково False на продакшені
4. **Database**: Render автоматично надасть PostgreSQL URL

### 🔧 Локальна розробка:
1. Скопіюйте `env.example` до `.env`
2. Заповніть реальними значеннями
3. Запустіть: `python manage.py runserver 8001`

### 📋 Чек-лист перед деплоєм:
- [ ] Всі Environment Variables додані в Render
- [ ] Новий Monobank токен отриманий
- [ ] DEBUG=False на продакшені
- [ ] Домен налаштований правильно
- [ ] SSL сертифікат активний

## 🎯 Проект готовий до деплою! 