# Axios HTTP Client Implementation

The RPK Construction Estimate Calculator uses axios for HTTP requests instead of the native fetch API. This provides better error handling, request/response interceptors, automatic retries, and more robust configuration options.

## Features

### 1. **Axios Instance Configuration**

- **Base URL**: Automatically configured based on environment
- **Timeout**: Configurable request timeout (default: 10 seconds)
- **Headers**: Standard JSON headers set automatically
- **Retry Logic**: Automatic retries on network failures and 5xx errors

### 2. **Request/Response Interceptors**

- **Request Logging**: Logs outgoing requests in development
- **Response Logging**: Logs successful responses in development
- **Error Handling**: Detailed error logging and categorization

### 3. **Automatic Retry**

- **Retry Count**: Configurable number of retries (default: 3)
- **Exponential Backoff**: 1s, 2s, 3s delay between retries
- **Smart Retry Logic**: Only retries on network errors and 5xx status codes

## File Structure

```
src/services/
├── httpClient.ts      # Axios instance configuration
├── api.ts            # API service methods
└── config.ts         # Environment configuration
```

## Configuration

### Environment Variables

```bash
# Timeout in milliseconds
REACT_APP_API_TIMEOUT=10000

# Number of retry attempts
REACT_APP_API_RETRIES=3
```

### Axios Instance Setup

```typescript
const instance = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

## Usage Examples

### Basic API Call

```typescript
// Get homepage data
const response = await axiosInstance.get("", {
  params: { slug: "calculator-home" },
});
```

### With Error Handling

```typescript
try {
  const response = await axiosInstance.get("", { params: { slug } });
  return response.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    // Handle axios-specific errors
    console.error("Axios error:", error.response?.data);
  }
  throw error;
}
```

## Error Types

### 1. **Network Errors**

```javascript
// No response received (network down, DNS issues, etc.)
if (axiosError.request && !axiosError.response) {
  console.error("Network error - no response received");
}
```

### 2. **Timeout Errors**

```javascript
// Request exceeded timeout limit
if (axiosError.code === "ECONNABORTED") {
  console.error("Request timeout");
}
```

### 3. **HTTP Errors**

```javascript
// Server responded with error status
if (axiosError.response) {
  console.error(`HTTP Error ${axiosError.response.status}`);
}
```

## Request/Response Flow

```
1. Request initiated
   ↓
2. Request interceptor (logging)
   ↓
3. HTTP request sent
   ↓
4. Response received OR Error occurred
   ↓
5. Response interceptor (success) OR Error interceptor
   ↓
6. Retry logic (if error and retryable)
   ↓
7. Final response or error thrown
```

## Advantages over Fetch

| Feature                             | Axios                 | Fetch                       |
| ----------------------------------- | --------------------- | --------------------------- |
| **Request Timeout**                 | ✅ Built-in           | ❌ Requires AbortController |
| **Request Interceptors**            | ✅ Built-in           | ❌ Manual implementation    |
| **Response Interceptors**           | ✅ Built-in           | ❌ Manual implementation    |
| **Automatic JSON Parsing**          | ✅ Built-in           | ❌ Manual `.json()` call    |
| **Request/Response Transformation** | ✅ Built-in           | ❌ Manual implementation    |
| **Error Handling**                  | ✅ Rich error objects | ❌ Basic error handling     |
| **Automatic Retries**               | ✅ With axios-retry   | ❌ Manual implementation    |
| **Browser Support**                 | ✅ IE11+              | ❌ Modern browsers only     |

## Development vs Production

### Development Mode

```typescript
// Detailed logging enabled
console.log(`🚀 Making request to: ${config.url}`);
console.log(`✅ Response received from: ${response.config.url}`);
console.log(`🔄 Retry attempt ${retryCount}`);
```

### Production Mode

```typescript
// Minimal logging
// Only critical errors logged
// No request/response details
```

## API Service Methods

### getHomePageData()

```typescript
const response = await axiosInstance.get("", {
  params: { slug: "calculator-home" },
});
```

### getCategoryData(categorySlug)

```typescript
const response = await axiosInstance.get("", {
  params: { slug: categorySlug },
});
```

## Error Recovery Strategy

1. **Network Errors**: Automatic retry with exponential backoff
2. **5xx Server Errors**: Automatic retry (server might recover)
3. **4xx Client Errors**: No retry (client error, won't resolve with retry)
4. **Timeout Errors**: Automatic retry (might be temporary)
5. **Development Fallback**: Use mock data if all retries fail
6. **Production Failure**: Throw error to user interface

## Monitoring and Debugging

### Development Debugging

- Request URLs logged to console
- Response status logged to console
- Error details logged with context
- Retry attempts logged with count

### Production Monitoring

```typescript
// Minimal error logging for production monitoring
if (axiosError.response) {
  // Log HTTP status codes and basic error info
  console.error(`API Error ${axiosError.response.status}`);
}
```

## Best Practices

1. **Always Use the Configured Instance**

   ```typescript
   // ✅ Good
   import { axiosInstance } from "./httpClient";
   const response = await axiosInstance.get("/endpoint");

   // ❌ Avoid
   import axios from "axios";
   const response = await axios.get("https://api.com/endpoint");
   ```

2. **Handle Errors Appropriately**

   ```typescript
   try {
     const response = await axiosInstance.get("/endpoint");
     return response.data;
   } catch (error) {
     if (axios.isAxiosError(error)) {
       // Handle axios errors specifically
     }
     // Fallback or re-throw
   }
   ```

3. **Use TypeScript Types**

   ```typescript
   const response: AxiosResponse<ApiResponse<HomePageData>> =
     await axiosInstance.get("/", { params: { slug } });
   ```

4. **Configure Timeouts Appropriately**
   - Development: Longer timeouts for debugging
   - Production: Shorter timeouts for better UX

## Migration from Fetch

The migration from fetch to axios provides:

- ✅ Simpler API calls (no manual JSON parsing)
- ✅ Better error handling with detailed error objects
- ✅ Automatic retries on failures
- ✅ Request/response interceptors for logging
- ✅ Built-in timeout handling
- ✅ Better TypeScript integration
