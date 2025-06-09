# Orient Medical ERP - Troubleshooting Guide

## Failed Deployment

### 1. Check GitHub Actions Logs

**Step-by-step diagnosis:**
```bash
# Navigate to your repository on GitHub
https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Click on the failed workflow run
# Expand each job to see detailed logs
# Look for specific error messages in:
```

**Common failure patterns:**
- **Lint/Test Stage**: Code quality issues, failing tests
- **Build Stage**: TypeScript compilation errors, missing dependencies
- **Deploy Stage**: Environment configuration, database connectivity
- **Post-Deploy**: Health check failures, smoke test errors

**Action steps:**
1. Check the "Annotations" section for error summaries
2. Download logs for offline analysis if needed
3. Look for exit codes and error stack traces
4. Verify all required secrets are configured

### 2. Verify GitHub Secrets Configuration

**Required secrets checklist:**
```bash
# CI/CD Pipeline
SLACK_WEBHOOK ✓
SNYK_TOKEN ✓

# Environment-specific (staging/production)
{ENV}_DATABASE_URL ✓
{ENV}_SESSION_SECRET ✓ 
{ENV}_JWT_SECRET ✓
{ENV}_STRIPE_SECRET_KEY ✓
{ENV}_STRIPE_PUBLIC_KEY ✓
{ENV}_SENDGRID_API_KEY ✓
{ENV}_URL ✓
```

**Validation commands:**
```bash
# Test database connectivity
node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({ connectionString: 'YOUR_DATABASE_URL' });
pool.query('SELECT NOW()').then(() => console.log('✓ DB Connected')).catch(console.error);
"

# Verify Stripe keys format
echo $STRIPE_SECRET_KEY | grep -E '^sk_(test|live)_' && echo '✓ Valid Stripe key'

# Test SendGrid API
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}]}'
```

### 3. Database Connectivity Issues

**Diagnosis steps:**
```bash
# Test basic connectivity
node scripts/health-check.js

# Check database status
psql $DATABASE_URL -c "SELECT version();"

# Verify connection limits
psql $DATABASE_URL -c "
SELECT setting FROM pg_settings WHERE name = 'max_connections';
SELECT count(*) FROM pg_stat_activity;
"

# Check table permissions
psql $DATABASE_URL -c "
SELECT schemaname,tablename,tableowner,hasinserts,hasselects,hasupdates,hasdeletes 
FROM pg_tables WHERE schemaname = 'public';
"
```

**Common solutions:**
- **Connection timeout**: Increase connection timeout in database configuration
- **Too many connections**: Implement connection pooling or increase max_connections
- **Permission denied**: Verify database user has required privileges
- **SSL issues**: Check SSL certificate configuration and requirements

### 4. Migration Troubleshooting

**Pre-migration checks:**
```bash
# Backup before migration
node scripts/backup.js

# Verify migration files
ls -la migrations/
node -c "migrations/*.js"  # Syntax check

# Check current schema version
psql $DATABASE_URL -c "SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5;"
```

**Common migration errors:**
- **Syntax errors**: Review SQL syntax and Drizzle schema definitions
- **Permission issues**: Ensure database user has CREATE/ALTER privileges
- **Constraint conflicts**: Check for existing data that violates new constraints
- **Dependency issues**: Verify migration order and foreign key references

## Performance Issues

### 1. Health Endpoint Monitoring

**Primary health checks:**
```bash
# Overall application health
curl -s http://localhost:5000/api/health | jq '.'
# Expected: {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","uptime":12345}

# Database performance
curl -s http://localhost:5000/api/health/database | jq '.'
# Expected: {"status":"connected","responseTime":50,"activeConnections":5}

# Authentication service
curl -s http://localhost:5000/api/health/auth | jq '.'
# Expected: {"status":"operational","sessionStore":"connected"}

# External service dependencies
curl -s http://localhost:5000/api/health/external | jq '.'
# Expected: {"stripe":"ok","sendgrid":"ok","apis":"responsive"}
```

**Performance metrics to monitor:**
- **Response time**: Should be < 500ms for health checks
- **Memory usage**: Check for memory leaks or excessive consumption
- **CPU utilization**: Monitor for high CPU usage patterns
- **Database connections**: Ensure connection pool is not exhausted

### 2. Database Performance Analysis

**Query performance diagnosis:**
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls, total_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Active connections and queries
SELECT pid, usename, application_name, client_addr, state, query_start, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start;

-- Table sizes and bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
       pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage statistics
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
```

**Application performance monitoring:**
```bash
# Memory usage analysis
node --inspect scripts/health-check.js
# Open chrome://inspect in browser for detailed profiling

# CPU profiling
node --prof server/index.js
# Generate profile: node --prof-process isolate-*.log > profile.txt

# Event loop monitoring
node -e "
setInterval(() => {
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const delta = process.hrtime.bigint() - start;
    console.log('Event loop lag:', Number(delta) / 1e6, 'ms');
  });
}, 1000);
"
```

### 3. Load Testing and Optimization

**Basic load testing:**
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > loadtest.yml << EOF
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check load test"
    requests:
      - get:
          url: "/api/health"
      - get:
          url: "/api/health/database"
EOF

# Run load test
artillery run loadtest.yml
```

## Database Migration Errors

### 1. Syntax and Schema Issues

**Common syntax problems:**
```sql
-- Incorrect column type
ALTER TABLE patients ADD COLUMN invalid_date DATETIME; -- Should be TIMESTAMP

-- Missing quotes for reserved words
ALTER TABLE users ADD COLUMN order INTEGER; -- Should be "order"

-- Foreign key reference errors
ALTER TABLE tests ADD CONSTRAINT fk_patient 
FOREIGN KEY (patient_id) REFERENCES patient(id); -- Table name should be 'patients'
```

**Schema validation:**
```bash
# Validate Drizzle schema
npm run check

# Generate and review migration
npx drizzle-kit generate:pg --config=drizzle.config.ts

# Dry run migration (check without applying)
npx drizzle-kit up:pg --config=drizzle.config.ts --dry-run
```

### 2. Permission and Security Issues

**Database user permissions:**
```sql
-- Check current user permissions
SELECT current_user, session_user;

-- Grant necessary permissions
GRANT CREATE, USAGE ON SCHEMA public TO your_user;
GRANT CREATE ON DATABASE your_database TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;

-- Verify permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public';
```

### 3. Data Conflict Resolution

**Handle existing data conflicts:**
```sql
-- Check for constraint violations before migration
SELECT * FROM patients WHERE email IS NULL; -- Before adding NOT NULL constraint

-- Resolve duplicate data
WITH duplicates AS (
  SELECT email, COUNT(*), array_agg(id) as ids
  FROM patients 
  GROUP BY email 
  HAVING COUNT(*) > 1
)
SELECT * FROM duplicates;

-- Clean up before unique constraint
UPDATE patients SET email = email || '_' || id::text 
WHERE id IN (SELECT unnest(ids[2:]) FROM duplicates);
```

**Migration rollback procedures:**
```bash
# Create checkpoint before migration
node scripts/backup.js

# Apply migration with verification
npm run db:migrate

# If migration fails, rollback
FORCE_ROLLBACK=true node scripts/rollback.js

# Verify rollback success
node scripts/health-check.js
```

## Emergency Contacts

### Development Team
- **Email**: dev-team@orientmedical.com
- **Slack**: #dev-team-emergency
- **Response Time**: 2 hours during business hours, 4 hours after hours
- **Escalation**: Senior Developer on-call rotation

### Operations Team
- **Email**: ops-team@orientmedical.com
- **Slack**: #ops-alerts
- **Response Time**: 30 minutes for critical issues, 2 hours for standard
- **Escalation**: Operations Manager

### Emergency Hotline
- **Phone**: +1-555-ORIENT (1-555-674-3688)
- **Available**: 24/7 for critical system failures
- **Severity Levels**:
  - **P0 (Critical)**: System down, data breach, patient safety impact
  - **P1 (High)**: Major functionality impaired, significant user impact
  - **P2 (Medium)**: Minor functionality issues, workaround available
  - **P3 (Low)**: Enhancement requests, documentation updates

### Incident Response Team
- **Security Officer**: security@orientmedical.com
- **Compliance Officer**: compliance@orientmedical.com
- **Medical Director**: medical-director@orientmedical.com

## Maintenance Windows

### Weekly Maintenance
- **Schedule**: Sundays 2:00-4:00 AM UTC
- **Duration**: 2 hours maximum
- **Activities**: 
  - Security updates and patches
  - Performance optimization
  - Database maintenance
  - Log rotation and cleanup

**Cron Schedule**: `0 2 * * 0` (Every Sunday at 2:00 AM UTC)

### Monthly Maintenance
- **Schedule**: First Sunday of each month, 1:00-5:00 AM UTC
- **Duration**: 4 hours maximum
- **Activities**:
  - Major system updates
  - Database optimization and reindexing
  - Backup verification and testing
  - Security vulnerability remediation
  - Performance baseline review

**Cron Schedule**: `0 1 1-7 * 0` (First Sunday of month at 1:00 AM UTC)

### Quarterly Maintenance
- **Schedule**: Quarterly on agreed dates, 6-hour window
- **Duration**: 6 hours maximum
- **Activities**:
  - Major version upgrades
  - Infrastructure updates
  - Disaster recovery testing
  - Compliance audits and reviews
  - Performance capacity planning

**Automated CI Schedule**:
```yaml
# GitHub Actions schedule for maintenance
schedule:
  - cron: '0 2 * * 0'    # Weekly maintenance
  - cron: '0 1 1-7 * 0'  # Monthly maintenance (first Sunday)
  - cron: '0 0 1 1,4,7,10 *' # Quarterly maintenance
```

### Maintenance Notification Process
1. **48 hours advance notice** via email and dashboard banner
2. **24 hours reminder** with detailed maintenance plan
3. **1 hour warning** for start of maintenance window
4. **Real-time updates** during maintenance via status page
5. **Completion notification** with summary of changes

## Compliance & Audit

### HIPAA Compliance Requirements

**Technical Safeguards:**
- **Access Control**: Unique user identification, emergency access, automatic logoff
- **Audit Controls**: Hardware, software, and procedural mechanisms for audit logs
- **Integrity**: PHI must not be improperly altered or destroyed
- **Person or Entity Authentication**: Verify user identity before access
- **Transmission Security**: Guard against unauthorized access during transmission

**Implementation in Orient Medical ERP:**
```javascript
// Audit logging for all patient data access
app.use('/api/patients', (req, res, next) => {
  auditLogger.log({
    userId: req.user.id,
    action: req.method,
    resource: req.path,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Automatic session timeout
app.use(session({
  cookie: { maxAge: 15 * 60 * 1000 }, // 15 minutes
  rolling: true // Reset timer on activity
}));
```

### SOC 2 Type II Certification

**Control Framework Coverage:**
- **Security**: Information and systems are protected against unauthorized access
- **Availability**: Information and systems are available for operation and use
- **Processing Integrity**: System processing is complete, accurate, timely, and authorized
- **Confidentiality**: Information designated as confidential is protected
- **Privacy**: Personal information is collected, used, retained, and disclosed in conformity with commitments

**Evidence Collection:**
```bash
# Automated compliance reporting
node scripts/compliance-report.js --type=soc2 --period=quarterly

# Audit trail verification
node scripts/audit-verification.js --start-date=2024-01-01 --end-date=2024-03-31

# Access control review
node scripts/access-review.js --generate-report
```

### Audit Trail Requirements

**Comprehensive logging implementation:**
```javascript
// Database change tracking
const auditTrigger = `
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, operation, old_values, new_values, 
    user_id, timestamp, session_id
  ) VALUES (
    TG_TABLE_NAME, TG_OP, 
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    current_setting('app.current_user_id')::INTEGER,
    NOW(),
    current_setting('app.session_id')
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
`;

// Apply to all sensitive tables
const sensitiveHables = ['patients', 'patient_tests', 'invoices', 'users'];
sensitiveTables.forEach(table => {
  db.execute(`
    CREATE TRIGGER audit_${table}
    AFTER INSERT OR UPDATE OR DELETE ON ${table}
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
  `);
});
```

### Data Protection Processes

**Encryption at Rest:**
- Database encryption using AES-256
- File storage encryption for patient documents
- Encrypted backups with key rotation

**Encryption in Transit:**
- TLS 1.3 for all HTTP communications
- Database connections over SSL
- API calls with certificate pinning

**Data Retention and Disposal:**
```javascript
// Automated data retention policy
const retentionPolicy = {
  audit_logs: '7 years',
  patient_records: 'indefinite with consent',
  session_logs: '1 year',
  system_logs: '3 years'
};

// Secure data disposal
async function secureDataDisposal(table, criteria) {
  // Log disposal request
  await auditLogger.log({
    action: 'DATA_DISPOSAL',
    table,
    criteria,
    requestedBy: userId,
    timestamp: new Date()
  });
  
  // Secure deletion with overwrite
  await db.execute(`
    UPDATE ${table} SET 
      ${sensitiveColumns.map(col => `${col} = 'DELETED'`).join(', ')},
      deleted_at = NOW()
    WHERE ${criteria}
  `);
}
```

## Documentation Links

### Technical Documentation
- **[API Reference](/docs/api)** - Complete REST API documentation with examples
- **[Database Schema](/docs/database)** - Entity relationship diagrams and table specifications
- **[Architecture Guide](/docs/architecture)** - System design and component interactions
- **[Security Manual](/docs/security)** - Security protocols and compliance procedures

### User Documentation
- **[User Guides](/docs/user-guides)** - Role-specific user manuals and tutorials
- **[Admin Manual](/docs/admin)** - System administration and configuration
- **[Training Materials](/docs/training)** - Onboarding and certification resources
- **[FAQ](/docs/faq)** - Frequently asked questions and solutions

### Operational Documentation
- **[Deployment Guide](/docs/deployment)** - Infrastructure setup and deployment procedures
- **[Monitoring Guide](/docs/monitoring)** - System monitoring and alerting configuration
- **[Backup Procedures](/docs/backup)** - Data backup and recovery protocols
- **[Incident Response](/docs/incident-response)** - Emergency procedures and escalation

### Compliance Documentation
- **[HIPAA Compliance](/docs/hipaa)** - Healthcare data protection requirements
- **[SOC 2 Documentation](/docs/soc2)** - Security control implementation
- **[Audit Procedures](/docs/audit)** - Internal and external audit processes
- **[Privacy Policy](/docs/privacy)** - Data handling and privacy protection

For additional support or documentation requests, contact the development team at dev-team@orientmedical.com.