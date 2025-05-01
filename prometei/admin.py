from django.contrib import admin
from .models import ContactRequest

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
