export const toolSchemas = [
  {
    name: 'get_test_case',
    description: 'Get detailed information about a specific test case',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_key: {
          type: 'string',
          description: 'Test case key (e.g., PROJ-T123)',
        },
      },
      required: ['test_case_key'],
    },
  },
  {
    name: 'create_test_case',
    description: 'Create a new test case with STEP_BY_STEP or PLAIN_TEXT content',
    inputSchema: {
      type: 'object',
      properties: {
        project_key: {
          type: 'string',
          description: 'Project key (required)',
        },
        name: {
          type: 'string',
          description: 'Test case name (required)',
        },
        test_script_type: {
          type: 'string',
          description: 'Type of test script',
          enum: ['STEP_BY_STEP', 'PLAIN_TEXT'],
          default: 'STEP_BY_STEP',
        },
        steps: {
          type: 'array',
          description: 'Test steps for STEP_BY_STEP (array of objects with description, testData, expectedResult)',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              testData: { type: 'string' },
              expectedResult: { type: 'string' },
              testCaseKey: { type: 'string' }
            }
          }
        },
        plain_text: {
          type: 'string',
          description: 'Plain text content for PLAIN_TEXT type',
        },
        folder: {
          type: 'string',
          description: 'Folder path (optional)',
        },
        status: {
          type: 'string',
          description: 'Test case status (optional)',
          enum: ['Draft', 'Approved', 'Deprecated'],
          default: 'Draft',
        },
        priority: {
          type: 'string',
          description: 'Test case priority (optional)',
          enum: ['High', 'Medium', 'Low'],
          default: 'High',
        },
        precondition: {
          type: 'string',
          description: 'Test precondition (optional)',
        },
        objective: {
          type: 'string',
          description: 'Test objective (optional)',
        },
        component: {
          type: 'string',
          description: 'Component name (optional)',
        },
        owner: {
          type: 'string',
          description: 'Test case owner (optional)',
        },
        estimated_time: {
          type: 'number',
          description: 'Estimated time in milliseconds (optional)',
        },
        labels: {
          type: 'array',
          description: 'Array of labels (optional)',
          items: { type: 'string' }
        },
        issue_links: {
          type: 'array',
          description: 'Array of issue links (optional)',
          items: { type: 'string' }
        },
        custom_fields: {
          type: 'object',
          description: 'Custom fields object (optional)',
        },
      },
      required: ['project_key', 'name'],
    },
  },
  {
    name: 'create_test_case_with_bdd',
    description: 'Create a new test case with BDD content',
    inputSchema: {
      type: 'object',
      properties: {
        project_key: {
          type: 'string',
          description: 'Project key (required)',
        },
        name: {
          type: 'string',
          description: 'Test case name (required)',
        },
        bdd_content: {
          type: 'string',
          description: 'BDD content in markdown format',
        },
        folder: {
          type: 'string',
          description: 'Folder name (optional)',
        },
        priority: {
          type: 'string',
          description: 'Test case priority (High, Medium, Low)',
          enum: ['High', 'Medium', 'Low'],
        },
      },
      required: ['project_key', 'name', 'bdd_content'],
    },
  },
  {
    name: 'update_test_case_bdd',
    description: 'Update an existing test case with BDD content',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_key: {
          type: 'string',
          description: 'Test case key to update',
        },
        bdd_content: {
          type: 'string',
          description: 'BDD content in markdown format',
        },
      },
      required: ['test_case_key', 'bdd_content'],
    },
  },
  {
    name: 'create_folder',
    description: 'Create a new folder in Zephyr Scale',
    inputSchema: {
      type: 'object',
      properties: {
        project_key: {
          type: 'string',
          description: 'Project key (required)',
        },
        name: {
          type: 'string',
          description: 'Folder name (required)',
        },
        parent_folder_path: {
          type: 'string',
          description: 'Parent folder path (optional)',
        },
        folder_type: {
          type: 'string',
          description: 'Type of folder',
          enum: ['TEST_CASE', 'TEST_PLAN', 'TEST_RUN'],
          default: 'TEST_CASE',
        },
      },
      required: ['project_key', 'name'],
    },
  },
  {
    name: 'get_test_run_cases',
    description: 'Get test case keys from a test run',
    inputSchema: {
      type: 'object',
      properties: {
        test_run_key: {
          type: 'string',
          description: 'Test run key (e.g., PROJ-C123)',
        },
      },
      required: ['test_run_key'],
    },
  },
  {
    name: 'delete_test_case',
    description: 'Delete a specific test case',
    inputSchema: {
      type: 'object',
      properties: {
        test_case_key: {
          type: 'string',
          description: 'Test case key to delete (e.g., PROJ-T123)',
        },
      },
      required: ['test_case_key'],
    },
  },
  {
    name: 'create_test_run',
    description: 'Create a new test run',
    inputSchema: {
      type: 'object',
      properties: {
        project_key: {
          type: 'string',
          description: 'Project key (required)',
        },
        name: {
          type: 'string',
          description: 'Test run name (required)',
        },
        test_case_keys: {
          type: 'array',
          description: 'Array of test case keys to include in the test run',
          items: { type: 'string' }
        },
        test_plan_key: {
          type: 'string',
          description: 'Test plan key to link this test run to (optional)',
        },
        folder: {
          type: 'string',
          description: 'Folder path (optional)',
        },
        planned_start_date: {
          type: 'string',
          description: 'Planned start date in ISO format (optional)',
        },
        planned_end_date: {
          type: 'string',
          description: 'Planned end date in ISO format (optional)',
        },
        description: {
          type: 'string',
          description: 'Test run description (optional)',
        },
        owner: {
          type: 'string',
          description: 'Test run owner (optional)',
        },
        environment: {
          type: 'string',
          description: 'Test environment (optional)',
        },
        custom_fields: {
          type: 'object',
          description: 'Custom fields object (optional)',
        },
      },
      required: ['project_key', 'name'],
    },
  },
  {
    name: 'get_test_run',
    description: 'Get detailed information about a specific test run',
    inputSchema: {
      type: 'object',
      properties: {
        test_run_key: {
          type: 'string',
          description: 'Test run key (e.g., PROJ-R123)',
        },
      },
      required: ['test_run_key'],
    },
  },
  {
    name: 'get_test_execution',
    description: 'Get detailed information about a specific test execution by run ID',
    inputSchema: {
      type: 'object',
      properties: {
        execution_id: {
          type: 'string',
          description: 'Test execution ID (e.g., 5805255)',
        },
      },
      required: ['execution_id'],
    },
  },
  {
    name: 'search_test_cases_by_folder',
    description: 'Search for test cases in a specific folder',
    inputSchema: {
      type: 'object',
      properties: {
        project_key: {
          type: 'string',
          description: 'Project key (e.g., DDCN)',
        },
        folder_path: {
          type: 'string',
          description: 'Folder path to search in (e.g., /2025 Releases/CRM on Wechat)',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return (optional, default 100)',
          default: 100,
        },
      },
      required: ['project_key', 'folder_path'],
    },
  },
  {
    name: 'add_test_cases_to_run',
    description: 'Add test cases to an existing test run',
    inputSchema: {
      type: 'object',
      properties: {
        test_run_key: {
          type: 'string',
          description: 'Test run key (e.g., DDCN-C161)',
        },
        test_case_keys: {
          type: 'array',
          description: 'Array of test case keys to add to the test run',
          items: { type: 'string' }
        },
      },
      required: ['test_run_key', 'test_case_keys'],
    },
  },
];
