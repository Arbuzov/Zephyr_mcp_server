# Zephyr Scale MCP Server

Model Context Protocol server for Zephyr Scale test management. Create, read, and manage test cases through the Atlassian REST API. Access live test case data, example payloads, and file resources through a unified resource system.

## Quick Start

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
Fetch real test case data directly from your Zephyr Scale instance:

```
zephyr://testcase/YOUR-TEST-CASE-KEY
```

**Examples:**
- `zephyr://testcase/PROJ-T123` - Get test case PROJ-T123
- `zephyr://testcase/DDCN-T3355` - Get test case DDCN-T3355

**Response format:**
```json
{
  "description": "Live test case data for PROJ-T123 retrieved from Zephyr Scale",
  "testCaseKey": "PROJ-T123", 
  "retrievedAt": "2025-07-04T12:00:00.000Z",
  "data": {
    "key": "PROJ-T123",
    "name": "User Authentication Test",
    "status": "Draft",
    "priority": "High",
    "projectKey": "PROJ",
    "folder": "/ProjectName/Authentication",
    "testScript": {
      "type": "BDD",
      "text": "Given user navigates to login page..."
    }
    // ... complete test case data
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
- `create_test_case` - Create a new test case with STEP_BY_STEP or PLAIN_TEXT content
- `create_test_case_with_bdd` - Create a new test case with BDD content
- `update_test_case_bdd` - Update an existing test case with BDD content
- `delete_test_case` - Delete a specific test case

### Test Run Management
- `create_test_run` - Create a new test run
- `get_test_run` - Get detailed information about a specific test run
- `get_test_run_cases` - Get test case keys from a test run

### Test Execution
- `get_test_execution` - Get detailed individual test execution results including step-by-step results, timestamps, comments, and attachments

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
"Please access the resource zephyr://testcase/PROJ-T3358"
"Show me the BDD content from zephyr://testcase/PROJ-T123"
"Compare zephyr://testcase/PROJ-T3358 with zephyr://testcase/PROJ-T9"
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
Input: "Compare zephyr://testcase/CNIDS-T3358 and zephyr://testcase/PROJ-T9"

Output: Detailed comparison showing:
- PROJ-T3358: Simple BDD navigation test (DDCN project, Low priority)
- PROJ-T9: Complex payment workflow (AXID project, High priority, 11 steps)
- Different test script types (BDD vs STEP_BY_STEP)
- Priority and complexity differences
```

**Using as Template:**
```
Input: "Create a new test case similar to zephyr://testcase/PROJ-T3358 but for logout functionality"

Output: New BDD test case with Given/When/Then structure adapted for logout flow
```

## Examples

### Simple Test Case
```json
{
  "project_key": "PROJ",
  "name": "Login Test"
}
```

### Step-by-Step Test Case
```json
{
  "project_key": "PROJ",
  "name": "User Login Flow",
  "test_script_type": "STEP_BY_STEP",
  "steps": [
    {
      "description": "Navigate to login page",
      "testData": "URL: https://app.example.com/login",
      "expectedResult": "Login form is displayed"
    }
  ]
}
```

### BDD Test Case
```json
{
  "project_key": "PROJ",
  "name": "User Authentication",
  "bdd_content": "**Given** a user with valid credentials\n**When** the user attempts to log in\n**Then** the user should be authenticated successfully"
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
  "execution_id": "5805255"
}
```

## Authentication

Get your API token from:
1. Atlassian account settings
2. Security → API tokens
3. Create new token for Zephyr Scale

## License

MIT
