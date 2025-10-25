# Ruizhu Admin Dashboard

Modern React-based admin dashboard for the Ruizhu E-Commerce Platform.

## Features

- 📊 Dashboard with key metrics
- 📦 Product management
- 📋 Order management
- 👥 User management
- ⚙️ System settings
- 🔐 Authentication & authorization
- 🎨 Beautiful UI with Ant Design
- 📱 Responsive design
- 🚀 Fast development with Vite

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Library**: Ant Design
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Styling**: Sass/SCSS

## Project Structure

```
admin/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── services/        # API service layer
│   ├── store/           # Zustand state management
│   ├── hooks/           # Custom React hooks
│   ├── styles/          # Global styles & variables
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── routes.tsx       # Route configuration
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API endpoint:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Building

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## API Integration

The admin dashboard connects to the NestJS backend API at `/api/v1`.

### Services

API calls are organized by module in `/src/services/`:

- `auth.ts` - Authentication endpoints
- `users.ts` - User management
- `products.ts` - Product management
- `orders.ts` - Order management

### Authentication

The app uses JWT token-based authentication. Tokens are stored in `localStorage` and automatically included in API requests via Axios interceptor.

Token refresh and expiration handling is managed in `/src/services/api.ts`.

## State Management

Zustand stores are located in `/src/store/`:

- `authStore.ts` - Authentication state (user, token, login status)

Add more stores as needed for different features.

## Styling

Global styles and design variables are defined in `/src/styles/`:

- `variables.scss` - Color palette, spacing, typography, shadows
- `globals.scss` - Global CSS reset and utility classes

Components use CSS Modules for scoped styles.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Environment Variables

See `.env.example` for available variables.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -am 'Add feature'`
4. Push: `git push origin feature/your-feature`
5. Submit a pull request

## License

MIT
