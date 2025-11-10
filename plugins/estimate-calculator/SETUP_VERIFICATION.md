# WordPress Plugin Category Slugs - Setup Verification

## What You Should See in WordPress Admin

After uploading and activating the updated plugin, you should see:

### 1. Settings Menu Location

- Navigate to: **Settings → Estimate Calculator** in your WordPress admin
- This should show the main plugin settings page

### 2. New Category Slugs Section

You should see a new section called **"Category Slugs Configuration"** with:

- **Description**: "Configure the WordPress post/page slugs for each calculator category..."
- **Individual fields for each category**:
  - Kitchens Slug (default: calculator-kitchens)
  - Bathrooms Slug (default: calculator-bathrooms)
  - Basements Slug (default: calculator-basements)
  - Windows Slug (default: calculator-windows)
  - Flooring Slug (default: calculator-flooring)
  - Home Renovations Slug (default: calculator-renovations)
  - Structural Slug (default: calculator-structural)

### 3. API Endpoint Test

Test the new endpoint by visiting:

```
https://yoursite.com/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-category-slugs
```

**Expected Response:**

```json
{
  "success": true,
  "category_slugs": {
    "kitchens": "calculator-kitchens",
    "bathrooms": "calculator-bathrooms",
    "basements": "calculator-basements",
    "windows": "calculator-windows",
    "flooring": "calculator-flooring",
    "home-renovations": "calculator-renovations",
    "structural": "calculator-structural"
  },
  "timestamp": 1729123456
}
```

## Troubleshooting

### If you don't see the Category Slugs section:

1. **Clear any caching** (if using caching plugins)
2. **Deactivate and reactivate** the Estimate Calculator plugin
3. **Check file permissions** - ensure the plugin file is properly uploaded
4. **Verify plugin version** - make sure you have the updated version

### If the API endpoint returns an error:

1. **Check permalink structure** - Go to Settings → Permalinks and click "Save Changes"
2. **Verify the post exists** - You need a post/page with slug `calculator-category-slugs`
3. **Check plugin activation** - Ensure the plugin is active

### To test the React integration:

1. **Save category slug settings** in WordPress admin
2. **Open browser developer tools** on a page with the calculator
3. **Look for console messages** like:
   - "🚀 Fetching category slug mappings from WordPress"
   - "✅ Successfully fetched category slugs from WordPress"

## Manual Testing Steps

1. **Go to WordPress Admin** → Settings → Estimate Calculator
2. **Scroll down** to "Category Slugs Configuration" section
3. **Change one of the slugs** (e.g., change "calculator-kitchens" to "custom-kitchens")
4. **Click "Save Changes"**
5. **Test the API endpoint** to see if it returns your custom slug
6. **Test the React app** to see if it uses the new slug

## Next Steps

Once you confirm the admin interface is working:

1. **Configure your actual slugs** to match your WordPress posts/pages
2. **Create the corresponding WordPress posts** with those slugs
3. **Test the calculator** to ensure it loads the correct data

## File Locations

- **Plugin file**: `/plugins/estimate-calculator/estimate-calculator.php`
- **React app**: Uses the API automatically when fetching category data
