import { AxiosInstance } from 'axios';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { 
  TestCaseArgs, 
  UpdateBddArgs, 
  FolderArgs, 
  TestRunArgs, 
  SearchTestCasesArgs, 
  AddTestCasesToRunArgs 
} from './types.js';
import { convertToGherkin, customPriorityMapping, priorityMapping } from './utils.js';

export class ZephyrToolHandlers {
  constructor(private axiosInstance: AxiosInstance) {}

  async getTestCase(args: any) {
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

  async createTestCase(args: TestCaseArgs) {
    const { 
      project_key, 
      name, 
      test_script,
      folder,
      status,
      priority,
      precondition,
      objective,
      component,
      owner,
      estimated_time,
      labels,
      issue_links,
      custom_fields,
      parameters
    } = args;
    
    // Build the basic payload
    const payload: any = {
      projectKey: project_key,
      name: name
    };
    
    // Add optional fields
    if (folder) payload.folder = folder;
    if (status) payload.status = status;
    if (priority) payload.priority = priority;
    if (precondition) payload.precondition = precondition;
    if (objective) payload.objective = objective;
    if (component) payload.component = component;
    if (owner) payload.owner = owner;
    if (estimated_time) payload.estimatedTime = estimated_time;
    if (labels && labels.length > 0) payload.labels = labels;
    if (issue_links && issue_links.length > 0) payload.issueLinks = issue_links;
    if (custom_fields) payload.customFields = custom_fields;
    if (parameters) payload.parameters = parameters;
    
    // Handle test script
    if (test_script) {
      payload.testScript = {
        type: test_script.type
      };
      
      if (test_script.type === 'STEP_BY_STEP' && test_script.steps) {
        payload.testScript.steps = test_script.steps.map((step: any) => {
          const stepObj: any = {};
          if (step.description) stepObj.description = step.description;
          if (step.testData) stepObj.testData = step.testData;
          if (step.expectedResult) stepObj.expectedResult = step.expectedResult;
          if (step.testCaseKey) stepObj.testCaseKey = step.testCaseKey;
          return stepObj;
        });
      } else if ((test_script.type === 'PLAIN_TEXT' || test_script.type === 'BDD') && test_script.text) {
        if (test_script.type === 'BDD') {
          const gherkinContent = convertToGherkin(test_script.text);
          payload.testScript.text = gherkinContent || test_script.text;
        } else {
          payload.testScript.text = test_script.text;
        }
      }
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
                type: test_script?.type || 'none',
                hasSteps: test_script?.type === 'STEP_BY_STEP' ? test_script.steps?.length || 0 : undefined,
                hasText: (test_script?.type === 'PLAIN_TEXT' || test_script?.type === 'BDD') ? !!test_script.text : undefined
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

  async updateTestCaseBdd(args: UpdateBddArgs) {
    const { test_case_key, bdd_content } = args;
    
    try {
      // First get the current test case
      const getResponse = await this.axiosInstance.get(`/rest/atm/1.0/testcase/${test_case_key}`);
      if (getResponse.status !== 200) {
        throw new Error(`Failed to get test case ${test_case_key}`);
      }
      
      const gherkinContent = convertToGherkin(bdd_content);
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

  async createFolder(args: FolderArgs) {
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

  async getTestRunCases(args: any) {
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

  async deleteTestCase(args: any) {
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

  async createTestRun(args: TestRunArgs) {
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

  async getTestRun(args: any) {
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

  async getTestExecution(args: any) {
    const { execution_id, test_run_keys } = args;
    
    // Require users to specify test runs to search - fail immediately if not provided
    if (!test_run_keys || !Array.isArray(test_run_keys) || test_run_keys.length === 0) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'test_run_keys is required. Please provide an array of test run keys to search in (e.g., ["PROJ-C152", "PROJ-C161"]). Use get_test_run_cases to find test runs if needed.'
      );
    }
    
    try {
      const testRunsToTry = test_run_keys;
      
      const searchResults: any[] = [];
      
      for (const testRunKey of testRunsToTry) {
        try {
          const response = await this.axiosInstance.get(`/rest/atm/1.0/testrun/${testRunKey}/testresults`);
          
          if (response.status === 200 && response.data) {
            // Look for the specific execution_id in the results
            const results = Array.isArray(response.data) ? response.data : [response.data];
            const matchingExecution = results.find((result: any) => 
              result.id && result.id.toString() === execution_id
            );
            
            if (matchingExecution) {
              return {
                content: [
                  {
                    type: 'text',
                    text: `✅ Test execution ${execution_id} found in ${testRunKey}:\n${JSON.stringify(matchingExecution, null, 2)}`,
                  },
                ],
              };
            }
            
            // Store search info for debugging
            searchResults.push({
              testRunKey,
              executionCount: results.length,
              executionIds: results.map((r: any) => r.id).slice(0, 5) // Show first 5 IDs
            });
          }
        } catch (runError) {
          // Store error info for debugging
          searchResults.push({
            testRunKey,
            error: runError instanceof Error ? runError.message : String(runError)
          });
          continue;
        }
      }
      
      // If not found, provide helpful debugging info
      throw new Error(`Test execution ${execution_id} not found in any of the ${testRunsToTry.length} test runs searched. Search results: ${JSON.stringify(searchResults, null, 2)}`);
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = String(error);
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get test execution: ${errorMessage}`
      );
    }
  }

  async searchTestCasesByFolder(args: SearchTestCasesArgs) {
    const { project_key, folder_path, max_results = 100 } = args;
    
    try {
      // Use the search endpoint with query parameter
      // The Zephyr Scale API requires a query parameter in JQL-like format
      const query = `projectKey = "${project_key}" AND folder = "${folder_path}"`;
      const params: any = {
        query: query,
        maxResults: max_results
      };
      
      const response = await this.axiosInstance.get('/rest/atm/1.0/testcase/search', { params });
      
      if (response.status === 200) {
        const testCases = response.data;
        const testCaseKeys = Array.isArray(testCases) 
          ? testCases.map((tc: any) => tc.key) 
          : testCases.values 
            ? testCases.values.map((tc: any) => tc.key)
            : [];
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Found ${testCaseKeys.length} test cases in folder "${folder_path}":\n${JSON.stringify({
                folder: folder_path,
                testCaseKeys: testCaseKeys,
                totalCount: testCaseKeys.length
              }, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`Failed to search test cases: ${response.status}`);
      }
    } catch (error) {
      let errorMessage = 'Unknown error';
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 404) {
          errorMessage = `Folder "${folder_path}" not found or no test cases found`;
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
        `Failed to search test cases by folder: ${errorMessage}`
      );
    }
  }

  async addTestCasesToRun(args: AddTestCasesToRunArgs) {
    const { test_run_key, test_case_keys } = args;
    
    try {
      // Get the current test run first
      const getResponse = await this.axiosInstance.get(`/rest/atm/1.0/testrun/${test_run_key}`);
      if (getResponse.status !== 200) {
        throw new Error(`Failed to get test run ${test_run_key}`);
      }
      
      const currentTestRun = getResponse.data;
      const existingItems = currentTestRun.items || [];
      
      // Create new items for the test cases to add
      const newItems = test_case_keys.map((testCaseKey: string) => ({
        testCaseKey: testCaseKey
      }));
      
      // Combine existing and new items (avoid duplicates)
      const existingKeys = existingItems.map((item: any) => item.testCaseKey);
      const uniqueNewItems = newItems.filter((item: any) => !existingKeys.includes(item.testCaseKey));
      const updatedItems = [...existingItems, ...uniqueNewItems];
      
      // Try multiple approaches to update the test run
      let response;
      let method = 'unknown';
      
      // Approach 1: Try PUT with minimal payload
      try {
        const minimalPayload = {
          name: currentTestRun.name,
          projectKey: currentTestRun.projectKey,
          items: updatedItems
        };
        
        response = await this.axiosInstance.put(`/rest/atm/1.0/testrun/${test_run_key}`, minimalPayload);
        method = 'PUT-minimal';
      } catch (putError) {
        console.error('PUT minimal approach failed, trying POST approach...');
        
        // Approach 2: Try POST to add test cases endpoint
        try {
          const postPayload = test_case_keys.map((testCaseKey: string) => ({ testCaseKey }));
          response = await this.axiosInstance.post(`/rest/atm/1.0/testrun/${test_run_key}/testcases`, postPayload);
          method = 'POST-testcases';
        } catch (postError) {
          console.error('POST testcases approach failed, trying PUT with full payload...');
          
          // Approach 3: Try PUT with full payload but clean read-only fields
          const fullPayload = { ...currentTestRun };
          fullPayload.items = updatedItems;
          
          // Remove read-only fields
          delete fullPayload.key;
          delete fullPayload.createdOn;
          delete fullPayload.createdBy;
          delete fullPayload.executionTime;
          delete fullPayload.estimatedTime;
          delete fullPayload.testCaseCount;
          delete fullPayload.issueCount;
          delete fullPayload.executionSummary;
          delete fullPayload.status;
          
          response = await this.axiosInstance.put(`/rest/atm/1.0/testrun/${test_run_key}`, fullPayload);
          method = 'PUT-full';
        }
      }
      
      if (response && (response.status === 200 || response.status === 201)) {
        return {
          content: [
            {
              type: 'text',
              text: `✅ Successfully added ${uniqueNewItems.length} test cases to ${test_run_key} using ${method}:\n${JSON.stringify({
                testRunKey: test_run_key,
                addedTestCases: test_case_keys,
                uniqueNewCases: uniqueNewItems.length,
                totalTestCases: updatedItems.length,
                method: method
              }, null, 2)}`,
            },
          ],
        };
      } else {
        throw new Error(`All update approaches failed. Last response status: ${response?.status || 'unknown'}`);
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
        `Failed to add test cases to run: ${errorMessage}`
      );
    }
  }
}
