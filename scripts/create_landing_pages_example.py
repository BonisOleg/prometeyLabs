#!/usr/bin/env python
"""
Example script that demonstrates how to use the landing page API programmatically.

Make sure Django settings are configured correctly and run this from the project root:
python scripts/create_landing_pages_example.py
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()

# Import models after Django setup
from django.contrib.auth import get_user_model
from django.conf import settings
from prometei.models import LandingPageTemplate
from prometei.landing_page_generator import create_landing_page, create_landing_page_from_template

User = get_user_model()


def create_direct_landing_page():
    """Create a landing page directly using the generator function"""
    print("Creating landing page directly with generator function...")
    
    # Simple HTML content
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Prometey Labs</title>
    </head>
    <body>
        <div class="container">
            <h1>Welcome to Prometey Labs</h1>
            <p>This is a programmatically created landing page.</p>
            
            <form id="contact-form" class="form">
                <h2>Contact Us</h2>
                <div class="form-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="contact">Email/Telegram</label>
                    <input type="text" id="contact" name="contact" required>
                </div>
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn">Send</button>
            </form>
        </div>
    </body>
    </html>
    """
    
    # CSS content
    css_content = """
    body {
        font-family: 'Segoe UI', Tahoma, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f8f8f8;
        margin: 0;
        padding: 0;
    }
    
    .container {
        width: 90%;
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    h1 {
        color: #ff6500;
        text-align: center;
    }
    
    .form {
        margin-top: 30px;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 600;
    }
    
    .form-group input, .form-group textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }
    
    .form-group textarea {
        height: 120px;
    }
    
    .btn {
        background-color: #ff6500;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
    }
    
    .btn:hover {
        background-color: #e65c00;
    }
    """
    
    # Create the landing page
    landing_page, url = create_landing_page(
        title="Direct Example Landing Page",
        html_content=html_content,
        css_content=css_content,
        google_pixel_id="GTM-EXAMPLE",
        meta_robots="noindex, nofollow"
    )
    
    print(f"Created landing page with ID: {landing_page.id}")
    print(f"URL: {get_full_url(url)}")
    print(f"Slug: {landing_page.slug}")
    return landing_page


def create_landing_page_from_existing_template():
    """Create a landing page from an existing template"""
    print("\nCreating landing page from template...")
    
    # Get the first template
    try:
        template = LandingPageTemplate.objects.order_by('name').first()
        if not template:
            print("No templates found. Run 'python manage.py load_default_templates' first.")
            return None
            
        print(f"Using template: {template.name}")
        
        # Variables to replace in template
        variables = {
            'title': 'Special Promo Page',
            'company_name': 'Prometey Labs',
            'heading': 'Exclusive Website Offer',
            'content': '<p>We are offering a special discount on all website packages until the end of the month!</p>',
            'form_heading': 'Get Your Special Offer Now',
            'name_label': 'Your Name',
            'contact_label': 'Email or Telegram',
            'message_label': 'How can we help you?',
            'button_text': 'Claim My Offer',
            'success_message': 'Thank you! We\'ll contact you shortly with your special offer.',
            'footer_text': '© 2023 Prometey Labs. All rights reserved.',
            
            # Colors
            'text_color': '#333333',
            'background_color': '#f9f9f9',
            'accent_color': '#ff6500',
            'heading_color': '#1a1a1a',
            'form_background_color': '#ffffff',
            'form_heading_color': '#333333',
            'button_color': '#ff6500',
            'button_text_color': '#ffffff',
            'button_hover_color': '#e65c00'
        }
        
        # Add promo template specific variables if using that template
        if 'Promotional' in template.name:
            variables.update({
                'offer_tag': 'EXCLUSIVE OFFER - 30% OFF',
                'subheading': 'For a limited time only',
                'regular_price': '₴9999',
                'sale_price': '₴6999',
                'timer_text': 'Offer ends soon',
                'cta_text': 'Claim Your Discount',
                'benefits_heading': 'What You Get',
                'benefit_1': 'Professional website design',
                'benefit_2': 'Mobile-optimized layout',
                'benefit_3': 'SEO optimization included',
                'form_note': 'We respect your privacy. Your information will not be shared.',
                'end_date': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
                'countdown_prefix': 'Offer ends in:',
                'offer_ended_text': 'Offer has ended. Contact us for current pricing.',
                'timer_color': '#ffffff',
                'timer_background': '#333333',
                'benefits_background': '#f0f0f0'
            })
        
        # Create landing page from template
        landing_page, url = template.create_landing_page(
            title="Template Example Landing Page",
            variables=variables,
            google_pixel_id="GTM-EXAMPLE2"
        )
        
        print(f"Created landing page with ID: {landing_page.id}")
        print(f"URL: {get_full_url(url)}")
        print(f"Slug: {landing_page.slug}")
        return landing_page
        
    except Exception as e:
        print(f"Error creating landing page from template: {e}")
        return None


def use_api_example():
    """Example of using the API to create and manage landing pages"""
    print("\nAPI example - would connect to endpoints if running as a separate script")
    
    # This is just an example of how the API could be used from an external script
    # In a real application, you'd need to handle authentication and use actual server URLs
    
    # For demonstration only - this code won't run as is since we're in the Django project
    if False:
        # Set your API credentials
        api_url = "http://localhost:8000/api"
        headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer your_auth_token"
        }
        
        # List available templates
        response = requests.get(f"{api_url}/landing-page-templates/", headers=headers)
        templates = response.json()["templates"]
        print(f"Available templates: {len(templates)}")
        
        # Create from template
        template_id = templates[0]["id"]
        variables = {
            "heading": "API Created Page",
            "content": "This page was created via API"
        }
        
        response = requests.post(
            f"{api_url}/landing-page-templates/create-page/",
            headers=headers,
            json={
                "template_id": template_id,
                "title": "API Example Page",
                "variables": variables
            }
        )
        
        result = response.json()
        print(f"Created landing page via API: {result['title']}")
        print(f"URL: {result['url']}")


def get_full_url(path):
    """Get the full URL including domain"""
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
    return f"{site_url}{path}"


if __name__ == "__main__":
    print("=== Landing Page Creation Examples ===")
    
    # Example 1: Direct creation
    direct_page = create_direct_landing_page()
    
    # Example 2: Create from template
    template_page = create_landing_page_from_existing_template()
    
    # Example 3: API usage (commented out)
    use_api_example()
    
    print("\nExamples completed. Review the created pages in the admin interface.") 