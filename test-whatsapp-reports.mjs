/**
 * Test script for WhatsApp Transaction Reports
 * Run this to test the reports functionality
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:4001';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.yellow}${msg}${colors.reset}\n`)
};

async function testReports() {
  try {
    log.section('📊 Testing Transaction Reports System');

    // Test 1: Get Hourly Stats
    log.info('Test 1: Fetching hourly statistics...');
    try {
      const hourlyStats = await axios.get(`${BASE_URL}/api/reports/stats/hourly`);
      log.success('Hourly stats retrieved successfully');
      console.log(JSON.stringify(hourlyStats.data, null, 2));
    } catch (error) {
      log.error(`Hourly stats failed: ${error.message}`);
    }

    // Test 2: Get Daily Stats
    log.info('\nTest 2: Fetching daily statistics...');
    try {
      const dailyStats = await axios.get(`${BASE_URL}/api/reports/stats/daily`);
      log.success('Daily stats retrieved successfully');
      console.log(JSON.stringify(dailyStats.data, null, 2));
    } catch (error) {
      log.error(`Daily stats failed: ${error.message}`);
    }

    // Test 3: Preview Hourly Report
    log.section('📱 Test 3: Preview WhatsApp Messages');
    try {
      const preview = await axios.get(`${BASE_URL}/api/reports/preview/hourly`);
      log.success('Hourly report preview retrieved');
      console.log('\n--- WhatsApp Message Preview ---');
      console.log(preview.data.data.statsReport);
      console.log('\n--- Failed Transactions Message ---');
      console.log(preview.data.data.failedReport);
    } catch (error) {
      log.error(`Preview failed: ${error.message}`);
    }

    // Test 4: Preview Daily Report
    log.info('\nTest 4: Preview daily report...');
    try {
      const preview = await axios.get(`${BASE_URL}/api/reports/preview/daily`);
      log.success('Daily report preview retrieved');
      console.log('\n--- Daily WhatsApp Message Preview ---');
      console.log(preview.data.data.statsReport);
    } catch (error) {
      log.error(`Daily preview failed: ${error.message}`);
    }

    // Test 5: Get Failed Transactions
    log.section('❌ Test 5: Fetching Failed Transactions');
    try {
      const failedHourly = await axios.get(`${BASE_URL}/api/reports/failed/hourly?limit=5`);
      log.success(`Found ${failedHourly.data.data.count} failed transactions (hourly)`);
      if (failedHourly.data.data.count > 0) {
        console.log(JSON.stringify(failedHourly.data.data.transactions.slice(0, 3), null, 2));
      }
    } catch (error) {
      log.error(`Failed transactions fetch failed: ${error.message}`);
    }

    // Test 6: Manual Send (CAUTION: This will actually send WhatsApp message if configured)
    log.section('🚨 Test 6: Manual Report Send (Optional)');
    log.info('To test actual WhatsApp sending, uncomment the code below');
    log.info('Make sure COMPANY_WHATSAPP_NUMBER is configured in .env');
    
    /*
    // UNCOMMENT TO TEST ACTUAL WHATSAPP SENDING
    try {
      const sendResult = await axios.post(`${BASE_URL}/api/reports/send/manual`, {
        type: 'hourly'
      });
      log.success('Manual report sent successfully');
      console.log(sendResult.data);
    } catch (error) {
      log.error(`Manual send failed: ${error.message}`);
    }
    */

    // Summary
    log.section('✅ Test Summary');
    log.success('All tests completed!');
    log.info('Check the console output above for results');
    log.info('If you see "WhatsApp not configured" warnings, that\'s normal for development');
    log.info('To enable WhatsApp, configure .env with your WhatsApp API credentials');

  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
  }
}

// Run tests
console.log(`${colors.bright}${colors.cyan}Starting WhatsApp Reports Test Suite...${colors.reset}\n`);
log.info('Make sure the agency-service is running on port 4001');
log.info('Starting tests in 2 seconds...\n');

setTimeout(() => {
  testReports().then(() => {
    console.log(`\n${colors.bright}${colors.green}Test suite finished!${colors.reset}\n`);
  }).catch(error => {
    console.error(`\n${colors.red}Test suite error:${colors.reset}`, error);
  });
}, 2000);
