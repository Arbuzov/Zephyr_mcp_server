# Zephyr Scale MCP Server

Model Context Protocol server for Zephyr Scale test management. Create, read, and manage test cases through the Atlassian REST API.

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

## Available Tools

- `get_test_case` - Get detailed information about a specific test case
- `create_test_case` - Create a new test case with STEP_BY_STEP or PLAIN_TEXT content
- `create_test_case_with_bdd` - Create a new test case with BDD content
- `update_test_case_bdd` - Update an existing test case with BDD content
- `delete_test_case` - Delete a specific test case
- `create_folder` - Create a new folder in Zephyr Scale
- `get_test_run_cases` - Get test case keys from a test run

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



## Authentication

Get your API token from:
1. Atlassian account settings
2. Security → API tokens
3. Create new token for Zephyr Scale

## License

MIT
