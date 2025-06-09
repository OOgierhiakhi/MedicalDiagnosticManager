# Orient Medical ERP - CI/CD Pipeline

## Quick Start

### 1. Setup GitHub Secrets
```bash
# Required for all environments
SLACK_WEBHOOK=https://hooks.slack.com/services/...
SNYK_TOKEN=your-snyk-token

# Staging Environment
STAGING_DATABASE_URL=postgresql://...
STAGING_SESSION_SECRET=random-secret-key
STAGING_STRIPE_SECRET_KEY=sk_test_...
STAGING_URL=https://staging.orientmedical.com

# Production Environment  
PRODUCTION_DATABASE_URL=postgresql://...
PRODUCTION_SESSION_SECRET=random-secret-key
PRODUCTION_STRIPE_SECRET_KEY=sk_live_...
PRODUCTION_URL=https://orientmedical.com
```

### 2. Deploy Commands
```bash
# Automatic deployment on git push
git push origin main          # Deploys to staging
git tag v1.0.0 && git push --tags  # Deploys to production

# Manual deployment
node scripts/health-check.js    # Verify system health
node scripts/backup.js          # Create database backup
node scripts/migrate.js         # Run database migrations
node scripts/smoke-tests.js     # Basic functionality tests
```

### 3. Emergency Procedures
```bash
# Emergency rollback
FORCE_ROLLBACK=true node scripts/rollback.js

# Health monitoring
node scripts/monitoring-setup.js
```

## Pipeline Architecture

### CI/CD Workflow Stages
1. **Code Quality**: Linting, type checking, security scans
2. **Testing**: Unit tests, integration tests, coverage reports
3. **Build**: Frontend compilation, backend bundling
4. **Deploy Staging**: Automated staging deployment with smoke tests
5. **Deploy Production**: Production deployment with health checks and rollback capability

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: Live environment with monitoring and alerts

### Database Management
- Automated migrations before deployments
- Pre-deployment backups with 30-day retention
- Rollback capability to previous database state
- Connection pooling and performance monitoring

### Monitoring and Alerting
- Real-time health checks every 60 seconds
- Slack notifications for deployment status
- Critical alerts for downtime or high error rates
- Performance metrics and response time tracking

## Security Features

### Secrets Management
- Environment-specific secrets in GitHub Secrets
- No secrets stored in code repository
- Automatic secret rotation capabilities
- Encrypted data transmission

### Vulnerability Scanning
- Dependency vulnerability checks with Snyk
- Code security analysis in CI pipeline
- Container security scanning
- Regular security audit reports

### Access Control
- Branch protection rules for production deployments
- Required reviews for critical changes
- Deployment approval gates for production
- Audit logging for all deployment activities

## Deployment Status Badge

Add to your README to show current deployment status:
```markdown
![Deployment Status](https://github.com/orientmedical/erp/actions/workflows/ci-cd.yml/badge.svg)
```

## Troubleshooting

### Failed Deployment
Check GitHub Actions logs and verify:
- All required secrets are configured
- Database connectivity is working
- No conflicting migrations exist

### Performance Issues
Monitor via health check endpoints:
- `/api/health` - Application status
- `/api/health/database` - Database performance
- `/api/health/auth` - Authentication service

### Emergency Contacts
- Development Team: dev-team@orientmedical.com
- Operations: ops-team@orientmedical.com
- Emergency: +1-XXX-XXX-XXXX