# Orient Medical Diagnostic Centre ERP - Implementation Checklist & Default Settings

## Table of Contents
1. [Service Units (Tests & Procedures)](#1-service-units-tests--procedures)
2. [Employees & Roles](#2-employees--roles)
3. [Inventory Items & Categories](#3-inventory-items--categories)
4. [Expense Types & Groups](#4-expense-types--groups)
5. [Income Types & Groups](#5-income-types--groups)
6. [Patient Master Records](#6-patient-master-records)
7. [Appointment Slots & Schedules](#7-appointment-slots--schedules)
8. [Billing & Chart of Accounts](#8-billing--chart-of-accounts)
9. [Suppliers & Purchase Order Templates](#9-suppliers--purchase-order-templates)
10. [Imaging Modalities & Sonologist Assignments](#10-imaging-modalities--sonologist-assignments)
11. [User-Role-Permission Matrix](#11-user-role-permission-matrix)

---

## 1. Service Units (Tests & Procedures)

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| service_code | VARCHAR(20) | Unique, alphanumeric | Yes |
| service_name | VARCHAR(255) | Min 3 chars | Yes |
| category | VARCHAR(100) | From predefined list | Yes |
| department | VARCHAR(50) | From department list | Yes |
| base_price | DECIMAL(10,2) | Min 0, Max 99999.99 | Yes |
| duration_minutes | INTEGER | Min 5, Max 480 | Yes |
| sample_type | VARCHAR(50) | From sample types | No |
| normal_range | TEXT | Free text | No |
| preparation_instructions | TEXT | Max 1000 chars | No |
| equipment_required | VARCHAR(255) | From equipment list | No |
| is_active | BOOLEAN | Default true | Yes |

### Default Service Categories
```json
{
  "laboratory_tests": {
    "name": "Laboratory Tests",
    "departments": ["clinical_chemistry", "hematology", "microbiology", "immunology"]
  },
  "imaging_services": {
    "name": "Imaging Services", 
    "departments": ["xray", "ultrasound", "ct_scan", "mri"]
  },
  "consultation_services": {
    "name": "Consultation Services",
    "departments": ["general_medicine", "specialist_consultation"]
  }
}
```

### Sample Service Data
```csv
service_code,service_name,category,department,base_price,duration_minutes,sample_type,is_active
CBC001,Complete Blood Count,laboratory_tests,hematology,400.00,30,EDTA Blood,true
GLUC001,Fasting Blood Glucose,laboratory_tests,clinical_chemistry,150.00,15,Serum,true
XRAY001,Chest X-Ray PA View,imaging_services,xray,800.00,15,,true
USG001,Abdominal Ultrasound,imaging_services,ultrasound,1200.00,30,,true
ECHO001,2D Echocardiography,imaging_services,ultrasound,2500.00,45,,true
```

### Lookup Tables Required
- **Service Categories**: Laboratory, Imaging, Consultation, Therapeutic
- **Sample Types**: EDTA Blood, Serum, Plasma, Urine, Stool, Tissue
- **Equipment List**: Hematology Analyzer, Chemistry Analyzer, X-Ray Machine, Ultrasound Machine

---

## 2. Employees & Roles

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| employee_id | VARCHAR(20) | Unique, format: EMP001 | Yes |
| first_name | VARCHAR(100) | Min 2 chars | Yes |
| last_name | VARCHAR(100) | Min 2 chars | Yes |
| email | VARCHAR(255) | Valid email format, unique | Yes |
| phone | VARCHAR(15) | 10-digit number | Yes |
| role | VARCHAR(50) | From role list | Yes |
| department | VARCHAR(100) | From department list | Yes |
| hire_date | DATE | Not future date | Yes |
| salary | DECIMAL(10,2) | Min 0 | No |
| is_active | BOOLEAN | Default true | Yes |
| emergency_contact | VARCHAR(255) | Phone number | No |
| qualifications | TEXT | Max 500 chars | No |

### Default Roles & Departments
```json
{
  "roles": [
    {
      "role_code": "RECEPT",
      "role_name": "Receptionist",
      "department": "front_desk",
      "description": "Patient registration and billing"
    },
    {
      "role_code": "LAB_TECH",
      "role_name": "Laboratory Technician", 
      "department": "laboratory",
      "description": "Sample processing and testing"
    },
    {
      "role_code": "IMAGING_TECH",
      "role_name": "Imaging Technician",
      "department": "imaging",
      "description": "X-ray and imaging procedures"
    },
    {
      "role_code": "SONO_TECH",
      "role_name": "Sonologist",
      "department": "ultrasound",
      "description": "Ultrasound examinations"
    },
    {
      "role_code": "CENTER_MGR",
      "role_name": "Centre Manager",
      "department": "management",
      "description": "Operations management"
    },
    {
      "role_code": "ACCOUNTANT",
      "role_name": "Accountant",
      "department": "finance",
      "description": "Financial management"
    },
    {
      "role_code": "DIRECTOR",
      "role_name": "Director",
      "department": "executive",
      "description": "Strategic oversight"
    },
    {
      "role_code": "CEO",
      "role_name": "Chief Executive Officer",
      "department": "executive", 
      "description": "Executive leadership"
    }
  ]
}
```

### Sample Employee Data
```csv
employee_id,first_name,last_name,email,phone,role,department,hire_date,is_active
EMP001,Priya,Sharma,priya.sharma@orientmedical.com,9876543210,RECEPT,front_desk,2024-01-15,true
EMP002,Rajesh,Kumar,rajesh.kumar@orientmedical.com,9876543211,LAB_TECH,laboratory,2024-01-20,true
EMP003,Sunita,Patel,sunita.patel@orientmedical.com,9876543212,IMAGING_TECH,imaging,2024-02-01,true
EMP004,Dr. Amit,Gupta,amit.gupta@orientmedical.com,9876543213,SONO_TECH,ultrasound,2024-02-15,true
EMP005,Meera,Singh,meera.singh@orientmedical.com,9876543214,CENTER_MGR,management,2024-01-10,true
```

---

## 3. Inventory Items & Categories

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| item_code | VARCHAR(20) | Unique, format: INV001 | Yes |
| item_name | VARCHAR(255) | Min 3 chars | Yes |
| category | VARCHAR(100) | From category list | Yes |
| unit_of_measure | VARCHAR(20) | From UOM list | Yes |
| current_stock | INTEGER | Min 0 | Yes |
| minimum_stock | INTEGER | Min 0 | Yes |
| maximum_stock | INTEGER | Min minimum_stock | Yes |
| unit_cost | DECIMAL(10,2) | Min 0 | Yes |
| supplier_id | INTEGER | FK to suppliers | No |
| expiry_date | DATE | Future date for consumables | No |
| storage_location | VARCHAR(100) | Max 100 chars | No |
| is_active | BOOLEAN | Default true | Yes |

### Default Categories & Units
```json
{
  "categories": [
    {
      "category_code": "REAGENTS",
      "category_name": "Laboratory Reagents",
      "description": "Chemical reagents for testing"
    },
    {
      "category_code": "CONSUMABLES", 
      "category_name": "Medical Consumables",
      "description": "Single-use medical supplies"
    },
    {
      "category_code": "EQUIPMENT",
      "category_name": "Medical Equipment",
      "description": "Durable medical equipment"
    },
    {
      "category_code": "OFFICE_SUPPLIES",
      "category_name": "Office Supplies", 
      "description": "Administrative supplies"
    }
  ],
  "units_of_measure": [
    "Each", "Box", "Pack", "Bottle", "Vial", "Liter", "Milliliter", "Gram", "Kilogram"
  ]
}
```

### Sample Inventory Data
```csv
item_code,item_name,category,unit_of_measure,current_stock,minimum_stock,maximum_stock,unit_cost,is_active
INV001,EDTA Tubes,CONSUMABLES,Box,50,20,200,150.00,true
INV002,Glucose Reagent Kit,REAGENTS,Kit,10,5,25,2500.00,true
INV003,X-Ray Films 14x17,CONSUMABLES,Pack,25,10,100,800.00,true
INV004,Ultrasound Gel,CONSUMABLES,Bottle,30,15,60,120.00,true
INV005,Disposable Syringes 5ml,CONSUMABLES,Box,40,20,150,300.00,true
```

---

## 4. Expense Types & Groups

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| expense_code | VARCHAR(20) | Unique, format: EXP001 | Yes |
| expense_name | VARCHAR(255) | Min 3 chars | Yes |
| expense_group | VARCHAR(100) | From group list | Yes |
| account_code | VARCHAR(20) | Valid GL account | Yes |
| is_recurring | BOOLEAN | Default false | Yes |
| default_amount | DECIMAL(10,2) | Min 0 | No |
| requires_approval | BOOLEAN | Default true | Yes |
| approval_limit | DECIMAL(10,2) | Min 0 | No |
| is_active | BOOLEAN | Default true | Yes |

### Default Expense Groups
```json
{
  "expense_groups": [
    {
      "group_code": "PERSONNEL",
      "group_name": "Personnel Expenses",
      "description": "Salaries, benefits, training"
    },
    {
      "group_code": "OPERATIONAL",
      "group_name": "Operational Expenses", 
      "description": "Utilities, rent, maintenance"
    },
    {
      "group_code": "MEDICAL_SUPPLIES",
      "group_name": "Medical Supplies",
      "description": "Reagents, consumables, equipment"
    },
    {
      "group_code": "ADMINISTRATIVE",
      "group_name": "Administrative Expenses",
      "description": "Office supplies, communications"
    },
    {
      "group_code": "MARKETING",
      "group_name": "Marketing & Promotion",
      "description": "Advertising, patient outreach"
    }
  ]
}
```

### Sample Expense Types
```csv
expense_code,expense_name,expense_group,account_code,is_recurring,requires_approval,approval_limit,is_active
EXP001,Salary - Laboratory Staff,PERSONNEL,6001,true,false,,true
EXP002,Equipment Maintenance,OPERATIONAL,6101,false,true,10000.00,true
EXP003,Laboratory Reagents,MEDICAL_SUPPLIES,6201,false,true,5000.00,true
EXP004,Electricity Bill,OPERATIONAL,6102,true,false,,true
EXP005,Marketing Materials,MARKETING,6301,false,true,2000.00,true
```

---

## 5. Income Types & Groups

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| income_code | VARCHAR(20) | Unique, format: INC001 | Yes |
| income_name | VARCHAR(255) | Min 3 chars | Yes |
| income_group | VARCHAR(100) | From group list | Yes |
| account_code | VARCHAR(20) | Valid GL account | Yes |
| tax_applicable | BOOLEAN | Default true | Yes |
| tax_rate | DECIMAL(5,2) | 0-100 | No |
| is_service_income | BOOLEAN | Default true | Yes |
| department | VARCHAR(100) | From department list | No |
| is_active | BOOLEAN | Default true | Yes |

### Default Income Groups
```json
{
  "income_groups": [
    {
      "group_code": "LABORATORY",
      "group_name": "Laboratory Services",
      "description": "Laboratory test revenues"
    },
    {
      "group_code": "IMAGING",
      "group_name": "Imaging Services",
      "description": "Radiology and imaging revenues"
    },
    {
      "group_code": "CONSULTATION",
      "group_name": "Consultation Services", 
      "description": "Doctor consultation fees"
    },
    {
      "group_code": "PACKAGES",
      "group_name": "Health Packages",
      "description": "Comprehensive health packages"
    },
    {
      "group_code": "OTHER_INCOME",
      "group_name": "Other Income",
      "description": "Miscellaneous income sources"
    }
  ]
}
```

### Sample Income Types
```csv
income_code,income_name,income_group,account_code,tax_applicable,tax_rate,is_service_income,department,is_active
INC001,Blood Test Revenue,LABORATORY,4001,true,18.00,true,laboratory,true
INC002,X-Ray Revenue,IMAGING,4002,true,18.00,true,imaging,true
INC003,Ultrasound Revenue,IMAGING,4003,true,18.00,true,ultrasound,true
INC004,Health Package Revenue,PACKAGES,4004,true,18.00,true,,true
INC005,Consultation Fees,CONSULTATION,4005,true,18.00,true,,true
```

---

## 6. Patient Master Records

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| patient_id | VARCHAR(20) | Auto-generated: PAT001 | Yes |
| first_name | VARCHAR(100) | Min 2 chars | Yes |
| last_name | VARCHAR(100) | Min 2 chars | Yes |
| date_of_birth | DATE | Past date, age validation | Yes |
| gender | VARCHAR(10) | Male/Female/Other | Yes |
| phone | VARCHAR(15) | 10-digit number | Yes |
| email | VARCHAR(255) | Valid email format | No |
| address | TEXT | Max 500 chars | Yes |
| emergency_contact | VARCHAR(255) | Name and phone | No |
| blood_group | VARCHAR(5) | A+, A-, B+, B-, AB+, AB-, O+, O- | No |
| allergies | TEXT | Max 1000 chars | No |
| medical_history | TEXT | Max 2000 chars | No |
| insurance_provider | VARCHAR(100) | From provider list | No |
| insurance_policy | VARCHAR(50) | Alphanumeric | No |
| created_date | DATETIME | Auto-generated | Yes |
| is_active | BOOLEAN | Default true | Yes |

### Default Patient Categories
```json
{
  "patient_types": [
    "Walk-in",
    "Referred",
    "Corporate",
    "Insurance",
    "Emergency"
  ],
  "blood_groups": [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
  ],
  "insurance_providers": [
    "Star Health Insurance",
    "HDFC ERGO Health",
    "ICICI Lombard Health",
    "New India Assurance",
    "United India Insurance",
    "Self Pay"
  ]
}
```

### Patient Data Validation Rules
- Age must be calculated from date_of_birth
- Phone number must be unique
- Email must be unique if provided
- Insurance policy required if insurance provider selected

---

## 7. Appointment Slots & Schedules

### Required Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| slot_id | INTEGER | Auto-increment | Yes |
| date | DATE | Not past date | Yes |
| start_time | TIME | Business hours only | Yes |
| end_time | TIME | After start_time | Yes |
| department | VARCHAR(100) | From department list | Yes |
| service_type | VARCHAR(100) | From service list | No |
| assigned_staff | INTEGER | FK to employees | No |
| max_patients | INTEGER | Min 1, Max 10 | Yes |
| current_bookings | INTEGER | Min 0, Max max_patients | Yes |
| is_available | BOOLEAN | Default true | Yes |
| slot_type | VARCHAR(50) | Regular/Emergency/Block | Yes |

### Default Schedule Configuration
```json
{
  "business_hours": {
    "monday": {"start": "08:00", "end": "20:00"},
    "tuesday": {"start": "08:00", "end": "20:00"},
    "wednesday": {"start": "08:00", "end": "20:00"},
    "thursday": {"start": "08:00", "end": "20:00"},
    "friday": {"start": "08:00", "end": "20:00"},
    "saturday": {"start": "08:00", "end": "18:00"},
    "sunday": {"start": "09:00", "end": "17:00"}
  },
  "slot_duration": {
    "laboratory": 15,
    "imaging": 20,
    "ultrasound": 30,
    "consultation": 20
  },
  "emergency_slots": {
    "percentage": 20,
    "departments": ["laboratory", "imaging", "ultrasound"]
  }
}
```

### Sample Appointment Slots
```csv
date,start_time,end_time,department,max_patients,slot_type,is_available
2024-06-10,08:00,08:15,laboratory,3,Regular,true
2024-06-10,08:15,08:30,laboratory,3,Regular,true
2024-06-10,08:00,08:20,imaging,2,Regular,true
2024-06-10,08:20,08:40,imaging,2,Regular,true
2024-06-10,08:00,08:30,ultrasound,1,Regular,true
```

---

## 8. Billing & Chart of Accounts

### Required Fields - Chart of Accounts
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| account_code | VARCHAR(20) | Unique, 4-digit format | Yes |
| account_name | VARCHAR(255) | Min 3 chars | Yes |
| account_type | VARCHAR(50) | Asset/Liability/Equity/Income/Expense | Yes |
| parent_account | VARCHAR(20) | FK to accounts | No |
| is_header | BOOLEAN | Default false | Yes |
| normal_balance | VARCHAR(10) | Debit/Credit | Yes |
| is_active | BOOLEAN | Default true | Yes |

### Default Chart of Accounts
```csv
account_code,account_name,account_type,parent_account,is_header,normal_balance,is_active
1000,ASSETS,,true,Debit,true
1100,Current Assets,Asset,1000,true,Debit,true
1101,Cash in Hand,Asset,1100,false,Debit,true
1102,Bank Account,Asset,1100,false,Debit,true
1103,Accounts Receivable,Asset,1100,false,Debit,true
1200,Fixed Assets,Asset,1000,true,Debit,true
1201,Medical Equipment,Asset,1200,false,Debit,true
1202,Furniture & Fixtures,Asset,1200,false,Debit,true
2000,LIABILITIES,,true,Credit,true
2100,Current Liabilities,Liability,2000,true,Credit,true
2101,Accounts Payable,Liability,2100,false,Credit,true
2102,Accrued Expenses,Liability,2100,false,Credit,true
3000,EQUITY,,true,Credit,true
3101,Owner's Equity,Equity,3000,false,Credit,true
4000,INCOME,,true,Credit,true
4001,Laboratory Revenue,Income,4000,false,Credit,true
4002,Imaging Revenue,Income,4000,false,Credit,true
4003,Consultation Revenue,Income,4000,false,Credit,true
6000,EXPENSES,,true,Debit,true
6001,Salary Expenses,Expense,6000,false,Debit,true
6002,Rent Expense,Expense,6000,false,Debit,true
6003,Utilities Expense,Expense,6000,false,Debit,true
```

### Billing Configuration
```json
{
  "tax_settings": {
    "gst_rate": 18.0,
    "apply_to_services": true,
    "tax_registration": "GST_NUMBER_HERE"
  },
  "payment_methods": [
    "Cash",
    "Credit Card", 
    "Debit Card",
    "UPI",
    "Net Banking",
    "Insurance Direct"
  ],
  "invoice_settings": {
    "prefix": "INV",
    "starting_number": 1001,
    "due_days": 30
  }
}
```

---

## 9. Suppliers & Purchase Order Templates

### Required Fields - Suppliers
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| supplier_id | INTEGER | Auto-increment | Yes |
| supplier_code | VARCHAR(20) | Unique, format: SUP001 | Yes |
| company_name | VARCHAR(255) | Min 3 chars | Yes |
| contact_person | VARCHAR(100) | Min 2 chars | Yes |
| email | VARCHAR(255) | Valid email format | Yes |
| phone | VARCHAR(15) | 10-digit number | Yes |
| address | TEXT | Max 500 chars | Yes |
| gst_number | VARCHAR(15) | Valid GST format | No |
| payment_terms | VARCHAR(100) | From terms list | Yes |
| credit_limit | DECIMAL(12,2) | Min 0 | No |
| is_active | BOOLEAN | Default true | Yes |

### Default Supplier Categories
```json
{
  "supplier_categories": [
    {
      "category": "Medical Equipment",
      "description": "Suppliers of diagnostic equipment"
    },
    {
      "category": "Laboratory Reagents",
      "description": "Chemical and reagent suppliers"
    },
    {
      "category": "Medical Consumables", 
      "description": "Disposable medical supplies"
    },
    {
      "category": "Office Supplies",
      "description": "Administrative and office supplies"
    },
    {
      "category": "Maintenance Services",
      "description": "Equipment maintenance providers"
    }
  ],
  "payment_terms": [
    "Net 15 Days",
    "Net 30 Days", 
    "Net 45 Days",
    "COD",
    "Advance Payment"
  ]
}
```

### Sample Supplier Data
```csv
supplier_code,company_name,contact_person,email,phone,payment_terms,is_active
SUP001,MedTech Equipments Pvt Ltd,Rohit Mehta,rohit@medtech.com,9876543220,Net 30 Days,true
SUP002,BioChemical Reagents,Sunita Jain,sunita@biochemical.com,9876543221,Net 15 Days,true
SUP003,SafeMed Consumables,Amit Sharma,amit@safemed.com,9876543222,Net 30 Days,true
SUP004,TechCare Maintenance,Priya Gupta,priya@techcare.com,9876543223,COD,true
```

### Purchase Order Template
```json
{
  "po_template": {
    "prefix": "PO",
    "starting_number": 2001,
    "approval_required": true,
    "default_terms": "Net 30 Days",
    "default_delivery_days": 7
  },
  "approval_matrix": {
    "up_to_10000": "Department Head",
    "10001_to_50000": "Centre Manager", 
    "50001_to_200000": "Director",
    "above_200000": "CEO"
  }
}
```

---

## 10. Imaging Modalities & Sonologist Assignments

### Required Fields - Imaging Modalities
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| modality_id | INTEGER | Auto-increment | Yes |
| modality_code | VARCHAR(20) | Unique, format: MOD001 | Yes |
| modality_name | VARCHAR(255) | Min 3 chars | Yes |
| department | VARCHAR(100) | imaging/ultrasound | Yes |
| equipment_id | INTEGER | FK to equipment | No |
| room_number | VARCHAR(20) | Max 20 chars | No |
| max_daily_capacity | INTEGER | Min 1, Max 100 | Yes |
| avg_procedure_time | INTEGER | Minutes, Min 5 | Yes |
| requires_contrast | BOOLEAN | Default false | Yes |
| preparation_required | BOOLEAN | Default false | Yes |
| is_active | BOOLEAN | Default true | Yes |

### Default Imaging Modalities
```csv
modality_code,modality_name,department,max_daily_capacity,avg_procedure_time,requires_contrast,preparation_required,is_active
MOD001,Digital X-Ray,imaging,60,15,false,false,true
MOD002,Fluoroscopy,imaging,20,30,true,true,true
MOD003,Mammography,imaging,25,20,false,true,true
MOD004,Abdominal Ultrasound,ultrasound,30,30,false,true,true
MOD005,Obstetric Ultrasound,ultrasound,35,25,false,false,true
MOD006,Echocardiography,ultrasound,20,45,false,false,true
MOD007,Doppler Studies,ultrasound,25,40,false,false,true
```

### Sonologist Assignment Matrix
```json
{
  "staff_assignments": [
    {
      "employee_id": "EMP004",
      "name": "Dr. Amit Gupta",
      "modalities": ["MOD004", "MOD005", "MOD006", "MOD007"],
      "specializations": ["Abdominal", "Obstetric", "Cardiac"],
      "shift_hours": "08:00-16:00",
      "max_daily_procedures": 25
    }
  ],
  "coverage_requirements": {
    "minimum_staff_per_shift": 1,
    "backup_coverage": true,
    "emergency_availability": true
  }
}
```

---

## 11. User-Role-Permission Matrix

### User Management Fields
| Field Name | Type | Validation Rules | Required |
|------------|------|------------------|----------|
| user_id | INTEGER | Auto-increment | Yes |
| username | VARCHAR(50) | Unique, min 3 chars | Yes |
| password_hash | VARCHAR(255) | Encrypted | Yes |
| employee_id | INTEGER | FK to employees | Yes |
| role_id | INTEGER | FK to roles | Yes |
| is_active | BOOLEAN | Default true | Yes |
| last_login | DATETIME | Auto-updated | No |
| password_expires | DATE | Future date | No |
| failed_attempts | INTEGER | Default 0, Max 5 | Yes |

### Complete Permission Matrix

#### Front Desk / Receptionist Permissions
```json
{
  "role": "RECEPTIONIST",
  "permissions": {
    "patients": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "appointments": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    },
    "billing": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "payments": {
      "create": true,
      "read": true,
      "update": false,
      "delete": false
    },
    "reports": {
      "daily_collections": true,
      "patient_reports": true,
      "appointment_schedules": true
    }
  }
}
```

#### Laboratory Staff Permissions
```json
{
  "role": "LAB_TECHNICIAN",
  "permissions": {
    "test_orders": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false
    },
    "test_results": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "quality_control": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "inventory": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false
    },
    "reports": {
      "lab_productivity": true,
      "quality_metrics": true,
      "inventory_usage": true
    }
  }
}
```

#### Imaging Staff Permissions
```json
{
  "role": "IMAGING_TECHNICIAN",
  "permissions": {
    "imaging_orders": {
      "create": false,
      "read": true,
      "update": true,
      "delete": false
    },
    "imaging_studies": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "equipment_maintenance": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "reports": {
      "imaging_productivity": true,
      "equipment_utilization": true,
      "radiation_logs": true
    }
  }
}
```

#### Management Permissions
```json
{
  "role": "CENTRE_MANAGER",
  "permissions": {
    "all_modules": {
      "create": true,
      "read": true,
      "update": true,
      "delete": true
    },
    "staff_management": {
      "create": true,
      "read": true,
      "update": true,
      "delete": false
    },
    "financial_reports": {
      "revenue_reports": true,
      "expense_reports": true,
      "profit_loss": true,
      "budget_variance": true
    },
    "system_admin": {
      "user_management": true,
      "backup_restore": false,
      "system_configuration": true
    }
  }
}
```

#### Executive Permissions
```json
{
  "role": "CEO",
  "permissions": {
    "full_system_access": true,
    "strategic_reports": {
      "executive_dashboard": true,
      "market_analysis": true,
      "performance_analytics": true,
      "board_reports": true
    },
    "system_administration": {
      "user_management": true,
      "system_configuration": true,
      "backup_restore": true,
      "audit_logs": true
    }
  }
}
```

---

## Implementation Checklist

### Phase 1: Core Setup (Week 1)
- [ ] Database schema creation and validation
- [ ] Chart of accounts setup
- [ ] User roles and permissions configuration
- [ ] Service catalog initialization
- [ ] Department and staff setup

### Phase 2: Master Data (Week 2)
- [ ] Employee records creation
- [ ] Inventory categories and items setup
- [ ] Supplier master data
- [ ] Expense and income type configuration
- [ ] Appointment slot templates

### Phase 3: Testing & Validation (Week 3)
- [ ] End-to-end workflow testing
- [ ] User acceptance testing
- [ ] Data validation and cleanup
- [ ] Performance optimization
- [ ] Security testing

### Phase 4: Go-Live Preparation (Week 4)
- [ ] Staff training completion
- [ ] Backup procedures verification
- [ ] Disaster recovery testing
- [ ] Documentation finalization
- [ ] Support procedures establishment

---

## Critical Configuration Notes

1. **Data Relationships**: Ensure all foreign key relationships are properly established
2. **Validation Rules**: Implement client-side and server-side validation
3. **Audit Trail**: Enable audit logging for all critical transactions
4. **Backup Strategy**: Daily automated backups with weekly full backups
5. **Security**: Regular password updates, role-based access controls
6. **Performance**: Index optimization for frequently queried fields
7. **Compliance**: HIPAA-compliant data handling and storage
8. **Integration**: API endpoints for external system integration

This comprehensive checklist ensures the Orient Medical Diagnostic Centre ERP system is fully functional and ready for production use with proper data governance and security measures in place.