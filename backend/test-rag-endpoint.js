#!/usr/bin/env node
/**
 * Test script for /api/ask RAG forwarding endpoint
 *
 * Usage:
 *   node test-rag-endpoint.js
 *
 * Make sure the backend server is running on port 5001
 * and the RAG backend is running on port 8000
 */

const axios = require('axios');

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:5001';

async function testAskEndpoint() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Testing /api/ask RAG Forwarding Endpoint');
  console.log('='.repeat(60) + '\n');

  const tests = [
    {
      name: 'Test with "question" field',
      payload: { question: 'What is melanoma?' },
    },
    {
      name: 'Test with "message" field',
      payload: { message: 'Tell me about skin cancer' },
    },
    {
      name: 'Test with "query" field',
      payload: { query: 'What are the symptoms of basal cell carcinoma?' },
    },
    {
      name: 'Test with empty question (should fail)',
      payload: { question: '' },
      shouldFail: true,
    },
    {
      name: 'Test with missing field (should fail)',
      payload: {},
      shouldFail: true,
    },
  ];

  for (const test of tests) {
    console.log(`📝 ${test.name}`);
    console.log(`   Payload: ${JSON.stringify(test.payload)}`);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/ask`,
        test.payload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 35000,
        }
      );

      if (test.shouldFail) {
        console.log(`   ❌ UNEXPECTED: Request should have failed but succeeded`);
        console.log(`   Response: ${JSON.stringify(response.data)}\n`);
      } else {
        console.log(`   ✅ SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}\n`);
      }
    } catch (error) {
      if (test.shouldFail) {
        console.log(`   ✅ EXPECTED FAILURE`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${JSON.stringify(error.response.data)}\n`);
        } else {
          console.log(`   Error: ${error.message}\n`);
        }
      } else {
        console.log(`   ❌ FAILED`);
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${JSON.stringify(error.response.data)}\n`);
        } else {
          console.log(`   Error: ${error.message}\n`);
        }
      }
    }
  }

  console.log('='.repeat(60));
  console.log('✨ Test suite completed');
  console.log('='.repeat(60) + '\n');
}

// Run tests
testAskEndpoint().catch(error => {
  console.error('❌ Test suite error:', error.message);
  process.exit(1);
});
