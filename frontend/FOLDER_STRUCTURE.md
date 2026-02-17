# Frontend Folder Structure

This document provides a comprehensive overview of the TENDEREASE.LK frontend folder structure.

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript 5
- **State Management**: Custom stores (Zustand/similar)

## Project Structure

```
frontend/
├── app/                          # Next.js App Router directory
│   ├── (auth)/                   # Authentication route group
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── register/
│   │   │   └── page.tsx         # Registration page
│   │   └── layout.tsx           # Auth layout wrapper
│   │
│   ├── (dashboard)/             # Dashboard route group
│   │   ├── evaluations/
│   │   │   └── page.tsx         # Tender evaluations page
│   │   ├── reports/
│   │   │   └── page.tsx         # Reports page
│   │   ├── tenders/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Individual tender details (dynamic route)
│   │   │   ├── create/
│   │   │   │   └── page.tsx     # Create new tender page
│   │   │   └── page.tsx         # Tenders list page
│   │   ├── vendors/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Individual vendor profile (dynamic route)
│   │   │   └── page.tsx         # Vendors list page
│   │   ├── layout.tsx           # Dashboard layout wrapper
│   │   └── page.tsx             # Dashboard home page
│   │
│   ├── api/                      # API routes (Next.js route handlers)
│   │   └── health/
│   │       └── route.ts         # Health check endpoint
│   │
│   ├── components/               # App-specific components
│   │   └── layout/
│   │       ├── Footer.tsx       # App footer component
│   │       ├── Header.tsx       # App header component
│   │       └── SubHeader.tsx    # App sub-header component
│   │
│   ├── favicon.ico              # App favicon
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── components/                   # Reusable React components
│   ├── common/
│   │   ├── DataTable.tsx        # Reusable data table component
│   │   ├── Header.tsx           # Common header component
│   │   └── Sidebar.tsx          # Common sidebar component
│   ├── evaluation/
│   │   └── ScoreSheet.tsx       # Evaluation score sheet component
│   ├── tender/
│   │   ├── TenderCard.tsx       # Tender card display component
│   │   └── TenderForm.tsx       # Tender creation/edit form
│   └── vendor/
│       └── VendorProfile.tsx    # Vendor profile component
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts               # Authentication hook
│
├── lib/                          # Utility libraries and helpers
│   ├── constants.ts             # Application constants
│   └── i18n.ts                  # Internationalization setup
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── schemas/                      # Validation schemas (Zod/Yup)
│   ├── auth.schema.ts           # Authentication validation schemas
│   ├── tender.schema.ts         # Tender validation schemas
│   └── vendor.schema.ts         # Vendor validation schemas
│
├── services/                     # API service layer
│   ├── api.ts                   # Base API configuration
│   ├── auth.service.ts          # Authentication service
│   ├── tender.service.ts        # Tender CRUD operations
│   └── vendor.service.ts        # Vendor CRUD operations
│
├── stores/                       # State management stores
│   ├── auth.store.ts            # Authentication state
│   ├── tender.store.ts          # Tender state
│   └── vendor.store.ts          # Vendor state
│
├── styles/                       # Additional stylesheets
│   └── globals.css              # Global CSS styles
│
├── tests/                        # Test files
│   └── tender.test.tsx          # Tender component tests
│
├── Dockerfile                    # Docker configuration for frontend
├── README.md                     # Frontend documentation
├── eslint.config.mjs            # ESLint configuration
├── next.config.js               # Next.js configuration (JS)
├── next.config.ts               # Next.js configuration (TS)
├── package.json                 # Node dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── postcss.config.mjs           # PostCSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Folder Descriptions

### `/app` - Next.js App Router
The main application directory using Next.js 13+ App Router architecture. Contains all routes, layouts, and app-specific components.

**Route Groups:**
- `(auth)` - Authentication-related pages (login, register)
- `(dashboard)` - Protected dashboard pages requiring authentication

**Key Features:**
- File-based routing
- Nested layouts
- Server and Client Components
- API routes via route handlers

### `/components` - Reusable Components
Organized by feature/domain:
- **common/** - Shared UI components used across the app
- **evaluation/** - Evaluation-specific components
- **tender/** - Tender-related components
- **vendor/** - Vendor-related components

### `/services` - API Layer
Abstracts backend API calls. Each service file handles a specific domain:
- HTTP request/response handling
- Error handling
- Data transformation

### `/stores` - State Management
Centralized state management for different domains:
- Global application state
- User session state
- Feature-specific state

### `/schemas` - Data Validation
Schema definitions for:
- Form validation
- API request/response validation
- Type-safe data structures

### `/hooks` - Custom React Hooks
Reusable logic extracted into hooks:
- Authentication
- Data fetching
- UI state management

### `/lib` - Utilities and Helpers
Common utilities:
- Constants and configuration
- Helper functions
- Third-party library configurations

### `/public` - Static Assets
Publicly accessible files served directly:
- Images
- Icons
- SVG files
- Fonts

### `/tests` - Test Suite
Component and integration tests

## Architecture Patterns

### 1. **Route Organization**
- Uses Next.js App Router with route groups for logical separation
- Dynamic routes for detail pages (`[id]`)
- Nested layouts for different sections

### 2. **Component Structure**
- Separation between app-specific (`app/components`) and reusable components (`components/`)
- Domain-driven component organization

### 3. **Service Layer Pattern**
- Centralized API communication
- Consistent error handling
- Reusable across components

### 4. **State Management**
- Store-based pattern for global state
- Domain-specific stores for better organization

### 5. **Type Safety**
- TypeScript throughout
- Schema validation for data integrity
- Type-safe API calls

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## Notes
- The project uses Next.js 16 with the App Router (not Pages Router)
- Tailwind CSS v4 is used for styling
- TypeScript is used throughout the project for type safety
- Route groups `(auth)` and `(dashboard)` don't affect the URL structure
