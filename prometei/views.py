from django.shortcuts import render, redirect
from django.views.generic import TemplateView, FormView
from django.views.decorators.http import require_POST
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from django.http import JsonResponse
from django.urls import reverse_lazy
import json
import logging

from .forms import ContactForm, BuilderRequestForm, ProminRequestForm
from .email_service import EmailService

# Налаштування логування
logger = logging.getLogger(__name__)

# Create your views here.


class HomePageView(TemplateView):
    template_name = 'prometei/home.html'


class AboutPageView(TemplateView):
    template_name = 'prometei/about.html'


class ServicesPageView(TemplateView):
    template_name = 'prometei/services.html'


class BuilderPageView(TemplateView):
    template_name = 'prometei/builder.html'


class ContactPageView(FormView):
    template_name = 'prometei/contact.html'
    form_class = ContactForm
    success_url = reverse_lazy('prometei:contact')
    
    def post(self, request, *args, **kwargs):
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                data = json.loads(request.body)
                form = self.get_form_class()(data)
                if form.is_valid():
                    return self.form_valid(form)
                else:
                    logger.warning(f"AJAX: Отримано невалідну контактну форму з помилками: {form.errors.as_json()}")
                    return JsonResponse({
                        'success': False,
                        'message': _("Будь ласка, перевірте введені дані."),
                        'errors': form.errors
                    })
            except json.JSONDecodeError:
                logger.error("AJAX: Не вдалося розпарсити JSON з тіла запиту")
                return JsonResponse({'success': False, 'message': _("Помилка формату запиту.")}, status=400)
            except Exception as e:
                 logger.error(f"AJAX: Непередбачена помилка при обробці POST: {str(e)}")
                 return JsonResponse({'success': False, 'message': _("Внутрішня помилка сервера.")}, status=500)
        else:
            return super().post(request, *args, **kwargs)
    
    def form_valid(self, form):
        """Обробка валідної форми."""
        try:
            # Зберігаємо контактний запит
            contact_request = form.save()
            logger.info(f"Створено новий контактний запит ID: {contact_request.id}")
            
            # Відправляємо email про запит
            EmailService.send_contact_email(contact_request)
            
            # Відправляємо підтвердження користувачу, якщо це можливо
            EmailService.send_confirmation_to_user(contact_request)
            
            # Додаємо повідомлення про успіх
            messages.success(
                self.request, 
                _("Дякуємо за ваше повідомлення! Ми зв'яжемося з вами найближчим часом.")
            )
            
            # Для AJAX-запитів повертаємо JSON
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': _("Дякуємо за ваше повідомлення! Ми зв'яжемося з вами найближчим часом.")
                })
                
            return super().form_valid(form)
            
        except Exception as e:
            logger.error(f"Помилка при обробці контактної форми: {str(e)}")
            
            # Для AJAX-запитів повертаємо JSON з помилкою
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': _("Виникла помилка при відправці повідомлення. Спробуйте пізніше або зв'яжіться з нами по телефону.")
                })
                
            # Додаємо повідомлення про помилку
            messages.error(
                self.request, 
                _("Виникла помилка при відправці повідомлення. Спробуйте пізніше або зв'яжіться з нами по телефону.")
            )
            return self.form_invalid(form)
    
    def form_invalid(self, form):
        """Обробка невалідної форми."""
        logger.warning(f"Отримано невалідну контактну форму (не-AJAX або помилка після валідації): {form.errors}")
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
        """Обробка валідної форми."""
        try:
            # Зберігаємо контактний запит
            contact_request = form.save()
            logger.info(f"Створено нову заявку Promin ID: {contact_request.id}")
            
            # Відправляємо email про запит
            EmailService.send_contact_email(contact_request)
            
            # Відправляємо підтвердження користувачу, якщо це можливо
            EmailService.send_confirmation_to_user(contact_request)
            
            # Додаємо повідомлення про успіх
            messages.success(
                self.request, 
                _("Дякуємо за вашу заявку! Ми розглянемо її та зв'яжемося з вами найближчим часом.")
            )
            
            # Для AJAX-запитів повертаємо JSON
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': _("Дякуємо за вашу заявку! Ми розглянемо її та зв'яжемося з вами найближчим часом.")
                })
                
            return super().form_valid(form)
            
        except Exception as e:
            logger.error(f"Помилка при обробці форми Promin: {str(e)}")
            
            # Для AJAX-запитів повертаємо JSON з помилкою
            if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'message': _("Виникла помилка при відправці заявки. Спробуйте пізніше або зв'яжіться з нами по телефону.")
                })
                
            # Додаємо повідомлення про помилку
            messages.error(
                self.request, 
                _("Виникла помилка при відправці заявки. Спробуйте пізніше або зв'яжіться з нами по телефону.")
            )
            return self.form_invalid(form)
    
    def form_invalid(self, form):
        """Обробка невалідної форми."""
        logger.warning(f"Отримано невалідну форму Promin (не-AJAX або помилка після валідації): {form.errors}")
        return super().form_invalid(form)


def builder_request_view(request):
    """Обробка запиту з конструктора сайту."""
    # Якщо це не POST-запит, перенаправляємо на сторінку конструктора
    if request.method != "POST":
        return redirect('prometei:builder')
        
    try:
        # Для AJAX запитів
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # Отримуємо дані з запиту
            data = json.loads(request.body)
            
            # Створюємо форму з отриманими даними
            form = BuilderRequestForm(data)
            
            if form.is_valid():
                # Зберігаємо запит
                contact_request = form.save()
                logger.info(f"Створено новий запит з конструктора ID: {contact_request.id}")
                
                # Відправляємо email про запит
                EmailService.send_contact_email(contact_request)
                
                # Відправляємо підтвердження користувачу, якщо це можливо
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
            # Для стандартних POST запитів
            form = BuilderRequestForm(request.POST)
            
            if form.is_valid():
                # Зберігаємо запит
                contact_request = form.save()
                logger.info(f"Створено новий запит з конструктора ID: {contact_request.id}")
                
                # Відправляємо email про запит
                EmailService.send_contact_email(contact_request)
                
                # Відправляємо підтвердження користувачу, якщо це можливо
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
        
        # Для AJAX-запитів повертаємо JSON з помилкою
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'message': _("Виникла помилка при відправці запиту. Спробуйте пізніше або зв'яжіться з нами по телефону.")
            })
            
        # Для стандартних запитів
        messages.error(
            request, 
            _("Виникла помилка при відправці запиту. Спробуйте пізніше або зв'яжіться з нами по телефону.")
        )
        return redirect('prometei:builder')
