# WordPress API Integration Guide

This document explains the WordPress JSON API endpoints used by the RPK Construction Estimate Calculator.

## API Endpoints

### Base URLs

#### Development

```
http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data
```

#### Production

```
https://rpkconstruction.com/wp-json/estimate-calculator/v1/get-calculator-data
```

## Endpoint Usage

### Homepage Data

**URL**: `{base_url}?slug=calculator-home`

**Full Examples**:

- Development: `http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home`
- Production: `https://rpkconstruction.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home`

### Category Data (Future Use)

**URL**: `{base_url}?slug={category-slug}`

**Examples**:

- Kitchens: `?slug=kitchens`
- Bathrooms: `?slug=bathrooms`
- Basements: `?slug=basements`
- Windows: `?slug=windows`
- Flooring: `?slug=flooring`
- Home Renovations: `?slug=home-renovations`
- Structural: `?slug=structural`

## Expected Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "headline": "RPK Construction - Professional Estimate Calculator",
    "categories": [
      {
        "id": "kitchens",
        "title": "Kitchens",
        "description": "Custom kitchen design and renovation estimates",
        "image": "https://rpkconstruction.com/wp-content/uploads/kitchen-image.jpg",
        "detailContent": "Transform your kitchen with our comprehensive renovation estimates..."
      },
      {
        "id": "bathrooms",
        "title": "Bathrooms",
        "description": "Complete bathroom renovation and remodeling estimates",
        "image": "https://rpkconstruction.com/wp-content/uploads/bathroom-image.jpg",
        "detailContent": "Upgrade your bathroom with professional renovation estimates..."
      }
      // ... additional categories
    ]
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description here"
}
```

## WordPress Plugin Requirements

Your WordPress installation needs a custom plugin or REST API endpoint that:

1. **Registers the custom endpoint**: `/wp-json/estimate-calculator/v1/get-calculator-data`
2. **Handles slug parameter**: Accepts `?slug=calculator-home` for homepage data
3. **Returns proper JSON format**: Follows the success/error response structure above
4. **Sets CORS headers**: Allows requests from your frontend domain

### Sample WordPress Plugin Code

```php
<?php
/**
 * Plugin Name: RPK Construction Estimate Calculator API
 * Description: Custom REST API endpoints for the estimate calculator
 * Version: 1.0.0
 */

// Register REST API endpoint
add_action('rest_api_init', function () {
    register_rest_route('estimate-calculator/v1', '/get-calculator-data', array(
        'methods' => 'GET',
        'callback' => 'get_calculator_data',
        'permission_callback' => '__return_true', // Make endpoint public
        'args' => array(
            'slug' => array(
                'required' => true,
                'validate_callback' => function($param, $request, $key) {
                    return is_string($param);
                }
            ),
        ),
    ));
});

function get_calculator_data(WP_REST_Request $request) {
    $slug = $request->get_param('slug');

    if ($slug === 'calculator-home') {
        // Return homepage data
        return array(
            'success' => true,
            'data' => array(
                'headline' => get_option('calculator_headline', 'RPK Construction - Professional Estimate Calculator'),
                'categories' => get_calculator_categories()
            )
        );
    }

    // Handle other slugs (category pages, etc.)
    return array(
        'success' => false,
        'message' => 'Slug not found: ' . $slug
    );
}

function get_calculator_categories() {
    // This should fetch from your WordPress database/options
    // or return the hardcoded categories
    return array(
        array(
            'id' => 'kitchens',
            'title' => 'Kitchens',
            'description' => 'Custom kitchen design and renovation estimates',
            'image' => wp_get_attachment_url(get_option('kitchen_image_id')),
            'detailContent' => get_option('kitchen_detail_content', 'Default kitchen content...')
        ),
        // ... other categories
    );
}

// Add CORS headers for cross-origin requests
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $value;
    });
});
?>
```

## Testing the API

### Using curl

```bash
# Test homepage endpoint
curl -X GET "http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home"

# Test production endpoint
curl -X GET "https://rpkconstruction.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home"
```

### Using browser

Visit the URL directly in your browser:

```
http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home
```

## Application Configuration

The React application will automatically use:

- **Development**: `http://localhost:8080/wp-json/...` when `NODE_ENV=development`
- **Production**: `https://rpkconstruction.com/wp-json/...` when `NODE_ENV=production`
- **Mock Data**: Falls back to built-in mock data if API fails in development

## Troubleshooting

### Common Issues

1. **404 Not Found**

   - Ensure the WordPress plugin is activated
   - Check that the REST API endpoint is properly registered
   - Verify the URL structure is correct

2. **CORS Errors**

   - Add proper CORS headers in your WordPress plugin
   - Ensure `Access-Control-Allow-Origin` is set correctly

3. **Empty Response**

   - Check that the `calculator-home` slug handler is implemented
   - Verify the response format matches the expected structure

4. **SSL Certificate Issues**
   - Ensure HTTPS is properly configured for production
   - Check that the SSL certificate is valid

### Debug Steps

1. **Test API Directly**: Use curl or browser to test the endpoint
2. **Check WordPress Logs**: Look for PHP errors in WordPress debug logs
3. **Browser Network Tab**: Check the actual requests being made
4. **React Console**: Look for API configuration logs in development mode
