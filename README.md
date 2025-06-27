# Zephyr Scale MCP Server

Model Context Protocol server for Zephyr Scale test management. Create, read, and manage test cases through the Atlassian REST API.

## Quick Start

### Option 1: Install from npm
```bash
npm install -g zephyr-scale-mcp-server
```

### Option 2: Build locally
```bash
# Clone and build
git clone <repository-url>
cd zephyr-scale-mcp-server
npm install
npm run build

# Configure environment
export ZEPHYR_API_KEY="your-api-token"
export ZEPHYR_BASE_URL="https://your-company.atlassian.net"

# Test the server
node build/index.js
```

## MCP Configuration

### For npm installation:
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

### For local build:
```json
{
  "mcpServers": {
    "zephyr-server": {
      "command": "node",
      "args": ["/path/to/zephyr-scale-mcp-server/build/index.js"],
      "env": {
        "ZEPHYR_API_KEY": "your-api-token",
        "ZEPHYR_BASE_URL": "https://your-company.atlassian.net"
      }
    }
  }
}
```

## Available Tools

- `create_test_case` - Create STEP_BY_STEP or PLAIN_TEXT test cases
- `create_test_case_with_bdd` - Create BDD/Gherkin test cases
- `get_test_case` - Get test case details
- `update_test_case_bdd` - Update BDD test cases
- `delete_test_case` - Delete a specific test case
- `create_folder` - Create test case folders
- `get_test_run_cases` - Get test cases from test runs

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

## Verification

After installation, verify the package works:

```bash
# Check installation
which zephyr-scale-mcp
# Should show: /opt/homebrew/bin/zephyr-scale-mcp (or similar path)

# Test with environment variables
export ZEPHYR_API_KEY="your-api-token"
export ZEPHYR_BASE_URL="https://your-company.atlassian.net"
zephyr-scale-mcp
# Should start the MCP server (Ctrl+C to exit)
```

### MCP Integration Test

Once configured in your MCP client, test with:

```json
{
  "tool": "get_test_case",
  "arguments": {
    "test_case_key": "PROJ-T123"
  }
}
```

Expected response includes test case details, BDD scripts, and metadata.

## Authentication

Get your API token from:
1. Atlassian account settings
2. Security → API tokens
3. Create new token for Zephyr Scale

## License

MIT
