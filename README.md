# Emisjon Platform

A modern React-based shareholder portal with Scandinavian design principles, featuring dual dashboard experiences for different user preferences.

## Features

### 🎨 Design System
- **Scandinavian Minimalism**: Clean, professional aesthetic inspired by RUM International and Kinfolk
- **Dual Theming**: Complete light/dark mode support
- **Professional Color Palette**: Teal-based color scheme (#124F62, #1C6A7E, #278899)
- **Typography**: EB Garamond serif headlines + Inter sans-serif body text
- **Accessibility**: ARIA labels, semantic HTML, and screen reader support

### 📱 Dashboard Variants
- **Minimal Dashboard** (`/minimal-dashboard`): Modern, clean interface with enhanced UX
- **Standard Dashboard** (`/dashboard`): Traditional interface with comprehensive functionality
- **Modular Components**: Reusable dashboard components (StatsGrid, ActiveEmissions, etc.)

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Multi-level user permissions (Level 1-3)
- **Complete Auth Flow**: Login, registration, password reset
- **Norwegian Localization**: Full nb-NO language support
- **Zod Validation**: Type-safe form validation with Norwegian error messages

### 💼 Core Functionality
- **Shareholder Management**: Complete CRUD operations for shareholders
- **Emission Tracking**: Investment opportunities and subscription management  
- **Trading Platform**: Secondary market functionality
- **Reporting**: Comprehensive shareholder reports and snapshots
- **User Management**: Admin panel for user administration

## Tech Stack

### Frontend
- **React 19.1.1** with TypeScript
- **Vite 7.1.2** for lightning-fast builds
- **Tailwind CSS 4.1.12** with custom design tokens
- **React Hook Form + Zod** for form management
- **Redux Toolkit** for state management
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **JWT** authentication
- **TypeScript** throughout

## Project Structure

```
📁 emisjon-frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/          # Reusable dashboard components
│   │   └── ui/                 # Base UI components
│   ├── features/
│   │   ├── auth/               # Authentication pages & logic
│   │   └── dashboard/
│   │       ├── components/     # Dashboard layouts
│   │       └── pages/
│   │           ├── minimal/    # Minimal dashboard pages
│   │           └── standard/   # Standard dashboard pages
│   ├── services/               # API services
│   ├── store/                  # Redux store
│   └── styles/                 # Design tokens & global styles
└── 📁 emisjon-backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    └── └── middleware/
```

## Development

### Frontend
```bash
cd emisjon-frontend
npm install
npm run dev
```

### Backend  
```bash
cd emisjon-backend
npm install
npm run dev
```

## Design Philosophy

This platform embodies **Skandinavisk Finance Minimalisme** - combining Nordic design principles with financial platform functionality:

- **Whitespace as a Design Element**: Generous spacing creates breathing room
- **Typography Hierarchy**: Clear information architecture with serif/sans-serif pairing
- **Subtle Interactions**: Hover effects and transitions that enhance without distraction
- **Professional Color Palette**: Sophisticated teal tones that convey trust and stability
- **Content-First**: Design serves the information, not the other way around

## Contributing

Built with ❤️ using modern web technologies and Scandinavian design principles.
