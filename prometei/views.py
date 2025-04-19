from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.


class HomePageView(TemplateView):
    template_name = 'prometei/home.html'


class AboutPageView(TemplateView):
    template_name = 'prometei/about.html'


class ServicesPageView(TemplateView):
    template_name = 'prometei/services.html'


class BuilderPageView(TemplateView):
    template_name = 'prometei/builder.html'


class ContactPageView(TemplateView):
    template_name = 'prometei/contact.html'
