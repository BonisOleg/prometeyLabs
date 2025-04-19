from django.urls import path
from . import views # Передбачаємо, що представлення (views) будуть тут

app_name = 'prometei' # Додаємо неймспейс для уникнення конфліктів імен URL

urlpatterns = [
    # Тут будуть наші URL-шаблони
    # Наприклад:
    # path('', views.home, name='home'),
    # path('about/', views.about, name='about'),
    # ... і так далі для інших сторінок
] 