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

class MaintenanceAutomation {
  constructor() {
    this.db = drizzle({ 
      client: new Pool({ connectionString: process.env.DATABASE_URL })
    });
    this.logFile = path.resolve(__dirname, '../logs/maintenance.log');
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    console.log(message);
    await fs.mkdir(path.dirname(this.logFile), { recursive: true });
    await fs.appendFile(this.logFile, logEntry);
  }

  async weeklyMaintenance() {
    await this.log('🔧 Starting weekly maintenance routine...');
    
    const tasks = [
      { name: 'Security Updates', fn: () => this.applySecurityUpdates() },
      { name: 'Database Optimization', fn: () => this.optimizeDatabase() },
      { name: 'Log Rotation', fn: () => this.rotateLogs() },
      { name: 'Performance Analysis', fn: () => this.analyzePerformance() },
      { name: 'Backup Verification', fn: () => this.verifyBackups() },
      { name: 'Health Check', fn: () => this.runHealthChecks() }
    ];

    const results = [];
    for (const task of tasks) {
      try {
        await this.log(`Starting: ${task.name}`);
        const result = await task.fn();
        results.push({ task: task.name, status: 'success', result });
        await this.log(`Completed: ${task.name}`);
      } catch (error) {
        results.push({ task: task.name, status: 'failed', error: error.message });
        await this.log(`Failed: ${task.name} - ${error.message}`);
      }
    }

    await this.generateMaintenanceReport('weekly', results);
    await this.log('✅ Weekly maintenance completed');
    
    return results;
  }

  async monthlyMaintenance() {
    await this.log('🔧 Starting monthly maintenance routine...');
    
    const tasks = [
      { name: 'Major System Updates', fn: () => this.applyMajorUpdates() },
      { name: 'Database Reindexing', fn: () => this.reindexDatabase() },
      { name: 'Security Vulnerability Scan', fn: () => this.runSecurityScan() },
      { name: 'Performance Baseline Review', fn: () => this.reviewPerformanceBaseline() },
      { name: 'Compliance Check', fn: () => this.runComplianceCheck() },
      { name: 'Disaster Recovery Test', fn: () => this.testDisasterRecovery() }
    ];

    const results = [];
    for (const task of tasks) {
      try {
        await this.log(`Starting: ${task.name}`);
        const result = await task.fn();
        results.push({ task: task.name, status: 'success', result });
        await this.log(`Completed: ${task.name}`);
      } catch (error) {
        results.push({ task: task.name, status: 'failed', error: error.message });
        await this.log(`Failed: ${task.name} - ${error.message}`);
      }
    }

    await this.generateMaintenanceReport('monthly', results);
    await this.log('✅ Monthly maintenance completed');
    
    return results;
  }

  async quarterlyMaintenance() {
    await this.log('🔧 Starting quarterly maintenance routine...');
    
    const tasks = [
      { name: 'Major Version Upgrades', fn: () => this.planMajorUpgrades() },
      { name: 'Infrastructure Review', fn: () => this.reviewInfrastructure() },
      { name: 'Security Audit', fn: () => this.conductSecurityAudit() },
      { name: 'Capacity Planning', fn: () => this.performCapacityPlanning() },
      { name: 'Compliance Certification', fn: () => this.updateComplianceCerts() },
      { name: 'Business Continuity Test', fn: () => this.testBusinessContinuity() }
    ];

    const results = [];
    for (const task of tasks) {
      try {
        await this.log(`Starting: ${task.name}`);
        const result = await task.fn();
        results.push({ task: task.name, status: 'success', result });
        await this.log(`Completed: ${task.name}`);
      } catch (error) {
        results.push({ task: task.name, status: 'failed', error: error.message });
        await this.log(`Failed: ${task.name} - ${error.message}`);
      }
    }

    await this.generateMaintenanceReport('quarterly', results);
    await this.log('✅ Quarterly maintenance completed');
    
    return results;
  }

  async applySecurityUpdates() {
    // Check for npm vulnerabilities
    const { stdout: auditOutput } = await execAsync('npm audit --json');
    const auditData = JSON.parse(auditOutput);
    
    if (auditData.metadata.vulnerabilities.total > 0) {
      await this.log(`Found ${auditData.metadata.vulnerabilities.total} vulnerabilities`);
      
      // Apply automatic fixes
      await execAsync('npm audit fix --force');
      await this.log('Applied automatic security fixes');
    }

    // Check system packages (if running on Linux)
    try {
      await execAsync('which apt-get');
      const { stdout: updateList } = await execAsync('apt list --upgradable 2>/dev/null || true');
      if (updateList.trim()) {
        await this.log(`System packages available for update: ${updateList.split('\n').length - 1}`);
      }
    } catch (error) {
      // Not on a Debian-based system, skip package updates
    }

    return { vulnerabilities: auditData.metadata.vulnerabilities };
  }

  async optimizeDatabase() {
    // Analyze table statistics
    await this.db.execute('ANALYZE;');
    
    // Update query planner statistics
    const [tableStats] = await this.db.execute(`
      SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del
      FROM pg_stat_user_tables
      ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
      LIMIT 10
    `);

    // Check for tables that need vacuuming
    const [vacuumStats] = await this.db.execute(`
      SELECT schemaname, tablename, n_dead_tup, n_live_tup,
             ROUND(n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1), 2) as dead_ratio
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 1000
      ORDER BY dead_ratio DESC
    `);

    // Vacuum tables with high dead tuple ratio
    for (const table of vacuumStats) {
      if (table.dead_ratio > 10) {
        await this.db.execute(`VACUUM ANALYZE ${table.schemaname}.${table.tablename};`);
        await this.log(`Vacuumed table: ${table.tablename} (${table.dead_ratio}% dead tuples)`);
      }
    }

    return { optimizedTables: vacuumStats.length, statistics: tableStats };
  }

  async rotateLogs() {
    const logDir = path.resolve(__dirname, '../logs');
    const archiveDir = path.resolve(logDir, 'archive');
    
    await fs.mkdir(archiveDir, { recursive: true });
    
    try {
      const files = await fs.readdir(logDir);
      const logFiles = files.filter(file => file.endsWith('.log'));
      
      for (const logFile of logFiles) {
        const filePath = path.join(logDir, logFile);
        const stats = await fs.stat(filePath);
        
        // Rotate logs older than 7 days
        if (Date.now() - stats.mtime.getTime() > 7 * 24 * 60 * 60 * 1000) {
          const timestamp = stats.mtime.toISOString().split('T')[0];
          const archivePath = path.join(archiveDir, `${logFile}.${timestamp}.gz`);
          
          // Compress and move log file
          await execAsync(`gzip -c "${filePath}" > "${archivePath}"`);
          await fs.writeFile(filePath, ''); // Clear original log
          
          await this.log(`Rotated log: ${logFile}`);
        }
      }
    } catch (error) {
      await this.log(`Log rotation warning: ${error.message}`);
    }

    return { rotated: true };
  }

  async analyzePerformance() {
    // Database performance metrics
    const [dbMetrics] = await this.db.execute(`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity) as active_connections,
        (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections,
        (SELECT round(avg(mean_exec_time)::numeric, 2) FROM pg_stat_statements WHERE calls > 100) as avg_query_time
    `);

    // Slow query analysis
    const [slowQueries] = await this.db.execute(`
      SELECT query, calls, mean_exec_time, rows
      FROM pg_stat_statements
      WHERE mean_exec_time > 1000
      ORDER BY mean_exec_time DESC
      LIMIT 5
    `);

    // System metrics (if available)
    let systemMetrics = {};
    try {
      const { stdout: memInfo } = await execAsync('cat /proc/meminfo | head -3');
      const { stdout: loadAvg } = await execAsync('cat /proc/loadavg');
      systemMetrics = { memory: memInfo, load: loadAvg.trim() };
    } catch (error) {
      // System metrics not available
    }

    return {
      database: dbMetrics,
      slowQueries: slowQueries.slice(0, 5),
      system: systemMetrics
    };
  }

  async verifyBackups() {
    const backupDir = path.resolve(__dirname, '../backups');
    
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort()
        .reverse();

      if (backupFiles.length === 0) {
        throw new Error('No backup files found');
      }

      // Verify latest backup integrity
      const latestBackup = path.join(backupDir, backupFiles[0]);
      const stats = await fs.stat(latestBackup);
      
      // Check if backup is recent (within 24 hours)
      const isRecent = Date.now() - stats.mtime.getTime() < 24 * 60 * 60 * 1000;
      
      // Verify backup file is not empty
      const isValid = stats.size > 1000; // At least 1KB
      
      return {
        latestBackup: backupFiles[0],
        lastModified: stats.mtime,
        size: stats.size,
        isRecent,
        isValid,
        totalBackups: backupFiles.length
      };
    } catch (error) {
      throw new Error(`Backup verification failed: ${error.message}`);
    }
  }

  async runHealthChecks() {
    // Import and run health check script
    const { runHealthChecks } = await import('./health-check.js');
    return await runHealthChecks();
  }

  async reindexDatabase() {
    // Get index usage statistics
    const [indexStats] = await this.db.execute(`
      SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE idx_tup_read = 0 AND idx_tup_fetch = 0
    `);

    // Reindex heavily used indexes
    const [heavyIndexes] = await this.db.execute(`
      SELECT schemaname, tablename, indexname
      FROM pg_stat_user_indexes
      WHERE idx_tup_read > 100000
      ORDER BY idx_tup_read DESC
      LIMIT 10
    `);

    for (const index of heavyIndexes) {
      await this.db.execute(`REINDEX INDEX ${index.schemaname}.${index.indexname};`);
      await this.log(`Reindexed: ${index.indexname}`);
    }

    return {
      unusedIndexes: indexStats.length,
      reindexedCount: heavyIndexes.length
    };
  }

  async runSecurityScan() {
    // Run Snyk security scan if token is available
    if (process.env.SNYK_TOKEN) {
      try {
        const { stdout } = await execAsync('npx snyk test --json');
        const scanResults = JSON.parse(stdout);
        return {
          vulnerabilities: scanResults.vulnerabilities?.length || 0,
          summary: scanResults.summary
        };
      } catch (error) {
        return { error: 'Security scan failed', details: error.message };
      }
    }
    
    return { skipped: 'No SNYK_TOKEN provided' };
  }

  async runComplianceCheck() {
    // Import and run compliance automation
    const { ComplianceAutomation } = await import('./compliance-automation.js');
    const compliance = new ComplianceAutomation();
    return await compliance.runAutomatedComplianceChecks();
  }

  async generateMaintenanceReport(type, results) {
    const report = {
      type,
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length
      }
    };

    const reportDir = path.resolve(__dirname, '../maintenance-reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const filename = `${type}-maintenance-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    await this.log(`Maintenance report saved: ${filename}`);
    
    return report;
  }

  async notifyMaintenanceCompletion(type, results) {
    const summary = {
      total: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length
    };

    // Send Slack notification if webhook is configured
    if (process.env.SLACK_WEBHOOK) {
      const payload = {
        text: `🔧 ${type.charAt(0).toUpperCase() + type.slice(1)} Maintenance Completed`,
        attachments: [{
          color: summary.failed > 0 ? 'warning' : 'good',
          fields: [
            { title: 'Total Tasks', value: summary.total.toString(), short: true },
            { title: 'Successful', value: summary.successful.toString(), short: true },
            { title: 'Failed', value: summary.failed.toString(), short: true },
            { title: 'Timestamp', value: new Date().toISOString(), short: true }
          ]
        }]
      };

      try {
        const fetch = (await import('node-fetch')).default;
        await fetch(process.env.SLACK_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        await this.log(`Failed to send Slack notification: ${error.message}`);
      }
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const maintenance = new MaintenanceAutomation();
  maintenance.startTime = Date.now();
  
  const schedule = process.argv[2];
  
  try {
    let results;
    
    switch (schedule) {
      case 'weekly':
        results = await maintenance.weeklyMaintenance();
        break;
      case 'monthly':
        results = await maintenance.monthlyMaintenance();
        break;
      case 'quarterly':
        results = await maintenance.quarterlyMaintenance();
        break;
      default:
        console.log('Usage: node maintenance-automation.js [weekly|monthly|quarterly]');
        process.exit(1);
    }
    
    await maintenance.notifyMaintenanceCompletion(schedule, results);
    
  } catch (error) {
    console.error('Maintenance failed:', error.message);
    process.exit(1);
  }
}

export { MaintenanceAutomation };