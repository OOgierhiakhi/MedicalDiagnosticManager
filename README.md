# Orient Medical Diagnostic Centre - ERP System

![CI/CD Pipeline](https://github.com/orientmedical/erp/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-20.x-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

A sophisticated medical diagnostic center ERP system that optimizes operational workflows through advanced data management and patient-centric technologies.

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- PostgreSQL database
- GitHub repository with Actions enabled

### 1. Setup GitHub Secrets

Configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Required for CI/CD Pipeline
```bash
SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
SNYK_TOKEN=your-snyk-security-token
```

#### Staging Environment
```bash
STAGING_DATABASE_URL=postgresql://user:password@staging-host:5432/dbname
STAGING_SESSION_SECRET=staging-random-secret-key-32-chars
STAGING_JWT_SECRET=staging-jwt-signing-key
STAGING_STRIPE_SECRET_KEY=sk_test_staging_stripe_key
STAGING_STRIPE_PUBLIC_KEY=pk_test_staging_stripe_key
STAGING_SENDGRID_API_KEY=SG.staging_sendgrid_api_key
STAGING_URL=https://staging.orientmedical.com
```

#### Production Environment
```bash
PRODUCTION_DATABASE_URL=postgresql://user:password@prod-host:5432/dbname
PRODUCTION_SESSION_SECRET=production-random-secret-key-32-chars
PRODUCTION_JWT_SECRET=production-jwt-signing-key
PRODUCTION_STRIPE_SECRET_KEY=sk_live_production_stripe_key
PRODUCTION_STRIPE_PUBLIC_KEY=pk_live_production_stripe_key
PRODUCTION_SENDGRID_API_KEY=SG.production_sendgrid_api_key
PRODUCTION_URL=https://orientmedical.com
```

### 2. One-Line Deploy Commands

#### Automatic Deployment
```bash
# Deploy to staging (automatic on main branch)
git push origin main

# Deploy to production (automatic on release tags)
git tag v1.0.0
git push origin v1.0.0
```

#### Manual Deployment Scripts
```bash
# Health monitoring
node scripts/health-check.js

# Database backup
node scripts/backup.js

# Emergency rollback
FORCE_ROLLBACK=true node scripts/rollback.js

# Run smoke tests
node scripts/smoke-tests.js
```

### 3. Local Development

```bash
# Clone and install
git clone https://github.com/orientmedical/erp.git
cd erp
npm install

# Setup environment
cp .env.example .env
# Edit .env with your local database credentials

# Initialize database
npm run db:push

# Start development server
npm run dev
```

### 4. Adding the Status Badge

Add this to your repository README:
```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci-cd.yml/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

## Features

### Core ERP Modules
- **Patient Management**: Complete patient lifecycle with medical history tracking
- **Laboratory Operations**: Test scheduling, result management, quality control
- **Financial Management**: Billing, invoicing, payment processing, revenue tracking
- **Inventory Management**: Stock control, automated reordering, consumption tracking
- **Human Resources**: Staff management, scheduling, performance tracking
- **Referral System**: Doctor referrals with automated rebate calculations

### Advanced Capabilities
- **Role-Based Access Control (RBAC)**: Granular permissions for different user types
- **Audit Trail**: Comprehensive logging of all system activities
- **Reporting & Analytics**: Real-time dashboards and exportable reports
- **Approval Workflows**: Multi-level approval processes with timestamp logging
- **Predictive Analytics**: ML-powered revenue forecasting and inventory optimization
- **Multi-Tenant Architecture**: Support for multiple branches and organizations

### DevOps & Deployment
- **Zero-Touch CI/CD**: Automated testing, building, and deployment
- **Database Migrations**: Safe, reversible schema changes
- **Health Monitoring**: Real-time system health checks and alerting
- **Security Scanning**: Automated vulnerability detection and reporting
- **Backup & Recovery**: Automated backups with emergency rollback capabilities

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with secure authentication
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with JWT support
- **Payment Processing**: Stripe integration
- **Email**: SendGrid for notifications

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state
- **UI Components**: Radix UI with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Infrastructure
- **CI/CD**: GitHub Actions with automated deployment
- **Monitoring**: Custom health checks with Slack integration
- **Security**: Snyk vulnerability scanning
- **Database**: PostgreSQL with connection pooling
- **Hosting**: Production-ready with load balancing support

## Architecture

### System Design
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   React/TS      │◄──►│   Express/TS    │◄──►│   PostgreSQL    │
│   Tailwind CSS  │    │   Drizzle ORM   │    │   Multi-tenant  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Business      │    │   Data Layer    │
│   Radix UI      │    │   Logic         │    │   Relations     │
│   shadcn/ui     │    │   Validation    │    │   Constraints   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Security Model
- Multi-tenant data isolation with row-level security
- Role-based access control with granular permissions
- Encrypted data transmission and secure session management
- Automated security scanning and vulnerability monitoring
- Audit logging for all critical operations

## API Documentation

### Health Check Endpoints
- `GET /api/health` - Overall system status
- `GET /api/health/database` - Database connectivity
- `GET /api/health/auth` - Authentication service status
- `GET /api/health/external` - External service dependencies

### Core API Routes
- `POST /api/patients` - Patient registration and management
- `GET /api/tests` - Laboratory test management
- `POST /api/invoices` - Financial transaction processing
- `GET /api/inventory` - Stock and inventory operations
- `GET /api/reports` - Analytics and reporting endpoints

## Database Schema

### Core Entities
- **Patients**: Demographics, medical history, insurance information
- **Tests**: Laboratory procedures, results, quality metrics
- **Invoices**: Billing records, payment status, financial tracking
- **Inventory**: Stock items, consumption patterns, reorder levels
- **Users**: Staff accounts, roles, permissions, audit trails

### Relationships
- One-to-many: Patient → Tests, Patient → Invoices
- Many-to-many: Tests → Inventory (consumption tracking)
- Hierarchical: Organizations → Branches → Departments

## Deployment Environments

### Development
- Local development with hot reload
- In-memory session storage
- Development database with seed data
- Debug logging enabled

### Staging
- Production-like environment for testing
- PostgreSQL database with realistic data
- Stripe test mode for payment processing
- Comprehensive monitoring and logging

### Production
- High-availability configuration
- Database replication and backups
- Stripe live mode for real transactions
- 24/7 monitoring with alerting

## Monitoring & Alerting

### Health Monitoring
- Application uptime and response time tracking
- Database performance and connection monitoring
- External service dependency checks
- Real-time error rate and performance metrics

### Alert Conditions
- Application downtime exceeding 2 minutes
- Error rate above 5% threshold
- Database connection failures
- Payment processing issues
- Security incidents

### Notification Channels
- Slack integration for team notifications
- Email alerts for critical system issues
- SMS notifications for emergency situations
- Dashboard displays for real-time monitoring

## Contributing

### Development Workflow
1. Fork the repository and create a feature branch
2. Make changes with appropriate tests and documentation
3. Ensure all CI checks pass (linting, tests, security scans)
4. Create a pull request with detailed description
5. Code review and approval before merging

### Code Standards
- TypeScript for all new code with strict type checking
- ESLint configuration for consistent code style
- Comprehensive test coverage for critical functionality
- Security-first approach with vulnerability scanning

### Testing Requirements
- Unit tests for business logic components
- Integration tests for API endpoints
- End-to-end tests for critical user workflows
- Performance testing for database operations

## Support & Documentation

### Additional Resources
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete operational procedures
- [CI/CD Documentation](README_CICD.md) - Pipeline configuration and troubleshooting
- [API Reference](docs/api.md) - Detailed endpoint documentation
- [User Guides](docs/user-guides/) - End-user documentation

### Getting Help
1. Check existing documentation and troubleshooting guides
2. Review system logs and monitoring dashboards
3. Contact development team: dev-team@orientmedical.com
4. For emergencies: ops-team@orientmedical.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with modern web technologies and best practices for healthcare data management, ensuring compliance with medical data protection standards and operational excellence in diagnostic center management.