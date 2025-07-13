# Deployment Guide - Orient Medical ERP System

## 🚀 Render.com Deployment

### Step 1: Repository Setup
1. Push your code to GitHub repository
2. Ensure all environment-specific files are in `.gitignore`

### Step 2: Render Service Configuration

#### Web Service Settings:
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Node Version**: 18 or higher

#### Environment Variables:
```bash
NODE_ENV=development
DATABASE_URL=your-postgresql-connection-string
SESSION_SECRET=your-random-secret-key-minimum-32-characters
```

#### Optional Third-Party Integrations:
```bash
# Payment Processing
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key

# Email Services
SENDGRID_API_KEY=SG.your-sendgrid-api-key

# AI Features
ANTHROPIC_API_KEY=sk-ant-api03-your-anthropic-key
```

### Step 3: Database Setup
1. **Create PostgreSQL Database** in Render
2. **Copy Database URL** to environment variables
3. **Deploy** your application
4. **Database will auto-migrate** on first deployment

### Step 4: Post-Deployment Setup

#### 1. Verify Admin Access
- URL: `your-app-name.onrender.com`
- Username: `admin`
- Password: `admin123`

#### 2. Change Default Credentials
- Login to system
- Navigate to User Management
- Update admin password
- Create additional user accounts

#### 3. Configure Organization Settings
- Update organization branding
- Set up branch information
- Configure email templates

## 🔧 Production Optimization

### Performance Settings
```bash
# In your Render environment
NODE_ENV=development  # Use development for Render compatibility
```

### Health Checks
Render automatically configures health checks on your service endpoint.

### SSL/TLS
Render provides automatic HTTPS with SSL certificates.

## 🔍 Troubleshooting

### Common Issues:

#### Build Failures
```bash
# Ensure package.json has correct scripts
"scripts": {
  "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "node dist/index.js"
}
```

#### Database Connection Issues
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/dbname`
- Ensure database allows external connections
- Check SSL settings (Render requires SSL for PostgreSQL)

#### Login Issues
- Clear browser cache
- Verify SESSION_SECRET is set
- Check database contains user records

#### Environment Variable Problems
- Variables must be set in Render dashboard
- Restart service after adding new variables
- Use `NODE_ENV=development` for compatibility

## 📊 Monitoring

### Available Endpoints:
- **Health Check**: `/api/health`
- **Metrics**: `/api/dashboard/metrics`
- **System Status**: Monitor through admin dashboard

### Logs:
- Access logs through Render dashboard
- Monitor application errors
- Set up log alerts for critical issues

## 🔄 Updates and Maintenance

### Deployment Updates:
1. **Push to GitHub** repository
2. **Auto-deploy** triggers in Render
3. **Monitor logs** during deployment
4. **Verify** application functionality

### Database Migrations:
```bash
# For schema changes, run:
npm run db:push
```

### Backup Strategy:
- Render provides automated PostgreSQL backups
- Export critical data periodically
- Test restoration procedures

## 🛡 Security Considerations

### Required Security Settings:
- Strong SESSION_SECRET (32+ characters)
- HTTPS enforced (automatic in Render)
- Database SSL enabled
- Environment variables secured

### Recommended:
- Regular password updates
- Monitor access logs
- Enable two-factor authentication
- Regular security audits

## 📞 Support

For deployment issues:
- Check Render documentation
- Review application logs
- Contact support team
- GitHub Issues for code-related problems

---

**Last Updated**: January 2025
**Version**: 1.0.0