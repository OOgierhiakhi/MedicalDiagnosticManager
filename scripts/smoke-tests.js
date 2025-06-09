#!/usr/bin/env node

import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

const SMOKE_TESTS = [
  {
    name: 'Homepage Load',
    method: 'GET',
    url: '/',
    expectedStatus: 200,
    timeout: 10000
  },
  {
    name: 'API Status',
    method: 'GET',
    url: '/api/health',
    expectedStatus: 200,
    timeout: 5000
  },
  {
    name: 'Dashboard Metrics',
    method: 'GET',
    url: '/api/dashboard/metrics',
    expectedStatus: [200, 401], // May require auth
    timeout: 5000
  },
  {
    name: 'User Authentication',
    method: 'GET',
    url: '/api/user',
    expectedStatus: [200, 401], // Depends on session
    timeout: 5000
  },
  {
    name: 'Database Connection',
    method: 'GET',
    url: '/api/branches',
    expectedStatus: [200, 401],
    timeout: 10000
  }
];

async function runSmokeTest(baseUrl, test) {
  const url = `${baseUrl}${test.url}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), test.timeout);

  try {
    console.log(`🔄 Testing ${test.name}...`);
    
    const response = await fetch(url, {
      method: test.method,
      signal: controller.signal,
      headers: {
        'User-Agent': 'SmokeTest/1.0',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeout);

    const expectedStatuses = Array.isArray(test.expectedStatus) 
      ? test.expectedStatus 
      : [test.expectedStatus];

    if (!expectedStatuses.includes(response.status)) {
      throw new Error(`Expected status ${expectedStatuses.join(' or ')}, got ${response.status}`);
    }

    console.log(`✅ ${test.name}: ${response.status} ${response.statusText}`);
    return { success: true, status: response.status };
    
  } catch (error) {
    clearTimeout(timeout);
    console.error(`❌ ${test.name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runSmokeTests() {
  const baseUrl = process.env.STAGING_URL || process.env.PRODUCTION_URL || 'http://localhost:5000';
  
  console.log(`🚀 Running smoke tests against: ${baseUrl}`);
  console.log('=====================================');

  const results = [];
  let allPassed = true;

  for (const test of SMOKE_TESTS) {
    const result = await runSmokeTest(baseUrl, test);
    results.push({ test: test.name, ...result });
    
    if (!result.success) {
      allPassed = false;
    }
  }

  console.log('\n📊 Smoke Test Summary:');
  console.log('======================');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.test}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log(`\n🏁 Overall Status: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    process.exit(1);
  }
  
  console.log('✅ Basic application functionality verified');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTests();
}

export { runSmokeTests };