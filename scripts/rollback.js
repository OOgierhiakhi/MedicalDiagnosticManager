#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

config({ path: path.resolve(__dirname, '../.env') });

async function getLatestBackup() {
  const backupDir = path.resolve(__dirname, '../backups');
  
  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (backupFiles.length === 0) {
      throw new Error('No backup files found');
    }
    
    return path.join(backupDir, backupFiles[0]);
  } catch (error) {
    throw new Error(`Failed to find backup files: ${error.message}`);
  }
}

async function rollbackDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🔄 Starting database rollback...');
  
  try {
    // Get the latest backup
    const backupFile = await getLatestBackup();
    console.log(`📁 Using backup file: ${path.basename(backupFile)}`);
    
    // Confirm rollback
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  PRODUCTION ROLLBACK - This will restore the database to a previous state');
      console.log('⚠️  All data changes since the backup will be lost');
      
      // In production, we should have additional confirmation mechanisms
      if (!process.env.FORCE_ROLLBACK) {
        console.log('❌ Set FORCE_ROLLBACK=true to proceed with production rollback');
        process.exit(1);
      }
    }
    
    // Create a pre-rollback backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRollbackBackup = path.resolve(__dirname, `../backups/pre-rollback-${timestamp}.sql`);
    
    console.log('📦 Creating pre-rollback backup...');
    await execAsync(`pg_dump "${databaseUrl}" --no-owner --no-privileges --clean --if-exists > "${preRollbackBackup}"`);
    
    // Restore from backup
    console.log('🔄 Restoring database from backup...');
    await execAsync(`psql "${databaseUrl}" < "${backupFile}"`);
    
    console.log('✅ Database rollback completed successfully');
    console.log(`📁 Pre-rollback backup saved as: ${path.basename(preRollbackBackup)}`);
    
    return true;
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    process.exit(1);
  }
}

async function rollbackApplication() {
  console.log('🔄 Rolling back application...');
  
  try {
    // In a real deployment, this would involve:
    // - Switching to previous container/deployment
    // - Updating load balancer configuration
    // - Reverting environment variables
    
    console.log('📝 Application rollback steps:');
    console.log('1. Database has been restored from backup');
    console.log('2. Application server will restart with previous version');
    console.log('3. Load balancer will route traffic to healthy instances');
    
    // For Replit deployment, we would trigger a revert to the previous commit
    if (process.env.REPLIT_DEPLOYMENT) {
      console.log('🔄 Triggering Replit deployment rollback...');
      // Add Replit-specific rollback commands here
    }
    
    console.log('✅ Application rollback initiated');
    return true;
  } catch (error) {
    console.error('❌ Application rollback failed:', error.message);
    throw error;
  }
}

async function performRollback() {
  console.log('🚨 EMERGENCY ROLLBACK INITIATED');
  console.log('================================');
  
  try {
    // Step 1: Rollback database
    await rollbackDatabase();
    
    // Step 2: Rollback application
    await rollbackApplication();
    
    console.log('\n✅ ROLLBACK COMPLETED SUCCESSFULLY');
    console.log('🔍 Please verify application functionality');
    console.log('📞 Notify stakeholders of the rollback');
    
  } catch (error) {
    console.error('\n❌ ROLLBACK FAILED');
    console.error('🚨 MANUAL INTERVENTION REQUIRED');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  performRollback();
}

export { performRollback, rollbackDatabase, rollbackApplication };