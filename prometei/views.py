import json
import logging
import uuid # Added from flawless, though not directly used in the final version of views below
from datetime import timedelta # Added from flawless
# from datetime import datetime # datetime from datetime was in flawless, but timezone.now is used

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import transaction
from django.http import JsonResponse, HttpResponse, Http404, HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import render, get_object_or_404, redirect # Added redirect
from django.template.loader import render_to_string, TemplateDoesNotExist
from django.urls import reverse as django_reverse, reverse_lazy # Added reverse_lazy
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.decorators import method_decorator
from django.utils.html import strip_tags, escape
from django.utils.translation import gettext as _ # Add missing translation function
from django.views import View
from django.views.generic import TemplateView, FormView # Added for existing views
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie, csrf_exempt
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib import messages
from django.views.decorators.http import require_POST, require_GET # Added for existing views
from django.views.decorators.cache import never_cache # Added for existing/new views
from django.middleware.csrf import get_token # Added for existing LP view logic
from django.contrib.auth.decorators import user_passes_test # Added user_passes_test

import bleach # Already present
from user_agents import parse as ua_parse # Already present

from .models import (
    LandingPage,
    LandingPageVisit,
    LandingPageInteraction,
    ContactRequest,
    LandingPageTemplate
)
from .email_service import EmailService
from .forms import ContactForm, BuilderRequestForm, ProminRequestForm # Existing forms
from .landing_page_generator import (
    create_landing_page, 
    update_landing_page,
    generate_new_link,
    deactivate_landing_page,
    activate_landing_page,
    find_landing_pages
)

logger = logging.getLogger(__name__)

# --- Constants (from flawless implementation) ---
TRACKING_DATA_MAX_LENGTH = getattr(settings, 'LANDING_PAGE_TRACKING_DATA_MAX_LENGTH', 2048)
METADATA_MAX_LENGTH = getattr(settings, 'LANDING_PAGE_METADATA_MAX_LENGTH', 1024)
RATE_LIMIT_SUBMIT_LP = getattr(settings, 'LANDING_PAGE_RATE_LIMIT_SUBMIT', '5/minute') # Renamed to avoid clash
RATE_LIMIT_TRACK_LP = getattr(settings, 'LANDING_PAGE_RATE_LIMIT_TRACK', '100/minute') # Renamed
RATE_LIMIT_INTERACT_LP = getattr(settings, 'LANDING_PAGE_RATE_LIMIT_INTERACT', '200/minute') # Renamed
RATE_LIMIT_VIEW_LP = getattr(settings, 'LANDING_PAGE_RATE_LIMIT_VIEW', '60/minute') # Renamed
VALID_INTERACTION_TYPES = [item[0] for item in LandingPageInteraction.INTERACTION_TYPES]


# --- Custom Exception (from flawless implementation) ---
class RateLimitExceeded(Exception): # Already present in existing code, but used by flawless
    pass

# --- Helper Functions (from flawless implementation, adapted) ---
def get_client_ip(request): # Already present, ensure it's robust
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '') # Ensure default for safety
    return ip

def check_rate_limit_flawless(request, key_prefix: str, limit_str: str): # Renamed from check_rate_limit to avoid conflict
    try:
        limit, period_name = limit_str.split('/')
        limit = int(limit)
        if period_name == 'second': period_seconds = 1
        elif period_name == 'minute': period_seconds = 60
        elif period_name == 'hour': period_seconds = 3600
        elif period_name == 'day': period_seconds = 86400
        else:
            logger.warning(f"Invalid rate limit period name: {period_name} in {limit_str}")
            return True # Fail open if misconfigured
    except ValueError:
        logger.error(f"Invalid rate limit string format: {limit_str}")
        return True # Fail open

    ip = get_client_ip(request)
    cache_key = f"rl::{key_prefix}::{ip}"
    count = cache.get(cache_key, 0)

    if count >= limit:
        logger.warning(f"Rate limit exceeded for {key_prefix} by IP {ip}. Limit: {limit_str}, Count: {count}")
        raise RateLimitExceeded(f"Rate limit for {key_prefix} exceeded.")

    if count == 0:
        cache.set(cache_key, 1, timeout=period_seconds)
    else:
        cache.incr(cache_key)
    return True

# --- Existing Views (Keep them) ---
class HomePageView(TemplateView):
    template_name = 'prometei/home.html'

class AboutPageView(TemplateView):
    template_name = 'prometei/about.html'

class ServicesPageView(TemplateView):
    template_name = 'prometei/services.html'

class BuilderPageView(TemplateView):
    template_name = 'prometei/builder.html'

class PrivacyPolicyView(TemplateView):
    template_name = 'prometei/privacy_policy.html'

class TermsOfUseView(TemplateView):
    template_name = 'prometei/terms_of_use.html'

# --- Add ProminLandingPageView ---
class ProminLandingPageView(TemplateView):
    template_name = 'prometei/promin_landing.html'
    
    def dispatch(self, request, *args, **kwargs):
        # Only allow this page for Ukrainian language
        if request.LANGUAGE_CODE != 'uk':
            return redirect('prometei:home')
        return super().dispatch(request, *args, **kwargs)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context

class ContactPageView(FormView):
    template_name = 'prometei/contact.html'
    form_class = ContactForm
    success_url = reverse_lazy('prometei:contact')

    def post(self, request, *args, **kwargs):
        # raise Exception("ContactPageView POST method was CALLED! THIS IS A TEST EXCEPTION.") # ВИДАЛЕНО
        
        logger.info("="*50)
        logger.info("ContactPageView POST method CALLED") 
        
        # КЛЮЧОВИЙ РЯДОК ЛОГУВАННЯ:
        logger.info(f"Contact POST headers from promin_landing: {request.headers}") 
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            print("AJAX request DETECTED by X-Requested-With header.") 
            logger.info("AJAX request identified by ContactPageView for promin_landing.")
            try:
                data = json.loads(request.body)
                form = self.get_form_class()(data) # Використовуємо ContactForm
                if form.is_valid():
                    # Логіка form_valid має повертати JsonResponse для AJAX
                    return self.form_valid(form)
                else:
                    logger.warning(f"AJAX form invalid in ContactPageView (promin_landing): {form.errors.as_json()}")
                    return JsonResponse({
                        'success': False,
                        'message': _("Будь ласка, перевірте введені дані."),
                        'errors': form.errors
                    }, status=400) # Додамо статус 400 для невалідних даних
            except json.JSONDecodeError:
                logger.error("AJAX: JSONDecodeError in ContactPageView (promin_landing)")
                return JsonResponse({'success': False, 'message': _("Помилка формату запиту.")}, status=400)
            except Exception as e:
                 logger.error(f"AJAX: Unexpected error in ContactPageView POST (promin_landing): {str(e)}")
                 return JsonResponse({'success': False, 'message': _("Внутрішня помилка сервера.")}, status=500)
        else:
            print("Request NOT detected as AJAX by X-Requested-With header.") 
            logger.warning("Request NOT identified as AJAX by ContactPageView (promin_landing). Falling back to standard POST.")
            return super().post(request, *args, **kwargs) # Стандартна обробка FormView
        print("="*50) # Цей print може не досягатися, якщо return відбувається раніше

    def form_valid(self, form):
        is_ajax = self.request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        
        try:
            contact_request = form.save()
            if is_ajax:
                logger.info(f"AJAX: ContactRequest ID {contact_request.id} saved via promin_landing form.")
            else:
                logger.info(f"ContactRequest ID {contact_request.id} saved (non-AJAX).")
            
            EmailService.send_contact_email(contact_request)
            EmailService.send_confirmation_to_user(contact_request)
            
            if is_ajax:
                return JsonResponse({
                    'success': True,
                    'message': _("Дякуємо за ваше повідомлення! Ми зв\'яжемося з вами найближчим часом.")
                })
            else: 
                messages.success(
                    self.request,
                    _("Дякуємо за ваше повідомлення! Ми зв\'яжемося з вами найближчим часом.")
                )
            return super().form_valid(form)

        except Exception as e:
            logger.error(f"Error in form_valid (ContactPageView, promin_landing, is_ajax={is_ajax}): {str(e)}")
            if is_ajax:
                return JsonResponse({
                    'success': False,
                    'message': _("Виникла помилка при відправці повідомлення. Спробуйте пізніше.")
                }, status=500)
            else:
                messages.error(
                self.request,
                _("Виникла помилка при відправці повідомлення. Спробуйте пізніше або зв'яжіться з нами по телефону.")
            )
            return self.form_invalid(form)

    def form_invalid(self, form):
        is_ajax = self.request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        if is_ajax:
            logger.warning(f"AJAX: form_invalid in ContactPageView for promin_landing. Errors: {form.errors.as_json()}")
            return JsonResponse({
                'success': False,
                'message': _("Будь ласка, перевірте введені дані. (from form_invalid)"),
                'errors': form.errors
            }, status=400)
        
        logger.warning(f"Non-AJAX form_invalid (ContactPageView, promin_landing): {form.errors}")
        return super().form_invalid(form)

class ProminPageView(FormView):
    template_name = 'prometei/promin.html'
    form_class = ProminRequestForm
    success_url = reverse_lazy('prometei:promin')

    def post(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                data = json.loads(request.body)
                form = self.get_form_class()(data)
                if form.is_valid():
                    return self.form_valid(form)
                else:
                    logger.warning(f"AJAX: Отримано невалідну форму Promin з помилками: {form.errors.as_json()}")
                    return JsonResponse({
                        'success': False,
                        'message': _("Будь ласка, перевірте введені дані."),
                        'errors': form.errors
                    })
            except json.JSONDecodeError:
                logger.error("AJAX: Не вдалося розпарсити JSON з тіла запиту (Promin)")
                return JsonResponse({'success': False, 'message': _("Помилка формату запиту.")}, status=400)
            except Exception as e:
                 logger.error(f"AJAX: Непередбачена помилка при обробці POST (Promin): {str(e)}")
                 return JsonResponse({'success': False, 'message': _("Внутрішня помилка сервера.")}, status=500)
        else:
            return super().post(request, *args, **kwargs)

    def form_valid(self, form):
        try:
            contact_request = form.save()
            logger.info(f"Створено нову заявку Promin ID: {contact_request.id}")
            EmailService.send_contact_email(contact_request)
            EmailService.send_confirmation_to_user(contact_request)
            messages.success(
                self.request,
                _("Дякуємо за вашу заявку! Ми розглянемо її та зв'яжемося з вами найближчим часом.")
            )
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': _("Дякуємо за вашу заявку! Ми розглянемо її та зв'яжемося з вами найближчим часом.")
                })
            return super().form_valid(form)
        except Exception as e:
            logger.error(f"Помилка при обробці форми Promin: {str(e)}")
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': _("Виникла помилка при відправці заявки. Спробуйте пізніше або зв'яжіться з нами по телефону.")
                })
            messages.error(
                self.request,
                _("Виникла помилка при відправці заявки. Спробуйте пізніше або зв'яжіться з нами по телефону.")
            )
            return self.form_invalid(form)

    def form_invalid(self, form):
        logger.warning(f"Отримано невалідну форму Promin (не-AJAX або помилка після валідації): {form.errors}")
        return super().form_invalid(form)


class DreamSitePageView(TemplateView):
    template_name = 'prometei/dream_site.html'
    
    def post(self, request, *args, **kwargs):
        logger.info("DreamSitePageView POST method called")
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            logger.info("AJAX request detected for dream_site")
            try:
                data = json.loads(request.body)
                form = ContactForm(data)
                form.instance.request_type = 'dream_site'
                
                if form.is_valid():
                    contact_request = form.save()
                    logger.info(f"AJAX: ContactRequest ID {contact_request.id} saved via dream_site form.")
                    
                    EmailService.send_contact_email(contact_request)
                    EmailService.send_confirmation_to_user(contact_request)
                    
                    return JsonResponse({
                        'success': True,
                        'message': _("Дякуємо за ваш запит! Ми зв'яжемося з вами протягом доби.")
                    })
                else:
                    logger.warning(f"AJAX form invalid in DreamSitePageView: {form.errors.as_json()}")
                    return JsonResponse({
                        'success': False,
                        'message': _("Будь ласка, перевірте введені дані."),
                        'errors': form.errors
                    }, status=400)
            except json.JSONDecodeError:
                logger.error("AJAX: JSONDecodeError in DreamSitePageView")
                return JsonResponse({'success': False, 'message': _("Помилка формату запиту.")}, status=400)
            except Exception as e:
                logger.error(f"AJAX: Unexpected error in DreamSitePageView POST: {str(e)}")
                return JsonResponse({'success': False, 'message': _("Внутрішня помилка сервера.")}, status=500)
        else:
            return super().get(request, *args, **kwargs)


def builder_request_view(request):
    if request.method != "POST":
        return redirect('prometei:builder')
    try:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            data = json.loads(request.body)
            form = BuilderRequestForm(data)
            if form.is_valid():
                contact_request = form.save()
                logger.info(f"Створено новий запит з конструктора ID: {contact_request.id}")
                EmailService.send_contact_email(contact_request)
                EmailService.send_confirmation_to_user(contact_request)
                return JsonResponse({
                    'success': True,
                    'message': _("Дякуємо за ваш запит! Ми зв'яжемося з вами найближчим часом для уточнення деталей.")
                })
            else:
                logger.warning(f"Отримано невалідну форму будівельника з помилками: {form.errors}")
                return JsonResponse({
                    'success': False,
                    'message': _("Будь ласка, виправте помилки у формі."),
                    'errors': form.errors
                })
        else:
            form = BuilderRequestForm(request.POST)
            if form.is_valid():
                contact_request = form.save()
                logger.info(f"Створено новий запит з конструктора ID: {contact_request.id}")
                EmailService.send_contact_email(contact_request)
                EmailService.send_confirmation_to_user(contact_request)
                messages.success(
                    request,
                    _("Дякуємо за ваш запит! Ми зв'яжемося з вами найближчим часом для уточнення деталей.")
                )
                return redirect('prometei:builder')
            else:
                logger.warning(f"Отримано невалідну форму будівельника з помилками: {form.errors}")
                messages.error(
                    request,
                    _("Будь ласка, виправте помилки у формі.")
                )
                return render(request, 'prometei/builder.html', {'form': form})
    except Exception as e:
        logger.error(f"Помилка при обробці запиту будівельника: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': _("Виникла помилка при відправці запиту. Спробуйте пізніше або зв'яжіться з нами по телефону.")
            })
        messages.error(
            request,
            _("Виникла помилка при відправці запиту. Спробуйте пізніше або зв'яжіться з нами по телефону.")
        )
        return redirect('prometei:builder')


# --- Landing Page Views (from flawless implementation, adapted) ---

# Note: The existing LandingPageView in the attached file seems to be an older version or
# a different attempt. The one from "flawless implementation" is more detailed.
# I will use the "flawless" version and integrate RateLimitExceeded and get_client_ip.
# The `slug` argument in the original flawless `LandingPageView` was `unique_link_id`.
# I'll assume the model's `unique_link_id` field is what's used in the URL pattern as `unique_link_id` kwarg.
# The existing file has `slug` in `LandingPageView` and `landing_generate_link_view` has `landing_id`.
# The flawless models use `unique_link_id` (UUID field) and `slug` (SlugField).
# The URL `landing_page/<uuid:unique_link_id>/` in `urls.py` means `unique_link_id` is the kwarg.
# I'll use `unique_link_id` as the view argument to match the URL and flawless models.

@method_decorator(ensure_csrf_cookie, name='dispatch')
@method_decorator(never_cache, name='dispatch')
class LandingPageView(View):
    def get(self, request, slug): # Changed from unique_link_id to slug
        try:
            check_rate_limit_flawless(request, f"lp_view:{slug}", RATE_LIMIT_VIEW_LP)
        except RateLimitExceeded:
            logger.warning(f"Rate limit for LP view exceeded for IP {get_client_ip(request)} on slug {slug}")
            return HttpResponseForbidden("Rate limit exceeded.")

        try:
            # Using slug field instead of unique_link_id
            landing_page = get_object_or_404(LandingPage, slug=slug, is_active=True)
        except Http404:
            logger.warning(f"Active landing page with slug {slug} not found.")
            return HttpResponse("Page not found or is inactive.", status=404)

        ip_address = get_client_ip(request)
        user_agent_str = request.META.get('HTTP_USER_AGENT', '')
        user_agent_parsed = ua_parse(user_agent_str)

        with transaction.atomic():
            visit = LandingPageVisit.objects.create(
                landing_page=landing_page,
                ip_address=ip_address,
                user_agent=user_agent_str[:255],
                referrer=request.META.get('HTTP_REFERER', '')[:2048],
                meta_data={
                    'browser': user_agent_parsed.browser.family[:100],
                    'os': user_agent_parsed.os.family[:100],
                    'device': user_agent_parsed.device.family[:100]
                }
            )

        tracking_context = {
            'landing_page_id': landing_page.id,
            'slug': landing_page.slug, # Using slug instead of unique_link_id
            'visit_id': visit.id,
            'google_pixel_id': landing_page.google_pixel_id,
            'meta_pixel_id': landing_page.facebook_pixel_id, # Use the correct field from model
            'track_url': django_reverse('prometei:landing_track'),
            'interaction_url': django_reverse('prometei:landing_interaction'),
            'form_submit_url': django_reverse('prometei:landing_submit_form'),
        }

        try:
            pixel_scripts = render_to_string('prometei/landing_partials/_tracking_pixels.html', tracking_context)
            pixel_noscript = render_to_string('prometei/landing_partials/_tracking_noscript.html', tracking_context)
            main_tracking_script_content = render_to_string('prometei/landing_partials/_tracking_main_script.html', tracking_context)
        except TemplateDoesNotExist as e:
            logger.error(f"Tracking template missing: {e}")
            return HttpResponse("Server configuration error: Essential tracking components missing.", status=500)

        meta_robots_tag = f'<meta name="robots" content="{escape(landing_page.meta_robots)}">'
        html_content = landing_page.html_content

        # Inject meta_robots and pixel_scripts into <head>
        if '</head>' in html_content.lower():
            html_content = html_content.replace('</head>', f'{meta_robots_tag}\n{pixel_scripts}\n</head>', 1)
        else:
            html_content = f'<head>\n{meta_robots_tag}\n{pixel_scripts}\n</head>\n{html_content}'

        # Inject pixel_noscript after <body> and main_tracking_script before </body>
        body_tag_present = '<body>' in html_content.lower()
        body_closing_tag_present = '</body>' in html_content.lower()

        if body_closing_tag_present:
            html_content = html_content.replace('</body>', f'{main_tracking_script_content}\n</body>', 1)
            if body_tag_present:
                 html_content = html_content.replace('<body>', f'<body>\n{pixel_noscript}', 1)
            else:
                 html_content = pixel_noscript + html_content
        elif body_tag_present:
            html_content = html_content.replace('<body>', f'<body>\n{pixel_noscript}', 1) + f'\n{main_tracking_script_content}'
        else:
            html_content = f'<body>\n{pixel_noscript}\n{html_content}\n{main_tracking_script_content}\n</body>'

        response = HttpResponse(html_content)
        response['X-Frame-Options'] = 'DENY'
        response['X-Content-Type-Options'] = 'nosniff'
        csp_policy_parts = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://www.facebook.com https://google.com https://*.google.com https://*.google.com.ua",
            "frame-src 'self' https://www.facebook.com https://google.com",
            "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net https://www.facebook.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]

        response['Content-Security-Policy'] = "; ".join(csp_policy_parts) + ";"
        return response

@csrf_protect
@require_POST
@never_cache
def landing_track_view(request):
    try:
        data = json.loads(request.body)
        visit_id = data.get('visit_id')
        time_on_page_seconds = data.get('time_on_page')

        if not visit_id:
            return JsonResponse({'status': 'error', 'message': 'Missing visit_id.'}, status=400)

        # Ensure the visit exists
        try:
            visit = LandingPageVisit.objects.get(id=visit_id)
        except LandingPageVisit.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Visit not found.'}, status=404)

        # Rate limit per IP for access to this endpoint
        try:
            check_rate_limit_flawless(request, f"lp_track:{visit.landing_page.slug}", RATE_LIMIT_TRACK_LP)
        except RateLimitExceeded:
            return JsonResponse({'status': 'error', 'message': 'Rate limit exceeded.'}, status=429)

        if time_on_page_seconds is not None:
            try:
                visit.time_spent = int(time_on_page_seconds)
            except (ValueError, TypeError):
                logger.warning(f"Invalid time_on_page value: {time_on_page_seconds} for visit {visit_id}")

        # Handle 'metadata' from client
        raw_additional_data = data.get('metadata', {})
        clean_additional_data = {}
        if isinstance(raw_additional_data, dict):
            for k, v in raw_additional_data.items():
                clean_key = bleach.clean(str(k)[:50])
                if isinstance(v, (str, int, float, bool)):
                    clean_value = bleach.clean(str(v)[:200])
                elif isinstance(v, list):
                    clean_value = [bleach.clean(str(i)[:100]) for i in v[:20]]
                elif isinstance(v, dict):
                    clean_value = {bleach.clean(str(sk)[:50]): bleach.clean(str(sv)[:100]) for sk, sv in v.items()}
                else:
                    clean_value = "Unsupported data type"
                clean_additional_data[clean_key] = clean_value

        # Process mouse movements and scroll positions
        if 'mouse_movements' in clean_additional_data or 'scroll_positions' in clean_additional_data:
            visit.path_data = {
                'mouse_movements': clean_additional_data.pop('mouse_movements', [])[:200],
                'scroll_positions': clean_additional_data.pop('scroll_positions', [])[:200]
            }
        
        # Process remaining metadata
        meta_json_string = json.dumps(clean_additional_data)
        if len(meta_json_string) > METADATA_MAX_LENGTH:
            logger.warning(f"Additional metadata for visit {visit_id} too large. Truncating.")
            meta_json_string = meta_json_string[:METADATA_MAX_LENGTH -3] + "..."

        visit.meta_data = json.loads(meta_json_string)

        visit.save()
        return JsonResponse({'status': 'success'})

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON.'}, status=400)
    except Exception as e:
        logger.error(f"Error in landing_track_view: {e}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': 'Server error.'}, status=500)


@csrf_protect
@require_POST
@never_cache
def landing_interaction_view(request):
    try:
        data = json.loads(request.body)
        visit_id = data.get('visit_id')
        interaction_type = data.get('type')  # 'type' from client JS
        element_id = data.get('element_id')
        element_tag = data.get('element_tag')  # Maps to element_type in model
        
        if not all([visit_id, interaction_type]):  # element_id or tag might be optional
            return JsonResponse({'status': 'error', 'message': 'Missing required interaction data (visit_id, type).'}, status=400)

        # Check if visit exists
        try:
            visit = LandingPageVisit.objects.get(id=visit_id)
        except LandingPageVisit.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Visit not found.'}, status=404)

        # Rate limit per IP for this landing page's interactions
        try:
            check_rate_limit_flawless(request, f"lp_interact:{visit.landing_page.slug}", RATE_LIMIT_INTERACT_LP)
        except RateLimitExceeded:
            return JsonResponse({'status': 'error', 'message': 'Rate limit exceeded.'}, status=429)

        # Validate interaction type
        if interaction_type not in VALID_INTERACTION_TYPES:
            logger.warning(f"Invalid interaction type: {interaction_type} for visit {visit_id}. Defaulting to 'click'.")
            interaction_type = 'click'  # Default to click for invalid types

        # Sanitize inputs
        clean_element_id = bleach.clean(str(element_id)[:150]) if element_id else None
        clean_element_tag = bleach.clean(str(element_tag)[:50]) if element_tag else None

        # Create the interaction record - using correct field name 'interaction_type'
        LandingPageInteraction.objects.create(
            visit=visit,
            interaction_type=interaction_type,  # Using correct field name in model
            element_id=clean_element_id,
            element_type=clean_element_tag  # Maps to element_type in model
        )
        
        return JsonResponse({'status': 'success'})

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON.'}, status=400)
    except Exception as e:
        logger.error(f"Error in landing_interaction_view: {e}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': 'Server error.'}, status=500)

@csrf_protect
@transaction.atomic
@require_POST
@never_cache
def landing_submit_form_view(request):
    try:
        form_data = json.loads(request.body)
        landing_page_id = form_data.get('landing_page_id')
        
        if not landing_page_id:
            return JsonResponse({'status': 'error', 'message': 'Missing landing_page_id'}, status=400)
        
        try:
            landing_page = LandingPage.objects.get(id=landing_page_id, is_active=True)
        except LandingPage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Landing page not found or inactive.'}, status=404)

        # Rate limit check
        try:
            check_rate_limit_flawless(request, f"lp_submit:{landing_page.slug}", RATE_LIMIT_SUBMIT_LP)
        except RateLimitExceeded:
            return JsonResponse({'status': 'error', 'message': 'Rate limit exceeded. Please try again later.'}, status=429)

        # Sanitize and validate form data
        name = bleach.clean(form_data.get('name', '')[:100])
        contact_info = bleach.clean(form_data.get('contact', '')[:100])  # 'contact' from client JS
        message_text = bleach.clean(form_data.get('message', '')[:2000])

        if not all([name, contact_info, message_text]):
            return JsonResponse({'status': 'error', 'message': 'All fields are required.', 'fields': {'name': not name, 'contact': not contact_info, 'message': not message_text}}, status=400)

        # Create a contact request entry
        full_message_for_contact_request = (
            f"Заявка зі спеціального лендінгу: '{landing_page.title}' (Slug: {landing_page.slug})\n"
            f"--------------------------------------------------\n"
            f"{message_text}"
        )
        contact_request_entry = ContactRequest.objects.create(
            name=name,
            contact_method=contact_info,
            message=full_message_for_contact_request,
            request_type='contact',
        )
        logger.info(f"Created ContactRequest ID {contact_request_entry.id} from LP {landing_page.slug}")

        # Log submission as an interaction if visit_id is provided
        visit_id = form_data.get('visit_id')
        if visit_id:
            try:
                visit = LandingPageVisit.objects.get(id=visit_id, landing_page=landing_page)
                LandingPageInteraction.objects.create(
                    visit=visit,
                    interaction_type='submit',
                    element_id=form_data.get('form_id', 'form'),
                    element_type='FORM'
                )
            except LandingPageVisit.DoesNotExist:
                logger.warning(f"Visit ID {visit_id} not found for form submission on LP {landing_page.slug}")
            except Exception as e_interaction:
                logger.error(f"Error creating form_submission interaction for LP {landing_page.slug}: {e_interaction}", exc_info=True)
        else:
            logger.warning(f"No visit_id provided for form submission on LP {landing_page.slug}")

        # Send email notification
        try:
            # Using EmailService for consistent email sending
            email_subject = f"Нова заявка з лендінгу: {landing_page.title}"
            # We pass the contact_request_entry directly to EmailService
            EmailService.send_contact_email(contact_request_entry)
            logger.info(f"Successfully sent form submission email for landing page {landing_page.slug}")
            return JsonResponse({'status': 'success', 'message': 'Ваше повідомлення успішно надіслано!'})
        except Exception as e_email:
            logger.error(f"Failed to send email for landing page {landing_page.slug} submission: {e_email}", exc_info=True)
            return JsonResponse({'status': 'error', 'message': 'Ваше повідомлення отримано, але виникла проблема з нашим сповіщенням. Ми зв\'яжемося з вами.'}, status=500)

    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data in request body.'}, status=400)
    except Exception as e:
        logger.error(f"Generic error in landing_submit_form_view: {e}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred. Please try again.'}, status=500)


@staff_member_required
@require_GET
def landing_generate_link_view(request, landing_id):
    """Admin view for generating a new link for a landing page."""
    try:
        landing_page = get_object_or_404(LandingPage, id=landing_id)
        old_slug = landing_page.slug
        new_url = landing_page.generate_new_link()  # Saves the instance
        
        logger.info(f"Admin user {request.user.username} generated new link for landing page {landing_id}. Old slug: {old_slug}, New slug: {landing_page.slug}")
        messages.success(request, _("Нове унікальне посилання (%(slug)s) успішно згенеровано. Старе посилання більше не активне.") % {'slug': landing_page.slug})
        
        return redirect('admin:prometei_landingpage_change', landing_id)
        
    except LandingPage.DoesNotExist:
        messages.error(request, _("Лендінг не знайдено."))
        return redirect('admin:prometei_landingpage_changelist')
    except Exception as e:
        logger.exception(f"Error generating new link: {str(e)}")
        messages.error(request, _("Помилка генерації нового посилання: %(error)s") % {'error': str(e)})
        return redirect('admin:prometei_landingpage_changelist')

# The existing landing_generate_link_view(request, landing_id) from the attached views.py
# seems to be for a button on a specific landing page's change form.
# The flawless `landing_generate_link_view` (which I've adapted above) is more like an admin action.
# If you need both, they should have different names or URL patterns.
# I'll keep the admin-action style one from flawless for now.
# If the per-page button is still needed:
# @staff_member_required
# @require_GET # Or POST if it modifies
# def landing_regenerate_specific_link_view(request, landing_page_id_int): # Use int for PK
#     try:
#         landing_page = get_object_or_404(LandingPage, id=landing_page_id_int)
#         old_slug = landing_page.unique_link_id # Assuming unique_link_id is the one to change
#         landing_page.generate_new_link(save_instance=True)
#         messages.success(request, _("Нове унікальне посилання (%(slug)s) успішно згенеровано.") % {'slug': landing_page.unique_link_id})
#         logger.info(f"Admin user {request.user.username} regenerated link for LP {landing_page_id_int}. Old: {old_slug}, New: {landing_page.unique_link_id}")
#         return redirect('admin:prometei_landingpage_change', object_id=landing_page.id)
#     except Http404:
#         messages.error(request, _("Лендінг не знайдено."))
#     except Exception as e:
#         messages.error(request, _("Помилка генерації: %(error)s") % {'error': str(e)})
#     return redirect('admin:prometei_landingpage_changelist')

@csrf_exempt
@user_passes_test(lambda u: u.is_staff)
def api_create_landing_page(request):
    """API endpoint to create a landing page programmatically."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Required fields
        title = data.get('title')
        html_content = data.get('html_content')
        
        if not title or not html_content:
            return JsonResponse(
                {'status': 'error', 'message': 'Missing required fields: title and html_content are required'}, 
                status=400
            )
        
        # Optional fields with defaults
        css_content = data.get('css_content', '')
        js_content = data.get('js_content', '')
        google_pixel_id = data.get('google_pixel_id', '')
        facebook_pixel_id = data.get('facebook_pixel_id', '')
        meta_robots = data.get('meta_robots', 'noindex, nofollow')
        is_active = data.get('is_active', True)
        
        # Create the landing page
        landing_page, url = create_landing_page(
            title=title,
            html_content=html_content,
            css_content=css_content,
            js_content=js_content,
            google_pixel_id=google_pixel_id,
            facebook_pixel_id=facebook_pixel_id,
            meta_robots=meta_robots,
            is_active=is_active
        )
        
        return JsonResponse({
            'status': 'success',
            'message': 'Landing page created successfully',
            'landing_page_id': landing_page.id,
            'title': landing_page.title,
            'url': url,
            'slug': landing_page.slug,
            'is_active': landing_page.is_active
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in api_create_landing_page: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
@user_passes_test(lambda u: u.is_staff)
def api_update_landing_page(request, landing_page_id):
    """API endpoint to update an existing landing page."""
    if request.method != 'PUT' and request.method != 'PATCH':
        return JsonResponse({'status': 'error', 'message': 'Only PUT or PATCH methods are allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Check if the landing page exists
        try:
            landing_page = LandingPage.objects.get(id=landing_page_id)
        except LandingPage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': f'Landing page with ID {landing_page_id} not found'}, status=404)
        
        # Update fields from data
        update_fields = {}
        allowed_fields = [
            'title', 'html_content', 'css_content', 'js_content', 
            'google_pixel_id', 'facebook_pixel_id', 'meta_robots', 'is_active'
        ]
        
        for field in allowed_fields:
            if field in data:
                update_fields[field] = data[field]
        
        if not update_fields:
            return JsonResponse({'status': 'error', 'message': 'No valid fields to update'}, status=400)
        
        # Update the landing page
        landing_page = update_landing_page(landing_page_id, **update_fields)
        
        return JsonResponse({
            'status': 'success',
            'message': 'Landing page updated successfully',
            'landing_page_id': landing_page.id,
            'title': landing_page.title,
            'url': landing_page.get_absolute_url(),
            'slug': landing_page.slug,
            'is_active': landing_page.is_active
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in api_update_landing_page: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
@user_passes_test(lambda u: u.is_staff)
def api_generate_new_link(request, landing_page_id):
    """API endpoint to generate a new link for a landing page."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)
    
    try:
        # Check if the landing page exists
        try:
            landing_page = LandingPage.objects.get(id=landing_page_id)
        except LandingPage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': f'Landing page with ID {landing_page_id} not found'}, status=404)
        
        # Generate new link
        url = generate_new_link(landing_page_id)
        
        return JsonResponse({
            'status': 'success',
            'message': 'New link generated successfully',
            'landing_page_id': landing_page.id,
            'title': landing_page.title,
            'url': url,
            'slug': landing_page.slug
        })
        
    except Exception as e:
        logger.error(f"Error in api_generate_new_link: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
@user_passes_test(lambda u: u.is_staff)
def api_change_landing_page_status(request, landing_page_id):
    """API endpoint to activate or deactivate a landing page."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        action = data.get('action')
        
        if action not in ['activate', 'deactivate']:
            return JsonResponse({'status': 'error', 'message': 'Invalid action, must be either "activate" or "deactivate"'}, status=400)
        
        # Check if the landing page exists
        try:
            landing_page = LandingPage.objects.get(id=landing_page_id)
        except LandingPage.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': f'Landing page with ID {landing_page_id} not found'}, status=404)
        
        # Activate or deactivate
        if action == 'activate':
            landing_page = activate_landing_page(landing_page_id)
            message = 'Landing page activated successfully'
        else:
            landing_page = deactivate_landing_page(landing_page_id)
            message = 'Landing page deactivated successfully'
        
        return JsonResponse({
            'status': 'success',
            'message': message,
            'landing_page_id': landing_page.id,
            'title': landing_page.title,
            'is_active': landing_page.is_active
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in api_change_landing_page_status: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@user_passes_test(lambda u: u.is_staff)
def api_list_landing_pages(request):
    """API endpoint to list landing pages with optional filtering."""
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'}, status=405)
    
    try:
        # Get query parameters
        search_query = request.GET.get('search', None)
        is_active_param = request.GET.get('is_active', None)
        
        # Convert is_active to boolean if provided
        is_active = None
        if is_active_param is not None:
            is_active = is_active_param.lower() in ['true', '1', 'yes']
        
        # Find landing pages
        landing_pages = find_landing_pages(search_query, is_active)
        
        # Prepare response data
        response_data = []
        for page in landing_pages:
            response_data.append({
                'id': page.id,
                'title': page.title,
                'slug': page.slug,
                'url': page.get_absolute_url(),
                'is_active': page.is_active,
                'created_at': page.created_at.isoformat(),
                'updated_at': page.updated_at.isoformat(),
                'visit_count': page.visits.count()
            })
        
        return JsonResponse({
            'status': 'success',
            'count': len(response_data),
            'landing_pages': response_data
        })
        
    except Exception as e:
        logger.error(f"Error in api_list_landing_pages: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
@user_passes_test(lambda u: u.is_staff)
def api_create_landing_page_from_template(request):
    """API endpoint to create a landing page from a template."""
    if request.method != 'POST':
        return JsonResponse({'status': 'error', 'message': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        
        # Required fields
        template_id = data.get('template_id')
        title = data.get('title')
        
        if not template_id or not title:
            return JsonResponse(
                {'status': 'error', 'message': 'Missing required fields: template_id and title are required'}, 
                status=400
            )
        
        # Get the template
        try:
            template = LandingPageTemplate.objects.get(id=template_id)
        except LandingPageTemplate.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': f'Template with ID {template_id} not found'}, status=404)
        
        # Get template variables from request
        variables = data.get('variables', {})
        
        # Optional landing page parameters
        lp_params = {}
        for param in ['google_pixel_id', 'facebook_pixel_id', 'meta_robots', 'is_active']:
            if param in data:
                lp_params[param] = data[param]
        
        # Create landing page from template
        landing_page, url = template.create_landing_page(title=title, variables=variables, **lp_params)
        
        return JsonResponse({
            'status': 'success',
            'message': 'Landing page created successfully from template',
            'landing_page_id': landing_page.id,
            'title': landing_page.title,
            'url': url,
            'slug': landing_page.slug,
            'is_active': landing_page.is_active,
            'template_name': template.name
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Error in api_create_landing_page_from_template: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@user_passes_test(lambda u: u.is_staff)
def api_list_landing_page_templates(request):
    """API endpoint to list available landing page templates."""
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Only GET method is allowed'}, status=405)
    
    try:
        # Get templates
        templates = LandingPageTemplate.objects.all().order_by('name')
        
        # Prepare response data
        response_data = []
        for template in templates:
            response_data.append({
                'id': template.id,
                'name': template.name,
                'description': template.description,
                'available_variables': template.available_variables,
                'created_at': template.created_at.isoformat(),
                'updated_at': template.updated_at.isoformat()
            })
        
        return JsonResponse({
            'status': 'success',
            'count': len(response_data),
            'templates': response_data
        })
        
    except Exception as e:
        logger.error(f"Error in api_list_landing_page_templates: {str(e)}", exc_info=True)
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)
