#!/usr/bin/env node

import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import ws from 'ws';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

// Configure neon with WebSocket
import { neonConfig } from '@neondatabase/serverless';
neonConfig.webSocketConstructor = ws;

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  console.log('🔄 Starting database migrations...');
  
  try {
    const pool = new Pool({ connectionString: databaseUrl });
    const db = drizzle({ client: pool });
    
    await migrate(db, { 
      migrationsFolder: path.resolve(__dirname, '../drizzle/migrations')
    });
    
    console.log('✅ Migrations completed successfully');
    await pool.end();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };