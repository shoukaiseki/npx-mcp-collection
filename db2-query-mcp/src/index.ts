#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Db2QueryService } from "./db2-query-service.js";

const DEFAULT_LIMIT = 200;

async function createMcpServer() {
  const dbService = new Db2QueryService();

  try {
    await dbService.testConnection();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
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

  const tools: Tool[] = [
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
      let result: any;

      switch (name) {
        case "query_by_sql": {
          const sql = args?.sql as string;
          const limit = (args?.limit as number) || DEFAULT_LIMIT;
          result = await dbService.queryBySql(sql, Math.min(limit, 1000));
          break;
        }

        case "query_tables": {
          const tableName = (args?.tableName as string) || "%";
          const schema = args?.schema as string;
          const limit = (args?.limit as number) || DEFAULT_LIMIT;
          result = await dbService.queryTables(tableName, schema, limit);
          break;
        }

        case "query_table_columns": {
          const tableName = args?.tableName as string;
          const schema = args?.schema as string;
          result = await dbService.queryTableColumns(tableName, schema);
          break;
        }

        case "get_database_info": {
          result = await dbService.getDatabaseInfo();
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
    } catch (error: any) {
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
