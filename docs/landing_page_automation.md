# Landing Page Automation Guide

This guide explains how to use the landing page automation features to programmatically create and manage landing pages without manually inserting HTML, CSS, and JS through the admin panel.

## Features

- Create landing pages programmatically with HTML, CSS, and JavaScript
- Create reusable templates with variable placeholders
- Generate landing pages from templates with custom variables
- Manage landing pages via API endpoints
- Command-line utility for creating landing pages

## API Endpoints

All API endpoints require staff authentication. The following endpoints are available:

### List Landing Pages

```
GET /api/landing-pages/
```

Query parameters:
- `search`: Search by title, slug, or content
- `is_active`: Filter by active status (true/false)

### Create Landing Page

```
POST /api/landing-pages/create/
```

Request body:
```json
{
  "title": "My Landing Page",
  "html_content": "<html><body><h1>Hello World</h1></body></html>",
  "css_content": "h1 { color: blue; }",
  "js_content": "console.log('Hello');",
  "google_pixel_id": "GTM-XXXX",
  "facebook_pixel_id": "123456789",
  "meta_robots": "noindex, nofollow",
  "is_active": true
}
```

### Update Landing Page

```
PUT/PATCH /api/landing-pages/<id>/update/
```

Request body (any field from the create endpoint):
```json
{
  "title": "Updated Title",
  "html_content": "<html><body><h1>Updated Content</h1></body></html>"
}
```

### Generate New Link

```
POST /api/landing-pages/<id>/generate-link/
```

### Change Status

```
POST /api/landing-pages/<id>/status/
```

Request body:
```json
{
  "action": "activate"  // or "deactivate"
}
```

### List Templates

```
GET /api/landing-page-templates/
```

### Create Page from Template

```
POST /api/landing-page-templates/create-page/
```

Request body:
```json
{
  "template_id": 1,
  "title": "Page from Template",
  "variables": {
    "heading": "Welcome",
    "content": "This is my page",
    "background_color": "#f0f0f0"
  }
}
```

## Management Command

You can create landing pages from the command line using:

```bash
python manage.py create_landing_page --title "My Page" --html path/to/file.html
```

or with a template:

```bash
python manage.py create_landing_page --title "Template Page" --template-id 1 --variables '{"heading": "Welcome"}'
```

Options:
- `--title`: Title of the landing page (required)
- `--html`: HTML content or path to HTML file (required if not using template)
- `--template-id`: ID of template to use (required if not using HTML)
- `--css`: CSS content or path to CSS file
- `--js`: JavaScript content or path to JS file
- `--google-pixel-id`: Google Pixel/GTM ID
- `--facebook-pixel-id`: Facebook Pixel ID
- `--meta-robots`: Meta robots directive (default: "noindex, nofollow")
- `--inactive`: Create as inactive
- `--variables`: JSON string or path to JSON file with template variables

## Python API

You can use the Python API directly in your code:

```python
from prometei.landing_page_generator import create_landing_page
from prometei.models import LandingPageTemplate

# Create a landing page directly
landing_page, url = create_landing_page(
    title="My Page",
    html_content="<html><body><h1>Hello</h1></body></html>",
    css_content="h1 { color: red; }"
)

# Create from template
template = LandingPageTemplate.objects.get(id=1)
landing_page, url = template.create_landing_page(
    title="From Template",
    variables={"heading": "Welcome"}
)
```

## Creating Templates

Templates can be created through the admin interface under "Landing Page Templates".

In your template HTML, use `{{variable_name}}` for placeholders that will be replaced when creating a page.

Example:
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{title}}</title>
</head>
<body style="background-color: {{background_color}}">
    <h1>{{heading}}</h1>
    <div class="content">{{content}}</div>
</body>
</html>
```

Define available variables as a JSON object:
```json
{
  "title": "Page title",
  "heading": "Main heading text",
  "content": "Body content text",
  "background_color": "Background color (e.g., #ffffff)"
}
```

## Tracking and Analytics

All landing pages created programmatically have the same tracking features as those created through the admin interface:

- Visitor tracking
- Mouse movement tracking
- Click tracking
- Form submission tracking
- Google and Facebook pixel integration 