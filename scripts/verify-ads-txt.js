#!/usr/bin/env node

/**
 * Ads.txt Verification Script
 * Tests the ads.txt file for Google AdSense compliance
 */

const https = require('https');
const http = require('http');

const PUBLISHER_ID = 'pub-5234388962916973';
const EXPECTED_GOOGLE_ID = 'f08c47fec0942fa0';

function testAdsTxt(domain) {
  return new Promise((resolve, reject) => {
    const protocol = domain.includes('localhost') ? http : https;
    const url = `${domain.includes('http') ? '' : 'https://'}${domain}/ads.txt`;
    
    console.log(`Testing ads.txt at: ${url}`);
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\nResponse Status: ${res.statusCode}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);
        console.log(`Content Length: ${res.headers['content-length'] || data.length} bytes`);
        
        if (res.statusCode === 200) {
          console.log('\nAds.txt Content:');
          console.log('─'.repeat(50));
          console.log(data);
          console.log('─'.repeat(50));
          
          // Validate content
          validateAdsTxtContent(data);
          resolve({ success: true, content: data, statusCode: res.statusCode });
        } else {
          console.log(`❌ Error: HTTP ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.log(`❌ Network Error: ${err.message}`);
      reject(err);
    });
  });
}

function validateAdsTxtContent(content) {
  console.log('\n🔍 Validating ads.txt content...');
  
  const lines = content.trim().split('\n');
  let isValid = false;
  let hasGoogleEntry = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) {
      continue;
    }
    
    // Parse ads.txt line format: domain, publisher_id, relationship, certification_authority_id
    const parts = line.split(',');
    
    if (parts.length >= 3) {
      const domain = parts[0].trim();
      const publisherId = parts[1].trim();
      const relationship = parts[2].trim();
      const certId = parts[3] ? parts[3].trim() : '';
      
      console.log(`Line ${i + 1}: ${domain} | ${publisherId} | ${relationship} | ${certId}`);
      
      // Check for Google entry
      if (domain === 'google.com' && publisherId === PUBLISHER_ID) {
        hasGoogleEntry = true;
        isValid = true;
        
        if (relationship === 'DIRECT' && certId === EXPECTED_GOOGLE_ID) {
          console.log('✅ Valid Google AdSense entry found!');
        } else {
          console.log('⚠️  Google entry found but relationship/cert ID may be incorrect');
        }
      }
    } else {
      console.log(`⚠️  Invalid line format: ${line}`);
    }
  }
  
  if (!hasGoogleEntry) {
    console.log('❌ No Google AdSense entry found');
  }
  
  return isValid;
}

async function main() {
  console.log('🚀 Ads.txt Verification Tool');
  console.log('='.repeat(50));
  console.log(`Publisher ID: ${PUBLISHER_ID}`);
  console.log(`Expected Google ID: ${EXPECTED_GOOGLE_ID}`);
  console.log('='.repeat(50));
  
  const domains = [
    'jurisight.in',
    'www.jurisight.in',
    'localhost:3000' // For local testing
  ];
  
  for (const domain of domains) {
    try {
      console.log(`\n🌐 Testing domain: ${domain}`);
      await testAdsTxt(domain);
    } catch (error) {
      console.log(`❌ Failed to test ${domain}: ${error.message}`);
    }
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Deploy your website with the ads.txt file');
  console.log('2. Verify ads.txt is accessible at https://jurisight.in/ads.txt');
  console.log('3. Submit your site for AdSense approval');
  console.log('4. Monitor AdSense dashboard for ads.txt status');
}

// Run the verification
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAdsTxt, validateAdsTxtContent };
