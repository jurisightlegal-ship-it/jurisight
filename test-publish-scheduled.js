#!/usr/bin/env node

/**
 * Test script for scheduled publishing functionality
 * 
 * This script tests the publish-scheduled API endpoint to ensure it's working correctly.
 */

const https = require('https');
const http = require('http');

const API_URL = process.env.APP_URL || 'http://localhost:3000';
const ENDPOINT = '/api/publish-scheduled';

async function testPublishScheduled() {
  console.log('🧪 Testing Publish Scheduled API...\n');

  // Test 1: GET endpoint (read-only check)
  console.log('1️⃣ Testing GET endpoint (read-only check)...');
  await testEndpoint('GET');

  // Test 2: POST endpoint (actual publishing)
  console.log('\n2️⃣ Testing POST endpoint (actual publishing)...');
  await testEndpoint('POST');
}

async function testEndpoint(method) {
  const url = `${API_URL}${ENDPOINT}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-secret-api-key' // Using default API key for testing
    },
    timeout: 10000
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
            console.log(`✅ ${method} Success:`, result.message);
            if (result.publishedCount !== undefined) {
              console.log(`📊 Published count: ${result.publishedCount}`);
            }
            if (result.readyToPublish !== undefined) {
              console.log(`📊 Ready to publish: ${result.readyToPublish}`);
            }
            if (result.articles && result.articles.length > 0) {
              console.log(`📰 Articles:`, result.articles.map(a => `"${a.title}" (${a.slug})`));
            }
            resolve(result);
          } else {
            console.error(`❌ ${method} Error ${res.statusCode}:`, result.error || 'Unknown error');
            reject(new Error(`HTTP ${res.statusCode}: ${result.error || 'Unknown error'}`));
          }
        } catch (parseError) {
          console.error(`❌ ${method} Failed to parse response:`, parseError);
          console.error('Raw response:', data);
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ ${method} Request failed:`, error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`❌ ${method} Request timeout`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run the test
if (require.main === module) {
  testPublishScheduled()
    .then(() => {
      console.log('\n🎉 All tests completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testPublishScheduled };
