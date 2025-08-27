# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

ALO 15S is a Vietnamese online loan application platform built as a modern React SPA. The project is developed using Lovable.dev platform and focuses on providing quick loan services with instant approval.

**Key Information:**
- Platform: Vietnamese quick loan service ("alo-quick-loan")
- Hotlines: 0815.320.648 - 0927.996.903
- Lovable Project: https://lovable.dev/projects/06d81c87-1b76-4a8e-91d8-ce5a2e1720e2

## Development Commands

```bash
# Start development server with hot reload (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Run ESLint for code linting
npm run lint

# Preview production build
npm run preview

# Install dependencies
npm i
```

**Alternative Package Manager:**
The project includes `bun.lockb`, indicating Bun is also supported:
```bash
bun install
bun run dev
```

## Technology Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5 with SWC plugin for fast compilation
- **UI Framework:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS with custom design system
- **Form Management:** React Hook Form with Zod validation
- **State Management:** TanStack Query for server state
- **Routing:** React Router DOM
- **Development Integration:** Lovable platform with component tagger

## Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui component library
│   ├── ALOHeader.tsx   # Main application header
│   ├── LoanForm.tsx    # Core loan application form
│   ├── LoanTable.tsx   # Loan information display table
│   └── ...             # Other feature components
├── pages/              # Route-level page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── main.tsx           # Application entry point
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

## Common Development Patterns

When working with this codebase:
- Use the established shadcn/ui components rather than creating custom ones
- Follow the existing form patterns using React Hook Form + Zod
- Maintain Vietnamese language consistency in all user-facing text
- Utilize the custom Tailwind theme extensions for consistent styling
- Test responsive design across mobile and desktop breakpoints
