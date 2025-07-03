export interface TestStep {
  description: string;
  testData?: string;
  expectedResult: string;
  testCaseKey?: string;
}

export interface TestCaseArgs {
  project_key: string;
  name: string;
  test_script_type?: 'STEP_BY_STEP' | 'PLAIN_TEXT';
  steps?: TestStep[];
  plain_text?: string;
  folder?: string;
  status?: 'Draft' | 'Approved' | 'Deprecated';
  priority?: 'High' | 'Medium' | 'Low';
  precondition?: string;
  objective?: string;
  component?: string;
  owner?: string;
  estimated_time?: number;
  labels?: string[];
  issue_links?: string[];
  custom_fields?: Record<string, any>;
}

export interface BddTestCaseArgs {
  project_key: string;
  name: string;
  bdd_content: string;
  folder?: string;
  priority?: 'High' | 'Medium' | 'Low';
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
