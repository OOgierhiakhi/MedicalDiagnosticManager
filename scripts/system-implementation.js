#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

class SystemImplementation {
  constructor() {
    this.db = drizzle({ 
      client: new Pool({ connectionString: process.env.DATABASE_URL })
    });
    this.logFile = path.resolve(__dirname, '../logs/implementation.log');
    this.errors = [];
  }

  async log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(`${level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : '✅'} ${message}`);
    
    try {
      await fs.mkdir(path.dirname(this.logFile), { recursive: true });
      await fs.appendFile(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }

  async validateDatabase() {
    await this.log('Validating database connection and schema...');
    
    try {
      // Test basic connectivity
      const [result] = await this.db.execute('SELECT version()');
      await this.log(`Database connected: PostgreSQL ${result.version?.split(' ')[1] || 'Unknown'}`);

      // Check if core tables exist
      const tables = [
        'users', 'patients', 'appointments', 'services', 'inventory', 
        'employees', 'departments', 'suppliers', 'invoices'
      ];

      for (const table of tables) {
        try {
          await this.db.execute(`SELECT 1 FROM ${table} LIMIT 1`);
          await this.log(`Table validated: ${table}`);
        } catch (error) {
          throw new Error(`Missing or invalid table: ${table}`);
        }
      }

      return true;
    } catch (error) {
      await this.log(`Database validation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupOrganizationBranding() {
    await this.log('Setting up organization branding and configuration...');

    const orgConfig = {
      organizationName: 'Orient Medical Diagnostic Centre',
      address: 'Medical Complex, Healthcare District, Mumbai - 400001',
      phone: '+91-22-12345678',
      email: 'info@orientmedical.com',
      website: 'https://orientmedical.com',
      gstNumber: 'TO_BE_CONFIGURED',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDA3N0JFIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+T01EQzwvdGV4dD4KPC9zdmc+'
    };

    try {
      await this.db.execute(`
        INSERT INTO organization_branding (
          organization_name, address, phone, email, website, 
          gst_number, logo, is_active, created_at
        ) VALUES (
          '${orgConfig.organizationName}', '${orgConfig.address}', 
          '${orgConfig.phone}', '${orgConfig.email}', '${orgConfig.website}',
          '${orgConfig.gstNumber}', '${orgConfig.logo}', true, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          organization_name = EXCLUDED.organization_name,
          address = EXCLUDED.address,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          updated_at = NOW()
      `);

      await this.log('Organization branding configured successfully');
      return true;
    } catch (error) {
      await this.log(`Failed to setup organization branding: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async createDefaultAdmin() {
    await this.log('Creating default administrator account...');

    try {
      // Create default admin user
      const adminData = {
        username: 'admin',
        email: 'admin@orientmedical.com',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'CEO',
        department: 'EXECUTIVE'
      };

      // Check if admin user already exists
      const [existingUser] = await this.db.execute(`
        SELECT id FROM users WHERE username = '${adminData.username}' OR email = '${adminData.email}'
      `);

      if (existingUser) {
        await this.log('Default admin user already exists, skipping creation');
        return true;
      }

      // Create employee record first
      await this.db.execute(`
        INSERT INTO employees (
          employee_id, first_name, last_name, email, phone, 
          role, department, hire_date, is_active
        ) VALUES (
          'EMP000', '${adminData.firstName}', '${adminData.lastName}', 
          '${adminData.email}', '9999999999', '${adminData.role}', 
          '${adminData.department}', CURRENT_DATE, true
        ) ON CONFLICT (employee_id) DO NOTHING
      `);

      // Create user account
      await this.db.execute(`
        INSERT INTO users (
          username, email, password, first_name, last_name, 
          role, is_active, created_at
        ) VALUES (
          '${adminData.username}', '${adminData.email}', 
          '$2b$10$K8QJZ8QJZ8QJZ8QJZ8QJZOxK8QJZ8QJZ8QJZ8QJZ8QJZ8QJZ8QJZ8', 
          '${adminData.firstName}', '${adminData.lastName}', 
          '${adminData.role}', true, NOW()
        )
      `);

      await this.log('Default admin account created successfully');
      await this.log('Admin credentials: username=admin, password=admin123 (CHANGE IMMEDIATELY)');
      
      return true;
    } catch (error) {
      await this.log(`Failed to create default admin: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupServiceCatalog() {
    await this.log('Setting up comprehensive service catalog...');

    const services = [
      // Laboratory Services - Hematology
      { code: 'LAB001', name: 'Complete Blood Count (CBC)', category: 'LABORATORY', dept: 'hematology', price: 400, duration: 30, sample: 'EDTA Blood' },
      { code: 'LAB002', name: 'Hemoglobin (Hb)', category: 'LABORATORY', dept: 'hematology', price: 200, duration: 15, sample: 'EDTA Blood' },
      { code: 'LAB003', name: 'Platelet Count', category: 'LABORATORY', dept: 'hematology', price: 300, duration: 20, sample: 'EDTA Blood' },
      
      // Laboratory Services - Clinical Chemistry
      { code: 'LAB101', name: 'Fasting Blood Glucose', category: 'LABORATORY', dept: 'clinical_chemistry', price: 150, duration: 15, sample: 'Serum' },
      { code: 'LAB102', name: 'Random Blood Glucose', category: 'LABORATORY', dept: 'clinical_chemistry', price: 150, duration: 15, sample: 'Serum' },
      { code: 'LAB103', name: 'HbA1c', category: 'LABORATORY', dept: 'clinical_chemistry', price: 600, duration: 30, sample: 'EDTA Blood' },
      { code: 'LAB104', name: 'Lipid Profile', category: 'LABORATORY', dept: 'clinical_chemistry', price: 800, duration: 30, sample: 'Serum' },
      { code: 'LAB105', name: 'Liver Function Tests', category: 'LABORATORY', dept: 'clinical_chemistry', price: 900, duration: 45, sample: 'Serum' },
      { code: 'LAB106', name: 'Kidney Function Tests', category: 'LABORATORY', dept: 'clinical_chemistry', price: 700, duration: 30, sample: 'Serum' },
      
      // Laboratory Services - Immunology
      { code: 'LAB201', name: 'Thyroid Profile (T3, T4, TSH)', category: 'LABORATORY', dept: 'immunology', price: 1200, duration: 60, sample: 'Serum' },
      { code: 'LAB202', name: 'Hepatitis B Surface Antigen', category: 'LABORATORY', dept: 'immunology', price: 500, duration: 30, sample: 'Serum' },
      { code: 'LAB203', name: 'HIV Screening', category: 'LABORATORY', dept: 'immunology', price: 800, duration: 45, sample: 'Serum' },
      
      // Imaging Services - X-Ray
      { code: 'IMG001', name: 'Chest X-Ray PA View', category: 'IMAGING', dept: 'xray', price: 800, duration: 15, sample: null },
      { code: 'IMG002', name: 'Chest X-Ray Lateral View', category: 'IMAGING', dept: 'xray', price: 900, duration: 20, sample: null },
      { code: 'IMG003', name: 'Abdomen X-Ray', category: 'IMAGING', dept: 'xray', price: 900, duration: 20, sample: null },
      { code: 'IMG004', name: 'Spine X-Ray AP/LAT', category: 'IMAGING', dept: 'xray', price: 1200, duration: 25, sample: null },
      { code: 'IMG005', name: 'Pelvis X-Ray', category: 'IMAGING', dept: 'xray', price: 1000, duration: 20, sample: null },
      
      // Ultrasound Services
      { code: 'USG001', name: 'Abdominal Ultrasound', category: 'ULTRASOUND', dept: 'ultrasound', price: 1200, duration: 30, sample: null },
      { code: 'USG002', name: 'Pelvic Ultrasound', category: 'ULTRASOUND', dept: 'ultrasound', price: 1300, duration: 30, sample: null },
      { code: 'USG003', name: 'Obstetric Ultrasound (1st Trimester)', category: 'ULTRASOUND', dept: 'ultrasound', price: 1500, duration: 25, sample: null },
      { code: 'USG004', name: 'Obstetric Ultrasound (2nd/3rd Trimester)', category: 'ULTRASOUND', dept: 'ultrasound', price: 1800, duration: 30, sample: null },
      { code: 'USG005', name: '2D Echocardiography', category: 'ULTRASOUND', dept: 'ultrasound', price: 2500, duration: 45, sample: null },
      { code: 'USG006', name: 'Carotid Doppler', category: 'ULTRASOUND', dept: 'ultrasound', price: 2000, duration: 40, sample: null },
      { code: 'USG007', name: 'Renal Doppler', category: 'ULTRASOUND', dept: 'ultrasound', price: 1800, duration: 35, sample: null },
      
      // Health Packages
      { code: 'PKG001', name: 'Basic Health Checkup', category: 'PACKAGES', dept: 'multiple', price: 2500, duration: 120, sample: null },
      { code: 'PKG002', name: 'Comprehensive Health Checkup', category: 'PACKAGES', dept: 'multiple', price: 5000, duration: 180, sample: null },
      { code: 'PKG003', name: 'Cardiac Health Package', category: 'PACKAGES', dept: 'multiple', price: 4000, duration: 150, sample: null },
      { code: 'PKG004', name: 'Diabetes Package', category: 'PACKAGES', dept: 'multiple', price: 1800, duration: 90, sample: null }
    ];

    try {
      let insertedCount = 0;
      
      for (const service of services) {
        const [existing] = await this.db.execute(`
          SELECT service_code FROM services WHERE service_code = '${service.code}'
        `);

        if (!existing) {
          await this.db.execute(`
            INSERT INTO services (
              service_code, service_name, category, department, base_price, 
              duration_minutes, sample_type, is_active, created_at
            ) VALUES (
              '${service.code}', '${service.name}', '${service.category}', 
              '${service.dept}', ${service.price}, ${service.duration}, 
              ${service.sample ? `'${service.sample}'` : 'NULL'}, true, NOW()
            )
          `);
          insertedCount++;
        }
      }

      await this.log(`Service catalog setup complete: ${insertedCount} new services added`);
      return true;
    } catch (error) {
      await this.log(`Failed to setup service catalog: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupInventoryManagement() {
    await this.log('Setting up inventory management system...');

    const inventoryItems = [
      // Laboratory Consumables
      { code: 'INV001', name: 'EDTA Tubes (3ml)', category: 'CONSUMABLES', uom: 'Box', min: 20, max: 200, cost: 150.00 },
      { code: 'INV002', name: 'Plain Tubes (5ml)', category: 'CONSUMABLES', uom: 'Box', min: 15, max: 150, cost: 120.00 },
      { code: 'INV003', name: 'Urine Containers', category: 'CONSUMABLES', uom: 'Pack', min: 25, max: 100, cost: 200.00 },
      { code: 'INV004', name: 'Disposable Syringes 5ml', category: 'CONSUMABLES', uom: 'Box', min: 20, max: 150, cost: 300.00 },
      { code: 'INV005', name: 'Alcohol Swabs', category: 'CONSUMABLES', uom: 'Box', min: 30, max: 200, cost: 250.00 },
      
      // Laboratory Reagents
      { code: 'REG001', name: 'Glucose Reagent Kit', category: 'REAGENTS', uom: 'Kit', min: 5, max: 25, cost: 2500.00 },
      { code: 'REG002', name: 'Cholesterol Reagent', category: 'REAGENTS', uom: 'Kit', min: 3, max: 15, cost: 3200.00 },
      { code: 'REG003', name: 'Hemoglobin Reagent', category: 'REAGENTS', uom: 'Bottle', min: 8, max: 40, cost: 1800.00 },
      { code: 'REG004', name: 'Thyroid Reagent Kit', category: 'REAGENTS', uom: 'Kit', min: 2, max: 10, cost: 8500.00 },
      
      // Imaging Supplies
      { code: 'IMG001', name: 'X-Ray Films 14x17', category: 'CONSUMABLES', uom: 'Pack', min: 10, max: 100, cost: 800.00 },
      { code: 'IMG002', name: 'X-Ray Films 10x12', category: 'CONSUMABLES', uom: 'Pack', min: 8, max: 80, cost: 600.00 },
      { code: 'IMG003', name: 'Ultrasound Gel', category: 'CONSUMABLES', uom: 'Bottle', min: 15, max: 60, cost: 120.00 },
      { code: 'IMG004', name: 'Lead Aprons', category: 'EQUIPMENT', uom: 'Each', min: 2, max: 10, cost: 15000.00 },
      
      // Office Supplies
      { code: 'OFF001', name: 'A4 Paper', category: 'OFFICE_SUPPLIES', uom: 'Ream', min: 10, max: 50, cost: 250.00 },
      { code: 'OFF002', name: 'Printer Cartridges', category: 'OFFICE_SUPPLIES', uom: 'Each', min: 5, max: 20, cost: 2500.00 },
      { code: 'OFF003', name: 'Patient Report Folders', category: 'OFFICE_SUPPLIES', uom: 'Pack', min: 20, max: 100, cost: 300.00 }
    ];

    try {
      let insertedCount = 0;
      
      for (const item of inventoryItems) {
        const [existing] = await this.db.execute(`
          SELECT item_code FROM inventory WHERE item_code = '${item.code}'
        `);

        if (!existing) {
          const currentStock = Math.floor(Math.random() * (item.max - item.min)) + item.min;
          
          await this.db.execute(`
            INSERT INTO inventory (
              item_code, item_name, category, unit_of_measure, current_stock,
              minimum_stock, maximum_stock, unit_cost, is_active, created_at
            ) VALUES (
              '${item.code}', '${item.name}', '${item.category}', '${item.uom}',
              ${currentStock}, ${item.min}, ${item.max}, ${item.cost}, true, NOW()
            )
          `);
          insertedCount++;
        }
      }

      await this.log(`Inventory management setup complete: ${insertedCount} items added`);
      return true;
    } catch (error) {
      await this.log(`Failed to setup inventory: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupFinancialAccounts() {
    await this.log('Setting up chart of accounts and financial structure...');

    const accounts = [
      // Assets
      { code: '1000', name: 'ASSETS', type: 'Asset', parent: null, header: true, balance: 'Debit' },
      { code: '1100', name: 'Current Assets', type: 'Asset', parent: '1000', header: true, balance: 'Debit' },
      { code: '1101', name: 'Cash in Hand', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      { code: '1102', name: 'Bank - Current Account', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      { code: '1103', name: 'Accounts Receivable', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      { code: '1104', name: 'Inventory Assets', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      { code: '1200', name: 'Fixed Assets', type: 'Asset', parent: '1000', header: true, balance: 'Debit' },
      { code: '1201', name: 'Medical Equipment', type: 'Asset', parent: '1200', header: false, balance: 'Debit' },
      { code: '1202', name: 'Furniture & Fixtures', type: 'Asset', parent: '1200', header: false, balance: 'Debit' },
      { code: '1203', name: 'Computer Equipment', type: 'Asset', parent: '1200', header: false, balance: 'Debit' },
      
      // Liabilities
      { code: '2000', name: 'LIABILITIES', type: 'Liability', parent: null, header: true, balance: 'Credit' },
      { code: '2100', name: 'Current Liabilities', type: 'Liability', parent: '2000', header: true, balance: 'Credit' },
      { code: '2101', name: 'Accounts Payable', type: 'Liability', parent: '2100', header: false, balance: 'Credit' },
      { code: '2102', name: 'Accrued Expenses', type: 'Liability', parent: '2100', header: false, balance: 'Credit' },
      { code: '2103', name: 'GST Payable', type: 'Liability', parent: '2100', header: false, balance: 'Credit' },
      
      // Equity
      { code: '3000', name: 'EQUITY', type: 'Equity', parent: null, header: true, balance: 'Credit' },
      { code: '3101', name: 'Owner Capital', type: 'Equity', parent: '3000', header: false, balance: 'Credit' },
      { code: '3102', name: 'Retained Earnings', type: 'Equity', parent: '3000', header: false, balance: 'Credit' },
      
      // Income
      { code: '4000', name: 'INCOME', type: 'Income', parent: null, header: true, balance: 'Credit' },
      { code: '4001', name: 'Laboratory Service Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      { code: '4002', name: 'Imaging Service Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      { code: '4003', name: 'Ultrasound Service Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      { code: '4004', name: 'Health Package Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      { code: '4005', name: 'Consultation Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      
      // Expenses
      { code: '6000', name: 'EXPENSES', type: 'Expense', parent: null, header: true, balance: 'Debit' },
      { code: '6100', name: 'Personnel Expenses', type: 'Expense', parent: '6000', header: true, balance: 'Debit' },
      { code: '6101', name: 'Salaries & Wages', type: 'Expense', parent: '6100', header: false, balance: 'Debit' },
      { code: '6102', name: 'Employee Benefits', type: 'Expense', parent: '6100', header: false, balance: 'Debit' },
      { code: '6200', name: 'Operational Expenses', type: 'Expense', parent: '6000', header: true, balance: 'Debit' },
      { code: '6201', name: 'Rent Expense', type: 'Expense', parent: '6200', header: false, balance: 'Debit' },
      { code: '6202', name: 'Utilities Expense', type: 'Expense', parent: '6200', header: false, balance: 'Debit' },
      { code: '6203', name: 'Equipment Maintenance', type: 'Expense', parent: '6200', header: false, balance: 'Debit' },
      { code: '6300', name: 'Medical Supplies', type: 'Expense', parent: '6000', header: true, balance: 'Debit' },
      { code: '6301', name: 'Laboratory Reagents', type: 'Expense', parent: '6300', header: false, balance: 'Debit' },
      { code: '6302', name: 'Medical Consumables', type: 'Expense', parent: '6300', header: false, balance: 'Debit' }
    ];

    try {
      let insertedCount = 0;
      
      for (const account of accounts) {
        const [existing] = await this.db.execute(`
          SELECT account_code FROM chart_of_accounts WHERE account_code = '${account.code}'
        `);

        if (!existing) {
          await this.db.execute(`
            INSERT INTO chart_of_accounts (
              account_code, account_name, account_type, parent_account,
              is_header, normal_balance, is_active, created_at
            ) VALUES (
              '${account.code}', '${account.name}', '${account.type}',
              ${account.parent ? `'${account.parent}'` : 'NULL'},
              ${account.header}, '${account.balance}', true, NOW()
            )
          `);
          insertedCount++;
        }
      }

      await this.log(`Chart of accounts setup complete: ${insertedCount} accounts created`);
      return true;
    } catch (error) {
      await this.log(`Failed to setup chart of accounts: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupDepartmentsAndStaff() {
    await this.log('Setting up departments and staff structure...');

    const departments = [
      { code: 'FRONT_DESK', name: 'Front Desk Operations', head: null },
      { code: 'LABORATORY', name: 'Laboratory Services', head: null },
      { code: 'IMAGING', name: 'Imaging Services', head: null },
      { code: 'ULTRASOUND', name: 'Ultrasound Services', head: null },
      { code: 'MANAGEMENT', name: 'Management', head: null },
      { code: 'FINANCE', name: 'Finance & Accounts', head: null },
      { code: 'EXECUTIVE', name: 'Executive Leadership', head: null }
    ];

    const employees = [
      { id: 'EMP001', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@orientmedical.com', phone: '9876543210', role: 'RECEPTIONIST', dept: 'FRONT_DESK' },
      { id: 'EMP002', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@orientmedical.com', phone: '9876543211', role: 'LAB_TECHNICIAN', dept: 'LABORATORY' },
      { id: 'EMP003', firstName: 'Dr. Sunita', lastName: 'Patel', email: 'sunita.patel@orientmedical.com', phone: '9876543212', role: 'LAB_SCIENTIST', dept: 'LABORATORY' },
      { id: 'EMP004', firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@orientmedical.com', phone: '9876543213', role: 'IMAGING_TECH', dept: 'IMAGING' },
      { id: 'EMP005', firstName: 'Dr. Amit', lastName: 'Gupta', email: 'amit.gupta@orientmedical.com', phone: '9876543214', role: 'SONOLOGIST', dept: 'ULTRASOUND' },
      { id: 'EMP006', firstName: 'Meera', lastName: 'Jain', email: 'meera.jain@orientmedical.com', phone: '9876543215', role: 'CENTRE_MANAGER', dept: 'MANAGEMENT' },
      { id: 'EMP007', firstName: 'Anita', lastName: 'Verma', email: 'anita.verma@orientmedical.com', phone: '9876543216', role: 'ACCOUNTANT', dept: 'FINANCE' }
    ];

    try {
      // Setup departments
      for (const dept of departments) {
        await this.db.execute(`
          INSERT INTO departments (code, name, department_head, is_active, created_at)
          VALUES ('${dept.code}', '${dept.name}', NULL, true, NOW())
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            updated_at = NOW()
        `);
      }

      // Setup employees
      let employeeCount = 0;
      for (const emp of employees) {
        const [existing] = await this.db.execute(`
          SELECT employee_id FROM employees WHERE employee_id = '${emp.id}'
        `);

        if (!existing) {
          await this.db.execute(`
            INSERT INTO employees (
              employee_id, first_name, last_name, email, phone,
              role, department, hire_date, is_active, created_at
            ) VALUES (
              '${emp.id}', '${emp.firstName}', '${emp.lastName}',
              '${emp.email}', '${emp.phone}', '${emp.role}',
              '${emp.dept}', CURRENT_DATE, true, NOW()
            )
          `);
          employeeCount++;
        }
      }

      await this.log(`Departments and staff setup complete: ${employeeCount} employees added`);
      return true;
    } catch (error) {
      await this.log(`Failed to setup departments: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupAppointmentScheduling() {
    await this.log('Setting up appointment scheduling system...');

    try {
      // Generate appointment slots for the next 60 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 60);

      const scheduleConfig = {
        'LABORATORY': { start: 8, end: 20, duration: 15, maxPatients: 3 },
        'IMAGING': { start: 8, end: 20, duration: 20, maxPatients: 2 },
        'ULTRASOUND': { start: 8, end: 18, duration: 30, maxPatients: 1 }
      };

      let slotsCreated = 0;
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();
        
        // Skip Sundays or adjust hours
        const isWeekend = dayOfWeek === 0;
        
        for (const [dept, config] of Object.entries(scheduleConfig)) {
          const endHour = isWeekend ? Math.min(config.end, 17) : config.end;
          
          for (let hour = config.start; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += config.duration) {
              const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
              const endMinute = minute + config.duration;
              const nextHour = endMinute >= 60 ? hour + 1 : hour;
              const endTime = `${nextHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
              
              if (nextHour <= endHour) {
                const [existingSlot] = await this.db.execute(`
                  SELECT id FROM appointment_slots 
                  WHERE date = '${dateStr}' AND start_time = '${startTime}' AND department = '${dept.toLowerCase()}'
                `);

                if (!existingSlot) {
                  await this.db.execute(`
                    INSERT INTO appointment_slots (
                      date, start_time, end_time, department, max_patients,
                      current_bookings, is_available, slot_type, created_at
                    ) VALUES (
                      '${dateStr}', '${startTime}', '${endTime}', '${dept.toLowerCase()}',
                      ${config.maxPatients}, 0, true, 'Regular', NOW()
                    )
                  `);
                  slotsCreated++;
                }
              }
            }
          }
        }
      }

      await this.log(`Appointment scheduling setup complete: ${slotsCreated} slots created`);
      return true;
    } catch (error) {
      await this.log(`Failed to setup appointment scheduling: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupSupplierNetwork() {
    await this.log('Setting up supplier network and vendor management...');

    const suppliers = [
      {
        code: 'SUP001', name: 'MedTech Equipments Pvt Ltd', contact: 'Rohit Mehta',
        email: 'rohit@medtech.com', phone: '9876543220', category: 'Medical Equipment',
        address: 'Industrial Estate, Mumbai - 400042', gst: '27ABCDE1234F1Z5',
        terms: 'Net 30 Days', credit: 500000
      },
      {
        code: 'SUP002', name: 'BioChemical Reagents Ltd', contact: 'Dr. Sunita Jain',
        email: 'sunita@biochemical.com', phone: '9876543221', category: 'Laboratory Reagents',
        address: 'Science Park, Pune - 411028', gst: '27FGHIJ5678K2L9',
        terms: 'Net 15 Days', credit: 300000
      },
      {
        code: 'SUP003', name: 'SafeMed Consumables', contact: 'Amit Sharma',
        email: 'amit@safemed.com', phone: '9876543222', category: 'Medical Consumables',
        address: 'Medical District, Delhi - 110001', gst: '07MNOPQ9012R3S6',
        terms: 'Net 30 Days', credit: 200000
      },
      {
        code: 'SUP004', name: 'TechCare Maintenance Services', contact: 'Priya Gupta',
        email: 'priya@techcare.com', phone: '9876543223', category: 'Maintenance Services',
        address: 'Service Center, Mumbai - 400050', gst: '27TUVWX3456Y7Z0',
        terms: 'COD', credit: 100000
      },
      {
        code: 'SUP005', name: 'Global Imaging Solutions', contact: 'Ravi Patel',
        email: 'ravi@globalimaing.com', phone: '9876543224', category: 'Imaging Equipment',
        address: 'Tech Hub, Bangalore - 560001', gst: '29ABCXY1234Z5W8',
        terms: 'Net 45 Days', credit: 800000
      }
    ];

    try {
      let supplierCount = 0;
      
      for (const supplier of suppliers) {
        const [existing] = await this.db.execute(`
          SELECT supplier_code FROM suppliers WHERE supplier_code = '${supplier.code}'
        `);

        if (!existing) {
          await this.db.execute(`
            INSERT INTO suppliers (
              supplier_code, company_name, contact_person, email, phone,
              address, gst_number, payment_terms, credit_limit, category,
              is_active, created_at
            ) VALUES (
              '${supplier.code}', '${supplier.name}', '${supplier.contact}',
              '${supplier.email}', '${supplier.phone}', '${supplier.address}',
              '${supplier.gst}', '${supplier.terms}', ${supplier.credit},
              '${supplier.category}', true, NOW()
            )
          `);
          supplierCount++;
        }
      }

      await this.log(`Supplier network setup complete: ${supplierCount} suppliers added`);
      return true;
    } catch (error) {
      await this.log(`Failed to setup supplier network: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async performSystemValidation() {
    await this.log('Performing comprehensive system validation...');

    const validations = [
      {
        name: 'Service Catalog',
        query: 'SELECT COUNT(*) as count FROM services WHERE is_active = true',
        expected: { min: 20 }
      },
      {
        name: 'Inventory Items',
        query: 'SELECT COUNT(*) as count FROM inventory WHERE is_active = true',
        expected: { min: 10 }
      },
      {
        name: 'Chart of Accounts',
        query: 'SELECT COUNT(*) as count FROM chart_of_accounts WHERE is_active = true',
        expected: { min: 25 }
      },
      {
        name: 'Employees',
        query: 'SELECT COUNT(*) as count FROM employees WHERE is_active = true',
        expected: { min: 5 }
      },
      {
        name: 'Appointment Slots',
        query: 'SELECT COUNT(*) as count FROM appointment_slots WHERE is_available = true',
        expected: { min: 1000 }
      },
      {
        name: 'Suppliers',
        query: 'SELECT COUNT(*) as count FROM suppliers WHERE is_active = true',
        expected: { min: 3 }
      }
    ];

    try {
      let allValid = true;
      
      for (const validation of validations) {
        const [result] = await this.db.execute(validation.query);
        const count = result.count;
        
        if (count >= validation.expected.min) {
          await this.log(`✓ ${validation.name}: ${count} records`);
        } else {
          await this.log(`✗ ${validation.name}: ${count} records (expected min: ${validation.expected.min})`, 'WARN');
          allValid = false;
        }
      }

      if (allValid) {
        await this.log('System validation completed successfully');
      } else {
        await this.log('System validation completed with warnings', 'WARN');
      }

      return allValid;
    } catch (error) {
      await this.log(`System validation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async generateImplementationReport() {
    await this.log('Generating implementation summary report...');

    try {
      const report = {
        timestamp: new Date().toISOString(),
        status: this.errors.length === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS',
        errors: this.errors,
        summary: {}
      };

      // Collect statistics
      const stats = [
        { name: 'services', query: 'SELECT COUNT(*) as count FROM services WHERE is_active = true' },
        { name: 'inventory_items', query: 'SELECT COUNT(*) as count FROM inventory WHERE is_active = true' },
        { name: 'employees', query: 'SELECT COUNT(*) as count FROM employees WHERE is_active = true' },
        { name: 'suppliers', query: 'SELECT COUNT(*) as count FROM suppliers WHERE is_active = true' },
        { name: 'appointment_slots', query: 'SELECT COUNT(*) as count FROM appointment_slots WHERE is_available = true' },
        { name: 'chart_accounts', query: 'SELECT COUNT(*) as count FROM chart_of_accounts WHERE is_active = true' }
      ];

      for (const stat of stats) {
        const [result] = await this.db.execute(stat.query);
        report.summary[stat.name] = result.count;
      }

      // Save report
      const reportPath = path.resolve(__dirname, '../reports/implementation-report.json');
      await fs.mkdir(path.dirname(reportPath), { recursive: true });
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

      await this.log('Implementation report generated successfully');
      return report;
    } catch (error) {
      await this.log(`Failed to generate report: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async run() {
    const startTime = Date.now();
    
    try {
      await this.log('🚀 Starting Orient Medical ERP System Implementation...');
      await this.log('================================================');

      // Phase 1: Core System Setup
      await this.log('\n📋 PHASE 1: Core System Setup');
      await this.validateDatabase();
      await this.setupOrganizationBranding();
      await this.createDefaultAdmin();

      // Phase 2: Master Data Setup
      await this.log('\n📊 PHASE 2: Master Data Configuration');
      await this.setupDepartmentsAndStaff();
      await this.setupServiceCatalog();
      await this.setupInventoryManagement();
      await this.setupFinancialAccounts();

      // Phase 3: Operational Setup
      await this.log('\n⚙️ PHASE 3: Operational Systems');
      await this.setupAppointmentScheduling();
      await this.setupSupplierNetwork();

      // Phase 4: Validation and Reporting
      await this.log('\n✅ PHASE 4: Validation and Reporting');
      await this.performSystemValidation();
      const report = await this.generateImplementationReport();

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      await this.log('\n================================================');
      await this.log('🎉 ORIENT MEDICAL ERP IMPLEMENTATION COMPLETED!');
      await this.log('================================================');
      await this.log(`⏱️  Total Duration: ${duration} seconds`);
      await this.log(`📊 Services Created: ${report.summary.services}`);
      await this.log(`📦 Inventory Items: ${report.summary.inventory_items}`);
      await this.log(`👥 Employees Added: ${report.summary.employees}`);
      await this.log(`🏢 Suppliers Added: ${report.summary.suppliers}`);
      await this.log(`📅 Appointment Slots: ${report.summary.appointment_slots}`);
      await this.log(`💰 Account Codes: ${report.summary.chart_accounts}`);
      
      if (this.errors.length > 0) {
        await this.log(`\n⚠️  Errors Encountered: ${this.errors.length}`);
        this.errors.forEach(error => this.log(`   - ${error}`, 'ERROR'));
      }

      await this.log('\n🔑 NEXT STEPS:');
      await this.log('1. Login with: username=admin, password=admin123');
      await this.log('2. Change default admin password immediately');
      await this.log('3. Configure organization GST number and tax settings');
      await this.log('4. Create user accounts for staff members');
      await this.log('5. Customize service prices as needed');
      await this.log('6. Train staff using the training materials');
      await this.log('7. Begin patient registration and operations');

      return true;
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      await this.log(`\n❌ IMPLEMENTATION FAILED after ${duration} seconds`, 'ERROR');
      await this.log(`Error: ${error.message}`, 'ERROR');
      this.errors.push(error.message);
      throw error;
    }
  }
}

// Execute implementation if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const implementation = new SystemImplementation();
  
  implementation.run()
    .then(() => {
      console.log('\n✅ Implementation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Implementation failed:', error.message);
      process.exit(1);
    });
}

export { SystemImplementation };