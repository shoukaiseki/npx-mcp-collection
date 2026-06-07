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
          offset: {
            type: "number",
            description: "Number of rows to skip for pagination (default 0). Use with limit to implement pagination.",
          },
        },
        required: ["sql"],
      },
    },
    {
      name: "query_maxattributes",
      description: "Query MAXATTRIBUTE table by object name - returns Maximo attribute metadata including attribute name, type, length, domain, title, multilingual title/remarks, etc.",
      inputSchema: {
        type: "object",
        properties: {
          objectName: {
            type: "string",
            description: "Object name to filter by (e.g., WORKORDER, ASSET, LOCATIONS), required",
          },
          schema: {
            type: "string",
            description: "Schema name, defaults to configured schema",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
          langCode: {
            type: "string",
            description: "Language code for multilingual fields (default ZH)",
          },
        },
        required: ["objectName"],
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
    {
      name: "query_maxobjects",
      description: "Query MAXOBJECT table by object name - returns Maximo object metadata including class name, entity name, object name, service name, multilingual description, etc.",
      inputSchema: {
        type: "object",
        properties: {
          objectName: {
            type: "string",
            description: "Object name to filter by (e.g., ITEM, WORKORDER, ASSET), required",
          },
          schema: {
            type: "string",
            description: "Schema name, defaults to configured schema",
          },
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
        required: ["objectName"],
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
          const offset = (args?.offset as number) || 0;
          result = await dbService.queryBySql(sql, Math.min(limit, 1000), offset);
          break;
        }

        case "query_maxattributes": {
          const objectName = args?.objectName as string;
          const limit = (args?.limit as number) || DEFAULT_LIMIT;
          const langCode = process.env.LANGCODE || 'ZH';
          const sql = `SELECT ALIAS, ATTRIBUTENAME, ATTRIBUTENO, AUTOKEYNAME, CANAUTONUM, CLASSNAME, COLUMNNAME, COMPLEXEXPRESSION, DEFAULTVALUE, DOMAINID, EAUDITENABLED, ENTITYNAME, ESIGENABLED, EXTENDED, HANDLECOLUMNNAME, ISLDOWNER, ISPOSITIVE, LENGTH, LOCALIZABLE, MAXATTRIBUTEID, MAXTYPE, MLINUSE, MLSUPPORTED, MUSTBE, OBJECTNAME, PERSISTENT, PRIMARYKEYCOLSEQ, MAXATTRIBUTE.REMARKS, REQUIRED, RESTRICTED, SAMEASATTRIBUTE, SAMEASOBJECT, SCALE, SEARCHTYPE, TEXTDIRECTION, MAXATTRIBUTE.TITLE, USERDEFINED, l.TITLE LZH_TITLE, l.REMARKS LZH_REMARKS FROM MAXATTRIBUTE LEFT JOIN L_MAXATTRIBUTE as l on (MAXATTRIBUTEID=l.OWNERID and l.LANGCODE='${langCode}') WHERE OBJECTNAME='${objectName}'`;
          result = await dbService.queryBySql(sql, Math.min(limit, 1000));
          break;
        }

        case "get_database_info": {
          result = await dbService.getDatabaseInfo();
          break;
        }

        case "query_maxobjects": {
          const objectName = args?.objectName as string;
          const limit = (args?.limit as number) || DEFAULT_LIMIT;
          const langCode = process.env.LANGCODE || 'ZH';
          const sql = `SELECT CLASSNAME, MAXOBJECT.DESCRIPTION, EAUDITENABLED, EAUDITFILTER, ENTITYNAME, ESIGFILTER, EXTENDSOBJECT, HASLD, IMPORTED, INTERNAL, ISVIEW, MAXOBJECT.LANGCODE, MAINOBJECT, MAXOBJECTID, OBJECTNAME, PERSISTENT, RESOURCETYPE, SERVICENAME, SITEORGTYPE, TEXTDIRECTION, USERDEFINED, l.DESCRIPTION LZH_DESCRIPTION FROM MAXOBJECT LEFT JOIN L_MAXOBJECT as l on (MAXOBJECTID=l.OWNERID and l.LANGCODE='${langCode}') WHERE OBJECTNAME='${objectName}'`;
          result = await dbService.queryBySql(sql, Math.min(limit, 1000));
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