from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.validators import MinLengthValidator
from django.urls import reverse as django_reverse
import uuid

# Create your models here.

class ContactRequest(models.Model):
    """Модель для зберігання контактних запитів від користувачів."""
    
    TYPE_CHOICES = (
        ('contact', _('Контактна форма')),
        ('builder', _('Конструктор сайту')),
        ('promin', _('Заявка Промінь')),
        ('dream_site', _('Сайт мрії')),
        ('course', _('Заявка на курс')),
    )
    
    name = models.CharField(_('Імʼя'), max_length=100)
    contact_method = models.CharField(_('Контактний метод'), max_length=100, 
                                     help_text=_('Email або Telegram'))
    message = models.TextField(_('Повідомлення'))
    request_type = models.CharField(_('Тип запиту'), max_length=20, choices=TYPE_CHOICES, default='contact')
    
    # Додаткові поля для заявок з конструктора
    builder_site_type = models.CharField(_('Тип сайту'), max_length=50, blank=True, null=True)
    builder_modules = models.TextField(_('Обрані модулі'), blank=True, null=True)
    builder_design = models.CharField(_('Тип дизайну'), max_length=20, blank=True, null=True)
    builder_pages = models.PositiveIntegerField(_('Кількість сторінок'), blank=True, null=True)
    builder_package = models.CharField(_('Розрахований пакет'), max_length=20, blank=True, null=True)
    builder_price = models.CharField(_('Орієнтовна ціна'), max_length=20, blank=True, null=True)
    
    # Додаткові поля для Promin
    project_name = models.CharField(_('Назва проєкту'), max_length=100, blank=True, null=True)
    project_type = models.CharField(_('Тип проєкту'), max_length=50, blank=True, null=True)
    project_description = models.TextField(_('Опис проєкту'), blank=True, null=True)
    project_budget = models.CharField(_('Бюджет'), max_length=50, blank=True, null=True)
    project_deadline = models.DateField(_('Дедлайн'), blank=True, null=True)
    
    # Поля для курсу
    course_package = models.CharField(_('Пакет курсу'), max_length=50, null=True, blank=True)
    course_experience = models.CharField(_('Досвід в IT'), max_length=50, null=True, blank=True)
    
    # Службові поля
    created_at = models.DateTimeField(_('Дата створення'), default=timezone.now)
    is_processed = models.BooleanField(_('Опрацьовано'), default=False)
    notes = models.TextField(_('Нотатки'), blank=True, null=True)
    
    class Meta:
        verbose_name = _('Контактний запит')
        verbose_name_plural = _('Контактні запити')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_request_type_display()} ({self.created_at.strftime('%d.%m.%Y')})"


class LandingPage(models.Model):
    """Model for storing custom landing pages with tracking capabilities."""
    
    title = models.CharField(_('Назва'), max_length=200)
    slug = models.SlugField(_('URL-ідентифікатор'), max_length=100, unique=True, db_index=True)
    html_content = models.TextField(_('HTML-контент'), validators=[MinLengthValidator(10)], 
                                  help_text=_("Повний HTML-код сторінки. Сюди будуть автоматично додані скрипти відстеження та ваші CSS/JS."))
    css_content = models.TextField(_('CSS-стилі'), blank=True, 
                                 help_text=_("Чистий CSS без тегів <style>."))
    js_content = models.TextField(_('JavaScript-код'), blank=True, 
                               help_text=_("Чистий JavaScript без тегів <script>."))
    
    # Tracking pixels
    google_pixel_id = models.CharField(_('Google Pixel ID (GTM ID)'), max_length=50, blank=True)
    facebook_pixel_id = models.CharField(_('Facebook Pixel ID'), max_length=50, blank=True)
    
    # SEO & indexing controls
    meta_robots = models.CharField(
        _('Meta Robots'), 
        max_length=50, 
        default='noindex, nofollow',
        help_text=_('Директиви для пошукових роботів, наприклад, "noindex, nofollow".')
    )
    
    # Status and dates
    is_active = models.BooleanField(_('Активна'), default=True, db_index=True)
    created_at = models.DateTimeField(_('Створено'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Оновлено'), auto_now=True)
    
    class Meta:
        verbose_name = _('Спеціальний лендінг')
        verbose_name_plural = _('Спеціальні лендінги')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return django_reverse('prometei:landing_page', kwargs={'slug': self.slug})
    
    def generate_new_link(self, save_instance=True):
        """Generate a new random slug for the landing page."""
        self.slug = f"lp-{uuid.uuid4().hex[:12]}" # Increased length for more uniqueness
        if save_instance:
            self.save(update_fields=['slug', 'updated_at'])
        return self.get_absolute_url()


class LandingPageTemplate(models.Model):
    """Model for storing reusable landing page templates."""
    
    name = models.CharField(_('Назва шаблону'), max_length=200)
    description = models.TextField(_('Опис'), blank=True)
    html_template = models.TextField(
        _('HTML-шаблон'), 
        validators=[MinLengthValidator(10)],
        help_text=_("HTML-код шаблону. Використовуйте {{змінна}} для позначення місць, які будуть замінені при створенні сторінки.")
    )
    css_content = models.TextField(
        _('CSS-стилі'), 
        blank=True,
        help_text=_("Чистий CSS без тегів <style>.")
    )
    js_content = models.TextField(
        _('JavaScript-код'), 
        blank=True,
        help_text=_("Чистий JavaScript без тегів <script>.")
    )
    
    available_variables = models.JSONField(
        _('Доступні змінні'),
        default=dict,
        help_text=_("Словник змінних, які можна використовувати в шаблоні. Формат: {'назва': 'опис'}")
    )
    
    created_at = models.DateTimeField(_('Створено'), auto_now_add=True)
    updated_at = models.DateTimeField(_('Оновлено'), auto_now=True)
    
    class Meta:
        verbose_name = _('Шаблон лендінгу')
        verbose_name_plural = _('Шаблони лендінгів')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def create_landing_page(self, title, variables=None, **kwargs):
        """
        Create a landing page from this template with the provided variables.
        
        Args:
            title (str): Title for the new landing page
            variables (dict): Values for template variables
            **kwargs: Additional parameters for the landing page
            
        Returns:
            LandingPage: The created landing page
        """
        from .landing_page_generator import create_landing_page_from_template
        
        return create_landing_page_from_template(
            title=title,
            template_content=self.html_template,
            template_variables=variables,
            css_content=self.css_content,
            js_content=self.js_content,
            **kwargs
        )


class LandingPageVisit(models.Model):
    """Model for tracking visits to landing pages."""
    
    landing_page = models.ForeignKey(
        LandingPage, 
        on_delete=models.CASCADE, 
        related_name='visits'
    )
    ip_address = models.GenericIPAddressField(_('IP-адреса'), blank=True, null=True)
    user_agent = models.TextField(_('User Agent'), blank=True)
    referrer = models.TextField(_('Реферер'), blank=True, null=True) # Changed from URLField for flexibility
    visit_time = models.DateTimeField(_('Час візиту'), default=timezone.now)
    
    # Tracking data
    time_spent = models.PositiveIntegerField(_('Час на сторінці (сек)'), default=0)
    path_data = models.JSONField(_('Дані активності (рух миші, скроли)'), default=dict, blank=True)
    meta_data = models.JSONField(_('Метадані відвідувача (екран, браузер)'), default=dict, blank=True)
    
    class Meta:
        verbose_name = _('Візит лендінгу')
        verbose_name_plural = _('Візити лендінгів')
        ordering = ['-visit_time']
        indexes = [
            models.Index(fields=['visit_time']),
            models.Index(fields=['landing_page', 'visit_time']),
        ]
    
    def __str__(self):
        return f"Visit to '{self.landing_page.title}' at {self.visit_time.strftime('%Y-%m-%d %H:%M')}"


class LandingPageInteraction(models.Model):
    """Model for tracking interactions with elements on landing pages."""
    
    INTERACTION_TYPES = [
        ('click', _('Клік')),
        ('submit', _('Відправка форми')),
        ('scroll_deep', _('Глибокий скрол')),
        ('view_element', _('Перегляд елемента')),
    ]
    
    visit = models.ForeignKey(
        LandingPageVisit, 
        on_delete=models.CASCADE, 
        related_name='interactions'
    )
    element_id = models.CharField(_('ID/Class елемента'), max_length=150, blank=True)
    element_type = models.CharField(_('Тип елемента (HTML Tag)'), max_length=50, blank=True)
    interaction_type = models.CharField(
        _('Тип взаємодії'), 
        max_length=20,
        choices=INTERACTION_TYPES,
        default='click'
    )
    timestamp = models.DateTimeField(_('Час взаємодії'), default=timezone.now)
    
    class Meta:
        verbose_name = _('Взаємодія на лендінгу')
        verbose_name_plural = _('Взаємодії на лендінгах')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['visit', 'timestamp']),
            models.Index(fields=['interaction_type']),
        ]
    
    def __str__(self):
        return f"{self.get_interaction_type_display()} on {self.element_id or self.element_type} (Visit {self.visit.id})"
