from django.core.management.base import BaseCommand
from django.utils.translation import gettext_lazy as _
from prometei.models import LandingPageTemplate

class Command(BaseCommand):
    help = _("Load default landing page templates")

    def handle(self, *args, **options):
        # Simple template
        simple_template = {
            'name': 'Simple Landing Page',
            'description': 'A basic landing page with customizable heading, content, and call-to-action button.',
            'html_template': '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo">{{company_name}}</div>
        </header>
        
        <main>
            <h1>{{heading}}</h1>
            <div class="content">
                {{content}}
            </div>
            
            <form id="contact-form" class="form">
                <h2>{{form_heading}}</h2>
                <div class="form-group">
                    <label for="name">{{name_label}}</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="contact">{{contact_label}}</label>
                    <input type="text" id="contact" name="contact" required>
                </div>
                <div class="form-group">
                    <label for="message">{{message_label}}</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn">{{button_text}}</button>
            </form>
        </main>
        
        <footer>
            <p>{{footer_text}}</p>
        </footer>
    </div>
</body>
</html>''',
            'css_content': '''body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: {{text_color}};
    background-color: {{background_color}};
    margin: 0;
    padding: 0;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: {{accent_color}};
}

main {
    padding: 40px 0;
}

h1 {
    font-size: 48px;
    color: {{heading_color}};
    margin-bottom: 20px;
}

.content {
    font-size: 18px;
    margin-bottom: 40px;
}

.form {
    background-color: {{form_background_color}};
    padding: 30px;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
}

.form h2 {
    color: {{form_heading_color}};
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
}

.form-group input,
.form-group textarea {
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
    background-color: {{button_color}};
    color: {{button_text_color}};
    border: none;
    padding: 12px 25px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: {{button_hover_color}};
}

footer {
    text-align: center;
    padding: 20px 0;
    margin-top: 40px;
    border-top: 1px solid #eee;
    color: #666;
}

@media (max-width: 768px) {
    h1 {
        font-size: 36px;
    }
    
    .form {
        padding: 20px;
    }
}''',
            'js_content': '''document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            contact: document.getElementById('contact').value,
            message: document.getElementById('message').value,
            landing_page_id: '{{landing_page_id}}' // Will be populated automatically
        };
        
        // Optional tracking visit ID
        const visitIdMeta = document.querySelector('meta[name="visit-id"]');
        if (visitIdMeta) {
            formData.visit_id = visitIdMeta.getAttribute('content');
        }
        
        // Submit the form
        fetch('/landing/submit-form/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                form.innerHTML = '<div class="success-message">{{success_message}}</div>';
            } else {
                alert('Error: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });
    
    // Helper function to get cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});''',
            'available_variables': {
                'title': 'Page title displayed in the browser tab',
                'company_name': 'Company or brand name shown in the header',
                'heading': 'Main heading of the page',
                'content': 'Main content text (supports HTML)',
                'form_heading': 'Heading for the contact form',
                'name_label': 'Label for the name field',
                'contact_label': 'Label for the contact field',
                'message_label': 'Label for the message field',
                'button_text': 'Text for the submit button',
                'success_message': 'Message shown after successful form submission',
                'footer_text': 'Text shown in the footer',
                
                # Colors
                'text_color': 'Main text color (e.g., #333333)',
                'background_color': 'Page background color (e.g., #ffffff)',
                'accent_color': 'Color for logo and accents (e.g., #ff6500)',
                'heading_color': 'Color for main heading (e.g., #222222)',
                'form_background_color': 'Background color for the form (e.g., #f8f8f8)',
                'form_heading_color': 'Color for form heading (e.g., #333333)',
                'button_color': 'Background color for the button (e.g., #ff6500)',
                'button_text_color': 'Text color for the button (e.g., #ffffff)',
                'button_hover_color': 'Background color for button hover (e.g., #e65c00)'
            }
        }
        
        # Promo template
        promo_template = {
            'name': 'Promotional Offer',
            'description': 'A landing page designed for special offers and promotions.',
            'html_template': '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
</head>
<body>
    <div class="container">
        <div class="offer-banner">
            <div class="offer-tag">{{offer_tag}}</div>
        </div>
        
        <header>
            <div class="logo">{{company_name}}</div>
        </header>
        
        <main>
            <div class="offer-section">
                <h1>{{heading}}</h1>
                <h2 class="subheading">{{subheading}}</h2>
                
                <div class="offer-details">
                    <div class="offer-price">
                        <div class="old-price">{{regular_price}}</div>
                        <div class="new-price">{{sale_price}}</div>
                    </div>
                    <div class="offer-timer" id="countdown">
                        {{timer_text}}
                    </div>
                </div>
                
                <div class="content">
                    {{content}}
                </div>
                
                <div class="cta-section">
                    <a href="#contact-form" class="cta-button">{{cta_text}}</a>
                </div>
            </div>
            
            <div class="benefits-section">
                <h3>{{benefits_heading}}</h3>
                <ul class="benefits-list">
                    <li>{{benefit_1}}</li>
                    <li>{{benefit_2}}</li>
                    <li>{{benefit_3}}</li>
                </ul>
            </div>
            
            <form id="contact-form" class="form">
                <h2>{{form_heading}}</h2>
                <div class="form-group">
                    <label for="name">{{name_label}}</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="contact">{{contact_label}}</label>
                    <input type="text" id="contact" name="contact" required>
                </div>
                <div class="form-group">
                    <label for="message">{{message_label}}</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit" class="btn">{{button_text}}</button>
                <div class="form-note">{{form_note}}</div>
            </form>
        </main>
        
        <footer>
            <p>{{footer_text}}</p>
        </footer>
    </div>
</body>
</html>''',
            'css_content': '''body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: {{text_color}};
    background-color: {{background_color}};
    margin: 0;
    padding: 0;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0;
}

.offer-banner {
    background-color: {{accent_color}};
    padding: 10px 0;
    text-align: center;
}

.offer-tag {
    color: white;
    font-weight: bold;
    font-size: 18px;
    letter-spacing: 1px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
}

.logo {
    font-size: 24px;
    font-weight: bold;
    color: {{accent_color}};
}

main {
    padding: 20px 0 60px;
}

.offer-section {
    text-align: center;
    padding: 40px 0;
}

h1 {
    font-size: 48px;
    color: {{heading_color}};
    margin-bottom: 10px;
}

.subheading {
    font-size: 24px;
    color: {{accent_color}};
    margin-bottom: 30px;
}

.offer-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 30px 0;
}

.offer-price {
    margin-bottom: 15px;
}

.old-price {
    font-size: 24px;
    text-decoration: line-through;
    color: #888;
    margin-bottom: 5px;
}

.new-price {
    font-size: 48px;
    font-weight: bold;
    color: {{accent_color}};
}

.offer-timer {
    font-size: 20px;
    font-weight: bold;
    color: {{timer_color}};
    background-color: {{timer_background}};
    padding: 10px 20px;
    border-radius: 5px;
    margin-top: 15px;
}

.content {
    font-size: 18px;
    max-width: 800px;
    margin: 0 auto 40px;
}

.cta-section {
    margin: 30px 0;
}

.cta-button {
    display: inline-block;
    background-color: {{button_color}};
    color: {{button_text_color}};
    padding: 15px 40px;
    font-size: 20px;
    font-weight: bold;
    text-decoration: none;
    border-radius: 5px;
    transition: background-color 0.3s;
}

.cta-button:hover {
    background-color: {{button_hover_color}};
}

.benefits-section {
    background-color: {{benefits_background}};
    padding: 40px;
    border-radius: 8px;
    margin-bottom: 50px;
}

.benefits-section h3 {
    color: {{heading_color}};
    font-size: 28px;
    margin-bottom: 20px;
}

.benefits-list {
    list-style-type: none;
    padding: 0;
}

.benefits-list li {
    padding: 10px 0 10px 30px;
    position: relative;
    font-size: 18px;
}

.benefits-list li:before {
    content: "✓";
    color: {{accent_color}};
    position: absolute;
    left: 0;
    top: 10px;
    font-weight: bold;
}

.form {
    background-color: {{form_background_color}};
    padding: 40px;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
}

.form h2 {
    color: {{form_heading_color}};
    margin-bottom: 30px;
    text-align: center;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
}

.form-group textarea {
    height: 120px;
}

.btn {
    width: 100%;
    background-color: {{button_color}};
    color: {{button_text_color}};
    border: none;
    padding: 15px;
    font-size: 18px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: {{button_hover_color}};
}

.form-note {
    font-size: 14px;
    color: #666;
    margin-top: 15px;
    text-align: center;
}

footer {
    text-align: center;
    padding: 20px 0;
    margin-top: 40px;
    border-top: 1px solid #eee;
    color: #666;
}

@media (max-width: 768px) {
    h1 {
        font-size: 36px;
    }
    
    .new-price {
        font-size: 36px;
    }
    
    .form {
        padding: 25px;
    }
    
    .benefits-section {
        padding: 25px;
    }
}''',
            'js_content': '''document.addEventListener('DOMContentLoaded', function() {
    // Set up countdown timer if end date is provided
    const endDateStr = '{{end_date}}'; // Format: YYYY-MM-DD
    if (endDateStr) {
        const endDate = new Date(endDateStr + 'T23:59:59');
        updateCountdown(endDate);
        
        // Update countdown every second
        setInterval(function() {
            updateCountdown(endDate);
        }, 1000);
    }
    
    // Handle form submission
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            contact: document.getElementById('contact').value,
            message: document.getElementById('message').value,
            landing_page_id: '{{landing_page_id}}' // Will be populated automatically
        };
        
        // Optional tracking visit ID
        const visitIdMeta = document.querySelector('meta[name="visit-id"]');
        if (visitIdMeta) {
            formData.visit_id = visitIdMeta.getAttribute('content');
        }
        
        // Submit the form
        fetch('/landing/submit-form/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                form.innerHTML = '<div class="success-message">{{success_message}}</div>';
            } else {
                alert('Error: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });
    
    // Helper function to update countdown
    function updateCountdown(endDate) {
        const now = new Date();
        const difference = endDate - now;
        
        if (difference <= 0) {
            document.getElementById('countdown').innerHTML = '{{offer_ended_text}}';
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').innerHTML = 
            `{{countdown_prefix}} ${days}д ${hours}г ${minutes}хв ${seconds}с`;
    }
    
    // Helper function to get cookies
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});''',
            'available_variables': {
                'title': 'Page title displayed in the browser tab',
                'company_name': 'Company or brand name shown in the header',
                'offer_tag': 'Short text for the top banner (e.g., "LIMITED TIME OFFER")',
                'heading': 'Main heading of the page',
                'subheading': 'Secondary heading that appears below the main heading',
                'regular_price': 'Original price (e.g., "₴1999")',
                'sale_price': 'Sale price (e.g., "₴999")',
                'timer_text': 'Initial countdown text (will be updated by JS)',
                'content': 'Main content text (supports HTML)',
                'cta_text': 'Call to action button text',
                'benefits_heading': 'Heading for the benefits section',
                'benefit_1': 'First benefit point',
                'benefit_2': 'Second benefit point',
                'benefit_3': 'Third benefit point',
                'form_heading': 'Heading for the contact form',
                'name_label': 'Label for the name field',
                'contact_label': 'Label for the contact field',
                'message_label': 'Label for the message field',
                'button_text': 'Text for the submit button',
                'form_note': 'Small text below the form (e.g., privacy note)',
                'success_message': 'Message shown after successful form submission',
                'footer_text': 'Text shown in the footer',
                'end_date': 'Date when offer ends (YYYY-MM-DD format)',
                'countdown_prefix': 'Text before countdown timer',
                'offer_ended_text': 'Text shown when countdown ends',
                
                # Colors
                'text_color': 'Main text color (e.g., #333333)',
                'background_color': 'Page background color (e.g., #ffffff)',
                'accent_color': 'Color for offer banner and accents (e.g., #ff6500)',
                'heading_color': 'Color for headings (e.g., #222222)',
                'timer_color': 'Text color for countdown timer (e.g., #ffffff)',
                'timer_background': 'Background color for countdown timer (e.g., #333333)',
                'benefits_background': 'Background color for benefits section (e.g., #f8f8f8)',
                'form_background_color': 'Background color for the form (e.g., #f8f8f8)',
                'form_heading_color': 'Color for form heading (e.g., #333333)',
                'button_color': 'Background color for buttons (e.g., #ff6500)',
                'button_text_color': 'Text color for buttons (e.g., #ffffff)',
                'button_hover_color': 'Background color for button hover (e.g., #e65c00)'
            }
        }
        
        # Create templates if they don't exist
        templates = [simple_template, promo_template]
        created_count = 0
        
        for template_data in templates:
            name = template_data['name']
            if not LandingPageTemplate.objects.filter(name=name).exists():
                LandingPageTemplate.objects.create(
                    name=name,
                    description=template_data['description'],
                    html_template=template_data['html_template'],
                    css_content=template_data['css_content'],
                    js_content=template_data['js_content'],
                    available_variables=template_data['available_variables']
                )
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created template: {name}"))
            else:
                self.stdout.write(f"Template already exists: {name}")
                
        if created_count == 0:
            self.stdout.write(self.style.WARNING("No new templates created - all already exist."))
        else:
            self.stdout.write(self.style.SUCCESS(f"Successfully created {created_count} templates.")) 