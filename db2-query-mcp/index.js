#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JAVA_DIR = resolve(__dirname, 'java');
const JAVA_JAR = resolve(JAVA_DIR, 'jcc-11.5.9.0.jar');
const JAVA_CLASS = 'Db2Query';

const DEFAULT_LIMIT = 200;

async function executeJavaCommand(mode, ...args) {
  return new Promise((resolve, reject) => {
    const javaPath = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}\\bin\\java` : 'java';
    
    const javaArgs = [
      '-cp',
      `.;${JAVA_JAR}`,
      JAVA_CLASS,
      mode,
      ...args
    ];

    const env = {
      ...process.env
    };

    let stdout = '';
    let stderr = '';

    const proc = spawn(javaPath, javaArgs, {
      cwd: JAVA_DIR,
      env
    });

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Java process exited with code ${code}: ${stderr}`));
        return;
      }

      try {
        const output = stdout.trim();
        if (!output) {
          reject(new Error('Java process returned empty output'));
          return;
        }

        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Java output: ${error}\nOutput: ${stdout}`));
      }
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

async function createMcpServer() {
  console.log("[INFO] Testing database connection...");
  try {
    await executeJavaCommand('info');
    console.log("[INFO] Database connection successful!");
  } catch (error) {
    console.error("[ERROR] Database connection failed:", error.message);
  }

  const server = new Server(
    {
      name: "db2-query-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const tools = [
    {
      name: "query_by_sql",
      description: "Execute read-only SQL query. Only SELECT statements allowed, returns JSON formatted results.",
      inputSchema: {
        type: "object",
        properties: {
          sql: {
            type: "string",
            description: "SELECT query to execute (read-only, no INSERT/UPDATE/DELETE/DROP)",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
        required: ["sql"],
      },
    },
    {
      name: "query_tables",
      description: "Query list of tables in the database. Supports table name pattern search.",
      inputSchema: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            description: "Table name pattern, supports % wildcard (e.g., %USER%, EMPLOYEE)",
          },
          schema: {
            type: "string",
            description: "Schema name, defaults to configured schema",
          },
          limit: {
            type: "number",
            description: "Maximum number of tables to return (default 200)",
          },
        },
      },
    },
    {
      name: "query_table_columns",
      description: "Query column definitions for a table. Returns column name, data type, length, nullability, etc.",
      inputSchema: {
        type: "object",
        properties: {
          tableName: {
            type: "string",
            description: "Table name",
          },
          schema: {
            type: "string",
            description: "Schema name, defaults to configured schema",
          },
        },
        required: ["tableName"],
      },
    },
    {
      name: "get_database_info",
      description: "Get database basic information including database name, current schema, etc.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case "query_by_sql": {
          const sql = args?.sql;
          const limit = (args?.limit || DEFAULT_LIMIT);
          result = await executeJavaCommand('query', sql, Math.min(limit, 1000).toString());
          break;
        }

        case "query_tables": {
          const tableName = (args?.tableName || "%");
          const schema = args?.schema || process.env.DB2_SCHEMA || "%";
          const limit = (args?.limit || DEFAULT_LIMIT);
          result = await executeJavaCommand('tables', tableName, schema, limit.toString());
          break;
        }

        case "query_table_columns": {
          const tableName = args?.tableName;
          const schema = args?.schema || process.env.DB2_SCHEMA || "%";
          result = await executeJavaCommand('columns', tableName, schema);
          break;
        }

        case "get_database_info": {
          result = await executeJavaCommand('info');
          break;
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: error.message }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  return { server };
}

async function main() {
  console.log("=".repeat(60));
  console.log("DB2 Query MCP Server");
  console.log("=".repeat(60));
  console.log("Mode: stdio");
  console.log("=".repeat(60));

  const { server } = await createMcpServer();
  const transport = new StdioServerTransport();

  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nShutting down...");
    process.exit(0);
  });

  await server.connect(transport);
  console.log("MCP server running in stdio mode");
}

main().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
