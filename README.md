# MyLingo - Learn Words Frontend

A Progressive Web App (PWA) for learning words and expanding your vocabulary, built with React + Vite.

## Features

- **Progressive Web App**: Install on your device and use like a native app
- **Offline Support**: Static assets are cached for offline access
- **Auto-Updates**: Get notified when new versions are available
- **Mobile-Optimized**: Responsive design for mobile devices
- **Google OAuth**: Secure authentication with Google
- **Vocabulary Management**: Create and manage your word collections

## Technologies

- React 19
- Vite 6
- Chakra UI + Tailwind CSS
- React Router
- vite-plugin-pwa with Workbox

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## PWA Installation

### Android (Chrome/Edge)

1. Open the app in Chrome or Edge browser
2. Tap the menu (three dots) in the top right
3. Select "Install app" or "Add to Home screen"
4. Follow the prompts to install

### iOS (Safari)

1. Open the app in Safari browser
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "MyLingo" and tap "Add"

### Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar (computer with arrow)
3. Click it and select "Install"
4. The app will open in its own window

## PWA Features

### Caching Strategy

- **Static Assets**: Cached with CacheFirst strategy (JS, CSS, images, fonts)
- **API Requests**: Cached with NetworkFirst strategy (5-minute cache)
- **Google Fonts**: Long-term caching (1 year)

### Offline Mode

The app caches all static resources for offline access. While offline:
- You can access previously loaded pages
- Static content remains available
- API requests will show cached data when available

### Updates

When a new version is available:
- You'll see a notification at the top of the screen
- Click "Update" to reload with the new version
- Or click "Later" to continue with the current version

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, etc.)
├── pages/          # Page components
├── services/       # API services
└── main.jsx        # App entry point with PWA registration
```

### Environment Variables

Create a `.env` file:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=your_api_url
```

### PWA Development

PWA features are disabled in development mode by default. To test PWA:

```bash
npm run build
npm run preview
```

Then open the preview URL in your browser and test installation/offline features.

## Build

```bash
# Production build
npm run build

# The build output includes:
# - Static assets in dist/
# - Service Worker (sw.js)
# - Web App Manifest (manifest.webmanifest)
```

## Future Enhancements

- Push notifications for learning reminders
- Background sync for offline changes
- Enhanced offline capabilities with IndexedDB
- Share target API for adding words from other apps
