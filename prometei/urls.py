from django.urls import path
from .views import (
    HomePageView,
    AboutPageView,
    ServicesPageView,
    BuilderPageView,
    ContactPageView,
    ProminPageView,
    PrivacyPolicyView,
    TermsOfUseView,
    builder_request_view
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
    path('builder/request/', builder_request_view, name='builder_request'),
    
    # Контакти
    path('contact/', ContactPageView.as_view(), name='contact'),
    
    # Promin
    path('promin/', ProminPageView.as_view(), name='promin'),

    # Юридичні сторінки
    path('privacy/', PrivacyPolicyView.as_view(), name='privacy_policy'),
    path('terms/', TermsOfUseView.as_view(), name='terms_of_use'),
] 