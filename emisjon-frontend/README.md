# Emisjon Frontend

A React + TypeScript application with authentication and admin dashboard.

## 🔐 Authentication System

### Cookie-Based Authentication
This application uses **HTTP-only cookies** for authentication instead of localStorage for enhanced security.

#### Why Cookies over localStorage?
- **Security**: HTTP-only cookies cannot be accessed via JavaScript, preventing XSS attacks
- **Automatic sending**: Cookies are automatically sent with every request
- **CSRF Protection**: When properly configured with SameSite attributes
- **No manual token management**: No need to manually attach tokens to requests

### Authentication Flow
1. User submits login credentials
2. Backend validates credentials and sets HTTP-only cookie with JWT token
3. All subsequent requests automatically include the cookie
4. Backend validates the cookie on protected routes
5. On logout, backend clears the cookie

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Backend server running on http://localhost:3000

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd emisjon-frontend
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Update `.env` with your backend URL:
```
VITE_API_URL=http://localhost:3000
```

4. Start the development server
```bash
pnpm dev
```

The application will run on http://localhost:5173

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   └── ProtectedRoute.tsx # Route protection wrapper
├── features/
│   ├── auth/            # Authentication feature
│   │   ├── components/  # Auth-specific components
│   │   ├── pages/       # Login, Register pages
│   │   ├── services/    # API service layer
│   │   ├── types/       # TypeScript types
│   │   ├── utils/       # Validation utilities
│   │   └── authSlice.ts # Redux auth slice
│   └── dashboard/       # Dashboard feature
│       ├── components/  # Dashboard components (Sidebar, Layout)
│       └── pages/       # Dashboard pages (Users, Shareholders)
├── lib/
│   ├── axios.ts         # Axios configuration with credentials
│   └── utils.ts         # Utility functions
├── store/
│   ├── index.ts         # Redux store configuration
│   └── hooks.ts         # Typed Redux hooks
└── App.tsx              # Main application with routing
```

## 🔑 Key Features

### Authentication
- Login with email and password
- User registration
- Cookie-based session management
- Automatic session validation
- Protected routes

### Dashboard
- Responsive sidebar with toggle
- User management
- Shareholder management
- Dashboard overview with statistics
- Mobile-responsive design

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Axios** - HTTP client with credential support
- **Tailwind CSS** - Styling
- **React Icons** - Icon library
- **Vite** - Build tool

## 📡 API Configuration

The application connects to the backend API using Axios with credentials enabled:

```typescript
// src/lib/axios.ts
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});
```

### Required Backend Configuration

Your backend must:
1. Set appropriate CORS headers
2. Allow credentials in CORS configuration
3. Set cookies with proper attributes:
   - `httpOnly: true`
   - `secure: true` (in production)
   - `sameSite: 'strict'` or `'lax'`

Example backend cookie configuration:
```javascript
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

## 🎨 Design System

### Colors
- **Primary**: #1e2938 (Dark blue-gray)
- **Secondary**: #ffffff (White)

Colors are defined in CSS variables in `src/index.css`.

## 📝 Available Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm preview    # Preview production build
pnpm lint       # Run ESLint
```

## 🔒 Security Considerations

1. **No localStorage for tokens**: All authentication tokens are stored in HTTP-only cookies
2. **Automatic logout**: On 401 responses, user is redirected to login
3. **Protected routes**: Dashboard routes require authentication
4. **Input validation**: Client-side validation for all forms
5. **HTTPS in production**: Ensure secure cookie transmission

## 🚦 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Collapsible sidebar for mobile
- Responsive tables
- Touch-friendly interface

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and confidential.