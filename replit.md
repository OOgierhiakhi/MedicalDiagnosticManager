# Orient Medical Diagnostic Centre ERP System

## Overview

This is a comprehensive Enterprise Resource Planning (ERP) system specifically designed for medical diagnostic centers in Nigeria. The system provides intelligent workflow management through advanced data management and patient-centric technologies, featuring multi-tenant architecture for supporting multiple branches and organizations.

## System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query + Context API
- **Authentication**: Passport.js with session-based authentication
- **Deployment**: Replit with PostgreSQL 16 module

### Multi-Tenant Architecture
The system is built with multi-tenant capabilities, allowing multiple organizations to use the same platform while maintaining complete data isolation. Each tenant has:
- Isolated database records with tenant-specific schemas
- Configurable branding and color themes
- Branch-specific operations and user management
- Role-based access control (RBAC) system

## Key Components

### 1. Patient Management System
- Comprehensive patient registration and profile management
- Visit-specific referral tracking (replacing patient-level referrals)
- Medical history and emergency contact management
- Appointment scheduling with multi-branch synchronization

### 2. Laboratory Information System (LIS)
- Complete test catalog with pricing and rebate limits
- Sample tracking with barcode integration capabilities
- Quality control protocols and result validation
- Comprehensive test consumption tracking for inventory

### 3. Financial Management System
- Multi-level approval workflows with automatic escalation
- Purchase order system with consultant services integration
- Petty cash management with CEO escalation for high-value expenses
- Revenue verification with payment method tracking
- Commission calculation system for referral providers

### 4. Inventory Management
- Category-based item organization with reorder levels
- Goods Received Note (GRN) processing
- Stock issuance with department-specific controls
- Role-based access controls for inventory operations

### 5. Role-Based Access Control (RBAC)
- Granular permissions with resource-action mapping
- Security audit dashboard with real-time monitoring
- Role hierarchy management with level indicators
- Comprehensive security event logging

## Data Flow

### Patient Visit Workflow
1. Patient registration or selection from existing records
2. Service selection with automatic pricing
3. Visit-specific referral provider assignment
4. Invoice generation with commission calculation
5. Payment processing with multiple payment methods
6. Thermal receipt generation (80mm and 110mm formats)

### Financial Approval Workflow
1. Expense request submission with supporting documents
2. Automatic routing based on amount thresholds (₦20,000 manager limit)
3. CEO escalation for high-value transactions
4. Payment authorization and disbursement
5. Complete audit trail with timestamps

### Commission Calculation Logic
- Service-specific rebate limits instead of global provider caps
- Per-visit referral tracking allowing same patient, different sources
- Accurate percentage calculations with individual service maximum amounts
- Monthly invoice generation for referral providers

## External Dependencies

### Database
- PostgreSQL 16 with connection pooling
- Drizzle ORM for type-safe database operations
- Session storage using pg-simple

### Third-Party Integrations (Configured)
- **Stripe**: Payment processing (test and live keys configured)
- **SendGrid**: Email notifications and communications
- **Anthropic AI**: Advanced analytics and AI-powered features

### Development Tools
- **Vite**: Fast development server and build tool
- **ESBuild**: Production bundling for server code
- **TypeScript**: Type safety across frontend and backend

## Deployment Strategy

### Environment Configuration
The system is configured for multi-environment deployment:

- **Development**: Local development with hot reloading
- **Staging**: Testing environment with staging database
- **Production**: Live environment with production-grade settings

### Required Environment Variables
```bash
DATABASE_URL=postgresql://connection-string
SESSION_SECRET=random-secret-key
STRIPE_SECRET_KEY=stripe-api-key
SENDGRID_API_KEY=sendgrid-api-key
```

### Build and Start Commands
- Development: `npm run dev`
- Production Build: `npm run build`
- Production Start: `npm run start`

## Changelog
- January 13, 2025. Prepared for GitHub upload and Render deployment - added comprehensive documentation, deployment guides, and cleaned project structure
- January 13, 2025. Fixed login workflow issues - removed validation barriers in patient intake form, added logout functionality to main dashboard
- January 13, 2025. Resolved laboratory workflow integration - tests now automatically appear on lab board after payment processing
- June 16, 2025. Fixed imaging workflow status issue - replaced inappropriate laboratory statuses with proper imaging workflow statuses for X-ray and ultrasound studies
- June 13, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.