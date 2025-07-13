# Orient Medical Diagnostic Centre ERP System

A comprehensive Enterprise Resource Planning (ERP) system specifically designed for medical diagnostic centers in Nigeria. Features intelligent workflow management through advanced data management and patient-centric technologies with multi-tenant architecture.

## 🏥 Features

### Core Modules
- **Patient Management**: Registration, records, appointment scheduling
- **Laboratory Information System**: Test processing, results, quality control
- **Financial Management**: Multi-level approval workflows, revenue tracking
- **Inventory Management**: Stock control, reorder levels, consumption tracking
- **Role-Based Access Control**: Granular permissions, security audit dashboard

### Specialized Units
- **Radiology/Imaging**: X-Ray, CT, Ultrasound management
- **Cardiology**: ECG, stress tests, monitoring
- **Laboratory**: Hematology, Chemistry, Microbiology
- **Pharmacy**: Medication dispensing and inventory

### Financial Features
- **Multi-payment Methods**: Cash, bank transfer, POS, mobile payments
- **Commission Calculation**: Referral provider rebates
- **Thermal Receipt Printing**: 80mm and 110mm formats
- **Invoice Management**: Automated billing and payment processing

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query + Context API
- **Authentication**: Passport.js with session-based authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Environment Variables
Create a `.env` file in the root directory:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/orient_medical
SESSION_SECRET=your-super-secret-session-key
NODE_ENV=development

# Optional: Third-party integrations
STRIPE_SECRET_KEY=your-stripe-secret-key
SENDGRID_API_KEY=your-sendgrid-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/orient-medical-erp.git
   cd orient-medical-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Push database schema
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5000
   - Login with: `admin` / `admin123`

## 📦 Deployment

### Render.com Deployment

1. **Connect GitHub repository** to Render
2. **Set build command**: `npm install && npm run build`
3. **Set start command**: `npm run start`
4. **Environment variables**:
   ```
   NODE_ENV=development
   DATABASE_URL=your-postgresql-connection-string
   SESSION_SECRET=your-random-secret-key
   ```

### Production Build
```bash
npm run build
npm run start
```

## 🔐 Default Credentials

**Administrator Account**:
- Username: `admin`
- Password: `admin123`
- Role: System Administrator

**Change default password immediately after first login**

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Express backend
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Database layer
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
└── scripts/               # Utility scripts
```

## 🏗 Architecture

### Multi-Tenant Design
- Isolated database records with tenant-specific schemas
- Configurable branding and color themes
- Branch-specific operations and user management
- Role-based access control (RBAC) system

### Data Flow
1. **Patient Visit**: Registration → Service Selection → Referral Assignment → Invoice Generation → Payment Processing
2. **Financial Approval**: Request → Automatic Routing → CEO Escalation → Payment Authorization → Audit Trail
3. **Commission Calculation**: Service-specific rebate limits → Per-visit tracking → Monthly invoicing

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: support@orient-medical.com

## 🏥 About Orient Medical

Orient Medical Diagnostic Centre is a leading healthcare provider in Nigeria, committed to delivering quality diagnostic services with advanced technology and professional excellence.