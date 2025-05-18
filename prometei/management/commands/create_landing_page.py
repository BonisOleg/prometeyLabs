import os
import argparse
import json

from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _
from django.conf import settings

from prometei.landing_page_generator import create_landing_page, create_landing_page_from_template
from prometei.models import LandingPageTemplate

class Command(BaseCommand):
    help = _("Create a landing page programmatically from the command line")

    def add_arguments(self, parser):
        # Required arguments
        parser.add_argument('--title', required=True, help=_('Title of the landing page'))
        
        # Content source (mutually exclusive)
        content_group = parser.add_mutually_exclusive_group(required=True)
        content_group.add_argument('--html', help=_('HTML content string or path to HTML file'))
        content_group.add_argument('--template-id', type=int, help=_('ID of the template to use'))
        
        # Optional arguments
        parser.add_argument('--css', help=_('CSS content string or path to CSS file'))
        parser.add_argument('--js', help=_('JavaScript content string or path to JS file'))
        parser.add_argument('--google-pixel-id', help=_('Google Pixel/GTM ID'))
        parser.add_argument('--facebook-pixel-id', help=_('Facebook Pixel ID'))
        parser.add_argument('--meta-robots', default='noindex, nofollow', help=_('Meta robots directive'))
        parser.add_argument('--inactive', action='store_true', help=_('Create as inactive'))
        parser.add_argument('--variables', help=_('JSON string or path to JSON file with template variables'))
        
    def _read_file_or_string(self, value):
        """Read content from file if value appears to be a file path, or return the string value."""
        if not value:
            return ''
            
        if os.path.isfile(value):
            with open(value, 'r', encoding='utf-8') as f:
                return f.read()
        return value
        
    def handle(self, *args, **options):
        # Process basic options
        title = options['title']
        is_active = not options['inactive']
        
        # Process content arguments
        if options['template_id']:
            # Create from template
            try:
                template = LandingPageTemplate.objects.get(id=options['template_id'])
                self.stdout.write(self.style.SUCCESS(f"Using template: {template.name}"))
                
                # Process template variables
                variables = {}
                if options['variables']:
                    variables_content = self._read_file_or_string(options['variables'])
                    try:
                        variables = json.loads(variables_content)
                    except json.JSONDecodeError:
                        self.stderr.write(self.style.ERROR("Invalid JSON in variables"))
                        return
                        
                # Get optional params
                params = {}
                for key, value in {
                    'google_pixel_id': options.get('google_pixel_id'),
                    'facebook_pixel_id': options.get('facebook_pixel_id'),
                    'meta_robots': options.get('meta_robots'),
                    'is_active': is_active
                }.items():
                    if value is not None:
                        params[key] = value
                
                # Create landing page from template
                landing_page, url = template.create_landing_page(
                    title=title,
                    variables=variables,
                    **params
                )
                
            except LandingPageTemplate.DoesNotExist:
                self.stderr.write(self.style.ERROR(f"Template with ID {options['template_id']} not found"))
                return
                
        else:
            # Create from direct content
            html_content = self._read_file_or_string(options['html'])
            css_content = self._read_file_or_string(options.get('css', ''))
            js_content = self._read_file_or_string(options.get('js', ''))
            
            # Create landing page
            landing_page, url = create_landing_page(
                title=title,
                html_content=html_content,
                css_content=css_content,
                js_content=js_content,
                google_pixel_id=options.get('google_pixel_id', ''),
                facebook_pixel_id=options.get('facebook_pixel_id', ''),
                meta_robots=options.get('meta_robots', 'noindex, nofollow'),
                is_active=is_active
            )
            
        # Output results
        self.stdout.write(self.style.SUCCESS(f"Successfully created landing page: {title}"))
        self.stdout.write(f"ID: {landing_page.id}")
        self.stdout.write(f"Slug: {landing_page.slug}")
        
        # Calculate full URL
        site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
        full_url = f"{site_url}{url}"
        self.stdout.write(f"URL: {full_url}")
        
        return landing_page 