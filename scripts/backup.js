#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

async function backupDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  const backupDir = path.resolve(__dirname, '../backups');
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  const backupPath = path.join(backupDir, backupFile);

  console.log(`🔄 Creating database backup: ${backupFile}`);
  
  try {
    // Create backups directory if it doesn't exist
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup using pg_dump
    const { stdout, stderr } = await execAsync(
      `pg_dump "${databaseUrl}" --no-owner --no-privileges --clean --if-exists > "${backupPath}"`
    );
    
    if (stderr) {
      console.warn('⚠️ Backup warnings:', stderr);
    }
    
    console.log(`✅ Database backup created: ${backupPath}`);
    
    // Keep only last 10 backups
    const files = await fs.readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10);
      for (const file of filesToDelete) {
        await fs.unlink(path.join(backupDir, file));
        console.log(`🗑️ Removed old backup: ${file}`);
      }
    }
    
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  backupDatabase();
}

export { backupDatabase };