from django import forms
from django.utils.translation import gettext_lazy as _
from .models import ContactRequest

class ContactForm(forms.ModelForm):
    """Форма для контактної сторінки."""
    
    class Meta:
        model = ContactRequest
        fields = ['name', 'contact_method', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 
                                          'placeholder': _('Введіть ваше імʼя')}),
            'contact_method': forms.TextInput(attrs={'class': 'form-control', 
                                                   'placeholder': _('Email або Telegram (@username)')}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'rows': 5, 
                                           'placeholder': _('Опишіть ваше питання або проєкт')}),
        }
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.request_type = 'contact'
        if commit:
            instance.save()
        return instance


class BuilderRequestForm(forms.ModelForm):
    """Форма для запитів із сторінки конструктора."""
    
    class Meta:
        model = ContactRequest
        fields = ['name', 'contact_method', 'message']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 
                                          'placeholder': _('Введіть ваше імʼя')}),
            'contact_method': forms.TextInput(attrs={'class': 'form-control', 
                                                   'placeholder': _('Email або Telegram для звʼязку')}),
            'message': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 
                                           'placeholder': _('Додаткові побажання чи питання')}),
        }
    
    # Додаткові поля для інформації з конструктора (будуть заповнюватись через JS)
    builder_site_type = forms.CharField(required=False, widget=forms.HiddenInput())
    builder_modules = forms.CharField(required=False, widget=forms.HiddenInput())
    builder_design = forms.CharField(required=False, widget=forms.HiddenInput())
    builder_pages = forms.IntegerField(required=False, widget=forms.HiddenInput())
    builder_package = forms.CharField(required=False, widget=forms.HiddenInput())
    builder_price = forms.CharField(required=False, widget=forms.HiddenInput())
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.request_type = 'builder'
        
        # Заповнюємо додаткові поля
        instance.builder_site_type = self.cleaned_data.get('builder_site_type', '')
        instance.builder_modules = self.cleaned_data.get('builder_modules', '')
        instance.builder_design = self.cleaned_data.get('builder_design', '')
        instance.builder_pages = self.cleaned_data.get('builder_pages', None)
        instance.builder_package = self.cleaned_data.get('builder_package', '')
        instance.builder_price = self.cleaned_data.get('builder_price', '')
        
        if commit:
            instance.save()
        return instance


class ProminRequestForm(forms.ModelForm):
    """Форма для запитів зі сторінки Promin."""
    
    class Meta:
        model = ContactRequest
        fields = ['name', 'contact_method', 'message', 'project_name', 
                 'project_type', 'project_description', 'project_budget', 'project_deadline']
        widgets = {
            'name': forms.TextInput(attrs={'id': 'contact-name', 'required': True}),
            'contact_method': forms.TextInput(attrs={'id': 'contact-email', 'required': True}),
            'message': forms.HiddenInput(),  # Не показуємо це поле, використовуємо description
            'project_name': forms.TextInput(attrs={'id': 'project-name', 'required': True}),
            'project_type': forms.Select(attrs={'id': 'project-type', 'required': True}, 
                                       choices=[
                                           ('', _('Оберіть тип')),
                                           ('cultural', _('Культурний')),
                                           ('social', _('Соціальний')),
                                           ('educational', _('Освітній')),
                                           ('startup', _('Стартап')),
                                           ('volunteer', _('Волонтерський')),
                                           ('other', _('Інше')),
                                       ]),
            'project_description': forms.Textarea(attrs={'id': 'project-description', 'rows': 5, 'required': True}),
            'project_budget': forms.NumberInput(attrs={'id': 'project-budget', 'placeholder': '0'}),
            'project_deadline': forms.DateInput(attrs={'id': 'project-deadline', 'type': 'date'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Встановлюємо повідомлення як необов'язкове
        self.fields['message'].required = False
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.request_type = 'promin'
        
        # Використовуємо опис проєкту як повідомлення, якщо повідомлення не заповнене
        if not instance.message and instance.project_description:
            instance.message = f"Проєкт: {instance.project_name}\n\n{instance.project_description}"
        
        if commit:
            instance.save()
        return instance 