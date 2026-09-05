"""
Static Site Generator for BuildAndHost
Converts website JSON to a standalone HTML page with embedded React renderer
"""
import json
from pathlib import Path
from typing import Dict, Any


def normalize_image_src(value):
    """Extract string URL from object if needed (e.g., {"url": "..."} -> "...")"""
    if isinstance(value, dict):
        # Check for {"url": "..."} or {"src": "..."} patterns
        if "url" in value and isinstance(value["url"], str):
            return value["url"]
        if "src" in value and isinstance(value["src"], str):
            return value["src"]
    return value


def normalize_website_images(node):
    """Recursively normalize Image src values in website JSON to fix [object Object] issue"""
    if not isinstance(node, dict):
        return node
    
    # Normalize Image component src
    if node.get("type") == "Image" and "props" in node:
        if "src" in node["props"]:
            node["props"]["src"] = normalize_image_src(node["props"]["src"])
    
    # Normalize Hero component image
    if node.get("type") == "Hero" and "props" in node:
        if "image" in node["props"]:
            node["props"]["image"] = normalize_image_src(node["props"]["image"])
    
    # Normalize Card component image
    if node.get("type") == "Card" and "props" in node:
        if "image" in node["props"]:
            node["props"]["image"] = normalize_image_src(node["props"]["image"])
    
    # Recursively process children
    if "children" in node and isinstance(node["children"], list):
        for child in node["children"]:
            normalize_website_images(child)
    
    return node


def generate_static_html(website_json: Dict[Any, Any], theme_json: Dict[Any, Any] = None) -> str:
    """
    Generate a standalone HTML file with website JSON and React renderer
    
    Args:
        website_json: The website structure JSON
        theme_json: Optional theme configuration JSON
        
    Returns:
        Complete HTML string ready to be served
    """
    
    # Extract website data - handle both formats
    if 'website' in website_json:
        website_data = website_json['website']
    else:
        website_data = website_json
    
    # Default theme if not provided
    if theme_json is None:
        theme_json = {
            "colors": {
                "primary": "#3b82f6",
                "secondary": "#8b5cf6",
                "background": "#ffffff",
                "text": "#1f2937"
            },
            "fonts": {
                "heading": "system-ui, -apple-system, sans-serif",
                "body": "system-ui, -apple-system, sans-serif"
            }
        }
    
    # Normalize image src values to fix [object Object] issue in deployed sites
    website_data = normalize_website_images(website_data)
    
    # Escape JSON for embedding in HTML
    website_json_str = json.dumps(website_data, indent=2).replace('</', '<\\/')
    theme_json_str = json.dumps(theme_json, indent=2).replace('</', '<\\/')
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website</title>
    
    <!-- React and ReactDOM from CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: {theme_json.get('fonts', {}).get('body', 'system-ui, -apple-system, sans-serif')};
            color: {theme_json.get('colors', {}).get('text', '#1f2937')};
            background-color: {theme_json.get('colors', {}).get('background', '#ffffff')};
            line-height: 1.6;
        }}
        
        h1, h2, h3, h4, h5, h6 {{
            font-family: {theme_json.get('fonts', {}).get('heading', 'system-ui, -apple-system, sans-serif')};
            font-weight: 700;
            line-height: 1.2;
        }}
        
        h1 {{ font-size: 2.5rem; }}
        h2 {{ font-size: 2rem; }}
        h3 {{ font-size: 1.5rem; }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }}
        
        .section {{
            padding: 4rem 0;
        }}
        
        .navbar {{
            position: sticky;
            top: 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            padding: 1rem 0;
            z-index: 1000;
        }}
        
        .navbar-content {{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .nav-items {{
            display: flex;
            gap: 2rem;
            list-style: none;
        }}
        
        .nav-items a {{
            text-decoration: none;
            color: {theme_json.get('colors', {}).get('text', '#1f2937')};
            font-weight: 500;
            transition: color 0.2s;
        }}
        
        .nav-items a:hover {{
            color: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
        }}
        
        .hero {{
            padding: 6rem 0;
            text-align: center;
            background: linear-gradient(135deg, {theme_json.get('colors', {}).get('primary', '#3b82f6')}15 0%, {theme_json.get('colors', {}).get('secondary', '#8b5cf6')}15 100%);
        }}
        
        .hero h1 {{
            margin-bottom: 1rem;
            color: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
        }}
        
        .hero p {{
            font-size: 1.25rem;
            margin-bottom: 2rem;
            color: {theme_json.get('colors', {}).get('text', '#1f2937')};
            opacity: 0.9;
        }}
        
        .button {{
            display: inline-block;
            padding: 0.75rem 2rem;
            background: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
            color: white;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
        }}
        
        .button:hover {{
            background: {theme_json.get('colors', {}).get('secondary', '#8b5cf6')};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }}
        
        .grid {{
            display: grid;
            gap: 2rem;
        }}
        
        .grid-2 {{ grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }}
        .grid-3 {{ grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }}
        
        .card {{
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }}
        
        .card:hover {{
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateY(-4px);
        }}
        
        .stack {{
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }}
        
        img {{
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
        }}
        
        .footer {{
            background: #f9fafb;
            padding: 3rem 0;
            margin-top: 4rem;
            text-align: center;
            color: #6b7280;
        }}
        
        .contact-form {{
            max-width: 600px;
            margin: 0 auto;
        }}
        
        .form-group {{
            margin-bottom: 1.5rem;
        }}
        
        .form-group label {{
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
        }}
        
        .form-group input,
        .form-group textarea {{
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            font-family: inherit;
        }}
        
        .form-group textarea {{
            min-height: 150px;
            resize: vertical;
        }}
        
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
            text-align: center;
        }}
        
        .stat-item h3 {{
            color: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }}
        
        .timeline {{
            position: relative;
            padding-left: 2rem;
        }}
        
        .timeline::before {{
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
        }}
        
        .timeline-item {{
            position: relative;
            margin-bottom: 2rem;
            padding-left: 2rem;
        }}
        
        .timeline-item::before {{
            content: '';
            position: absolute;
            left: -2.5rem;
            top: 0.5rem;
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
            background: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
        }}
        
        .gallery {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
        }}
        
        .gallery img {{
            width: 100%;
            height: 250px;
            object-fit: cover;
        }}
        
        .faq {{
            max-width: 800px;
            margin: 0 auto;
        }}
        
        .faq-item {{
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        
        .faq-question {{
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: {theme_json.get('colors', {}).get('primary', '#3b82f6')};
        }}
        
        @media (max-width: 768px) {{
            .nav-items {{
                display: none;
            }}
            
            .hero h1 {{
                font-size: 2rem;
            }}
            
            .hero p {{
                font-size: 1rem;
            }}
        }}
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/javascript">
        // Website data
        const websiteData = {website_json_str};
        const themeData = {theme_json_str};
        
        // React components
        const {{ createElement: h, Fragment }} = React;
        
        // Simple component renderer
        function Renderer({{ node }}) {{
            if (!node || typeof node !== 'object') {{
                return node;
            }}
            
            const {{ type, props = {{}}, children = [] }} = node;
            
            // Map component types to HTML elements or custom renderers
            const componentMap = {{
                'Page': 'div',
                'Section': 'section',
                'Container': 'div',
                'Stack': 'div',
                'Grid': 'div',
                'Card': 'div',
                'Heading': renderHeading,
                'Text': 'p',
                'Paragraph': 'p',
                'Image': 'img',
                'Button': 'button',
                'Navbar': renderNavbar,
                'Hero': renderHero,
                'Footer': renderFooter,
                'ContactForm': renderContactForm,
                'Stats': renderStats,
                'Timeline': renderTimeline,
                'Gallery': renderGallery,
                'FAQ': renderFAQ,
                'FeatureList': renderFeatureList,
            }};
            
            const Component = componentMap[type];
            
            if (!Component) {{
                console.warn('Unknown component type:', type);
                return null;
            }}
            
            // Handle custom renderers (functions)
            if (typeof Component === 'function') {{
                return Component({{ ...props, children }});
            }}
            
            // Add class names based on component type
            const className = getClassName(type, props);
            const elementProps = {{ ...props, className }};
            
            // Handle children
            const renderedChildren = children.map((child, index) => 
                h(Renderer, {{ key: index, node: child }})
            );
            
            // Add text content if specified
            if (props.text || props.content) {{
                renderedChildren.push(props.text || props.content);
            }}
            
            return h(Component, elementProps, ...renderedChildren);
        }}
        
        function getClassName(type, props) {{
            const classes = [type.toLowerCase()];
            
            if (type === 'Container') classes.push('container');
            if (type === 'Section') classes.push('section');
            if (type === 'Stack') classes.push('stack');
            if (type === 'Card') classes.push('card');
            if (type === 'Grid') {{
                classes.push('grid');
                if (props.columns) classes.push(`grid-${{props.columns}}`);
            }}
            
            if (props.className) classes.push(props.className);
            
            return classes.join(' ');
        }}
        
        function renderHeading({{ level = 2, text, children }}) {{
            const tag = `h${{level}}`;
            return h(tag, {{}}, text || children);
        }}
        
        function renderNavbar({{ items = [], brand, children }}) {{
            return h('nav', {{ className: 'navbar' }},
                h('div', {{ className: 'container navbar-content' }},
                    brand && h('div', {{ className: 'navbar-brand' }}, brand),
                    h('ul', {{ className: 'nav-items' }},
                        items.map((item, i) => 
                            h('li', {{ key: i }},
                                h('a', {{ href: `#${{item.toLowerCase()}}` }}, item)
                            )
                        )
                    ),
                    ...children.map((child, i) => h(Renderer, {{ key: i, node: child }}))
                )
            );
        }}
        
        function renderHero({{ title, subtitle, buttonText, buttonAction, image, children }}) {{
            return h('div', {{ className: 'hero' }},
                h('div', {{ className: 'container' }},
                    title && h('h1', {{}}, title),
                    subtitle && h('p', {{}}, subtitle),
                    buttonText && h('a', {{ href: buttonAction || '#', className: 'button' }}, buttonText),
                    image && h('img', {{ src: image, alt: title || 'Hero image', style: {{ marginTop: '2rem', maxHeight: '400px' }} }}),
                    ...children.map((child, i) => h(Renderer, {{ key: i, node: child }}))
                )
            );
        }}
        
        function renderFooter({{ text, children }}) {{
            return h('footer', {{ className: 'footer' }},
                h('div', {{ className: 'container' }},
                    text && h('p', {{}}, text),
                    ...children.map((child, i) => h(Renderer, {{ key: i, node: child }}))
                )
            );
        }}
        
        function renderContactForm({{ title, children }}) {{
            return h('div', {{ className: 'contact-form' }},
                title && h('h2', {{}}, title),
                h('form', {{}},
                    h('div', {{ className: 'form-group' }},
                        h('label', {{}}, 'Name'),
                        h('input', {{ type: 'text', required: true }})
                    ),
                    h('div', {{ className: 'form-group' }},
                        h('label', {{}}, 'Email'),
                        h('input', {{ type: 'email', required: true }})
                    ),
                    h('div', {{ className: 'form-group' }},
                        h('label', {{}}, 'Message'),
                        h('textarea', {{ required: true }})
                    ),
                    h('button', {{ type: 'submit', className: 'button' }}, 'Send Message')
                )
            );
        }}
        
        function renderStats({{ stats = [], children }}) {{
            return h('div', {{ className: 'stats' }},
                stats.map((stat, i) =>
                    h('div', {{ key: i, className: 'stat-item' }},
                        h('h3', {{}}, stat.value),
                        h('p', {{}}, stat.label)
                    )
                )
            );
        }}
        
        function renderTimeline({{ items = [], children }}) {{
            return h('div', {{ className: 'timeline' }},
                items.map((item, i) =>
                    h('div', {{ key: i, className: 'timeline-item' }},
                        h('h3', {{}}, item.title),
                        h('p', {{}}, item.date),
                        h('p', {{}}, item.description)
                    )
                )
            );
        }}
        
        function renderGallery({{ images = [], children }}) {{
            return h('div', {{ className: 'gallery' }},
                images.map((img, i) =>
                    h('img', {{ key: i, src: img.src || img, alt: img.alt || `Image ${{i + 1}}` }})
                )
            );
        }}
        
        function renderFAQ({{ items = [], children }}) {{
            return h('div', {{ className: 'faq' }},
                items.map((item, i) =>
                    h('div', {{ key: i, className: 'faq-item' }},
                        h('div', {{ className: 'faq-question' }}, item.question),
                        h('div', {{ className: 'faq-answer' }}, item.answer)
                    )
                )
            );
        }}
        
        function renderFeatureList({{ features = [], columns = 3, children }}) {{
            return h('div', {{ className: `grid grid-${{columns}}` }},
                features.map((feature, i) =>
                    h('div', {{ key: i, className: 'card' }},
                        feature.icon && h('div', {{ style: {{ fontSize: '2rem', marginBottom: '1rem' }} }}, feature.icon),
                        feature.title && h('h3', {{}}, feature.title),
                        feature.description && h('p', {{}}, feature.description)
                    )
                )
            );
        }}
        
        // Render the app
        function App() {{
            return h(Renderer, {{ node: websiteData }});
        }}
        
        // Mount the app
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(h(App));
    </script>
</body>
</html>"""
    
    return html_content


def save_static_html(html_content: str, output_path: Path) -> bool:
    """
    Save the generated HTML to a file
    
    Args:
        html_content: The HTML string to save
        output_path: Path where to save the file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        return True
    except Exception as e:
        print(f"Failed to save HTML file: {e}")
        return False
