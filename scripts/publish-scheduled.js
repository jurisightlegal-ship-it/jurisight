#!/usr/bin/env node

/**
 * Publish Scheduled Articles Script
 * 
 * This script checks for scheduled articles and publishes them automatically.
 * It should be run as a cron job every few minutes.
 * 
 * Usage:
 * 1. Set up a cron job: 0,5,10,15,20,25,30,35,40,45,50,55 * * * * node /path/to/scripts/publish-scheduled.js
 * 2. Or run manually: node scripts/publish-scheduled.js
 * 3. Or use a service like Vercel Cron, GitHub Actions, etc.
 */

const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

// Configuration
const API_URL = process.env.APP_URL || 'http://localhost:3000';
const API_KEY = process.env.CRON_API_KEY || 'your-secret-api-key';
const ENDPOINT = '/api/publish-scheduled';

async function publishScheduledArticles() {
  const url = `${API_URL}${ENDPOINT}`;
  
  console.log(`[${new Date().toISOString()}] Checking for scheduled articles...`);
  console.log(`API URL: ${url}`);
  console.log(`API Key: ${API_KEY.substring(0, 10)}...`);

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    timeout: 30000 // 30 seconds timeout
  };

  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log(`✅ Success: ${result.message}`);
            if (result.publishedCount > 0) {
              console.log(`📰 Published articles:`, result.articles.map(a => `"${a.title}" (${a.slug})`));
            }
            resolve(result);
          } else {
            console.error(`❌ Error ${res.statusCode}:`, result.error || 'Unknown error');
            reject(new Error(`HTTP ${res.statusCode}: ${result.error || 'Unknown error'}`));
          }
        } catch (parseError) {
          console.error('❌ Failed to parse response:', parseError);
          console.error('Raw response:', data);
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run the script
if (require.main === module) {
  publishScheduledArticles()
    .then((result) => {
      console.log(`[${new Date().toISOString()}] Script completed successfully`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(`[${new Date().toISOString()}] Script failed:`, error.message);
      process.exit(1);
    });
}

module.exports = { publishScheduledArticles };
