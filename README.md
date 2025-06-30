# Order App Frontend

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🌏 Language & Localization

**Important Note**: All user-facing content in this application is displayed in Vietnamese to serve Vietnamese customers. While this README and code comments are in English, all UI text, error messages, form labels, and user interactions are in Vietnamese. See `CODING_CONVENTIONS.md` for detailed guidelines on Vietnamese content requirements.

## 🎨 Design & Theme

-   **UI Framework**: Material UI (MUI)
-   **Theme**: Blue and White color scheme
-   **Styling**: Tailwind CSS for additional styling needs

## 📋 Coding Conventions

### 🏗️ Architecture Principles

**Keep It Simple**: This project follows a straightforward approach focused on maintainability and consistency.

### 📁 Component Structure

-   **Route Groups**: Using Next.js route groups `(main)` for authenticated pages
-   **Shared Layout**: Common header and navigation in `(main)/layout.tsx`
-   **Page-Level Components**: Each page has its own dedicated components
-   **Self-Contained Logic**: All logic for a page stays within that page's components
-   **Material UI First**: Use Material UI components directly in pages
-   **No Shared Components**: Avoid creating common/shared components to maintain page isolation

### 🔧 Technical Stack

-   **Framework**: Next.js 15 with App Router
-   **Language**: TypeScript
-   **UI Library**: Material UI (MUI)
-   **HTTP Client**: Axios (centralized client)
-   **Authentication**: Centralized auth handling
-   **Styling**: Tailwind CSS + MUI theme

### 📂 Current Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (main)/            # Route group for authenticated pages
│   │   ├── layout.tsx     # Shared layout with header & navigation
│   │   ├── dashboard/     # Dashboard page
│   │   │   └── page.tsx   # Dashboard page with all logic
│   │   └── products/      # Products management page
│   │       └── page.tsx   # Products page with all logic
│   ├── login/             # Login page
│   │   └── page.tsx       # Login page with all logic
│   ├── page.tsx           # Home page (redirects to login/dashboard)
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # Client providers (MUI theme)
│   ├── globals.css        # Global styles
│   └── favicon.ico        # App icon
├── lib/                   # Utilities and configurations
│   ├── axios.ts          # Centralized axios client
│   ├── auth.ts           # Authentication utilities
│   ├── products.ts       # Products API utilities
│   └── theme.ts          # MUI theme configuration
└── types/                 # TypeScript type definitions
    └── index.ts          # All type definitions
```

### 🎯 Development Guidelines

1. **Route Groups**: Use `(main)` route group for authenticated pages with shared layout
2. **Shared Layout**: Common header and navigation in `(main)/layout.tsx`
3. **Page Isolation**: Each page should be self-contained with all its logic
4. **No Shared Components**: Avoid creating common/shared components to maintain page isolation
5. **API Calls**: Use the centralized axios client for all API requests
6. **Authentication**: Handle auth through the centralized auth utilities
7. **Styling**: Use MUI components with blue/white theme, Tailwind for custom styling
8. **TypeScript**: Use strict typing for all components and functions
9. **File Naming**: Use kebab-case for file names, PascalCase for components
10. **Vietnamese Content**: All user-facing content must be in Vietnamese

### 📝 Structure Maintenance

**Important**: This README should be updated whenever the project structure changes. Please check:

- [ ] New pages or route groups added
- [ ] New directories created in `src/`
- [ ] New utility files added to `lib/`
- [ ] New type definitions added
- [ ] Component structure changes
- [ ] API endpoints added or modified

Update the project structure section above to reflect any changes.

## 🚀 Getting Started

### Environment Setup

1. Create a `.env.local` file in the root directory:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Available Scripts

-   `pnpm run dev` - Start development server
-   `pnpm run build` - Build for production
-   `pnpm run start` - Start production server
-   `pnpm run lint` - Run linting (JS + Style)
-   `pnpm run lint:js` - Run JavaScript/TypeScript linting
-   `pnpm run lint:style` - Run CSS/SCSS linting
-   `pnpm run format` - Format code with Prettier
-   `pnpm run format:check` - Check code formatting
-   `pnpm run validate` - Run all validation checks
-   `pnpm run autofix` - Auto-fix ESLint issues

## 🎨 Theme Configuration

The project uses a blue and white theme with Material UI. Theme configuration can be found in `src/lib/theme.ts`.

## 🔐 Authentication

Authentication is handled centrally through utilities in `src/lib/auth.ts`. Currently supports:

-   Login functionality
-   Token storage and retrieval
-   Logout functionality
-   Route protection for `(main)` group

## 🌐 API Integration

All API calls use the centralized axios client located in `src/lib/axios.ts`. Currently supports:

-   Login endpoint: `POST /api/v1/users/login`
-   Products management: `src/lib/products.ts`

The backend URL is configured via the `NEXT_PUBLIC_API_URL` environment variable.

## 📚 Learn More

To learn more about the technologies used:

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Material UI Documentation](https://mui.com/)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
-   [Axios Documentation](https://axios-http.com/docs/intro)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
