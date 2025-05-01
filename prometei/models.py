from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

# Create your models here.

class ContactRequest(models.Model):
    """Модель для зберігання контактних запитів від користувачів."""
    
    TYPE_CHOICES = (
        ('contact', _('Контактна форма')),
        ('builder', _('Конструктор сайту')),
        ('promin', _('Заявка Промінь')),
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
