# Landing Page Automation

Automated creation and management of landing pages for Prometey Labs.

## Overview

This implementation provides a complete solution for programmatically creating and managing landing pages with the same structure and configuration as those created through the admin interface. The key advantage is avoiding manual HTML, CSS, and JS insertion in the admin panel.

## Features

- Create landing pages programmatically with HTML, CSS, and JavaScript
- Create reusable templates with variable placeholders
- Generate landing pages from templates with custom variables
- Manage landing pages via API endpoints
- Command-line utility for creating landing pages
- Python client library for easy integration

## Components

### Models

- `LandingPageTemplate`: Stores reusable landing page templates with variable placeholders

### Utilities

- `landing_page_generator.py`: Core functionality for programmatically creating and managing landing pages
- `create_landing_page.py`: Django management command to create landing pages from the command line
- `load_default_templates.py`: Django management command to load default landing page templates
- `create_landing_pages_example.py`: Example script demonstrating how to use the API
- `landing_page_client.py`: Python client library for the landing page API

### API Endpoints

- `api/landing-pages/`: List landing pages, with optional filtering
- `api/landing-pages/create/`: Create a new landing page
- `api/landing-pages/<id>/update/`: Update an existing landing page
- `api/landing-pages/<id>/generate-link/`: Generate a new unique link
- `api/landing-pages/<id>/status/`: Activate or deactivate a landing page
- `api/landing-page-templates/`: List available templates
- `api/landing-page-templates/create-page/`: Create a landing page from a template

## Usage

### 1. Creating a Landing Page Programmatically

```python
from prometei.landing_page_generator import create_landing_page

landing_page, url = create_landing_page(
    title="My Landing Page",
    html_content="<html><body><h1>Hello World</h1></body></html>",
    css_content="h1 { color: blue; }",
    js_content="console.log('Hello');",
    google_pixel_id="GTM-XXXX",  # Optional
    facebook_pixel_id="123456789"  # Optional
)

print(f"Created landing page: {landing_page.id}")
print(f"URL: {url}")
```

### 2. Creating a Landing Page from a Template

```python
from prometei.models import LandingPageTemplate

template = LandingPageTemplate.objects.get(id=1)
variables = {
    'heading': 'Welcome',
    'content': 'This is my page',
    'button_text': 'Contact Us'
}

landing_page, url = template.create_landing_page(
    title="From Template",
    variables=variables
)

print(f"Created landing page: {landing_page.id}")
print(f"URL: {url}")
```

### 3. Command-Line Creation

```bash
# Direct creation
python manage.py create_landing_page --title "My Page" --html path/to/file.html

# Creation from template
python manage.py create_landing_page --title "Template Page" --template-id 1 --variables '{"heading": "Welcome"}'
```

### 4. Using the Python Client

```python
from scripts.landing_page_client import LandingPageClient

client = LandingPageClient("http://example.com", username="admin", password="password")

# List templates
templates = client.list_templates()

# Create from template
result = client.create_from_template(
    template_id=1,
    title="Client Example",
    variables={"heading": "Hello World"}
)
print(f"Created page: {result['url']}")
```

## API Reference

See [landing_page_automation.md](landing_page_automation.md) for detailed API documentation.

## Default Templates

Two default templates are included:

1. **Simple Landing Page**: A basic landing page with customizable heading, content, and contact form
2. **Promotional Offer**: A landing page designed for special offers with countdown timer and pricing details

## Security

- All API endpoints require staff authentication
- Input sanitization using `bleach`
- Rate limiting for API requests
- CSRF protection for form submissions

## Tracking and Analytics

All landing pages created programmatically have the same tracking features as those created through the admin interface:

- Visitor tracking (IP, user agent, browser)
- Mouse movement tracking
- Click and interaction tracking
- Form submission tracking
- Google and Facebook pixel integration 