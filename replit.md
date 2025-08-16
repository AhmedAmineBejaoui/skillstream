# Overview

EasywaysSkills is a comprehensive e-learning platform backend built as a modular monolith using Node.js, Express, and TypeScript. The application provides a complete learning management system with user authentication, course management, progress tracking, e-commerce functionality, and administrative tools. It's designed to support students, instructors, and administrators with features including course catalogs, video lessons, assessments, certificates, and payment processing.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **State Management**: TanStack Query for server state and React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Architecture Pattern**: Modular monolith with clear service boundaries
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT-based with refresh token rotation using httpOnly cookies
- **Security**: Helmet for security headers, CORS configuration, rate limiting with express-rate-limit
- **Validation**: Zod schemas for request/response validation
- **Password Security**: bcrypt with 12 salt rounds

## Database Design
- **Primary Database**: PostgreSQL with comprehensive schema covering:
  - User management with role-based access (student, instructor, admin)
  - Course catalog with categories, chapters, and lessons
  - Learning progress tracking and assessments
  - E-commerce with pricing tiers, orders, and payments
  - Certificate generation and management
  - CMS functionality for blog posts and testimonials
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Data Types**: Extensive use of PostgreSQL enums and proper foreign key relationships

## Authentication & Authorization
- **Token Strategy**: Short-lived JWT access tokens (15 minutes) with long-lived refresh tokens (7 days)
- **Security Features**: Token version tracking for revocation, rate limiting on auth endpoints
- **Role-Based Access**: Granular permissions for students, instructors, and administrators
- **Middleware**: Custom authentication and authorization middleware with proper error handling

## Development Environment
- **Build System**: Vite for frontend development with HMR support
- **Type Safety**: Comprehensive TypeScript configuration with strict mode
- **Code Organization**: Monorepo structure with shared schema definitions
- **Development Tools**: tsx for development server, esbuild for production builds

# External Dependencies

## Database & Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Database Driver**: @neondatabase/serverless for edge-compatible database connections

## Frontend Dependencies
- **UI Framework**: React 18 with modern hooks and concurrent features
- **UI Components**: Complete Radix UI ecosystem for accessible components
- **Styling**: Tailwind CSS with PostCSS for processing
- **State Management**: TanStack Query for server state caching and synchronization
- **Form Handling**: React Hook Form with Zod resolvers for type-safe validation

## Backend Dependencies
- **Security**: bcrypt for password hashing, jsonwebtoken for JWT handling
- **HTTP Security**: helmet, cors, express-rate-limit for protection
- **Development**: tsx for TypeScript execution, nanoid for unique ID generation

## Build & Development Tools
- **Bundling**: Vite for frontend, esbuild for backend production builds
- **Type Checking**: TypeScript compiler with strict configuration
- **Schema Management**: Drizzle Kit for database schema operations
- **Development**: Replit-specific plugins for enhanced development experience

## Planned External Services
- **File Storage**: S3-compatible object storage for course materials and user uploads
- **CDN**: CloudFront or Cloudflare for asset delivery
- **Email Service**: For user notifications and course communications
- **Payment Processing**: Stripe or PayPal integration for course purchases
- **Search**: Meilisearch or Algolia for course and content search functionality