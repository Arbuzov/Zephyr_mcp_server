# Zephyr Scale MCP Server

Model Context Protocol server for Zephyr Scale test management. Create, read, and manage test cases through the Atlassian REST API with **official API-compliant schemas**. Access live test case data, example payloads, and file resources through a unified resource system.

## Features

✅ **Official API Structure** - Schemas match Zephyr Scale REST API v1  
✅ **Unified Test Creation** - Single `create_test_case` tool supports all script types  
✅ **Live Template System** - Fetch real test cases as templates via `zephyr://testcase/` resources  
✅ **Project-Specific Fields** - Automatically match your project's `customFields` structure  
✅ **Full Test Management** - Create, read, delete test cases and manage test runs  
✅ **Resource Access** - Access local files, live data, and built-in examples

## Quick Start

### New Unified API Structure
The latest version features a **unified `create_test_case` tool** that supports all test script types (STEP_BY_STEP, PLAIN_TEXT, and BDD) through a single, consistent interface. This matches the official Zephyr Scale REST API v1 structure exactly.

**Key Changes:**
- ✅ Single `create_test_case` tool replaces separate BDD tool
- ✅ All script types use the `test_script` object structure
- ✅ Consistent with official Zephyr Scale API documentation
- ✅ Simplified workflow - one tool for all test case types

### Option 1: Using npx (Recommended - No installation required)
Just configure your MCP client with the npx command below.

### Option 2: Install from npm
```bash
npm install -g zephyr-scale-mcp-server
```

## MCP Configuration

### Option 1: Using npx (Recommended - No installation required)
```json
{
  "mcpServers": {
    "zephyr-server": {
      "command": "npx",
      "args": ["zephyr-scale-mcp-server@latest"],
      "env": {
        "ZEPHYR_API_KEY": "your-api-token",
        "ZEPHYR_BASE_URL": "https://your-company.atlassian.net"
      }
    }
  }
}
```

### Option 2: Using global npm installation
First install the package globally:
```bash
npm install -g zephyr-scale-mcp-server
```

Then configure:
```json
{
  "mcpServers": {
    "zephyr-server": {
      "command": "zephyr-scale-mcp",
      "env": {
        "ZEPHYR_API_KEY": "your-api-token",
        "ZEPHYR_BASE_URL": "https://your-company.atlassian.net"
      }
    }
  }
}
```

## Resources

The MCP server provides access to various resources through URI schemes:

### Live Test Case Data
Fetch real test case data directly from your Zephyr Scale instance to use as templates:

```
zephyr://testcase/YOUR-TEST-CASE-KEY
```

**Examples:**
- `zephyr://testcase/PROJ-T123` - Get test case PROJ-T123
- `zephyr://testcase/CNIDS-T3388` - Get test case CNIDS-T3388

**Use Case: Template for New Test Cases**
1. Fetch an existing test case: `zephyr://testcase/PROJ-T123`
2. Copy its structure (especially `customFields` and `folder`)
3. Create new test cases with the same project-specific configuration

**Response format:**
```json
{
  "description": "Live test case data for PROJ-T123 retrieved from Zephyr Scale",
  "testCaseKey": "PROJ-T123", 
  "retrievedAt": "2025-07-09T12:00:00.000Z",
  "data": {
    "key": "PROJ-T123",
    "name": "User Authentication Test",
    "status": "Draft",
    "priority": "High",
    "projectKey": "PROJ",
    "folder": "/ProjectName/Authentication",
    "customFields": {
      "Type": "Functional",
      "Priority": "P2",
      "Regression": false,
      "Execution Type": "Manual - To Be Automated",
      "Risk Control": false
    },
    "testScript": {
      "type": "BDD", 
      "text": "    Given user navigates to login page\n    When user enters valid credentials\n    Then user should be logged in successfully"
    }
    // ... complete test case data matching your project structure
  }
}
```

### File System Access
Read user-provided files containing examples, payloads, or templates:

```
file:///absolute/path/to/your/file.json
```

### Example Payloads
Access built-in example payloads for creating test cases:

- `zephyr://examples/bdd-test-case-payload` - BDD test case creation example
- `zephyr://examples/step-by-step-payload` - Step-by-step test case creation example

### Error Handling
Resources provide clear error messages:
- **404 Not Found**: Test case doesn't exist in Zephyr Scale
- **403 Forbidden**: No permission to access the test case  
- **Network Issues**: Connection problems with Zephyr Scale
- **Invalid Format**: Malformed URIs or file paths

## Available Tools

### Test Case Management
- `get_test_case` - Get detailed information about a specific test case
- `create_test_case` - Create test cases with STEP_BY_STEP, PLAIN_TEXT, or BDD content (unified API)
- `delete_test_case` - Delete a specific test case

### Test Run Management
- `create_test_run` - Create a new test run
- `get_test_run` - Get detailed information about a specific test run
- `get_test_run_cases` - Get test case keys from a test run
- `add_test_cases_to_run` - Add test cases to an existing test run

### Test Execution & Search
- `get_test_execution` - Get detailed individual test execution results including step-by-step results, timestamps, comments, and attachments
- `search_test_cases_by_folder` - Search for test cases in a specific folder

### Organization
- `create_folder` - Create a new folder in Zephyr Scale

## Resource Use Cases

The resource system enables powerful workflows:

### 1. **Reference Real Data**
Use existing test cases as templates for creating new ones:
```
Request: zephyr://testcase/PROJ-T123
→ Get real test case structure
→ Use as template for new test cases
```

### 2. **Documentation & Analysis**
Include live test case data in documentation or compare test case structures across projects.

### 3. **Template Generation**
Access example payloads to understand the required format for API calls:
```
Request: zephyr://examples/bdd-test-case-payload
→ Get example BDD test case structure
→ Modify for your specific needs
```

### 4. **File-Based Workflows**
Store test case templates or examples in files and access them via the MCP:
```
Request: file:///Users/username/templates/login-test.json
→ Read your custom template file
→ Use in test case creation
```

## Using Resources in MCP Clients

### Method 1: Direct Chat Requests (Cline/Claude Dev)
Simply ask the AI assistant to access any resource:
```
"Please access the resource zephyr://testcase/PROJ-T123"
"Show me the BDD content from zephyr://testcase/PROJ-T123"
"Compare zephyr://testcase/PROJ-T123 with zephyr://testcase/PROJ-T456"
```

### Method 2: MCP Resource Panel (GUI)
1. **Locate MCP Server**: Find **zephyr-server** in your MCP servers panel
2. **Access Resources Tab**: Click on the **Resources** section
3. **Browse Available Resources**:
   - **Live Test Case Data**: `zephyr://testcase/TEST-KEY` template
   - **BDD Content Conversion Example**: `zephyr://examples/gherkin-conversion`
   - **Step-by-Step Payload Example**: `zephyr://examples/step-by-step-payload`
   - **File System Access**: `file://` for local files

### Method 3: Programmatic Access (API/SDK)
For developers integrating with MCP programmatically:
```javascript
// Access resource via MCP SDK
const resource = await mcpClient.readResource('zephyr://testcase/PROJ-T123');
const testCaseData = JSON.parse(resource.contents[0].text);
```

### Method 4: File-Based Resources
Access local files for templates or examples:
```
"Read the test case template from file:///Users/username/templates/api-test-template.json and create a new test case for the user profile API"
```

### Real-World Example

**Comparing Test Cases:**
```
Input: "Compare zephyr://testcase/PROJ-T123 and zephyr://testcase/ANOTHER-PROJ-T456"

Output: Detailed comparison showing:
- PROJ-T123: Simple BDD navigation test (PROJ project, Low priority)
- ANOTHER-PROJ-T456: Complex payment workflow (ANOTHER-PROJ project, High priority, 11 steps)
- Different test script types (BDD vs STEP_BY_STEP)
- Priority and complexity differences
```

**Using as Template:**
```
Input: "Create a new test case similar to zephyr://testcase/PROJ-T123 but for logout functionality"

Output: New BDD test case with Given/When/Then structure adapted for logout flow
```

## Examples

### Migration from Previous Versions
If you were using the previous `create_test_case_with_bdd` tool, simply use `create_test_case` with the `test_script.type: "BDD"` structure shown in the examples below.

### Simple Test Case (Minimal)
```json
{
  "project_key": "PROJ",
  "name": "Login Test"
}
```

### Step-by-Step Test Case (New API Structure)
```json
{
  "project_key": "PROJ",
  "name": "User Login Flow",
  "test_script": {
    "type": "STEP_BY_STEP",
    "steps": [
      {
        "description": "Navigate to login page",
        "testData": "URL: https://app.example.com/login",
        "expectedResult": "Login form is displayed"
      },
      {
        "description": "Enter valid credentials",
        "testData": "Username: testuser, Password: testpass",
        "expectedResult": "User is logged in successfully"
      }
    ]
  },
  "folder": "/ProjectName/Authentication",
  "status": "Draft",
  "priority": "High"
}
```

### Plain Text Test Case (New API Structure)
```json
{
  "project_key": "PROJ",
  "name": "Simple API Test",
  "test_script": {
    "type": "PLAIN_TEXT",
    "text": "1. Call GET /api/users endpoint\n2. Verify response returns 200 status\n3. Check that user list is not empty"
  }
}
```

### BDD Test Case (New API Structure)
```json
{
  "project_key": "PROJ",
  "name": "User Authentication",
  "test_script": {
    "type": "BDD",
    "text": "Feature: User Login\n\nScenario: Valid user login\n  Given a user with valid credentials\n  When the user attempts to log in\n  Then the user should be authenticated successfully"
  },
  "custom_fields": {
    "Type": "Functional",
    "Priority": "P2",
    "Regression": false,
    "Execution Type": "Manual - To Be Automated",
    "Risk Control": false
  }
}
```

### Using Real Test Case as Template
```json
// First, fetch an existing test case structure:
// Request: zephyr://testcase/PROJ-T123
// Then use its structure for new test cases:
{
  "project_key": "PROJ", 
  "name": "New Feature Test",
  "test_script": {
    "type": "BDD",
    "text": "Feature: New Feature\nScenario: Feature works correctly\n  Given the new feature is enabled\n  When user interacts with it\n  Then it should work as expected"
  },
  "folder": "/2025 Releases/New Features",
  "custom_fields": {
    "Type": "Functional",
    "Priority": "P2",
    "Regression": false,
    "Execution Type": "Manual - To Be Automated", 
    "Risk Control": false
  }
}
```

### Delete Test Case
```json
{
  "test_case_key": "PROJ-T123"
}
```

### Create Test Run
```json
{
  "project_key": "PROJ",
  "name": "Sprint 1 Test Run",
  "test_case_keys": ["PROJ-T123", "PROJ-T124", "PROJ-T125"],
  "environment": "Production",
  "description": "Testing core functionality for Sprint 1"
}
```

### Get Test Run
```json
{
  "test_run_key": "PROJ-R456"
}
```

### Get Test Execution
```json
{
  "execution_id": "1234567"
}
```

## Authentication

Get your API token from:
1. Atlassian account settings
2. Security → API tokens
3. Create new token for Zephyr Scale

## License

MIT
