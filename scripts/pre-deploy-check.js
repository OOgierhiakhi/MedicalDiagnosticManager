#!/usr/bin/env node

/**
 * Pre-deployment check script for Orient Medical ERP System
 * Verifies the application is ready for GitHub upload and Render deployment
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

console.log('🔍 Orient Medical ERP - Pre-deployment Check\n');

const checks = [];

// Check 1: Required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'DEPLOYMENT.md',
  '.gitignore',
  '.env.example',
  'client/src/App.tsx',
  'server/index.ts',
  'shared/schema.ts'
];

let filesOk = true;
for (const file of requiredFiles) {
  if (existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    filesOk = false;
  }
}
checks.push({ name: 'Required Files', status: filesOk });

// Check 2: Package.json configuration
console.log('\n📦 Checking package.json...');
let packageOk = true;
try {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  
  if (pkg.scripts?.build) {
    console.log('  ✅ Build script configured');
  } else {
    console.log('  ❌ Build script missing');
    packageOk = false;
  }
  
  if (pkg.scripts?.start) {
    console.log('  ✅ Start script configured');
  } else {
    console.log('  ❌ Start script missing');
    packageOk = false;
  }
  
  if (pkg.type === 'module') {
    console.log('  ✅ ES modules configured');
  } else {
    console.log('  ❌ ES modules not configured');
    packageOk = false;
  }
  
} catch (error) {
  console.log('  ❌ Invalid package.json');
  packageOk = false;
}
checks.push({ name: 'Package Configuration', status: packageOk });

// Check 3: Environment template
console.log('\n🔧 Checking environment configuration...');
let envOk = true;
try {
  const envExample = readFileSync('.env.example', 'utf8');
  
  if (envExample.includes('DATABASE_URL')) {
    console.log('  ✅ Database URL template');
  } else {
    console.log('  ❌ Database URL template missing');
    envOk = false;
  }
  
  if (envExample.includes('SESSION_SECRET')) {
    console.log('  ✅ Session secret template');
  } else {
    console.log('  ❌ Session secret template missing');
    envOk = false;
  }
  
} catch (error) {
  console.log('  ❌ .env.example file missing or invalid');
  envOk = false;
}
checks.push({ name: 'Environment Template', status: envOk });

// Check 4: Build test
console.log('\n🔨 Testing build process...');
let buildOk = true;
try {
  console.log('  🔄 Running npm run build...');
  execSync('npm run build', { stdio: 'pipe' });
  console.log('  ✅ Build successful');
} catch (error) {
  console.log('  ❌ Build failed');
  console.log(`     Error: ${error.message}`);
  buildOk = false;
}
checks.push({ name: 'Build Process', status: buildOk });

// Check 5: TypeScript compilation
console.log('\n📝 Checking TypeScript...');
let tsOk = true;
try {
  console.log('  🔄 Running TypeScript check...');
  execSync('npm run check', { stdio: 'pipe' });
  console.log('  ✅ TypeScript check passed');
} catch (error) {
  console.log('  ❌ TypeScript errors found');
  tsOk = false;
}
checks.push({ name: 'TypeScript Check', status: tsOk });

// Check 6: Critical security files
console.log('\n🔒 Checking security configuration...');
let securityOk = true;
try {
  const gitignore = readFileSync('.gitignore', 'utf8');
  
  if (gitignore.includes('.env')) {
    console.log('  ✅ .env files ignored');
  } else {
    console.log('  ❌ .env files not ignored - SECURITY RISK');
    securityOk = false;
  }
  
  if (gitignore.includes('node_modules')) {
    console.log('  ✅ node_modules ignored');
  } else {
    console.log('  ❌ node_modules not ignored');
    securityOk = false;
  }
  
} catch (error) {
  console.log('  ❌ .gitignore missing or invalid');
  securityOk = false;
}
checks.push({ name: 'Security Configuration', status: securityOk });

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 DEPLOYMENT READINESS SUMMARY');
console.log('='.repeat(50));

const passed = checks.filter(c => c.status).length;
const total = checks.length;

for (const check of checks) {
  const status = check.status ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${check.name}`);
}

console.log('\n' + '='.repeat(50));
if (passed === total) {
  console.log('🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. git init');
  console.log('2. git add .');
  console.log('3. git commit -m "Initial commit: Orient Medical ERP System"');
  console.log('4. git remote add origin https://github.com/yourusername/orient-medical-erp.git');
  console.log('5. git push -u origin main');
  console.log('6. Deploy to Render.com following DEPLOYMENT.md guide');
} else {
  console.log(`❌ ${total - passed} checks failed - Fix issues before deployment`);
  process.exit(1);
}

console.log('='.repeat(50));