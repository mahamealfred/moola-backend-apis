#!/usr/bin/env node

/**
 * Test script to verify bill-payment endpoint fix
 * Tests:
 * 1. Missing token - should return 401
 * 2. Malformed token - should return 401
 * 3. Valid token but missing fields - should return 400
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3003';
const endpoint = '/thirdpartyagency/services/execute/bill-payment';

const tests = [
    {
        name: 'Missing Authorization Token',
        config: {
            method: 'POST',
            url: `${BASE_URL}${endpoint}`,
            data: {
                email: 'test@example.com',
                customerId: '123456',
                billerCode: 'RRA',
                productCode: 'RRA',
                amount: 10000,
                ccy: 'RWF',
                requestId: 'req_001',
                clientPhone: '+250700000000'
            }
        },
        expectedStatus: 401,
        expectedMessage: 'Missing authorization token'
    },
    {
        name: 'Malformed JWT Token',
        config: {
            method: 'POST',
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Authorization': 'Bearer malformed.jwt.token'
            },
            data: {
                email: 'test@example.com',
                customerId: '123456',
                billerCode: 'RRA',
                productCode: 'RRA',
                amount: 10000,
                ccy: 'RWF',
                requestId: 'req_001',
                clientPhone: '+250700000000'
            }
        },
        expectedStatus: 401,
        expectedMessage: 'Invalid or malformed token'
    },
    {
        name: 'Missing Required Fields',
        config: {
            method: 'POST',
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Authorization': 'Bearer valid.token.here'
            },
            data: {
                // Missing required fields
            }
        },
        expectedStatus: 400,
        expectedMessage: 'Missing required fields'
    }
];

async function runTests() {
    console.log('\n🧪 Testing Bill Payment Endpoint Fix...\n');
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            console.log(`📝 Test: ${test.name}`);
            
            try {
                await axios.request(test.config);
                console.log(`  ❌ FAILED: Expected status ${test.expectedStatus} but request succeeded`);
                failed++;
            } catch (error) {
                const status = error.response?.status;
                const message = error.response?.data?.message || '';

                if (status === test.expectedStatus && message.toLowerCase().includes(test.expectedMessage.toLowerCase())) {
                    console.log(`  ✅ PASSED: Status ${status}, Message contains "${test.expectedMessage}"`);
                    passed++;
                } else {
                    console.log(`  ❌ FAILED: Expected status ${test.expectedStatus} and message "${test.expectedMessage}"`);
                    console.log(`     Got status ${status}, message: "${message}"`);
                    failed++;
                }
            }
        } catch (error) {
            console.log(`  ⚠️  ERROR: ${error.message}`);
            failed++;
        }
        console.log();
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
    process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
