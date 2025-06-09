#!/usr/bin/env node

import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.resolve(__dirname, '../.env') });

const HEALTH_CHECKS = [
  {
    name: 'Application Health',
    url: '/api/health',
    timeout: 5000,
    expected: { status: 'ok' }
  },
  {
    name: 'Database Connection',
    url: '/api/health/database',
    timeout: 10000,
    expected: { status: 'connected' }
  },
  {
    name: 'Authentication Service',
    url: '/api/health/auth',
    timeout: 5000,
    expected: { status: 'operational' }
  },
  {
    name: 'External APIs',
    url: '/api/health/external',
    timeout: 15000,
    expected: { status: 'available' }
  }
];

async function performHealthCheck(baseUrl, check) {
  const url = `${baseUrl}${check.url}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), check.timeout);

  try {
    console.log(`🔄 Checking ${check.name}...`);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HealthCheck/1.0'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if response matches expected structure
    if (check.expected && check.expected.status && data.status !== check.expected.status) {
      throw new Error(`Expected status '${check.expected.status}', got '${data.status}'`);
    }

    console.log(`✅ ${check.name}: ${data.status || 'OK'}`);
    return { success: true, data };
    
  } catch (error) {
    clearTimeout(timeout);
    console.error(`❌ ${check.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runHealthChecks() {
  const baseUrl = process.env.HEALTH_CHECK_URL || process.env.PRODUCTION_URL || process.env.STAGING_URL || 'http://localhost:5000';
  
  console.log(`🏥 Running health checks against: ${baseUrl}`);
  console.log('================================');

  const results = [];
  let allPassed = true;

  for (const check of HEALTH_CHECKS) {
    const result = await performHealthCheck(baseUrl, check);
    results.push({ check: check.name, ...result });
    
    if (!result.success) {
      allPassed = false;
    }
  }

  console.log('\n📊 Health Check Summary:');
  console.log('========================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.check}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n🏁 Overall Status: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  
  if (!allPassed) {
    process.exit(1);
  }
  
  console.log('✅ Application is healthy and ready to serve traffic');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthChecks();
}

export { runHealthChecks };