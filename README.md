# Zephyr Scale MCP Server

Model Context Protocol server for Zephyr Scale test management, supporting both **Jira Cloud and Data Center**. Create, read, and manage test cases through the Atlassian REST API with **official API-compliant schemas**. Access live test case data, example payloads, and file resources through a unified resource system.

## Features

- ✅ **Jira Cloud & Data Center Support**: Seamlessly connects to both Jira Cloud (using API v2) and self-hosted Data Center instances (using API v1) with automatic configuration detection.
- ✅ **Official API-Compliant Schemas**: Tools and data structures match the official Zephyr Scale REST API, ensuring compatibility and reliability.
- ✅ **Unified Test Case Creation**: A single `create_test_case` tool handles all script types (BDD, Step-by-Step, Plain Text) for a simplified workflow.
- ✅ **Full Test Lifecycle Management**: Comprehensive tools to create, read, delete test cases, and manage test runs, executions, and folders.
- ✅ **Live Templating System**: Use real test cases from your Zephyr instance as templates (`zephyr://testcase/KEY`) to ensure consistency and correct project-specific fields.
- ✅ **Unified Resource System**: Access live Zephyr data, local files (`file://`), and built-in examples through a consistent URI-based system.

## Installation and Configuration

You can run the server using `npx` without installation, or install it globally from `npm`.

### Using npx (Recommended)
Configure your MCP client with the following structure.

**Jira Cloud:**
```json
{
  "mcpServers": {
    "zephyr-server": {
      "command": "npx",
      "args": ["zephyr-scale-mcp-server@latest"],
      "env": {
        "ZEPHYR_BASE_URL": "https://your-company.atlassian.net",
        "JIRA_USERNAME": "your-email@example.com",
        "JIRA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Jira Data Center:**
```json
{
  "mcpServers": {
    "zephyr-server": {
      "command": "npx",
      "args": ["zephyr-scale-mcp-server@latest"],
      "env": {
        "ZEPHYR_BASE_URL": "https://your-jira-server.com",
        "ZEPHYR_API_KEY": "your-api-token"
      }
    }
  }
}
```

### Using global npm installation
First install the package globally:
```bash
npm install -g zephyr-scale-mcp-server
```
Then, update the `command` in your MCP configuration to `"command": "zephyr-scale-mcp"`.

## Core Concepts

### Unified API
The latest version features a **unified `create_test_case` tool** that supports all test script types (STEP_BY_STEP, PLAIN_TEXT, and BDD) through a single, consistent interface. This matches the official Zephyr Scale REST API v1 structure exactly, simplifying the test creation process.

### Jira Cloud vs. Data Center
The server automatically detects your Jira environment and uses the appropriate API version:
- **Jira Cloud**: Uses Zephyr Scale API v2.
- **Jira Data Center**: Uses Zephyr Scale API v1.

This may result in slightly different behavior for some tools, such as `add_test_cases_to_run`.

### Resource System
The server provides access to various resources through URI schemes:
- `zephyr://testcase/YOUR-TEST-CASE-KEY`: Fetch real test case data from your Zephyr instance to use as templates.
- `file:///absolute/path/to/your/file.json`: Read user-provided files.
- `zephyr://examples/...`: Access built-in example payloads.

## Tools Reference

### Test Case Management
- `get_test_case`: Get detailed information about a specific test case.
- `create_test_case`: Create test cases with STEP_BY_STEP, PLAIN_TEXT, or BDD content.
- `delete_test_case`: Delete a specific test case.
- `update_test_case_bdd`: Update an existing test case with BDD content.

### Test Run Management
- `create_test_run`: Create a new test run.
- `get_test_run`: Get detailed information about a specific test run.
- `get_test_run_cases`: Get test case keys from a test run.
- `add_test_cases_to_run`: Add test cases to an existing test run.

### Test Execution & Search
- `get_test_execution`: Get detailed individual test execution results.
- `update_test_execution_status`: Update the execution status of a test case within a test run (Pass, Fail, Blocked, etc.).
- `search_test_cases_by_folder`: Search for test cases in a specific folder.

### Organization
- `create_folder`: Create a new folder in Zephyr Scale.

## Usage Examples

### Create a BDD Test Case
```json
{
  "project_key": "PROJ",
  "name": "User Authentication",
  "test_script": {
    "type": "BDD",
    "text": "Feature: User Login\n\nScenario: Valid user login\n  Given a user with valid credentials\n  When the user attempts to log in\n  Then the user should be authenticated successfully"
  }
}
```
**Note**: The server will automatically convert markdown-style BDD to proper Gherkin format.

### Use a Live Test Case as a Template
1. Fetch an existing test case: `zephyr://testcase/PROJ-T123`
2. Copy its structure (especially `customFields` and `folder`).
3. Create a new test case using the same project-specific configuration.

### Create a Test Run
```json
{
  "project_key": "PROJ",
  "name": "Sprint 1 Test Run",
  "test_case_keys": ["PROJ-T123", "PROJ-T124", "PROJ-T125"]
}
```

### Update Test Execution Status
```json
{
  "test_run_key": "PROJ-R123",
  "test_case_key": "PROJ-T123",
  "status": "Pass",
  "comment": "All test steps passed successfully",
  "execution_time": 120000,
  "environment": "Production"
}
```
**Note**: This tool allows you to directly update the status of test executions within a test run. Supported statuses are: Pass, Fail, Blocked, Not Executed, and In Progress.

### Update Test Execution with Step Results
For STEP_BY_STEP test cases, you can set individual step statuses:
```json
{
  "test_run_key": "PROJ-R123",
  "test_case_key": "PROJ-T123",
  "status": "Fail",
  "comment": "Step 2 failed - login button not found",
  "execution_time": 120000,
  "step_results": [
    {
      "index": 0,
      "status": "Pass",
      "comment": "Successfully navigated to login page"
    },
    {
      "index": 1,
      "status": "Pass",
      "comment": "Credentials entered successfully"
    },
    {
      "index": 2,
      "status": "Fail",
      "comment": "Login button not found on the page"
    }
  ]
}
```
**Note**: Step indices are zero-based (0 for first step, 1 for second step, etc.). Each step can have its own status and optional comment.

## Authentication

The MCP server supports both Jira Cloud and Jira Data Center instances.

### Jira Cloud Configuration
- `ZEPHYR_BASE_URL`: `https://your-company.atlassian.net`
- `JIRA_USERNAME`: `your-email@example.com`
- `JIRA_API_TOKEN`: Your API token from Atlassian account settings.

### Jira Data Center Configuration
- `ZEPHYR_BASE_URL`: `https://your-jira-server.com`
- `ZEPHYR_API_KEY`: Your API token from your Jira profile settings.

### Automatic Detection
The server automatically detects your Jira type based on the `ZEPHYR_BASE_URL`. You can also explicitly set it with `JIRA_TYPE="cloud"` or `"datacenter"`.

## License

MIT
