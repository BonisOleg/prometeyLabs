from django.contrib import admin, messages
from django.urls import reverse, path
from django.utils.html import format_html, escape
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseRedirect
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.http import require_POST
from .models import ContactRequest, LandingPage, LandingPageVisit, LandingPageInteraction, LandingPageTemplate
from .forms import ContactForm
import json

# Register your models here.

@admin.register(ContactRequest)
class ContactRequestAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_method', 'request_type', 'created_at', 'is_processed')
    list_filter = ('request_type', 'is_processed', 'created_at')
    search_fields = ('name', 'contact_method', 'message')
    readonly_fields = ('created_at',)
    fieldsets = (
        (None, {
            'fields': ('name', 'contact_method', 'message', 'request_type', 'is_processed')
        }),
        ('Інформація з конструктора', {
            'classes': ('collapse',),
            'fields': ('builder_site_type', 'builder_modules', 'builder_design', 
                       'builder_pages', 'builder_package', 'builder_price'),
        }),
        ('Інформація проєкту Promin', {
            'classes': ('collapse',),
            'fields': ('project_name', 'project_type', 'project_description', 
                       'project_budget', 'project_deadline'),
        }),
        ('Службова інформація', {
            'fields': ('created_at', 'notes'),
        }),
    )

@admin.register(LandingPageInteraction)
class LandingPageInteractionAdmin(admin.ModelAdmin):
    list_display = ('visit_id_link', 'landing_page_title', 'interaction_type', 'element_id', 'element_type', 'timestamp')
    list_filter = ('interaction_type', 'timestamp', 'visit__landing_page')
    search_fields = ('element_id', 'element_type', 'visit__ip_address')
    readonly_fields = ('visit', 'element_id', 'element_type', 'interaction_type', 'timestamp')
    date_hierarchy = 'timestamp'

    def visit_id_link(self, obj):
        visit_url = reverse('admin:prometei_landingpagevisit_change', args=[obj.visit.id])
        return mark_safe(f'<a href="{escape(visit_url)}">Візит {obj.visit.id}</a>')
    visit_id_link.short_description = _('Візит ID')
    visit_id_link.admin_order_field = 'visit'

    def landing_page_title(self, obj):
        return obj.visit.landing_page.title
    landing_page_title.short_description = _('Лендінг')

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False # Interactions are read-only

class LandingPageInteractionInline(admin.TabularInline):
    model = LandingPageInteraction
    extra = 0
    readonly_fields = ('element_id', 'element_type', 'get_interaction_type_display', 'timestamp_formatted')
    can_delete = False
    max_num = 20 # Show a limited number inline
    ordering = ('-timestamp',)

    def get_interaction_type_display(self, obj):
        return obj.get_interaction_type_display()
    get_interaction_type_display.short_description = _('Тип взаємодії')

    def timestamp_formatted(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %H:%M:%S')
    timestamp_formatted.short_description = _('Час')
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(LandingPageVisit)
class LandingPageVisitAdmin(admin.ModelAdmin):
    list_display = ('id', 'landing_page_link', 'ip_address', 'visit_time_formatted', 'time_spent_formatted', 'interactions_count')
    list_filter = ('landing_page', 'visit_time')
    search_fields = ('ip_address', 'user_agent', 'landing_page__title')
    readonly_fields = ('landing_page', 'ip_address', 'user_agent', 'referrer', 
                       'visit_time', 'time_spent', 'path_data_pretty', 'meta_data_pretty')
    inlines = [LandingPageInteractionInline]
    date_hierarchy = 'visit_time'
    
    def path_data_pretty(self, obj):
        import json
        return mark_safe(f"<pre>{escape(json.dumps(obj.path_data, indent=2, ensure_ascii=False))}</pre>")
    path_data_pretty.short_description = _('Дані активності (JSON)')
    
    def meta_data_pretty(self, obj):
        import json
        return mark_safe(f"<pre>{escape(json.dumps(obj.meta_data, indent=2, ensure_ascii=False))}</pre>")
    meta_data_pretty.short_description = _('Метадані відвідувача (JSON)')

    def landing_page_link(self, obj):
        lp_url = reverse('admin:prometei_landingpage_change', args=[obj.landing_page.id])
        return mark_safe(f'<a href="{escape(lp_url)}">{escape(obj.landing_page.title)}</a>')
    landing_page_link.short_description = _('Лендінг')
    landing_page_link.admin_order_field = 'landing_page'
    
    def visit_time_formatted(self,obj):
        return obj.visit_time.strftime('%Y-%m-%d %H:%M:%S')
    visit_time_formatted.short_description = _('Час візиту')
    visit_time_formatted.admin_order_field = 'visit_time'

    def time_spent_formatted(self, obj):
        return f"{obj.time_spent} сек"
    time_spent_formatted.short_description = _('Час на сторінці')
    time_spent_formatted.admin_order_field = 'time_spent'

    def interactions_count(self, obj):
        return obj.interactions.count()
    interactions_count.short_description = _('Взаємодій')
    
    def has_add_permission(self, request):
        return False # Visits are created automatically
    
    # Superusers can delete old visit data if needed
    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

@admin.register(LandingPage)
class LandingPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug_link', 'is_active', 'created_at', 'visit_count_admin', 'generate_link_button')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'slug', 'html_content')
    readonly_fields = ('created_at', 'updated_at')
    save_on_top = True
    actions = ['admin_generate_new_links', 'activate_pages', 'deactivate_pages']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'is_active', 'meta_robots')
        }),
        (_('Контент сторінки (HTML, CSS, JS)'), {
            'classes': ('collapse',),
            'fields': ('html_content', 'css_content', 'js_content'),
            'description': _("HTML-контент є обов'язковим. CSS та JS будуть автоматично вставлені на сторінку.")
        }),
        (_('Інтеграція та відстеження'), {
            'fields': ('google_pixel_id', 'facebook_pixel_id'),
        }),
        (_('Службова інформація'), {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    def slug_link(self,obj):
        if obj.slug:
            return mark_safe(f'<a href="{escape(obj.get_absolute_url())}" target="_blank">{escape(obj.slug)}</a>')
        return "-"
    slug_link.short_description = _('URL (Slug)')
    slug_link.admin_order_field = 'slug'

    def visit_count_admin(self, obj):
        count = obj.visits.count()
        url = reverse('admin:prometei_landingpagevisit_changelist') + f'?landing_page__id__exact={obj.id}'
        return mark_safe(f'<a href="{escape(url)}">{count}</a>')
    visit_count_admin.short_description = _('Візити')
    
    def generate_link_button(self, obj):
        if obj.id is None: # Check if the object is saved
            return _("Збережіть, щоб згенерувати посилання")
        
        generate_url = reverse('prometei:landing_generate_link', args=[obj.id])
        return mark_safe(
            f'<a class="button" href="{escape(generate_url)}" '
            f'onclick="return confirm(\'{_("Увага! Буде згенеровано НОВЕ унікальне посилання (slug) для цієї сторінки. Старе посилання перестане працювати. Продовжити?")}\')">'
            f'{_("Згенерувати нове посилання")}</a>'
        )
    generate_link_button.short_description = _('Дії з посиланням')

    def admin_generate_new_links(self, request, queryset):
        count = 0
        for page in queryset:
            page.generate_new_link() # Already saves
            count += 1
        self.message_user(
            request, 
            _("Згенеровано нові посилання для %(count)d лендінгів.") % {'count': count},
            messages.SUCCESS
        )
    admin_generate_new_links.short_description = _("Згенерувати нові посилання для обраних")

    def activate_pages(self, request, queryset):
        updated_count = queryset.update(is_active=True, updated_at=timezone.now())
        self.message_user(request, _("%(count)d лендінгів активовано.") % {'count': updated_count}, messages.SUCCESS)
    activate_pages.short_description = _("Активувати обрані лендінги")

    def deactivate_pages(self, request, queryset):
        updated_count = queryset.update(is_active=False, updated_at=timezone.now())
        self.message_user(request, _("%(count)d лендінгів деактивовано.") % {'count': updated_count}, messages.SUCCESS)
    deactivate_pages.short_description = _("Деактивувати обрані лендінги")

@admin.register(LandingPageTemplate)
class LandingPageTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'description_short', 'created_at', 'updated_at', 'create_page_button')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'description', 'html_template')
    readonly_fields = ('created_at', 'updated_at', 'available_variables_pretty')
    save_on_top = True
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description')
        }),
        (_('Змінні шаблону'), {
            'fields': ('available_variables', 'available_variables_pretty'),
            'description': _("Визначте змінні, які можна використовувати в шаблоні. Формат: {'назва': 'опис'}"),
        }),
        (_('Контент шаблону'), {
            'fields': ('html_template', 'css_content', 'js_content'),
            'description': _("HTML-шаблон є обов'язковим. Використовуйте {{назва_змінної}} для місць, які будуть замінені при створенні сторінки."),
        }),
        (_('Службова інформація'), {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    def description_short(self, obj):
        if obj.description and len(obj.description) > 50:
            return f"{obj.description[:50]}..."
        return obj.description or "-"
    description_short.short_description = _('Опис')
    
    def available_variables_pretty(self, obj):
        import json
        if not obj.available_variables:
            return _("Змінні не визначено")
        return mark_safe(f"<pre>{escape(json.dumps(obj.available_variables, indent=2, ensure_ascii=False))}</pre>")
    available_variables_pretty.short_description = _('Доступні змінні (відформатовано)')
    
    def create_page_button(self, obj):
        if obj.id is None:  # Check if the object is saved
            return _("Збережіть, щоб створити сторінку")
        
        # Створюємо посилання на адмін-представлення для створення сторінки з шаблону
        create_url = reverse('admin:create_landing_from_template', args=[obj.id])
        return mark_safe(
            f'<a class="button" href="{escape(create_url)}">'
            f'{_("Створити сторінку з шаблону")}</a>'
        )
    create_page_button.short_description = _('Дії')
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'template/<int:template_id>/create-landing/',
                self.admin_site.admin_view(self.create_landing_from_template_view),
                name='create_landing_from_template',
            ),
        ]
        return custom_urls + urls
        
    def create_landing_from_template_view(self, request, template_id):
        """Адмін-представлення для створення лендінгу з шаблону."""
        template = get_object_or_404(LandingPageTemplate, id=template_id)
        
        if request.method == 'POST':
            # Обробляємо форму
            title = request.POST.get('title')
            variables = {}
            
            # Зчитуємо значення змінних з форми
            for key in template.available_variables.keys():
                variables[key] = request.POST.get(f'var_{key}', '')
                
            # Додаткові параметри для створення лендінгу
            google_pixel_id = request.POST.get('google_pixel_id', '')
            facebook_pixel_id = request.POST.get('facebook_pixel_id', '')
            
            try:
                # Створюємо лендінг з шаблону
                landing_page, url = template.create_landing_page(
                    title=title,
                    variables=variables,
                    google_pixel_id=google_pixel_id,
                    facebook_pixel_id=facebook_pixel_id
                )
                
                # Додаємо повідомлення про успішне створення
                messages.success(
                    request, 
                    _("Лендінг успішно створено. <a href='%(url)s' target='_blank'>Відкрити сторінку</a>.") % {
                        'url': url
                    },
                    extra_tags='safe'
                )
                
                # Перенаправляємо на сторінку зміни створеного лендінгу
                return HttpResponseRedirect(
                    reverse('admin:prometei_landingpage_change', args=[landing_page.id])
                )
                
            except Exception as e:
                messages.error(request, _("Помилка при створенні лендінгу: %(error)s") % {'error': str(e)})
        
        # Відображаємо форму
        context = {
            'title': _('Створення лендінгу з шаблону'),
            'template': template,
            'available_variables': template.available_variables,
            'opts': self.model._meta,
            'app_label': self.model._meta.app_label,
        }
        return render(request, 'admin/prometei/create_landing_from_template.html', context)
