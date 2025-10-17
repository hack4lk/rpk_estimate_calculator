# WordPress Integration Guide

This guide explains how to integrate the Estimate Calculator React app into WordPress using shortcodes.

## Setup Instructions

### 1. Build the React App

First, build the React app for production:

```bash
npm run build
```

This creates optimized files in the `build/` directory.

### 2. Upload Files to WordPress

Upload the built files to your WordPress installation:

1. **Copy build files**: Upload the contents of the `build/` directory to:

   - `wp-content/plugins/estimate-calculator/build/`
   - OR `wp-content/themes/your-theme/assets/estimate-calculator/`

2. **Copy shortcode file**: Upload `public/wordpress-shortcode.php` to:
   - `wp-content/plugins/estimate-calculator/` (if creating a plugin)
   - OR include it in your theme's `functions.php`

### 3. WordPress Plugin Approach (Recommended)

Create a simple WordPress plugin:

1. Create directory: `wp-content/plugins/estimate-calculator/`
2. Create main plugin file: `estimate-calculator.php`

```php
<?php
/**
 * Plugin Name: Estimate Calculator
 * Description: Interactive construction estimate calculator
 * Version: 1.0.0
 * Author: Your Name
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Include the shortcode functionality
require_once plugin_dir_path(__FILE__) . 'wordpress-shortcode.php';
?>
```

3. Activate the plugin in WordPress admin

### 4. Theme Functions Approach (Alternative)

Add to your theme's `functions.php`:

```php
// Include the shortcode functionality
require_once get_template_directory() . '/assets/estimate-calculator/wordpress-shortcode.php';
```

## Usage

### Basic Shortcode

```
[estimate_calculator]
```

### Advanced Usage

```
[estimate_calculator container_id="my-calculator" category="kitchens" width="800px"]
```

#### Shortcode Parameters:

- `container_id`: Custom container ID (default: estimate-calculator-app)
- `category`: Pre-select category (kitchens, bathrooms, basements, etc.)
- `width`: Container width (default: 100%)
- `height`: Container height (default: auto)
- `class`: Additional CSS classes

### URL Parameters

The app also supports direct category navigation via URL:

```
https://yoursite.com/page/?calculator-category=kitchens
```

## Customization

### CSS Styling

The app includes these CSS classes for customization:

```css
/* Container styling */
.estimate-calculator-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Embedded mode styling */
.App.embedded {
  background: transparent;
  min-height: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .estimate-calculator-container {
    padding: 10px;
  }
}
```

### JavaScript Customization

The app exposes global functions for advanced integration:

```javascript
// Manually render in specific container
window.EstimateCalculator.render("my-custom-container");

// Initialize/re-initialize the app
window.EstimateCalculator.init();
```

## File Structure

```
wp-content/plugins/estimate-calculator/
├── estimate-calculator.php          # Main plugin file
├── wordpress-shortcode.php          # Shortcode functionality
└── build/                          # React app build files
    ├── static/
    │   ├── css/
    │   │   └── main.css
    │   └── js/
    │       └── main.js
    └── index.html
```

## Troubleshooting

### Common Issues:

1. **App not loading**: Check browser console for JavaScript errors
2. **Styles missing**: Verify CSS file paths in `wordpress-shortcode.php`
3. **API errors**: Ensure WordPress API endpoints are accessible

### Debug Mode:

Enable WordPress debug mode to see detailed error messages:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

### Browser Console:

The app logs its initialization:

```
✅ Estimate Calculator rendered in container: estimate-calculator-app
```

## Security Considerations

1. **Sanitization**: All shortcode inputs are sanitized
2. **File permissions**: Ensure proper file permissions on uploaded files
3. **API endpoints**: Verify API endpoints are properly secured
4. **CORS**: Configure CORS settings if needed

## Performance Optimization

1. **Caching**: Use WordPress caching plugins
2. **CDN**: Consider serving static assets from CDN
3. **Lazy loading**: Only load on pages that use the shortcode
4. **Minification**: Ensure build files are minified

## Support

For issues or questions:

1. Check browser console for errors
2. Verify file paths and permissions
3. Test with default WordPress theme
4. Check WordPress error logs
