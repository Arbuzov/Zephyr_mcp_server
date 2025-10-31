export interface TestStep {
  description?: string;
  testData?: string;
  expectedResult?: string;
  testCaseKey?: string;
}

export interface TestScript {
  type: 'STEP_BY_STEP' | 'PLAIN_TEXT' | 'BDD';
  steps?: TestStep[];
  text?: string;
}

export interface TestParameter {
  name: string;
  type: 'FREE_TEXT' | 'DATA_SET';
  dataSet?: string;
}

export interface TestParameters {
  variables: TestParameter[];
  entries: Record<string, any>[];
}

export interface TestCaseArgs {
  project_key: string;
  name: string;
  test_script?: TestScript;
  folder?: string;
  status?: 'Draft' | 'Approved' | 'Deprecated';
  priority?: 'High' | 'Normal' | 'Low';
  precondition?: string;
  objective?: string;
  component?: string;
  owner?: string;
  estimated_time?: number;
  labels?: string[];
  issue_links?: string[];
  custom_fields?: Record<string, any>;
  parameters?: TestParameters;
}


export interface UpdateBddArgs {
  test_case_key: string;
  bdd_content: string;
}

export interface FolderArgs {
  project_key: string;
  name: string;
  parent_folder_path?: string;
  folder_type?: 'TEST_CASE' | 'TEST_PLAN' | 'TEST_RUN';
}

export interface TestRunArgs {
  project_key: string;
  name: string;
  test_case_keys?: string[];
  test_plan_key?: string;
  folder?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  description?: string;
  owner?: string;
  environment?: string;
  custom_fields?: Record<string, any>;
}

export interface SearchTestCasesArgs {
  project_key: string;
  folder_path: string;
  max_results?: number;
}

export interface AddTestCasesToRunArgs {
  test_run_key: string;
  test_case_keys: string[];
}

export interface UpdateTestExecutionStatusArgs {
  test_run_key: string;
  test_case_key: string;
  status: 'Pass' | 'Fail' | 'Blocked' | 'Not Executed' | 'In Progress';
  comment?: string;
  execution_time?: number;
  actual_end_date?: string;
  assigned_to?: string;
  environment?: string;
  custom_fields?: Record<string, any>;
}

export interface TestExecutionItem {
  id: string | number;
  testCaseKey: string;
  testResultStatus?: string;
  status?: string;
}

export interface ExecutionUpdatePayload {
  status?: string;
  testResultStatus?: string;
  comment?: string;
  executionTime?: number;
  actualEndDate?: string;
  assignedTo?: string;
  environment?: string;
  customFields?: Record<string, any>;
}

export type JiraType = 'cloud' | 'datacenter';

export interface ApiEndpoints {
  testcase: string;
  testrun: string;
  folder: string;
  search: string;
}

export interface JiraConfig {
  type: JiraType;
  baseUrl: string;
  authHeaders: Record<string, string>;
  apiEndpoints: ApiEndpoints;
}
