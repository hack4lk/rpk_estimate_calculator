New Features:

1. Admin Settings Page
   Navigate to Settings > Estimate Calculator in WordPress admin
   Configure a default calculator slug instead of hardcoded "calculator-kitchens"
   The default is now "calculator-default" but can be changed

2. Configurable Default Slug
   The API endpoints now use the configurable default slug from settings
   No more hardcoded "calculator-kitchens"

3. **React Application Integration**
   The shortcode now embeds a React application from the app/build folder:

   - Automatically loads React build files (CSS and JS)
   - Supports Create React App build structure with asset-manifest.json
   - Provides fallback for static file loading
   - Includes comprehensive error handling and loading states
   - Passes calculator configuration and API endpoints to React app
   - Works with multiple calculator instances on the same page

4. Shortcode Support
   [estimate_calculator] - Loads the React application home screen (no specific calculator)
   [estimate_calculator slug="your-custom-slug"] - Uses a specific slug
   [estimate_calculator slug="your-slug" class="custom-class" id="custom-id"] - Full customization

5. Enhanced API Usage
   The plugin now provides multiple ways to specify slugs

6. **NEW: Form Fields for Categories**
   Each category now automatically receives form fields:

   - form_headline: Headline text for the category form
   - form_description: Description text for the category form
   - form_footer_text: Footer text for the category form

7. **NEW: Calculator Results Endpoint**
   Special endpoint for results page data (slug: calculator-results):

   - calculator_results_headline: Headline for results page
   - calculator_results_description: Description for results page
   - calculator_results_footer_text: Footer text for results page
   - calculator_results_disclaimer: Disclaimer text for results page

8. **NEW: Calculator Email Endpoint**
   Special endpoint for email template data (slug: calculator-email):

   - calculator_email_body: Email body template for calculator notifications

9. **NEW: SendGrid Email API**
   POST endpoint for sending emails via SendGrid API:

   - Requires SendGrid API key configuration in plugin settings
   - Accepts SendGrid v3 API payload format
   - No external libraries required (uses native PHP cURL)

10. **NEW: JobTread Customer API**
    POST endpoint for creating customers in JobTread:
    - Requires JobTread API key and URL configuration in plugin settings
    - Accepts customer data with name, email, zip, and phone fields

- No external libraries required (uses native PHP cURL)

API Endpoints:

/wp-json/estimate-calculator/v1/get-calculator-data (uses default slug)
/wp-json/estimate-calculator/v1/get-calculator-data?slug=your-calculator-slug (uses specific slug)
/wp-json/estimate-calculator/v1/get-questions?slug=your-calculator-slug
**NEW:** /wp-json/estimate-calculator/v1/get-category-data?slug=your-calculator-slug (get all categories with form fields)
**NEW:** /wp-json/estimate-calculator/v1/get-category-data?slug=your-calculator-slug&category_id=123 (get specific category)
**NEW:** /wp-json/estimate-calculator/v1/get-category-data?slug=your-calculator-slug&category_name=kitchens (get category by name)
**NEW:** /wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-results (get results page data with special handling)
**NEW:** /wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-email (get email template data with special handling)
**NEW:** POST /wp-json/estimate-calculator/v1/send-email (send email via SendGrid API)
**NEW:** POST /wp-json/estimate-calculator/v1/create-jobtread-customer (create customer in JobTread)

Shortcode Examples:

Key Improvements:

- Flexible Configuration: No more hardcoded slugs - everything is configurable
- Admin Interface: Easy-to-use settings page for configuration
- Shortcode Support: Easy embedding in posts/pages
- Backward Compatibility: Existing API calls will still work
- Multiple Calculator Support: Can easily switch between different calculator types
- JavaScript Ready: The shortcode includes hooks for JavaScript initialization
- **NEW: Form Fields Support**: Every category call now includes form_headline, form_description, and form_footer_text fields
- **NEW: Calculator Results Endpoint**: Special endpoint for results page with 4 dedicated fields

## React Application Setup

The plugin now integrates with a React application for the frontend calculator interface.

### Build Structure

The React application should be built and placed in the `app/build/` folder within the plugin directory:

```
estimate-calculator/
├── app/
│   └── build/
│       ├── asset-manifest.json
│       ├── static/
│       │   ├── css/
│       │   │   └── main.[hash].css
│       │   └── js/
│       │       ├── main.[hash].js
│       │       ├── runtime-main.[hash].js
│       │       └── [chunk].[hash].js
│       └── index.html
└── estimate-calculator.php
```

### React App Requirements

Your React application should export a global function `initEstimateCalculator` that:

1. **Accepts two parameters:**

   - `containerElement`: The DOM element where the React app should render
   - `calculatorConfig`: Configuration object with calculator data and API endpoints

2. **Configuration object structure:**

   2. **Configuration object structure:**

   **Home Mode (when no slug is provided):**

   ```javascript
   {
     mode: "home",
     slug: null,
     calculatorId: null,
     calculatorTitle: null,
     calculatorSlug: null,
     formFields: {},
     questions: [],
     apiEndpoints: {
       getData: "https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data",
       getQuestions: "https://yoursite.com/wp-json/estimate-calculator/v1/get-questions",
       getCategoryData: "https://yoursite.com/wp-json/estimate-calculator/v1/get-category-data",
       getResults: "https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-results",
       getEmail: "https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-email",
       sendEmail: "https://yoursite.com/wp-json/estimate-calculator/v1/send-email",
       createCustomer: "https://yoursite.com/wp-json/estimate-calculator/v1/create-jobtread-customer"
     }
   }
   ```

   **Calculator Mode (when slug is provided):**

   ```javascript
   {
     mode: "calculator",
     slug: "calculator-slug",
     calculatorId: 123,
     calculatorTitle: "Kitchen Calculator",
     calculatorSlug: "calculator-kitchens",
     formFields: {
       form_headline: "Get Your Estimate",
       form_description: "Fill out the form below",
       form_footer_text: "Results are estimates only"
     },
     questions: [...], // ACF questions data
     apiEndpoints: {
       getData: "https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data",
       getQuestions: "https://yoursite.com/wp-json/estimate-calculator/v1/get-questions",
       getCategoryData: "https://yoursite.com/wp-json/estimate-calculator/v1/get-category-data",
       getResults: "https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-results",
       getEmail: "https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-email",
       sendEmail: "https://yoursite.com/wp-json/estimate-calculator/v1/send-email",
       createCustomer: "https://yoursite.com/wp-json/estimate-calculator/v1/create-jobtread-customer"
     }
   }
   ```

3. **WordPress globals available:**
   ```javascript
   window.estimateCalculatorWP = {
     apiUrl: "https://yoursite.com/wp-json/estimate-calculator/v1/",
     nonce: "wp_rest_nonce_value",
     pluginUrl: "https://yoursite.com/wp-content/plugins/estimate-calculator/",
   };
   ```

### Example React Integration

```javascript
// In your React app's main file
window.initEstimateCalculator = function (containerElement, config) {
  const root = ReactDOM.createRoot(containerElement);

  // Handle different modes
  if (config.mode === "home") {
    // Show calculator home screen/selector
    root.render(<CalculatorHomeApp config={config} />);
  } else if (config.mode === "calculator") {
    // Show specific calculator
    root.render(<CalculatorApp config={config} />);
  } else {
    // Fallback
    root.render(<div>Unknown calculator mode</div>);
  }
};
```

### Fallback Handling

The plugin provides several fallback mechanisms:

1. **No JavaScript**: Shows noscript message with basic calculator info
2. **React app not loaded**: Shows loading message with troubleshooting info
3. **Configuration error**: Shows error message with refresh suggestion
4. **Asset manifest missing**: Falls back to static file names (main.css, main.js)

### Multiple Instances

The plugin supports multiple calculator instances on the same page by:

- Generating unique IDs for each shortcode instance
- Passing individual configuration to each React app
- Isolating container elements and configuration scripts

## ACF Field Setup for Form Fields

To use the new form fields feature, create the following ACF fields on your calculator posts:

### Global Form Fields (Fallback)

- `form_headline` - Global form headline text
- `form_description` - Global form description text
- `form_footer_text` - Global form footer text

### Calculator Results Fields (for calculator-results slug)

- `calculator_results_headline` - Results page headline
- `calculator_results_description` - Results page description
- `calculator_results_footer_text` - Results page footer text
- `calculator_results_disclaimer` - Results page disclaimer

### Calculator Email Fields (for calculator-email slug)

- `calculator_email_body` - Email body template content

### Category-Specific Form Fields (Optional)

For category-specific form fields, use the pattern: `{field_name}_{category_id}`

Examples:

- `form_headline_kitchens` - Headline for kitchens category
- `form_description_kitchens` - Description for kitchens category
- `form_footer_text_kitchens` - Footer text for kitchens category
- `form_headline_bathrooms` - Headline for bathrooms category
- etc.

The plugin will:

1. First try to use category-specific fields (e.g., `form_headline_kitchens`)
2. Fall back to global fields (e.g., `form_headline`) if category-specific doesn't exist
3. Return empty string if neither exists

## SendGrid Email API Setup

To use the email sending functionality:

1. **Get SendGrid API Key:**

   - Sign up for a SendGrid account at https://sendgrid.com
   - Go to Settings > API Keys in your SendGrid dashboard
   - Create a new API key with "Mail Send" permissions

2. **Configure in WordPress:**

   - Go to Settings > Estimate Calculator in WordPress admin
   - Enter your SendGrid API key in the "SendGrid API Key" field
   - Save settings

3. **Send Email via API:**

   ```
   POST /wp-json/estimate-calculator/v1/send-email
   Content-Type: application/json

   {
     "personalizations": [
       {
         "to": [
           {
             "email": "recipient@example.com",
             "name": "Recipient Name"
           }
         ],
         "subject": "Your Estimate Results"
       }
     ],
     "from": {
       "email": "noreply@yourdomain.com",
       "name": "Your Company"
     },
     "content": [
       {
         "type": "text/html",
         "value": "<p>Your email content here</p>"
       }
     ]
   }
   ```

The email endpoint uses the SendGrid v3 API format and requires no external libraries - it uses PHP's built-in cURL functionality.

## JobTread Customer API Setup

To use the JobTread customer creation functionality:

1. **Get JobTread API Credentials:**

   - Sign up for a JobTread account at https://jobtread.com
   - Go to your JobTread dashboard and find API settings
   - Create a new API key with customer creation permissions
   - Get the API endpoint URL for customer creation

2. **Configure in WordPress:**

   - Go to Settings > Estimate Calculator in WordPress admin
   - Enter your JobTread API key in the "JobTread API Key" field
   - Enter the JobTread API URL in the "JobTread API URL" field (e.g., https://api.jobtread.com/v1/customers)
   - Save settings

3. **Create Customer via API:**

   ```
   POST /wp-json/estimate-calculator/v1/create-jobtread-customer
   Content-Type: application/json

   {
     "name": "Lukasz Karpuk",
     "email": "lkarpuk@drizl.app",
     "zip": "07083",
     "phone": "9084476879"
   }
   ```

The JobTread endpoint validates all required fields and uses PHP's built-in cURL functionality - no external libraries required.

Now you can create multiple calculators with different slugs (like "calculator-kitchens", "calculator-bathrooms", "calculator-renovations", etc.) and easily specify which one to use via the settings, API parameters, or shortcode attributes!
