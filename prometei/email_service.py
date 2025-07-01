import logging
import re
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# Налаштування логування
logger = logging.getLogger(__name__)

class EmailService:
    """Сервіс для відправки електронних листів."""
    
    @staticmethod
    def is_valid_email(email):
        """
        Перевіряє, чи є рядок валідною email адресою.
        
        Args:
            email: Рядок для перевірки
            
        Returns:
            bool: True якщо email валідний, інакше False
        """
        try:
            validate_email(email)
            return True
        except ValidationError:
            return False
    
    @staticmethod
    def is_valid_telegram(username):
        """
        Перевіряє, чи є рядок схожим на Telegram юзернейм.
        
        Args:
            username: Рядок для перевірки
            
        Returns:
            bool: True якщо схоже на Telegram, інакше False
        """
        return username.startswith('@') and len(username) > 1
    
    @staticmethod
    def send_contact_email(contact_request):
        """
        Відправляє повідомлення про новий контактний запит.
        
        Args:
            contact_request: Екземпляр моделі ContactRequest
        
        Returns:
            bool: True якщо відправлено успішно, False у разі помилки
        """
        try:
            context = {
                'contact_request': contact_request,
                'request_type': contact_request.get_request_type_display(),
            }
            
            # Визначаємо тему листа залежно від типу запиту
            subject_map = {
                'contact': _('Новий контактний запит від {name}'),
                'builder': _('Новий запит з конструктора сайту від {name}'),
                'promin': _('Нова заявка на проєкт Promin від {name}'),
                'course': _('Нова заявка на курс від {name}'),
            }
            
            subject = subject_map.get(
                contact_request.request_type, 
                _('Новий запит від {name}')
            ).format(name=contact_request.name)
            
            # Вибираємо шаблон залежно від типу запиту
            template_map = {
                'contact': 'email/contact_request_email.html',
                'builder': 'email/builder_request_email.html',
                'promin': 'email/promin_request_email.html',
                'course': 'email/course_request_email.html',
            }
            
            template = template_map.get(
                contact_request.request_type,
                'email/contact_request_email.html'
            )
            
            # Створюємо HTML версію листа
            html_content = render_to_string(template, context)
            text_content = strip_tags(html_content)
            
            # Формуємо повідомлення
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = settings.CONTACT_EMAIL  # Email адреса для отримання запитів
            
            msg = EmailMultiAlternatives(
                subject, 
                text_content,
                from_email,
                [to_email]
            )
            msg.attach_alternative(html_content, "text/html")
            
            # Додаємо Reply-To заголовок, якщо контактний метод - email
            if EmailService.is_valid_email(contact_request.contact_method):
                msg.extra_headers = {'Reply-To': contact_request.contact_method}
            
            # Відправляємо лист
            num_sent = msg.send(fail_silently=False)
            
            if num_sent > 0:
                logger.info(f"Успішно відправлено email про контактний запит ID {contact_request.id}")
                return True
            else:
                logger.warning(f"Не вдалося відправити email про контактний запит ID {contact_request.id}")
                return False
            
        except Exception as e:
            logger.error(f"Помилка відправки email для контактного запиту ID {contact_request.id}: {str(e)}")
            return False
    
    @staticmethod
    def send_confirmation_to_user(contact_request):
        """
        Відправляє підтвердження користувачу про отримання його запиту.
        
        Args:
            contact_request: Екземпляр моделі ContactRequest
        
        Returns:
            bool: True якщо відправлено успішно, False у разі помилки
        """
        # Перевіряємо, чи контактний метод є email
        if not EmailService.is_valid_email(contact_request.contact_method):
            # Не можемо відправити email на Telegram або неправильний email
            logger.info(f"Пропускаємо відправку підтвердження користувачу, оскільки {contact_request.contact_method} не є валідним email")
            return False
            
        try:
            context = {
                'name': contact_request.name,
                'request_type': contact_request.get_request_type_display(),
            }
            
            # Визначаємо тему листа залежно від типу запиту
            subject_map = {
                'contact': _('Дякуємо за ваше звернення - Prometey Labs'),
                'builder': _('Ваш запит на створення сайту отримано - Prometey Labs'),
                'promin': _('Ваша заявка на проєкт Promin отримана - Prometey Labs'),
            }
            
            subject = subject_map.get(
                contact_request.request_type, 
                _('Ваш запит отримано - Prometey Labs')
            )
            
            # Вибираємо шаблон залежно від типу запиту
            template_map = {
                'contact': 'email/contact_confirmation.html',
                'builder': 'email/builder_confirmation.html',
                'promin': 'email/promin_confirmation.html',
            }
            
            template = template_map.get(
                contact_request.request_type,
                'email/contact_confirmation.html'
            )
            
            # Створюємо HTML версію листа
            html_content = render_to_string(template, context)
            text_content = strip_tags(html_content)
            
            # Формуємо повідомлення
            from_email = settings.DEFAULT_FROM_EMAIL
            to_email = contact_request.contact_method
            
            msg = EmailMultiAlternatives(
                subject, 
                text_content,
                from_email,
                [to_email]
            )
            msg.attach_alternative(html_content, "text/html")
            
            # Відправляємо лист
            num_sent = msg.send(fail_silently=False)
            
            if num_sent > 0:
                logger.info(f"Успішно відправлено підтвердження користувачу {to_email}")
                return True
            else:
                logger.warning(f"Не вдалося відправити підтвердження користувачу {to_email}")
                return False
            
        except Exception as e:
            logger.error(f"Помилка відправки підтвердження користувачу: {str(e)}")
            return False 