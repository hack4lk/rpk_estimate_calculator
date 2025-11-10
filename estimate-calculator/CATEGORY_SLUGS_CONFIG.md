# Category Slugs Configuration

## Overview

The RPK Estimate Calculator now supports dynamic category slug configuration through WordPress, making it easier to manage and update category mappings without code changes.

## How It Works

### 1. WordPress Endpoint

The system fetches category slugs from a WordPress endpoint with the slug: `calculator-category-slugs`

### 2. Expected Response Format

The WordPress endpoint should return a JSON response in this format:

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
  }
}
```

### 3. WordPress Implementation

To set up this configuration in WordPress, you need to:

1. **Create a new WordPress post/page** with the slug `calculator-category-slugs`
2. **Add custom fields** or use a custom post type to store the category slug mappings
3. **Update your WordPress API endpoint** to handle the `calculator-category-slugs` slug and return the mappings

#### Example WordPress Custom Fields Setup:

```
Field Name: category_slugs
Field Value: {
  "kitchens": "calculator-kitchens",
  "bathrooms": "calculator-bathrooms",
  "basements": "calculator-basements",
  "windows": "calculator-windows",
  "flooring": "calculator-flooring",
  "home-renovations": "calculator-renovations",
  "structural": "calculator-structural"
}
```

### 4. Fallback Behavior

If the WordPress endpoint is not available or doesn't return valid data, the system will automatically fall back to the default hardcoded slugs:

- `kitchens` → `calculator-kitchens`
- `bathrooms` → `calculator-bathrooms`
- `basements` → `calculator-basements`
- `windows` → `calculator-windows`
- `flooring` → `calculator-flooring`
- `home-renovations` → `calculator-renovations`
- `structural` → `calculator-structural`

## Benefits

1. **Dynamic Configuration**: Change category slugs without code deployments
2. **Centralized Management**: Manage all category mappings from WordPress admin
3. **Fallback Safety**: System continues working even if WordPress endpoint fails
4. **Logging**: Comprehensive logging for debugging configuration issues

## API Changes

### New Functions Added:

- `fetchCategorySlugs()` - Fetches slug mappings from WordPress
- `initializeCategorySlugs()` - Initializes the slug mappings (called automatically)
- `preloadCategorySlugs()` - Can be called during app initialization for better performance

### Modified Functions:

- `getCategorySlug()` - Now async and fetches from WordPress dynamically
- `getCategoryData()` - Updated to work with async slug resolution

## Usage

The system automatically handles category slug resolution. No changes are needed in your React components. The category slugs are fetched and cached when first needed.

### Optional: Preload During App Initialization

For better performance, you can preload the category slugs during app initialization:

```typescript
import { apiService } from "./services/api";

// In your app initialization
await apiService.preloadCategorySlugs();
```

## Troubleshooting

### Common Issues:

1. **Slugs not updating**: Clear browser cache and check WordPress endpoint response
2. **Fallback slugs being used**: Check if WordPress endpoint is returning valid JSON with `category_slugs` field
3. **Category not found errors**: Ensure all category IDs have corresponding slugs in WordPress configuration

### Debugging:

Check browser console for messages like:

- `🚀 Fetching category slug mappings from WordPress`
- `✅ Successfully fetched category slugs from WordPress`
- `⚠️ Using fallback slug for category`

## WordPress Plugin Update Required

To fully implement this feature, your WordPress plugin needs to be updated to handle the `calculator-category-slugs` endpoint and return the category slug mappings.
