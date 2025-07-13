#!/usr/bin/env node

/**
 * Reset Admin Password Script
 * Run this on your deployed environment to reset admin credentials
 */

import bcrypt from 'bcrypt';
import { Pool } from 'pg';

async function resetAdminPassword() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Connecting to database...');
    
    // Hash the new password
    const newPassword = 'admin123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('🔑 Generated new password hash...');
    
    // Update admin user
    const result = await pool.query(
      `UPDATE users 
       SET password = $1, updated_at = NOW() 
       WHERE username = 'admin'`,
      [hashedPassword]
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Admin password reset successfully!');
      console.log('📧 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
      console.log('⚠️  Please change this password after first login');
    } else {
      console.log('❌ No admin user found. Creating new admin user...');
      
      // Create new admin user
      await pool.query(
        `INSERT INTO users (
          username, email, password, first_name, last_name, 
          role, tenant_id, branch_id, is_active, created_at, updated_at
        ) VALUES (
          'admin', 'admin@orient-medical.com', $1, 'System', 'Administrator',
          'admin', 1, 1, true, NOW(), NOW()
        )`,
        [hashedPassword]
      );
      
      console.log('✅ New admin user created successfully!');
      console.log('📧 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
resetAdminPassword();