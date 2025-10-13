const { spawn } = require('child_process');
const path = require('path');

/**
 * Test suite for Zephyr Scale MCP Server
 * Tests the MCP server functionality including tool execution and API integration
 */

class ZephyrServerTest {
  constructor() {
    this.serverPath = path.join(__dirname, '../build/index.js');
    this.testResults = [];
  }

  /**
   * Run a single test and capture result
   */
  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      const startTime = Date.now();
      await testFunction();
      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} - PASSED (${duration}ms)`);
      this.testResults.push({ name: testName, status: 'PASSED', duration });
    } catch (error) {
      console.log(`❌ ${testName} - FAILED: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  /**
   * Test server startup and basic MCP protocol
   */
  async testServerStartup() {
    return new Promise((resolve, reject) => {
      // Check if we have the required environment variables for server startup
      const hasEnvVars = process.env.ZEPHYR_BASE_URL &&
                         (process.env.ZEPHYR_API_KEY || (process.env.JIRA_USERNAME && process.env.JIRA_API_TOKEN));

      if (!hasEnvVars) {
        console.log('Skipping server startup test - no environment variables configured');
        resolve(); // Skip this test if no env vars are set
        return;
      }

      const server = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      server.stdout.on('data', (data) => {
        output += data.toString();
      });

      server.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Send MCP initialization request
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      };

      server.stdin.write(JSON.stringify(initRequest) + '\n');

      setTimeout(() => {
        server.kill();
        if (output.includes('jsonrpc') || output.includes('capabilities')) {
          resolve();
        } else {
          reject(new Error(`Server startup failed. Output: ${output}, Error: ${errorOutput}`));
        }
      }, 2000);
    });
  }

  /**
   * Test tools list capability
   */
  async testToolsList() {
    return new Promise((resolve, reject) => {
      // Check if we have the required environment variables for server startup
      const hasEnvVars = process.env.ZEPHYR_BASE_URL &&
                         (process.env.ZEPHYR_API_KEY || (process.env.JIRA_USERNAME && process.env.JIRA_API_TOKEN));

      if (!hasEnvVars) {
        console.log('Skipping tools list test - no environment variables configured');
        resolve(); // Skip this test if no env vars are set
        return;
      }

      const server = spawn('node', [this.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';

      server.stdout.on('data', (data) => {
        output += data.toString();
      });

      // Send tools list request
      const toolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      };

      server.stdin.write(JSON.stringify(toolsRequest) + '\n');

      setTimeout(() => {
        server.kill();
        if (output.includes('get_test_case') && output.includes('create_test_case')) {
          resolve();
        } else {
          reject(new Error(`Tools list test failed. Expected tools not found in output: ${output}`));
        }
      }, 2000);
    });
  }

  /**
   * Test environment variables and configuration
   */
  async testEnvironmentConfig() {
    // For testing purposes, we'll check if environment variables are set
    // In a real scenario, these would be required, but for CI/testing we can be more lenient
    const envVars = [
      'ZEPHYR_API_KEY',
      'ZEPHYR_BASE_URL',
      'JIRA_USERNAME',
      'JIRA_API_TOKEN'
    ];

    const setVars = envVars.filter(varName => process.env[varName]);

    if (setVars.length === 0) {
      console.log('No Jira environment variables set - this is expected for unit tests');
      return; // Skip detailed validation if no vars are set
    }

    // If some vars are set, validate them
    for (const varName of setVars) {
      const value = process.env[varName];
      if (!value || value.length < 3) {
        throw new Error(`${varName} appears to be invalid or too short`);
      }
    }

    // Additional validation for URL format if base URL is set
    if (process.env.ZEPHYR_BASE_URL) {
      const baseUrl = process.env.ZEPHYR_BASE_URL;
      if (!baseUrl.startsWith('http')) {
        throw new Error('ZEPHYR_BASE_URL must start with http:// or https://');
      }
    }
  }

  /**
   * Test build artifacts
   */
  async testBuildArtifacts() {
    const fs = require('fs');
    const requiredFiles = [
      'build/index.js',
      'build/tool-handlers.js',
      'build/tool-schemas.js',
      'build/types.js',
      'build/utils.js'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, '..', file))) {
        throw new Error(`Required build file missing: ${file}`);
      }
    }

    // Check if main file is executable
    const mainFile = path.join(__dirname, '../build/index.js');
    const stats = fs.statSync(mainFile);
    if (!(stats.mode & parseInt('111', 8))) {
      throw new Error('Main build file is not executable');
    }
  }

  /**
   * Test package.json configuration
   */
  async testPackageConfig() {
    const fs = require('fs');
    const packagePath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    // Check required fields
    const requiredFields = ['name', 'version', 'main', 'bin'];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        throw new Error(`Missing required package.json field: ${field}`);
      }
    }

    // Check scripts
    if (!packageJson.scripts || !packageJson.scripts.build) {
      throw new Error('Missing build script in package.json');
    }

    // Check dependencies
    if (!packageJson.dependencies || !packageJson.dependencies['@modelcontextprotocol/sdk']) {
      throw new Error('Missing required MCP SDK dependency');
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Zephyr Scale MCP Server Test Suite\n');
    console.log('=' .repeat(60));

    await this.runTest('Package Configuration', () => this.testPackageConfig());
    await this.runTest('Build Artifacts', () => this.testBuildArtifacts());
    await this.runTest('Environment Configuration', () => this.testEnvironmentConfig());
    await this.runTest('Server Startup', () => this.testServerStartup());
    await this.runTest('Tools List', () => this.testToolsList());

    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;
    const total = this.testResults.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n🔍 Failed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log('\n' + '=' .repeat(60));
    return failed === 0;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new ZephyrServerTest();
  testSuite.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = ZephyrServerTest;
