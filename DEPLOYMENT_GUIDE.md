# Orient Medical Diagnostic Centre - Deployment Guide

## Overview

This guide provides complete instructions for deploying the Orient Medical Diagnostic Centre ERP system using our automated CI/CD pipeline.

## Prerequisites

### Required Secrets in GitHub

Set these secrets in your GitHub repository settings:

#### Staging Environment
- `STAGING_DATABASE_URL` - PostgreSQL connection string
- `STAGING_SESSION_SECRET` - Session encryption key
- `STAGING_JWT_SECRET` - JWT signing key
- `STAGING_STRIPE_SECRET_KEY` - Stripe test secret key
- `STAGING_STRIPE_PUBLIC_KEY` - Stripe test public key
- `STAGING_SENDGRID_API_KEY` - SendGrid API key for emails
- `STAGING_URL` - Staging application URL

#### Production Environment
- `PRODUCTION_DATABASE_URL` - PostgreSQL connection string
- `PRODUCTION_SESSION_SECRET` - Session encryption key
- `PRODUCTION_JWT_SECRET` - JWT signing key
- `PRODUCTION_STRIPE_SECRET_KEY` - Stripe live secret key
- `PRODUCTION_STRIPE_PUBLIC_KEY` - Stripe live public key
- `PRODUCTION_SENDGRID_API_KEY` - SendGrid API key for emails
- `PRODUCTION_URL` - Production application URL

#### Monitoring & Notifications
- `SLACK_WEBHOOK` - Slack webhook for deployment notifications
- `SNYK_TOKEN` - Snyk security scanning token
- `SENTRY_DSN` - Sentry error tracking DSN

## Deployment Process

### Automatic Deployment

The CI/CD pipeline automatically handles deployments based on git events:

1. **Pull Requests**: Run tests and security scans
2. **Main Branch**: Deploy to staging environment
3. **Release Tags**: Deploy to production environment

### Manual Deployment Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Emergency rollback
npm run deploy:rollback
```

## Pipeline Stages

### 1. Lint and Test
- ESLint code quality checks
- TypeScript type checking
- Unit tests with coverage
- Integration tests
- Security vulnerability scanning

### 2. Build
- Vite frontend build
- Node.js backend bundling
- Asset optimization
- Artifact generation

### 3. Deploy Staging
- Database migration
- Application deployment
- Smoke tests
- Notification to team

### 4. Deploy Production
- Pre-deployment backup
- Database migration
- Application deployment
- Health checks
- Rollback on failure

## Health Checks

The system includes comprehensive health monitoring:

### Application Health Endpoints
- `/api/health` - Overall application status
- `/api/health/database` - Database connectivity
- `/api/health/auth` - Authentication service
- `/api/health/external` - External API status

### Monitoring Integration
- Automated uptime monitoring
- Error tracking with Sentry
- Performance monitoring
- Log aggregation

## Rollback Procedures

### Automatic Rollback
The system automatically rolls back on:
- Failed health checks
- Database migration errors
- Critical application errors

### Manual Rollback
```bash
# Emergency rollback
FORCE_ROLLBACK=true npm run deploy:rollback
```

### Rollback Process
1. Create pre-rollback backup
2. Restore database from latest backup
3. Revert application to previous version
4. Verify system functionality
5. Notify stakeholders

## Database Management

### Migrations
```bash
# Run migrations
npm run db:migrate

# Create backup
npm run db:backup

# View migration status
npm run db:status
```

### Backup Strategy
- Automatic backups before deployments
- Daily scheduled backups
- Retention policy: 30 days
- Cross-region backup replication

## Security Considerations

### Environment Isolation
- Separate databases for staging/production
- Environment-specific API keys
- Network isolation and access controls

### Secret Management
- All secrets stored in GitHub Secrets
- Environment-specific configuration
- Regular secret rotation schedule

### Security Scanning
- Dependency vulnerability scanning
- Code security analysis
- Container security scanning
- Regular security audits

## Monitoring and Alerting

### Key Metrics
- Application uptime and response time
- Database performance and connectivity
- Error rates and critical failures
- User activity and system load

### Alert Conditions
- Application downtime > 1 minute
- Error rate > 5%
- Database connection failures
- High memory/CPU usage
- Failed deployments

### Notification Channels
- Slack for team notifications
- Email for critical alerts
- SMS for emergency situations
- Dashboard for real-time monitoring

## Troubleshooting

### Common Issues

#### Failed Deployment
1. Check GitHub Actions logs
2. Verify all secrets are configured
3. Ensure database connectivity
4. Review application logs

#### Database Migration Errors
1. Check migration file syntax
2. Verify database permissions
3. Review schema conflicts
4. Test migration on staging first

#### Performance Issues
1. Monitor database queries
2. Check application metrics
3. Review server resources
4. Analyze user load patterns

### Emergency Contacts
- Development Team: dev-team@orientmedical.com
- Operations Team: ops-team@orientmedical.com
- Emergency Hotline: +1-XXX-XXX-XXXX

## Maintenance Windows

### Scheduled Maintenance
- Weekly: Sundays 2:00-4:00 AM UTC
- Monthly: First Sunday 1:00-5:00 AM UTC
- Quarterly: Major updates and system upgrades

### Maintenance Procedures
1. Notify users 48 hours in advance
2. Create full system backup
3. Deploy updates to staging first
4. Execute production deployment
5. Verify system functionality
6. Monitor for 24 hours post-deployment

## Compliance and Audit

### Audit Trail
- All deployments logged and tracked
- Database changes recorded
- Access logs maintained
- Security events monitored

### Compliance Requirements
- HIPAA compliance for patient data
- SOC 2 Type II certification
- Regular penetration testing
- Data protection impact assessments

## Support and Documentation

### Additional Resources
- API Documentation: `/docs/api`
- User Guides: `/docs/user-guides`
- Technical Specifications: `/docs/technical`
- Troubleshooting Guide: `/docs/troubleshooting`

### Getting Help
1. Check this deployment guide
2. Review system logs and metrics
3. Contact development team
4. Escalate to operations team if critical