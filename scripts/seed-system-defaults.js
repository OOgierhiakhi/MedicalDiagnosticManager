#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

class SystemSeeder {
  constructor() {
    this.db = drizzle({ 
      client: new Pool({ connectionString: process.env.DATABASE_URL })
    });
  }

  async seedServiceUnits() {
    console.log('Seeding service units and categories...');
    
    // Service categories
    const categories = [
      { code: 'LABORATORY', name: 'Laboratory Tests', description: 'Diagnostic laboratory services' },
      { code: 'IMAGING', name: 'Imaging Services', description: 'Radiology and imaging procedures' },
      { code: 'ULTRASOUND', name: 'Ultrasound Services', description: 'Ultrasound examinations' },
      { code: 'CONSULTATION', name: 'Consultation Services', description: 'Medical consultations' },
      { code: 'PACKAGES', name: 'Health Packages', description: 'Comprehensive health checkups' }
    ];

    for (const category of categories) {
      await this.db.execute(`
        INSERT INTO service_categories (code, name, description, is_active)
        VALUES ('${category.code}', '${category.name}', '${category.description}', true)
        ON CONFLICT (code) DO NOTHING
      `);
    }

    // Default services
    const services = [
      {
        code: 'CBC001', name: 'Complete Blood Count', category: 'LABORATORY',
        department: 'hematology', price: 400.00, duration: 30, sample_type: 'EDTA Blood'
      },
      {
        code: 'GLUC001', name: 'Fasting Blood Glucose', category: 'LABORATORY', 
        department: 'clinical_chemistry', price: 150.00, duration: 15, sample_type: 'Serum'
      },
      {
        code: 'LIPID001', name: 'Lipid Profile', category: 'LABORATORY',
        department: 'clinical_chemistry', price: 800.00, duration: 30, sample_type: 'Serum'
      },
      {
        code: 'XRAY001', name: 'Chest X-Ray PA View', category: 'IMAGING',
        department: 'xray', price: 800.00, duration: 15, sample_type: null
      },
      {
        code: 'XRAY002', name: 'Abdomen X-Ray', category: 'IMAGING',
        department: 'xray', price: 900.00, duration: 20, sample_type: null
      },
      {
        code: 'USG001', name: 'Abdominal Ultrasound', category: 'ULTRASOUND',
        department: 'ultrasound', price: 1200.00, duration: 30, sample_type: null
      },
      {
        code: 'USG002', name: 'Obstetric Ultrasound', category: 'ULTRASOUND',
        department: 'ultrasound', price: 1500.00, duration: 25, sample_type: null
      },
      {
        code: 'ECHO001', name: '2D Echocardiography', category: 'ULTRASOUND',
        department: 'ultrasound', price: 2500.00, duration: 45, sample_type: null
      }
    ];

    for (const service of services) {
      await this.db.execute(`
        INSERT INTO services (service_code, service_name, category, department, base_price, duration_minutes, sample_type, is_active)
        VALUES ('${service.code}', '${service.name}', '${service.category}', '${service.department}', 
                ${service.price}, ${service.duration}, ${service.sample_type ? `'${service.sample_type}'` : 'NULL'}, true)
        ON CONFLICT (service_code) DO NOTHING
      `);
    }

    console.log('✓ Service units seeded successfully');
  }

  async seedEmployeesAndRoles() {
    console.log('Seeding employee roles and departments...');

    // Departments
    const departments = [
      { code: 'FRONT_DESK', name: 'Front Desk', description: 'Patient registration and billing' },
      { code: 'LABORATORY', name: 'Laboratory', description: 'Diagnostic testing services' },
      { code: 'IMAGING', name: 'Imaging', description: 'Radiology and X-ray services' },
      { code: 'ULTRASOUND', name: 'Ultrasound', description: 'Ultrasound examination services' },
      { code: 'MANAGEMENT', name: 'Management', description: 'Administrative management' },
      { code: 'FINANCE', name: 'Finance', description: 'Financial operations' },
      { code: 'EXECUTIVE', name: 'Executive', description: 'Executive leadership' }
    ];

    for (const dept of departments) {
      await this.db.execute(`
        INSERT INTO departments (code, name, description, is_active)
        VALUES ('${dept.code}', '${dept.name}', '${dept.description}', true)
        ON CONFLICT (code) DO NOTHING
      `);
    }

    // Employee roles
    const roles = [
      { code: 'RECEPTIONIST', name: 'Receptionist', department: 'FRONT_DESK' },
      { code: 'LAB_TECHNICIAN', name: 'Laboratory Technician', department: 'LABORATORY' },
      { code: 'LAB_SCIENTIST', name: 'Laboratory Scientist', department: 'LABORATORY' },
      { code: 'IMAGING_TECH', name: 'Imaging Technician', department: 'IMAGING' },
      { code: 'SONOLOGIST', name: 'Sonologist', department: 'ULTRASOUND' },
      { code: 'CENTRE_MANAGER', name: 'Centre Manager', department: 'MANAGEMENT' },
      { code: 'ACCOUNTANT', name: 'Accountant', department: 'FINANCE' },
      { code: 'DIRECTOR', name: 'Director', department: 'EXECUTIVE' },
      { code: 'CEO', name: 'Chief Executive Officer', department: 'EXECUTIVE' }
    ];

    for (const role of roles) {
      await this.db.execute(`
        INSERT INTO employee_roles (code, name, department, is_active)
        VALUES ('${role.code}', '${role.name}', '${role.department}', true)
        ON CONFLICT (code) DO NOTHING
      `);
    }

    // Sample employees
    const employees = [
      {
        id: 'EMP001', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@orientmedical.com',
        phone: '9876543210', role: 'RECEPTIONIST', department: 'FRONT_DESK'
      },
      {
        id: 'EMP002', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@orientmedical.com', 
        phone: '9876543211', role: 'LAB_TECHNICIAN', department: 'LABORATORY'
      },
      {
        id: 'EMP003', firstName: 'Sunita', lastName: 'Patel', email: 'sunita.patel@orientmedical.com',
        phone: '9876543212', role: 'IMAGING_TECH', department: 'IMAGING'
      },
      {
        id: 'EMP004', firstName: 'Dr. Amit', lastName: 'Gupta', email: 'amit.gupta@orientmedical.com',
        phone: '9876543213', role: 'SONOLOGIST', department: 'ULTRASOUND'
      },
      {
        id: 'EMP005', firstName: 'Meera', lastName: 'Singh', email: 'meera.singh@orientmedical.com',
        phone: '9876543214', role: 'CENTRE_MANAGER', department: 'MANAGEMENT'
      }
    ];

    for (const emp of employees) {
      await this.db.execute(`
        INSERT INTO employees (employee_id, first_name, last_name, email, phone, role, department, hire_date, is_active)
        VALUES ('${emp.id}', '${emp.firstName}', '${emp.lastName}', '${emp.email}', 
                '${emp.phone}', '${emp.role}', '${emp.department}', CURRENT_DATE, true)
        ON CONFLICT (employee_id) DO NOTHING
      `);
    }

    console.log('✓ Employees and roles seeded successfully');
  }

  async seedInventorySystem() {
    console.log('Seeding inventory categories and items...');

    // Inventory categories
    const categories = [
      { code: 'REAGENTS', name: 'Laboratory Reagents', description: 'Chemical reagents for testing' },
      { code: 'CONSUMABLES', name: 'Medical Consumables', description: 'Single-use medical supplies' },
      { code: 'EQUIPMENT', name: 'Medical Equipment', description: 'Durable medical equipment' },
      { code: 'OFFICE_SUPPLIES', name: 'Office Supplies', description: 'Administrative supplies' }
    ];

    for (const category of categories) {
      await this.db.execute(`
        INSERT INTO inventory_categories (code, name, description, is_active)
        VALUES ('${category.code}', '${category.name}', '${category.description}', true)
        ON CONFLICT (code) DO NOTHING
      `);
    }

    // Sample inventory items
    const items = [
      {
        code: 'INV001', name: 'EDTA Tubes', category: 'CONSUMABLES', uom: 'Box',
        current: 50, minimum: 20, maximum: 200, cost: 150.00
      },
      {
        code: 'INV002', name: 'Glucose Reagent Kit', category: 'REAGENTS', uom: 'Kit',
        current: 10, minimum: 5, maximum: 25, cost: 2500.00
      },
      {
        code: 'INV003', name: 'X-Ray Films 14x17', category: 'CONSUMABLES', uom: 'Pack',
        current: 25, minimum: 10, maximum: 100, cost: 800.00
      },
      {
        code: 'INV004', name: 'Ultrasound Gel', category: 'CONSUMABLES', uom: 'Bottle',
        current: 30, minimum: 15, maximum: 60, cost: 120.00
      },
      {
        code: 'INV005', name: 'Disposable Syringes 5ml', category: 'CONSUMABLES', uom: 'Box',
        current: 40, minimum: 20, maximum: 150, cost: 300.00
      }
    ];

    for (const item of items) {
      await this.db.execute(`
        INSERT INTO inventory_items (item_code, item_name, category, unit_of_measure, 
                                   current_stock, minimum_stock, maximum_stock, unit_cost, is_active)
        VALUES ('${item.code}', '${item.name}', '${item.category}', '${item.uom}',
                ${item.current}, ${item.minimum}, ${item.maximum}, ${item.cost}, true)
        ON CONFLICT (item_code) DO NOTHING
      `);
    }

    console.log('✓ Inventory system seeded successfully');
  }

  async seedFinancialStructure() {
    console.log('Seeding chart of accounts and financial structure...');

    // Chart of accounts
    const accounts = [
      { code: '1000', name: 'ASSETS', type: 'Asset', parent: null, header: true, balance: 'Debit' },
      { code: '1100', name: 'Current Assets', type: 'Asset', parent: '1000', header: true, balance: 'Debit' },
      { code: '1101', name: 'Cash in Hand', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      { code: '1102', name: 'Bank Account', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      { code: '1103', name: 'Accounts Receivable', type: 'Asset', parent: '1100', header: false, balance: 'Debit' },
      
      { code: '2000', name: 'LIABILITIES', type: 'Liability', parent: null, header: true, balance: 'Credit' },
      { code: '2100', name: 'Current Liabilities', type: 'Liability', parent: '2000', header: true, balance: 'Credit' },
      { code: '2101', name: 'Accounts Payable', type: 'Liability', parent: '2100', header: false, balance: 'Credit' },
      
      { code: '3000', name: 'EQUITY', type: 'Equity', parent: null, header: true, balance: 'Credit' },
      { code: '3101', name: 'Owner Equity', type: 'Equity', parent: '3000', header: false, balance: 'Credit' },
      
      { code: '4000', name: 'INCOME', type: 'Income', parent: null, header: true, balance: 'Credit' },
      { code: '4001', name: 'Laboratory Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      { code: '4002', name: 'Imaging Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      { code: '4003', name: 'Ultrasound Revenue', type: 'Income', parent: '4000', header: false, balance: 'Credit' },
      
      { code: '6000', name: 'EXPENSES', type: 'Expense', parent: null, header: true, balance: 'Debit' },
      { code: '6001', name: 'Salary Expenses', type: 'Expense', parent: '6000', header: false, balance: 'Debit' },
      { code: '6002', name: 'Rent Expense', type: 'Expense', parent: '6000', header: false, balance: 'Debit' },
      { code: '6003', name: 'Utilities Expense', type: 'Expense', parent: '6000', header: false, balance: 'Debit' }
    ];

    for (const account of accounts) {
      await this.db.execute(`
        INSERT INTO chart_of_accounts (account_code, account_name, account_type, parent_account, 
                                     is_header, normal_balance, is_active)
        VALUES ('${account.code}', '${account.name}', '${account.type}', 
                ${account.parent ? `'${account.parent}'` : 'NULL'}, 
                ${account.header}, '${account.balance}', true)
        ON CONFLICT (account_code) DO NOTHING
      `);
    }

    // Expense types
    const expenseTypes = [
      { code: 'EXP001', name: 'Salary - Laboratory Staff', group: 'PERSONNEL', account: '6001' },
      { code: 'EXP002', name: 'Equipment Maintenance', group: 'OPERATIONAL', account: '6003' },
      { code: 'EXP003', name: 'Laboratory Reagents', group: 'MEDICAL_SUPPLIES', account: '6003' },
      { code: 'EXP004', name: 'Electricity Bill', group: 'OPERATIONAL', account: '6003' },
      { code: 'EXP005', name: 'Marketing Materials', group: 'MARKETING', account: '6003' }
    ];

    for (const expense of expenseTypes) {
      await this.db.execute(`
        INSERT INTO expense_types (expense_code, expense_name, expense_group, account_code, 
                                 is_recurring, requires_approval, is_active)
        VALUES ('${expense.code}', '${expense.name}', '${expense.group}', '${expense.account}',
                false, true, true)
        ON CONFLICT (expense_code) DO NOTHING
      `);
    }

    console.log('✓ Financial structure seeded successfully');
  }

  async seedAppointmentSystem() {
    console.log('Seeding appointment slots and schedules...');

    // Generate appointment slots for next 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30);

    const departments = ['laboratory', 'imaging', 'ultrasound'];
    const timeSlots = {
      laboratory: { start: 8, end: 20, duration: 15, maxPatients: 3 },
      imaging: { start: 8, end: 20, duration: 20, maxPatients: 2 },
      ultrasound: { start: 8, end: 18, duration: 30, maxPatients: 1 }
    };

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      for (const dept of departments) {
        const config = timeSlots[dept];
        
        for (let hour = config.start; hour < config.end; hour++) {
          for (let minute = 0; minute < 60; minute += config.duration) {
            const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const endMinute = minute + config.duration;
            const endHour = endMinute >= 60 ? hour + 1 : hour;
            const endTime = `${endHour.toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`;
            
            if (endHour < config.end || (endHour === config.end && endMinute % 60 === 0)) {
              await this.db.execute(`
                INSERT INTO appointment_slots (date, start_time, end_time, department, 
                                             max_patients, current_bookings, is_available, slot_type)
                VALUES ('${dateStr}', '${startTime}', '${endTime}', '${dept}',
                        ${config.maxPatients}, 0, true, 'Regular')
                ON CONFLICT (date, start_time, department) DO NOTHING
              `);
            }
          }
        }
      }
    }

    console.log('✓ Appointment system seeded successfully');
  }

  async seedSuppliersAndPO() {
    console.log('Seeding suppliers and purchase order templates...');

    // Default suppliers
    const suppliers = [
      {
        code: 'SUP001', name: 'MedTech Equipments Pvt Ltd', contact: 'Rohit Mehta',
        email: 'rohit@medtech.com', phone: '9876543220', terms: 'Net 30 Days'
      },
      {
        code: 'SUP002', name: 'BioChemical Reagents', contact: 'Sunita Jain',
        email: 'sunita@biochemical.com', phone: '9876543221', terms: 'Net 15 Days'
      },
      {
        code: 'SUP003', name: 'SafeMed Consumables', contact: 'Amit Sharma',
        email: 'amit@safemed.com', phone: '9876543222', terms: 'Net 30 Days'
      },
      {
        code: 'SUP004', name: 'TechCare Maintenance', contact: 'Priya Gupta',
        email: 'priya@techcare.com', phone: '9876543223', terms: 'COD'
      }
    ];

    for (const supplier of suppliers) {
      await this.db.execute(`
        INSERT INTO suppliers (supplier_code, company_name, contact_person, email, phone, 
                             payment_terms, is_active, address)
        VALUES ('${supplier.code}', '${supplier.name}', '${supplier.contact}', 
                '${supplier.email}', '${supplier.phone}', '${supplier.terms}', true,
                'Business Address - ${supplier.name}')
        ON CONFLICT (supplier_code) DO NOTHING
      `);
    }

    console.log('✓ Suppliers seeded successfully');
  }

  async seedImagingModalities() {
    console.log('Seeding imaging modalities and assignments...');

    // Imaging modalities
    const modalities = [
      {
        code: 'MOD001', name: 'Digital X-Ray', department: 'imaging',
        capacity: 60, time: 15, contrast: false, prep: false
      },
      {
        code: 'MOD002', name: 'Fluoroscopy', department: 'imaging', 
        capacity: 20, time: 30, contrast: true, prep: true
      },
      {
        code: 'MOD003', name: 'Mammography', department: 'imaging',
        capacity: 25, time: 20, contrast: false, prep: true
      },
      {
        code: 'MOD004', name: 'Abdominal Ultrasound', department: 'ultrasound',
        capacity: 30, time: 30, contrast: false, prep: true
      },
      {
        code: 'MOD005', name: 'Obstetric Ultrasound', department: 'ultrasound',
        capacity: 35, time: 25, contrast: false, prep: false
      },
      {
        code: 'MOD006', name: 'Echocardiography', department: 'ultrasound',
        capacity: 20, time: 45, contrast: false, prep: false
      }
    ];

    for (const modality of modalities) {
      await this.db.execute(`
        INSERT INTO imaging_modalities (modality_code, modality_name, department, 
                                      max_daily_capacity, avg_procedure_time, 
                                      requires_contrast, preparation_required, is_active)
        VALUES ('${modality.code}', '${modality.name}', '${modality.department}',
                ${modality.capacity}, ${modality.time}, ${modality.contrast}, 
                ${modality.prep}, true)
        ON CONFLICT (modality_code) DO NOTHING
      `);
    }

    console.log('✓ Imaging modalities seeded successfully');
  }

  async seedUserPermissions() {
    console.log('Seeding user roles and permissions...');

    // System roles with permissions
    const roles = [
      {
        code: 'RECEPTIONIST',
        name: 'Receptionist',
        permissions: {
          patients: { create: true, read: true, update: true, delete: false },
          appointments: { create: true, read: true, update: true, delete: true },
          billing: { create: true, read: true, update: true, delete: false },
          payments: { create: true, read: true, update: false, delete: false }
        }
      },
      {
        code: 'LAB_TECHNICIAN', 
        name: 'Laboratory Technician',
        permissions: {
          test_orders: { create: false, read: true, update: true, delete: false },
          test_results: { create: true, read: true, update: true, delete: false },
          quality_control: { create: true, read: true, update: true, delete: false },
          inventory: { create: false, read: true, update: true, delete: false }
        }
      },
      {
        code: 'CENTRE_MANAGER',
        name: 'Centre Manager', 
        permissions: {
          all_modules: { create: true, read: true, update: true, delete: true },
          staff_management: { create: true, read: true, update: true, delete: false },
          reports: { create: true, read: true, update: true, delete: false },
          system_config: { create: true, read: true, update: true, delete: false }
        }
      }
    ];

    for (const role of roles) {
      await this.db.execute(`
        INSERT INTO system_roles (role_code, role_name, permissions, is_active)
        VALUES ('${role.code}', '${role.name}', '${JSON.stringify(role.permissions)}', true)
        ON CONFLICT (role_code) DO NOTHING
      `);
    }

    console.log('✓ User permissions seeded successfully');
  }

  async seedSystemDefaults() {
    console.log('Seeding system configuration defaults...');

    // System configuration
    const configs = [
      { key: 'ORGANIZATION_NAME', value: 'Orient Medical Diagnostic Centre', category: 'GENERAL' },
      { key: 'GST_NUMBER', value: 'GST_NUMBER_TO_BE_CONFIGURED', category: 'TAX' },
      { key: 'GST_RATE', value: '18.0', category: 'TAX' },
      { key: 'INVOICE_PREFIX', value: 'INV', category: 'BILLING' },
      { key: 'INVOICE_STARTING_NUMBER', value: '1001', category: 'BILLING' },
      { key: 'PO_PREFIX', value: 'PO', category: 'PURCHASING' },
      { key: 'PO_STARTING_NUMBER', value: '2001', category: 'PURCHASING' },
      { key: 'PATIENT_ID_PREFIX', value: 'PAT', category: 'PATIENTS' },
      { key: 'EMPLOYEE_ID_PREFIX', value: 'EMP', category: 'HR' },
      { key: 'WORKING_HOURS_START', value: '08:00', category: 'SCHEDULE' },
      { key: 'WORKING_HOURS_END', value: '20:00', category: 'SCHEDULE' }
    ];

    for (const config of configs) {
      await this.db.execute(`
        INSERT INTO system_configuration (config_key, config_value, category, is_active)
        VALUES ('${config.key}', '${config.value}', '${config.category}', true)
        ON CONFLICT (config_key) DO NOTHING
      `);
    }

    console.log('✓ System defaults seeded successfully');
  }

  async run() {
    try {
      console.log('🚀 Starting Orient Medical ERP system seeding...');
      
      await this.seedSystemDefaults();
      await this.seedFinancialStructure();
      await this.seedEmployeesAndRoles();
      await this.seedServiceUnits();
      await this.seedInventorySystem();
      await this.seedSuppliersAndPO();
      await this.seedImagingModalities();
      await this.seedAppointmentSystem();
      await this.seedUserPermissions();

      console.log('');
      console.log('✅ Orient Medical ERP system seeding completed successfully!');
      console.log('');
      console.log('🎯 Next Steps:');
      console.log('1. Configure organization-specific settings');
      console.log('2. Set up user accounts for staff members');
      console.log('3. Customize service prices and descriptions');
      console.log('4. Configure supplier contacts and contracts');
      console.log('5. Train staff on system usage');
      console.log('');
      
    } catch (error) {
      console.error('❌ Seeding failed:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  }
}

// Run seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new SystemSeeder();
  await seeder.run();
}

export { SystemSeeder };