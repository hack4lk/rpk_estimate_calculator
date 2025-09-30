# RPK Construction Estimate Calculator

A modern React application for RPK Construction's estimate calculator, built with Material-UI and React Query. This application is designed to be embedded in WordPress installations.

## Features

- **Responsive Design**: Built with Material-UI for a professional, mobile-first experience
- **API Integration**: Uses React Query for efficient data fetching with loading and error states
- **Category-Based Navigation**: Seven construction categories with detailed information
- **WordPress Compatible**: Single-page application without SPA routing for easy WordPress embedding
- **TypeScript**: Full TypeScript support for better development experience

## Architecture

### Components

- **HomeScreen**: Landing page with category cards and headline
- **CategoryDetailScreen**: Detailed view for each construction category
- **App**: Main application component with state management

### Key Technologies

- React 19.1.1 with TypeScript
- Material-UI (MUI) v7 for UI components
- TanStack React Query v5 for API state management
- Axios for HTTP requests with retry logic
- Sass for custom styling

## Setup & Development

### Prerequisites

- Node.js 18+ (recommended)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure your API endpoint:

```bash
cp .env.example .env
```

Edit `.env`:

```
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
NODE_ENV=development
```

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3001](http://localhost:3001)

### Production Build

```bash
npm run build
```

Creates an optimized production build in the `build` folder.

## API Integration

The application expects a REST API with the following endpoint:

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
        "id": "residential",
        "title": "Residential Construction",
        "description": "Estimates for home building and renovation projects",
        "image": "https://example.com/image.jpg",
        "detailContent": "Detailed description of the service..."
      }
    ]
  }
}
```

### Mock Data

When `NODE_ENV=development`, the application uses built-in mock data if the API is unavailable.

## WordPress Integration

This application is designed to be embedded in WordPress without using SPA routing:

1. **Build the Application**:

   ```bash
   npm run build
   ```

2. **Upload Build Files**: Upload the contents of the `build` folder to your WordPress site

3. **Create WordPress Page**: Create a new page in WordPress and add the following HTML:

   ```html
   <div id="root"></div>
   <script src="/path/to/your/static/js/main.[hash].js"></script>
   <link href="/path/to/your/static/css/main.[hash].css" rel="stylesheet" />
   ```

4. **Enqueue Scripts**: Alternatively, use WordPress's `wp_enqueue_script` and `wp_enqueue_style` functions

## Customization

### Styling

- Global styles: `src/index.scss` and `src/App.scss`
- Material-UI theme: Configured in `src/App.tsx`
- Component-specific styles: Use Material-UI's `sx` prop

### Categories

Update the mock data in `src/services/api.ts` or connect to your actual API endpoint.

### Branding

- Update colors in the Material-UI theme configuration
- Replace placeholder images with your actual construction images
- Modify the headline and descriptions

## File Structure

```
src/
├── components/
│   ├── HomeScreen.tsx          # Landing page with category cards
│   └── CategoryDetailScreen.tsx # Category detail view
├── services/
│   └── api.ts                  # API service and mock data
├── types/
│   └── index.ts                # TypeScript type definitions
├── App.tsx                     # Main application component
├── index.tsx                   # Application entry point
└── styles...
```

## Performance Considerations

- React Query caching reduces unnecessary API calls
- Material-UI components are tree-shaken for optimal bundle size
- Images are lazy-loaded where possible
- Production build is optimized and minified

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new code
3. Test changes in both development and production builds
4. Ensure WordPress compatibility

## License

Private - RPK Construction
