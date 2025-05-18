"""
Landing Page Generator

This module provides utility functions to programmatically create and manage landing pages.
It follows the same structure and configuration as landing pages created through the admin interface.
"""

import uuid
import logging
from django.utils.text import slugify
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.db import models
from .models import LandingPage

logger = logging.getLogger(__name__)

def create_landing_page(
    title, 
    html_content,
    css_content="",
    js_content="",
    google_pixel_id="",
    facebook_pixel_id="",
    meta_robots="noindex, nofollow",
    is_active=True
):
    """
    Create a new landing page programmatically.
    
    Args:
        title (str): Title of the landing page
        html_content (str): HTML content of the page
        css_content (str, optional): CSS styles for the page
        js_content (str, optional): JavaScript code for the page
        google_pixel_id (str, optional): Google Pixel/GTM ID
        facebook_pixel_id (str, optional): Facebook Pixel ID
        meta_robots (str, optional): Meta robots directive
        is_active (bool, optional): Whether the page is active
        
    Returns:
        tuple: (LandingPage instance, url)
    """
    try:
        # Generate a unique slug
        unique_id = uuid.uuid4().hex[:12]
        slug = f"lp-{unique_id}"
        
        # Create landing page
        landing_page = LandingPage.objects.create(
            title=title,
            slug=slug,
            html_content=html_content,
            css_content=css_content,
            js_content=js_content,
            google_pixel_id=google_pixel_id,
            facebook_pixel_id=facebook_pixel_id,
            meta_robots=meta_robots,
            is_active=is_active
        )
        
        logger.info(f"Successfully created landing page: {title} (ID: {landing_page.id}, Slug: {slug})")
        
        # Return the landing page and its URL
        url = landing_page.get_absolute_url()
        return landing_page, url
        
    except Exception as e:
        logger.error(f"Error creating landing page: {str(e)}")
        raise
        
def update_landing_page(landing_page_id, **kwargs):
    """
    Update an existing landing page.
    
    Args:
        landing_page_id (int): ID of the landing page to update
        **kwargs: Fields to update (title, html_content, css_content, etc.)
        
    Returns:
        LandingPage: Updated landing page instance
    """
    try:
        landing_page = LandingPage.objects.get(id=landing_page_id)
        
        # Update fields
        for field, value in kwargs.items():
            if hasattr(landing_page, field):
                setattr(landing_page, field, value)
        
        landing_page.save()
        logger.info(f"Successfully updated landing page ID {landing_page_id}")
        return landing_page
        
    except LandingPage.DoesNotExist:
        logger.error(f"Landing page with ID {landing_page_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error updating landing page: {str(e)}")
        raise
        
def generate_new_link(landing_page_id):
    """
    Generate a new unique link for an existing landing page.
    
    Args:
        landing_page_id (int): ID of the landing page
        
    Returns:
        str: New URL for the landing page
    """
    try:
        landing_page = LandingPage.objects.get(id=landing_page_id)
        url = landing_page.generate_new_link()
        logger.info(f"Generated new link for landing page ID {landing_page_id}: {url}")
        return url
        
    except LandingPage.DoesNotExist:
        logger.error(f"Landing page with ID {landing_page_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error generating new link: {str(e)}")
        raise
        
def deactivate_landing_page(landing_page_id):
    """
    Deactivate a landing page.
    
    Args:
        landing_page_id (int): ID of the landing page to deactivate
        
    Returns:
        bool: True if successful
    """
    return update_landing_page(landing_page_id, is_active=False)
    
def activate_landing_page(landing_page_id):
    """
    Activate a landing page.
    
    Args:
        landing_page_id (int): ID of the landing page to activate
        
    Returns:
        bool: True if successful
    """
    return update_landing_page(landing_page_id, is_active=True)
    
def create_landing_page_from_template(
    title,
    template_content,
    template_variables=None,
    **kwargs
):
    """
    Create a landing page from a template with variable substitution.
    
    Args:
        title (str): Title of the landing page
        template_content (str): HTML template with placeholders
        template_variables (dict, optional): Variables to substitute in the template
        **kwargs: Additional parameters for create_landing_page
        
    Returns:
        tuple: (LandingPage instance, url)
    """
    # Handle template variables
    if template_variables:
        html_content = template_content
        for key, value in template_variables.items():
            placeholder = f"{{{{{key}}}}}"
            html_content = html_content.replace(placeholder, str(value))
    else:
        html_content = template_content
        
    return create_landing_page(title=title, html_content=html_content, **kwargs)

def find_landing_pages(search_query=None, is_active=None):
    """
    Find landing pages based on search criteria.
    
    Args:
        search_query (str, optional): Search string for title or content
        is_active (bool, optional): Filter by active status
        
    Returns:
        QuerySet: Filtered landing pages
    """
    query = LandingPage.objects.all()
    
    if is_active is not None:
        query = query.filter(is_active=is_active)
        
    if search_query:
        query = query.filter(
            models.Q(title__icontains=search_query) |
            models.Q(html_content__icontains=search_query) |
            models.Q(slug__icontains=search_query)
        )
        
    return query.order_by('-created_at') 