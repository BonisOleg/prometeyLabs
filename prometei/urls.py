from django.urls import path
from .views import (
    HomePageView,
    AboutPageView,
    ServicesPageView,
    BuilderPageView,
    ContactPageView,
)

app_name = 'prometei' # Додаємо неймспейс для уникнення конфліктів імен URL

urlpatterns = [
    # Головна сторінка
    path('', HomePageView.as_view(), name='home'),
    
    # Про нас
    path('about/', AboutPageView.as_view(), name='about'),
    
    # Послуги
    path('services/', ServicesPageView.as_view(), name='services'),
    
    # Конструктор
    path('builder/', BuilderPageView.as_view(), name='builder'),
    
    # Контакти
    path('contact/', ContactPageView.as_view(), name='contact'),
] 