# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ALO 15S is a Vietnamese online loan application platform built as a full-stack application with React frontend and NestJS backend. The project focuses on providing quick loan services with a 3-step registration process and admin management capabilities.

**Key Information:**
- Platform: Vietnamese quick loan service ("alo-quick-loan")
- Architecture: Monorepo with separate frontend and backend
- Frontend: React SPA (originally from Lovable.dev)
- Backend: NestJS with MongoDB database
- Hotlines: 0815.320.648 - 0927.996.903

## Development Commands

### Root-Level Commands (Monorepo)
```bash
# Install all dependencies (frontend + backend)
npm install

# Start both frontend and backend in development
npm run dev

# Build both frontend and backend
npm run build

# Run linting for entire project
npm run lint

# Format code with Prettier
npm run format
```

### Frontend-Specific Commands
```bash
# Navigate to frontend
cd frontend

# Start frontend dev server (port 8080)
npm run dev

# Build frontend for production
npm run build

# Preview frontend production build
npm run preview
```

### Backend-Specific Commands
```bash
# Navigate to backend
cd backend

# Start backend in development (port 3000)
npm run start:dev

# Start backend in production
npm run start:prod

# Run backend tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Database Commands
```bash
# Setup database (from root)
npm run db:setup

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 with SWC plugin for fast compilation
- **UI Framework:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS with custom design system
- **Form Management:** React Hook Form with Zod validation
- **State Management:** TanStack Query for server state
- **Routing:** React Router DOM

### Backend
- **Framework:** NestJS with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Validation:** class-validator and class-transformer
- **API Documentation:** Swagger/OpenAPI
- **Architecture:** MVC pattern with modular structure
- **Notification:** Email, SMS, and Dashboard notifications

## Architecture

### Frontend Directory Structure
```
frontend/
└── src/
    ├── components/      # Reusable UI components
    │   ├── ui/         # shadcn/ui component library
    │   ├── ALOHeader.tsx
    │   ├── LoanForm.tsx
    │   └── ...
    ├── pages/          # Route-level page components
    ├── hooks/          # Custom React hooks
    ├── lib/            # Utility functions
    └── main.tsx        # Application entry point
```

### Backend Directory Structure
```
backend/
└── src/
    ├── config/         # Configuration files
    ├── common/         # Shared resources
    │   ├── dto/
    │   ├── interfaces/
    │   ├── guards/
    │   └── filters/
    ├── database/       # Database migrations and seeds
    └── modules/        # Feature modules
        ├── loan/       # Loan application module
        │   ├── dto/    # Data Transfer Objects
        │   ├── schemas/  # Mongoose schemas
        │   ├── enums/
        │   ├── loan.controller.ts
        │   ├── loan.service.ts
        │   └── loan.module.ts
        └── notification/  # Notification module
```

### Component Architecture
- **Single Page Application:** Primary route at `/` with `Index` page
- **Component-Based:** Modular components for loan form, eligibility, steps, etc.
- **Form-Centric:** Loan application flow with registration modal workflow
- **Responsive Design:** Mobile-first approach with Tailwind responsive utilities

### Key Components
- `LoanForm`: Interactive loan amount selector with real-time calculations
- `RegistrationModal`: User registration flow triggered after form submission  
- `LoanTable`: Display loan terms and repayment schedules
- `EligibilitySection` & `StepsSection`: Information sections

## Design System

### Custom Theme Extensions
- **Color Palette:** Custom primary, success, and accent-red colors
- **Custom Gradients:** `gradient-orange` and `gradient-hero` for visual appeal
- **Enhanced Shadows:** `elegant` and `card-custom` shadow variations
- **CSS Variables:** HSL-based color system for easy theming

### Path Aliases
- `@/components` → `src/components`
- `@/lib` → `src/lib`  
- `@/hooks` → `src/hooks`

## Development Notes

### Vite Configuration
- **Dev Server:** Runs on `::` (all interfaces) port 8080
- **Development Mode:** Includes Lovable component tagger for platform integration
- **Path Resolution:** `@` alias configured for `./src`

### Vietnamese Localization
- All UI text is in Vietnamese
- Currency formatting uses VND (Vietnamese Dong)
- Phone number format follows Vietnamese standards (10-11 digits)

### Loan Calculation Logic
- Interest rates and repayment schedules are hardcoded in `LoanForm.tsx`
- Amount ranges: 500,000 VND to 10,000,000 VND
- Installment options: 30-day and 40-day terms
- Real-time calculation updates based on slider input

### Integration Points
- **Lovable Platform:** Automatic commits and deployment through Lovable.dev
- **Component Tagging:** Development mode includes component identification for Lovable platform
- **Form Validation:** Zod schemas ensure data integrity
- **Toast Notifications:** Dual toast systems (shadcn + Sonner) for user feedback

## API Endpoints

### Loan Registration Flow
1. **POST /api/loan/step1** - Basic information (name, phone)
   - Returns: `loanApplicationId`
2. **POST /api/loan/step2** - Personal details (gender, DOB, ID, etc.)
   - Requires: `loanApplicationId`
3. **POST /api/loan/step3** - Contact & banking info
   - Requires: `loanApplicationId`
   - Triggers: Admin notification on completion

### Admin APIs
- **GET /api/loan/applications?status=pending** - List applications
- **GET /api/loan/applications/:id** - Get specific application
- **PATCH /api/loan/applications/:id** - Update status

### API Documentation
- Swagger UI available at: http://localhost:3000/api-docs
- All endpoints have comprehensive OpenAPI documentation

## Environment Configuration

### Backend Environment Variables
```env
# Application
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/alo_quick_loan
# Alternative for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/alo_quick_loan
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=alo_quick_loan

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

## Common Development Patterns

### Frontend
- Use the established shadcn/ui components rather than creating custom ones
- Follow the existing form patterns using React Hook Form + Zod
- Maintain Vietnamese language consistency in all user-facing text
- Utilize the custom Tailwind theme extensions for consistent styling
- Test responsive design across mobile and desktop breakpoints

### Backend
- Follow NestJS modular architecture patterns
- Use DTOs for all request/response validation
- Implement proper error handling with custom exceptions
- Keep business logic in services, not controllers
- Use Mongoose schemas for data modeling
- Document all APIs with Swagger decorators

### MongoDB Conventions
- Collection names: camelCase (e.g., `loanApplications`)
- Field names: camelCase
- Always use `timestamps: true` in schemas for `createdAt` and `updatedAt`
- MongoDB generates `_id` automatically (ObjectId)
- Add appropriate indexes for query performance
- Use pre-save hooks for data generation (e.g., `loanApplicationId`)
