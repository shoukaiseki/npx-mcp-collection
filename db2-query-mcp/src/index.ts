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
    {
      name: "query_active_sites",
      description: "Query active sites with siteid and orgid from SITE table where ACTIVE=1",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
      },
    },
    {
      name: "query_active_persons",
      description: "Query active person/users from PERSON table where status='ACTIVE'",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
      },
    },
    {
      name: "query_active_items",
      description: "Query active main items from ITEM table - excludes obsolete items, filters by ITEMSET and ITEM type",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
      },
    },
    {
      name: "query_inventory",
      description: "Query current inventory information from INVENTORY table",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
      },
    },
    {
      name: "query_invbalances",
      description: "Query inventory balances with itemnum, location, siteid from INVBALANCES table",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
      },
    },
    {
      name: "query_invlot",
      description: "Query inventory lots with itemnum, location, siteid from INVLOT table",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of rows to return (default 200, max 1000)",
          },
        },
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

        case "query_active_sites": {
          const sql = "select * from site where ACTIVE=1";
          result = await dbService.queryBySql(sql, Math.min((args?.limit as number) || DEFAULT_LIMIT, 1000));
          break;
        }

        case "query_active_persons": {
          const sql = "select * from person where status='ACTIVE'";
          result = await dbService.queryBySql(sql, Math.min((args?.limit as number) || DEFAULT_LIMIT, 1000));
          break;
        }

        case "query_active_items": {
          const sql = "select * from item where ((status != 'OBSOLETE' AND itemsetid = 'ITEMSET')) AND (itemtype in (select value from synonymdomain where domainid='ITEMTYPE' and maxvalue = 'ITEM'))";
          result = await dbService.queryBySql(sql, Math.min((args?.limit as number) || DEFAULT_LIMIT, 1000));
          break;
        }

        case "query_inventory": {
          const sql = "select * from INVENTORY";
          result = await dbService.queryBySql(sql, Math.min((args?.limit as number) || DEFAULT_LIMIT, 1000));
          break;
        }

        case "query_invbalances": {
          const sql = "select * from INVBALANCES";
          result = await dbService.queryBySql(sql, Math.min((args?.limit as number) || DEFAULT_LIMIT, 1000));
          break;
        }

        case "query_invlot": {
          const sql = "select * from INVLOT";
          result = await dbService.queryBySql(sql, Math.min((args?.limit as number) || DEFAULT_LIMIT, 1000));
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