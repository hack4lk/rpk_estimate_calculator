# API Configuration - Updated (No Mock Data)

The RPK Construction Estimate Calculator connects directly to your WordPress API endpoints. There is no mock data - the application requires a live API connection.

## API Endpoints

### Development

```
REACT_APP_DEVELOPMENT_API_URL=http://localhost:8080/wp-json/estimate-calculator/v1/get-calculator-data
```

### Production

```
REACT_APP_PRODUCTION_API_URL=https://rpkconstruction.com/wp-json/estimate-calculator/v1/get-calculator-data
```

## Environment Variables

| Variable                        | Description               | Default                                   | Example              |
| ------------------------------- | ------------------------- | ----------------------------------------- | -------------------- |
| `REACT_APP_DEVELOPMENT_API_URL` | Development WordPress API | `http://localhost:8080/wp-json/...`       | Your local WordPress |
| `REACT_APP_PRODUCTION_API_URL`  | Production WordPress API  | `https://rpkconstruction.com/wp-json/...` | Live WordPress site  |
| `REACT_APP_API_TIMEOUT`         | Request timeout (ms)      | `10000`                                   | `15000`              |
| `REACT_APP_API_RETRIES`         | Retry attempts            | `3`                                       | `5`                  |

## Development Scripts

```bash
npm start                    # Development with local WordPress API
npm run start:dev           # Development mode (explicit)
npm run start:prod          # Production mode (for testing)
npm run build               # Production build
npm run build:dev          # Development build
npm run build:prod         # Production build (explicit)
```

## API Behavior

### Development Mode

- Connects to `http://localhost:8080/wp-json/...`
- Detailed error logging
- Automatic retries on failure
- **No fallback** - API must be available

### Production Mode

- Connects to `https://rpkconstruction.com/wp-json/...`
- Minimal logging
- Automatic retries on failure
- **No fallback** - API must be available

## WordPress API Requirements

Your WordPress installation must have the estimate calculator plugin running with the endpoint:

```
/wp-json/estimate-calculator/v1/get-calculator-data?slug=calculator-home
```

## Error Handling

If the API is unavailable:

- ❌ Application will show error message
- ❌ No fallback data available
- 🔄 Automatic retries will attempt to reconnect
- ⚠️ Users will see loading/error states

## Setup Requirements

1. **WordPress Plugin**: Must be installed and activated
2. **API Endpoint**: Must respond to `?slug=calculator-home`
3. **CORS**: Must allow requests from your frontend domain
4. **Data Format**: Must return the expected JSON structure

## Troubleshooting

### "Failed to load data" Error

1. Check WordPress plugin is activated
2. Test API endpoint directly in browser
3. Verify CORS headers are set correctly
4. Check network connectivity
5. Review browser console for specific error messages

### Network Issues

- Automatic retries will handle temporary failures
- Check `REACT_APP_API_TIMEOUT` if requests are too slow
- Increase `REACT_APP_API_RETRIES` for unreliable connections

This application requires a live WordPress API - ensure your backend is properly configured before deployment.
