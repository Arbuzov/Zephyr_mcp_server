export function convertToGherkin(bddContent: string): string {
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

export const customPriorityMapping: { [key: string]: string } = {
  'High': 'P0',
  'Normal': 'P1',
  'Low': 'P2'
};

export const priorityMapping: { [key: string]: string } = {
  'High': 'High',
  'Medium': 'High',
  'Low': 'High'
};

/**
 * Detects whether the Jira instance is Cloud or Data Center based on the base URL
 */
export function detectJiraType(baseUrl: string): 'cloud' | 'datacenter' {
  // Jira Cloud URLs typically end with .atlassian.net
  if (baseUrl.includes('.atlassian.net')) {
    return 'cloud';
  }

  // Check for explicit environment variable override
  const jiraType = process.env.JIRA_TYPE?.toLowerCase();
  if (jiraType === 'cloud' || jiraType === 'datacenter') {
    return jiraType;
  }

  // Default to datacenter for backward compatibility
  return 'datacenter';
}

/**
 * Creates Jira configuration based on environment variables and detected type
 */
export function createJiraConfig(): { type: 'cloud' | 'datacenter'; baseUrl: string; authHeaders: Record<string, string> } {
  const baseUrl = process.env.ZEPHYR_BASE_URL;
  const apiKey = process.env.ZEPHYR_API_KEY;
  const username = process.env.JIRA_USERNAME;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!baseUrl) {
    throw new Error('ZEPHYR_BASE_URL environment variable is required');
  }

  if (!apiKey && !(username && apiToken)) {
    const detectedType = detectJiraType(baseUrl);
    if (detectedType === 'cloud') {
      throw new Error('Jira Cloud detected. Please provide JIRA_USERNAME and JIRA_API_TOKEN environment variables');
    } else {
      throw new Error('Jira Data Center detected. Please provide ZEPHYR_API_KEY environment variable');
    }
  }

  const type = detectJiraType(baseUrl);

  let authHeaders: Record<string, string>;

  if (type === 'cloud') {
    // Jira Cloud uses Basic auth or API token
    if (username && apiToken) {
      const auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
      authHeaders = {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
    } else {
      throw new Error(`Jira Cloud authentication failed. Please ensure both JIRA_USERNAME and JIRA_API_TOKEN environment variables are set correctly for ${baseUrl}`);
    }
  } else {
    // Jira Data Center uses Bearer token
    if (apiKey) {
      authHeaders = {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
    } else {
      throw new Error(`Jira Data Center authentication failed. Please ensure ZEPHYR_API_KEY environment variable is set correctly for ${baseUrl}`);
    }
  }

  return {
    type,
    baseUrl,
    authHeaders,
  };
}
