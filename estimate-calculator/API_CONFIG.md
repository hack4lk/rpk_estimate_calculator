# API Configuration Guide

This document explains how to configure the RPK Construction Estimate Calculator for different environments.

## Environment Configuration

The application supports different API configurations for development and production environments.

### Environment Variables

Create the appropriate `.env` file for your environment:

#### Development (.env)

```bash
# Use mock data during development
REACT_APP_USE_MOCK_DATA=true
REACT_APP_DEVELOPMENT_API_URL=http://localhost:8000/api
REACT_APP_PRODUCTION_API_URL=https://api.rpkconstruction.com/api
NODE_ENV=development
```

#### Production (.env.production)

```bash
# Use real API in production
REACT_APP_USE_MOCK_DATA=false
REACT_APP_PRODUCTION_API_URL=https://api.rpkconstruction.com/api
NODE_ENV=production
```

### Available Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `REACT_APP_DEVELOPMENT_API_URL` | Development API endpoint | `http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data` | `http://localhost:3001/wp-json/...` |
| `REACT_APP_PRODUCTION_API_URL` | Production API endpoint | `https://rpkconstruction.com/wp-json/estimate-calculator/v1/get-calculator-data` | `https://your-domain.com/wp-json/...` |
| `REACT_APP_API_TIMEOUT` | API request timeout (ms) | `10000` | `15000` |
| `REACT_APP_API_RETRIES` | Number of retry attempts | `3` | `5` |
| `REACT_APP_API_BASE_URL` | Override API URL | Auto-detected | `https://custom-api.com/v1` |

## Development Scripts

### Standard Development
```bash
npm start                    # Normal development mode
npm run start:dev           # Development mode (explicit)
npm run start:prod          # Production mode (for testing)
```

### Building for Different Environments

```bash
npm run build               # Production build
npm run build:dev          # Development build with mock data
npm run build:prod         # Production build (explicit)
```

## API Behavior

### Development Mode (`NODE_ENV=development`)

- **Default**: Uses mock data
- **With API**: Set `REACT_APP_USE_MOCK_DATA=false` to use development API
- **Fallback**: Falls back to mock data if API fails
- **Logging**: Detailed console logging enabled

### Production Mode (`NODE_ENV=production`)

- **Default**: Uses production API
- **No Fallback**: Throws errors if API fails (no mock data fallback)
- **Logging**: Minimal logging

## API Endpoints

The application expects these endpoints:

### GET `/homepage`

Returns homepage data including headline and categories.

**Response Format:**

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
        "image": "https://example.com/kitchen-image.jpg",
        "detailContent": "Detailed description..."
      }
    ]
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description"
}
```

## Mock Data

Mock data is automatically used in the following scenarios:

- `NODE_ENV=development` (default behavior)
- `REACT_APP_USE_MOCK_DATA=true` (explicit override)
- API request fails in development mode (fallback)

Mock data includes all 7 categories:

- Kitchens
- Bathrooms
- Basements
- Windows
- Flooring
- Home Renovations
- Structural

## Deployment Examples

### WordPress Integration

```bash
# Build for production
npm run build:prod

# Upload files to WordPress
# Copy build/* to your WordPress theme/plugin directory
```

### Vercel Deployment

```bash
# Set environment variables in Vercel dashboard:
REACT_APP_PRODUCTION_API_URL=https://your-api.com/api
REACT_APP_USE_MOCK_DATA=false
NODE_ENV=production
```

### Netlify Deployment

```bash
# Set environment variables in Netlify dashboard or netlify.toml:
REACT_APP_PRODUCTION_API_URL=https://your-api.com/api
REACT_APP_USE_MOCK_DATA=false
```

## Troubleshooting

### Common Issues

1. **"Failed to load data" error in production**

   - Check `REACT_APP_PRODUCTION_API_URL` is correctly set
   - Verify API endpoint is accessible
   - Check CORS configuration on API server

2. **Mock data not loading**

   - Verify `REACT_APP_USE_MOCK_DATA=true` is set
   - Check browser console for errors
   - Ensure `NODE_ENV=development`

3. **API calls timing out**
   - Increase `REACT_APP_API_TIMEOUT` value
   - Check network connectivity
   - Verify API server is responding

### Debug Mode

Enable debug logging by opening browser console. In development mode, you'll see:

```
🔧 API Configuration: {
  baseUrl: "http://localhost:8000/api",
  environment: "development",
  useMockData: true,
  timeout: 10000,
  retries: 3
}
```

## Security Considerations

- Never expose sensitive API keys in environment variables
- Use HTTPS for production API endpoints
- Implement proper CORS policies on your API server
- Consider API rate limiting and authentication
