#!/usr/bin/env python
"""
Landing Page API Client

A simple Python client for the Prometey Landing Page API.
"""

import requests
import json
from typing import Dict, List, Optional, Union, Any


class LandingPageClient:
    """Client for the Landing Page API."""
    
    def __init__(self, base_url: str, username: str = None, password: str = None, token: str = None):
        """
        Initialize the Landing Page API client.
        
        Args:
            base_url: Base URL of the API (e.g., "https://example.com")
            username: Admin username for authentication
            password: Admin password for authentication
            token: Authentication token (alternative to username/password)
        """
        self.base_url = base_url.rstrip('/')
        self.api_base = f"{self.base_url}/api"
        self.session = requests.Session()
        self.token = token
        
        # Set up session headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
        # Authenticate if credentials provided
        if username and password and not token:
            self._authenticate(username, password)
        elif token:
            self.session.headers.update({'Authorization': f'Token {token}'})
    
    def _authenticate(self, username: str, password: str) -> None:
        """Authenticate with the API using username and password."""
        # This is a placeholder. The actual authentication would depend on
        # the authentication method used by your Django application.
        # For token authentication, you'd typically make a request to obtain a token.
        
        # Example for Django's token auth:
        # response = self.session.post(
        #     f"{self.base_url}/api-token-auth/",
        #     json={"username": username, "password": password}
        # )
        # if response.status_code == 200:
        #     self.token = response.json()["token"]
        #     self.session.headers.update({'Authorization': f'Token {self.token}'})
        # else:
        #     raise Exception(f"Authentication failed: {response.text}")
        
        # For session authentication (using cookies):
        response = self.session.post(
            f"{self.base_url}/admin/login/",
            data={"username": username, "password": password, "next": "/admin/"}
        )
        if response.status_code != 200 or "Log in" in response.text:
            raise Exception("Authentication failed")
    
    def list_templates(self) -> List[Dict[str, Any]]:
        """List all available landing page templates."""
        response = self.session.get(f"{self.api_base}/landing-page-templates/")
        self._check_response(response)
        return response.json().get('templates', [])
    
    def create_from_template(
        self, 
        template_id: int, 
        title: str, 
        variables: Dict[str, str],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a landing page from a template.
        
        Args:
            template_id: ID of the template to use
            title: Title of the landing page
            variables: Variables to replace in the template
            **kwargs: Additional parameters (google_pixel_id, facebook_pixel_id, etc.)
            
        Returns:
            Dict containing information about the created landing page
        """
        data = {
            'template_id': template_id,
            'title': title,
            'variables': variables
        }
        data.update(kwargs)
        
        response = self.session.post(
            f"{self.api_base}/landing-page-templates/create-page/",
            json=data
        )
        self._check_response(response)
        return response.json()
    
    def create_landing_page(
        self, 
        title: str, 
        html_content: str,
        css_content: str = "",
        js_content: str = "",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a landing page directly with HTML, CSS, and JS.
        
        Args:
            title: Title of the landing page
            html_content: HTML content
            css_content: CSS content (optional)
            js_content: JavaScript content (optional)
            **kwargs: Additional parameters (google_pixel_id, facebook_pixel_id, etc.)
            
        Returns:
            Dict containing information about the created landing page
        """
        data = {
            'title': title,
            'html_content': html_content,
            'css_content': css_content,
            'js_content': js_content
        }
        data.update(kwargs)
        
        response = self.session.post(
            f"{self.api_base}/landing-pages/create/",
            json=data
        )
        self._check_response(response)
        return response.json()
    
    def list_landing_pages(
        self, 
        search: Optional[str] = None, 
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        List landing pages with optional filtering.
        
        Args:
            search: Search query for title, slug, or content
            is_active: Filter by active status
            
        Returns:
            List of landing pages
        """
        params = {}
        if search:
            params['search'] = search
        if is_active is not None:
            params['is_active'] = str(is_active).lower()
            
        response = self.session.get(f"{self.api_base}/landing-pages/", params=params)
        self._check_response(response)
        return response.json().get('landing_pages', [])
    
    def update_landing_page(
        self, 
        landing_page_id: int, 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Update an existing landing page.
        
        Args:
            landing_page_id: ID of the landing page
            **kwargs: Fields to update (title, html_content, css_content, etc.)
            
        Returns:
            Dict containing information about the updated landing page
        """
        response = self.session.put(
            f"{self.api_base}/landing-pages/{landing_page_id}/update/",
            json=kwargs
        )
        self._check_response(response)
        return response.json()
    
    def generate_new_link(self, landing_page_id: int) -> Dict[str, Any]:
        """
        Generate a new link for a landing page.
        
        Args:
            landing_page_id: ID of the landing page
            
        Returns:
            Dict containing information about the landing page with new link
        """
        response = self.session.post(
            f"{self.api_base}/landing-pages/{landing_page_id}/generate-link/"
        )
        self._check_response(response)
        return response.json()
    
    def change_status(self, landing_page_id: int, activate: bool) -> Dict[str, Any]:
        """
        Activate or deactivate a landing page.
        
        Args:
            landing_page_id: ID of the landing page
            activate: True to activate, False to deactivate
            
        Returns:
            Dict containing information about the updated landing page
        """
        action = "activate" if activate else "deactivate"
        response = self.session.post(
            f"{self.api_base}/landing-pages/{landing_page_id}/status/",
            json={'action': action}
        )
        self._check_response(response)
        return response.json()
    
    def _check_response(self, response: requests.Response) -> None:
        """Check if the response is successful and raise an exception if not."""
        if response.status_code >= 400:
            try:
                error_msg = response.json().get('message', response.text)
            except ValueError:
                error_msg = response.text
                
            raise Exception(f"API error ({response.status_code}): {error_msg}")


# Example usage
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: landing_page_client.py <base_url> [username] [password]")
        sys.exit(1)
        
    base_url = sys.argv[1]
    username = sys.argv[2] if len(sys.argv) > 2 else None
    password = sys.argv[3] if len(sys.argv) > 3 else None
    
    client = LandingPageClient(base_url, username, password)
    
    try:
        # List templates
        print("Listing templates...")
        templates = client.list_templates()
        print(f"Found {len(templates)} templates")
        
        if templates:
            # Create from template
            template_id = templates[0]['id']
            print(f"Creating landing page from template {template_id}...")
            variables = {
                'title': 'Client Example Page',
                'heading': 'Created with Python Client',
                'content': '<p>This page was created using the Python client library.</p>'
            }
            result = client.create_from_template(
                template_id=template_id,
                title="Python Client Example",
                variables=variables
            )
            print(f"Created landing page: {result['title']}")
            print(f"URL: {base_url}{result['url']}")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1) 