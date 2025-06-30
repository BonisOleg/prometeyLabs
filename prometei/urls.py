from django.urls import path
from .views import (
    HomePageView,
    AboutPageView,
    ServicesPageView,
    BuilderPageView,
    ContactPageView,
    ProminPageView,
    DreamSitePageView,
    CoursePageView,
    PrivacyPolicyView,
    TermsOfUseView,
    builder_request_view,
    # Landing page views
    LandingPageView,
    landing_track_view,
    landing_interaction_view,
    landing_submit_form_view,
    landing_generate_link_view,
    # New API endpoints for automated landing page creation
    api_create_landing_page,
    api_update_landing_page,
    api_generate_new_link,
    api_change_landing_page_status,
    api_list_landing_pages,
    api_create_landing_page_from_template,
    api_list_landing_page_templates,
    # New PROmin landing page view
    ProminLandingPageView
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
    path('promin/landing/', ProminLandingPageView.as_view(), name='promin_landing'),
    
    # Dream Site
    path('dream-site/', DreamSitePageView.as_view(), name='dream_site'),
    
    # Course Landing
    path('course/', CoursePageView.as_view(), name='course'),

    # Юридичні сторінки
    path('privacy_policy/', PrivacyPolicyView.as_view(), name='privacy_policy'),
    path('terms_of_use/', TermsOfUseView.as_view(), name='terms_of_use'),
    
    # Landing Pages
    path('landing/<slug:slug>/', LandingPageView.as_view(), name='landing_page'),
    path('landing/track/', landing_track_view, name='landing_track'),
    path('landing/interaction/', landing_interaction_view, name='landing_interaction'),
    path('landing/submit-form/', landing_submit_form_view, name='landing_submit_form'),
    path('landing/generate-link/<int:landing_id>/', landing_generate_link_view, name='landing_generate_link'),
    
    # API endpoints for automated landing page creation
    path('api/landing-pages/', api_list_landing_pages, name='api_list_landing_pages'),
    path('api/landing-pages/create/', api_create_landing_page, name='api_create_landing_page'),
    path('api/landing-pages/<int:landing_page_id>/update/', api_update_landing_page, name='api_update_landing_page'),
    path('api/landing-pages/<int:landing_page_id>/generate-link/', api_generate_new_link, name='api_generate_new_link'),
    path('api/landing-pages/<int:landing_page_id>/status/', api_change_landing_page_status, name='api_change_landing_page_status'),
    path('api/landing-page-templates/', api_list_landing_page_templates, name='api_list_landing_page_templates'),
    path('api/landing-page-templates/create-page/', api_create_landing_page_from_template, name='api_create_landing_page_from_template'),
] 