#!/usr/bin/env node

import axios from 'axios';

console.log('🧪 Testing Login Endpoint Fix\n');

const API_GATEWAY_URL = 'http://localhost:4000';
const testCases = [
  {
    url: `${API_GATEWAY_URL}/v1/agency/auth/login?lang=en`,
    data: {
      username: 'testuser',
      password: 'testpass'
    },
    description: 'Login with English (lang=en query param)'
  },
  {
    url: `${API_GATEWAY_URL}/v1/agency/auth/login?lang=fr`,
    data: {
      username: 'testuser',
      password: 'testpass'
    },
    description: 'Login with French (lang=fr query param)',
    headers: {}
  },
  {
    url: `${API_GATEWAY_URL}/v1/agency/auth/login`,
    data: {
      username: 'testuser',
      password: 'testpass'
    },
    description: 'Login with default language',
    headers: { 'x-language': 'rw' }
  }
];

for (const testCase of testCases) {
  console.log(`📝 Test: ${testCase.description}`);
  console.log(`   URL: ${testCase.url}`);
  
  try {
    const response = await axios.post(testCase.url, testCase.data, {
      headers: {
        'Content-Type': 'application/json',
        ...testCase.headers
      },
      validateStatus: () => true // Don't throw on any status
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 500) {
      console.log('   ❌ FAILED - Got 500 error');
    } else if (response.status === 400 || response.status === 401) {
      console.log('   ✅ PASSED - Got expected error (invalid credentials)');
    } else {
      console.log('   ⚠️  Unexpected status');
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('');
}

console.log('✅ Test suite complete');
