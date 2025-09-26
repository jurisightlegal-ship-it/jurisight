#!/usr/bin/env node

/**
 * Simple Cron Scheduler for Scheduled Posts
 * 
 * This script runs the publish-scheduled script every 5 minutes.
 * Perfect for development and simple deployments.
 * 
 * Usage: node start-cron.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting scheduled posts cron job...');
console.log('⏰ Will check for scheduled posts every 5 minutes');
console.log('🛑 Press Ctrl+C to stop');

// Run the publish-scheduled script every 5 minutes
const interval = setInterval(() => {
  console.log(`\n[${new Date().toISOString()}] Running scheduled posts check...`);
  
  const scriptPath = path.join(__dirname, 'scripts', 'publish-scheduled.js');
  const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    cwd: __dirname
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Scheduled posts check completed successfully');
    } else {
      console.log(`❌ Scheduled posts check failed with code ${code}`);
    }
  });

  child.on('error', (error) => {
    console.error('❌ Error running scheduled posts check:', error);
  });
}, 5 * 60 * 1000); // 5 minutes

// Run immediately on start
console.log('\n[STARTUP] Running initial scheduled posts check...');
const initialScript = spawn('node', [path.join(__dirname, 'scripts', 'publish-scheduled.js')], {
  stdio: 'inherit',
  cwd: __dirname
});

initialScript.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Initial scheduled posts check completed');
  } else {
    console.log(`❌ Initial scheduled posts check failed with code ${code}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping cron job...');
  clearInterval(interval);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping cron job...');
  clearInterval(interval);
  process.exit(0);
});
