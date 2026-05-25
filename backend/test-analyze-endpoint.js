/**
 * Test Script for Photo Analysis Endpoint
 *
 * This script tests the /api/analyze-photo endpoint
 *
 * Usage:
 *   node test-analyze-endpoint.js
 *
 * Prerequisites:
 *   - Backend server running on port 5001
 *   - Valid JWT token (or test without auth for local testing)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = process.env.API_URL || 'http://localhost:5001';
const JWT_TOKEN = process.env.TEST_JWT_TOKEN || null;

console.log('\n' + '='.repeat(60));
console.log('🧪 TESTING PHOTO ANALYSIS ENDPOINT');
console.log('='.repeat(60) + '\n');

// Helper function to create test image buffer
function createTestImageBuffer() {
  // Create a simple 100x100 pixel PNG buffer for testing
  // This is a minimal valid PNG file
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64, // width: 100, height: 100
    0x08, 0x02, 0x00, 0x00, 0x00, 0xFF, 0x80, 0x02, 0x03,
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0x1D, 0x01, 0x01, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x02, 0x00, 0x01,
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
    0xAE, 0x42, 0x60, 0x82
  ]);
  return png;
}

// Test 1: Health Check
async function testHealthCheck() {
  console.log('📋 Test 1: Health Check');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Stats Endpoint (without auth - will fail if auth required)
async function testStatsEndpoint() {
  console.log('\n📋 Test 2: Stats Endpoint');
  try {
    const headers = JWT_TOKEN ? { Authorization: `Bearer ${JWT_TOKEN}` } : {};
    const response = await axios.get(`${BASE_URL}/api/analyze-photo/stats`, { headers });
    console.log('✅ Stats endpoint response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️  Stats endpoint requires authentication (expected)');
      console.log('   Set TEST_JWT_TOKEN environment variable to test with auth');
    } else {
      console.error('❌ Stats endpoint failed:', error.message);
    }
    return false;
  }
}

// Test 3: Analyze Photo Endpoint (Mock Mode)
async function testAnalyzeEndpoint() {
  console.log('\n📋 Test 3: Analyze Photo Endpoint');

  try {
    const form = new FormData();

    // Add test images
    const testImage = createTestImageBuffer();
    form.append('photos', testImage, {
      filename: 'test-lesion-1.png',
      contentType: 'image/png'
    });

    // Add session data
    const sessionData = {
      age: 35,
      gender: 'male',
      region: 'asia',
      skinTone: 'medium',
      bodyArea: 'arm'
    };
    form.append('sessionData', JSON.stringify(sessionData));

    // Prepare headers
    const headers = {
      ...form.getHeaders()
    };

    if (JWT_TOKEN) {
      headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }

    console.log('📤 Sending analysis request...');
    console.log('   Images: 1');
    console.log('   Session data:', sessionData);

    const response = await axios.post(
      `${BASE_URL}/api/analyze-photo`,
      form,
      { headers }
    );

    console.log('✅ Analysis completed successfully!');
    console.log('\n📊 Analysis Results:');
    console.log('─'.repeat(60));
    console.log(`Analysis ID: ${response.data.analysisId}`);
    console.log(`Timestamp: ${response.data.timestamp}`);
    console.log(`Photo Count: ${response.data.photoCount}`);
    console.log('\n🔬 Clinical Analysis:');
    console.log(`  Condition: ${response.data.analysis.condition}`);
    console.log(`  Severity: ${response.data.analysis.severity}`);
    console.log(`  Confidence: ${(response.data.analysis.confidence * 100).toFixed(1)}%`);
    console.log(`  Risk Level: ${response.data.analysis.riskLevel}`);
    console.log('\n📝 Observations:');
    response.data.analysis.observations.forEach((obs, idx) => {
      console.log(`  ${idx + 1}. ${obs}`);
    });
    console.log('\n💡 Suggestions:');
    response.data.suggestions.forEach((sug, idx) => {
      console.log(`  ${idx + 1}. ${sug}`);
    });
    console.log('\n🤖 Model Status:');
    console.log(`  Version: ${response.data.metadata.modelStatus}`);
    console.log(`  Processing Time: ${response.data.metadata.processingTime}ms`);
    console.log('─'.repeat(60));

    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('⚠️  Analysis endpoint requires authentication');
      console.log('   Set TEST_JWT_TOKEN environment variable to test with auth');
      console.log('   Or temporarily disable auth in routes/analyze.js for testing');
    } else if (error.response) {
      console.error('❌ Analysis failed:', error.response.data);
    } else {
      console.error('❌ Analysis failed:', error.message);
    }
    return false;
  }
}

// Test 4: Multi-image Analysis
async function testMultiImageAnalysis() {
  console.log('\n📋 Test 4: Multi-Image Analysis');

  if (!JWT_TOKEN) {
    console.log('⏭️  Skipped (requires JWT token)');
    return false;
  }

  try {
    const form = new FormData();

    // Add multiple test images
    const testImage1 = createTestImageBuffer();
    const testImage2 = createTestImageBuffer();
    const testImage3 = createTestImageBuffer();

    form.append('photos', testImage1, {
      filename: 'test-lesion-1.png',
      contentType: 'image/png'
    });
    form.append('photos', testImage2, {
      filename: 'test-lesion-2.png',
      contentType: 'image/png'
    });
    form.append('photos', testImage3, {
      filename: 'test-lesion-3.png',
      contentType: 'image/png'
    });

    // Add session data
    const sessionData = {
      age: 42,
      gender: 'female',
      region: 'europe',
      skinTone: 'fair',
      bodyArea: 'back'
    };
    form.append('sessionData', JSON.stringify(sessionData));

    const headers = {
      ...form.getHeaders(),
      'Authorization': `Bearer ${JWT_TOKEN}`
    };

    console.log('📤 Sending multi-image analysis request...');
    console.log('   Images: 3');

    const response = await axios.post(
      `${BASE_URL}/api/analyze-photo`,
      form,
      { headers }
    );

    console.log(`✅ Multi-image analysis completed!`);
    console.log(`   Condition: ${response.data.analysis.condition}`);
    console.log(`   Confidence: ${(response.data.analysis.confidence * 100).toFixed(1)}%`);
    console.log(`   Risk Level: ${response.data.analysis.riskLevel}`);

    return true;
  } catch (error) {
    console.error('❌ Multi-image analysis failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 5: Error Handling - No Photos
async function testErrorHandlingNoPhotos() {
  console.log('\n📋 Test 5: Error Handling - No Photos');

  try {
    const form = new FormData();

    const sessionData = {
      age: 30,
      gender: 'male',
      region: 'asia',
      skinTone: 'medium',
      bodyArea: 'arm'
    };
    form.append('sessionData', JSON.stringify(sessionData));

    const headers = form.getHeaders();
    if (JWT_TOKEN) {
      headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }

    const response = await axios.post(
      `${BASE_URL}/api/analyze-photo`,
      form,
      { headers }
    );

    console.log('❌ Should have returned error for no photos');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected request with no photos');
      console.log(`   Error: ${error.response.data.error}`);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Test 6: Error Handling - Missing Session Data
async function testErrorHandlingMissingData() {
  console.log('\n📋 Test 6: Error Handling - Missing Session Data');

  try {
    const form = new FormData();

    const testImage = createTestImageBuffer();
    form.append('photos', testImage, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    // Missing session data
    form.append('sessionData', JSON.stringify({
      age: 30
      // Missing other required fields
    }));

    const headers = form.getHeaders();
    if (JWT_TOKEN) {
      headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
    }

    const response = await axios.post(
      `${BASE_URL}/api/analyze-photo`,
      form,
      { headers }
    );

    console.log('❌ Should have returned error for incomplete session data');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected request with incomplete data');
      console.log(`   Error: ${error.response.data.error}`);
      return true;
    } else {
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting tests...\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Run tests sequentially
  if (await testHealthCheck()) results.passed++; else results.failed++;
  if (await testStatsEndpoint()) results.passed++; else results.skipped++;
  if (await testAnalyzeEndpoint()) results.passed++; else results.failed++;
  if (await testMultiImageAnalysis()) results.passed++; else results.skipped++;
  if (await testErrorHandlingNoPhotos()) results.passed++; else results.failed++;
  if (await testErrorHandlingMissingData()) results.passed++; else results.failed++;

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0 && results.passed > 0) {
    console.log('🎉 All tests passed!\n');
    process.exit(0);
  } else if (results.failed > 0) {
    console.log('⚠️  Some tests failed. Check the logs above.\n');
    process.exit(1);
  } else {
    console.log('ℹ️  Most tests require authentication. Set TEST_JWT_TOKEN to run all tests.\n');
    process.exit(0);
  }
}

// Check if FormData is available
try {
  require.resolve('form-data');
} catch (e) {
  console.error('❌ form-data package not found. Installing...');
  console.error('Run: npm install form-data');
  process.exit(1);
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
