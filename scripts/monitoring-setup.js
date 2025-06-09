#!/usr/bin/env node

import fetch from 'node-fetch';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '../.env') });

const MONITORING_CONFIG = {
  healthCheck: {
    interval: 60000, // 1 minute
    timeout: 10000,  // 10 seconds
    retries: 3,
    endpoints: [
      '/api/health',
      '/api/health/database',
      '/api/health/auth'
    ]
  },
  alerts: {
    downtime: { threshold: 120000 }, // 2 minutes
    errorRate: { threshold: 0.05 },  // 5%
    responseTime: { threshold: 5000 }, // 5 seconds
    dbConnections: { threshold: 0.9 } // 90% of max connections
  },
  notifications: {
    slack: process.env.SLACK_WEBHOOK,
    email: process.env.ALERT_EMAIL,
    sms: process.env.ALERT_SMS
  }
};

class MonitoringService {
  constructor(config) {
    this.config = config;
    this.metrics = {
      uptime: 0,
      downtime: 0,
      lastCheck: null,
      errorCount: 0,
      responseTime: [],
      alerts: []
    };
    this.isRunning = false;
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('Monitoring is already running');
      return;
    }

    this.isRunning = true;
    console.log('🔍 Starting monitoring service...');
    console.log(`📊 Health check interval: ${this.config.healthCheck.interval}ms`);
    
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheck.interval);

    // Initial health check
    await this.performHealthChecks();
  }

  async performHealthChecks() {
    const baseUrl = process.env.PRODUCTION_URL || process.env.STAGING_URL || 'http://localhost:5000';
    const checkTime = new Date();
    
    for (const endpoint of this.config.healthCheck.endpoints) {
      await this.checkEndpoint(baseUrl + endpoint, checkTime);
    }

    this.metrics.lastCheck = checkTime;
    this.evaluateAlerts();
  }

  async checkEndpoint(url, checkTime) {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.healthCheck.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'MonitoringService/1.0' }
      });

      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      
      this.recordMetric(url, {
        status: response.status,
        responseTime,
        timestamp: checkTime,
        success: response.ok
      });

      if (!response.ok) {
        this.metrics.errorCount++;
        console.log(`⚠️ Health check failed: ${url} (${response.status})`);
      }

    } catch (error) {
      this.metrics.errorCount++;
      this.recordMetric(url, {
        status: 0,
        responseTime: Date.now() - startTime,
        timestamp: checkTime,
        success: false,
        error: error.message
      });
      
      console.log(`❌ Health check error: ${url} - ${error.message}`);
    }
  }

  recordMetric(endpoint, data) {
    if (!this.metrics[endpoint]) {
      this.metrics[endpoint] = [];
    }
    
    this.metrics[endpoint].push(data);
    
    // Keep only last 100 metrics per endpoint
    if (this.metrics[endpoint].length > 100) {
      this.metrics[endpoint] = this.metrics[endpoint].slice(-100);
    }
    
    // Update response time tracking
    if (data.success) {
      this.metrics.responseTime.push(data.responseTime);
      if (this.metrics.responseTime.length > 1000) {
        this.metrics.responseTime = this.metrics.responseTime.slice(-1000);
      }
    }
  }

  evaluateAlerts() {
    const now = Date.now();
    const recentMetrics = this.getRecentMetrics(300000); // Last 5 minutes
    
    // Check downtime
    const consecutiveFailures = this.getConsecutiveFailures();
    if (consecutiveFailures * this.config.healthCheck.interval > this.config.alerts.downtime.threshold) {
      this.triggerAlert('downtime', `Application has been down for ${consecutiveFailures} consecutive checks`);
    }
    
    // Check error rate
    if (recentMetrics.length > 0) {
      const errorRate = recentMetrics.filter(m => !m.success).length / recentMetrics.length;
      if (errorRate > this.config.alerts.errorRate.threshold) {
        this.triggerAlert('error_rate', `Error rate is ${(errorRate * 100).toFixed(1)}%`);
      }
    }
    
    // Check response time
    const avgResponseTime = this.getAverageResponseTime();
    if (avgResponseTime > this.config.alerts.responseTime.threshold) {
      this.triggerAlert('response_time', `Average response time is ${avgResponseTime}ms`);
    }
  }

  getRecentMetrics(timeWindow) {
    const cutoff = Date.now() - timeWindow;
    const allMetrics = [];
    
    for (const endpoint in this.metrics) {
      if (Array.isArray(this.metrics[endpoint])) {
        allMetrics.push(...this.metrics[endpoint].filter(m => m.timestamp > cutoff));
      }
    }
    
    return allMetrics;
  }

  getConsecutiveFailures() {
    let failures = 0;
    
    for (const endpoint of this.config.healthCheck.endpoints) {
      const metrics = this.metrics[`http://localhost:5000${endpoint}`] || [];
      const recent = metrics.slice(-5); // Last 5 checks
      
      for (let i = recent.length - 1; i >= 0; i--) {
        if (!recent[i].success) {
          failures++;
        } else {
          break;
        }
      }
    }
    
    return failures;
  }

  getAverageResponseTime() {
    if (this.metrics.responseTime.length === 0) return 0;
    
    const recent = this.metrics.responseTime.slice(-20); // Last 20 measurements
    return recent.reduce((sum, time) => sum + time, 0) / recent.length;
  }

  async triggerAlert(type, message) {
    const alert = {
      type,
      message,
      timestamp: new Date(),
      severity: this.getAlertSeverity(type)
    };
    
    this.metrics.alerts.push(alert);
    
    console.log(`🚨 ALERT [${alert.severity}]: ${message}`);
    
    // Send notifications
    await this.sendNotifications(alert);
  }

  getAlertSeverity(type) {
    const severityMap = {
      downtime: 'CRITICAL',
      error_rate: 'HIGH',
      response_time: 'MEDIUM',
      database: 'HIGH'
    };
    
    return severityMap[type] || 'LOW';
  }

  async sendNotifications(alert) {
    // Slack notification
    if (this.config.notifications.slack) {
      await this.sendSlackAlert(alert);
    }
    
    // Email notification for critical alerts
    if (alert.severity === 'CRITICAL' && this.config.notifications.email) {
      await this.sendEmailAlert(alert);
    }
  }

  async sendSlackAlert(alert) {
    try {
      const payload = {
        text: `🚨 Orient Medical ERP Alert`,
        attachments: [{
          color: alert.severity === 'CRITICAL' ? 'danger' : 'warning',
          fields: [
            { title: 'Type', value: alert.type, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Message', value: alert.message, short: false },
            { title: 'Time', value: alert.timestamp.toISOString(), short: true }
          ]
        }]
      };

      await fetch(this.config.notifications.slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
    } catch (error) {
      console.error('Failed to send Slack notification:', error.message);
    }
  }

  async sendEmailAlert(alert) {
    // Email implementation would go here
    console.log(`📧 Email alert would be sent: ${alert.message}`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.metrics.lastCheck,
      uptime: this.calculateUptime(),
      errorCount: this.metrics.errorCount,
      averageResponseTime: this.getAverageResponseTime(),
      recentAlerts: this.metrics.alerts.slice(-10)
    };
  }

  calculateUptime() {
    const totalChecks = Object.values(this.metrics)
      .filter(Array.isArray)
      .reduce((sum, metrics) => sum + metrics.length, 0);
    
    if (totalChecks === 0) return 100;
    
    const successfulChecks = Object.values(this.metrics)
      .filter(Array.isArray)
      .reduce((sum, metrics) => sum + metrics.filter(m => m.success).length, 0);
    
    return (successfulChecks / totalChecks) * 100;
  }

  stopMonitoring() {
    this.isRunning = false;
    console.log('🛑 Monitoring service stopped');
  }
}

// Initialize and start monitoring if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitoring = new MonitoringService(MONITORING_CONFIG);
  
  process.on('SIGINT', () => {
    monitoring.stopMonitoring();
    process.exit(0);
  });
  
  monitoring.startMonitoring();
}

export { MonitoringService, MONITORING_CONFIG };