#!/usr/bin/env node

/**
 * Test runner for Zephyr Scale MCP Server
 * Runs both unit tests and integration tests
 */

const ZephyrServerTest = require('./zephyr-server.test.cjs');
const ZephyrIntegrationTest = require('./integration.test.cjs');

async function runAllTests() {
  console.log('🧪 Zephyr Scale MCP Server - Complete Test Suite');
  console.log('=' .repeat(70));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('=' .repeat(70));

  let allTestsPassed = true;

  try {
    // Run unit tests
    console.log('\n📋 PHASE 1: Unit Tests');
    console.log('-' .repeat(40));
    const unitTests = new ZephyrServerTest();
    const unitTestsPassed = await unitTests.runAllTests();
    
    if (!unitTestsPassed) {
      allTestsPassed = false;
      console.log('\n❌ Unit tests failed - skipping integration tests');
    } else {
      // Run integration tests only if unit tests pass
      console.log('\n🔗 PHASE 2: Integration Tests');
      console.log('-' .repeat(40));
      const integrationTests = new ZephyrIntegrationTest();
      const integrationTestsPassed = await integrationTests.runIntegrationTests();
      
      if (!integrationTestsPassed) {
        allTestsPassed = false;
      }
    }

  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    allTestsPassed = false;
  }

  // Final summary
  console.log('\n' + '=' .repeat(70));
  console.log('🏁 FINAL TEST RESULTS');
  console.log('=' .repeat(70));
  
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! The Zephyr Scale MCP Server is ready for use.');
    console.log('\n✅ Build Status: SUCCESS');
    console.log('✅ Unit Tests: PASSED');
    console.log('✅ Integration Tests: PASSED');
    console.log('\n🚀 Server is ready for deployment and use with MCP clients.');
  } else {
    console.log('❌ SOME TESTS FAILED! Please review the errors above.');
    console.log('\n❌ Test Status: FAILED');
    console.log('\n🔧 Please fix the failing tests before using the server.');
  }

  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  console.log('=' .repeat(70));

  return allTestsPassed;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
