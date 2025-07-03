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
import { toolSchemas } from './tool-schemas.js';
import { ZephyrToolHandlers } from './tool-handlers.js';

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
  private toolHandlers: ZephyrToolHandlers;

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

    this.toolHandlers = new ZephyrToolHandlers(this.axiosInstance);
    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: toolSchemas,
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const args = request.params.arguments || {};
        
        switch (request.params.name) {
          case 'get_test_case':
            return await this.toolHandlers.getTestCase(args);
          case 'create_test_case':
            return await this.toolHandlers.createTestCase(args as any);
          case 'create_test_case_with_bdd':
            return await this.toolHandlers.createTestCaseWithBdd(args as any);
          case 'update_test_case_bdd':
            return await this.toolHandlers.updateTestCaseBdd(args as any);
          case 'create_folder':
            return await this.toolHandlers.createFolder(args as any);
          case 'get_test_run_cases':
            return await this.toolHandlers.getTestRunCases(args);
          case 'delete_test_case':
            return await this.toolHandlers.deleteTestCase(args);
          case 'create_test_run':
            return await this.toolHandlers.createTestRun(args as any);
          case 'get_test_run':
            return await this.toolHandlers.getTestRun(args);
          case 'get_test_execution':
            return await this.toolHandlers.getTestExecution(args);
          case 'search_test_cases_by_folder':
            return await this.toolHandlers.searchTestCasesByFolder(args as any);
          case 'add_test_cases_to_run':
            return await this.toolHandlers.addTestCasesToRun(args as any);
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

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Zephyr MCP server running on stdio');
  }
}

const server = new ZephyrServer();
server.run().catch(console.error);
