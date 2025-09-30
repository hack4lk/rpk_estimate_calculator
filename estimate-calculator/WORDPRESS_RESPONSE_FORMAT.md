# WordPress API Response Structure

This document describes the actual WordPress API response format and how it's processed by the React application.

## API Endpoint

```
GET http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home
```

## WordPress Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "calculator_id": 15130,
    "calculator_title": "Home",
    "calculator_slug": "calculator-home",
    "calculator_url": "http://localhost:8080/calculator/calculator-home/",
    "questions": [
      {
        "question_text": "Home Selection",
        "question_help_text": "NA",
        "option": [
          {
            "short_description": "Kitchens",
            "long_description": "",
            "minimum_cost": "",
            "maximum_cost": "",
            "featured_image": {
              "ID": 15137,
              "title": "Kitchens",
              "filename": "Kitchens.jpg",
              "url": "http://localhost:8080/wp-content/uploads/Kitchens.jpg",
              "width": 540,
              "height": 540,
              "sizes": {
                "thumbnail": "http://localhost:8080/wp-content/uploads/Kitchens-150x150.jpg",
                "medium": "http://localhost:8080/wp-content/uploads/Kitchens-300x300.jpg",
                "large": "http://localhost:8080/wp-content/uploads/Kitchens.jpg"
              }
            }
          }
        ]
      }
    ],
    "last_modified": "2025-09-28 21:34:49",
    "post_type": "calculator"
  },
  "timestamp": 1759095302
}
```

## Data Transformation

The React application transforms the WordPress response into a simplified format for the UI components:

### WordPress → React Transformation

```typescript
// WordPress category option
{
  "short_description": "Kitchens",
  "long_description": "",
  "featured_image": {
    "url": "http://localhost:8080/wp-content/uploads/Kitchens.jpg"
  }
}

// Transformed to React Category
{
  "id": "kitchens",
  "title": "Kitchens",
  "description": "Professional kitchens estimates",
  "image": "http://localhost:8080/wp-content/uploads/Kitchens.jpg",
  "detailContent": "Transform your kitchen with our comprehensive renovation estimates..."
}
```

## Category Processing

### 1. ID Generation

- Converts title to URL-friendly slug: "Home Renovations" → "home-renovations"
- Removes special characters and spaces
- Used for navigation and component keys

### 2. Description Handling

- Uses `long_description` if available
- Falls back to generated description based on category type
- Ensures every category has meaningful description text

### 3. Detail Content Generation

- Creates detailed content for category detail pages
- Uses predefined templates for each category type
- Provides comprehensive information about services included

### 4. Image Processing

- Uses the full-size image URL from WordPress
- WordPress provides multiple image sizes in the `sizes` object
- Application uses the main `url` field for optimal quality

## Expected Categories

The application expects these 7 categories from WordPress:

1. **Kitchens**
2. **Bathrooms**
3. **Basements**
4. **Windows**
5. **Flooring**
6. **Home Renovations**
7. **Structural**

## Error Handling

### Missing Data

- Validates that `questions[0].option` exists
- Throws descriptive error if categories not found
- Logs detailed error information for debugging

### Image Fallbacks

- Uses WordPress image URL directly
- No fallback images - relies on WordPress media library
- Logs warnings if images are missing or invalid

## TypeScript Types

### WordPress Response Types

```typescript
interface WordPressApiResponse {
  success: boolean;
  data: CalculatorData;
  timestamp: number;
}

interface CalculatorData {
  calculator_id: number;
  calculator_title: string;
  calculator_slug: string;
  questions: Question[];
}

interface Question {
  question_text: string;
  option: CategoryOption[];
}

interface CategoryOption {
  short_description: string;
  long_description: string;
  featured_image: FeaturedImage;
}
```

### React Component Types

```typescript
interface HomePageData {
  headline: string;
  categories: Category[];
}

interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  detailContent: string;
}
```

## WordPress Plugin Requirements

Your WordPress plugin should:

1. **Return Success Response**: Always include `"success": true` for valid responses
2. **Include Calculator Data**: Provide calculator with questions array
3. **Category Options**: Each question should have `option` array with categories
4. **Featured Images**: Each option should include `featured_image` with full URL
5. **Proper Structure**: Follow the exact JSON structure shown above

## Debugging

### API Response Logging

In development mode, the application logs:

- API request URL and parameters
- Raw WordPress response data
- Transformation process steps
- Final category data structure

### Common Issues

1. **Missing Categories**: Check that `questions[0].option` contains data
2. **Broken Images**: Verify WordPress media URLs are accessible
3. **Invalid Structure**: Ensure response matches expected JSON format
4. **CORS Errors**: Configure WordPress to allow cross-origin requests

## Testing the API

### Direct API Test

```bash
curl "http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home"
```

### Expected Response

- Should return `"success": true`
- Should include 7 categories in `questions[0].option`
- Each category should have valid image URL
- Response should be valid JSON format
