# Estimate Calculator WordPress Plugin

A WordPress plugin that provides REST API endpoints for retrieving calculator data from Advanced Custom Fields (ACF).

## Description

The Estimate Calculator plugin creates REST API endpoints to retrieve calculator questions and data from a custom post type called "calculator" using Advanced Custom Fields. It's designed to work with calculator posts that have ACF custom fields containing calculator or form questions.

## Features

- REST API endpoints for calculator data
- Custom post type "calculator" registration
- Built-in ACF dependency checking
- Flexible slug parameter support
- Comprehensive error handling
- Translation ready
- Clean, object-oriented code structure

## Requirements

- WordPress 5.0 or higher
- Advanced Custom Fields (ACF) plugin
- PHP 7.4 or higher

## Installation

1. Upload the `estimate-calculator` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Ensure Advanced Custom Fields plugin is installed and activated

## API Endpoints

### Get Calculator Data

**Endpoint:** `/wp-json/estimate-calculator/v1/get-calculator-data`
**Method:** GET
**Parameters:**

**Parameters:**

- `slug` (optional) - Calculator post slug to retrieve questions from (default: 'calculator-kitchens')

**Response:**

```json
{
  "success": true,
  "data": {
    "calculator_id": 123,
    "calculator_title": "Kitchen Calculator",
    "calculator_slug": "calculator-kitchens",
    "calculator_url": "https://example.com/calculator/calculator-kitchens/",
    "questions": [...],
    "last_modified": "2025-09-22 10:30:00",
    "post_type": "calculator"
  },
  "timestamp": 1695384600
}
    "last_modified": "2025-09-22 10:30:00"
  },
  "timestamp": 1695384600
}
```

### Get Questions Only

**Endpoint:** `/wp-json/estimate-calculator/v1/get-questions`
**Method:** GET
**Parameters:**

- `slug` (optional) - Page slug to retrieve questions from (default: 'calculator-kitchens')

**Response:**

```json
{
  "success": true,
  "questions": [...]
}
```

## Usage Examples

### JavaScript/AJAX

```javascript
// Get full calculator data
fetch("/wp-json/estimate-calculator/v1/get-calculator-data")
  .then((response) => response.json())
  .then((data) => {
    console.log(data.data.questions);
  });

// Get questions from a specific page
fetch("/wp-json/estimate-calculator/v1/get-questions?slug=my-calculator-page")
  .then((response) => response.json())
  .then((data) => {
    console.log(data.questions);
  });
```

### PHP

```php
// Get calculator data
$response = wp_remote_get(home_url('/wp-json/estimate-calculator/v1/get-calculator-data'));
$data = json_decode(wp_remote_retrieve_body($response), true);

if ($data['success']) {
    $questions = $data['data']['questions'];
    // Process questions...
}
```

### cURL

```bash
# Get calculator data
curl -X GET "https://yourdomain.com/wp-json/estimate-calculator/v1/get-calculator-data"

# Get questions from specific calculator
curl -X GET "https://yourdomain.com/wp-json/estimate-calculator/v1/get-questions?slug=calculator-kitchens"
```

## Setup Requirements

1. Create a calculator post with the desired slug (e.g., 'calculator-kitchens')
   - The plugin automatically registers the "calculator" custom post type
   - Go to **Calculators > Add New** in your WordPress admin
2. Add an ACF custom field called 'questions' to the calculator post
3. Populate the field with your calculator questions/data
4. Access the API endpoints as shown above

## Error Handling

The plugin returns appropriate HTTP status codes and error messages:

- **404**: Page not found or questions field empty
- **500**: Server error or ACF plugin not active

Example error response:

```json
{
  "code": "calculator_not_found",
  "message": "Calculator with slug \"calculator-kitchens\" not found",
  "data": {
    "status": 404
  }
}
```

## Changelog

### 1.0.0

- Initial release
- Custom post type "calculator" registration
- Basic API endpoints for calculator data
- ACF dependency checking
- Translation support

## Support

For support and feature requests, please contact the development team.

## License

This plugin is licensed under the GPL v2 or later.
