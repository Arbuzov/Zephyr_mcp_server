#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const BASE_URL = process.env.ZEPHYR_BASE_URL;
const ACCESS_TOKEN = process.env.ZEPHYR_API_KEY;

if (!ACCESS_TOKEN) {
  throw new Error('ZEPHYR_API_KEY environment variable is required');
}

const headers = {
  'Accept': '*/*',
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

class ZephyrServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'zephyr-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      headers,
    });

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
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
                enum: ['TEST_CASE', 'TEST_PLAN'],
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
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_test_case':
            return await this.getTestCase(request.params.arguments);
          case 'create_test_case':
            return await this.createTestCase(request.params.arguments);
          case 'create_test_case_with_bdd':
            return await this.createTestCaseWithBdd(request.params.arguments);
          case 'update_test_case_bdd':
            return await this.updateTestCaseBdd(request.params.arguments);
          case 'create_folder':
            return await this.createFolder(request.params.arguments);
          case 'get_test_run_cases':
            return await this.getTestRunCases(request.params.arguments);
          case 'delete_test_case':
            return await this.deleteTestCase(request.params.arguments);
          case 'create_test_run':
            return await this.createTestRun(request.params.arguments);
          case 'get_test_run':
            return await this.getTestRun(request.params.arguments);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        return {
          content: [{ type: 'text', text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    });
  }

  private async getTestCase(args: any) {
    const { test_case_key } = args;
    try {
      const response = await this.axiosInstance.get(`/rest/atm/1.0/testcase/${test_case_key}`);
      return {
        content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get test case: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private convertToGherkin(bddContent: string): string {
    const bddLines: string[] = [];
    const lines = bddContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('---')) continue;
      
      if (trimmedLine.startsWith('**Given**')) {
        bddLines.push(`Given ${trimmedLine.replace('**Given**', '').trim()}`);
      } else if (trimmedLine.startsWith('**When**')) {
        bddLines.push(`When ${trimmedLine.replace('**When**', '').trim()}`);
      } else if (trimmedLine.startsWith('**Then**')) {
        bddLines.push(`Then ${trimmedLine.replace('**Then**', '').trim()}`);
      } else if (trimmedLine.startsWith('**And**')) {
        bddLines.push(`And ${trimmedLine.replace('**And**', '').trim()}`);
      } else if (trimmedLine.startsWith('Given ') || trimmedLine.startsWith('When ') || 
                 trimmedLine.startsWith('Then ') || trimmedLine.startsWith('And ')) {
        bddLines.push(trimmedLine);
      }
    }
    
    return bddLines.length > 0 ? '    ' + bddLines.join('\n    ') : '';
  }

  private async createTestCase(args: any) {
    const { 
      project_key, 
      name, 
      test_script_type = 'STEP_BY_STEP', 
      steps, 
      plain_text,
      folder,
      status = 'Draft',
      priority = 'High',
      precondition,
      objective,
      component,
      owner,
      estimated_time,
      labels,
      issue_links,
      custom_fields
    } = args;
    
    // Map priority to custom priority
    const customPriorityMapping: { [key: string]: string } = {
      'High': 'P0',
      'Medium': 'P1',
      'Low': 'P2'
    };

    // Build the basic payload
    const payload: any = {
      projectKey: project_key,
      name: name,
      status: status,
      priority: priority,
      customFields: {
        'Type': 'Functional',
        'Priority': customPriorityMapping[priority] || 'P0',
        'Execution Type': 'Manual - To Be Automated'
      }
    };
    
    // Add optional fields
    if (folder) payload.folder = folder;
    if (precondition) payload.precondition = precondition;
    if (objective) payload.objective = objective;
    if (component) payload.component = component;
    if (owner) payload.owner = owner;
    if (estimated_time) payload.estimatedTime = estimated_time;
    if (labels && labels.length > 0) payload.labels = labels;
    if (issue_links && issue_links.length > 0) payload.issueLinks = issue_links;
    
    // Merge custom fields if provided
    if (custom_fields) {
      payload.customFields = { ...payload.customFields, ...custom_fields };
    }
    
    // Handle test script based on type
    if (test_script_type === 'STEP_BY_STEP' && steps && steps.length > 0) {
      payload.testScript = {
        type: 'STEP_BY_STEP',
        steps: steps.map((step: any) => {
          const stepObj: any = {};
          if (step.description) stepObj.description = step.description;
          if (step.testData) stepObj.testData = step.testData;
          if (step.expectedResult) stepObj.expectedResult = step.expectedResult;
          if (step.testCaseKey) stepObj.testCaseKey = step.testCaseKey;
          return stepObj;
        })
      };
    } else if (test_script_type === 'PLAIN_TEXT' && plain_text) {
      payload.testScript = {
        type: 'PLAIN_TEXT',
        text: plain_text
      };
    }
    
    try {
      const response = await this.axiosInstance.post('/rest/atm/1.0/testcase', payload);
      
      if (response.status === 201) {
        const testKey = response.data.key || 'Unknown';
        return {
          content: [
            {
              type: 'text',
              text: `✅ Test case created successfully: ${testKey}\n${JSON.stringify({ 
                key: testKey, 
                type: test_script_type,
                steps: test_script_type === 'STEP_BY_STEP' ? steps?.length || 0 : undefined,
                plainText: test_script_type === 'PLAIN_TEXT' ? !!plain_text : undefined
              }, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        errorMessage = `Status: ${axiosError.response?.status}, Data: ${JSON.stringify(axiosError.response?.data)}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create test case: ${errorMessage}`
      );
    }
  }

  private async createTestCaseWithBdd(args: any) {
    const { project_key, name, bdd_content, folder, priority = 'High' } = args;
    
    const priorityMapping: { [key: string]: string } = {
      'High': 'High',
      'Medium': 'High',
      'Low': 'High'
    };
    
    const customPriorityMapping: { [key: string]: string } = {
      'High': 'P0',
      'Medium': 'P1',
      'Low': 'P2'
    };
    
    const payload: any = {
      projectKey: project_key,
      name: name,
      status: 'Draft',
      priority: priorityMapping[priority] || 'High',
      customFields: {
        'Type': 'Functional',
        'Priority': customPriorityMapping[priority] || 'P0',
        'Execution Type': 'Manual - To Be Automated'
      }
    };
    
    if (folder) {
      payload.folder = folder;
    }
    
    const gherkinContent = this.convertToGherkin(bdd_content);
    if (gherkinContent) {
      payload.testScript = {
        type: 'BDD',
        text: gherkinContent
      };
    }
    
    try {
      const response = await this.axiosInstance.post('/rest/atm/1.0/testcase', payload);
      
      if (response.status === 201) {
        const testKey = response.data.key || 'Unknown';
        return {
          content: [
            {
              type: 'text',
              text: `✅ Test case with BDD created successfully: ${testKey}\n${JSON.stringify({ key: testKey }, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create test case with BDD: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async updateTestCaseBdd(args: any) {
    const { test_case_key, bdd_content } = args;
    
    try {
      // First get the current test case
      const getResponse = await this.axiosInstance.get(`/rest/atm/1.0/testcase/${test_case_key}`);
      if (getResponse.status !== 200) {
        throw new Error(`Failed to get test case ${test_case_key}`);
      }
      
      const gherkinContent = this.convertToGherkin(bdd_content);
      const payload = {
        testScript: {
          type: 'BDD',
          text: gherkinContent
        }
      };
      
      const updateResponse = await this.axiosInstance.put(`/rest/atm/1.0/testcase/${test_case_key}`, payload);
      
      if (updateResponse.status === 200) {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated ${test_case_key} with BDD content successfully`,
            },
          ],
        };
      } else {
        throw new Error(`Failed to update ${test_case_key}: ${updateResponse.status}`);
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to update test case BDD: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async createFolder(args: any) {
    const { project_key, name, parent_folder_path, folder_type = 'TEST_CASE' } = args;
    
    let folderName = name;
    if (parent_folder_path && !name.startsWith('/')) {
      const parentPath = parent_folder_path.startsWith('/') ? parent_folder_path : `/${parent_folder_path}`;
      folderName = `${parentPath}/${name}`;
    } else if (!name.startsWith('/')) {
      folderName = `/${name}`;
    }
    
    const payload = {
      projectKey: project_key,
      name: folderName,
      type: folder_type,
    };
    
    try {
      const response = await this.axiosInstance.post('/rest/atm/1.0/folder', payload);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Folder created successfully: ${response.data.name} (ID: ${response.data.id})\n${JSON.stringify(response.data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create folder: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async getTestRunCases(args: any) {
    const { test_run_key } = args;
    
    try {
      const response = await this.axiosInstance.get(`/rest/atm/1.0/testrun/${test_run_key}`);
      
      if (response.status === 200) {
        const data = response.data;
        const testCaseKeys = data.items.map((item: any) => item.testCaseKey);
        const statuses = data.items.map((item: any) => item.status);
        const runIds = data.items.map((item: any) => item.id);
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Retrieved test cases from ${test_run_key}:\nTest Case Keys: ${JSON.stringify(testCaseKeys, null, 2)}\nStatuses: ${JSON.stringify(statuses, null, 2)}\nRun IDs: ${JSON.stringify(runIds, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`Failed to retrieve data: ${response.status}`);
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get test run cases: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private async deleteTestCase(args: any) {
    const { test_case_key } = args;
    
    try {
      const response = await this.axiosInstance.delete(`/rest/atm/1.0/testcase/${test_case_key}`);
      
      if (response.status === 204) {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Test case ${test_case_key} deleted successfully`,
            },
          ],
        };
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          errorMessage = `Test case ${test_case_key} not found`;
        } else {
          errorMessage = `Status: ${axiosError.response?.status}, Data: ${JSON.stringify(axiosError.response?.data)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to delete test case: ${errorMessage}`
      );
    }
  }

  private async createTestRun(args: any) {
    const { 
      project_key, 
      name, 
      test_case_keys,
      test_plan_key,
      folder,
      planned_start_date,
      planned_end_date,
      description,
      owner,
      environment,
      custom_fields
    } = args;
    
    // Build the basic payload
    const payload: any = {
      projectKey: project_key,
      name: name,
    };
    
    // Add optional fields
    if (test_case_keys && test_case_keys.length > 0) {
      payload.items = test_case_keys.map((testCaseKey: string) => ({
        testCaseKey: testCaseKey
      }));
    }
    if (folder) payload.folder = folder;
    if (planned_start_date) payload.plannedStartDate = planned_start_date;
    if (planned_end_date) payload.plannedEndDate = planned_end_date;
    if (description) payload.description = description;
    if (owner) payload.owner = owner;
    if (environment) payload.environment = environment;
    if (custom_fields) payload.customFields = custom_fields;
    if (test_plan_key) payload.testPlanKey = test_plan_key;
    
    try {
      const response = await this.axiosInstance.post('/rest/atm/1.0/testrun', payload);
      
      if (response.status === 201) {
        const testRunKey = response.data.key || 'Unknown';
        return {
          content: [
            {
              type: 'text',
              text: `✅ Test run created successfully: ${testRunKey}\n${JSON.stringify({ 
                key: testRunKey,
                name: name,
                testCaseCount: test_case_keys?.length || 0,
                environment: environment || 'Not specified'
              }, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`Unexpected status code: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        errorMessage = `Status: ${axiosError.response?.status}, Data: ${JSON.stringify(axiosError.response?.data)}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to create test run: ${errorMessage}`
      );
    }
  }

  private async getTestRun(args: any) {
    const { test_run_key } = args;
    
    try {
      const response = await this.axiosInstance.get(`/rest/atm/1.0/testrun/${test_run_key}`);
      
      if (response.status === 200) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      } else {
        throw new Error(`Failed to retrieve test run: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          errorMessage = `Test run ${test_run_key} not found`;
        } else {
          errorMessage = `Status: ${axiosError.response?.status}, Data: ${JSON.stringify(axiosError.response?.data)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get test run: ${errorMessage}`
      );
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Zephyr MCP server running on stdio');
  }
}

const server = new ZephyrServer();
server.run().catch(console.error);
